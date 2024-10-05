import { useNavbarContext } from "../../context/NavbarContext";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../../context/ChatContext";
import { useProfileContext } from "../../context/ProfileContext";
import { useCookies } from "react-cookie";
import AllMsgsIconW from "../../assets/assets2/allMessgaesW.svg";
import AllMsgsIconB from "../../assets/assets2/allMessgaesB.svg";
import { port, theHost } from "../../config";

interface Friend {
    id: number;
    username: string;
    full_name: string;
    email?: string;
    profile_img: string;
    status: string;
    level: number;
  }

interface Conversation {
    id: number;
    content: string;
    date_of_message: string;
    receiver: Friend;
    sender: Friend;
    seen: boolean;
}

export const JustConversations: React.FC = () => {
	const [cookies] = useCookies(['userData']);
	const barInfos = useNavbarContext();
	const navigate = useNavigate();
	const profileInfo = useProfileContext();
	const chatContext = useChatContext();
    const {conversations} = useChatContext();

    const handleConversationClick = (conversation: Conversation) => {
        
        const otherUser = conversation.sender.id === cookies.userData.id ? conversation.receiver : conversation.sender;

        conversation.seen = true;
        
        const msg = JSON.stringify({
            type: 'seen',
            receiver: otherUser.id,
        });

        chatContext.sendMessage(msg);
        
        chatContext.setIsConvOn(true);
        if (!barInfos.isWide) {
            chatContext.setIsConvSelected(true);
            barInfos.setBarBottom(false);
            barInfos.setBarTop(false);
        }

        profileInfo.setTheId(otherUser.id.toString());
        chatContext.setSelectedConversationId(otherUser.id.toString());
        chatContext.setSelectedUserChat(otherUser);
        chatContext.setFetchForMessages(true);

        chatContext.setIsInitialLoadComplete(false);
        
        navigate(`/chat/${otherUser.id}`);
    };

    return (
        <div className="flex flex-col h-full min-w-[80px] w-20">
				
				<div className={`flex justify-center items-center`}>
					<img 
						src={ barInfos.isDark ? AllMsgsIconW : AllMsgsIconB}
						alt='all messages icon' 
						className="w-[30px] h-[30px] rounded-full object-cover my-3"
					/>
				</div>
                <div className="flex flex-col space-y-4 p-2 overflow-y-auto h-full">
					
                    {conversations.map(conversation => {
                        const otherUser = conversation.sender.id === parseInt(cookies.userData.id) ? conversation.receiver : conversation.sender;
                        return (
                        <div 
                            key={conversation.id} 
                            className="flex justify-center items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 rounded-full p-1"
                            onClick={() => handleConversationClick(conversation)}
                        >
                            <img 
                                src={`${theHost}:${port}${otherUser.profile_img}`}
                                alt={`${otherUser.full_name}'s profile`}
                                className="w-14 h-14 rounded-full object-cover" 
                            />
                        </div>
                        );
                    })}
                </div>
        </div>
    );
};

