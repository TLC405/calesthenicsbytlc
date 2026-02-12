import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Library, CalendarDays, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', icon: Dumbbell, label: 'Train' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/planner', icon: CalendarDays, label: 'Planner' },
  { path: '/ai-lab', icon: Brain, label: 'AI Coach' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on app pages, not landing or auth
  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-foreground")} />
              <span className={cn(
                "text-[10px] font-mono uppercase tracking-wider",
                isActive ? "text-foreground font-semibold" : "text-muted-foreground"
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
