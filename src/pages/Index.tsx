import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, Brain, CalendarDays, Target, Zap, ChevronRight } from 'lucide-react';

const examplePaths = [
  { name: 'Push-up Path', color: 'bg-red-500', steps: ['Wall Push-up', 'Incline Push-up', 'Push-up', 'Diamond Push-up', 'Archer Push-up', 'One Arm Push-up'] },
  { name: 'Pull-up Path', color: 'bg-blue-500', steps: ['Dead Hang', 'Australian Row', 'Chin-up', 'Pull-up', 'Archer Pull-up', 'One Arm Chin-up'] },
  { name: 'Handstand Path', color: 'bg-purple-500', steps: ['Wall Handstand', 'Freestanding HS', 'HSPU', 'L-Sit to HS'] },
  { name: 'Lever Path', color: 'bg-orange-500', steps: ['Tuck Front Lever', 'Front Lever Raise', 'Front Lever', 'Iron Cross'] },
];

const sampleWeek = [
  { day: 'Mon', label: 'Push', color: 'bg-red-500' },
  { day: 'Tue', label: 'Pull', color: 'bg-blue-500' },
  { day: 'Wed', label: 'Yoga', color: 'bg-pink-500' },
  { day: 'Thu', label: 'Legs', color: 'bg-green-500' },
  { day: 'Fri', label: 'Skills', color: 'bg-purple-500' },
  { day: 'Sat', label: 'Core', color: 'bg-orange-500' },
  { day: 'Sun', label: 'Rest', color: 'bg-muted' },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: Dumbbell, label: '150+', desc: 'EXERCISES', color: 'bg-[hsl(0,84%,60%)]' },
    { icon: CalendarDays, label: 'PLAN', desc: 'SESSIONS', color: 'bg-[hsl(217,91%,60%)]' },
    { icon: Brain, label: 'AI', desc: 'COACH', color: 'bg-[hsl(270,76%,55%)]' },
    { icon: Target, label: 'SKILL', desc: 'PROGRESS', color: 'bg-[hsl(142,71%,45%)]' },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden select-none">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 relative z-10 py-12 sm:py-16">
        <div className="w-full max-w-lg text-center space-y-6 sm:space-y-8">

          {/* Icon Logo */}
          <div className="flex justify-center transition-all duration-300" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(-20px)' }}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-foreground bg-[hsl(270,76%,55%)] flex items-center justify-center">
              <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 transition-all duration-500 delay-100" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(15px)' }}>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-foreground leading-[0.9] tracking-tighter uppercase">
              I GOT<br />THE<br /><span className="text-[hsl(0,84%,60%)]">POWA</span>
            </h1>
          </div>

          <p className="text-muted-foreground text-xs sm:text-sm font-mono uppercase tracking-[0.3em] transition-all duration-500 delay-200" style={{ opacity: loaded ? 1 : 0 }}>
            Train. Track. Dominate.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 transition-all duration-500 delay-300" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(10px)' }}>
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="border-2 border-foreground p-3 sm:p-4 text-left hover:bg-foreground hover:text-background transition-colors duration-150 cursor-default relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${color}`} />
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-2 mt-1" />
                <div className="font-display font-bold text-lg sm:text-xl leading-none">{label}</div>
                <div className="text-[10px] sm:text-xs font-mono tracking-wider mt-1 opacity-60">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Path Explorer Preview */}
        <div className="w-full max-w-2xl mt-10 sm:mt-14 transition-all duration-700 delay-500" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)' }}>
          <div className="border-2 border-foreground bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-5 bg-[hsl(270,76%,55%)]" />
              <h2 className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">Progression Paths</h2>
              <span className="text-[9px] font-mono text-muted-foreground ml-auto uppercase tracking-wider">Preview</span>
            </div>
            <div className="space-y-3">
              {examplePaths.map((path) => (
                <div key={path.name} className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground">{path.name}</span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {path.steps.map((step, i) => (
                      <div key={step} className="flex items-center">
                        <div className="px-2.5 py-1.5 border border-foreground/20 bg-secondary/30 min-w-max">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider">{step}</span>
                        </div>
                        {i < path.steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0 mx-0.5" />}
                      </div>
                    ))}
                    <div className={`w-1 h-6 ${path.color} flex-shrink-0 ml-1`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Preview */}
        <div className="w-full max-w-2xl mt-4 transition-all duration-700 delay-600" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)' }}>
          <div className="border-2 border-foreground bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-5 bg-[hsl(217,91%,60%)]" />
              <h2 className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">Sample Training Week</h2>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {sampleWeek.map(({ day, label, color }) => (
                <div key={day} className="border border-foreground/15 p-2 text-center">
                  <div className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">{day}</div>
                  <div className={`h-1.5 ${color} mb-1.5`} />
                  <div className="text-[8px] font-mono font-bold uppercase tracking-wider">{label}</div>
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
            className="w-full sm:w-auto bg-[hsl(270,76%,55%)] text-white hover:bg-[hsl(270,76%,45%)] text-sm sm:text-base px-10 sm:px-16 py-6 sm:py-7 font-display font-bold uppercase tracking-wider border-2 border-foreground"
          >
            Enter
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest">Free · No credit card</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t-2 border-foreground py-3 sm:py-4 text-center relative z-10">
        <p className="text-muted-foreground text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-mono">Built for those who train with purpose</p>
      </div>
    </div>
  );
}
