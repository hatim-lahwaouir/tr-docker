import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useNavbarContext } from '../../context/NavbarContext';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { useCookies } from 'react-cookie';
import vs_black from "../../assets/vs_black.png"
import vs_white from "../../assets/vs_white.png"
import { ToastContainer, toast } from 'react-toastify';
import PingPongGame from '../setting/PingPongGame';
import ColorSelect from '../setting/ColorSelect';
import { axiosAuth } from '../../api/axiosAuth';
import { port, theHost } from '../../config';
import WinnerModal from '../../components/game/WinnerModal';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  profile_img?: string;
  level: string;
}

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

const GameLobby: React.FC = () => {
  const { isDark} = useNavbarContext();
  const {
    player, 
    opponent, 
    inviteToGame, 
    setOpponent,
    playerStatus,
    opponentStatus,
    setPlayerStatus,
    setOpponentStatus,
    setGameReady,
    bothAccepted,
    isOpponent,
    gameId,
    gameSocket,
    setIsOpponent,
    setPlayer,
    setWinner,
    winner,
  } = useGameContext();
  const { lastMessage } = useWebSocketContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cookies] = useCookies(['userData']);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  

  const getOpponentStatus = async () => {
    try {
      const response = await axiosAuth.get(`game/playerStatus/${opponent?.id}`);

      if (response.data.status)
      setOpponentStatus('ready');
      else
      setOpponentStatus('not ready');
  
    } catch (error) {
      setOpponentStatus('not ready');
      }

  };

  useEffect(() => {
		document.title = 'Game | Invite A Friend';
    
	}, []);

  useEffect(() => {
	if (opponent)
      getOpponentStatus();
	}, [opponent]);

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'game_Invite') {
        switch (data.status) {
          case 'acceptGameInvite':
            setTimer(30);
            setOpponent(data.sender);
            break;
        }
      }
    }
  }, [lastMessage, setOpponent, opponent, setOpponentStatus]);

  useEffect(() => {
    const searchFriends = async () => {
      if (searchTerm) {
        setIsSearching(true);
        try {
          const response = await axiosAuth.get(`/user/get-friends/${searchTerm}`);
          const data = response.data;
          setSearchResults(data.friends || []);
        } catch (error) {
          // console.error('Error searching friends:', error);
          setSearchResults([]);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchFriends, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeWinnerModal = useCallback((inTournament: boolean) => {
    setIsOpponent(false);
    setPlayer(cookies.userData);
    setPlayerStatus('not ready');
    setOpponent(null);
    setOpponentStatus('not ready');
    
    setWinner(null);
    setShowWinnerModal(false);
    
    if (inTournament) {
      navigate('/tournament');
    } else {
      navigate('/game-lobby/0');
    }
  }, [navigate, setWinner, setOpponent]);

  useEffect(() => {
    if (gameSocket) {
      gameSocket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data as string);

       if (data.status === 'userDisconnected') {
        const msg = JSON.stringify({
          action: 'setWinner',
          id: gameId,
          winner: isOpponent ? opponent?.id : player?.id,
        });
        
        gameSocket?.send(msg);
       }
       else if (data.status === 'gameFinished') {
          
          setWinner(data.winner);
          setShowWinnerModal(true);

            const msg = JSON.stringify({
              action: 'disconnect',
            });
            gameSocket.send(msg);
          }
          else if (data.status === 'disconneted') {
            
            setIsTimerRunning(false);
            setWinner(data.winner);
            setShowWinnerModal(true);
          }
      };
    }

    return () => {
      if (gameSocket) {
        gameSocket.onmessage = null;
      }
    };
  }, [gameSocket]);

  const checkIsInTournament = async (id: string) => {
    try {
      const response = await axiosAuth.get(`/game/checkTr/${id}`);
      const result = response.data;
      return result.isParticipant;
    } catch (error) {
      // console.error('Error:', error);
      return false;
    }
  };
  const checkIsInGame = async (id: string) => {
    try {
      const response = await axiosAuth.get(`/game/isInGame/${id}`);
      const result = response.data;
      return result.isInGame;
    } catch (error) {
      // console.error('Error:', error);
      return false;
    }
  };

  const handleInvite = async (selectedOpponent: User) => {
    const isInTournament = await checkIsInTournament(selectedOpponent.id);
    const isInGameP = await checkIsInGame(cookies.userData.id);
    const isInGameO = await checkIsInGame(selectedOpponent.id);
    if (isInTournament) {
      toast.warn("You can't invite players while in a tournament.");
      return;
    }
    if (isInGameP || isInGameO) {
      toast.warn("You can't invite players while in a game.");
      return;
    }
    
    inviteToGame(selectedOpponent);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };


	const [ballColor, setBallColor] = useState('ff0000');
	const [paddleColor, setPaddleColor] = useState('white');
	const [tableColor, setTableColor] = useState('black');
	const [defaultBallColor, setdefaultBallColor] = useState("");
	const [defaultPaddleColor, setdefaultPaddleColor] = useState("");
	const [defaultTableColor, setdefaultTableColor] = useState("");
  const { setGameSetting } = useGameContext();
  const [isSuccess, setisSuccess] = useState(false);


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

	const fetchingGameData = async ()=>{
		try {
			const response = await axiosAuth.get(`/game/settings/`);
			
			const result = response.data;
			setBallColor(result.ballc)
			setPaddleColor(result.paddlec)
			setTableColor(result.tablec)
			setdefaultBallColor(result.ballc)
			setdefaultPaddleColor(result.paddlec)
			setdefaultTableColor(result.tablec)
			
		} catch (error) {
      // console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
			}
			finally{}
	}

	const PostGameData = async () => {
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
  
      // If the request was successful, update the default colors and set success state
      setdefaultBallColor(ballColor);
      setdefaultPaddleColor(paddleColor);
      setdefaultTableColor(tableColor);
      setisSuccess(true);
  
    } catch (error) {
      // console.error('Error posting game data:', error);
    }
  };
  
	useEffect(()=>{
		fetchingGameData()
	},[]);


  useEffect(() => {
    const checkPlayers = async () => {
      try {
        if (isOpponent) {
          if (opponent && player) {
            const isInGameP = await checkIsInGame(player.id);
            
            if (!isInGameP) {
              const msg2 = JSON.stringify({
                action: 'setWinner',
                id: gameId,
                winner: opponent.id,
              });
              
              gameSocket?.send(msg2);
            }
          }
        }
        else if (player && opponent) {
          const isInGameO = await checkIsInGame(opponent.id);
          if (!isInGameO) {
            const msg2 = JSON.stringify({
              action: 'setWinner',
              id: gameId,
              winner: player.id,
            });
            
            gameSocket?.send(msg2);
          }
        }
      } catch (error) {
        // console.error("Error checking tournament status:", error);
      }
    };
  
    if (player && opponent && timer < 2)
      checkPlayers();
  }, [playerStatus, opponentStatus, timer]);

	const check = () => {
		if (ballColor !== defaultBallColor || paddleColor !== defaultPaddleColor || tableColor !== defaultTableColor)
			return 1;
		return 0;
	}

  useEffect(() => {
    if (player && opponent && bothAccepted && !isTimerRunning) {
      setTimer(30);
      setIsTimerRunning(true);
    }
    else if ((!player || !opponent) && isTimerRunning) {
      setTimer(30);
      setIsTimerRunning(false);
    }
  }, [player, opponent]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      handleAutoReady();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timer]);

  const handleReady = async () => {
    if (player && player.id === cookies.userData.id) {
      setGameReady(player.id);
    } else if (opponent && opponent.id === cookies.userData.id) {
      setGameReady(opponent.id);
    }
  };
  
  const handleAutoReady = () => {
    if (player && !isOpponent) {
      setGameReady(player.id);
      setPlayerStatus('ready');
    }
    else if (opponent && isOpponent) {
      setGameReady(opponent.id);
      setOpponentStatus('ready');
    }
    setIsTimerRunning(false);
  };

  return (
    <>
		<div className="min-h-screen flex flex-col  text-black dark:text-white bg-white dark:bg-black">
			<div className=" min-h-16 "></div>
			<div className="flex-1 flex mobile:flex-row flex-col-reverse mobile:mr-3 mobile:mb-5">
				<div className="mobile:w-16 w-full h-16 mobile:h-full   "></div>
				<div className=" flex flex-col flex-1 grow mobile:ml-2 ">
					<div className="dark:text-white mobile:m-5 maxMobile:mt-5 font-bold mobile:text-4xl text-3xl items-center text-center">INVITE A FRIEND</div>
					<div className="flex flex-col-reverse tablet:flex-row  justify-center">
						<div className='flex flex-1 flex-col-reverse tablet:flex-row mobile:max-w-xl justify-center items-center'>
              <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
              <div className={`max-w-72 w-full  tablet:min-h-[300px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-3 mx-5`}>
                      {player?.profile_img && (
                        <img src={`${theHost}:${port}${player.profile_img}`} alt={player.username} className="tablet:size-20 size-14  rounded-full " />
                      )}
                      <div className="text-center font-bold">{player?.username || 'Waiting for player...'}</div>
                      <div className={`text-center maxTablet:flex-1 flex justify-end maxTablet:mr-5 ${playerStatus === 'ready' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {playerStatus}
                      </div>
                    </div>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-center text-center items-center w-20 '>
                  <img src={!isDark ? vs_black : vs_white } className='tablet:w-16 w-10 ' />
              </div>
                {isTimerRunning && (
                  <div className="flex justify-center text-center items-center mt-2 text-xl font-bold">{timer}s</div>
                )}
              </div>
              <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
              { opponent ? (
                      <div className={`max-w-72 w-full  tablet:min-h-[300px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-3 mx-5`}>
                      {opponent?.profile_img && (
                        <img src={`${theHost}:${port}${opponent.profile_img}`} alt={opponent.username} className="tablet:size-20 size-14 rounded-full " />
                      )}
                      <p className="text-center font-bold">{opponent?.username || 'Waiting for player...'}</p>
                      <p className={`text-center maxTablet:flex-1 flex justify-end maxTablet:mr-5 ${opponentStatus === 'ready' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {opponentStatus}
                      </p>
                    </div>
                    
                    ) : (
                      <div className={`max-w-72 w-full  tablet:min-h-[300px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-3 mx-5 `}>
                        <div className=''>
                          <div className='tablet:size-20 size-14  rounded-full mx-auto mb-2 animate-pulse bg-[#9a9a9a] dark:bg-[#222222]' ></div>
                        </div>
                        <div className="w-32 h-5 rounded-lg bg-[#9a9a9a] dark:bg-[#222222] maxTablet:hidden"></div>
                        <div className="relative" ref={dropdownRef}>
                          <div className="flex items-center space-x-2 p-1 dark:bg-black bg-white rounded-2xl">
                            <input
                              className="flex-1 pl-4 rounded-xl dark:bg-black py-2 border dark:border-[#292929] border-gray-300 focus:border-zinc-700 outline-none"
                              type="text"
                              placeholder="Search in friends"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onFocus={() => setIsDropdownOpen(true)}
                            />
                          </div>
                          {isDropdownOpen && (
                            <div className="absolute left-0 right-0 bg-white dark:bg-black shadow-lg rounded-xl z-10 max-h-24 overflow-y-auto">
                              {searchTerm.length === 0 ? (
                                <div className="px-4 py-2 text-gray-500">Start typing to search...</div>
                              ) : isSearching ? (
                                <div className="px-4 py-2 text-gray-500">Searching...</div>
                              ) : searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                  <div key={result.id}
                                    className="px-4 py-2 hover:bg-gray-100 hover:rounded-xl dark:hover:bg-[#191919] dark:text-white flex items-center justify-between"
                                    onClick={() => handleInvite(result)}>
                                    <div className="flex items-center">
                                      {result.username}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-500">No results found</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
              </div>
            </div>
					</div>
          <div className='flex justify-center content-center max-h-12 maxTablet:my-2'>
            <button
                onClick={handleReady}
                className={`w-[180px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl ${!(player?.id === cookies.userData.id || opponent?.id === cookies.userData.id) && 'opacity-50 cursor-not-allowed'}`}
                disabled={!(player?.id === cookies.userData.id || opponent?.id === cookies.userData.id)}
              >
                Ready
              </button>
          </div>
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
				</div>
			</div>
		</div>
    {showWinnerModal && winner && (
        <WinnerModal
          winner={winner}
          onClose={closeWinnerModal}
          inTournament={winner.isInTournament}
        />
     )}
	</>
  );
};

export default GameLobby;
