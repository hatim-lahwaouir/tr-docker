import { createContext, useContext, ReactNode, useState, Dispatch, SetStateAction, useEffect, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { axiosAuth } from '../api/axiosAuth';
import { port, theHost, wsHost } from '../config';

interface Message {
  id: string;
  content: string;
  sender: string;
  receiver: string;
  date_of_message: string;
  seen: boolean;
}

interface Friend {
  id: number;
  full_name: string;
  username: string;
  profile_img: string;
  level: number;
  status: string;
}

interface Conversation {
  id: number;
  content: string;
  date_of_message: string;
  receiver: Friend;
  sender: Friend;
  seen: boolean;
}

interface ChatContextType {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  sendMessage: (message: string) => void;
  lastMessage: WebSocketEventMap['message'] | null;
  readyState: ReadyState;
  connectionStatus: string;
  fetchForMessages: boolean;
  setFetchForMessages: Dispatch<SetStateAction<boolean>>;
  isEndOfConv: boolean;
  setIsEndOfConv: Dispatch<SetStateAction<boolean>>;
  updateConvsList: boolean;
  setUpdateConvsList: Dispatch<SetStateAction<boolean>>;
  isConvSelected: boolean;
  setIsConvSelected: Dispatch<SetStateAction<boolean>>;
  isConvOn: boolean;
  setIsConvOn: Dispatch<SetStateAction<boolean>>;
  selectedConversationId: string | null;
  setSelectedConversationId: Dispatch<SetStateAction<string | null>>;
  selectedUserChat: Friend | null;
  setSelectedUserChat: Dispatch<SetStateAction<Friend | null>>;
  scrollFast: boolean;
  setScrollFast: Dispatch<SetStateAction<boolean>>;
  allSeen: boolean;
  setAllSeen: Dispatch<SetStateAction<boolean>>;
  conversations: Conversation[];
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  isInitialLoadComplete: boolean;
  setIsInitialLoadComplete: Dispatch<SetStateAction<boolean>>;

  hasMore: boolean;
  setHasMore: Dispatch<SetStateAction<boolean>>;
  offset: number;
  setOffset: Dispatch<SetStateAction<number>>;
}

interface WebSocketMessageData {
  type: string;
  all_seen?: boolean;
  message?: string;
  sender?: number;
  receiver?: number;
  receiver_info?: {
    id: number;
    full_name: string;
    username: string;
    profile_img: string;
  };
  sender_info?: {
    id: number;
    full_name: string;
    username: string;
    profile_img: string;
  };
  new?: boolean;
  isInTournament?: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const userToken = localStorage.getItem('access');
  const [fetchForMessages, setFetchForMessages] = useState(false);
  const [isEndOfConv, setIsEndOfConv] = useState(false);
  const [updateConvsList, setUpdateConvsList] = useState(false);
  const [isConvSelected, setIsConvSelected] = useState(false);
  const [isConvOn, setIsConvOn] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUserChat, setSelectedUserChat] = useState<Friend | null>(null);
  const [scrollFast, setScrollFast] = useState(false);
  const [allSeen, setAllSeen] = useState(true);
  const [cookies] = useCookies(['userData']);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const navigate = useNavigate();
  const [offset, setOffset] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  function truncateString(str: string, num: number) {
    if (str.length > num) {
      return str.slice(0, num) + "...";
    }
    return str;
  }

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axiosAuth.get(`/user/conversations`);
      const result = response.data;
      
      setConversations(result.conversations);
    } catch (error) {
      // console.error('Error fetching conversations:', error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const addNewConversation = useCallback((messageData: WebSocketMessageData, currentPath: string) => {
    
    if (messageData.message && messageData.sender_info && messageData.receiver_info && messageData.receiver) {
      const newConversation: Conversation = {
        id: Date.now(),
        content: messageData.message,
        date_of_message: new Date().toISOString(),
        receiver: {
          id: messageData.receiver_info.id,
          full_name: messageData.receiver_info.full_name,
          username: messageData.receiver_info.username,
          profile_img: messageData.receiver_info.profile_img,
          level: 0,
          status: '',
        },
        sender: {
          id: messageData.sender_info.id,
          full_name: messageData.sender_info.full_name,
          username: messageData.sender_info.username,
          profile_img: messageData.sender_info.profile_img,
          level: 0,
          status: '',
        },
        seen: currentPath === `/chat/${messageData.sender_info.id}` || currentPath === `/chat/${messageData.receiver}`,
      };

      setConversations(prevConversations => [newConversation, ...prevConversations]);
    }
  }, []);


  const updateConversation = useCallback((messageData: WebSocketMessageData, currentPath: string) => {
    if (
      typeof messageData.message === 'string' &&
      typeof messageData.sender === 'number' &&
      typeof messageData.receiver === 'number'
    ) {
      setConversations((prevConversations): Conversation[] => {
        const updatedConversations = prevConversations.map(conversation => {
          if (
            (conversation.sender.id === messageData.sender &&
              conversation.receiver.id === messageData.receiver) ||
            (conversation.sender.id === messageData.receiver &&
              conversation.receiver.id === messageData.sender)
          ) {
            return {
              ...conversation,
              content: messageData.message,
              date_of_message: new Date().toISOString(),
              seen: currentPath === `/chat/${messageData.sender}` || currentPath === `/chat/${messageData.receiver}`,
            };
          }
          return conversation;
        });
  
        const updatedConversationIndex = updatedConversations.findIndex(
          conversation =>
            (conversation.sender.id === messageData.sender &&
              conversation.receiver.id === messageData.receiver) ||
            (conversation.sender.id === messageData.receiver &&
              conversation.receiver.id === messageData.sender)
        );
  
        if (updatedConversationIndex > 0) {
          const [updatedConversation] = updatedConversations.splice(updatedConversationIndex, 1);
          updatedConversations.unshift(updatedConversation);
        }
  
        return updatedConversations as Conversation[];
      });
    }
  }, []);

  const handleMessageClick = (friend: Friend) => {
    if (friend.id !== cookies.userData.id) {
      navigate(`/chat/${friend.id}`);
    }
  };

  const { sendMessage, lastMessage, readyState } = useWebSocket(`ws://${wsHost}:${port}/ws/chat/?token=${userToken}`, {
    onMessage: (event) => {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (data.type === 'seen.messages') {
          if (data.all_seen) {
            setAllSeen(data.all_seen);
          }
        }
        else if (data.type === 'chat.message' ) {

          //! Create a new message object
          if (data.message && data.sender && data.receiver) {
            
          const newMessage: Message = {
            id: Date.now().toString(),
            content: data.message,
            sender: data.sender,
            receiver: data.receiver,
            date_of_message: new Date().toISOString(),
            seen: false
          };
          //? Update the messages state
          if ((data.receiver == selectedUserChat?.id && data.sender == cookies.userData.id) || (data.sender == selectedUserChat?.id && data.receiver == cookies.userData.id)) {
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages, newMessage];
              if (updatedMessages.length > 20) {
                setOffset(2);
                setHasMore(true);
                return updatedMessages.slice(-20);
              }
              return updatedMessages;
          });
			}
          
          if (data.new) {
            addNewConversation(data, location.pathname);
          }
          else {
            updateConversation(data, location.pathname);
          }
          if (!window.location.pathname.startsWith('/chat') && data.receiver === cookies.userData.id) {
            setAllSeen(false);
          toast(
            () => (
              <div 
                className="flex gap-2 cursor-pointer" 
                onClick={() => handleMessageClick(data.sender_info)}
              >
                <img 
                  src={`${theHost}:${port}${data.sender_info.profile_img}`} 
                  alt={data.sender_info.full_name} 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold truncate">
                    {data.sender_info.full_name}
                  </p>
                  <p className="text-xs dark:text-[#848484]">
                    {truncateString(data.message, 70)}
                  </p>
                </div>
              </div>
            ),
            {
              position: "bottom-right",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
              draggable: true,
              className: "flex bg-white dark:bg-[#191919] text-[#191919] dark:text-white shadow-lg rounded-lg",
            }
          );
        }
        
        setFetchForMessages(true);
        setUpdateConvsList(true);
        setScrollFast(true);
      }

      }
      else if (data.type === 'no.talk') {
        toast.error("You can't send messages to this user.", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
      }
      }
    },
    onClose: () => {
    }
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <ChatContext.Provider value={{
      sendMessage,
      lastMessage,
      readyState,
      messages,
      connectionStatus,
      setMessages,
      fetchForMessages,
      setFetchForMessages,
      isEndOfConv,
      setIsEndOfConv,
      updateConvsList,
      setUpdateConvsList,
      selectedConversationId,
      setSelectedConversationId,
      isConvSelected,
      setIsConvSelected,
      isConvOn,
      setIsConvOn,
      selectedUserChat,
      setSelectedUserChat,
      scrollFast,
      setScrollFast,
      allSeen,
      setAllSeen,
      conversations,
      setConversations,
      isInitialLoadComplete,
      setIsInitialLoadComplete,
      offset,
      setOffset,
      hasMore,
      setHasMore,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;