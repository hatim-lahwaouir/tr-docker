import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const [text, setText] = useState('');
  const fullText = 'Page not found 404';
  const navigate = useNavigate();

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  const handleGoHome = () => {
    navigate('/');
    // window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen dark:bg-black bg-white gap-10">
      <div className=''>

      </div>
      <h1 className="dark:text-white text-black text-4xl font-mono">
        {text}
        <span className="animate-pulse">|</span>
      </h1>
      <div className='flex'>
        <button 
          onClick={handleGoHome}
          className="flex items-center dark:bg-white bg-black dark:text-black text-white px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-300"
          >
          {/* <Home className="mr-2" size={20} /> */}
          Go Home
        </button>
        </div>
    </div>
  );
};

export default NotFoundPage;