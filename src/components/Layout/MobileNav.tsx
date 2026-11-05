import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Library, Dumbbell, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
const tabs = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/planner', icon: Dumbbell, label: 'Build' },
  { path: '/ai-lab', icon: Sparkles, label: 'Coach' },
  { path: '/settings', icon: User, label: 'You' },
];
export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  if (['/', '/index', '/auth'].includes(location.pathname)) return null;
  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-[4.5rem] max-w-lg mx-auto px-1">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Button key={path} variant="ghost" onClick={() => navigate(path)} aria-current={active ? 'page' : undefined}
              className={cn('h-full rounded-none flex-col gap-1 px-1 relative text-muted-foreground', active && 'text-primary bg-accent')}>
              {active && <span className="absolute top-0 h-0.5 w-8 bg-primary" />}
              <Icon className="h-5 w-5" />
              <span className={cn('text-[11px]', active ? 'font-bold' : 'font-medium')}>{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
