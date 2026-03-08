import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const CATEGORY_COLORS = [
  'hsl(0, 84%, 60%)',
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(25, 95%, 53%)',
  'hsl(270, 76%, 55%)',
  'hsl(174, 72%, 40%)',
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const prog = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 95));
    }, 40);
    const col = setInterval(() => {
      setColorIdx(prev => (prev + 1) % CATEGORY_COLORS.length);
    }, 400);
    return () => { clearInterval(prog); clearInterval(col); };
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center animate-scale-in shadow-lg transition-colors duration-300"
          style={{ backgroundColor: CATEGORY_COLORS[colorIdx] }}
        >
          <Zap className="w-10 h-10 text-white" />
        </div>

        {/* Brand */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground uppercase tracking-tighter leading-none">
            I GOT THE <span className="transition-colors duration-300" style={{ color: CATEGORY_COLORS[colorIdx] }}>POWA</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.4em]">
            Loading...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: CATEGORY_COLORS[colorIdx],
            }}
          />
        </div>
      </div>
    </div>
  );
}
