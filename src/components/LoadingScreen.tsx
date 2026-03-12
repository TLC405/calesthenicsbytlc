import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const COLORS = [
  'hsl(270, 100%, 65%)',
  'hsl(217, 91%, 60%)',
  'hsl(150, 100%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(25, 95%, 53%)',
  'hsl(174, 72%, 40%)',
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const prog = setInterval(() => setProgress(prev => Math.min(prev + 2, 95)), 40);
    const col = setInterval(() => setColorIdx(prev => (prev + 1) % COLORS.length), 350);
    return () => { clearInterval(prog); clearInterval(col); };
  }, []);

  const color = COLORS[colorIdx];

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full opacity-10 transition-colors duration-300" style={{ backgroundColor: color, filter: 'blur(80px)' }} />
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center animate-scale-in transition-all duration-300"
          style={{ backgroundColor: color, boxShadow: `0 0 50px ${color}40` }}
        >
          <Zap className="w-10 h-10 text-white" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-black text-foreground uppercase tracking-[-0.03em] leading-none">
            I GOT THE <span className="transition-colors duration-300" style={{ color }}>POWER</span>
          </h1>
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.4em]">Initializing...</p>
        </div>

        <div className="w-48 h-[3px] bg-border/30 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-100 ease-out" style={{ width: `${progress}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}60` }} />
        </div>
      </div>
    </div>
  );
}
