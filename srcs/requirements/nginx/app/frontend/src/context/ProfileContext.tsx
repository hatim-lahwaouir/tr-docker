import { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocketContext } from './WebSocketContext';
import { axiosAuth } from '../api/axiosAuth';
import { port, theHost } from '../config';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useCookies } from 'react-cookie';

interface ProfileContextType {
  username: string;
  fullName: string;
  profileImg: string;
  friendState: 'me' | 'friends' | 'pending' | 'notFriends' | 'blocked';
  theId: string;
  theUser: Friend | null;
  byMe: boolean;
  loading: boolean;
  setByMe: React.Dispatch<React.SetStateAction<boolean>>;
  setFriendState: React.Dispatch<React.SetStateAction<'me' | 'friends' | 'pending' | 'notFriends' | 'blocked'>>;
  setTheId: React.Dispatch<React.SetStateAction<string>>;
  dataHistory: HistoryGame[];
  setDataHistory:React.Dispatch<React.SetStateAction<HistoryGame[]>>;
  setDataGame:React.Dispatch<React.SetStateAction<DataGame>>;
  dataGame:DataGame;
}

interface Friend {
  id: number;
  full_name: string;
  username: string;
  profile_img: string;
  level: number;
  status: string;
}

interface HistoryGame {
  date: string;
  opponentName: string;
  opponentId:number;
  opponentPicture: string;
  score: string;
  state: "WIN" | "LOSE" | "DRAW";
  time: string;
  type: 'ping_pong' | 'RPS'
}

interface DataGame {
  game: number;
  win: number;
  lose: number;
  }


const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};

const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const globalContext = useWebSocketContext();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [profileImg, setProfileImg] = useState('');
  const [friendState, setFriendState] = useState<'me' | 'friends' | 'pending' | 'notFriends' | 'blocked'>('notFriends');
  const [theId, setTheId] = useState<string>('');
  const [theUser, setTheUser] = useState<Friend | null>(null);
  const [byMe, setByMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
	const [dataHistory, setDataHistory] = useState<HistoryGame[]>([]);
	const [dataGame, setDataGame] = useState<DataGame>({game:0, win:0, lose:0});
  const navigate = useNavigate();
  const [cookies] = useCookies(['userData']);


  const pingPongFetchHistory = async (): Promise<HistoryGame[]> => {
    
		try {
		  const response = await axiosAuth.get(`/game/history/${theId}`);
		  const result: Omit<HistoryGame, 'type'>[] = response.data;
		  return result.map(game => ({ ...game, type: 'ping_pong' }));
		} catch (error) {
		  // console.error('Error fetching ping pong history:', error instanceof Error ? error.message : 'Unknown error');
		  return [];
		}
	  };
	
	  const rpsFetchHistory = async (): Promise<HistoryGame[]> => {
		try {
		  const response = await axiosAuth.get(`/sgame/history/${theId}`);
      setDataGame(response.data.game_info);
      
		  const result: Omit<HistoryGame, 'type'>[] = response.data.infos;
		  return result.map(game => ({ ...game, type: 'RPS' }));
		} catch (error) {
		  // console.error('Error fetching RPS history:', error instanceof Error ? error.message : 'Unknown error');
		  return [];
		}
	  };
	
	  const fetchAllHistory = async () => {
      if (!theId) return;
      try {
		  const [pingPongHistory, rpsHistory] = await Promise.all([
			pingPongFetchHistory(),
			rpsFetchHistory()
		  ]);
	    setDataHistory([]);
		  setDataHistory(prevData => {
			const combinedData = [...prevData, ...pingPongHistory, ...rpsHistory];
			return combinedData.sort((a, b) => {
			  const dateTimeA = new Date(`${a.date} ${a.time}`);
			  const dateTimeB = new Date(`${b.date} ${b.time}`);
			  return dateTimeB.getTime() - dateTimeA.getTime(); // Sort in descending order (most recent first)
			});
		  });
		} catch (error) {
		  // console.error('Error fetching history:', error instanceof Error ? error.message : 'Unknown error');
		}
	  };

  const fetchUserInfo = async () => {
    if (!theId) return;

    setLoading(true);
    try {
      const response = await axiosAuth.get(`/user/user-info/${theId}`);
      const userInfo = response.data;

      setFullName(userInfo.user_data.full_name);
      setUsername(userInfo.user_data.username);
      setProfileImg(userInfo.user_data.profile_img ? `${theHost}:${port}${userInfo.user_data.profile_img}` : 'Profile1');
      setFriendState(
        userInfo.status === 'me' ? 'me' :
        userInfo.status === 'FR' ? 'friends' :
        userInfo.status === 'PE' ? 'pending' :
        userInfo.status === 'BL' ? 'blocked' :
        'notFriends'
      );
      setByMe(userInfo.by_me);
      setTheUser(userInfo.user_data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response && axiosError.response.status === 400) {
            navigate('/');
          }
          if (axiosError.response && axiosError.response.status === 404) {
            navigate('/NotFoundPage');
          }
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (globalContext.lastMessage !== null) {
      const data = JSON.parse(globalContext.lastMessage.data);

      if (data.type === 'relation.agreement') {
        if (data.relation_status === 'Anonymous' && friendState !== 'me') {
          setFriendState('notFriends');
        }
        else if (data.relation_status === 'friends' && friendState !== 'me') {
          setFriendState('friends');
        }
      }
      else if (data.type === 'relation.status' && friendState !== 'me') {
        if (data.rel_status === 'unblock') {
          setFriendState('notFriends');
        }
        else if (data.rel_status === 'block') {
          setFriendState('blocked');
        }
      }
      else if (data.type === 'add.friend' && friendState !== 'me') {
        setFriendState('pending');
      }
      else if (data.type === 'cancel.invite' && friendState !== 'me') {
        setFriendState('notFriends');
      }

    }
  }, [globalContext.lastMessage]);

  useEffect(() => {
      fetchUserInfo();
      fetchAllHistory();
  }, [theId]);

  const contextValue: ProfileContextType = {
    username,
    fullName,
    profileImg,
    friendState,
    byMe,
    setByMe,
    theId,
    setFriendState,
    setTheId,
    theUser,
    loading,
    dataHistory,
    setDataHistory,
    setDataGame,
    dataGame
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;