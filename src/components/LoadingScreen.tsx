import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

export function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="premium-card p-12 flex flex-col items-center gap-6 animate-scale-in">
        {/* Logo with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-primary/30 rounded-2xl blur-xl animate-pulse" />
          <img 
            src={logo} 
            alt="TLC's Workout" 
            className="relative w-24 h-24 object-contain rounded-2xl shadow-lg"
          />
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-1">
            <span className="gradient-text">TLC's</span>{' '}
            <span className="text-foreground">Workout</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="w-3 h-3 text-gold" />
            <p className="text-sm">
              Loading your training{dots}
            </p>
            <Sparkles className="w-3 h-3 text-gold" />
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-gold shimmer" />
        </div>
      </div>
    </div>
  );
}
