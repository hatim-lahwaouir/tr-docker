import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';
import { useGameContext } from '../context/GameContext';
import { useCookies } from 'react-cookie';

const LocationTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { setIsConvSelected, setIsConvOn, setIsInitialLoadComplete, setSelectedUserChat } = useChatContext();
  const { 
    setPlayer, 
    setPlayerStatus, 
    setOpponent, 
    gameSocket, 
    setGameSocket 
  } = useGameContext();
  const [cookies] = useCookies(['userData']);

  useEffect(() => {
    // Reset chat state
    if (!location.pathname.startsWith('/chat')) {
      setIsConvSelected(false);
      setIsConvOn(false);
      setIsInitialLoadComplete(false);
      setSelectedUserChat(null);
    }

    // Reset game state and disconnect socket
    if (!location.pathname.startsWith('/game-lobby/') && !location.pathname.startsWith('/game/')) {
      setPlayer(cookies.userData);
      setPlayerStatus('not ready');
      setOpponent(null);

      // Disconnect the game socket
      if (gameSocket) {
        gameSocket.close();
        setGameSocket(null);
      }
    }
  }, [
    location, 
    setIsConvSelected, 
    setIsConvOn, 
    setIsInitialLoadComplete, 
    setSelectedUserChat, 
    setPlayer, 
    setPlayerStatus, 
    setOpponent, 
    cookies.userData,
    gameSocket,
    setGameSocket
  ]);

  return <>{children}</>;
};

export default LocationTracker;