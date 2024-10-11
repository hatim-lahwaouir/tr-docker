import { useEffect, useState } from 'react';
import { useCookies } from "react-cookie";
import { useNavbarContext } from "../../context/NavbarContext";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";
import { axiosAuth } from '../../api/axiosAuth';

const Navbar: React.FC = () => {
  const { isWide, setIsWide, setIsTablet, isDark, setisMenuActive } = useNavbarContext();
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsUpdate] = useState(false);
  const [cookies] = useCookies(['userData']);

  const handleResize = () => {
    const width = window.innerWidth;
    setIsWide(width > 480);
    setIsTablet(width < 830 && width > 480);
    if (width > 480) {
      setisMenuActive(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updateUserPreferences = async () => {
    setIsLoading(true);
    try {
      await axiosAuth.post(`/user/change-my-info/`,
      {
        id: cookies.userData.id,
        dark_mode: isDark,
      }
      );
      setIsUpdate(prev => !prev);
    } catch (error) {
      // console.error('Error updating user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateUserPreferences();
  }, [isDark]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  if (isLoading) {
    return <div></div>;
  }

  return (
    <>
      {isWide ? <NavbarDesktop /> : <NavbarMobile />}
    </>
  );
};

export default Navbar;