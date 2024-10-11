import { useEffect, useState } from 'react';

const LoadingPage: React.FC = () => {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const animateBall = () => {
      setBallPosition((prev) => {
        const newX = prev.x + direction.x * 2;
        const newY = prev.y + direction.y * 3;
        let newDirectionX = direction.x;
        let newDirectionY = direction.y;

        if (newX <= 0 || newX >= 100) newDirectionX *= -1;
        if (newY <= 0 || newY >= 100) newDirectionY *= -1;

        setDirection({ x: newDirectionX, y: newDirectionY });

        return {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        };
      });
    };

    const interval = setInterval(animateBall, 30);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      <div className="w-80 h-80 bg-green-200 rounded-full shadow-lg relative overflow-hidden border-4 border-green-400">
        <div 
          className="w-6 h-6 bg-white rounded-full absolute shadow-md transition-all duration-30 ease-linear"
          style={{ 
            left: `calc(${ballPosition.x}% - 12px)`, 
            top: `calc(${ballPosition.y}% - 12px)`,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        />
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-0.5 bg-white opacity-50" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-64 bg-white opacity-50" />
      </div>
      
      <h1 className="text-3xl font-bold mt-8 text-green-700">Loading Ping Pong</h1>
      
      <div className="mt-4 flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="w-3 h-3 bg-green-500 rounded-full animate-ping"
            style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1s' }}
          />
        ))}
      </div>

      <div className="mt-4 text-green-600 font-medium">
        Preparing your game, chat, and profiles...
      </div>
    </div>
  );
};

export default LoadingPage;