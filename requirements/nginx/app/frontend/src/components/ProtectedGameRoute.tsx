import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useCookies } from 'react-cookie';
import { axiosAuth } from '../api/axiosAuth';

interface ProtectedGameRouteProps {
  children: React.ReactNode;
}

const checkIsInTournament = async (): Promise<boolean> => {
  try {
    const response = await axiosAuth.get('/game/tr/');
    const result = response.data;
    return result.isParticipant;
  } catch (error) {
    // console.error('Error:', error);
    return false;
  }
};

const ProtectedGameRoute: React.FC<ProtectedGameRouteProps> = ({ children }) => {
  const { 
    gameId, 
    player, 
    opponent, 
    setPlayerStatus, 
    setOpponentStatus,
    setPlayer,
    setOpponent,
    gameSocket,
    setGameSocket,
  } = useGameContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [cookies] = useCookies(['userData']);

  // Check if the current path is a game-related path that needs protection
  const isGamePath = /^\/game\/[^/]+$/.test(location.pathname) || 
                     (/^\/game-lobby\/[^/]+$/.test(location.pathname) && location.pathname !== '/game-lobby/0');

  const handleNavigation = useCallback(async () => {
    if (isGamePath && (!gameId || !player || !opponent)) {
      // If it's a protected game path and there's no active game, reset statuses and redirect to the game home
      if (setPlayerStatus) setPlayerStatus('not ready');
      if (setOpponentStatus) setOpponentStatus('not ready');
      setPlayer(cookies.userData);
      setOpponent(null);

      // Disconnect the game socket
      if (gameSocket) {
        gameSocket.close();
        setGameSocket(null);
      }
      
      const isInTournament = await checkIsInTournament();
      if (isInTournament) {
        navigate('/tournament', { replace: true });
      } else {
        navigate('/game-lobby/0', { replace: true });
      }
    }
  }, [isGamePath, gameId, player, opponent, setPlayerStatus, setOpponentStatus, setPlayer, setOpponent, gameSocket, setGameSocket, cookies.userData, navigate]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  // If it's a game path and there's no active game, render nothing while the effect handles the redirection
  if (isGamePath && (!gameId || !player || !opponent)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedGameRoute;