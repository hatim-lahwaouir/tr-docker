import LogoW from "../../assets/logoWhite.png";
import LogoB from "../../assets/logoblack.png";
import HomeIcon from "../../assets/IconsSvg/HomeIcon";
import ChatIcon from "../../assets/IconsSvg/ChatIcon"
import GameIcon from "../../assets/IconsSvg/GameIcon"
import NotificationIcon from "../../assets/IconsSvg/NotificationIcon"
import SearchIcon from "../../assets/IconsSvg/SearchIcon";
import NavbarMenu from "./NavbarMenu";
import { useNavbarContext } from "../../context/NavbarContext";
import { Link } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { useWebSocketContext } from "../../context/WebSocketContext";
import { useChatContext } from "../../context/ChatContext";
import { port, theHost } from "../../config";

const NavbarMobile = () => {
	const {isDark, barTop, barBottom, setisMenuActive, setMobileNotification, setMobileSearch} = useNavbarContext();
	const [cookies] = useCookies(['userData']);
	const { notifications } = useWebSocketContext();
	const chatContext = useChatContext();

	return(
		<>
			{barTop && 
			<>
				<div  className="z-10 bg-white border-b-2 dark:border-zinc-800 dark:bg-black fixed top-0 h-16 left-0 right-0 flex justify-around items-center">
					<div className=" shrink-0 justify-center flex ">
						<img src={isDark ? LogoW : LogoB} alt="" className="w-11 h-11 "/>
					</div>
					<div className="absolute left-0 ml-3 mt-2">
						<button className="dark:bg-white bg-black w-9 h-9 rounded-full flex justify-center items-center" onClick={()=>{
							setisMenuActive(true)
						}}>
							<img src={`${theHost}:${port}${cookies.userData.profile_img}`} alt="" className="rounded-full w-8 h-8"/>
						</button>
					</div>
				
				</div>
				<NavbarMenu/>
			</>}
			{barBottom && 
			<>
				<div className="z-10 bg-white border-t-2 dark:border-zinc-800 dark:bg-black fixed bottom-0 h-16 left-0 right-0 flex justify-around">
						<div className="flex flex-col items-center my-5">
						<Link to="/">
							<button onClick={() => {setMobileNotification(false); setMobileSearch(false);}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className="h-6 w-6 fill-black dark:fill-white ">
									<HomeIcon/>
								</svg>
							</button>
						</Link>
						</div>
						<div className="flex flex-col items-center my-5" >
						<Link to="/">
							<button onClick={() => {setMobileSearch(true)}}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="h-6 w-6 stroke-black fill-none dark:stroke-white">
									<SearchIcon/>
								</svg>
							</button>
						</Link>
						</div>
						<div className="flex flex-col items-center my-5">
						<Link to="/game">
							<button>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="h-6 w-6 fill-black dark:fill-white ">
									<GameIcon/>
								</svg>
							</button>
						</Link>
						</div>
						<div className="flex flex-col items-center my-5 relative" >
						<Link to="/">
							<button onClick={() => {setMobileNotification(true)}}>
								{notifications.length > 0 && <div>
									<span className="absolute right-0 -top-[5px] size-[11px] animate-ping bg-red-600 rounded-full"></span>
									<span className="absolute right-0 -top-[5px] size-[11px] bg-red-600 rounded-full"></span>
								</div>}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className="h-6 w-6 fill-black dark:fill-white ">
									<NotificationIcon/>
								</svg>
							</button>
						</Link>
						</div>
						<div className="flex flex-col items-center my-5 relative" >
						<Link to={`/chat/${cookies.userData.id}`}>
							<button>
							{!chatContext.allSeen && <span className="absolute -right-[4px] -top-[4px] size-[11px] animate-ping bg-red-600 rounded-full"></span>}
							{!chatContext.allSeen && <span className="absolute -right-[4px] -top-[4px] size-[11px] bg-red-600 rounded-full"></span>}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" className="h-6 w-6 fill-black dark:fill-white">
									<ChatIcon/>
								</svg>
							</button>
						</Link>
						</div>
				</div>
			</>
			}
		</>
	)

}
export default NavbarMobile