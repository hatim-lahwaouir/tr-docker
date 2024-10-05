// //? KHDAM MAFIH LKIFAYA
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { ReadyState } from 'react-use-websocket';
import { useNavbarContext } from '../../context/NavbarContext';
import { useChatContext } from '../../context/ChatContext';
import { ProfileInfo } from './ProfileInfo';
import { axiosAuth } from '../../api/axiosAuth';

// Import your SVG assets here
import BackArrowB from '../../assets/assets2/backArrowB.svg';
import BackArrowW from '../../assets/assets2/backArrowW.svg';
import ThreeDotsW from '../../assets/assets2/threeDotsW.svg';
import ThreeDotsB from '../../assets/assets2/threeDotsB.svg';
import SendIconW from '../../assets/assets2/sendIconW.svg';
import SendIconB from '../../assets/assets2/sendIconB.svg';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { port, theHost } from '../../config';

interface Message {
  id: string;
  content: string;
  sender: string;
  receiver: string;
  date_of_message: string;
  seen: boolean;
}

interface NewMessage {
  type: 'message';
  message: string;
  sender: string;
  receiver: string | undefined;
  seen?: boolean;
}

export const Chat: React.FC = () => {
  const { id } = useParams();
  const [cookies] = useCookies(['userData']);
  const barInfo = useNavbarContext();
  const chatContext = useChatContext();
  const [input, setInput] = useState("");
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const websocketContext = useWebSocketContext();
  const [isUserOnline, setIsUserOnline] = useState(false);

//? hook bach nchof wach i need to fetch more messages
const useTopInfiniteScroll = (loadMore: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

    const topElementCallback = useCallback((node: HTMLDivElement | null) => {
      // console.log('Top element callback triggered');
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && chatContext.hasMore) {
          // console.log('Top element intersecting, loading more');
          setIsLoading(true);
          loadMore().finally(() => setIsLoading(false));
        }
      });
      if (node) observerRef.current.observe(node);
    }, [isLoading, loadMore, chatContext.hasMore]);

    useEffect(() => {
      return () => {
        // console.log('Cleaning up observer');
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, []);

    return { topElementRef: topElementCallback, isLoading };
 }
 //? hook end

const fetchMessages = async () => {
  try {
    const response = await axiosAuth.get(`/user/messages/${id}/${chatContext.offset}`);
    const result = response.data;

    if (Array.isArray(result.messages)) {
      const messages = result.messages;
      if (messages.length > 0) {
        chatContext.setOffset(prevOffset => prevOffset + 1);
      }
      return messages;
    }
    return [];
  } catch (error) {
    // console.error('Error fetching messages:', error);
    setError('Failed to load messages. Please try again.');
    return [];
  }
};

const initialFetchMessages = async () => {
  try {
    const response = await axiosAuth.get(`/user/messages/${id}/1`);
    const result = response.data;
    
    if (Array.isArray(result.messages)) {
      return result.messages;
    }
    return [];
  } catch (error) {
    // console.error('Error fetching initial messages:', error);
    setError('Failed to load initial messages. Please try again.');
    return [];
  }
};

  const loadMoreMessages = async () => {
    if (!chatContext.isInitialLoadComplete || !chatContext.hasMore) return;
    try {
      const newMessages = await fetchMessages();
      if (newMessages.length < 20) {
        chatContext.setHasMore(false);
      }
      chatContext.setMessages((prevMessages) => {
        // Remove duplicates based on message ID
        const uniqueMessages = [...newMessages, ...prevMessages].filter(
          (message, index, self) =>
            index === self.findIndex((t) => t.id === message.id)
        );
        return uniqueMessages;
      });

    } catch (err) {
      setError('Failed to load messages. Please try again.');
    }
  };

  const { topElementRef, isLoading } = useTopInfiniteScroll(loadMoreMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // console.log('lbidaya');
    chatContext.setHasMore(true);
    chatContext.setMessages([]);
    chatContext.setOffset(1);
    const loadInitialMessages = async () => {
      const initialMessages = await initialFetchMessages();
      if (initialMessages.length < 20) {
        chatContext.setHasMore(false);
      }
      chatContext.setMessages(initialMessages);
    };
    
    if(chatContext.selectedUserChat) {
      loadInitialMessages();
      chatContext.setFetchForMessages(false);

      setTimeout(() => {
        chatContext.setIsInitialLoadComplete(true);
      }, 500);
    }
  
  }, [chatContext.selectedUserChat]);
  
  useLayoutEffect(() => {
    scrollToBottom();
  }, [initialFetchMessages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput !== "" && chatContext.readyState === ReadyState.OPEN) {
      const newMessage: NewMessage = { 
        type: 'message', 
        message: trimmedInput, 
        sender: cookies.userData.username, 
        receiver: id 
      };
      chatContext.sendMessage(JSON.stringify(newMessage));
      setInput("");
    }
  };
  

  const extractTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const shouldShowTimeAndImage = (messages: Message[], index: number): boolean => {
    if (index === messages.length - 1) return true; // Always show for the last message
    const currentMessage = messages[index];
    const nextMessage = messages[index + 1];
    return currentMessage.sender !== nextMessage.sender;
  };

  useEffect(() => {
    const checkOnlineStatus = () => {
      const isOnline = websocketContext.onlineFriends.some(friend => friend.id === parseInt(id ?? ''));
      setIsUserOnline(isOnline);
    };
  
    checkOnlineStatus();
  
    const intervalId = setInterval(checkOnlineStatus, 5000);
  
    return () => clearInterval(intervalId);
  }, [id, websocketContext.onlineFriends]);

  const handleBack = () => {
    chatContext.setIsConvSelected(false);
    barInfo.setBarBottom(true);
    barInfo.setBarTop(true);
  }

  if (!chatContext.isConvOn) {
    return (
      <div className='flex flex-col gap-3 h-full justify-center items-center'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="128" height="128" color="#bababa" fill="none">
						<path d="M20 9C19.2048 5.01455 15.5128 2 11.0793 2C6.06549 2 2 5.85521 2 10.61C2 12.8946 2.93819 14.9704 4.46855 16.5108C4.80549 16.85 5.03045 17.3134 4.93966 17.7903C4.78982 18.5701 4.45026 19.2975 3.95305 19.9037C5.26123 20.1449 6.62147 19.9277 7.78801 19.3127C8.20039 19.0954 8.40657 18.9867 8.55207 18.9646C8.65392 18.9492 8.78659 18.9636 9 19.0002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M11 16.2617C11 19.1674 13.4628 21.5234 16.5 21.5234C16.8571 21.5238 17.2132 21.4908 17.564 21.425C17.8165 21.3775 17.9428 21.3538 18.0309 21.3673C18.119 21.3807 18.244 21.4472 18.4938 21.58C19.2004 21.9558 20.0244 22.0885 20.8169 21.9411C20.5157 21.5707 20.31 21.1262 20.2192 20.6496C20.1642 20.3582 20.3005 20.075 20.5046 19.8677C21.4317 18.9263 22 17.6578 22 16.2617C22 13.356 19.5372 11 16.5 11C13.4628 11 11 13.356 11 16.2617Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
					</svg>
        <div className='font-bold text-3xl'>Your messages</div>
        <div className='text-gray-400'>Send a message to start a chat or select an existing chat.</div>
      </div>
    );
  }

  return (
    <div
        ref={listRef} 
        className={`flex flex-col ${barInfo.isWide ? 'h-[calc(100vh-4rem)]' : 'h-screen'} relative`}>
      {/* chat fo9ani */}
      <div className="bg-white dark:bg-black border-b-2 dark:border-zinc-800 top-0 h-16 left-0 right-0 flex flex-row top-bar">
        <div className={`flex justify-center items-center left-0 py-2 ${barInfo.isWide ? 'hidden' : ''}`}>
          <button className="w-14 h-14 rounded-full flex justify-center items-center hover:bg-[#2A2A2A]"
            onClick={handleBack}
          >
            <img src={barInfo.isDark ? BackArrowW : BackArrowB} alt="back arrow"
              className='w-6 h-6' />
          </button>
        </div>
        <div className="flex justify-center items-center py-2">
          <button className="w-14 h-14 rounded-full flex justify-center items-center">
            <img src={`${theHost}:${port}${chatContext.selectedUserChat?.profile_img}`} alt="Profile"
              className='w-12 h-12 rounded-full' />
          </button>
        </div>
        <div className='flex flex-col flex-grow-[20] py-2'>
          <div className='flex-grow font-bold pl-4'>
            {chatContext.selectedUserChat?.full_name}
          </div>
          <div className='flex-grow text-gray-400 pl-4'>
            {isUserOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <div className="flex w-14 h-16 justify-center items-center py-2">
          <button 
            className="w-12 h-14 rounded-full flex justify-center items-center hover:bg-[#e7e7e7] dark:hover:bg-[#2A2A2A]"
            onClick={() => {
              setShowProfileInfo(true);
            }}
          >
            <img src={barInfo.isDark ? ThreeDotsW : ThreeDotsB}
              alt="three dots"
              className='w-2 h-8'
            />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto container-rf">
        <div className="flex flex-col p-4">
          {isLoading && <div className="text-center loading">Loading more messages...</div>}
          {!chatContext.hasMore && <div className="text-center no-more">No more messages to load</div>}
          {error && <div className="error">{error}</div>}
          {chatContext.messages.map((message, index) => {
            return (
              <div 
                key={`${chatContext.selectedUserChat?.id}-${message.id}`} 
                ref={index === 0 ? topElementRef : null}
                className={`flex ${message.sender === cookies.userData.id ? 'justify-end' : 'justify-start'} mb-4`}
              >
                {message.sender !== cookies.userData.id && shouldShowTimeAndImage(chatContext.messages, index) ? (
                  <img src={`${theHost}:${port}${chatContext.selectedUserChat?.profile_img}`} alt="Profile" className={`w-8 h-8 rounded-full mr-2`} />
                ) : (
                  <div className='pr-[40px]' />
                )}
                <div>
                  <div className={`p-3 rounded-b-xl ${barInfo.isWide ? 'max-w-lg' : 'max-w-xs'} 
                    ${message.sender === cookies.userData.id ? 'bg-black dark:bg-white text-right dark:text-black text-white rounded-l-xl' : 'bg-[#E3E3E3] dark:bg-[#373737] text-left rounded-r-xl'} 
                    break-words overflow-wrap`}>
                    <p className="text-sm lg:text-base" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  </div>
                  {shouldShowTimeAndImage(chatContext.messages, index) && (
                    <p className={`text-xs text-gray-500 pt-1 ${message.sender === cookies.userData.id ? 'text-right' : 'text-left'}`}>
                      {extractTime(message.date_of_message)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input */}
      <div className="bg-white border-t-2 dark:border-zinc-800 dark:bg-black bottom-0 h-16 flex justify-end p-2">
        <div className='flex flex-grow justify-center items-center bg-[#E9E9E9] dark:bg-[#303030] rounded-2xl mr-2'>
          <input 
            type="text"
            className='flex-grow bg-[#E9E9E9] dark:bg-[#303030] placeholder:text-[#C7C7C7] dark:placeholder:text-[#595959] outline-none px-4 rounded-2xl'
            placeholder="Type your message here ..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // console.log('Enter key pressed, sending message');
                handleSend();
              }
            }}
          />
        </div>
        <button 
          className='w-[42px] h-[42px] flex justify-center items-center bg-[#E9E9E9] dark:bg-[#303030] rounded-full'
          onClick={() => {
            handleSend();
          }}
        >
          <img src={barInfo.isDark ? SendIconW : SendIconB} alt="send" className='w-7 h-6' />
        </button>
      </div>

      {/* <div className="text-white text-sm text-center p-2">
        Connection Status: {chatContext.connectionStatus}
      </div> */}

      {showProfileInfo && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            onClick={() => {
              setShowProfileInfo(false);
            }}
          />
          <ProfileInfo onClose={() => {
            setShowProfileInfo(false);
          }} />
        </>
      )}
    </div>
  );
};