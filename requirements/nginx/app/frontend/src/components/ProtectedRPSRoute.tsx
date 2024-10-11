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
    if (location.pathname === '/SecondGame' && gameReadyState !== 1) {
      navigate('/games', { replace: true });
    }
  }, [location.pathname, gameReadyState]);

  return <>{children}</>;
};

export default ProtectedRPSRoute;
