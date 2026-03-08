import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { ArrowRight, Zap, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const paths = [
  { name: 'Push-up', color: 'hsl(var(--cat-push))', steps: ['Wall', 'Incline', 'Standard', 'Diamond', 'Archer', 'One Arm'] },
  { name: 'Pull-up', color: 'hsl(var(--cat-pull))', steps: ['Dead Hang', 'Row', 'Chin-up', 'Pull-up', 'Archer', 'One Arm'] },
  { name: 'Handstand', color: 'hsl(var(--cat-skills))', steps: ['Wall HS', 'Free HS', 'HSPU', 'L-Sit to HS'] },
  { name: 'Lever', color: 'hsl(var(--cat-core))', steps: ['Tuck FL', 'FL Raise', 'Front Lever', 'Iron Cross'] },
];

const stats = [
  { value: '150+', label: 'EXERCISES' },
  { value: '8', label: 'CATEGORIES' },
  { value: 'AI', label: 'COACH' },
  { value: '∞', label: 'POTENTIAL' },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden select-none">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, hsl(var(--cat-skills)), transparent 60%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, hsl(var(--cat-pull)), transparent 60%)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="flex-1 flex flex-col items-center relative z-10">
        {/* Top bar */}
        <div className="w-full max-w-4xl px-6 pt-6 flex items-center justify-between transition-all duration-700" style={{ opacity: loaded ? 1 : 0 }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--cat-legs))] animate-pulse" />
            <span className="text-[9px] font-mono text-muted-foreground tracking-[0.3em] uppercase">System Online</span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">v2.0</span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-4xl w-full">
          {/* Logo mark */}
          <div className="mb-8 transition-all duration-500" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'scale(1)' : 'scale(0.8)' }}>
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[hsl(var(--electric))] to-[hsl(var(--cat-pull))] flex items-center justify-center shadow-2xl" style={{ boxShadow: '0 0 60px hsl(var(--electric) / 0.3), 0 0 120px hsl(var(--electric) / 0.1)' }}>
                <Zap className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
              </div>
              {/* Orbiting dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[hsl(var(--neon-green))]" style={{ boxShadow: '0 0 12px hsl(var(--neon-green) / 0.6)' }} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-3 mb-10 transition-all duration-700 delay-150" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)' }}>
            <h1 className="font-display text-6xl sm:text-8xl md:text-9xl font-black text-foreground leading-[0.85] tracking-[-0.04em] uppercase">
              I GOT<br />THE <span className="gradient-text">POWA</span>
            </h1>
            <p className="text-muted-foreground text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em]">
              Train · Track · Dominate
            </p>
          </div>

          {/* Stats strip */}
          <div className="w-full max-w-md grid grid-cols-4 gap-0 mb-10 transition-all duration-700 delay-300" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(15px)' }}>
            {stats.map(({ value, label }, i) => (
              <div key={label} className={cn("text-center py-3", i < 3 && "border-r border-border")}>
                <div className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">{value}</div>
                <div className="text-[7px] sm:text-[8px] font-mono text-muted-foreground tracking-[0.2em] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="transition-all duration-700 delay-500 w-full max-w-xs" style={{ opacity: loaded ? 1 : 0 }}>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="w-full h-14 sm:h-16 text-sm sm:text-base font-display font-bold uppercase tracking-[0.15em] rounded-2xl text-white relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--electric)), hsl(var(--cat-pull)))',
                boxShadow: '0 0 40px hsl(var(--electric) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.1)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
            <p className="text-center text-muted-foreground text-[9px] font-mono uppercase tracking-[0.3em] mt-3">
              Free · No credit card
            </p>
          </div>
        </div>

        {/* Progression paths preview */}
        <div className="w-full max-w-4xl px-6 pb-12 transition-all duration-700 delay-[600ms]" style={{ opacity: loaded ? 1 : 0 }}>
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-[hsl(var(--electric))]" />
                <span className="text-xs font-display font-bold tracking-tight">Progression Paths</span>
              </div>
              <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">Preview</span>
            </div>
            <div className="space-y-4">
              {paths.map(path => (
                <div key={path.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: path.color }} />
                    <span className="text-[9px] font-mono font-bold tracking-[0.1em] text-muted-foreground uppercase">{path.name}</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
                    {path.steps.map((step, i) => (
                      <div key={step} className="flex items-center">
                        <div className="px-2.5 py-1.5 rounded-lg border border-border/40 bg-accent/30 min-w-max">
                          <span className="text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{step}</span>
                        </div>
                        {i < path.steps.length - 1 && <ChevronRight className="w-3 h-3 text-border flex-shrink-0 mx-0.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="w-full border-t border-border/30 py-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <Flame className="w-3 h-3 text-[hsl(var(--cat-push))]" />
            <p className="text-muted-foreground/40 text-[8px] tracking-[0.4em] uppercase font-mono">Built for those who train with purpose</p>
            <Flame className="w-3 h-3 text-[hsl(var(--cat-push))]" />
          </div>
        </div>
      </div>
    </div>
  );
}
