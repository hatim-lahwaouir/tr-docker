import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { axiosAuth }  from '../api/axiosAuth';
import { port, wsHost } from '../config';
import { toast } from 'react-toastify';

interface Friend {
  id: number;
  username: string;
  full_name: string;
  email: string;
  profile_img: string;
  status: string;
  level: number;
}

interface Notification {
  id: number;
  type: string;
  sender: string;
  username: string;
  profile_img: string;
  message?: string;
}

interface WebSocketContextType {
  sendMessage: (message: string) => void;
  addFriend: (id: string) => void;
  cancelFriendRequest: (id: string) => void;
  acceptFriend: (id: string) => void;
  declineFriend: (id: string) => void;
  unfriend: (id: string) => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  lastMessage: MessageEvent<string> | null;
  readyState: ReadyState;
  notifications: Notification[];
  gameID: string | null;
  setGameID: React.Dispatch<React.SetStateAction<string | null>>;
  addEventListener: (type: string, listener: (event: MessageEvent<string>) => void) => void;
  removeEventListener: (type: string, listener: (event: MessageEvent<string>) => void) => void;
  onlineFriends: Friend[];
  setUpdateFriendList: React.Dispatch<React.SetStateAction<boolean>>;
  updateFriendList: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userToken = localStorage.getItem('access');
  const [gameID, setGameID] = useState<string | null>(null);
  const [eventListeners, setEventListeners] = useState<{[key: string]: ((event: MessageEvent<string>) => void)[]}>({});
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [updateFriendList, setUpdateFriendList] = useState<boolean>(false);

  const { sendMessage, lastMessage, readyState } = useWebSocket(`wss://${wsHost}:${port}/ws/user/?token=${userToken}`);


  const addEventListener = useCallback((status: string, listener: (event: MessageEvent) => void) => {
    setEventListeners(prevListeners => ({
      ...prevListeners,
      [status]: [...(prevListeners[status] || []), listener]
    }));
  }, []);

  const removeEventListener = useCallback((status: string, listener: (event: MessageEvent) => void) => {
    setEventListeners(prevListeners => ({
      ...prevListeners,
      [status]: (prevListeners[status] || []).filter(l => l !== listener)
    }));
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      // console.log('-------------------- Received data Global socket:', data);
      setUpdateFriendList(true);

      if (data.type === 'user.online') {
        setOnlineFriends(prev => {
          // Check if the user is already in the list
          if (!prev.some(friend => friend.id === data.user.id)) {
            const updatedList = [...prev, data.user];
            return updatedList;
          }
          return prev;
        });
      } else if (data.type === 'user.offline') {
        setOnlineFriends(prev => {
          const updatedList = prev.filter(user => user.id !== data.user.id);
          return updatedList;
        });
      }
      else if (data.type === 'no.action') {
        toast.error("You can't do this action.", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      // Call all registered event listeners for this message type
      if (eventListeners[data.status]) {
        eventListeners[data.status].forEach(listener => listener(lastMessage));
      }
    }
  }, [lastMessage, eventListeners]);

  const addFriend = (id: string) => {
    sendMessage(JSON.stringify({
      type: 'add',
      receiver: id,
    }));
  };

  const cancelFriendRequest = (id: string) => {
    sendMessage(JSON.stringify({
      type: 'cancel',
      receiver: id,
    }));
  };

  const acceptFriend = (id: string) => {
    sendMessage(JSON.stringify({
      type: 'accept',
      receiver: id,
    }));
  };

  const declineFriend = (id: string) => {
    sendMessage(JSON.stringify({
      type: 'decline',
      receiver: id,
    }));
  };

  const unfriend  = (id: string) => {
    sendMessage(JSON.stringify({
      type: 'unfriend',
      receiver: id,
    }));
  };

  const blockUser  = (id: string) => {
    sendMessage(JSON.stringify({
      type: 'block',
      receiver: id,
    }));
  };

  const unblockUser  = (id: string) => {
    sendMessage(JSON.stringify({
      type: 'unblock',
      receiver: id,
    }));
  };

const fetchOnlineFriends = async () => {
  try {
    const response = await axiosAuth.get(`/user/get-online-friends/`);
    setOnlineFriends(response.data.online_friends);
  } catch (error) {
    //error
  }
};

const notificationsFetch = async () => {
	try {
    const response = await axiosAuth.get(`/user/invite-queue/`);
  
    const fetchedNotifications = response.data.invite_queue.map((notification: any) => ({
		...notification,
		type: 'add_friend',
		username: notification.username,
		profile_img: notification.profile_img,
    }));
    setNotifications(fetchedNotifications);
	} catch (error) {
    //error
	}
  };

  useEffect(() => {
    notificationsFetch();
  }, [lastMessage]);

  useEffect(() => {
    fetchOnlineFriends();
  }, []);

  return (
    <WebSocketContext.Provider value={{
      sendMessage,
      addFriend,
      cancelFriendRequest,
      acceptFriend,
      declineFriend,
      unfriend,
      blockUser,
      unblockUser,
      setNotifications,
      lastMessage,
      readyState,
      notifications,
      gameID,
      setGameID,
      addEventListener,
      removeEventListener,
      onlineFriends,
      updateFriendList,
      setUpdateFriendList
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;