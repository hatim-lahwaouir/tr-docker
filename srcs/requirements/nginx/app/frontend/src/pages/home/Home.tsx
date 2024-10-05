import { MdLeaderboard } from "react-icons/md";
import { useEffect, useState, useRef } from 'react';
import LeaderBoard from './LeaderBoard';
import { HomeContextProvider } from '../../context/HomeContext';
import { useNavbarContext } from '../../context/NavbarContext';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { Link, useNavigate } from "react-router-dom";
import man from "../../assets/manpingpong.png"
import { useProfileContext } from '../../context/ProfileContext';
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

const Home = () => {
    const NavbarContext = useNavbarContext();
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const searchDropdownRef = useRef<HTMLDivElement | null>(null);
    const { acceptFriend, declineFriend, notifications, setNotifications } = useWebSocketContext();
    const profileInfo = useProfileContext();
    

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
      document.title = 'Dashboard';
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

      const handleProfileSwitch = (friendId: string) => {
        profileInfo.setTheId(friendId);
        navigate(`/profile/${friendId}`);
      }

    return (
        <>
            <div className="flex flex-col text-black dark:text-white bg-white dark:bg-black mobile:h-screen">
                <div className=" min-h-16"></div>
                <div className="flex mobile:flex-row flex-col-reverse flex-1 mobile:max-h-[calc(100vh-4rem)]">
                    <div className="mobile:w-16 w-full maxMobile:h-16   flex"></div>
                    {NavbarContext.mobileNotification ? (
                        <div className="flex flex-col h-[calc(100vh-128px)] flex-grow p-4 overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">Notifications</h2>
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <div key={index} className="mb-2 last:mb-0">
                                    {notification.type === 'add_friend' ? (
                                      <div className="flex items-center gap-2">
                                        <div className="flex gap-2 flex-grow min-w-0 cursor-pointer"
                                        onClick={() => {handleProfileSwitch(notification.id.toString())}}>
                                            <div>
                                                <img src={`${theHost}:${port}${notification.profile_img}`} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                                            </div>
                                            <p className="flex flex-col text-sm dark:text-white truncate">
                                              <span className="font-semibold">{notification.username}</span>
                                              <span className="text-gray-600 dark:text-gray-400"> wants to be friends</span>
                                            </p>
                                        </div>
                                        <button
                                          className="shrink-0 p-1 group"
                                          onClick={() => handleAcceptDecline(notification.id.toString(), 'accept')}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-current group-hover:text-green-500 transition-colors duration-200"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </button>
                                        <button
                                          className="shrink-0 p-1 group"
                                          onClick={() => handleAcceptDecline(notification.id.toString(), 'decline')}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-current group-hover:text-red-500 transition-colors duration-200"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                                    )}
                                  </div>
                                ))
                            ) : (
                                <div className="flex flex-col h-[calc(100vh-200px)] flex-grow content-center justify-center text-gray-500 dark:text-gray-400">
                                    <div className='flex content-center justify-center'>
                                        No notifications at the moment.
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : NavbarContext.mobileSearch ? (
                        <div className="flex flex-col h-[calc(100vh-128px)] flex-grow p-4">
                            <div className="relative w-full mb-4">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={handleInputChange}
                                    className="bg-white dark:bg-black dark:text-white h-12 rounded-2xl border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none pl-10 w-full"
                                />
                                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <path d="M13.8414 24.0002C19.3681 24.0002 23.8414 19.5269 23.8414 14.0002C23.8414 8.47341 19.3681 4.00015 13.8414 4.00015C8.3147 4.00015 3.84143 8.47341 3.84143 14.0002C3.84143 19.5269 8.3147 24.0002 13.8414 24.0002Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M26.5121 26.6709L20.8914 21.0502" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            <div className="overflow-y-auto">
                                {searchTerm.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-gray-400">Start typing to search...</div>
                                ) : isSearching ? (
                                    <div className="text-center text-gray-500 dark:text-gray-400">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between p-2 my-2 dark:hover:bg-[#191919] hover:bg-gray-100">
                                            <Link to={`/profile/${result.id}`} className="flex items-center flex-grow min-w-0">
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
                                                className="ml-2 p-2 text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                                </svg>
                                            </button> */}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 dark:text-gray-400">No results found</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-1 justify-center">
                            <div className='flex flex-col flex-1 max-w-5xl gap-5'>
                                <div className='bg-black  flex mobile:rounded-xl mobile:mx-5 p-5 sm:flex-row flex-col gap-2 items-center'>
                                  <div className='flex-1 flex flex-col  justify-center mobile:ml-5 maxTablet:max-w-[290px]'>
                                    <div className='text-white  flex-1 text-4xl flex flex-col'>
                                      <div className='flex justify-center sm:justify-normal text-center sm:text-left'>Step Up To The Table And Play</div>
                                      <div className='text-5xl  font-bold flex justify-center sm:justify-normal  text-center sm:text-left'>PING PONG!</div>
                                      <div className='flex text-white text-center justify-center'>
                                      <div className="flex  gap-2 mt-2 w-full  items-center sm:justify-normal  justify-center">
                                          <button className="bg-white  h-10 rounded-xl text-black flex items-center justify-center hover:bg-[#cecdcd] active:bg-[#9d9d9d] w-60" type="button" onClick={()=>{navigate('/game')}}>PLAY NOW</button>
                                      </div>	
                                      </div>
                                      </div>
                                  </div>
                                  <div className='flex items-center  justify-center '>
                                    <img src={man} alt=""  className=' max-h-52'/>
                                  </div>
                                </div>
                                <div className='flex flex-col flex-1 mobile:rounded-xl mobile:mx-5 mobile:mb-5 mobile:border dark:border-[#292929]'>
                                    <div className="flex min-h-16 items-center gap-2 pl-5">
                                        <div className='text-4xl'><MdLeaderboard/></div>
                                        <div className='text-2xl'>LEADERBOARD</div>
                                    </div>
                                    <HomeContextProvider>
                                        <LeaderBoard/>
                                    </HomeContextProvider>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;