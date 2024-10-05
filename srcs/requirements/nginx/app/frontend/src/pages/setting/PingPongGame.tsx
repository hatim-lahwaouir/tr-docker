import { useEffect, useRef, useState } from "react";

const PingPongGame = (pros:any) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [nis, setNis] = useState<number>(1);

  const win_w = 800;
  const win_h = 500;


  const ball = {
    r: 30,
    x: win_w / 2 ,
    y: win_h / 2,
    w: 30,
    color: '#'+pros.ball,
  };

  const user1 = {
    w: 30,
    h: 200,
    x: 10,
    y: win_h / 2 - 200 / 2,
    color: '#'+pros.paddle,
  };

  const user2 = {
    w: 30,
    h: 200,
    x: win_w - 30 -10,
    y: win_h / 2 - 200 / 2,
    color: '#'+pros.paddle,
  };

  // Draw the player paddles
  const drawPlayer = (obj: any) => {
    if (context) {
      context.fillStyle = obj.color;
      context.fillRect(obj.x * nis, obj.y * nis, obj.w * nis, obj.h * nis);
    }
  };

  // Draw the ball
  const drawBall = (obj: any) => {
    if (context) {
      context.fillStyle = obj.color;
      context.beginPath();
      context.arc(obj.x * nis, obj.y * nis, obj.r * nis, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    }
  };


  // Game loop
  const game = () => {
    if (!canvasRef.current) return;
    const cadr = canvasRef.current.parentElement;
    if (cadr) {
      setNis(cadr.offsetWidth / 800);
      canvasRef.current.width = cadr.offsetWidth;
      canvasRef.current.height = 500 * nis;
    }
    if (context) {
      context.clearRect(0, 0, win_w, win_h);
      drawBackGround();
    //   drawNit();
      drawPlayer(user1);
      drawPlayer(user2);
      drawBall(ball);
    }
  };

  // Draw the background
  const drawBackGround = () => {
    if (context) {
      context.fillStyle = '#'+pros.table;
      context.fillRect(0, 0, win_w * nis, win_h * nis);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) setContext(ctx);
    }
	game();
	
  }, [nis, context, pros]);

  return (
    <div id="cadre" className="flex flex-col  w-full border-white border rounded-xl">
      <canvas ref={canvasRef} className="w-full rounded-xl"></canvas>
    </div>
  );
};

export default PingPongGame;