import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useCookies } from 'react-cookie';
import { useRockPaperScissors } from '../../../context/RockPaperScissorsContext';
import vs_black from "../../../assets/vs_black.png";
import vs_white from "../../../assets/vs_white.png";

import { axiosAuth } from '../../../api/axiosAuth';
import { port, theHost } from '../../../config';
import { useNavbarContext } from '../../../context/NavbarContext';
import WinnerModalRPS from '../../../components/game/WinnerModalRPS';

import RockIcon from '../../../assets/rock.svg';
import ScissorsIcon from '../../../assets/scissors.svg';
import PaperIcon from '../../../assets/paper.svg';

import RockIcon2 from '../../../assets/rock.png';
import ScissorsIcon2 from '../../../assets/scissors.png';
import PaperIcon2 from '../../../assets/paper.png';

import RockIcon3 from '../../../assets/rock2.png';
import ScissorsIcon3 from '../../../assets/scissors2.png';
import PaperIcon3 from '../../../assets/paper2.png';

// Define types for props and state
type Choice = 'R' | 'P' | 'S' | null;
type Score = { player: number; opponent: number };
type RoundResult = 'win' | 'lose' | 'draw' | null;

interface ChoiceButtonProps {
  choice: Choice;
  icon: string;
  selected: boolean;
  onClick: (choice: Choice) => void;
}

interface User {
	id: string;
	username: string;
  full_name: string;
	profile_img?: string;
}

// interface Winner {
//   username: string;
//   isInTournament: boolean;
// }

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, icon, selected, onClick }) => (
  <button
    onClick={() => onClick(choice)}
    className={`size-20 tablet:size-28 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
      selected
        ? 'bg-black text-white border-white dark:bg-white dark:text-black border-2 dark:border-black'
        : 'bg-white text-black dark:bg-black dark:text-white dark:hover:bg-gray-800 hover:bg-gray-100'
    }`}
  >
    <img src={icon} alt={choice || 'choice'} className="w-16 h-16" />
  </button>
);

const Game: React.FC = () => {
  const { isDark } = useNavbarContext();
  const [choice, setChoice] = useState<Choice>(null);
  const [choiceO, setChoiceO] = useState<Choice>(null);
  const [score, setScore] = useState<Score>({ player: 0, opponent: 0 });
  const [roundResult, setRoundResult] = useState<RoundResult>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [cookies] = useCookies(['userData']);
  const [isDraw, setIsDraw] = useState(false);
  const [isGameInvalid, setIsGameInvalid] = useState(false);
  const navigate = useNavigate();
  const { sendGameMessage, lastGameMessage } = useRockPaperScissors();
  const [timeLeft, setTimeLeft] = useState(5);
  const endTimeRef = useRef<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [player, setPlayer] = useState<User>();
  const [opponent, setOpponent] = useState<User>();
  const [showResultPopup, setShowResultPopup] = useState(false);

  const getRandomChoice = (): Choice => {
    const choices: Choice[] = ['R', 'P', 'S'];
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const handleChoice = useCallback((selectedChoice: Choice) => {
    setChoice(selectedChoice);
  }, []);

  const sendChoice = useCallback(() => {
    sendGameMessage(JSON.stringify({ choice: choice || '' }));
    setIsRoundActive(false);
    endTimeRef.current = null;
  }, [choice, sendGameMessage]);

  const startNextRound = useCallback(() => {
    const initialChoice = getRandomChoice();
    setChoice(initialChoice);
    setIsRoundActive(true);
    setRoundResult(null);

    setChoiceO(null);
    endTimeRef.current = Date.now() + 5000;
  }, []);

  useEffect(() => {
    if (lastGameMessage) {
      const data = JSON.parse(lastGameMessage.data);
      
      switch (data.type) {
        case 'start.game':
          if (data.p1_data.id === cookies.userData.id) {
            setPlayer(data.p1_data);
            setOpponent(data.p2_data);
          }
          else {
            setPlayer(data.p2_data);
            setOpponent(data.p1_data);
          }
          setIsDraw(false);
          startNextRound();
          break;
        case 'round.result':
          setIsDraw(false);
          setScore(prevScore => {
            const newScore = { ...prevScore };
            if (data.status === 'win') {
              setChoice(data.winner_choice)
              setChoiceO(data.loser_choice)
              newScore.player += 1;
            } else if (data.status === 'lose') {
              setChoice(data.loser_choice)
              setChoiceO(data.winner_choice)
              newScore.opponent += 1;
            } else if (data.status === 'draw') {
              setChoice(data.draw_choice)
              setChoiceO(data.draw_choice)
            }
            return newScore;
          });
          setRoundResult(data.status);
          setShowResultPopup(true); // Show the result popup
          setTimeout(() => {
            setShowResultPopup(false); // Hide the popup after 2 seconds
            if (!data.last) {
              setTimeout(startNextRound, 1500);
            }
          }, 2000);
          break;
        case 'game.result':
          if (data.status === 'win' || data.status === 'lose')
            setTimeout(() => {
            setWinner(data.winner);
          }, 2000);
          else if (data.status === 'draw') {
            setIsDraw(true);
            setTimeout(() => {
            setWinner(data.winner);
          }, 2000);
          }
          break;
        case 'invalid.game':
          setIsGameInvalid(true);
          break;
      }
    }
  }, [lastGameMessage, startNextRound]);

  useEffect(() => {
    let timer: number;
    if (isRoundActive && endTimeRef.current !== null) {
      timer = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          sendChoice();
          clearInterval(timer);
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRoundActive, sendChoice]);

  const handleClose = () => {
    setWinner(null);
    navigate('/games');
  };

  useEffect(() => {
    getOption();

  }, []);

  const getOption = async () => {
    try {
      const response = await axiosAuth.get(`sgame/get-option/`);
      const result = response.data;
      const optionNumber = Number(result.game_option);
      setSelectedOption(optionNumber);
    } catch (error) {
      // console.error('Error getting game option:', error);
    }
  };

  if (isGameInvalid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black dark:bg-black dark:text-white">
        <div className="text-center bg-black text-white dark:bg-white dark:text-black p-12 rounded-lg shadow-2xl mb-8">
          <AlertCircle size={80} className="mx-auto mb-6 dark:text-black text-white" />
          <h2 className="text-5xl font-bold mb-6">Invalid Game</h2>
          <p className="text-2xl mb-6">This game is no longer valid.</p>
          <p className="text-xl mb-8">Please return to the games list.</p>
        </div>
        <button
          onClick={handleClose}
          className="bg-black text-white dark:bg-white dark:text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out dark:hover:bg-gray-200 hover:bg-gray-800 transform hover:scale-105"
        >
          Return to Games
        </button>
      </div>
    );
  }

  if (winner) {
    return (
      <WinnerModalRPS
      winner={isDraw ? 'Draw' : winner === cookies.userData?.id ? 'You win!' : 'You lose!'}
      score={score}
      onClose={handleClose}
      />
    );
  }

  return (
    <>
            <div className="min-h-screen flex flex-col text-black dark:text-white bg-white dark:bg-black">
                <div className="min-h-16"></div>
                <div className="flex-1 flex mobile:flex-row flex-col-reverse mobile:mr-3 mobile:mb-5">
                    <div className="mobile:w-16 w-full h-16 mobile:h-full"></div>
                    <div className="flex flex-col flex-1 grow mobile:ml-2">
                        <div className="dark:text-white mobile:m-5 maxMobile:mt-5 font-bold mobile:text-4xl text-3xl items-center text-center">
                            {"RPS GAME"}
                        </div>
                        <div className="flex flex-col-reverse tablet:flex-row justify-center items-center">
                            <div className='flex flex-1 flex-col-reverse tablet:flex-row mobile:max-w-xl justify-center items-center'>
                                <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
                                    <div className={`max-w-72 w-full tablet:min-h-[300px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-6 mx-5`}>
                                    {player ? (
                                            <>
                                                <img src={`${theHost}:${port}${player.profile_img}`} alt={player.username} className="tablet:size-20 size-14 rounded-full" />
                                                <div className="text-center text-lg text-black dark:text-white font-bold">{player.full_name}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="animate-spin rounded-full tablet:size-20 size-14 border-t-2 border-b-2 border-black dark:border-white"></div>
                                                <h2 className="text-lg">Waiting for player...</h2>
                                            </>
                                        )}
                                        <div className='flex justify-center items-center'>
                                          {choice === 'R' ? <img src={selectedOption === 1 ? RockIcon : selectedOption === 2 ? RockIcon2 : selectedOption === 3 ? RockIcon3 : RockIcon3} alt={'rock choice'} className="w-16 h-16" /> 
                                          : choice === 'P' ? <img src={selectedOption === 1 ? PaperIcon : selectedOption === 2 ? PaperIcon2 : selectedOption === 3 ? PaperIcon3 : PaperIcon3} alt={'Paper choice'} className="w-16 h-16" />
                                          : choice === 'S' ? <img src={selectedOption === 1 ? ScissorsIcon : selectedOption === 2 ? ScissorsIcon2 : selectedOption === 3 ? ScissorsIcon3 : ScissorsIcon3} alt={'scissors choice'} className="w-16 h-16" />
                                          : null}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-4 items-center justify-center'>
                                    <div className='flex justify-center text-center items-center w-20'>
                                        <img src={!isDark ? vs_black : vs_white} className='tablet:w-12 w-9' alt="VS" />
                                    </div>
                                </div>

                                <div className='flex justify-center flex-1 w-full maxTablet:my-4'>
                                    <div className={`max-w-72 w-full tablet:min-h-[300px] rounded-2xl flex tablet:flex-col tablet:justify-center items-center gap-6 mx-5`}>
                                        {opponent ? (
                                            <>
                                                <img src={`${theHost}:${port}${opponent.profile_img}`} alt={opponent.username} className="tablet:size-20 size-14 rounded-full" />
                                                <div className="text-center text-lg text-black dark:text-white font-bold">{opponent.full_name}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="animate-spin rounded-full tablet:size-20 size-14 border-t-2 border-b-2 border-black dark:border-white"></div>
                                                <h2 className="text-lg">Waiting for opponent...</h2>
                                            </>
                                        )}
                                        <div className='flex justify-center items-center'>
                                        { choiceO ? (
                                            choiceO === 'R' ? (
                                              <img src={selectedOption === 1 ? RockIcon : selectedOption === 2 ? RockIcon2 : selectedOption === 3 ? RockIcon3 : RockIcon3} alt="rock choice" className="w-16 h-16 transform scale-x-[-1]" />
                                            ) : choiceO === 'P' ? (
                                              <img src={selectedOption === 1 ? PaperIcon : selectedOption === 2 ? PaperIcon2 : selectedOption === 3 ? PaperIcon3 : PaperIcon3} alt="paper choice" className="w-16 h-16 transform scale-x-[-1]" />
                                            ) : choiceO === 'S' ? (
                                              <img src={selectedOption === 1 ? ScissorsIcon : selectedOption === 2 ? ScissorsIcon2 : selectedOption === 3 ? ScissorsIcon3 : ScissorsIcon3} alt="scissors choice" className="w-16 h-16 transform scale-x-[-1]" />
                                            ) : null
                                          ) : (
                                            <div className="animate-spin rounded-full tablet:size-16 size-14 border-t-2 border-b-2 border-black dark:border-white"></div>
                                          )
                                        }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {showResultPopup ? (
                          <div className="flex flex-col items-center my-2">
                            <div className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-lg shadow-lg text-4xl font-bold">
                              {roundResult === 'win' && "You won this round!"}
                              {roundResult === 'lose' && "You lost this round!"}
                              {roundResult === 'draw' && "It's a draw!"}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="text-2xl mb-4">Time remaining:</div>
                            <div className="size-20 rounded-full dark:bg-white bg-black border-2 dark:border-black border-white flex items-center justify-center">
                              <div className="text-5xl font-bold text-white dark:text-black">{timeLeft}</div>
                            </div>
                          </div>
                        )}
                        <div className='flex flex-col justify-center items-center'>
                          <div className="text-xl my-6">You can change your choice:</div>
                          <div className="flex gap-4">
                            <ChoiceButton
                              choice="R"
                              icon={selectedOption === 1 ? RockIcon : selectedOption === 2 ? RockIcon2 : selectedOption === 3 ? RockIcon3 : RockIcon3}
                              selected={choice === 'R'}
                              onClick={handleChoice}
                            />
                            <ChoiceButton
                              choice="P"
                              icon={selectedOption === 1 ? PaperIcon : selectedOption === 2 ? PaperIcon2 : selectedOption === 3 ? PaperIcon3 : PaperIcon3}
                              selected={choice === 'P'}
                              onClick={handleChoice}
                              />
                            <ChoiceButton
                              choice="S"
                              icon={selectedOption === 1 ? ScissorsIcon : selectedOption === 2 ? ScissorsIcon2 : selectedOption === 3 ? ScissorsIcon3 : ScissorsIcon3}
                              selected={choice === 'S'}
                              onClick={handleChoice}
                              />
                          </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </>
  );

};

export default Game;