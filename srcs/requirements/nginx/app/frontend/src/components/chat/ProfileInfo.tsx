import BackArrowB from '../../assets/assets2/backArrowB.svg'
import BackArrowW from '../../assets/assets2/backArrowW.svg'
import ViewProfileB from '../../assets/assets2/viewProfileB.svg'
import ViewProfileW from '../../assets/assets2/viewProfileW.svg'
import InvToGameW from '../../assets/assets2/invGameW.svg'
import InvToGameB from '../../assets/assets2/invGameB.svg'
import BlockB from '../../assets/assets2/blockB.svg'
import BlockW from '../../assets/assets2/blockW.svg'

import { useNavbarContext } from '../../context/NavbarContext'
import { useChatContext } from '../../context/ChatContext'
import { useNavigate } from 'react-router-dom'
import { useGameContext } from '../../context/GameContext'
import { useWebSocketContext } from '../../context/WebSocketContext'
import { port, theHost } from '../../config'
import { toast } from 'react-toastify';
import { axiosAuth } from '../../api/axiosAuth'

interface ProfileInfoProps {
	onClose: () => void;
}

interface User {
	id: string;
	username: string;
	email: string;
	profile_img?: string;
	level: string;
}
export const ProfileInfo: React.FC<ProfileInfoProps> = ({ onClose }) => {
	const barInfo = useNavbarContext();
	const ChatInfo = useChatContext();
	const navigate = useNavigate();
	const { inviteToGame } = useGameContext();
	const { blockUser } = useWebSocketContext();

	const handleViewProfile = () => {
		if (ChatInfo.selectedUserChat?.id) {
			navigate(`/profile/${ChatInfo.selectedUserChat?.id}`);
		}
	}

	const checkIsInGame = async (id: string) => {
		try {
			const response = await axiosAuth.get(`/game/isInGame/${id}`);
			const result = response.data;
			return result.isInGame;
		} catch (error) {
			// console.error('Error:', error);
			return false;
		}
	};

	const checkIsInTournament = async (id: string) => {
		try {
			const response = await axiosAuth.get(`/game/checkTr/${id}`);
			const result = response.data;
			return result.isParticipant;
		} catch (error) {
			// console.error('Error:', error);
			return false;
		}
	};

	const handleInviteToGame = async () => {
			if (ChatInfo.selectedUserChat) {
			const isInTournament = await checkIsInTournament(ChatInfo.selectedUserChat.id.toString());
			const isInGame = await checkIsInGame(ChatInfo.selectedUserChat.id.toString());
			if (isInTournament) {
				toast.warn("You can't invite players while in a tournament.");
				return;
			}
			if (isInGame) {
				toast.warn("You can't invite players while in a game.");
				return;
			}

			const userToInvite: User = {
				id: ChatInfo.selectedUserChat.id.toString(),
				username: ChatInfo.selectedUserChat.username,
				email: '',
				profile_img: ChatInfo.selectedUserChat.profile_img,
				level: ChatInfo.selectedUserChat.level.toString(),
			};
			inviteToGame(userToInvite);
		}
	}
    
	const handleBlock = () => {
		if (ChatInfo.selectedUserChat) {
			blockUser(ChatInfo.selectedUserChat.id.toString());
		}
	}
    
    return (
		<>
			<div className={`fixed right-0 top-0 h-full ${barInfo.isWide ? 'w-[30%]' : 'w-full'} bg-white dark:bg-black shadow-lg z-50 overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0 min-w-[320px]`}>
			<div className="bg-white dark:bg-black border-b-2 dark:border-zinc-800 top-0 h-16 left-0 right-0 flex flex-row">
				<div className="flex justify-center items-center left-0 py-2">
				<button className="w-14 h-14 rounded-full flex justify-center items-center hover:bg-slate-800" onClick={onClose}>
					<img src={barInfo.isDark ? BackArrowW : BackArrowB} alt="back arrow" className='w-6 h-6' />
				</button>
				</div>
				<div className='flex items-center flex-grow font-bold text-3xl pl-4 select-none'>
					Profile Info
				</div>
			</div>

			<div className='flex flex-col select-none'>

				<div className="flex flex-col justify-center items-center py-4 pb-10">
					<div className='p-2'>
						<img src={`${theHost}:${port}${ChatInfo.selectedUserChat?.profile_img}`} alt="Profile"
						className='w-32 h-32 border-4 rounded-full' />
					</div>
					<div className='flex-grow font-bold'>
						{ChatInfo.selectedUserChat?.full_name}
					</div>
					<div className='flex-grow text-gray-400'>
						{`@${ChatInfo.selectedUserChat?.username}`}
					</div>
				</div>

				<div className='pl-8 flex flex-col'>
					<button onClick={handleViewProfile}>
						<div className='flex gap-4 p-4'>
							<div>
								<img src={barInfo.isDark ? ViewProfileW : ViewProfileB} alt="view profile"
									className='w-6 h-6' />
							</div>
							<div>
								View Profile
							</div>
						</div>
					</button>

					<button onClick={handleInviteToGame}>
						<div className='flex gap-4 p-4'>
								<div>
									<img src={barInfo.isDark ? InvToGameW : InvToGameB} alt="invite to a game"
										className='w-6 h-6' />
								</div>
								<div>
									Invite to a Game
								</div>
						</div>
					</button>

					<button onClick={handleBlock}>
						<div className='flex gap-4 p-4'>
							<div>
								<img src={barInfo.isDark ? BlockW : BlockB} alt="block"
									className='w-6 h-6' />
							</div>
							<div>
								Block
							</div>
						</div>
					</button>
				</div>

			</div>
			</div>

		</>
	);
};
