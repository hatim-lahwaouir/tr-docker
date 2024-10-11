import { FriendsAndConversations } from '../../components/chat/FriendsAndConversations';
import { Chat } from '../../components/chat/chat';
import { useNavbarContext } from '../../context/NavbarContext';
import { useChatContext } from '../../context/ChatContext';
import { JustConversations } from '../../components/chat/JustConversations';
import { useEffect } from 'react';

const ChatPage: React.FC = () => {
	const barInfo = useNavbarContext();
	const chatInfo = useChatContext();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 481 && chatInfo.isConvSelected) {
                chatInfo.setIsConvSelected(false);
                barInfo.setBarBottom(true);
                barInfo.setBarTop(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [chatInfo, barInfo]);

    useEffect(() => {
		document.title = 'Messages';
	}, []);

    return (
        <>
            <div className="min-h-screen flex flex-col  text-black dark:text-white bg-white dark:bg-black">
                <div className={` min-h-16 ${barInfo.barTop ? '' : 'hidden'}`}></div>
                <div className=" flex-1 flex mobile:flex-row flex-col-reverse ">
                    <div className={`mobile:w-16 w-full maxMobile:h-16 flex ${barInfo.barBottom ? '' : 'hidden'}`}></div>
					{ barInfo.isTablet ? (
						<div className={`flex-shrink-0 ${chatInfo.isConvSelected ? 'hidden' : ''}`}>
							<JustConversations />
						</div>
					) : (
						<div className={`flex-grow ${barInfo.isWide ? 'max-w-[20%] min-w-96' : ''} ${chatInfo.isConvSelected ? 'hidden' : ''}`}>
							<FriendsAndConversations />
						</div>
					)}
                    <div className={`flex-grow ${barInfo.isWide || chatInfo.isConvSelected ? '' : 'hidden'} `}>
						<Chat />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatPage;