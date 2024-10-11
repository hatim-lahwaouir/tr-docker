import { useState, useEffect, useCallback } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import Countdown from "./Countdown";
import { useNavbarContext } from "../../../context/NavbarContext";
import vs_black from "../../../assets/vs_black.png";
import vs_white from "../../../assets/vs_white.png";
import { port, theHost, wsHost } from "../../../config";
import useWebSocket from "react-use-websocket";
import { useRockPaperScissors } from '../../../context/RockPaperScissorsContext';
import { axiosAuth } from '../../../api/axiosAuth';

import RockIcon from '../../../assets/rock.svg';
import ScissorsIcon from '../../../assets/scissors.svg';
import PaperIcon from '../../../assets/paper.svg';

import RockIcon2 from '../../../assets/rock.png';
import ScissorsIcon2 from '../../../assets/scissors.png';
import PaperIcon2 from '../../../assets/paper.png';

import RockIcon3 from '../../../assets/rock2.png';
import ScissorsIcon3 from '../../../assets/scissors2.png';
import PaperIcon3 from '../../../assets/paper2.png';
import { toast } from 'react-toastify';



interface Opponent {
  profile_img: string;
  username: string;
  full_name: string;
}

const WaitingRoom: React.FC = () => {
    const { isDark } = useNavbarContext();
    const [cookies] = useCookies(['userData']);
    const userToken = localStorage.getItem('access');
    const navigate = useNavigate();

    const [opponent, setOpponent] = useState<Opponent | null>(null);
    const [timerStarted, setTimerStarted] = useState(false);
    const { setGameId, gameId, setGameQueueSocket } = useRockPaperScissors();

    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // const [wsReady, setWsReady] = useState(false);

    // Connect to the game queue WebSocket
    const WS_URL_QUEUE = `wss://${wsHost}:${port}/ws/sGameQ/?token=${userToken}`;
    const { 
        lastMessage: lastQueueMessage, 
        getWebSocket: getQueueWebSocket,
        readyState,
    } = useWebSocket(WS_URL_QUEUE, {
        onOpen: () => {
            // console.log('WebSocket connected');
            // setWsReady(true);
        },
        onError: () => {
            // console.error('WebSocket error:', event);
            // setWsReady(false);
        },
        onClose: (event) => {
            // console.log(event.code === 1006);
            if (event.code === 1006) {   
                toast.warn("You are already in the queue.");
                navigate('/games');
            }
            // console.log('WebSocket disconnected');
            // setWsReady(false);
        },
    });

    // Set the queue WebSocket in context when it's ready
    useEffect(() => {
        if (readyState === 1) {
            // console.log('Setting the QueueSocket to the context');
            const socket = getQueueWebSocket();
            if (socket) {
                setGameQueueSocket(socket as WebSocket);
            } else {
                // console.error('getQueueWebSocket did not return a valid WebSocket object');
            }
        }
    }, [readyState, getQueueWebSocket, setGameQueueSocket]);

    // Handle messages from the queue WebSocket
    useEffect(() => {
        if (lastQueueMessage !== null) {
            try {
                const data = JSON.parse(lastQueueMessage.data);
                if (data.type === "game.id") {
                    setGameId(data.gameId);
                    setOpponent(data.op);
                    setTimerStarted(true);
                }
            } catch (error) {
                // console.error("Error parsing WebSocket message:", error);
            }
        }
    }, [lastQueueMessage, setGameId]);

    // Redirect to the game page once the countdown finishes
    const handleTimerComplete = () => {
        if (gameId) {
            // console.log('redirecting to Second game');
            navigate(`/SecondGame`, { state: { gameId } });
        }
    };

    const getOption = useCallback(async () => {
        try {
            const response = await axiosAuth.get(`sgame/get-option/`);
            const result = response.data;
            setSelectedOption(result.game_option);
        } catch (error) {
            // console.error('Error getting game option:', error);
        }
    }, []);

    useEffect(() => {
        getOption();
    }, [getOption]);

    const handleOptionChange = async (option: number) => {
        setSelectedOption(option);
        try {
            await axiosAuth.post('sgame/set-option/', {
                option: option,
            });
        } catch (error) {
            // console.error('Error posting game data:', error);
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col text-black dark:text-white bg-white dark:bg-black">
                <div className="min-h-16"></div>
                <div className="flex-1 flex mobile:flex-row flex-col-reverse mobile:mr-3 mobile:mb-5">
                    <div className="mobile:w-16 w-full h-16 mobile:h-full"></div>
                    <div className="flex flex-col flex-1 grow mobile:ml-2">
                        <div className="dark:text-white mobile:m-5 maxMobile:mt-5 font-bold mobile:text-4xl text-3xl items-center text-center">
                            {timerStarted ? "MATCH FOUND" : "MATCH MAKING"}
                        </div>
                        <div className="flex flex-col-reverse tablet:flex-row justify-center items-center">
                            <div className='flex flex-1 flex-col-reverse tablet:flex-row mobile:max-w-xl justify-center items-center'>
                                <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
                                    <div className={`max-w-72 w-full tablet:min-h-[300px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-6 mx-5`}>
                                        {cookies.userData && (
                                            <img src={`${theHost}:${port}${cookies.userData.profile_img}`} alt={cookies.userData.username} className="tablet:size-20 size-14 rounded-full" />
                                        )}
                                        <div className="text-center text-lg text-black dark:text-white font-bold">{`${cookies.userData.full_name}`}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-4 items-center justify-center'>
                                    <div className='flex justify-center text-center items-center w-20'>
                                        <img src={!isDark ? vs_black : vs_white} className='tablet:w-12 w-9' alt="VS" />
                                    </div>
                                    {timerStarted && <Countdown seconds={3} onComplete={handleTimerComplete} />}
                                </div>
                                <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
                                    <div className={`max-w-72 w-full tablet:min-h-[300px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-6 mx-5`}>
                                        {opponent ? (
                                            <>
                                                <img src={`${theHost}:${port}${opponent.profile_img}`} alt={opponent.username} className="tablet:size-20 size-14 rounded-full" />
                                                <div className="text-center text-lg text-black dark:text-white font-bold">{opponent.full_name}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="animate-spin rounded-full tablet:size-20 size-14 border-t-2 border-b-2 border-black dark:border-white"></div>
                                                <h2 className="text-lg">Waiting for opponent...</h2>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Settings o lhamaq*/}
                        <div className='flex-grow flex flex-col gap-4 h-full'>
                            <div className='text-xl text-center dark:text-white text-black'>Make your choice</div>

                            {/* option 1 */}
                            <div className='flex gap-4 justify-center items-center'>
                                <input
                                    type="radio"
                                    id="option1"
                                    name="choice"
                                    value="1"
                                    checked={selectedOption == 1}
                                    onChange={() => handleOptionChange(1)}
                                    className="form-radio h-5 w-5 text-black focus:ring-black border-black"
                                />
                                <label htmlFor="option1" className='flex gap-4'>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={RockIcon} alt={'Rock choice'} className="w-16 h-16" />
                                    </div>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={PaperIcon} alt={'Paper choice'} className="w-16 h-16" />
                                    </div>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={ScissorsIcon} alt={'Scissors choice'} className="w-16 h-16" />
                                    </div>
                                </label>
                            </div>

                            {/* option 2 */}
                            <div className='flex gap-4 justify-center items-center'>
                                <input
                                    type="radio"
                                    id="option2"
                                    name="choice"
                                    value="2"
                                    checked={selectedOption == 2}
                                    onChange={() => handleOptionChange(2)}
                                    className="form-radio h-5 w-5 text-black focus:ring-black border-black"
                                />
                                <label htmlFor="option2" className='flex gap-4'>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={RockIcon2} alt={'Rock choice'} className="w-16 h-16" />
                                    </div>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={PaperIcon2} alt={'Paper choice'} className="w-16 h-16" />
                                    </div>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={ScissorsIcon2} alt={'Scissors choice'} className="w-16 h-16" />
                                    </div>
                                </label>
                            </div>

                            {/* option 3 */}
                            <div className='flex gap-4 justify-center items-center'>
                                <input
                                    type="radio"
                                    id="option3"
                                    name="choice"
                                    value="2"
                                    checked={selectedOption == 3}
                                    onChange={() => handleOptionChange(3)}
                                    className="form-radio h-5 w-5 text-black focus:ring-black border-black"
                                />
                                <label htmlFor="option2" className='flex gap-4'>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={RockIcon3} alt={'Rock choice'} className="w-16 h-16" />
                                    </div>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={PaperIcon3} alt={'Paper choice'} className="w-16 h-16" />
                                    </div>
                                    <div className='border-2 dark:border-white border-black max-w-[70px]'>
                                        <img src={ScissorsIcon3} alt={'Scissors choice'} className="w-16 h-16" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WaitingRoom;