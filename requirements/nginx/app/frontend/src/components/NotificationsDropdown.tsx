import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from '../context/ProfileContext';
import { port, theHost } from '../config';

interface Notification {
  id: number;
  type: string;
  sender: string;
  username: string;
  profile_img: string;
  message?: string;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  handleAcceptDecline: (id: string, action: 'accept' | 'decline') => void;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  handleAcceptDecline,
  setShowNotifications
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const profileInfo = useProfileContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowNotifications]);

  const handleProfileSwitch = (friendId: string) => {
    profileInfo.setTheId(friendId);
    navigate(`/profile/${friendId}`);
  }

  return (
    <div ref={dropdownRef} className="absolute top-full right-0 mt-2 bg-white dark:bg-black shadow-lg rounded-xl p-2 w-72">
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div key={index} className="mb-2 last:mb-0">
            {notification.type === 'add_friend' ? (
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex gap-2 flex-grow min-w-0"
                onClick={() => {handleProfileSwitch(notification.id.toString())}}>
                  <div>
                      <img src={`${theHost}:${port}${notification.profile_img}`} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                  </div>
                  <p className="flex flex-col text-sm dark:text-white truncate">
                    <span className="font-semibold">{notification.username}</span>
                    <span className="text-gray-600 dark:text-gray-400"> wants to be friends</span>
                  </p>
                </div>
                <button
                  className="shrink-0 p-1 group"
                  onClick={() => handleAcceptDecline(notification.id.toString(), 'accept')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-current group-hover:text-green-500 transition-colors duration-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  className="shrink-0 p-1 group"
                  onClick={() => handleAcceptDecline(notification.id.toString(), 'decline')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-current group-hover:text-red-500 transition-colors duration-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
            )}
          </div>
        ))
      ) : (
        <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
          No new notifications
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;