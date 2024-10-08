import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavbarContext } from '../../context/NavbarContext';
import frindPic from "../../assets/2mans.png"
import localPic from "../../assets/RPS-man.png"

const Games = () => {
	const navigate = useNavigate();
	const barInfo = useNavbarContext();

	useEffect(() => {
		document.title = 'Games';
	}, []);
  
  return (
    <div>
      <div className="min-h-screen flex flex-col  text-black dark:text-white bg-white dark:bg-black">
        <div className="  min-h-16 "></div>
        <div className=" flex-1 flex mobile:flex-row flex-col-reverse ">
            <div className=" mobile:w-16 w-full maxMobile:h-16   flex"></div>

			<div className='flex justify-center items-center w-full min-h-[calc(100vh-4rem)] p-10'>
				<div className='flex flex-col tablet3:flex-row gap-10 w-full max-w-[1200px]'>
					<div className={`flex-1 mobile:min-h-[350px] min-h-[250px] rounded-lg shadow-2xl flex flex-col justify-between p-8 cursor-pointer
						${ barInfo.isDark ? 'bg-gradient-to-br from-[#4B4B4B] via-black to-[#4B4B4B]' : 'bg-gradient-to-br from-[#B7B7B7] via-white to-[#B7B7B7]'}`}
                        onClick={() => {navigate('/game');}}
						style={{
                            backgroundImage: `url(${frindPic})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat'
                        }}
						>
						<div className='text-2xl flex font-bold text-black relative'>
							<div className='text-white text-4xl h-full blur-xl opacity-100'>Ping Pong <br /> Game</div>
							<div className='flex-1 absolute'>Ping Pong <br /> Game</div>
							
						</div>
							
						</div>
						<div className={`flex-1 mobile:min-h-[350px] min-h-[250px] rounded-lg shadow-2xl flex flex-col justify-between p-8 cursor-pointer
							${ barInfo.isDark ? 'bg-gradient-to-br from-[#4B4B4B] via-black to-[#4B4B4B]' : 'bg-gradient-to-br from-[#B7B7B7] via-white to-[#B7B7B7]'}`}
                            onClick={() => {navigate('/WaitingRoom');}}
							style={{
								backgroundImage: `url(${localPic})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat'
                            }}
                            >
								<div className='text-2xl flex font-bold text-black relative'>
									<div className='text-white text-4xl h-full blur-xl opacity-100'>Rock Paper Scissors <br /> Game</div>
									<div className='flex-1 absolute'>Rock Paper Scissors <br /> Game</div>
							
								</div>
							
						</div>
					</div>
					</div>

                </div>
            </div>
    </div>
	
  );
}

export default Games;
