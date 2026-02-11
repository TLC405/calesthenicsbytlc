import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { ArrowRight, Dumbbell, Brain, CalendarDays } from 'lucide-react';

import '@/styles/neumorph.css';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted)/0.06)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-10">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl border-2 border-background/20 overflow-hidden shadow-2xl">
            <img 
              src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png" 
              alt="TLC's Workout" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <p className="text-background/40 text-xs uppercase tracking-[0.3em] font-mono">
            Calisthenics Training Platform
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-background leading-[1.1]">
            TLC's Hybrid
          </h1>
          <p className="text-background/50 text-lg font-light max-w-xs mx-auto">
            Master your bodyweight. Track every session. Train smarter.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { icon: Dumbbell, label: '120+ Exercises' },
            { icon: CalendarDays, label: 'Session Planner' },
            { icon: Brain, label: 'AI Coach' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-background/10 bg-background/5">
              <Icon className="w-3.5 h-3.5 text-background/60" />
              <span className="text-xs text-background/60 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="group bg-background text-foreground hover:bg-background/90 text-base px-10 py-6 font-semibold shadow-2xl"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-background/30 text-xs">
            Free to use · No credit card required
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-background/10 py-4 text-center">
        <p className="text-background/25 text-xs tracking-widest uppercase font-mono">
          Built for athletes who train with purpose
        </p>
      </div>
    </div>
  );
}
