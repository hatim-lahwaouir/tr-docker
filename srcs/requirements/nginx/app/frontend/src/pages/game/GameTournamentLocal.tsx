import { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import { IoCaretDownCircle, IoCaretUpCircle } from 'react-icons/io5';
import { useTounamentLocalContext } from '../../context/TounamentLocalContext';
import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

interface Userx {
	profile_img: string | null;
	trAlias: string | null;
}

const GameLocal: React.FC = () => {
  const {gameSetting} = useGameContext()
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cadreRef = useRef<HTMLDivElement>(null);
  var scoreTime = Date.now();
  const [player1score, setPlayer1score] = useState<number>(0)
  const [player2score, setPlayer2score] = useState<number>(0)
  const [player1, setPlayer1] = useState<Userx>({profile_img: null,trAlias: null})
  const [player2, setPlayer2] = useState<Userx>({profile_img: null,trAlias: null})
  const [player1isscore, setPlayer1isscore] = useState<boolean>(false)
  const [player2isscore, setPlayer2isscore] = useState<boolean>(false)
  const [isfinish, setisfinish] = useState<boolean>(false)
  const [thewinner, setthewinner] = useState<string | null>('')
  const navigate = useNavigate();
  const {startedMatche, setWinner,isInTourn,currentMatch} = useTounamentLocalContext();
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [thismacth, setThismatch] = useState<string>('');

  useEffect(() => {
    if(isfinish){
      timerRef.current = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timerRef.current!);
            navigate('/tournament_local')
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
    }
  }, [isfinish]);

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigate('/tournament_local')
  };

  useEffect(() => {
		document.title = 'Game | Game Table';
	  }, []);

  useEffect(()=>{
    if (!isInTourn)
      navigate('/tounament-lobby')
    setThismatch(currentMatch);
    setPlayer1(startedMatche.player1)
    setPlayer2(startedMatche.player2)
  },[])


  useEffect(()=>{
    if(player1isscore)
      setPlayer1score(player1score + 1);
    if(player2isscore)
      setPlayer2score(player2score + 1);
  },[player1isscore, player2isscore])

	const win_w = 800;
	const win_h = 500;
  const ball = {
	r : 15,
	x : 800 / 2,
	y : 500 / 2,
	w : 30 ,
	get top() {
		return this.y - this.r;
	},
	get bottom(){
		return this.y + this.r;
	},
	get left(){
		return this.x - this.r;
	},
	get right(){
		return this.x + this.r;
	},
	speed_X : -5,
    speed_Y : 0,
	speed: 5,
	max_speed: 23,
	step: 0.5
}

const user1 = {
	w : 15,
    h : 150,
    x : 5,
    y : 500 / 2 -  150 /2,
    score: 0,
    dv : 0,
    speed: 10,
	get top(){
		return this.y;
	},
	get left(){
		return this.x;
	},
	get right(){
		return this.x + this.w;
	},
	get bottom(){
		return this.y + this.h;
	},
}

const user2 = {
    w : 15,
    h : 150,
    x : 800 - 15 - 5,
    y : 500 / 2 -  150 /2,
    score: 0,
    dv : 0,
    speed: 10,
	get top(){
		return this.y;
	},
	get left(){
		return this.x;
	},
	get right(){
		return this.x + this.w;
	},
	get bottom(){
		return this.y + this.h;
	},
}
 
function handleKeyDown(event : KeyboardEvent) {
    
    if (event.key === 'w' || event.key === 'W') {
        user1.dv = -user1.speed;
    } else if (event.key === 's' || event.key === 'S') {
        user1.dv = user1.speed;
    }
    if (event.key === 'ArrowUp' || event.key === 'Up') {
        user2.dv = -user2.speed;
    } else if (event.key === 'ArrowDown' || event.key === 'Down') {
        user2.dv = user2.speed;
    }
}

function handleKeyUp(event : KeyboardEvent) {
    if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
        user1.dv = 0;
    }
    if (event.key === 'ArrowUp' || event.key === 'Up' || event.key === 'ArrowDown' || event.key === 'Down') {
        user2.dv = 0;
    }
}


function drawBackGround(ctx:CanvasRenderingContext2D, nis :number){
  ctx.fillStyle = "Black";
  if (gameSetting?.tableColor)
	  ctx.fillStyle = gameSetting?.tableColor;
	ctx.fillRect(0,0,win_w * nis,win_h *nis);
}
function drawText(x :number , y:number, text:string, color:string, ctx:CanvasRenderingContext2D,  nis :number){
	ctx.fillStyle = color;
	ctx.font = nis * 50 +"px Arial";
	ctx.fillText(text, x * nis, y * nis);
}
const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, ctx :CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
};
function drawPlayer(obj:typeof user1 | typeof user2, ctx :CanvasRenderingContext2D,  nis :number){
	ctx.fillStyle = "white";
  if (gameSetting?.paddleColor)
	  ctx.fillStyle = gameSetting?.paddleColor;
  drawRoundedRect(obj.x * nis,obj.y*nis,obj.w *nis,obj.h *nis,7*nis,ctx)
}

function drawBall(obj:typeof ball, ctx:CanvasRenderingContext2D,  nis :number){
  ctx.fillStyle = "white";
  if (gameSetting?.ballColor)
	  ctx.fillStyle = gameSetting?.ballColor;
	ctx.beginPath();
	ctx.arc(obj.x *nis,obj.y *nis,obj.r*nis,0,Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
}


function RandomDir() {
	return Math.random() < 0.5 ? -1 : 1;
}

function ballRestart(ctx:CanvasRenderingContext2D,  nis :number, currentTime:number){
  setPlayer1isscore(false);
  setPlayer2isscore(false);
	let elapsed = currentTime - scoreTime;
	ball.x = 800 / 2;
	ball.y = 500 / 2;

  if(!isfinish){
    if (elapsed < 800)
      drawText(win_w / 2 - 15, win_h / 2 + 60 ,"3", "RED", ctx, nis);
    else if (elapsed < 2000)
      drawText(win_w / 2 - 15, win_h / 2 + 60 ,"2", "RED", ctx, nis);
    else if (elapsed < 3000)
      drawText(win_w / 2 - 15, win_h / 2 + 60 ,"1", "RED", ctx, nis);
    if (elapsed < 3000){
      ball.speed_X = 0;
      ball.speed_Y = 0;
    }
    else {
      ball.speed = 5;
      ball.speed_X = ball.speed * RandomDir();
      ball.speed_Y = 1 * RandomDir();
      scoreTime = 0;
    }
  }
}
function collision(b:typeof ball, p:typeof user1 | typeof user2){
	return b.right >= p.left && b.bottom >= p.top
		&& b.left <= p.right && b.top  <= p.bottom;
}

const onTouchStart = (event: Event) => {
  if ((event as CustomEvent).detail === "user1UP")
    user1.dv = -user1.speed;
  else if ((event as CustomEvent).detail === "user1DOWN")
    user1.dv = user1.speed;
  if ((event as CustomEvent).detail === "user2UP")
    user2.dv = -user2.speed;
  else if ((event as CustomEvent).detail === "user2DOWN")
    user2.dv = user2.speed;    
};


const onTouchEnd = (event: Event) => {
  if ((event as CustomEvent).detail === "user1STOP") {
    user1.dv = 0;
}
if ((event as CustomEvent).detail === "user2STOP") {
    user2.dv = 0;
}

    
};

function eventCheck(){
	document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('TouchStart', onTouchStart);
    document.addEventListener('TouchEnd', onTouchEnd);
    // document.addEventListener('customTouchEnd', onCustomTouchEnd);
}

function ballAnimation(){
	ball.x+=ball.speed_X;
	ball.y+=ball.speed_Y;
	if (ball.top <= 0){
		ball.y = ball.r;
		ball.speed_Y *= -1;
	}
	else if (ball.bottom >= win_h){
		ball.y = win_h - ball.r
		ball.speed_Y *= -1;
	}

	if (ball.left <= 0){
		scoreTime = Date.now();
    setPlayer2isscore(true);
	}
	if (ball.right >= win_w){
		scoreTime = Date.now();
    setPlayer1isscore(true);
	}

	let player;
	if (ball.x > win_w / 2)
		player = user2;
	else
		player = user1;
	if (collision(ball, player)){
		// playHitSound();
		if ((Math.abs(ball.right - player.left) <= ball.w && ball.speed_X > 0)
			|| (Math.abs(ball.left - player.right) <= ball.w && ball.speed_X < 0))
		{
			let collidePoint = ball.y - (player.y + player.h / 2)
			collidePoint = collidePoint / (player.h / 2);
			let angleRad = collidePoint * Math.PI/4 ;
		
			let dir ;
			let dir2 ;
			if (ball.left > win_w / 2){
				dir2 = -1;
				dir = -1;
			}
			else{
				dir2 = 1;
				dir = 1;
			}
			ball.speed_X = dir * ball.speed * Math.cos(angleRad);
			ball.speed_Y = dir * ball.speed * Math.sin(angleRad) * dir2;
			if (ball.speed < ball.max_speed)
				ball.speed += ball.step;
		}
		else if (Math.abs(ball.bottom - player.top) < ball.w && ball.speed_Y > 0){
				ball.speed_Y *= -1;
		}
		else if (Math.abs(ball.top - player.bottom) < ball.w && ball.speed_Y < 0)
				ball.speed_Y *= -1;
	}
}
const playersAnimation=()=>{
	user1.y += user1.dv;
	if (user1.top <= 0)
		user1.y = 0;
	else if(user1.bottom >= win_h)
		user1.y = win_h - user1.h;
	user2.y += user2.dv;
	if (user2.top <= 0)
		user2.y = 0;
	else if(user2.bottom >= win_h)
		user2.y = win_h - user2.h;
}

  useEffect(() => {
    // Set up the interval
	const cvs = canvasRef.current;
    if (!cvs) return;
	const cadr = cadreRef.current;
	if (!cadr) return;
	const ctx = cvs.getContext('2d');
    if (!ctx) return;
	cvs.style.backgroundColor = "BLACK";
	cvs.height = 500;
	cvs.width = cadr.offsetWidth;
	let nis = cadr.offsetWidth / 800;
    var currentTime = Date.now();
	

    const intervalId = setInterval(() => {
		nis = cadr.offsetWidth / 800;
		cvs.width = cadr.offsetWidth;
		cvs.height = 500 * nis;
		currentTime = Date.now();
		eventCheck();
		ctx.clearRect(0, 0, win_w, win_h);
		drawBackGround(ctx, nis)
		drawPlayer(user1, ctx, nis);
		drawPlayer(user2, ctx, nis);
		if (scoreTime)
			ballRestart(ctx, nis, currentTime)
		drawBall(ball, ctx, nis);
    if(isfinish === false){
      ballAnimation();
      playersAnimation();
    }
      ; // Update the state every second
    }, 1000/60);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [isfinish]); // Empty dependency array to run effect once, when component mounts

  useEffect(()=>{
    if (player1score >= 5 || player2score >= 5){
      if (player1score >= 5){
        setWinner(startedMatche.player1)
        setthewinner(startedMatche.player1.trAlias)
      }
      else{
        setWinner(startedMatche.player2)
        setthewinner(startedMatche.player2.trAlias)
      }
      setisfinish(true);
    }

  },[player1score, player2score])


  const Winpanel = () =>{

    return (
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed z-50 inset-0 flex items-center justify-center overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"  />
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
          {
            thismacth === 'Final' && 
            <>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Victory Achieved!
              </h2>
              <p className="text-xl text-[#191919] dark:text-gray-300 mb-6">
                A champion has been crowned
              </p>
            </>
          }
          
          <div className="bg-gray-100 dark:bg-[#191919] rounded-lg p-4 mb-6">
            <p className="text-2xl font-semibold text-[#191919] dark:text-gray-100">
              {thewinner}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              is the winner!
            </p>
          </div>
          <button
            onClick={handleClose}
            className="bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-800 dark:hover:bg-gray-200 transform hover:scale-105"
          >
            { thismacth !== 'Final' ? 'Proceed to Next Round' : 'Back To Tournament'}
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 py-2">
            {thismacth !== 'Final' ? `Proceeding to Next Round in ${countdown} seconds...` : `Back To Tournament in ${countdown} seconds...` }
          </p>
        </div>
      </motion.div>
    </motion.div>

    )
  }

  const handleTouchStart = (str:string) => {
    const touchStartEvent = new CustomEvent('TouchStart', {
      detail: str
    });
    document.dispatchEvent(touchStartEvent);
  };
  const handleTouchEnd = (str:string) => {
    const touchEndEvent = new CustomEvent('TouchEnd', {
      detail: str
    });
    document.dispatchEvent(touchEndEvent);
  };



  return (
    <div>
      
      {
        isfinish && Winpanel()
      }
      <div className="flex flex-col text-black dark:text-white bg-white dark:bg-black mobile:h-screen">
        <div className=" min-h-16"></div>
        <div className="flex mobile:flex-row flex-col-reverse flex-1 mobile:max-h-[calc(100vh-4rem)]">
          <div className="mobile:w-16 w-full maxMobile:h-16   flex"></div>
          <div className="flex h-[calc(100vh-8rem)] justify-center flex-1">
            <div className='flex flex-col flex-1 max-w-6xl gap-5 p-4'>
              <div className="flex-row justify-center items-center">
                <div className='flex flex-col flex-grow justify-center items-center w-full'>
                  <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-600 md:text-5xl lg:text-6xl dark:text-white'>
                    Ping Pong Game
                  </h1>
                  <div className="flex justify-between items-center w-full mb-4 text-2xl text-white">
                    <div className='flex items-center gap-2'>
                      <img src={player1.profile_img ? player1.profile_img : ''} alt="" className="rounded-full w-10"/>
                      <div className='text-xl dark:text-white text-black'>{player1.trAlias}</div>
                    </div>
                    <div className='flex gap-4'>
                      <div className="text-blue-500 text-2xl">{player1score}</div>
                      <div className="text-red-500 text-2xl">{player2score}</div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='text-xl dark:text-white text-black'>{player2.trAlias}</div>
                      <img src={player2.profile_img?player2.profile_img:''} alt="" className="rounded-full w-10"/>
                    </div>
                  </div>
                  <div className='flex w-full justify-center' ref={cadreRef}>
                    <canvas
                        ref={canvasRef}
                        className="border-4 border-cyan-100 rounded-lg shadow"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                  </div>
                </div>
                <div className='h-80 tablet:hidden flex gap-10 mt-5'>
                  <div className='flex-1 flex flex-col text-center  items-center text-8xl gap-10 text-blue-500'>
                    <div className='flex-1 items-center flex cursor-pointer w-full justify-center'
                    onMouseDown={() => handleTouchStart("user1UP")}
                    onMouseUp={() => handleTouchEnd('user1STOP')}
                    onTouchStart={() => handleTouchStart("user1UP")}
                    onTouchEnd={() => handleTouchEnd('user1STOP')}
                    ><IoCaretUpCircle /></div>
                    <div className='flex-1 items-center flex cursor-pointer w-full justify-center' 
                    onMouseDown={() => handleTouchStart("user1DOWN")}
                    onMouseUp={() => handleTouchEnd('user1STOP')}
                    onTouchStart={() => handleTouchStart("user1DOWN")}
                    onTouchEnd={() => handleTouchEnd('user1STOP')}
                    ><IoCaretDownCircle /></div>
                  </div>
                  <div className='flex-1 flex flex-col text-center  items-center text-8xl gap-10 text-red-500'>
                    <div className='flex-1 items-center flex cursor-pointer w-full justify-center'
                    onMouseDown={() => handleTouchStart("user2UP")}
                    onMouseUp={() => handleTouchEnd('user2STOP')}
                    onTouchStart={() => handleTouchStart("user2UP")}
                    onTouchEnd={() => handleTouchEnd('user2STOP')}
                    ><IoCaretUpCircle /></div>
                    <div className='flex-1 items-center flex cursor-pointer w-full justify-center'
                    onMouseDown={() => handleTouchStart("user2DOWN")}
                    onMouseUp={() => handleTouchEnd('user2STOP')}
                    onTouchStart={() => handleTouchStart("user2DOWN")}
                    onTouchEnd={() => handleTouchEnd('user2STOP')}
                    ><IoCaretDownCircle /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLocal;