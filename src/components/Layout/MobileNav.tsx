import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Library as LibraryIcon, FileText, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', icon: Home, label: 'Home', color: 'hsl(var(--cat-pull))' },
  { path: '/library', icon: LibraryIcon, label: 'Library', color: 'hsl(var(--cat-push))' },
  { path: '/planner', icon: FileText, label: 'Build', color: 'hsl(var(--cat-skills))' },
  { path: '/ai-lab', icon: Sparkles, label: 'Coach', color: 'hsl(var(--electric))' },
  { path: '/settings', icon: User, label: 'You', color: 'hsl(var(--cat-core))' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ['/', '/auth'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="bg-background/90 backdrop-blur-2xl border-t border-border/40">
        <div className="flex items-center justify-around h-[4.5rem] max-w-lg mx-auto px-1">
          {tabs.map(({ path, icon: Icon, label, color }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full relative group"
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
                  />
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-card border border-border/60 shadow-sm"
                    : "group-hover:bg-accent/50"
                )}>
                  <Icon className={cn(
                    "w-[18px] h-[18px] transition-colors duration-200",
                    isActive ? "" : "text-muted-foreground group-hover:text-foreground/70"
                  )} style={isActive ? { color } : undefined} />
                </div>
                <span className={cn(
                  "text-[8px] font-mono uppercase tracking-[0.14em] transition-colors",
                  isActive ? "text-foreground font-bold" : "text-muted-foreground font-medium"
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
