import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-foreground flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl border border-background/10 overflow-hidden">
          <img 
            src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png" 
            alt="TLC's Workout" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-background mb-1">
            TLC's Hybrid
          </h1>
          <p className="text-xs text-background/40 font-mono">
            Loading{dots}
          </p>
        </div>
        <div className="w-32 h-0.5 bg-background/10 rounded-full overflow-hidden">
          <div className="h-full w-full bg-background/40 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>
    </div>
  );
}
