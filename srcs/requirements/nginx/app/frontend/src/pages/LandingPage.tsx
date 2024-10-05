import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import tv from "../assets/tv old.png";
import BotGame from "./game/BotGame";
import noise from "../assets/white-noise.jpeg";
import nozy from "../assets/nozy.jpeg";
import Loading from '../components/loading/Loading';

function LandingPage() {
  const navigate = useNavigate();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [, setLoadedCount] = useState(0);
  const totalImages = 3; // tv, noise, and nozy

  const handleImageLoad = () => {
    setLoadedCount(prev => {
      const newCount = prev + 1;
      if (newCount === totalImages) {
        setImagesLoaded(true);
      }
      return newCount;
    });
  };
  
  useEffect(() => {
		document.title = 'PLAY NOW';
	}, []);
  
  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col items-center">
      {!imagesLoaded && (
        <Loading/>
      )}
      <div className="flex flex-col flex-1 max-w-5xl m-5 items-center">
        <div className="flex text-center justify-center font-bold text-4xl tablet:text-6xl uppercase mt-5 tablet:mt-16">
          Join the Ping Pong Revolution!
        </div>
        <div className="text-center justify-center tablet:text-3xl font-light text-[#878787] mt-5 capitalize tablet:mt-16 max-w-2xl">
          Dive into the classic fun of <span className="uppercase text-white font-bold">Paddlevision!</span><br />
          Enjoy fast-paced ping pong that's easy to play and perfect for everyone!
        </div>
        <div className="max-w-96 flex flex-col items-center justify-center w-full mt-10 ">
          <div className="relative w-full">
            <div id="cadre" className="absolute flex flex-col bg-[#000000] right-[11%] bottom-[22%] left-[11%] top-[33%] items-center z-0">
              <BotGame />
            </div>
            <div
              id="cadre"
              className="absolute flex right-[7%] bottom-[20%] left-[8%] top-[30%] items-center z-0 animate-noisy opacity-[25%]"
              style={{
                backgroundImage: `url(${nozy})`,
              }}
            >
              <img src={nozy} alt="" className="hidden" onLoad={handleImageLoad} />
            </div>
            <img src={tv} alt="" className="absolute z-10 blur-[0.5px]" onLoad={handleImageLoad} />
            <img src={tv} alt="" onLoad={handleImageLoad} />
          </div>
          <div
            className="bg-white text-black h-20 flex justify-center items-center rounded-2xl w-full my-6 cursor-pointer"
            onClick={() => { navigate('/login') }}
          >
            <div className="font-bold text-4xl pointer-events-none">PLAY NOW</div>
          </div>
        </div>
      </div>
      <div className="items-end mb-5 uppercase">ft_transcendence © 2024</div>
      <div
        className={`absolute z-20 animate-noisy opacity-[10%] pointer-events-none -inset-[200%]`}
        style={{
          backgroundImage: `url(${noise})`,
        }}
      >
        <img src={noise} alt="" className="hidden" onLoad={handleImageLoad} />
      </div>
    </div>
  );
}

export default LandingPage;