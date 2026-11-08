import { useNavigate, useLocation } from 'react-router-dom';
import { House, BookOpen, Dumbbell, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', icon: House, label: 'Home' },
  { path: '/library', icon: BookOpen, label: 'Exercises' },
  { path: '/planner', icon: Dumbbell, label: 'Build' },
  { path: '/settings', icon: UserRound, label: 'You' },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  if (['/', '/index', '/auth'].includes(location.pathname)) return null;
  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/80 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-4 h-[4.5rem] max-w-lg mx-auto px-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button key={path} type="button" onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
              className={cn('min-h-12 h-full flex flex-col items-center justify-center gap-1 rounded-xl transition-colors',
                active ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground')}>
              <Icon size={21} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true"/>
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
