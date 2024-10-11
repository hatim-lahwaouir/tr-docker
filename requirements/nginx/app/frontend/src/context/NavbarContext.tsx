import { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { axiosAuth } from '../api/axiosAuth';

interface NavbarContextType {
  isWide: boolean;
  setIsWide: (value: boolean) => void;
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  barTop: boolean;
  setBarTop: (value: boolean) => void;
  barBottom: boolean;
  setBarBottom: (value: boolean) => void;
  isMenuActive: boolean;
  setisMenuActive: (value: boolean) => void;
  isTablet: boolean;
  setIsTablet: (value: boolean) => void;
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
  mobileNotification: boolean;
  setMobileNotification: (value: boolean) => void;
  mobileSearch: boolean;
  setMobileSearch: (value: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

const useNavbarContext = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbarContext must be used within a NavbarContextProvider');
  }
  return context;
};

const NavbarContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isWide, setIsWide] = useState(window.innerWidth > 480);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 830 && window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
  const [isDark, setIsDark] = useState(true);
  const [barTop, setBarTop] = useState(true);
  const [barBottom, setBarBottom] = useState(true);
  const [isMenuActive, setisMenuActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileNotification, setMobileNotification] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuth.get(`/user/me/`);

      setIsDark(response.data.user_data.dark_mode);
    } catch (error) {
        // console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (isWide || isTablet) {
      setMobileSearch(false);
      setMobileNotification(false);
    }
  }, [isTablet, isWide]);

  useEffect(() => {
    if (mobileSearch) {
      setMobileNotification(false);
    }
  }, [mobileSearch]);

  useEffect(() => {
    if (mobileNotification) {
      setMobileSearch(false);
    }
  }, [mobileNotification]);

  if (!isLoading)
    return (
      <NavbarContext.Provider
        value={{
          isWide,
          setIsWide,
          isDark,
          setIsDark,
          barTop,
          setBarTop,
          barBottom,
          setBarBottom,
          isMenuActive,
          setisMenuActive,
          isTablet,
          setIsTablet,
          isMobile,
          setIsMobile,
          mobileNotification,
          setMobileNotification,
          mobileSearch,
          setMobileSearch,
        }}
      >
        {children}
      </NavbarContext.Provider>
    );
  else return <></>;
};

export default NavbarContextProvider;

export { NavbarContext, useNavbarContext };