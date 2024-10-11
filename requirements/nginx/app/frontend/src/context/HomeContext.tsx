import { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { axiosAuth } from '../api/axiosAuth';

interface HomeContextType {
  isLoading: boolean;
  isErrorFetch: boolean;
  data: User[];
}

interface User {
  id: string;
  username: string;
  profile_img: string;
  games: number;
  level: string;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHomeContext must be used within a HomeContextProvider');
  }
  return context;
};

const HomeContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isErrorFetch, setIsErrorFetch] = useState(false);
  const [data, setData] = useState<User[]>([]);



  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuth.get(`/game/listByLevel/`);

      setData(response.data.users);
    } catch (error) {
        // console.error('Error fetching user data:', error);
        setIsErrorFetch(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <HomeContext.Provider value={{ isLoading, isErrorFetch, data }}>
      {children}
    </HomeContext.Provider>
  );
};

export { HomeContext, HomeContextProvider, useHomeContext };