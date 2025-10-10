import { useEffect, useState } from 'react';
import logo from '@/assets/logo.jfif';
import '@/styles/neumorph.css';

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
      <div className="neumorph p-12 rounded-3xl flex flex-col items-center gap-6">
        <img 
          src={logo} 
          alt="CalX Bulls Logo" 
          className="w-32 h-32 object-contain rounded-2xl shadow-lg"
        />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-2">CalX Bulls</h1>
          <p className="text-muted-foreground">
            Loading your workout planner{dots}
          </p>
        </div>
      </div>
    </div>
  );
}
