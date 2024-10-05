import { useEffect, useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaKey, FaLock } from "react-icons/fa";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import AccountInfo from "./AccountInfo";
import { useNavbarContext } from "../../context/NavbarContext";
import { IoGameController } from "react-icons/io5";

import Password from "./Password";
import Security from "./Security";
import GameSettings from "./GameSettings"




function SettingNew() {
	const {isWide, setBarTop} = useNavbarContext();
	const [isActive, setIsActive] = useState(false);
	const [selectedState, setSelectedState] = useState('Account Information');

	const SettingMenu = () => {
		return (
			<div className=" flex flex-col items-center tablete:flex-1 ">
						
							<div className="flex flex-col w-full">
								<div className="hover:bg-[#dddddd] dark:hover:bg-[#333333] w-full h-11 items-center flex cursor-pointer mobile:rounded-xl" onClick={
									()=>{
										setIsActive(true)
										setSelectedState("Account Information");
									}
									}>
									<div className="ml-4 flex items-center dark:text-white text-xl justify-between flex-1 mr-5"> 
										<div className="flex gap-3 items-center ">
											<div>
												<IoSettingsSharp />
											</div>
											<div>Account Information</div>
											
										</div>
										{!isWide && <IoIosArrowForward />}
									</div>
								</div>
								
								<div className="hover:bg-[#dddddd] dark:hover:bg-[#333333] w-full h-11 items-center flex cursor-pointer mobile:rounded-xl"onClick={
									()=>{
										setIsActive(true)
										setSelectedState("Password");
									}
									}>
									<div className="ml-4 flex items-center dark:text-white text-xl justify-between flex-1 mr-5"> 
										<div className="flex gap-3 items-center ">
											<div>
												<FaKey />
											</div>
											<div> Password</div>
											
										</div>
										{!isWide && <IoIosArrowForward />}
									</div>
								</div>
								<div className="hover:bg-[#dddddd] dark:hover:bg-[#333333] w-full h-11 items-center flex cursor-pointer mobile:rounded-xl"onClick={
									()=>{
										setIsActive(true)
										setSelectedState("Security");
									}
									}>
									<div className="ml-4 flex items-center dark:text-white text-xl justify-between flex-1 mr-5"> 
										<div className="flex gap-3 items-center ">
											<div>
												<FaLock />
											</div>
											<div>Security</div>
											
										</div>
										{!isWide && <IoIosArrowForward />}
									</div>
								</div>
								<div className="hover:bg-[#dddddd] dark:hover:bg-[#333333] w-full h-11 items-center flex cursor-pointer mobile:rounded-xl"onClick={
									()=>{
										setIsActive(true)
										setSelectedState("Game Settings");
									}
									}>
									<div className="ml-4 flex items-center dark:text-white text-xl justify-between flex-1 mr-5"> 
										<div className="flex gap-3 items-center ">
											<div>
												<IoGameController />
											</div>
											<div>Game Settings</div>
											
										</div>
										{!isWide && <IoIosArrowForward />}
									</div>
								</div>
						</div>
					</div>
		)
	}

	useEffect(()=>{
		setBarTop(!(isActive && !isWide))
	},[isActive, isWide])

	useEffect(() => {
		document.title = 'Settings';
	  }, []);
	
	return ( <>
		<div className="min-h-screen flex flex-col  text-black dark:text-white bg-white dark:bg-black">
			<div className=" min-h-16 "></div>
			<div className="flex-1 flex mobile:flex-row flex-col-reverse mobile:mr-3 mobile:mb-5">
				<div className="mobile:w-16 w-full h-16 mobile:h-full   "></div>
				<div className=" flex flex-col flex-1 grow justify-around mobile:ml-2">
					{(!isActive || isWide)  && <div className="dark:text-white m-5 text-3xl items-center ">Account Settings</div>}
					<div className="flex flex-1 tablet:flex-row gap-4 flex-col">
						{(isWide || !isActive) && SettingMenu()}
						{(isWide ||  isActive) && 
							<div className=" flex-1 mobile:rounded-2xl grow h-auto flex shrink justify-center ">
								<div className="shrink flex grow mobile:bg-[#dddddd]  mobile:dark:bg-[#333333] mobile:rounded-2xl justify-center">
									{(!isWide && isActive) && <div className="absolute top-0 right-0 left-0 h-16 dark:bg-black flex justify-center items-center">
										<div className="mobile:hidden text-3xl ml-3 absolute left-0 justify-start" onClick={()=>{setIsActive(false)}}><IoIosArrowBack/></div>
										<div className="flex items-center  justify-center  text-2xl text-center ">{selectedState}</div>
										</div>}
										{selectedState === 'Account Information' && <AccountInfo/>}
										{selectedState === 'Password' && <Password/>}
										{selectedState === 'Game Settings' && <GameSettings/>}
										{selectedState === 'Security' && <Security/>} 
								</div>
							</div>
						}
						
					</div>
					
				</div>
			</div>
		</div>
	</> );
}

export default SettingNew;