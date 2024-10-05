import AllMsgsIconW from "../../assets/assets2/allMessgaesW.svg";
import AllMsgsIconB from "../../assets/assets2/allMessgaesB.svg";

import { useNavbarContext } from "../../context/NavbarContext";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../../context/ChatContext";
import { useProfileContext } from "../../context/ProfileContext";
import { useCookies } from "react-cookie";
import { useWebSocketContext } from "../../context/WebSocketContext";
import { useEffect } from "react";
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

export const FriendsAndConversations: React.FC = () => {
	const [cookies] = useCookies(['userData']);
    const barInfos = useNavbarContext();
    const navigate = useNavigate();
    const profileInfo = useProfileContext();
    const chatContext = useChatContext();
    const {conversations} = useChatContext();
    const gobalInfo = useWebSocketContext();

    useEffect(() => {
      }, [chatContext.setSelectedUserChat]);

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

    function extractTime(dateString: string): string {
        const date = new Date(dateString);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function truncateString(str: string, num: number): string {
        return str.length > num ? str.slice(0, num) + "..." : str;
    }

    const handleSelectOnlineUser = (friend: Friend) => {
        if (friend.id !== cookies.userData.id) {
          navigate(`/profile/${friend.id}`);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className={`relative w-full px-4 pt-2 ${barInfos.isTablet ? 'hidden' : ''}`}>
                    {/* <input
                        type="text"
                        placeholder="Search for..."
                        className="w-full bg-gray-200 dark:bg-[#2A2A2A] rounded-[15px] pl-10 pr-4 py-[14px] outline-none"
                    />
                    <img
                        src={SearchChatSVG}
                        alt="Search Icon"
                        className="absolute left-7 top-[42px] transform -translate-y-1/2 h-[18px]"
                    /> */}
                </div>
                
                <div className={`px-4 ${barInfos.isTablet ? 'hidden' : ''}`}>
					<div className="text-[#808080] pb-3 px-3">Online Now</div>
					<div className="flex flex-row gap-4 overflow-x-auto py-2 px-3">
						{gobalInfo.onlineFriends.length === 0 ? (
                            <div>
                                No Friends Online
                            </div>
                        ) : (
                            gobalInfo.onlineFriends.map((friend) => (
                            <div 
                                key={friend.id}
                                className="relative flex-shrink-0 cursor-pointer"
                                onClick={() => handleSelectOnlineUser(friend)}
                            >
								<div className="w-[70px] h-[70px] ">
									<img
                                        src={`${theHost}:${port}${friend.profile_img}`}
										alt={friend.username} 
										className="w-full h-full rounded-full object-cover"
									/>
								</div>
								<span 
									className={`absolute -top-2 right-1 w-5 h-5 border-2 border-white dark:border-black rounded-full bg-green-500`}
									style={{ transform: 'translate(25%, 25%)' }}
								></span>
							</div>
						))
                        )}
					</div>
				</div>
                
                <div>
					<div className={`flex mx-4 ${barInfos.isTablet ? 'hidden' : ''}`}>
						<img 
							src={ barInfos.isDark ? AllMsgsIconW : AllMsgsIconB}
							alt='all messages icon' 
							className="ml-4 w-[30px] h-[30px] rounded-full object-cover"
						/>
						<div className="pl-3 font-bold">
							All Messages
						</div>
					</div>
                    
                    {conversations.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-40">
                            <p className="text-gray-600 font-bold dark:text-gray-400">No conversations available.</p>
                            <p className="text-gray-600 dark:text-gray-400">New conversations will appear here</p>
                        </div>
                    ) : (
                        <div className={`flex flex-col space-y-2 px-4 py-6 max-h-[550px] overflow-y-auto ${barInfos.isTablet ? 'hidden' : ''}`}>
                            {conversations.map(conversation => {
                                // const otherUser = conversation.sender.id === parseInt(cookies.userData.id) ? conversation.receiver : conversation.sender;
                                const otherUser = conversation.sender.id === parseInt(cookies.userData.id) ? conversation.receiver : conversation.sender;
                                return (
                                    <div key={`${conversation.id}-${otherUser.id}`} 
                                        className="flex flex-row w-full hover:bg-[#e7e7e7] dark:hover:bg-[#2A2A2A] hover:rounded-md p-0.5 mb-2"
                                        onClick={() => handleConversationClick(conversation)}>
                                        <div className="flex-grow flex justify-center items-center">
                                            <img 
                                                src={`${theHost}:${port}${otherUser.profile_img}`}
                                                alt={`${otherUser.full_name}'s profile`}
                                                className="w-[55px] h-[55px] rounded-full" 
                                            />
                                        </div>
                                        <div className="flex flex-col flex-grow-[4] ml-1">
                                            <div className="flex-grow font-semibold">
                                                {otherUser.full_name}
                                            </div>
                                            <div className="flex-grow text-gray-400">
                                                {truncateString(conversation.content, 20)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-grow items-end">
                                            {!conversation.seen && (
                                                <div className="m-1">
                                                    <div className={`w-4 h-4 flex items-center justify-center rounded-full text-xs text-white dark:bg-white dark:text-black bg-black`}>
                                                        {/* {conversation.unseenCount || 1} */}
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`m-1 ${!conversation.seen ? 'font-bold' : ''}`}>
                                                {extractTime(conversation.date_of_message)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
