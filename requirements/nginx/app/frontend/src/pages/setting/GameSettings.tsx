import { useNavbarContext } from "../../context/NavbarContext";
import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import PingPongGame from "./PingPongGame"
import ColorSelect from "./ColorSelect"
import { ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useGameContext } from "../../context/GameContext";
import { axiosAuth } from "../../api/axiosAuth";
import { AxiosError } from "axios";

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


function GameSettings() {
	const [isLoading, setIsLoading] = useState(true);
	const {isWide} = useNavbarContext();
	const [ballColor, setBallColor] = useState('ff0000');
	const [paddleColor, setPaddleColor] = useState('white');
	const [tableColor, setTableColor] = useState('black');
	const [defaultBallColor, setdefaultBallColor] = useState("");
	const [defaultPaddleColor, setdefaultPaddleColor] = useState("");
	const [defaultTableColor, setdefaultTableColor] = useState("");
	const [isSuccess, setisSuccess] = useState(false);
	const { setGameSetting } = useGameContext();

	useEffect(() => {
		document.title = "Settings | Game";
	}, []);

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
			// console.error('Error fetching game settings:', error.response?.data || error.message);
			} else {
			// console.error('An unexpected error occurred:', error);
			}
		} finally {
			setIsLoading(false);
		}
		};
		
		const toastUP = (type: boolean, msg: string) => {
		if (type) {
			toast.success(msg, { containerId: 'Colorchange' });
		} else {
			toast.error(msg, { containerId: 'Colorchange' });
		}
		};
		
		const PostGameData = async () => {
		setIsLoading(true);
		try {
			await axiosAuth.post('/game/settings/', {
			ballc: ballColor,
			tablec: tableColor,
			paddlec: paddleColor
			});
		
			setGameSetting({
			ballColor: `#${ballColor}`,
			paddleColor: `#${paddleColor}`,
			tableColor: `#${tableColor}`,
			});
			setdefaultBallColor(ballColor);
			setdefaultPaddleColor(paddleColor);
			setdefaultTableColor(tableColor);
			setisSuccess(true);
			toastUP(true, 'Game settings updated successfully!');
		} catch (error) {
			if (error instanceof AxiosError) {
			// console.error('Error posting game settings:', error.response?.data || error.message);
			} else {
			// console.error('An unexpected error occurred:', error);
			}
			toastUP(false, 'Failed to update game settings. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(()=>{
		fetchingGameData()
	},[])
	useEffect(()=>{
		if(isSuccess){
			toastUP(true,'Colors Updated!'); 
			setisSuccess(false);
		}
	},[isSuccess])

	const check = () => {
		if (ballColor !== defaultBallColor || paddleColor !== defaultPaddleColor || tableColor !== defaultTableColor)
			return 1;
		return 0;
	}
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
			</div>
		);
	}
	return ( 
		<>
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
			<form className="shrink mx-5	flex flex-col w-full items-center mt-5 max-w-96 pb-5"
			onSubmit={(e)=>{e.preventDefault();
				if(check())
				PostGameData()
			}} 
			onReset={()=>{
				toastUP(true, "yessss")
				setBallColor(defaultBallColor);
				setTableColor(defaultTableColor);
				setPaddleColor(defaultPaddleColor);
			}}
			>
				{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center mb-5">Ping Pong Settings</div>}
				<PingPongGame ball={ballColor} paddle={paddleColor} table={tableColor}/>
				<div className="flex mt-4 mb-4 w-full justify-center">
					<div className=" flex  flex-col gap-4">
						<ColorSelect name="Ball:" selectedColor={ballColor} setSelectedColor={setBallColor} colorOptions={colorOptions} />
						<ColorSelect name="Paddle:" selectedColor={paddleColor} setSelectedColor={setPaddleColor} colorOptions={colorOptions} />
						<ColorSelect name="Table:" selectedColor={tableColor} setSelectedColor={setTableColor} colorOptions={colorTable} />

					</div>
					
					{/* <button className="h-5 w-10 bg-white"></button> */}
				</div>
				<div className="flex  gap-2 mt-2 w-full justify-end items-center">
						<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Discard</button>
						<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Save</button>
				</div>
			</form>
				</>
			
	);
}

export default GameSettings;