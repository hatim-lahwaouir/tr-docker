// utils/Timer.ts
class Timer {
    private timeLeft: number;
    private intervalId: NodeJS.Timeout | null = null;
    private callback: () => void;
  
    constructor(seconds: number, callback: () => void) {
      this.timeLeft = seconds;
      this.callback = callback;
    }
  
    start() {
      this.intervalId = setInterval(() => {
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) {
          this.stop();
          this.callback();
        }
      }, 1000);
    }
  
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  
    getTimeLeft() {
      return this.timeLeft;
    }
  }
  
  export default Timer;
  