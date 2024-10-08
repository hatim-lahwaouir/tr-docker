// import { createContext, useContext, useState, useCallback } from 'react';
// import { port, wsHost } from '../config';
// import useWebSocket from 'react-use-websocket';

// const RockPaperScissorsContext = createContext();

// export const useRockPaperScissors = () => useContext(RockPaperScissorsContext);

// export const RockPaperScissorsProvider = ({ children }) => {
//   const [gameQueueSocket, setGameQueueSocket] = useState(null);
//   const [gameSocket, setGameSocket] = useState(null);
//   const [gameId, setGameId] = useState<number | null>(null);
//   const userToken = localStorage.getItem('access');
// //   const setGameQueueSocketInContext = useCallback((socket) => {
// //     setGameQueueSocket(socket);
// //   }, []);

// //   const setGameSocketInContext = useCallback((socket) => {
// //     setGameSocket(socket);
// //   }, []);

// //   const closeGameQueueSocket = useCallback(() => {
// //     if (gameQueueSocket && gameQueueSocket.readyState === WebSocket.OPEN) {
// //       gameQueueSocket.close();
// //     }
// //     setGameQueueSocket(null);
// //   }, [gameQueueSocket]);

// //   const closeGameSocket = useCallback(() => {
// //     if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
// //       gameSocket.close();
// //     }
// //     setGameSocket(null);
// //   }, [gameSocket]);

//     // Connect to the game WebSocket once the gameId is set
//     const WS_URL_GAME = gameId ? `ws://${wsHost}:${port}/ws/sGame/${gameId}/?token=${userToken}` : null;

//     // Set the game WebSocket in context when the game connection is established
//     useEffect(() => {
//         if (gameId && getGameWebSocket) {
//             console.log('Setting the Game Socket to the context');
//             setGameSocket(getGameWebSocket());
//         }
//     }, [gameId, getGameWebSocket, setGameSocket]);

//   const value = {
//     gameId,
//     setGameId,
//     gameQueueSocket,
//     setGameQueueSocket,
//     gameSocket,
//     setGameSocket,
//     // setGameQueueSocketInContext,
//     // setGameSocketInContext,
//     // closeGameQueueSocket,
//     // closeGameSocket,
//   };

//   return (
//     <RockPaperScissorsContext.Provider value={value}>
//       {children}
//     </RockPaperScissorsContext.Provider>
//   );
// };


// import { createContext, useContext, useState, useEffect } from 'react';
// import useWebSocket from 'react-use-websocket';
// import { port, wsHost } from '../config';

// const RockPaperScissorsContext = createContext(null);

// export const useRockPaperScissors = () => useContext(RockPaperScissorsContext);

// export const RockPaperScissorsProvider = ({ children }) => {
//   const [gameQueueSocket, setGameQueueSocket] = useState<WebSocket | null>(null);
//   const [gameSocket, setGameSocket] = useState<WebSocket | null>(null);
//   const [gameId, setGameId] = useState<number | null>(null);

//   const userToken = localStorage.getItem('access');

//   // Game WebSocket connection URL (set when gameId is available)
//   const WS_URL_GAME = gameId ? `ws://${wsHost}:${port}/ws/sGame/${gameId}/?token=${userToken}` : null;

//   // WebSocket connection for the game, conditional on gameId being set
//   const {
//     sendMessage: sendGameMessage,
//     lastMessage: lastGameMessage,
//     readyState: gameReadyState,
//     // getWebSocket: getGameWebSocket,
//   } = useWebSocket(WS_URL_GAME, { shouldReconnect: () => true }, Boolean(gameId));

//   useEffect(() => {
//     if (gameReadyState === 1) {
//       console.log('Game WebSocket connection is open');
//     }
//   }, [gameReadyState]);

//   const value = {
//     gameId,
//     setGameId,
//     gameQueueSocket,
//     setGameQueueSocket,
//     gameSocket,
//     setGameSocket,
//     sendGameMessage,
//     lastGameMessage,
//     gameReadyState,
//   };

//   return (
//     <RockPaperScissorsContext.Provider value={value}>
//       {children}
//     </RockPaperScissorsContext.Provider>
//   );
// };

import { createContext, useContext, useState, ReactNode } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { port, wsHost } from '../config';

// Define the shape of our context
interface RockPaperScissorsContextType {
  gameId: number | null;
  setGameId: React.Dispatch<React.SetStateAction<number | null>>;
  gameQueueSocket: WebSocket | null;
  setGameQueueSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  gameSocket: WebSocket | null;
  setGameSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  sendGameMessage: (message: string) => void;
  lastGameMessage: MessageEvent<any> | null;
  gameReadyState: ReadyState;
}

const RockPaperScissorsContext = createContext<RockPaperScissorsContextType | null>(null);

export const useRockPaperScissors = () => {
  const context = useContext(RockPaperScissorsContext);
  if (!context) {
    throw new Error('useRockPaperScissors must be used within a RockPaperScissorsProvider');
  }
  return context;
};

interface RockPaperScissorsProviderProps {
  children: ReactNode;
}

export const RockPaperScissorsProvider: React.FC<RockPaperScissorsProviderProps> = ({ children }) => {
  const [gameQueueSocket, setGameQueueSocket] = useState<WebSocket | null>(null);
  const [gameSocket, setGameSocket] = useState<WebSocket | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);

  const userToken = localStorage.getItem('access');

  // Game WebSocket connection URL (set when gameId is available)
  const WS_URL_GAME = gameId ? `ws://${wsHost}:${port}/ws/sGame/${gameId}/?token=${userToken}` : null;

  // WebSocket connection for the game, conditional on gameId being set
  const {
    sendMessage: sendGameMessage,
    lastMessage: lastGameMessage,
    readyState: gameReadyState,
  } = useWebSocket(WS_URL_GAME, { shouldReconnect: () => true }, Boolean(gameId));

  const value: RockPaperScissorsContextType = {
    gameId,
    setGameId,
    gameQueueSocket,
    setGameQueueSocket,
    gameSocket,
    setGameSocket,
    sendGameMessage,
    lastGameMessage,
    gameReadyState,
  };

  return (
    <RockPaperScissorsContext.Provider value={value}>
      {children}
    </RockPaperScissorsContext.Provider>
  );
};