import {  useEffect, useRef } from 'react';

const BotGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cadreRef = useRef<HTMLDivElement>(null);
  var scoreTime = Date.now();
	const win_w = 800;
	const win_h = 500;
  const ball = {
	r : 25,
	x : 800 / 2,
	y : 500 / 2,
	w : 30 ,
	color : "WHITE",
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
	w : 25,
    h : 150,
    x : 40,
    y : 500 / 2 -  150 /2,
    score: 0,
    dv : 0,
    speed: 10,
    color : "#FFFFFF",
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
    w : 25,
    h : 150,
    x : 800 - 25 - 40,
    y : 500 / 2 -  150 /2,
    score: 0,
    dv : 0,
    speed: 10,
    color : "#FFFFFF",
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
 


function drawNit(ctx:CanvasRenderingContext2D, nis :number ){
	ctx.fillStyle = "WHITE";
	ctx.fillRect(win_w *nis  / 2, 0 , 1 * nis, win_h *nis);
}
function drawBackGround(ctx:CanvasRenderingContext2D, nis :number){
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,win_w * nis,win_h *nis);
}

function drawPlayer(obj:typeof user1 | typeof user2, ctx :CanvasRenderingContext2D,  nis :number){
	ctx.fillStyle = obj.color;
	ctx.fillRect(obj.x * nis,obj.y*nis,obj.w *nis,obj.h *nis);
}

function drawBall(obj:typeof ball, ctx:CanvasRenderingContext2D,  nis :number){
	ctx.fillStyle = obj.color;
	ctx.beginPath();
	ctx.arc(obj.x *nis,obj.y *nis,obj.r*nis,0,Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
}


function RandomDir() {
	return Math.random() < 0.5 ? -1 : 1;
}



function ballRestart(){
	// let elapsed = currentTime - scoreTime;
	ball.x = 800 / 2;
	ball.y = 500 / 2;

	// if (elapsed < 800)
	// 	drawText(win_w / 2 - 15, win_h / 2 + 60 ,"3", "RED", ctx, nis);
	// else if (elapsed < 2000)
	// 	drawText(win_w / 2 - 15, win_h / 2 + 60 ,"2", "RED", ctx, nis);
	// else if (elapsed < 3000)
	// 	drawText(win_w / 2 - 15, win_h / 2 + 60 ,"1", "RED", ctx, nis);
	// if (elapsed < 3000){
	// 	ball.speed_X = 0;
	// 	ball.speed_Y = 0;
	// }
	// else {
		ball.speed = 5;
		ball.speed_X = ball.speed * RandomDir();
		ball.speed_Y = ball.speed;
		scoreTime = 0;
	// }
}
function collision(b:typeof ball, p:typeof user1 | typeof user2){
	return b.right > p.left && b.bottom > p.top
		&& b.left < p.right && b.top  < p.bottom;
}

function eventCheck(){
	// document.addEventListener('keydown', handleKeyDown);
    // document.addEventListener('keyup', handleKeyUp);
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
		user2.score++;
	}
	if (ball.right >= win_w){
		scoreTime = Date.now();
		user1.score++;
	}

	let player;
	if (ball.x > win_w / 2)
		player = user2;
	else
		player = user1;
	if (collision(ball, player)){
		// playHitSound();
		if ((Math.abs(ball.right - player.left) < ball.w && ball.speed_X > 0)
			|| (Math.abs(ball.left - player.right) < ball.w && ball.speed_X < 0))
		{
			ball.speed_X *= -1;

		}
		else if (Math.abs(ball.bottom - player.top) < ball.w && ball.speed_Y > 0){
				ball.speed_Y *= -1;
		}
		else if (Math.abs(ball.top - player.bottom) < ball.w && ball.speed_Y < 0)
				ball.speed_Y *= -1;
	}
}
function playersAnimation(){
	user1.y = ball.y - 150 / 2;
	user2.y = ball.y - 150 / 2;
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
	

    const intervalId = setInterval(() => {
		nis = cadr.offsetWidth / 800;
		cvs.width = cadr.offsetWidth;
		cvs.height = 500 * nis;
		eventCheck();
		ctx.clearRect(0, 0, win_w, win_h);
		drawBackGround(ctx, nis)
		drawNit(ctx, nis);
		drawPlayer(user1, ctx, nis);
		drawPlayer(user2, ctx, nis);
		if (scoreTime)
			ballRestart()
		drawBall(ball, ctx, nis);
		ballAnimation();
		playersAnimation();
      ; // Update the state every second
    }, 1000/60);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run effect once, when component mounts

  return (
    <div className='w-full' ref={cadreRef} >
		<canvas ref={canvasRef} ></canvas>
    </div>
  );
};

export default BotGame;
