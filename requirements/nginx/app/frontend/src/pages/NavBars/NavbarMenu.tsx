
import ProfileIcon from "../../assets/IconsSvg/ProfileIcon";
import SettingIcon from "../../assets/IconsSvg/SettingIcon";
import LogoutIcon from "../../assets/IconsSvg/LogoutIcon";
import Moon from "../../assets/Moon2.svg"
import Sun from "../../assets/Sun2.svg"
import { useNavbarContext } from "../../context/NavbarContext";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { axiosAuth } from "../../api/axiosAuth";
import { port, theHost } from "../../config";
import { useEffect, useState } from "react";
import axios, { AxiosError } from 'axios';
import { useGameContext } from "../../context/GameContext";

function NavbarMenu() {
	
	const {isDark, setIsDark, isMenuActive, setisMenuActive} = useNavbarContext();
	const [cookies] = useCookies(['userData']);
	const navigate = useNavigate();
	const [userName, setUsername] = useState();
	const [fullName, setFullName] = useState();
	const [level, setLevel] = useState();
	const [profileImg, setProfileImg] = useState('');
	const [loading, setLoading] = useState<boolean>(false);
	const { setGameSocket, gameSocket } = useGameContext();

  const clearCookies = () => {
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

const handleLogout = async () => {
	try {
		await axiosAuth.post('/user/logout/', {
		refresh: localStorage.getItem('refresh'),
		});
  
		performLogoutCleanup();
	} catch (error) {
		// console.error('Logout error:', error);
		performLogoutCleanup();
	}
  };
  
  const performLogoutCleanup = () => {
	if (gameSocket) {
		setGameSocket(null);
		gameSocket.close(); 
	}
	localStorage.removeItem('refresh');
	localStorage.removeItem('access');
	clearCookies();
	navigate('/login');
  };

  const fetchUserInfo = async () => {

    setLoading(true);
    try {
      const response = await axiosAuth.get(`/user/user-info/${cookies.userData.id}`);
      const userInfo = response.data;

      setFullName(userInfo.user_data.full_name);
      setUsername(userInfo.user_data.username);
      setLevel(userInfo.user_data.level);
      setProfileImg(`${theHost}:${port}${userInfo.user_data.profile_img}`);
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
    fetchUserInfo();
  }, [isMenuActive]);

	return (
			<>
			<div
				style={{
					display: isMenuActive ? "block" : "none",
					opacity: isMenuActive ? 1 : 0
				}} 
				className=" fixed  backdrop-blur-[2px] z-50 bg-[#7016160e] dark:bg-[#ffffff2b] min-w-full min-h-full flex transition-opacity duration-700" onClick={()=>{
					setisMenuActive(false);
			}}>

			</div>
				<div
					style={{
						left: isMenuActive ? "0%" : "-100%"
					}} 
					className="fixed z-50 dark:bg-black backdrop-blur-[0] bg-white  min-h-full top-0 bottom-0 w-[75%] flex flex-col justify-between transition-[left] duration-700 shadow-xl dark:shadow-[#000000] shadow-[#b0b0b0] text-black dark:text-white">
					<div className="m-5 flex flex-col">
						<div className="dark:bg-white mx-3 bg-black w-12 h-12 rounded-full flex justify-center items-center" onClick={()=>{
					setisMenuActive(false);
						}}>
							{
								loading ? <div className="rounded-full w-11 h-11 animate-pulse bg-[#bbbbbb] dark:bg-[#323232]" ></div> :
								 <img src={profileImg}alt="" className="rounded-full w-11 h-11"/>
							}
							
							
						</div>
						{
							loading ? <>
							<div className="w-28 rounded-full bg-[#bbbbbb] dark:bg-[#323232] h-6 mx-3 animate-pulse"></div>
							<div className="w-24 rounded-full bg-[#bbbbbb] dark:bg-[#323232] mt-1 h-5 mx-3 animate-pulse"></div>
							<div className="w-20 rounded-full bg-[#bbbbbb] dark:bg-[#323232] mt-1 h-5 mx-3 animate-pulse"></div>
							</>:
							<>
							<div className="text-xl dark:text-white mx-3">{`${fullName}`}</div>
							<div className="text-base dark:text-white mx-3 text-[#868686]">lvl . {level}</div>
							<div className="text-sm  dark:text-white mx-3 text-[#868686]">{`@${userName}`}</div>
							</>
						}
						<div className="text-base dark:text-white my-2"><hr className="dark:border-[#2f2f2f]"/></div>
						<Link to={`/profile/${cookies.userData.id}`} onClick={()=>{
								setisMenuActive(false);
							}}>
							<button className=" flex items-center m-3">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 34" className="h-5 w-5 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060] mr-5">
									<ProfileIcon/>
								</svg>
								<div className="text-xl  dark:text-white"> Profile</div>
							</button>
						</Link>
						<Link to="/setting"  onClick={()=>{
								setisMenuActive(false);
							}}>
							<button className=" flex items-center m-3" onClick={()=>{
								setisMenuActive(false);
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" className="h-5 w-5 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060] mr-5">
									<SettingIcon/>
								</svg>
								<div className="text-xl  dark:text-white"> Setting</div>
							</button>
						</Link>
					</div>
					<div className="m-5 flex flex-col">
						<button className=" flex items-center m-3" onClick={()=>{
						setIsDark(!isDark)
						// setMyTheme("light")
								}}>
						<img src={isDark ? Moon : Sun} alt="" className="rounded-full h-6 mr-5"/>
							<div className="text-xl dark:text-white"> {isDark ? "Dark Mode" : "Light Mode"}</div>
						</button>
						<div className="text-base my-2"><hr className="dark:border-[#2f2f2f]"/></div>
						<button
							className=" flex items-center m-3"
							onClick={handleLogout}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 40" className="h-5 w-5 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060] mr-5 ml-1">
								<LogoutIcon/>
							</svg>
							<div className="text-xl dark:text-white"> Logout</div>
						</button>
					</div>
				</div>
			</>
	);
}

export default NavbarMenu;