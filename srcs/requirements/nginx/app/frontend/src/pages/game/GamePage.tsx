import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import { useCookies } from 'react-cookie';
import { IoCaretDownCircle, IoCaretUpCircle } from 'react-icons/io5';
import { port, theHost } from '../../config';
import WinnerModal from '../../components/game/WinnerModal';

interface Winner {
  username: string;
  isInTournament: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  profile_img?: string;
  level: string;
}

type PlayerStatus = 'waiting' | 'not ready' | 'ready' | 'active' | null;

interface GameContextType {
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
  gameSetting: GameSetting | null;
  setGameSetting: React.Dispatch<React.SetStateAction<GameSetting | null>>;
  winner: Winner | null;
  setWinner: React.Dispatch<React.SetStateAction<Winner | null>>;
}

interface BallState {
  ball: { x: number; y: number };
  scorePlayer: number;
  scoreOpponent: number;
}

interface GameState {
  playerY: number;
  opponentY: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface GameSetting {
  tableColor: string;
  paddleColor: string;
  ballColor: string;
}

const GamePage: React.FC = () => {
  const { 
    player,
    setPlayer,
    opponent, 
    setOpponent,
    gameSocket,
    gameId,
    isOpponent,
    winner,
    setWinner,
    setPlayerStatus,
    setOpponentStatus,
    gameSetting,
    setIsOpponent,
  } = useGameContext() as GameContextType;

  const fixedGameWidth = 800;
  const fixedGameHeight = 500;
  const paddleWidth = 15;
  const paddleHeight = 150;
  const ballSize = 30;

  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const [cookies] = useCookies(['userData']);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<number>(1);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: fixedGameWidth, height: fixedGameHeight });
  const [countdown, setCountdown] = useState<number | null>(3);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const [ballState, setBallState] = useState<BallState>({
    ball: { 
      x: fixedGameWidth / 2,
      y: fixedGameHeight / 2,
    },
    scorePlayer: 0,
    scoreOpponent: 0,
  });

  const [gameState, setGameState] = useState<GameState>({
    playerY: fixedGameHeight / 2 - paddleHeight / 2,
    opponentY: fixedGameHeight / 2 - paddleHeight / 2,
  });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newRatio = containerWidth / fixedGameWidth;
      setRatio(newRatio);
      setCanvasSize({
        width: containerWidth,
        height: fixedGameHeight * newRatio,
      });
    }
  }, [fixedGameWidth, fixedGameHeight]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (gameSocket) {
      gameSocket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data as string);

        if (data.action === 'ball') {
          setBallState({
            ball: { x: data.ball_x, y: data.ball_y },
            scorePlayer: data.scorePlayer,
            scoreOpponent: data.scoreOpponent,
          });
        } else if (data.action === 'play') {
          setGameState({
            playerY: data.player_y,
            opponentY: data.opponent_y,
          });   
        } else if (data.status === 'gameFinished') {
          setWinner(data.winner);
          setShowWinnerModal(true);

            const msg = JSON.stringify({
              action: 'disconnect',
            });
            gameSocket.send(msg);
         }
         else if (data.status === 'userDisconnected') {

          const msg2 = JSON.stringify({
            action: 'setWinner',
            id: gameId,
            winner: isOpponent ? opponent?.id : player?.id,
          });
          
          gameSocket.send(msg2);
          }
          else if (data.status === 'disconneted') {
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
  }, [gameSocket, setWinner, cookies.userData, setPlayer, setPlayerStatus, setOpponent, setOpponentStatus]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
  
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      startGame();
    }
  }, [countdown]);

  const startGame = useCallback(() => {
    if (gameSocket && !gameStarted) {
      setGameStarted(true);
      const message = {
        action: "play",
        gameId: gameId,
        player: player?.username,
        opponent: opponent?.username,
        movement: 'stopP',
        wWidth: fixedGameWidth.toString(),
        wHeight: fixedGameHeight.toString(),
      };
      gameSocket.send(JSON.stringify(message));
    }
  }, [gameSocket, gameStarted, gameId, player, opponent, fixedGameWidth, fixedGameHeight]);

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

  const handlePaddleMove = useCallback((movement: string) => {

    if (!gameSocket || !gameStarted) {
      return;
    }

    const prefix = isOpponent ? 'O' : 'P';
    const message = {
      action: "play",
      gameId: gameId,
      player: player?.username,
      opponent: opponent?.username,
      movement: `${movement}${prefix}`,
      wWidth: fixedGameWidth.toString(),
      wHeight: fixedGameHeight.toString(),
    };
    gameSocket.send(JSON.stringify(message));
    
  }, [gameSocket, gameStarted, isOpponent, gameId, player, opponent, fixedGameWidth, fixedGameHeight]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {    
    if (e.repeat) return; // Ignore key repeat events
    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        handlePaddleMove('up');
        break;
      case 'arrowdown':
      case 's':
        handlePaddleMove('down');
        break;
    }
  }, [handlePaddleMove]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'arrowdown':
      case 'w':
      case 's':
        handlePaddleMove('stop');
        break;
    }
  }, [handlePaddleMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const drawRoundedRect = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    ctx.save();
    ctx.scale(ratio, ratio);

    // Draw table
    ctx.fillStyle = (gameSetting as GameSetting)?.tableColor || '#000000';
    ctx.fillRect(0, 0, fixedGameWidth, fixedGameHeight);

    // Draw ball
    ctx.fillStyle = (gameSetting as GameSetting)?.ballColor || '#FFFFFF';
    ctx.beginPath();
    ctx.arc(
      ballState.ball.x,
      ballState.ball.y,
      ballSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw paddles
    ctx.fillStyle = (gameSetting as GameSetting)?.paddleColor || '#FFFFFF';
    drawRoundedRect(ctx, 5, gameState.playerY, paddleWidth, paddleHeight, 7);
    drawRoundedRect(ctx, fixedGameWidth - paddleWidth - 5, gameState.opponentY, paddleWidth, paddleHeight, 7);

    // Draw countdown
    if (countdown !== null) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, fixedGameWidth, fixedGameHeight);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        countdown === 0 ? 'GO!' : countdown.toString(),
        fixedGameWidth / 2,
        fixedGameHeight / 2
      );
    }

    ctx.restore();
  }, [gameState, ballState, ratio, canvasSize, gameSetting, countdown, fixedGameWidth, fixedGameHeight, drawRoundedRect]);

  useEffect(() => {
    drawGame();
  }, [drawGame, countdown]);

  return (
    <div>
      <div className="flex flex-col text-black dark:text-white bg-white dark:bg-black mobile:h-screen">
        <div className=" min-h-16"></div>
        <div className="flex mobile:flex-row flex-col-reverse flex-1 mobile:max-h-[calc(100vh-4rem)]">
        <div className="mobile:w-16 w-full maxMobile:h-16"></div>
        <div className="flex h-[calc(100vh-8rem)] justify-center flex-1">
            <div className='flex flex-col flex-1 max-w-6xl gap-5 p-4' ref={containerRef}>
              <div className="flex-row justify-center items-center">
                <div className='flex flex-col flex-grow justify-center items-center w-full'>
                  <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-600 md:text-5xl lg:text-6xl dark:text-white'>
                    Ping Pong Game
                  </h1>
                  <div className="flex justify-between items-center w-full mb-4 text-2xl text-white">
                    <div className='flex items-center gap-2'>
                      <img src={`${theHost}:${port}${player?.profile_img}`} alt="" className="rounded-full w-10"/>
                      <div className='text-xl'>{player?.username}</div>
                    </div>
                    <div className='flex gap-4'>
                      <div className="text-blue-500">{ballState.scorePlayer}</div>
                      <div className="text-red-500">{ballState.scoreOpponent}</div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='text-xl'>{opponent?.username}</div>
                      <img src={`${theHost}:${port}${opponent?.profile_img}`} alt="" className="rounded-full w-10"/>
                    </div>
                  </div>
                  <div className='flex w-full justify-center'>
                    <canvas
                      ref={canvasRef}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      className="border-4 border-cyan-100 rounded-lg shadow"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    {/* {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-white text-6xl font-bold">
                          {countdown === 0 ? 'GO!' : countdown}
                        </div>
                      </div>
                    )} */}
                  </div>
                  {showWinnerModal && winner && (
                    <WinnerModal
                      winner={winner}
                      onClose={closeWinnerModal}
                      inTournament={winner.isInTournament}
                    />
                  )}
                </div>
                <div className='h-64 tablet:hidden flex gap-10'>
                  <div 
                    className='flex-1 flex text-center justify-center items-center text-8xl cursor-pointer'
                    onMouseDown={() => handlePaddleMove('down')}
                    onMouseUp={() => handlePaddleMove('stop')}
                    onTouchStart={() => handlePaddleMove('down')}
                    onTouchEnd={() => handlePaddleMove('stop')}
                  >
                    <IoCaretDownCircle />
                  </div>
                  <div 
                    className='flex-1 flex text-center justify-center items-center text-8xl cursor-pointer'
                    onMouseDown={() => handlePaddleMove('up')}
                    onMouseUp={() => handlePaddleMove('stop')}
                    onTouchStart={() => handlePaddleMove('up')}
                    onTouchEnd={() => handlePaddleMove('stop')}
                  >
                    <IoCaretUpCircle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;