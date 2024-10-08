import { ReactNode, useEffect } from 'react';
import { useRockPaperScissors } from '../context/RockPaperScissorsContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface ProtectedRPSRouteProps {
  children: ReactNode;
}

const ProtectedRPSRoute = ({ children }: ProtectedRPSRouteProps) => {
  const location = useLocation();
  const { gameReadyState } = useRockPaperScissors();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log('is 3', location.pathname === '/SecondGame' && gameReadyState !== 1);
    if (location.pathname === '/SecondGame' && gameReadyState !== 1) {
      // console.log('is 1', location.pathname === '/SecondGame');
      // console.log('is 2', gameReadyState !== 1);
      
      // Navigate to '/games' if gameSocket is not available
      navigate('/games', { replace: true });
    }
  }, [location.pathname, gameReadyState]);

  return <>{children}</>;
};

export default ProtectedRPSRoute;
