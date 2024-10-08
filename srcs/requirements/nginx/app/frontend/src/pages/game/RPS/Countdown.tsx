import { useEffect, useState } from "react";

const Countdown: React.FC<{ seconds: number; onComplete: () => void }> = ({ seconds, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(seconds);
  
    useEffect(() => {
      if (timeLeft === 0) {
        onComplete();
        return;
      }
  
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
  
      return () => clearInterval(timer);
    }, [timeLeft, onComplete]);
  
    return (
      <div className="text-2xl font-bold">{timeLeft}</div>
    );
  };

  export default Countdown;