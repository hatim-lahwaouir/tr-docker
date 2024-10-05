
import LogoW from "../../assets/logoWhite.png";
import LogoB from "../../assets/logoblack.png";
import HomeIcon from "../../assets/IconsSvg/HomeIcon";
import ProfileIcon from "../../assets/IconsSvg/ProfileIcon"
import ChatIcon from "../../assets/IconsSvg/ChatIcon"
import GameIcon from "../../assets/IconsSvg/GameIcon"
import NotificationIcon from "../../assets/IconsSvg/NotificationIcon"
import LogoutIcon from "../../assets/IconsSvg/LogoutIcon";
import SearchIcon from "../../assets/IconsSvg/SearchIcon";
import SettingIcon from "../../assets/IconsSvg/SettingIcon"
import Moon from "../../assets/Moon2.svg"
import Sun from "../../assets/Sun2.svg"
import { useNavbarContext } from "../../context/NavbarContext";
import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../../context/WebSocketContext';
import NotificationsDropdown from "../../components/NotificationsDropdown";
import { useChatContext } from "../../context/ChatContext";
import { axiosAuth } from "../../api/axiosAuth";
import { port, theHost } from "../../config";

interface User {
	id: string;
	username: string;
	email: string;
	profile_img: string;
	level: string;
  }
  
  interface Notification {
	id: number;
	type: string;
	sender: string;
	username: string;
	profile_img: string;
	message?: string;
  }

const NavbarDesktop = () => {
	const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { acceptFriend, declineFriend, setNotifications, notifications } = useWebSocketContext();
  const { isDark, setIsDark } = useNavbarContext();
  const chatContext = useChatContext();
  const navigate = useNavigate();
  const [cookies] = useCookies(['userData']);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

	const toggleNotifications = () => {
		setShowNotifications(!showNotifications);
	};

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
	localStorage.removeItem('refresh');
	localStorage.removeItem('access');
	clearCookies();
	navigate('/login');
};

	useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setIsDropdownOpen(false);
		}
    }

	document.addEventListener("mousedown", handleClickOutside);
	return () => {
		document.removeEventListener("mousedown", handleClickOutside);
	};
	}, []);


	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
		if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
			setIsDropdownOpen(false);
		}
	};
	
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
		if (searchTerm) {
			setIsSearching(true);
			axiosAuth.get(`/user/search-friends/${searchTerm}`)
				.then(response => {
				if (Array.isArray(response.data?.searched_users)) {
					setSearchResults(response.data.searched_users);
				} else {
					setSearchResults([]);
				}
			})
			.catch(() => {
				// console.error('Error searching friends:', error);
				setSearchResults([]);
			})
			.finally(() => {
				setIsSearching(false);
			});
		} else {
			setSearchResults([]);
		}
		}, 500);
 
		return () => clearTimeout(delayDebounceFn);
	}, [searchTerm]);
	
	const handleInputFocus = () => {
		setIsDropdownOpen(true);
	};
	
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		setIsSearching(value.length > 0);
	};

	const handleAcceptDecline = (username: string, action: 'accept' | 'decline') => {
		if (action === 'accept') {
			acceptFriend(username);
		} else if (action === 'decline') {
			declineFriend(username);
		}
	
		// Remove the notification
		setNotifications((prevNotifications:Notification[]) => 
			prevNotifications.filter(notification => notification.username !== username)
		);
	};
 
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowNotifications(false);
			}
		};
	
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
		document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [setShowNotifications]);

	return(
	<>
    <div className="fixed z-10 h-16 top-0 right-0 left-0 flex justify-between bg-white dark:bg-black">
      <div className="ml-24 flex items-center shrink w-96">
        <div className="relative w-full" ref={searchDropdownRef}>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="bg-white dark:bg-black dark:text-white h-12 rounded-2xl border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none pl-10 w-full"
          />
          <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2">
            <SearchIcon />
          </svg>

          {isDropdownOpen && (
            <div className="absolute w-full bg-white dark:bg-black shadow-lg rounded-xl mt-2 p-2">
              {searchTerm.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Start typing to search...</div>
              ) : isSearching ? (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
					<div key={result.id} className="flex items-center justify-between p-2 my-2 dark:hover:bg-[#191919] hover:bg-gray-100">
					<Link to={`/profile/${result.id}`} className="flex items-center flex-grow min-w-0"
						onClick={() => {setIsDropdownOpen(false)}}>
						<img 
							src={`${theHost}:${port}${result.profile_img}`} 
							alt={result.username} 
							className="w-10 h-10 rounded-full mr-3"
						/>
						<div>
							<p className="text-sm font-semibold dark:text-white truncate">
								{result.username}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Level: {result.level}
							</p>
						</div>
					</Link>
					{/* <button
						onClick={() => handleAddFriend(result.id)}
						className="text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
						</svg>
					</button> */}
				</div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

	<div className="flex mx-6 items-center">
				<button className=" h-6 w-6 mr-5 flex items-center justify-center"  onClick={()=>{
				setIsDark(!isDark)
						}}>
				<img src={isDark ? Moon : Sun} alt="" className="rounded-full h-6 "/>
				</button>
				<div className="relative">
					<button 
					ref={notificationButtonRef}
					className="h-14 w-14 mr-5 flex items-center justify-center"
					onClick={toggleNotifications}
					>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 40" className="h-6 w-6 fill-black dark:fill-white">
						<NotificationIcon/>
					</svg>
					{notifications.length > 0 && <div>
						<span className="absolute right-8 top-[10px] size-[11px] animate-ping bg-red-600 rounded-full"></span>
						<span className="absolute right-8 top-[10px] size-[11px] bg-red-600 rounded-full"></span>
					</div>}
					</button>
					
					{showNotifications && (
					<NotificationsDropdown
						notifications={notifications}
						handleAcceptDecline={handleAcceptDecline}
						setShowNotifications={setShowNotifications}
					/>
					)}
				</div>
				<Link to={`/profile/${cookies.userData.id}`}>
				<button className=" h-11 w-11 rounded-full items-center flex justify-center">
					<img src={`${theHost}:${port}${cookies.userData.profile_img}`} alt="" className="rounded-full h-11 "/>
				</button>
				</Link>
				
			</div>
		</div>
		<div className="bg-white z-20 dark:bg-black fixed w-16 top-0  flex flex-col border-r-[1px] dark:border-[#292929] justify-between min-h-screen">
			<Link to="/">
			<div className=" shrink-0 justify-center flex ">
				<img src={isDark ? LogoW : LogoB} alt="" className="w-12 h-12 my-4 "/>
			</div>
			</Link>
			<div className=" mt-16 mb-4 flex flex-col flex-1">
				<div className="flex flex-col items-center my-5">
				<Link to="/">
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 36" className="h-6 w-6 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060]">
							<HomeIcon/>
						</svg>
					</button>
				</Link>
				</div>
				<div className="flex flex-col items-center my-5">
				<Link to={`/profile/${cookies.userData.id}`}>
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 34" className="h-6 w-6 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060]">
							<ProfileIcon/>
						</svg>
					</button>
				</Link>
				</div>
				<div className="flex flex-col items-center my-5 relative" >
				<Link to={`/chat/${cookies.userData.id}`}>
					<button>
						{!chatContext.allSeen && <span className="absolute right-4 -top-1 size-[11px] animate-ping bg-red-600 rounded-full"></span>}
						{!chatContext.allSeen && <span className="absolute right-4 -top-1 size-[11px] bg-red-600 rounded-full"></span>}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="h-6 w-6 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060]">
							<ChatIcon/>
						</svg>
					</button>
				</Link>
				</div>
				<div className="flex flex-col items-center my-5">
				<Link to="/game">
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="h-6 w-6 fill-black dark:fill-white  hover:fill-[#808080] active:fill-[#606060]">
							<GameIcon/>
						</svg>
					</button>
				</Link>
				</div>
				
			</div>
			<div className=" shrink-0" > 
				<div className="flex flex-col items-center my-11 " >
					<Link to="/setting">
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" className="h-6 w-6 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060]">
							<SettingIcon/>
						</svg>
					</button>
					</Link>
				</div>
				<div className="flex flex-col items-center mt-5 mb-11">
					<button 
						className="flex flex-col justify-center items-center"
						onClick={handleLogout}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 40" className="h-5 w-5 fill-black dark:fill-white hover:fill-[#808080] active:fill-[#606060]">
							<LogoutIcon/>
						</svg>
						<span className="dark:text-white text-sm">Logout</span>
					</button>
				</div>
			</div>
		</div>
	</>
	)
}

export default NavbarDesktop;