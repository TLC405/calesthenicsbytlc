import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Dumbbell, Brain, CalendarDays, Target, Volume2, VolumeX } from 'lucide-react';

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
    { icon: Dumbbell, label: '120+', desc: 'EXERCISES', accent: 'border-destructive' },
    { icon: CalendarDays, label: 'PLAN', desc: 'SESSIONS', accent: 'border-primary' },
    { icon: Brain, label: 'AI', desc: 'COACH', accent: 'border-primary' },
    { icon: Target, label: 'SKILL', desc: 'PROGRESS', accent: 'border-destructive' },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden select-none">
      {/* Hidden YouTube player for background music */}
      <iframe
        ref={audioRef}
        src="https://www.youtube.com/embed/nm6DO_7px1I?enablejsapi=1&autoplay=0&loop=1&playlist=nm6DO_7px1I"
        allow="autoplay"
        className="hidden"
        title="background music"
      />

      {/* Brutalist grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

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

          {/* Logo — raw, brutal */}
          <div
            className="flex justify-center transition-all duration-300"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(-20px)',
            }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-foreground overflow-hidden">
              <img
                src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png"
                alt="I GOT THE POWA"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title — brutalist type */}
          <div
            className="space-y-2 transition-all duration-500 delay-100"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(15px)' }}
          >
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-foreground leading-[0.9] tracking-tighter uppercase">
              I GOT
              <br />
              THE
              <br />
              <span className="text-destructive">POWA</span>
            </h1>
          </div>

          {/* Tagline */}
          <p
            className="text-muted-foreground text-xs sm:text-sm font-mono uppercase tracking-[0.3em] transition-all duration-500 delay-200"
            style={{ opacity: loaded ? 1 : 0 }}
          >
            Train. Track. Dominate.
          </p>

          {/* Feature grid — brutalist blocks */}
          <div
            className="grid grid-cols-2 gap-2 sm:gap-3 transition-all duration-500 delay-300"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)' }}
          >
            {features.map(({ icon: Icon, label, desc, accent }) => (
              <div
                key={label}
                className={`border-2 border-foreground p-3 sm:p-4 text-left hover:bg-foreground hover:text-background transition-colors duration-150 cursor-default border-l-4 ${accent}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-2" />
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
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/80 text-sm sm:text-base px-10 sm:px-16 py-6 sm:py-7 font-display font-bold uppercase tracking-wider border-2 border-foreground"
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
