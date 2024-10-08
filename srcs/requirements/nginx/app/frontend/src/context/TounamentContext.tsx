import { createContext, useContext, ReactNode, useEffect, useState} from 'react';
import { useGameContext } from './GameContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { port, wsHost } from '../config';

interface Userx {
	PositionR1: number | null;
	PositionR2: number | null;
	id: number | null;
	profile_img: string | null;
	trAlias: string | null;
}

interface Participant {
	user:Userx
}
interface Round {
  [key: string]: Userx;
}
export interface TournParticipants{
	Round1:	Round ;
	Round2:	Round ;
	Round3:	Round ;
	Final:	Round 
}

 const getRound1 = (participants: Participant[]): Round=> {
	// Initialize Round1 object with empty arrays for each P
	const Round1: Round = {
    P1: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P2: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P3: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P4: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P5: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P6: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P7: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P8: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
	};
	// Iterate over participants and place them into their respective Ps
  if(participants){
    participants.map((participant) => {
      switch (participant.user.PositionR1) {
      case 1:
        Round1.P1 = participant.user;
        break;
      case 2:
        Round1.P2 = participant.user ;
        break;
      case 3:
        Round1.P3 = participant.user ;
        break;
      case 4:
        Round1.P4 = participant.user;
        break;
      case 5:
        Round1.P5 = participant.user;
        break;
      case 6:
        Round1.P6 = participant.user;
        break;
      case 7:
        Round1.P7 = participant.user;
        break;
      case 8:
        Round1.P8 = participant.user;
        break;
      default:
        // You could handle unexpected trPositions here, if needed
        break;
      }
    });
  }
  
	return Round1;
  };
 const getRound2 = (participants: Userx[]): Round  => {
	// Initialize Round2 object with empty arrays for each P
	const Round2: Round = {
    P1: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P2: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P3: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P4: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
	};
  
	// Iterate over participants and place them into their respective Ps
  if(participants){
    participants.map((participant) => {
      switch (participant.PositionR1) {
        case 1:
          Round2.P1 = participant;
          break;
        case 2:
          Round2.P2 = participant ;
          break;
        case 3:
          Round2.P3 = participant ;
          break;
        case 4:
          Round2.P4 = participant;
          break;
        break;
      default:
        // You could handle unexpected trPositions here, if needed
        break;
      }
    });
  }
  
	return Round2;
  };


   const getRound3 = (participants: Userx[]): Round => {
	// Initialize Round3 object with empty arrays for each P
	const Round3: Round = {
    P1: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
    P2: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
	};
  
	// Iterate over participants and place them into their respective Ps
  if(participants){
    participants.map((participant) => {
      switch (participant.PositionR2) {
        case 1:
          Round3.P1 = participant;
          break;
        case 2:
          Round3.P2 = participant ;
          break;
      default:
        // You could handle unexpected trPositions here, if needed
        break;
      }
    });
  }
	return Round3;
  };

   const getFinal = (participants: Userx[]): Round => {
	// Initialize Final object with empty arrays for each P
	const Final: Round = {
    P1: {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
	};
	// Iterate over participants and place them into their respective Ps

  if(participants){
    participants.map((participant) => {
      Final.P1 = participant;
    });
  }
  
	return Final;
  };

  const getParticipants = (data: any): TournParticipants => {
	const datasend:TournParticipants ={
		Round1 : {
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P2" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P3" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P4" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P5" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P6" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P7" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P8" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		},
		Round2:{
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P2" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P3" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P4" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		},
		Round3:{
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
			"P2" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		},
		Final:{
			"P1" : {PositionR1: null, PositionR2: null, id: null, profile_img: null,trAlias: null},
		}
	}
	datasend.Round1 = getRound1(data.round1 ? data.round1.players : null);
	datasend.Round2 = getRound2(data.round2 ? data.round2.players:null);
	datasend.Round3 = getRound3(data.round3 ? data.round3.players : null);
	datasend.Final = getFinal(data.final ? data.final.players:null);
	return datasend;
  };

interface TounamentContextType {
	tournamentSocket: WebSocket | null;
	setTournamentSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  Participents:TournParticipants | undefined;
  Type: number;
  setCloseSocket: (socketclose: boolean | null) => void;
  socketclose:boolean | null;
}

const TounamentContext = createContext<TounamentContextType | undefined>(undefined);

export const useTounamentContext = (): TounamentContextType => {
  const context = useContext(TounamentContext);
  if (!context) {
    throw new Error('useTounamentContext must be used within a WebSocketProvider');
  }
  return context;
};

interface TounamentContextProviderProps {
  children: ReactNode;
}

const TounamentContextProvider: React.FC<TounamentContextProviderProps> = ({ children }) => {
  const [tournamentSocket, setTournamentSocket] = useState<WebSocket | null>(null);
  const [Participents, setParticipents] = useState<TournParticipants>();
  const [Type, setType] = useState(4);
  const gameContext = useGameContext();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('access');
  const [cookies] = useCookies(['userData']);
  const [socketclose, setCloseSocket] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    //? Close the socket when not on the tournament path
    if (location.pathname !== '/tournament') {
      if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
        tournamentSocket.close();
        setTournamentSocket(null);
      }
    }
  }, [location.pathname, tournamentSocket]);

  useEffect(()=>{
    if(socketclose != null)
      if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN)
        tournamentSocket.close()
  },[socketclose])
  
  useEffect(()=>{
    if (tournamentSocket) {
      tournamentSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log('tournament socket', data);

          if (data.action === "show"){
            setType(data.trType);
            const datasend = getParticipants(data);
            
            setParticipents(datasend);
          }
          else if (data.action === "startGame") { 
            if (data && Array.isArray(data.matches)) {
            data.matches.map((match:any) => {
              
              if (match.opponent.id === cookies.userData.id || match.player.id === cookies.userData.id) {
  
                gameContext.setOpponent(match.opponent);
                gameContext.setPlayer(match.player);
                gameContext.setBothAccepted(true);
                
                if (match.opponent.id === cookies.userData.id) {
                  gameContext.setIsOpponent(true);
                }
                else {
                  gameContext.setIsOpponent(false);
                }
                gameContext.setPlayerStatus('not ready');
                gameContext.setOpponentStatus('not ready');
                
                gameContext.setGameId(match.matchId);
  
                const socket = new WebSocket(`wss://${wsHost}:${port}/ws/game/${match.matchId}/?token=${userToken}`);
  
                socket.onopen = () => {
                  gameContext.setGameSocket(socket);
                };
                
                navigate(`/game-lobby/${match.matchId}`);
              }
            });
          }
          }
      };
      tournamentSocket.onclose = () => {
        gameContext.setBothAccepted(true);
        setTournamentSocket(null);
      }
    }

  },[tournamentSocket])
	

  return (
    <TounamentContext.Provider value={{
		tournamentSocket,
		setTournamentSocket,
    Participents,
    Type,
    setCloseSocket,
    socketclose
    }}>
      {children}
    </TounamentContext.Provider>
  );
};

export default TounamentContextProvider;