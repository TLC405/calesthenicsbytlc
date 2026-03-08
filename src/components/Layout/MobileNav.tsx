import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Library, Brain, Flame, PersonStanding } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', icon: Dumbbell, label: 'Home', dot: 'bg-[hsl(var(--cat-pull))]' },
  { path: '/train', icon: Flame, label: 'Train', dot: 'bg-[hsl(var(--cat-core))]' },
  { path: '/library', icon: Library, label: 'Library', dot: 'bg-[hsl(var(--cat-push))]' },
  { path: '/anatomy', icon: PersonStanding, label: 'Atlas', dot: 'bg-[hsl(var(--cat-skills))]' },
  { path: '/ai-lab', icon: Brain, label: 'AI', dot: 'bg-[hsl(var(--cat-legs))]' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-around h-16">
          {tabs.map(({ path, icon: Icon, label, dot }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 relative",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  {isActive && (
                    <div className={cn("absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full", dot)} />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-mono uppercase tracking-[0.08em] transition-all",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
