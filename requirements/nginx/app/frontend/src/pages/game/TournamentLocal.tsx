
import  { useRef, useEffect, useState } from 'react';
import { GiTrophy } from "react-icons/gi";
import { IoIosExit } from "react-icons/io";
import { Tooltip, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import PlayersArrow from "../../components/tournament/playersArrow";
import { TournParticipants, useTounamentLocalContext } from '../../context/TounamentLocalContext';
import PlayerTournamentBadge from '../../components/tournament/playerTournamentBadge';

const TournamentLocal = () =>{
	const divRef1 = useRef<HTMLDivElement>(null); 
	const divRef2 = useRef<HTMLDivElement>(null); 
	const [Height1, setHeight1] = useState<number>(0);
	const [Height2, setHeight2] = useState<number>(0);
	const {isInTourn, setIsInTourn, Participents, currentMatch} = useTounamentLocalContext();
	const navigate = useNavigate();
	const [arr, setArr] = useState<TournParticipants>({
		"Round1":{
			"P1" : {profile_img: null,trAlias: null},
			"P2" : {profile_img: null,trAlias: null},
			"P3" : {profile_img: null,trAlias: null},
			"P4" : {profile_img: null,trAlias: null},
		},
		"Round2":{
			"P1" : {profile_img: null,trAlias: null},
			"P2" : {profile_img: null,trAlias: null},
		},
		"Final":{
			"P1" : {profile_img: null,trAlias: null},
		}
		});

	useEffect(() => {
		document.title = 'Game | Local Tournament';
		}, []);

	useEffect(()=>{
		setArr(Participents)
	},[Participents])

	useEffect(()=>{
		if(!isInTourn)
			navigate('/tounament-lobby')
	},[])

	const ExitTournament = ()=>{
		if(isInTourn){
			navigate('/tounament-lobby')
			setIsInTourn(false)
		}
	}
  
	useEffect(() => {
		const updateHeight = () => {
		  if (divRef1.current) {
			setHeight1(divRef1.current.offsetHeight);
		  }
		  if (divRef2.current) {
			setHeight2(divRef2.current.offsetHeight);
		  }
		};
	  
		window.addEventListener('resize', updateHeight);
	  
		// Call once initially to set the Height
		updateHeight();
	  
		// Cleanup the event listener on component unmount
		return () => window.removeEventListener('resize', updateHeight);
	  }, []);
	return (
		<>
			<div className="fixed 0">

			</div>
            <div className="flex flex-col  text-black dark:text-white bg-white dark:bg-black mobile:h-screen">
                <div className="  min-h-16 "></div>
                <div className="  flex mobile:flex-row flex-col-reverse flex-1 mobile:max-h-[calc(100vh-4rem)] ">
                    <div className=" mobile:w-16 w-full maxMobile:h-16   flex"></div>
                    <div className="  flex  flex-1 justify-center">
                        <div className='flex flex-col flex-1  max-w-5xl '>
                            <div className="flex justify-center text-2xl mobile:text-6xl font-bold my-5 text-center">LOCAL TOURNAMENT</div>
                            <div className="flex justify-end mobile:text-xl font-bold my-3 mr-3 cursor-pointer"  onClick={()=>{
								
									ExitTournament();
								}}>
							<Tooltip 
								className="border border-blue-gray-50 dark:bg-white bg-black px-4 py-3 shadow-xl shadow-black/10 text-black"
							content={
								<div className="w-40">
								  <Typography className="font-medium dark:text-black text-white" >
									Exit Warning:
								  </Typography>
								  <Typography
									variant="small"
									className="font-normal opacity-80 dark:text-black text-white"
								  >
									If you Exit you will LOSE.
								  </Typography>
								</div>
							}
							placement="bottom-end">
								
								<div className="flex justify-center items-center">
									Exit
								<IoIosExit  className="text-3xl"/>
								</div>
								</Tooltip>
							</div>
							<div className={`flex-1 mobile:max-h-[700px] flex flex-col mobile:max-w-[calc(100vw-4rem)] maxMobile:max-w-[100vw] `} >
								<div className={`flex-1 flex  overflow-x-scroll overflow-y-hidden snap-x snap-mandatory  max-h-[700px] mobile:m-2 p-2`}>	
									<div className="flex-1  flex flex-col snap-center ">
										{
											Object.entries(arr.Round1).map(([playerName, player])=>(
												<PlayerTournamentBadge key={playerName} Pic={player.profile_img} alias={player.trAlias} />
											))
										}
									</div>  
									<PlayersArrow  Height={Height1} num={2} />
									<div className="flex-1  flex flex-col snap-center ">
										{
											Object.entries(arr.Round2).map(([playerName, player])=>(
												<PlayerTournamentBadge key={playerName} Pic={player.profile_img} alias={player.trAlias} divRef={divRef1}/>
											))
										}
									</div>
									<PlayersArrow  Height={Height2} num={1} />
									<div className=" flex flex-col snap-center ">
										<div className="flex flex-1  items-center text-5xl m-3 ">
											<GiTrophy />
										</div>
									</div>
									<div className="flex-1  flex flex-col snap-center ">
										{
											Object.entries(arr.Final).map(([playerName, player])=>(
												<PlayerTournamentBadge key={playerName} Pic={player.profile_img} alias={player.trAlias} divRef={divRef2}/>
											))
										}
									</div>
								</div>
							</div>
							<div className='flex w-full my-5 items-center justify-center'>
								{
									currentMatch !== 'Winner' && 
									<button className="bg-black dark:bg-white font-bold h-10 w-52 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] uppercase active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type='button'  onClick={
										()=>{
											navigate('/game-tounament-local')
										}
									}>Start Next Match</button>
								}
							
							</div>
                        </div>
                    </div>
                </div>
            </div>
		</>
    );
}

export default TournamentLocal;