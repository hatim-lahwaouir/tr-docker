import { createContext, useContext, ReactNode, useState, useEffect} from 'react';
interface TounamentLocalContextType {
	P1 :string;
  P2 :string;
  P3 :string;
  P4 :string;
  isInTourn :boolean;
  setIsInTourn : (value: boolean) => void;
  setP1: (value: string) => void;
  setP2: (value: string) => void;
  setP3: (value: string) => void;
  setP4: (value: string) => void;
  Participents:TournParticipants;
  setParticipents: (value: TournParticipants) => void
  currentMatch:string;
  setCurrentMatch:(value: 'Match1' | 'Match2' | 'Final' | 'Winner') => void;
  startedMatche: MatchNow
  setWinner: (value: Userx | null) =>void
}

interface Userx {
	profile_img: string | null;
	trAlias: string | null;
}

interface Round {
  [key: string]: Userx;
}
export interface TournParticipants{
	Round1:	Round ;
	Round2:	Round ;
	Final:	Round 
}

interface MatchNow {
  player1: Userx;
  player2: Userx;
}

const TounamentLocalContext = createContext<TounamentLocalContextType | undefined>(undefined);

export const useTounamentLocalContext = (): TounamentLocalContextType => {
  const context = useContext(TounamentLocalContext);
  if (!context) {
    throw new Error('useTounamentLocalContext must be used within a WebSocketProvider');
  }
  return context;
};

interface TounamentLocalContextProviderProps {
  children: ReactNode;
}
const getParticipants = (P1:string, P2:string, P3:string, P4:string): TournParticipants => {
	const datasend:TournParticipants ={
		Round1 : {
			"P1" : {profile_img: "/src/assets/pic1.jpeg",trAlias: P1},
			"P2" : {profile_img: "/src/assets/pic2.jpeg",trAlias: P2},
			"P3" : {profile_img: "/src/assets/pic3.jpeg",trAlias: P3},
			"P4" : {profile_img: "/src/assets/pic4.jpeg",trAlias: P4},
		},
		Round2:{
			"P1" : {profile_img: null,trAlias: null},
			"P2" : {profile_img: null,trAlias: null},
		},
		Final:{
			"P1" : {profile_img: null,trAlias: null},
		}
	}
	return datasend;
  };


const TounamentLocalContextProvider: React.FC<TounamentLocalContextProviderProps> = ({ children }) => {
  const [P1, setP1] = useState<string>("Player1");
  const [P2, setP2] = useState<string>("Player2");
  const [P3, setP3] = useState<string>("Player3");
  const [P4, setP4] = useState<string>("Player4");
  const [isInTourn, setIsInTourn] = useState<boolean>(false);
  const [winner, setWinner] = useState<Userx| null>(null);
  const [Participents, setParticipents] = useState<TournParticipants>({
		"Round1":{
			"P1" : {profile_img: null,trAlias: null},
			"P2" : {profile_img: null,trAlias: null},
			"P3" : {profile_img: null,trAlias: null},
			"P4" : {profile_img: null,trAlias: null},
		},
		"Round2":{
			"P1" : {profile_img: null,trAlias: null},
			"P2" : {profile_img: null,trAlias: null},
		},
		"Final":{
			"P1" : {profile_img: null,trAlias: null},
		}
		});
  const [currentMatch, setCurrentMatch] = useState<'Match1' | 'Match2' | 'Final' | 'Winner'>('Match1');
  
  const [startedMatche, setStartedMatch ] = useState<MatchNow>({player1: Participents.Round1.P1, player2: Participents.Round1.P2})

  const updateParticipant = (round: 'Round2' | 'Final', participant: 'P1' | 'P2', newData: Partial<Userx>) => {
    setParticipents((prevParticipants) => {
      // Create a copy of the current participants
      const updatedParticipants = { ...prevParticipants };

      // Check if we're updating Round2 or Final
      if (round === 'Round2' && (participant === 'P1' || participant === 'P2')) {
        updatedParticipants.Round2[participant] = {
          ...prevParticipants.Round2[participant],
          ...newData,
        };
      } else if (round === 'Final' && participant === 'P1') {
        updatedParticipants.Final.P1 = {
          ...prevParticipants.Final.P1,
          ...newData,
        };
      }

      // Return the updated structure
      return updatedParticipants;
    });
  };

  useEffect(()=>{
    if (winner){
      if(currentMatch === 'Match1'){
        setCurrentMatch('Match2');
        updateParticipant('Round2', 'P1', winner)
      }
      else if(currentMatch === 'Match2'){
        setCurrentMatch('Final');
        updateParticipant('Round2', 'P2', winner)
      }
      else if(currentMatch === 'Final'){
        setCurrentMatch('Winner');
        updateParticipant('Final', 'P1', winner)
      }
    }
  },[winner])

  useEffect(()=>{
    if(isInTourn){
      const datasend = getParticipants(P1,P2,P3,P4);
      setParticipents(datasend);
    }
    else{
      setCurrentMatch('Match1')
    }
  },[isInTourn])
  
  useEffect(()=>{
    if(currentMatch === 'Match1')
      setStartedMatch({ player1: Participents.Round1.P1, player2: Participents.Round1.P2})
    else if(currentMatch === 'Match2')
      setStartedMatch({ player1: Participents.Round1.P3, player2: Participents.Round1.P4})
    else if(currentMatch === 'Final')
      setStartedMatch({ player1: Participents.Round2.P1, player2: Participents.Round2.P2})
  },[Participents])

  return (
    <TounamentLocalContext.Provider value={{
      P1, P2, P3, P4,
      setP1, setP2, setP3, setP4,
      isInTourn, setIsInTourn,
      Participents, setParticipents,
      currentMatch, setCurrentMatch,
      startedMatche,
      setWinner
    }}>
      {children}
    </TounamentLocalContext.Provider>
  );
};

export default TounamentLocalContextProvider;