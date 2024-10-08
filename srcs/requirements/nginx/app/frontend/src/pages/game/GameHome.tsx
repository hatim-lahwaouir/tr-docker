import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavbarContext } from '../../context/NavbarContext';
import { FaXmark } from 'react-icons/fa6';
import { GiTrophy } from 'react-icons/gi';
import { useTounamentContext } from '../../context/TounamentContext';
import tournpic from "../../assets/44man.png"
import tournpic2 from "../../assets/44man2.png"
import frindPic from "../../assets/2mans.png"
import localPic from "../../assets/man.svg"
import { axiosAuth } from '../../api/axiosAuth';

const GameHome = () => {
	const navigate = useNavigate();
	const barInfo = useNavbarContext();
	const[tournamentStartActive, setTournamentStartActive] = useState(false)
	const [isLoading, setIsLoading] = useState(true);
	const [isOnTourn, setisOntourn] = useState(false);
	const [ischeck, setischeck] = useState(false);
	const [alias, setalias] = useState("");
	const [totourn, setToTourn] = useState(false);
	const { setCloseSocket, socketclose} = useTounamentContext();


	const handleGameModeSelect = async () => {
		navigate(`/game-lobby/0`);
	}

	const handleGamePlayerSelect = async () => {
		navigate(`/game-play`);
	}
	const handleGameTounamentSelect = async () => {
		navigate(`/tounament-lobby`);
	}

	useEffect(() => {
		document.title = 'Game | Home';
	}, []);
  


	const TournamentStart= ()=>{
		return(
			<form className="fixed z-50  inset-0 flex items-center justify-center " onSubmit={(e)=>{
				e.preventDefault();
				joinTournament();
			}}>
				<div className="backdrop-blur-[2px]  bg-[#0000000e] dark:bg-[#ffffff2b]  min-w-full min-h-full absolute" onClick={()=>{setTournamentStartActive(false)}}></div>

					<div className="flex flex-col dark:bg-black bg-white rounded-xl w-80 items-center p-4 relative m-3" >
						<div className=" absolute right-2 top-2 text-xl cursor-pointer" onClick={()=>{setTournamentStartActive(false)}}><FaXmark /></div>
						<div className="text-2xl font-bold text-center mt-3">TOURNAMENT</div>
						<div className="text-9xl text-bold text-center my-3"><GiTrophy /></div>
						<div className="flex flex-col w-full mb-4">
							<input className="border dark:border-[#292929] h-12 rounded-2xl w-full p-5 dark:bg-black dark:text-white outline-none"
							onChange={(e) => {
								setalias(e.currentTarget.value);
							}}
							name= "Tournament's Alias"
							type= "text"
							placeholder= "Tournament's Alias"
							minLength={4}
							maxLength={10}
							title="Must start with a letter and contain only letters, digits and min 4 , max 10."
							required pattern="[a-zA-Z]+[a-zA-Z0-9]"
							/>
						</div>
						<div className="flex  gap-2 mt-2 w-44 justify-end items-center">
							<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Join</button>
						</div>
					</div>
				</form>
		)
	}

	const checkisInTournament = async () => {
		setIsLoading(true);
		try {
			const response = await axiosAuth.get(`/game/tr/`);
			const result = response.data;
			setisOntourn(result.isParticipant);
			setischeck(!ischeck);
		} catch (error) {
			// console.error('Error:', error);
		} finally {
			setIsLoading(false)
		}
	}

	const joinTournament = async () => {
		setIsLoading(true);
		try {
		await axiosAuth.post('/game/trRegister/', {
			alias: alias,
			type: 4
		});
			setTournamentStartActive(false);
			setToTourn(true);
		} catch (error) {
			// console.error('Error joining tournament:', error);
		} finally {
		setIsLoading(false);
		}
	};
	
	useEffect(()=>{
		if(!isOnTourn && !isLoading){
			setCloseSocket(!socketclose);
			setTournamentStartActive(true);
		}
		else if(isOnTourn && !isLoading){
			setToTourn(true);
		}
	}, [ischeck])

	useEffect(()=>{
		if(totourn)
			navigate(`/tournament`);
	}, [totourn])

  return (
    <div>
      <div className="min-h-screen flex flex-col  text-black dark:text-white bg-white dark:bg-black">
        <div className="  min-h-16 "></div>
        <div className=" flex-1 flex mobile:flex-row flex-col-reverse ">
            <div className=" mobile:w-16 w-full maxMobile:h-16   flex"></div>

			<div className='flex justify-center items-center w-full min-h-[calc(100vh-4rem)] p-10'>
				<div className='flex flex-col tablet3:flex-row gap-10 w-full max-w-[1200px]'>
				<div className='flex flex-col gap-10 flex-1'>
					<div className={`flex-1 mobile:min-h-[350px] min-h-[250px] rounded-lg shadow-2xl flex flex-col justify-between p-8 cursor-pointer
						${ barInfo.isDark ? 'bg-gradient-to-br from-[#4B4B4B] via-black to-[#4B4B4B]' : 'bg-gradient-to-br from-[#B7B7B7] via-white to-[#B7B7B7]'}`}
						onClick={handleGameModeSelect}
						style={{
							backgroundImage: `url(${frindPic})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat'
							}}
						>
						<div className='text-2xl font-bold text-black'>
							Ping Pong <br /> Play With Friends
						</div>
							
						<div className='text-2xl font-medium flex gap-1'>
							<div>
								<svg width="32px" height="32px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#bababa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up-right"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></g></svg>
							</div>
							<div className='text-[#bababa]'>
								Play
							</div>
						</div>
						</div>
						<div className={`flex-1 mobile:min-h-[350px] min-h-[250px] rounded-lg shadow-2xl flex flex-col justify-between p-8 cursor-pointer
							${ barInfo.isDark ? 'bg-gradient-to-br from-[#4B4B4B] via-black to-[#4B4B4B]' : 'bg-gradient-to-br from-[#B7B7B7] via-white to-[#B7B7B7]'}`}
							onClick={handleGameTounamentSelect}
							style={{
								backgroundImage: `url(${tournpic2})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat'
								}}
								>
							<div className='text-2xl font-bold text-black'>
								Ping Pong <br /> Play Tounament Locally
							</div>

							<div className='text-2xl font-medium flex gap-1'>
								<div>
									<svg width="32px" height="32px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#bababa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up-right"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></g></svg>
								</div>
								<div className='text-[#bababa]'>
									Play
								</div>
							</div>
						</div>
						</div>
						<div className='flex flex-col gap-10 flex-1'>
						<div 
							className={`flex-1 mobile:min-h-[350px] min-h-[250px] rounded-lg shadow-2xl flex flex-col justify-between p-8 cursor-pointer
							${ barInfo.isDark ? 'bg-gradient-to-br from-[#4B4B4B] via-black to-[#4B4B4B]' : 'bg-gradient-to-br from-[#B7B7B7] via-white to-[#B7B7B7]'}`}
							onClick={()=>{
								setToTourn(false);
								checkisInTournament();
								}}
							style={{
							backgroundImage: `url(${tournpic})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat'
							}}
						>
							<div className='text-2xl font-bold text-black'>
							Ping Pong <br /> Play Tournament
							</div>

							<div className='text-2xl font-medium flex gap-1'>
								<div>
									<svg width="32px" height="32px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#bababa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up-right"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></g></svg>
								</div>
								<div className='text-[#bababa]'>
									Play
								</div>
							</div>
						</div>
						<div className={`flex-1 mobile:min-h-[350px] min-h-[250px] rounded-lg shadow-2xl flex flex-col justify-between p-8 cursor-pointer
							${ barInfo.isDark ? 'bg-gradient-to-br from-[#4B4B4B] via-black to-[#4B4B4B]' : 'bg-gradient-to-br from-[#B7B7B7] via-white to-[#B7B7B7]'}`}
							onClick={handleGamePlayerSelect}
							style={{
								backgroundImage: `url(${localPic})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat'
								}}
								>
							<div className='text-2xl font-bold text-black'>
								Ping Pong <br /> Play Locally
							</div>

							<div className='text-2xl font-medium flex gap-1'>
								<div>
									<svg width="32px" height="32px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#bababa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up-right"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></g></svg>
								</div>
								<div className='text-[#bababa]'>
									Play
								</div>
							</div>
						</div>
						{/* <div className={`flex-1 mobile:min-h-[350px] min-h-[250px] rounded-lg shadow-2xl flex flex-col justify-between p-8 cursor-pointer
							${ barInfo.isDark ? 'bg-gradient-to-br from-[#4B4B4B] via-black to-[#4B4B4B]' : 'bg-gradient-to-br from-[#B7B7B7] via-white to-[#B7B7B7]'}`}
							onClick={handleGameTounamentSelect}
							style={{
								backgroundImage: `url(${localPic})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat'
								}}
								>
							<div className='text-2xl font-bold text-black'>
								Ping Pong <br /> Play Tounament Locally
							</div>

							<div className='text-2xl font-medium flex gap-1'>
								<div>
									<svg width="32px" height="32px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#bababa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up-right"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></g></svg>
								</div>
								<div className='text-[#bababa]'>
									Play
								</div>
							</div>
						</div> */}
						</div>
					</div>
					</div>

                </div>
            </div>
			{tournamentStartActive && TournamentStart()}
    </div>
	
  );
}

export default GameHome;
