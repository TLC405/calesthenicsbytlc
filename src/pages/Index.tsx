import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Dumbbell, Brain, CalendarDays, Target, Volume2, VolumeX, Zap } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      const iframe = audioRef.current;
      if (musicPlaying) {
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  const features = [
    { icon: Dumbbell, label: '120+', desc: 'EXERCISES', color: 'bg-[hsl(0,84%,60%)]' },
    { icon: CalendarDays, label: 'PLAN', desc: 'SESSIONS', color: 'bg-[hsl(217,91%,60%)]' },
    { icon: Brain, label: 'AI', desc: 'COACH', color: 'bg-[hsl(270,76%,55%)]' },
    { icon: Target, label: 'SKILL', desc: 'PROGRESS', color: 'bg-[hsl(142,71%,45%)]' },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden select-none">
      <iframe
        ref={audioRef}
        src="https://www.youtube.com/embed/nm6DO_7px1I?enablejsapi=1&autoplay=0&loop=1&playlist=nm6DO_7px1I"
        allow="autoplay"
        className="hidden"
        title="background music"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Music toggle */}
      <button
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-50 w-10 h-10 border-2 border-foreground bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
        aria-label={musicPlaying ? 'Mute' : 'Play music'}
      >
        {musicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative z-10">
        <div className="w-full max-w-lg text-center space-y-6 sm:space-y-8">

          {/* Icon Logo */}
          <div
            className="flex justify-center transition-all duration-300"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(-20px)',
            }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-foreground bg-[hsl(270,76%,55%)] flex items-center justify-center">
              <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
            </div>
          </div>

          {/* Title */}
          <div
            className="space-y-2 transition-all duration-500 delay-100"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(15px)' }}
          >
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-foreground leading-[0.9] tracking-tighter uppercase">
              I GOT
              <br />
              THE
              <br />
              <span className="text-[hsl(0,84%,60%)]">POWA</span>
            </h1>
          </div>

          {/* Tagline */}
          <p
            className="text-muted-foreground text-xs sm:text-sm font-mono uppercase tracking-[0.3em] transition-all duration-500 delay-200"
            style={{ opacity: loaded ? 1 : 0 }}
          >
            Train. Track. Dominate.
          </p>

          {/* Feature grid with colors */}
          <div
            className="grid grid-cols-2 gap-2 sm:gap-3 transition-all duration-500 delay-300"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)' }}
          >
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div
                key={label}
                className="border-2 border-foreground p-3 sm:p-4 text-left hover:bg-foreground hover:text-background transition-colors duration-150 cursor-default relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${color}`} />
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-2 mt-1" />
                <div className="font-display font-bold text-lg sm:text-xl leading-none">{label}</div>
                <div className="text-[10px] sm:text-xs font-mono tracking-wider mt-1 opacity-60">{desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="space-y-3 transition-all duration-500 delay-500"
            style={{ opacity: loaded ? 1 : 0 }}
          >
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="w-full sm:w-auto bg-[hsl(270,76%,55%)] text-white hover:bg-[hsl(270,76%,45%)] text-sm sm:text-base px-10 sm:px-16 py-6 sm:py-7 font-display font-bold uppercase tracking-wider border-2 border-foreground"
            >
              Enter
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest">
              Free · No credit card
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t-2 border-foreground py-3 sm:py-4 text-center relative z-10">
        <p className="text-muted-foreground text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-mono">
          Built for those who train with purpose
        </p>
      </div>
    </div>
  );
}
