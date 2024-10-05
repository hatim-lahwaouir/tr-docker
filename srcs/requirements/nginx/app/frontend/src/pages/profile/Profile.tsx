import ProfileStats from './ProfileStats';
import GameHistory from './GameHistory';
import FriendsList from './FriendsList';
import { useEffect, useState } from 'react';
import { useProfileContext } from '../../context/ProfileContext';
import { BarChart, Bar, Tooltip,  ResponsiveContainer, CartesianGrid, TooltipProps } from 'recharts';
import { useNavbarContext } from '../../context/NavbarContext';
import { differenceInCalendarWeeks, parseISO } from 'date-fns';
import { useParams } from 'react-router-dom';
import { axiosAuth } from '../../api/axiosAuth';


type WeekData = {
	week: string;
	wins: number;
	losses: number;
  };

  interface HistoryGame {
	date: string;
	opponentName: string;
	opponentPicture: string;
	score: string;
	state: "WIN" | "LOSE";
	time: string;
  }

  const getIntroOfPage = (label:number) => {
	if (label === 3) {
		return "This Week";
	}
	if (label === 2) {
		return "Week-2";
	}
	if (label === 1) {
		return "Week-3";
	}
	if (label === 0) {
		return "Week-4";
	}
	return label;
  };

  interface CustomTooltipProps extends TooltipProps<number, string> {}

  const CustomTooltip: React.FC<CustomTooltipProps>  = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<div className="dark:bg-[#000000bb] bg-[#ffffffbb] p-2 rounded-lg flex flex-col">
				<p className="intro">{getIntroOfPage(label)}</p>
				<p className="text-[#1c7324] font-bold">{`WIN : ${payload[0].value}`}</p>
				<p className="text-[#8a2121] font-bold">{`LOSE : ${payload[1].value}`}</p>
			</div>
		);
	}

	return null;
	};

  const getLastFourWeeksSummary = (data: HistoryGame[]) => {
	const result: WeekData[] = [
		{ week: 'Week-3', wins: 0, losses: 0 },
		{ week: 'Week-2', wins: 0, losses: 0 },
		{ week: 'Week-1', wins: 0, losses: 0 },
		{ week: 'Week-0', wins: 0, losses: 0 },
	];

	const currentDate = new Date();
  
	data.forEach((game) => {
		const gameDate = parseISO(game.date);
		const weekDiff = differenceInCalendarWeeks(currentDate, gameDate);
	
		// Only consider the last 4 weeks
		if (weekDiff >= 0 && weekDiff < 4) {
			// Adjust the week index to match the order from old to new
			const index = 3 - weekDiff; // Reverse the week index, so Week-4 is the oldest and Week-0 is the most recent
	
			if (game.state === 'WIN') {
				result[index].wins += 1;
			} else if (game.state === 'LOSE') {
				result[index].losses += 1;
			}
		}
	});

	return result;
  };

const Profile: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const profileContext = useProfileContext();
	const { isDark} = useNavbarContext();
	const [, setIsLoading] = useState(true);
	const [dataHistory, setDataHistory] = useState<HistoryGame[]>([]);
	const [summary, setSummary] = useState<WeekData[]>([])


  useEffect(()=>{
	const newSummary = getLastFourWeeksSummary(dataHistory);
    setSummary(newSummary);
  },[dataHistory])

  useEffect(() => {
    document.title = "Profile | "+profileContext.fullName;
  }, [profileContext]);


  const fetchHistory = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axiosAuth.get(`/game/history/${id}`);

      setDataHistory(response.data);
    } catch (error) {
    //   console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory();
  }, [id]);
	
	useEffect(() => {
		if (id) {
			profileContext.setTheId(id);
		}
	}, [id]);

	const lightTheme = {
		backgroundColor: '#ffffffcc',
		textColor: '#333333',
		winColor: '#1c7324',
		lossColor: '#8a2121',
		fillcolor: '#eeeeee'
	};
	
	const darkTheme = {
		backgroundColor: '#000000ff',
		textColor: '#ffffff',
		winColor: '#1c7324',
		lossColor: '#8a2121',
		fillcolor: '#222222'
	};
	
	const currentTheme = isDark ? darkTheme : lightTheme;

		return (
		<>
			<div className="min-h-screen flex flex-col  text-black dark:text-white bg-white dark:bg-black">
				<div className="min-h-16 "></div>
				<div className=" flex-1 flex mobile:flex-row flex-col-reverse ">
					<div className=" mobile:w-16 w-full maxMobile:h-16 flex"></div>
					<div className="flex flex-1 grow justify-center">
						<div className='  flex-1 max-w-6xl flex gap-5 m-5 flex-col'>
							<div className=' flex gap-5 tablet2:flex-row flex-col'>
								<div className=' grow rounded-xl flex flex-col tablet2:basis-2/3 ' >
									<ProfileStats/>
								</div>
								<div className='rounded-xl  tablet2:basis-1/3 flex flex-col items-center justify-center'>
									<div className="  flex justify-center items-center tablet2:m-5 flex-col w-full maxTablet2:max-w-96 ">
									<ResponsiveContainer height={200}>
										<BarChart data={summary}>
											<CartesianGrid vertical={false} stroke={currentTheme.fillcolor} />
											<Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} cursor={{fill:currentTheme.fillcolor}}/>
											<Bar dataKey="wins" fill={currentTheme.winColor} radius={[5, 5, 0, 0]} />
											<Bar dataKey="losses" fill={currentTheme.lossColor} radius={[5, 5, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
									<div className='flex  w-full px-1 text-sm dark:text-[#cecece]'>
										<div className='flex-1 flex justify-center'>W-4</div>
										<div className='flex-1 flex justify-center'>W-3</div>
										<div className='flex-1 flex justify-center'>W-2</div>
										<div className='flex-1 flex justify-center text-center'>This Week</div>
									</div>
									</div>
								</div>
							</div>
							<div className=' grow flex gap-5 tablet2:flex-row flex-col'>
								<div className=' grow border rounded-xl dark:border-[#292929] tablet2:basis-2/3 flex flex-col' >
										<GameHistory/>
								</div>
								<div className='border rounded-xl grow dark:border-[#292929] tablet2:basis-1/3  flex flex-col'>
										<FriendsList/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
		);
};

export default Profile;
