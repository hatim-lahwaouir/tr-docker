import { useState, useEffect} from 'react';
import { useGameContext } from '../../context/GameContext';
import vs_black from "../../assets/vs_black.png"
import vs_white from "../../assets/vs_white.png"
import { ToastContainer, toast } from 'react-toastify';
import PingPongGame from '../setting/PingPongGame';
import ColorSelect from '../setting/ColorSelect';
import { useNavigate } from 'react-router-dom';
import { useNavbarContext } from '../../context/NavbarContext';
import { axiosAuth } from '../../api/axiosAuth';
import { AxiosError } from 'axios';
import player1pic from '../../assets/player1.png'
import player2pic from '../../assets/player2.png'

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

const GamePlayerLobby: React.FC = () => {
    const barInfo = useNavbarContext();
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(true);
	const [ballColor, setBallColor] = useState('ff0000');
	const [paddleColor, setPaddleColor] = useState('white');
	const [tableColor, setTableColor] = useState('black');
	const [defaultBallColor, setdefaultBallColor] = useState("");
	const [defaultPaddleColor, setdefaultPaddleColor] = useState("");
	const [defaultTableColor, setdefaultTableColor] = useState("");
  const { setGameSetting, setPlayer1, setPlayer2, Player1, Player2 } = useGameContext();
  const [isSuccess, setisSuccess] = useState(false);

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
		setPlayer1("Player1")
		setPlayer2("Player2")
		fetchingGameData()
	},[])

	const check = () => {
		if (ballColor !== defaultBallColor || paddleColor !== defaultPaddleColor || tableColor !== defaultTableColor)
			return 1;
		return 0;
	}
	const GoPlay = async () => {
		navigate(`/game-local`);
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
				<div className="mobile:w-16 w-full h-16 mobile:h-full bg-yellow-300 "></div>
				<div className=" flex flex-col flex-1 grow mobile:ml-2 ">
					<div className="dark:text-white mobile:m-5 maxMobile:mt-5 font-bold mobile:text-4xl text-3xl items-center text-center">PLAY WITH A FRIEND</div>
					<div className="flex flex-col tablet:flex-row  justify-center">
						<div className='flex flex-1 flex-col tablet:flex-row mobile:max-w-xl justify-center items-center'>
            <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
                  <div className={`max-w-72 w-full  tablet:min-h-[250px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-3 mx-5 `}>
                    <div className=''>
                      <div className='tablet:size-20 size-14  rounded-full ' >
                      <img src={player1pic} alt="Player 2" className="tablet:size-20 size-14  rounded-full " />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 p-1 dark:bg-black bg-white rounded-2xl">
                        <input
                          className="flex-1 pl-4 rounded-xl dark:bg-black py-2 border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none"
                          type="text"
                          placeholder="Player 1"
						  value={Player1}
						  onChange={(e)=>{
							setPlayer1(e.target.value)
						  }}
						  required
                        />
                      </div>
                      
                    </div>
                  </div>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-center text-center items-center w-20 '>
                  <img src={!barInfo.isDark ? vs_black : vs_white } className='tablet:w-16 w-10 ' />
              </div>
              </div>
              <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
                  <div className={`max-w-72 w-full  tablet:min-h-[250px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-3 mx-5 `}>
                    <div className=''>
                      <div className='tablet:size-20 size-14  rounded-full ' >
                      <img src={player2pic} alt="Player 2" className="tablet:size-20 size-14  rounded-full " />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 p-1 dark:bg-black bg-white rounded-2xl">
                        <input
                          className="flex-1 pl-4 rounded-xl dark:bg-black py-2 border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none"
                          type="text"
                          placeholder="Player 2"
						  value={Player2}
						  onChange={(e)=>{
							setPlayer2(e.target.value)
						  }}
						  required
                        />
                      </div>
                      
                    </div>
                  </div>
              </div>
            </div>
					</div>
          <div className='flex justify-center content-center max-h-12 maxTablet:my-2'>
            <button
                onClick={GoPlay}
                className={`w-[180px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl `}
              >
                START GAME
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

export default GamePlayerLobby;
