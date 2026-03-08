import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, Brain, CalendarDays, Target, Zap, ChevronRight, ChevronDown, Flame, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const examplePaths = [
  { name: 'Push-up Path', color: 'hsl(var(--cat-push))', steps: ['Wall Push-up', 'Incline Push-up', 'Push-up', 'Diamond Push-up', 'Archer Push-up', 'One Arm Push-up'] },
  { name: 'Pull-up Path', color: 'hsl(var(--cat-pull))', steps: ['Dead Hang', 'Australian Row', 'Chin-up', 'Pull-up', 'Archer Pull-up', 'One Arm Chin-up'] },
  { name: 'Handstand Path', color: 'hsl(var(--cat-skills))', steps: ['Wall Handstand', 'Freestanding HS', 'HSPU', 'L-Sit to HS'] },
  { name: 'Lever Path', color: 'hsl(var(--cat-core))', steps: ['Tuck Front Lever', 'Front Lever Raise', 'Front Lever', 'Iron Cross'] },
];

const sampleWeek = [
  { day: 'Mon', label: 'Push', color: 'hsl(var(--cat-push))' },
  { day: 'Tue', label: 'Pull', color: 'hsl(var(--cat-pull))' },
  { day: 'Wed', label: 'Yoga', color: 'hsl(330, 65%, 55%)' },
  { day: 'Thu', label: 'Legs', color: 'hsl(var(--cat-legs))' },
  { day: 'Fri', label: 'Skills', color: 'hsl(var(--cat-skills))' },
  { day: 'Sat', label: 'Core', color: 'hsl(var(--cat-core))' },
  { day: 'Sun', label: 'Rest', color: 'hsl(var(--muted-foreground))' },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<number | null>(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: Dumbbell, label: '150+', desc: 'EXERCISES', color: 'hsl(var(--cat-push))' },
    { icon: CalendarDays, label: 'PLAN', desc: 'SESSIONS', color: 'hsl(var(--cat-pull))' },
    { icon: Brain, label: 'AI', desc: 'COACH', color: 'hsl(var(--cat-skills))' },
    { icon: Target, label: 'SKILL', desc: 'PROGRESS', color: 'hsl(var(--cat-legs))' },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden select-none">
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(var(--cat-skills)), transparent 70%)' }} />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 relative z-10 py-12 sm:py-16">
        <div className="w-full max-w-lg text-center space-y-6 sm:space-y-8">

          {/* Icon Logo */}
          <div className="flex justify-center transition-all duration-300" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)' }}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[hsl(var(--cat-skills))] to-[hsl(var(--cat-pull))] flex items-center justify-center relative shadow-lg">
              <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 transition-all duration-500 delay-100" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(15px)' }}>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-foreground leading-[0.9] tracking-tighter uppercase">
              I GOT<br />THE<br /><span className="gradient-text">POWA</span>
            </h1>
          </div>

          <p className="text-muted-foreground text-xs sm:text-sm font-mono uppercase tracking-[0.3em] transition-all duration-500 delay-200" style={{ opacity: loaded ? 1 : 0 }}>
            Train · Track · Dominate
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 transition-all duration-500 delay-300" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)' }}>
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-3 sm:p-4 text-left hover:shadow-sm hover:border-border/60 transition-all duration-200 cursor-default relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ backgroundColor: color }} />
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-2 mt-1 ml-1" />
                <div className="font-display font-bold text-lg sm:text-xl leading-none ml-1">{label}</div>
                <div className="text-[10px] sm:text-xs font-mono tracking-wider mt-1 text-muted-foreground ml-1">{desc}</div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="transition-all duration-700 delay-500 flex flex-col items-center gap-1" style={{ opacity: loaded ? 0.4 : 0 }}>
            <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Explore</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground animate-pulse" />
          </div>
        </div>

        {/* Path Explorer Preview */}
        <div className="w-full max-w-2xl mt-10 sm:mt-14 transition-all duration-700 delay-500" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)' }}>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'hsl(var(--cat-skills))' }} />
              <h2 className="font-display text-xs sm:text-sm font-bold tracking-tight">Progression Paths</h2>
              <Star className="w-3 h-3 text-muted-foreground/30 ml-auto" />
              <span className="text-[9px] font-mono text-muted-foreground">Preview</span>
            </div>
            <div className="space-y-3">
              {examplePaths.map((path, pathIdx) => (
                <div
                  key={path.name}
                  className="space-y-1.5 cursor-default"
                  onMouseEnter={() => setHoveredPath(pathIdx)}
                  onMouseLeave={() => setHoveredPath(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: path.color }} />
                    <span className="text-[9px] font-mono font-bold tracking-wide text-muted-foreground">{path.name}</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {path.steps.map((step, i) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg border min-w-max transition-all duration-200",
                            hoveredPath === pathIdx
                              ? "border-border bg-accent"
                              : "border-border/50 bg-muted/30"
                          )}
                          style={{ transitionDelay: `${i * 40}ms` }}
                        >
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider">{step}</span>
                        </div>
                        {i < path.steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0 mx-0.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Preview */}
        <div className="w-full max-w-2xl mt-4 transition-all duration-700 delay-[600ms]" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)' }}>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'hsl(var(--cat-pull))' }} />
              <h2 className="font-display text-xs sm:text-sm font-bold tracking-tight">Sample Training Week</h2>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {sampleWeek.map(({ day, label, color }) => (
                <div key={day} className="rounded-lg border border-border/50 p-2 text-center hover:border-border transition-colors">
                  <div className="text-[8px] font-mono text-muted-foreground mb-1.5">{day}</div>
                  <div className="h-1.5 rounded-full mb-1.5" style={{ backgroundColor: color }} />
                  <div className="text-[8px] font-mono font-bold">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-lg mt-8 sm:mt-10 space-y-3 transition-all duration-500 delay-700 text-center" style={{ opacity: loaded ? 1 : 0 }}>
          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--cat-skills))] to-[hsl(var(--cat-pull))] text-white hover:opacity-90 text-sm sm:text-base px-10 sm:px-16 py-6 sm:py-7 font-display font-bold uppercase tracking-wider rounded-xl shadow-lg group animate-pulse-glow"
          >
            Enter
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest">Free · No credit card</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-3 sm:py-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-3">
          <Flame className="w-3 h-3 text-[hsl(var(--cat-push))]" />
          <p className="text-muted-foreground text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-mono">Built for those who train with purpose</p>
          <Flame className="w-3 h-3 text-[hsl(var(--cat-push))]" />
        </div>
      </div>
    </div>
  );
}
