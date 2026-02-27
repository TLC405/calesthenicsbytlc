import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Library, CalendarDays, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', icon: Dumbbell, label: 'Train', color: 'bg-[hsl(0,84%,60%)]' },
  { path: '/library', icon: Library, label: 'Library', color: 'bg-[hsl(217,91%,60%)]' },
  { path: '/planner', icon: CalendarDays, label: 'Plan', color: 'bg-[hsl(142,71%,45%)]' },
  { path: '/ai-lab', icon: Brain, label: 'AI', color: 'bg-[hsl(270,76%,55%)]' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-foreground bg-background md:hidden">
      <div className="flex items-center justify-around h-14">
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
                <div className={cn("absolute top-0 w-full h-[3px]", color)} />
              )}
              <Icon className="w-4 h-4" />
              <span className="text-[8px] font-mono uppercase tracking-[0.15em] font-bold">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
