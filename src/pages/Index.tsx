import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, Brain, CalendarDays, ChevronDown, Play, Target } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { 
      icon: Dumbbell, 
      label: '120+ Exercises', 
      desc: 'Push, Pull, Legs, Core, Skills & Mobility — all with HD video tutorials',
      accent: 'border-l-red-500'
    },
    { 
      icon: CalendarDays, 
      label: 'Session Planner', 
      desc: 'Build templates, log sets & track every training day on the calendar',
      accent: 'border-l-blue-500'
    },
    { 
      icon: Brain, 
      label: 'AI Coach', 
      desc: 'Intelligent guidance for programming, form cues & progression paths',
      accent: 'border-l-green-500'
    },
    { 
      icon: Target, 
      label: 'Skill Progressions', 
      desc: 'Master advanced movements with structured progressions from basic to elite',
      accent: 'border-l-purple-500'
    },
  ];

  return (
    <div className="min-h-screen bg-foreground flex flex-col relative overflow-hidden">
      {/* Blueprint grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      
      {/* Radial glow behind logo */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/8 rounded-full blur-[150px]" />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo — large & prominent */}
          <div 
            className="flex justify-center transition-all duration-700"
            style={{ 
              opacity: loaded ? 1 : 0, 
              transform: loaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)' 
            }}
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-2 border-background/20 overflow-hidden shadow-2xl relative">
              <img 
                src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png" 
                alt="TLC's Workout" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Title block — staggered reveals */}
          <div className="space-y-4">
            <p 
              className="text-background/30 text-[10px] md:text-xs uppercase tracking-[0.4em] font-mono transition-all duration-700 delay-150"
              style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)' }}
            >
              Calisthenics Training Platform
            </p>
            <h1 
              className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-background leading-[1.05] transition-all duration-700 delay-300"
              style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(15px)' }}
            >
              TLC's Hybrid
            </h1>
            <p 
              className="text-background/40 text-base md:text-lg font-light max-w-md mx-auto leading-relaxed transition-all duration-700 delay-500"
              style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)' }}
            >
              Master your bodyweight. Track every session. Train smarter.
            </p>
          </div>

          {/* CTA */}
          <div 
            className="space-y-3 transition-all duration-700 delay-700"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)' }}
          >
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="group bg-background text-foreground hover:bg-background/90 text-base px-12 py-7 font-semibold shadow-2xl"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-background/25 text-xs font-mono">
              Free · No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-700 delay-[900ms]"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)' }}
          >
            {features.map(({ icon: Icon, label, desc, accent }) => (
              <div 
                key={label} 
                className={`group p-4 md:p-5 rounded-xl border border-background/8 bg-background/[0.03] hover:bg-background/[0.06] transition-all duration-300 cursor-default border-l-[3px] ${accent}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-background/70" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-background/90 mb-1">{label}</h3>
                    <p className="text-xs text-background/35 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-4 h-4 text-background/15 animate-bounce" />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-background/8 py-4 text-center z-10">
        <p className="text-background/20 text-[10px] tracking-[0.3em] uppercase font-mono">
          Built for athletes who train with purpose
        </p>
      </div>
    </div>
  );
}
