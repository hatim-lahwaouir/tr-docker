import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer, ToastContentProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWebSocketContext } from './WebSocketContext';
import { axiosAuth } from '../api/axiosAuth';
import { port, theHost, wsHost } from '../config';

interface User {
  id: string;
  username: string;
  email: string;
  profile_img?: string;
  level: string;
}

interface GameSetting {
  ballColor: string;
  tableColor: string;
  paddleColor: string;
}

interface Winner {
  username: string;
  isInTournament: boolean;
}

type PlayerStatus = 'waiting' | 'not ready' | 'ready' | 'active' | null;

interface GameContextProps {
  player: User | null;
  opponent: User | null;
  playerStatus: PlayerStatus;
  opponentStatus: PlayerStatus;
  inviteToGame: (player: User) => void;
  acceptGameInvite: (player: User) => Promise<void>;
  declineGameInvite: (sender: User) => void;
  setGameReady: (senderId: string) => void;
  setOpponent: React.Dispatch<React.SetStateAction<User | null>>;
  setPlayer: React.Dispatch<React.SetStateAction<User | null>>;
  setPlayerStatus: React.Dispatch<React.SetStateAction<PlayerStatus>>;
  setOpponentStatus: React.Dispatch<React.SetStateAction<PlayerStatus>>;
  gameSocket: WebSocket | null;
  setGameSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  isOpponent: boolean;
  setIsOpponent: React.Dispatch<React.SetStateAction<boolean>>;
  setGameId: React.Dispatch<React.SetStateAction<string | null>>;
  gameId: string | null;
  winner: Winner | null;
  setWinner: React.Dispatch<React.SetStateAction<Winner | null>>;
  gameSetting: GameSetting | null;
  setGameSetting: React.Dispatch<React.SetStateAction<GameSetting | null>>;
  bothAccepted: boolean;
  setBothAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  Player1 :string;
  Player2 :string;
  setPlayer1: (value: string) => void;
  setPlayer2: (value: string) => void;
  showWinnerModal: boolean;
  setShowWinnerModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cookies] = useCookies(['userData']);
  const navigate = useNavigate();
  const { sendMessage, lastMessage } = useWebSocketContext();

  const [gameId, setGameId] = useState<string | null>(null);
  const [player, setPlayer] = useState<User | null>(null);
  const [opponent, setOpponent] = useState<User | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('not ready');
  const [opponentStatus, setOpponentStatus] = useState<PlayerStatus>('not ready');
  const [gameSocket, setGameSocket] = useState<WebSocket | null>(null);
  const [isOpponent, setIsOpponent] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [gameSetting, setGameSetting] = useState<GameSetting | null>(null);
  const [bothAccepted, setBothAccepted] = useState(false);
  const [Player1, setPlayer1] = useState<string>("Player1");
  const [Player2, setPlayer2] = useState<string>("Player2");
  const userToken = localStorage.getItem('access');
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  const getGameSetting = async (): Promise<void> => {
    try {
      const response = await axiosAuth.get(`/game/settings/`);
      const result = response.data;
      
      setGameSetting({
        ballColor: `#${result.ballc}`,
        paddleColor: `#${result.paddlec}`,
        tableColor: `#${result.tablec}`,
      });
      
    } catch (error) {
      // console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    void getGameSetting();
  }, []);


  useEffect(() => {
    if (cookies.userData) {
              //!here cookies
      setPlayer(cookies.userData);
      setPlayerStatus('not ready');
    }
  }, [cookies.userData]);


  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);

      if (data.type === 'game.invite') {
        switch (data.status) {
          case 'send':
            if (data.receiver.username === cookies.userData.username) {
              if (!data.receiver.isInTournament) {
                showGameInviteToast(data.sender);
              }
            }
            break;
            case 'accept':
              setShowWinnerModal(false);
              if (data.receiver.id === player?.id || data.sender.id === cookies.userData.id) {
                
                //!here accept
                setOpponent(data.receiver);
                setPlayer(data.sender);
                setPlayerStatus('not ready');
                setOpponentStatus('not ready');
                setBothAccepted(true);
                setGameId(data.gameId.toString());

                // Connect to the game-specific WebSocket
                const socket = new WebSocket(`wss://${wsHost}:${port}/ws/game/${data.gameId}/?token=${userToken}`);
                
                socket.onopen = () => {
                  setGameSocket(socket);
                };

                socket.onclose = () => {
                  setGameSocket(null);
                };

                socket.onerror = () => {
                  // console.error('Game WebSocket error:', error);
                };

                navigate(`/game-lobby/${data.gameId}`);
              }
            break;
          case 'decline':
            setOpponent(null);
            break;
          default:
        }
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (gameSocket) {
      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        switch (data.status) {
          case 'playerReady':
            if (data.sender.id === opponent?.id) {
              setOpponentStatus('ready');
            } else if (data.sender.id  === player?.id) {
              setPlayerStatus('ready');
            }
            break;
          case 'disconneted':
            break;
          case 'gameStart':
            setPlayerStatus('active');
            setOpponentStatus('active');
            navigate(`/game/${gameId}`);
            break;
        }
      };

      gameSocket.addEventListener('message', messageHandler);

      return () => {
        gameSocket.removeEventListener('message', messageHandler);
      };
    }
  }, [gameSocket, opponent, player, gameId, navigate]);

  useEffect(() => {
    
    if (playerStatus === 'ready' && opponentStatus === 'ready') {
      navigate(`/game/${gameId}`);
    }
  }, [playerStatus, opponentStatus]);


  const checkIsInTournament = async () => {
    try {
      const response = await axiosAuth.get('/game/tr/');
      const result = response.data;
      return result.isParticipant;
    } catch (error) {
      // console.error('Error:', error);
      return false;
    }
  };
  const inviteToGame = async (invitedPlayer: User) => {
    const isInTournament = await checkIsInTournament();
    if (isInTournament) {
      toast.warn("You can't invite players while in a tournament.");
      return;
    }
    //!here invitedPlayer

    setPlayer(cookies.userData);
    setOpponent(invitedPlayer);
    setPlayerStatus('not ready');
    setOpponentStatus('waiting');

    const msg = JSON.stringify({
      type: 'gameInvite',
      receiver: invitedPlayer.id,
    });
    sendMessage(msg);
  };
  
const acceptGameInvite = async (player: User) => {
  setIsOpponent(true);

        const msg = JSON.stringify({
          type: 'acceptGameInvite',
          receiver: player.id,
        });
        sendMessage(msg);

  };

  const declineGameInvite = (sender: User) => {
    const msg = JSON.stringify({
      type: 'declineGameInvite',
      receiver: sender.id,
    });
    sendMessage(msg);
  };
  
  const setGameReady = (senderId: string) => {
    if (gameId) {
      const msg = JSON.stringify({
      action: 'playerReady',
      receiver: senderId,
      gameId: gameId,
    });
      gameSocket?.send(msg);
    }
  };

  const showGameInviteToast = (sender: User): void => {
    let isResponseHandled = false;

    const handleResponse = (response: 'accept' | 'decline') => {
      if (isResponseHandled) return;
      isResponseHandled = true;

      if (response === 'accept') {
        void acceptGameInvite(sender);
      } else {
        declineGameInvite(sender);
      }
    };

    toast(
      ({ closeToast }: ToastContentProps) => (
        <div className='flex items-center gap-2'>
          <div className="flex gap-2 flex-grow min-w-0">
          <div>
            <img 
              src={`${theHost}:${port}${sender.profile_img}`} 
              alt='img'
              className="w-10 h-10 rounded-full"
            />
          </div>
          <p className="flex flex-col text-sm dark:text-white truncate">
            <span className="font-semibold">{sender.username}</span>
            <span className="text-gray-600 dark:text-gray-400"> invited you to a game!</span>
          </p>
          </div>
          <button
            className="shrink-0 p-1 group"
            onClick={() => { 
              handleResponse('accept');
              if (closeToast) closeToast();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-current group-hover:text-green-500 transition-colors duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className="shrink-0 p-1 group"
            onClick={() => { 
              handleResponse('decline');
              if (closeToast) closeToast();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-current group-hover:text-red-500 transition-colors duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ),
      {
        position: "bottom-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: false,
        draggable: true,
        className: "flex bg-white dark:bg-[#191919] text-[#191919] dark:text-white shadow-lg rounded-lg",
        progressClassName: "!bg-black dark:!bg-white",
        progressStyle: {
          background: 'currentColor',
        },
        onClose: () => {
          if (!isResponseHandled) {
            handleResponse('decline');
          }
        },
      }
    );
  };

  
  return (
    <GameContext.Provider value={{
      gameId,
      player,
      opponent,
      playerStatus,
      setPlayerStatus,
      opponentStatus,
      setOpponentStatus,
      inviteToGame,
      acceptGameInvite,
      declineGameInvite,
      setGameReady,
      setOpponent,
      setPlayer,
      gameSocket,
      setGameSocket,
      isOpponent,
      setIsOpponent,
      setGameId,
      winner,
      setWinner,
      gameSetting,
      setGameSetting,
      setBothAccepted,
      bothAccepted,
      Player1,
      Player2,
      setPlayer1,
      setPlayer2,
      showWinnerModal,
      setShowWinnerModal,
    }}>
      {children}
      <ToastContainer position="bottom-right" stacked theme="colored" />
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export default GameProvider;
