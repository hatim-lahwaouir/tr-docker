import { useEffect, useState } from "react";
import noGame from '../../assets/noGames.png';
import { Link, useParams } from "react-router-dom";
import { axiosAuth } from "../../api/axiosAuth";
import { port, theHost } from "../../config";

interface HistoryGame {
  date: string;
  opponentName: string;
  opponentId:number;
  opponentPicture: string;
  score: string;
  state: "WIN" | "LOSE";
  time: string;
}

const convertHour = (time: string): string => {
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const formattedMinute = minute < 10 ? `0${minute}` : minute;
  return `${hour}:${formattedMinute} ${ampm}`;
};

const GameHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [dataHistory, setDataHistory] = useState<HistoryGame[]>([]);

  const fetchHistory = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axiosAuth.get(`/game/history/${id}`);
    
      const result = response.data;
      setDataHistory(result);
    } catch (error) {
      // console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory();
  }, [id]);

  if (isLoading) {
    return <div></div>;
  }

  return ( 
    <>
      <div className='h-12 flex justify-between'>
        <div className='flex items-center text-lg font-bold ml-5'>GAME HISTORY</div>
      </div>
      {dataHistory.length ? (
        <div className='flex-1 grid max-h-[700px] overflow-y-scroll tablet1:grid-cols-4 tablet2:grid-cols-2 gap-2 place-items-center auto-rows-max maxTablet2:max-h-96 maxTablet2:overflow-y-scroll laptop:grid-cols-5 tablet3:grid-cols-4 desktop:grid-cols-6 mobile:grid-cols-3 mobileS:grid-cols-3 grid-cols-2 m-2'>
          {dataHistory.map((game: HistoryGame, index: number) => (
            <Link to={`/profile/${game.opponentId}`} key={index} className='flex flex-col items-center h-full w-full border dark:border-[#292929] rounded-xl p-2'>
              <div className='rounded-full items-center'>
                <img src={`${theHost}:${port}${game.opponentPicture}`} alt={`${game.opponentName}'s avatar`} className='w-14 rounded-full'/>
              </div>
              <div className='font-bold text-xs text-center mt-2'>{game.opponentName}</div>
              <div className='font-bold'>{game.score}</div>
              <div className={`font-bold ${game.state === "WIN" ? 'text-[#1c7324]' : 'text-[#8a2121]'}`}>
                {game.state}
              </div>
              <div className='font-light text-[8px] flex flex-col justify-center items-center text-[#8a8a8a]'>
                <div>{game.date}</div>
                <div>{convertHour(game.time)}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='flex-1 flex justify-center'>
          <div className='flex flex-1 justify-center items-center m-5'>
            <img src={noGame} alt="No games found" className="w-96" />
          </div>
        </div>
      )}
    </>
  );
};

export default GameHistory;