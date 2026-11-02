import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Library as LibraryIcon, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/planner', icon: Dumbbell, label: 'TRAIN', color: 'hsl(var(--cat-pull))' },
  { path: '/library', icon: LibraryIcon, label: 'EXERCISES', color: 'hsl(var(--cat-push))' },
  { path: '/dashboard', icon: LayoutGrid, label: 'HOME', color: 'hsl(var(--cat-skills))' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ['/', '/auth', '/admin-login', '/workout'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="power-mobile-nav fixed inset-x-0 bottom-0 z-40 md:hidden" aria-label="Primary navigation">
      <div className="power-nav-surface bg-card/95 backdrop-blur-xl border-t border-border/70">
        <div className="flex items-stretch justify-around min-h-[4.25rem] max-w-lg mx-auto px-2 pt-1">
          {tabs.map(({ path, icon: Icon, label, color }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="power-nav-item flex flex-col items-center justify-center gap-1 min-w-0 flex-1 min-h-[4.25rem] relative group rounded-xl" aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-b-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
                  />
                )}
                <div className={cn(
                  "power-nav-icon w-10 h-9 rounded-xl flex items-center justify-center transition-colors duration-150",
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
                  "power-nav-label text-[10px] font-sans uppercase tracking-[0.05em] transition-colors",
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
