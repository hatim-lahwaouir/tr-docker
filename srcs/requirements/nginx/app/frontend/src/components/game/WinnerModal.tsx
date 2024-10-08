import { useEffect, useRef, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Winner {
  username: string;
  isInTournament: boolean;
}

interface WinnerModalProps {
  winner: Winner;
  onClose: (inTournament: boolean) => void;
  inTournament: boolean;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, inTournament }) => {
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timerRef.current!);
          // Use setTimeout to delay the onClose call
          setTimeout(() => onClose(inTournament), 0);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [inTournament, onClose]);

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onClose(inTournament);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed z-50 inset-0 flex items-center justify-center overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Trophy size={80} className="mx-auto text-gray-800 dark:text-gray-200 mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Victory Achieved!
          </h2>
          <p className="text-xl text-[#191919] dark:text-gray-300 mb-6">
            A champion has been crowned
          </p>
          <div className="bg-gray-100 dark:bg-[#191919] rounded-lg p-4 mb-6">
            <p className="text-2xl font-semibold text-[#191919] dark:text-gray-100">
              {winner.username}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              is the winner!
            </p>
          </div>
          <button
            onClick={handleClose}
            className="bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-800 dark:hover:bg-gray-200 transform hover:scale-105"
          >
            {inTournament ? "Proceed to Next Round" : "Return to Lobby"}
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 py-2">
            {inTournament ? `Proceeding to Next Round in ${countdown} seconds...` : `Returning to Lobby in ${countdown} seconds...`}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WinnerModal;
