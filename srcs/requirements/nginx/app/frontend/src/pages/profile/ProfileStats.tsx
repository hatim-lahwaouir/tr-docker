import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileContext } from "../../context/ProfileContext";
import { useWebSocketContext } from "../../context/WebSocketContext";
import { CiMail } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { useChatContext } from "../../context/ChatContext";
import { useNavbarContext } from "../../context/NavbarContext";
import { axiosAuth } from "../../api/axiosAuth";
import { AxiosError } from "axios";

interface UserState {
	fract_level: number,
	game: number,
	level: number,
	win: number,
}

interface Friend {
	id: number;
	full_name: string;
	username: string;
	profile_img: string;
	level: number;
	status: string;
  }

const ProfileStats = () =>{
		const [, setIsWide] = useState(false);
		const [, setIsLoading] = useState(true);
		const [, setisErrorFetch] = useState(false);
		const navigate = useNavigate();
		const profileInfo = useProfileContext();
		const { addFriend, unfriend, blockUser, unblockUser, cancelFriendRequest } = useWebSocketContext();
		const [DATA, setData] = useState<UserState>({fract_level: 0, game:0, level:0, win:0});
		const { id } = useParams();
		const [isHovered, setIsHovered] = useState(false);
		const [isOptionsOpen, setIsOptionsOpen] = useState(false);
		const optionsRef = useRef<HTMLDivElement>(null);
		const chatContext = useChatContext();
		const barInfos = useNavbarContext();

		const fetchingUserData = async () => {
			setIsLoading(true);
			try {
				const response = await axiosAuth.get(`/game/stats/${id}`);
				setData(response.data);
			} catch (error) {
				setisErrorFetch(true);
				if (error instanceof AxiosError) {
				// console.error('Error fetching user data:', error.response?.data || error.message);
				} else {
				// console.error('An unexpected error occurred:', error);
				}
			} finally {
				setIsLoading(false);
			}
		};

	useEffect(() => {
		fetchingUserData()
	},[id]);
	//? hadi zayda ??
	const handleResize = () => {
		setIsWide(window.innerWidth > 700);
	};
	
	useEffect(() => {
		window.addEventListener('resize', handleResize);
	
		// Cleanup event listener on component unmount
		return () => {
		window.removeEventListener('resize', handleResize);
		};
	}, []);
	
	const handleAddFriend = (id: string) => {
		addFriend(id);
		profileInfo.setByMe(true);
		profileInfo.setFriendState('pending');
	};

	const handleUnfriend = (id: string) => {
		unfriend(id);
		profileInfo.setFriendState('notFriends');
	};

	const handleCancelRequest = (id: string) => {
		cancelFriendRequest(id);
		profileInfo.setFriendState('notFriends');
	};

	const handleOptionClick = (option: string, id: string) => {
		setIsOptionsOpen(false);
		switch (option) {
			case 'block':
				profileInfo.setByMe(true);
				blockUser(id);
				break;
			case 'unblock':
				unblockUser(id);
				break;
		}
	};
  
	const renderButtonContent = () => {
		switch (profileInfo.friendState) {
			case 'notFriends':
				return 'Add Friend';
			case 'pending':
				return isHovered && profileInfo.byMe ? 'Cancel' : 'Pending';
			case 'friends':
				return 'Friends';
			case 'blocked':
				return 'Blocked';
			default:
				return 'Add Friend';
		}
	};

	const getButtonStyle = () => {
		if (profileInfo.friendState === 'pending' && isHovered) {
			return "bg-white dark:bg-black border-[1px] border-black dark:border-white font-bold text-white hover:text-red-500 hover:border-red-500 dark:hover:border-red-500";
		}
		else if ((profileInfo.friendState === 'friends' && isHovered) || profileInfo.friendState === 'blocked') {
			return "bg-white dark:bg-black border-[1px] border-black dark:border-white font-bold text-white hover:text-red-500 hover:border-red-500 dark:hover:border-red-500";
		}
		return "bg-white dark:bg-black border-[1px] border-black dark:border-white font-bold dark:text-white text-black hover:bg-[#dedede] active:bg-[#dedede] dark:hover:bg-[#2e2e2e] dark:active:bg-[#2e2e2e]";
	};
				
	const handleMessageUser = (friend: Friend | null) => {
		if (friend) {
			if (!barInfos.isWide) {
				chatContext.setIsConvSelected(true);
				barInfos.setBarBottom(false);
				barInfos.setBarTop(false);
			}
			chatContext.setIsConvOn(true);
			chatContext.setSelectedUserChat(friend);
			navigate(`/chat/${friend.id}`);
		}
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
		if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
			setIsOptionsOpen(false);
		}
		};
	
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return(
		<>
			<div className=' flex grow'>
				<div className='flex flex-col gap-2 w-full'>
					<div className='flex flex-col  gap-2'>
						<div className='flex flex-col  grow'>
							<div className='flex justify-center items-center'>
								{profileInfo.loading
								?
								<div className='size-28 rounded-full animate-pulse bg-[#9a9a9a] dark:bg-[#222222]' ></div>
								:
								<img src={`${profileInfo.profileImg}`} alt="" className="size-28 rounded-full border border-black dark:border-white"/> }
							</div>
							<div className='flex flex-col flex-1 '>
								<div className='flex-1 flex flex-col items-center  justify-center'>
									{profileInfo.loading
									?
									<>
										<div className="w-40 h-5 my-3 rounded-lg bg-[#9a9a9a] dark:bg-[#222222]"></div>
										<div className="w-28 h-5 rounded-lg bg-[#9a9a9a] dark:bg-[#222222]"></div>
									</>
									:
									<>
										<div className='text-bold text-2xl'>{profileInfo.loading ? 'loading...' : profileInfo.fullName}</div>
										<div className='text-sm dark:text-[#848484]'>{profileInfo.loading ? 'loading...' : `@${profileInfo.username}`}</div>
									</>}
									
								</div>
								<div className='flex-1'>
									<div className="flex justify-between mb-1">
										<span className="text-base font-medium  dark:text-white">Level {Math.floor(DATA.level)}</span>
										<span className="text-sm font-medium  dark:text-white">{Math.floor(DATA.fract_level)}%</span>
									</div>
										<div className="w-full bg-gray-200 rounded-full h-4 dark:bg-[#474747]">
										<div className="bg-black dark:bg-white h-4 rounded-full" style={{width: `${Math.floor(DATA.fract_level)}%`}}></div>
									</div>
								</div>
							</div>
						</div>

						<div className='flex gap-2 items-center   '>
							<div className='flex-1 flex justify-around gap-1'>
								<div className=' flex justify-center flex-col items-center'>
									<div className='text-center  font-bold '>{DATA.game}</div>
									<div className='text-center  text-sm font-bold '>GAME</div>
								</div>
								<div className=' flex justify-center flex-col items-center'>
									<div className='text-center  font-bold '>{DATA.win}</div>
									<div className='text-center text-sm font-bold '>WIN</div>
								</div>
								<div className=' flex justify-center flex-col items-center'>
									<div className='text-center  font-bold '>{DATA.game - DATA.win}</div>
									<div className='text-center text-sm font-bold '>LOSE</div>
								</div>
                          
								<div className="relative size-28 flex">
									<svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
										<circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-neutral-700" strokeWidth="3"></circle>
										<circle cx="18" cy="18" r="16" fill="none" className="stroke-current " strokeWidth="3" strokeDasharray="100" strokeDashoffset={`${ DATA.game ? 100 - ((DATA.win * 100) / DATA.game) : 100 }`} strokeLinecap="round"></circle>
									</svg>
									<div className="absolute top-1/2 start-1/2 transform flex flex-col -translate-y-1/2 -translate-x-1/2">
										<span className="text-center  font-bold ">{DATA.game ? ((DATA.win * 100) / DATA.game).toFixed(0) : 0}%</span>
										<span className="text-center text-[11px] font-bold ">WIN RATE</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					{profileInfo.friendState !== 'me' && (
                       <div className='flex justify-end'>
                         <div className="flex gap-2 my-2 justify-end items-center tablet2:max-w-80 grow">
                           <div className='flex gap-2 my-2 items-center'>
                             <div className={`relative ${profileInfo.friendState === 'blocked' && !profileInfo.byMe ? 'hidden' : ''}`} ref={optionsRef}>
                               <button 
                                 className="p-[5px] rounded-full dark:text-white text-black border-[0.8px] dark:border-[#737373] border-[#777777] flex items-center justify-center hover:bg-[#dedede] active:bg-[#dedede] dark:hover:bg-[#2e2e2e] dark:active:bg-[#2e2e2e]"
                                 type="button"
                                 onClick={() => setIsOptionsOpen(!isOptionsOpen)}>
                                 <BsThreeDots className="text-xl" />
                               </button>
                               {isOptionsOpen && (
                                 <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#191919] ring-1 ring-black ring-opacity-5`}>
                                   <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                     { profileInfo.friendState === 'blocked' && profileInfo.byMe 
                                     ? ['Unblock'].map((option) => (
										<button
											key={option}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2F2F2F]"
											role="menuitem"
											onClick={() => handleOptionClick(option.toLowerCase(), profileInfo.theId)}
										>
											{option}
										</button>
										)) : ['Block'].map((option) => (
                                       <button
                                         key={option}
                                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2F2F2F]"
                                         role="menuitem"
                                         onClick={() => handleOptionClick(option.toLowerCase(), profileInfo.theId)}
                                       >
                                         {option}
                                       </button>
                                     ))
									}
                                   </div>
                                 </div>
                               )}
                             </div>
                           </div>
                            <button 
                               className={`p-[5px] rounded-full dark:text-white text-black border-[0.8px] dark:border-[#737373] border-[#777777] flex items-center justify-center hover:bg-[#dedede] active:bg-[#dedede] dark:hover:bg-[#2e2e2e] dark:active:bg-[#2e2e2e] ${profileInfo.friendState !== 'friends' ? 'hidden' : ''}`}
                               type="submit"
                               onClick={() => {handleMessageUser(profileInfo.theUser)}}
                               disabled={profileInfo.friendState !== 'friends' || !profileInfo.theUser}>
                               <CiMail className="text-xl" />
                             </button>
                           <button 
                             className={`flex-1 h-[36px] max-w-[150px] rounded-2xl flex items-center justify-center transition-colors duration-200 ${getButtonStyle()}`}
                             type="submit" 
                             onClick={() => {
								if (profileInfo.friendState === 'friends') {
									handleUnfriend(profileInfo.theId);
								} else if (profileInfo.friendState === 'pending' && isHovered) {
									handleCancelRequest(profileInfo.theId);
								} else {
									handleAddFriend(profileInfo.theId);
								}
							}}
                             disabled={profileInfo.friendState === 'blocked' || profileInfo.friendState === 'pending' && !profileInfo.byMe}
                             onMouseEnter={() => setIsHovered(true)}
                             onMouseLeave={() => setIsHovered(false)}
                           >
                             {profileInfo.friendState === 'friends' && isHovered ? 'Unfriend' : renderButtonContent()}
                           </button>
                         </div>
                       </div>
                     )}
				</div>
			</div>
		</>
	)
}

export default ProfileStats
