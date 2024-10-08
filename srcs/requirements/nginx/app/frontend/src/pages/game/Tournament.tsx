
import  { useRef, useEffect, useState } from 'react';
import PlayerBadge from "../../components/tournament/playerBadge";
import { GiTrophy } from "react-icons/gi";
import { IoIosExit } from "react-icons/io";
import { Tooltip, Typography } from "@material-tailwind/react";
import { TournParticipants, useTounamentContext} from "../../context/TounamentContext";
import { useNavigate } from "react-router-dom";
import PlayersArrow from "../../components/tournament/playersArrow";
import { axiosAuth } from '../../api/axiosAuth';
import { port, wsHost } from '../../config';

const Tournament = () =>{
	const divRef = useRef<HTMLDivElement>(null);
	const divRef1 = useRef<HTMLDivElement>(null); 
	const divRef2 = useRef<HTMLDivElement>(null); 
	const [Height, setHeight] = useState<number>(0);
	const [Height1, setHeight1] = useState<number>(0);
	const [Height2, setHeight2] = useState<number>(0);
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [isOnTourn, setisOntourn] = useState(false);
	const [isRefrech, setRefrech] = useState(false);
	const [tournId, setTournId] = useState();
	const {Type, setTournamentSocket, Participents, setCloseSocket, socketclose} = useTounamentContext();
	const [arr, setArr] = useState<TournParticipants>({
		"Round1":{
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P2" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P3" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P4" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P5" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P6" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P7" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P8" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		},
		"Round2":{
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P2" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P3" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P4" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		},
		"Round3":{
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P2" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		},
		"Final":{
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		}
		});

		useEffect(() => {
			document.title = 'Game | Tournament';
		  }, []);
	
	const checkisInTournament = async ()=>{
		setIsLoading(true);
		try {
			const response = await axiosAuth.get(`/game/tr/`);
		
			const result = response.data;
			setisOntourn(result.isParticipant);
			setTournId(result.tournamentId)
		} catch (error:any) {
				// console.error('Error:', error.message);
			}
			finally{
				setRefrech(!isRefrech);
				setIsLoading(false)
			}
	}
	const ExitTournament = async ()=>{
		setIsLoading(true);
		try {
			await axiosAuth.post(`/game/exit/`,
				{
					trID: tournId 
				}
			);
		} catch (error:any) {
				// console.error('Error:', error.message);
			}
			finally{
				setCloseSocket(!socketclose);
				navigate("/game");
				setIsLoading(false)
			}
	}

	useEffect(()=>{
		checkisInTournament();
	},[])

	useEffect(()=>{
		if(!isOnTourn && !isLoading)
			navigate("/game");
		if(isOnTourn && !isLoading){
			const socket = new WebSocket(`ws://${wsHost}:${port}/ws/tr/${tournId}/?token=${localStorage.getItem('access')}`);
			
			socket.onopen = () => {
			setTournamentSocket(socket);
			const msg = JSON.stringify({
				action: 'join',
			});
			
			socket.send(msg);
		}
		}
	},[isRefrech])


	useEffect(()=>{
		if (Participents)
			setArr(Participents)

	},[Participents])

  
	useEffect(() => {
		const updateHeight = () => {
		  if (divRef.current) {
			setHeight(divRef.current.offsetHeight);
		  }
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
                        <div className='flex flex-col flex-1  max-w-5xl gap-5 '>
                            <div className="flex justify-center mobile:text-6xl font-bold my-5 ">TOURNAMENT</div>
                            <div className="flex justify-end mobile:text-xl font-bold my-5 mr-5 cursor-pointer"  onClick={()=>{
								if(tournId)
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
							<div className={`flex-1 flex flex-col mobile:max-w-[calc(100vw-4rem)] maxMobile:max-w-[100vw] `} >
								<div className={`flex-1 flex  overflow-x-scroll overflow-y-hidden snap-x snap-mandatory  max-h-[700px] mobile:p-5 mobile:m-2 p-2`}  >
									{
										Type == 8 && 
										<>
										<div className="flex-1  flex flex-col snap-center ">
											{
												Object.entries(arr.Round1).map(([playerName, player])=>(
													<PlayerBadge  key={playerName} Pic={player.profile_img} alias={player.trAlias}/>
												))
											}
										</div>
										<PlayersArrow  Height={Height} num={4} />
										</>

									}	
									<div className="flex-1  flex flex-col snap-center ">
										{
											Object.entries(arr.Round2).map(([playerName, player])=>(
												<PlayerBadge key={playerName} Pic={player.profile_img} alias={player.trAlias} divRef={divRef}/>
											))
										}
									</div>  
									<PlayersArrow  Height={Height1} num={2} />
									<div className="flex-1  flex flex-col snap-center ">
										{
											Object.entries(arr.Round3).map(([playerName, player])=>(
												<PlayerBadge key={playerName} Pic={player.profile_img} alias={player.trAlias} divRef={divRef1}/>
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
												<PlayerBadge key={playerName} Pic={player.profile_img} alias={player.trAlias} divRef={divRef2}/>
											))
										}
									</div>
								</div>
							</div>
                        </div>
                    </div>
                </div>
            </div>
		</>
    );
}

export default Tournament;