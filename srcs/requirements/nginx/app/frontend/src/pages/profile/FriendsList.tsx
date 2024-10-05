import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileContext } from "../../context/ProfileContext";
import noFridens from "../../assets/NoFriends.png"
import { useChatContext } from "../../context/ChatContext";
import { CiMail } from "react-icons/ci";
import { useCookies } from "react-cookie";
import { useWebSocketContext } from "../../context/WebSocketContext";
import { useNavbarContext } from "../../context/NavbarContext";
import { axiosAuth } from '../../api/axiosAuth';
import { port, theHost } from "../../config";

interface Friend {
  id: number;
  full_name: string;
  username: string;
  profile_img: string;
  level: number;
  status: string;
}

const FriendsList = () => {
  const { id } = useParams();
  const profileInfo = useProfileContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const navigate = useNavigate();
  const chatContext = useChatContext()
  const [cookies] = useCookies(['userData']);
  const globalContext = useWebSocketContext();
  const barInfos = useNavbarContext();

const fetchFriends = async (id: string) => {
  try {
    const response = await axiosAuth.get(`/user/friends-list/${id}`);

    if (Array.isArray(response.data.friends_list)) {
      const friendsInfo = response.data.friends_list.map((friend: any) => ({
        id: friend.id,
        username: friend.username,
        full_name: friend.full_name,
        level: parseInt(friend.level, 10),
        status: friend.status,
        profile_img: friend.profile_img,
      }));

      setFriends(friendsInfo);
    } else {
      console.error('Unexpected response format:', response.data);
    }
  } catch (error) {
    // console.error('Error fetching friends list:', error);
  }
};

  useEffect(() => {
    if (id) {
      fetchFriends(id);
      globalContext.setUpdateFriendList(false);
    }
  }, [id, globalContext.updateFriendList]);

  const handleProfileSwitch = (friendId: string) => {
    profileInfo.setTheId(friendId);
    navigate(`/profile/${friendId}`);
  }

  const handleMessageUser = (friend: Friend) => {
    if (friend.id !== cookies.userData.id) {
      if (!barInfos.isWide) {
        chatContext.setIsConvSelected(true);
        barInfos.setBarBottom(false);
        barInfos.setBarTop(false);
      }
      chatContext.setIsConvOn(true);
      chatContext.setSelectedUserChat(friend);
      navigate(`/chat/${friend.id}`);
    }
  }

  function truncateString(str: string, num: number) {
    if (str.length > num) {
      return str.slice(0, num) + "...";
    }
    return str;
  }

  return (
    <>
      <div className='h-12 flex justify-between'>
        <div className='flex items-center text-lg font-bold ml-5'>
          FRIENDS
        </div>
      </div>
      <div className='flex flex-col max-h-[700px] overflow-y-scroll maxTablet2:max-h-52 maxTablet2:overflow-y-scroll'>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.id} className='my-2 flex items-center mx-5 gap-2'>
              <div className='w-14 rounded-full' onClick={() => handleProfileSwitch(friend.id.toString())}>
                <img src={`${theHost}:${port}${friend.profile_img}`} alt="friend profile" className='rounded-full'/>
              </div>
              <div className='flex-1' onClick={() => handleProfileSwitch(friend.id.toString())}>
                <div className='font-bold'>{truncateString(friend.username, 10)}</div>
                <div className='font-light text-xs'>Level {friend.level}</div>
              </div>
              { friend.id === cookies.userData.id ?
              <div></div> : 
              <div className='flex gap-2 my-2 items-center'>
                <button 
                  className="p-[5px] rounded-full dark:text-white text-black border-[0.8px] dark:border-[#737373] border-[#777777] flex items-center justify-center hover:bg-[#dedede] active:bg-[#dedede] dark:hover:bg-[#2e2e2e] dark:active:bg-[#2e2e2e]"
                  type="submit"
                  onClick={() => handleMessageUser(friend)}
                >
                  <CiMail className="text-xl" />
                </button>
              </div>
              }
            </div>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center h-screen">
              <div className="flex justify-center items-center m-5">
                  <img src={noFridens} alt="No Friends" className="w-52" />
              </div>
          </div>
        )}
      </div>
    </>
  )
}

export default FriendsList