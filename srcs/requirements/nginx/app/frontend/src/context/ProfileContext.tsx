import { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocketContext } from './WebSocketContext';
import { axiosAuth } from '../api/axiosAuth';
import { port, theHost } from '../config';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

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
}

interface Friend {
  id: number;
  full_name: string;
  username: string;
  profile_img: string;
  level: number;
  status: string;
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
  const navigate = useNavigate();

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
      setTheId(userInfo.user_data.id);
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
        if (data.relation_status === 'Anonymous') {
          setFriendState('notFriends');
        }
        else if (data.relation_status === 'friends') {
          setFriendState('friends');
        }
      }
      else if (data.type === 'relation.status') {
        if (data.rel_status === 'unblock') {
          setFriendState('notFriends');
        }
        else if (data.rel_status === 'block') {
          setFriendState('blocked');
        }
      }
      else if (data.type === 'add.friend') {
        setFriendState('pending');
      }
      else if (data.type === 'cancel.invite') {
        setFriendState('notFriends');
      }

    }
  }, [globalContext.lastMessage]);

  useEffect(() => {
    fetchUserInfo();
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
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;