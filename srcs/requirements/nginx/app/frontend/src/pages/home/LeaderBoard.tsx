import PlayerStage from './PlayerStage';
import RankTable from './RankTable';
import { useHomeContext } from '../../context/HomeContext';

const LeaderBoard = () => {
	const {isLoading} = useHomeContext();
	return(
		<>
		{
			!isLoading && 
			<div className='flex-1   scrollbar-hide flex flex-col tablet2:flex-row'>
				<PlayerStage/>
				<RankTable/>
			</div>
		}
		</>
	)
}

export default LeaderBoard