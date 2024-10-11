import { useState, useEffect} from 'react';
import { useGameContext } from '../../context/GameContext';
import { useTounamentLocalContext } from '../../context/TounamentLocalContext';
import { ToastContainer, toast } from 'react-toastify';
import PingPongGame from '../setting/PingPongGame';
import ColorSelect from '../setting/ColorSelect';
import { useNavigate } from 'react-router-dom';
import { axiosAuth } from '../../api/axiosAuth';
import { AxiosError } from 'axios';
import pic1 from '../../assets/pic1.jpeg'
import pic2 from '../../assets/pic2.jpeg'
import pic3 from '../../assets/pic3.jpeg'
import pic4 from '../../assets/pic4.jpeg'

type ColorOption = {
	name: string;
	color: string;
  };

const colorOptions: ColorOption[] = [
	{ name: "Pink", color: "ec4899" },
	{ name: "Purple", color: "a855f7" },
	{ name: "Blue", color: "3b82f6" },
	{ name: "Yellow", color: "ffdd38" },
	{ name: "White", color: "FFFFFF" },
  ];
const colorTable: ColorOption[] = [
	{ name: "Pink", color: "55243c" },
	{ name: "Purple", color: "2d1940" },
	{ name: "Blue", color: "354969" },
  { name: "Yellow", color: "443719" },
	{ name: "Black", color: "000000" },
  ];

const GameTournamentLobby: React.FC = () => {
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(true);
	const [ballColor, setBallColor] = useState('ff0000');
	const [paddleColor, setPaddleColor] = useState('white');
	const [tableColor, setTableColor] = useState('black');
	const [defaultBallColor, setdefaultBallColor] = useState("");
	const [defaultPaddleColor, setdefaultPaddleColor] = useState("");
	const [defaultTableColor, setdefaultTableColor] = useState("");
	const { setGameSetting} = useGameContext();
	const { P1, P2, P3, P4,setP1, setP2, setP3, setP4, isInTourn, setIsInTourn } = useTounamentLocalContext();
	const [isSuccess, setisSuccess] = useState(false);

	useEffect(()=>{
		if (isInTourn)
			navigate('/tournament_local')	
	},[])
	const fetchingGameData = async () => {
		setIsLoading(true);
		try {
			const response = await axiosAuth.get('/game/settings/');
			const result = response.data;
			setBallColor(result.ballc);
			setPaddleColor(result.paddlec);
			setTableColor(result.tablec);
			setdefaultBallColor(result.ballc);
			setdefaultPaddleColor(result.paddlec);
			setdefaultTableColor(result.tablec);
		} catch (error) {
		if (error instanceof AxiosError) {
			// console.error('Error fetching game data:', error.response?.data || error.message);
		} else {
			// console.error('An unexpected error occurred:', error);
		}
		} finally {
			setIsLoading(false);
		}
	};

	const PostGameData = async ()=>{
		setIsLoading(true);
		try {
			await axiosAuth.post(`/game/settings/`,
			{
				ballc: ballColor,
				tablec: tableColor,
				paddlec: paddleColor
			}
		);
      
      setGameSetting({
        ballColor: `#${ballColor}`,
        paddleColor: `#${paddleColor}`,
        tableColor: `#${tableColor}`,
      });
			setdefaultBallColor(ballColor)
			setdefaultPaddleColor(paddleColor)
			setdefaultTableColor(tableColor)
			setisSuccess(true);
		} catch (error) {
    //   console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
			}
			finally{
				setIsLoading(false)
			}
	}
	useEffect(()=>{
		setP1("Player1")
		setP2("Player2")
		setP3("Player3")
		setP4("Player4")
		fetchingGameData()
	},[])

	const check = () => {
		if (ballColor !== defaultBallColor || paddleColor !== defaultPaddleColor || tableColor !== defaultTableColor)
			return 1;
		return 0;
	}
	const GoPlay = async () => {
		setIsInTourn(true)
		navigate(`/tournament_local`);
	}

	const toastUP = (type:boolean, msg:string)=>{
		if (type)
			toast.success(msg,{containerId:'Colorchange'});
		else 
			toast.error(msg, {containerId:'Colorchange'});
	}
	useEffect(()=>{
		if(isSuccess){
			toastUP(true,'Colors Updated!'); 
			setisSuccess(false);
		}
	},[isSuccess])


	useEffect(() => {
		document.title = "Game | Play With A Friend";
	}, []);

  

  return (
    <>
		<div className="min-h-screen flex flex-col  text-black dark:text-white bg-white dark:bg-black">
			<div className=" min-h-16 "></div>
			<div className="flex-1 flex mobile:flex-row flex-col-reverse mobile:mr-3 mobile:mb-5">
				<div className="mobile:w-16 w-full h-16 mobile:h-full "></div>
				<div className=" flex flex-col flex-1 grow mobile:ml-2 ">
					<div className="dark:text-white mobile:m-5 maxMobile:mt-5 font-bold mobile:text-4xl text-3xl items-center text-center">Tournament Lobby</div>
					<div className="flex flex-col tablet:flex-row  justify-center">
						<div className='flex flex-1 flex-col  justify-center items-center'>
							{/* player1 */}
							<div className='flex justify-center flex-1 w-full my-1'>
								<div className={`max-w-64 w-full  rounded-2xl flex items-center gap-3 mx-5 `}>
									<div>
										<div className='size-11  rounded-full ' >
											<img src={pic1} alt="Player 2" className="size-11  rounded-full " />
										</div>
									</div>
									<div className="flex flex-1 items-center space-x-2 p-1 dark:bg-black bg-white rounded-2xl">
										<input
										className="flex-1 pl-4 rounded-xl dark:bg-black py-2 border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none"
										type="text"
										placeholder="Player 1"
										value={P1}
										onChange={(e)=>{
											setP1(e.target.value)
										}}
										required
										/>
									</div>
								</div>
							</div>
							{/* player2 */}
							<div className='flex justify-center flex-1 w-full my-1'>
								<div className={`max-w-64 w-full  rounded-2xl flex items-center gap-3 mx-5 `}>
									<div>
										<div className='size-11  rounded-full ' >
											<img src={pic2} alt="Player 2" className="size-11  rounded-full " />
										</div>
									</div>
									<div className="flex flex-1 items-center space-x-2 p-1 dark:bg-black bg-white rounded-2xl">
										<input
										className="flex-1 pl-4 rounded-xl dark:bg-black py-2 border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none"
										type="text"
										placeholder="Player 1"
										value={P2}
										onChange={(e)=>{
											setP2(e.target.value)
										}}
										required
										/>
									</div>
								</div>
							</div>
							{/* player3 */}
							<div className='flex justify-center flex-1 w-full my-1'>
								<div className={`max-w-64 w-full  rounded-2xl flex items-center gap-3 mx-5 `}>
									<div>
										<div className='size-11  rounded-full ' >
											<img src={pic3} alt="Player 2" className="size-11  rounded-full " />
										</div>
									</div>
									<div className="flex flex-1 items-center space-x-2 p-1 dark:bg-black bg-white rounded-2xl">
										<input
										className="flex-1 pl-4 rounded-xl dark:bg-black py-2 border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none"
										type="text"
										placeholder="Player 1"
										value={P3}
										onChange={(e)=>{
											setP3(e.target.value)
										}}
										required
										/>
									</div>
								</div>
							</div>
							{/* player4 */}
							<div className='flex justify-center flex-1 w-full my-1'>
								<div className={`max-w-64 w-full  rounded-2xl flex items-center gap-3 mx-5 `}>
									<div>
										<div className='size-11  rounded-full ' >
											<img src={pic4} alt="Player 2" className="size-11  rounded-full " />
										</div>
									</div>
									<div className="flex flex-1 items-center space-x-2 p-1 dark:bg-black bg-white rounded-2xl">
										<input
										className="flex-1 pl-4 rounded-xl dark:bg-black py-2 border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none"
										type="text"
										placeholder="Player 1"
										value={P4}
										onChange={(e)=>{
											setP4(e.target.value)
										}}
										required
										/>
									</div>
								</div>
							</div>
            			</div>
					</div>
          <div className='flex justify-center content-center max-h-12 my-2'>
            <button
                onClick={GoPlay}
                className={`w-52 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl `}
              >
                START TOURNAMENT
              </button>
          </div>
		  {
			!isLoading && 
			<div className="flex flex-col-reverse tablet:flex-row justify-center items-center mb-5">
				<form className="flex flex-col tablet:flex-row flex-1 items-center m-2 max-w-xl gap-2"
				onSubmit={(e)=>{e.preventDefault();
				if(check())
				PostGameData()
				}} 
				onReset={()=>{
				setBallColor(defaultBallColor);
				setTableColor(defaultTableColor);
				setPaddleColor(defaultPaddleColor);
				}}
				>
					<div className='flex flex-col flex-1'>
						<div className="flex mt-4 mb-4 flex-1 justify-center">
						<div className=" flex  flex-col gap-4">
							<ColorSelect name="Ball:" selectedColor={ballColor} setSelectedColor={setBallColor} colorOptions={colorOptions} />
							<ColorSelect name="Paddle:" selectedColor={paddleColor} setSelectedColor={setPaddleColor} colorOptions={colorOptions} />
							<ColorSelect name="Table:" selectedColor={tableColor} setSelectedColor={setTableColor} colorOptions={colorTable} />
						</div>
						</div>
						<div className="flex  gap-2 mt-2 flex-1 justify-center items-center">
							<button className="bg-black dark:bg-white  h-10 w-40 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Save</button>
						</div>	
					</div>
					<div className='flex-1 flex max-w-72 maxTablet:mt-5'>
						<PingPongGame ball={ballColor} paddle={paddleColor} table={tableColor}/>
					</div>
					<ToastContainer
					position= {"top-right"}
					autoClose={5000}
					hideProgressBar
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="colored"
					containerId='Colorchange'
			/>
				</form>
			</div>
		  }
				</div>
			</div>
		</div>
	</>
  );
};

export default GameTournamentLobby;
