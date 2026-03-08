import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Library, CalendarDays, Brain, Flame, Settings, PersonStanding } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', icon: Dumbbell, label: 'Home', color: 'bg-[hsl(var(--cat-push))]' },
  { path: '/train', icon: Flame, label: 'Train', color: 'bg-[hsl(var(--cat-core))]' },
  { path: '/library', icon: Library, label: 'Library', color: 'bg-[hsl(var(--cat-pull))]' },
  { path: '/planner', icon: CalendarDays, label: 'Plan', color: 'bg-[hsl(var(--cat-legs))]' },
  { path: '/ai-lab', icon: Brain, label: 'AI', color: 'bg-[hsl(var(--cat-skills))]' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'bg-muted-foreground' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-foreground bg-background md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ path, icon: Icon, label, color }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <div className={cn("absolute inset-x-1 top-1 bottom-1 rounded-lg opacity-15", color)} />
              )}
              <Icon className={cn("w-5 h-5 relative z-10", isActive && "scale-110")} />
              <span className="text-[7px] font-mono uppercase tracking-[0.1em] font-bold relative z-10">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
