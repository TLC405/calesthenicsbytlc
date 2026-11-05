import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const themes = [
  { id: 'default', name: 'I Got the Power', tagline: 'White · Graphite · Gold' },
  { id: 'vasa', name: 'VASA Fitness', tagline: 'White · Racing red' },
  { id: 'planet-fitness', name: 'Planet Fitness', tagline: 'White · Purple · Gold' },
  { id: 'ymca', name: 'YMCA', tagline: 'White · Red · Navy' },
  { id: 'okc-thunder', name: 'OKC Thunder', tagline: 'White · Blue · Orange' },
  { id: 'power-gold', name: 'Black & Gold', tagline: 'Dark edition' },
];
const listeners = new Set<() => void>();
const readTheme = () => {
  const saved = localStorage.getItem('power-theme');
  return themes.some(t => t.id === saved) ? saved || 'default' : 'default';
};
const applyTheme = (theme: string) => {
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme', theme);
};
applyTheme(readTheme());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = () => { applyTheme(readTheme()); listener(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage); };
};
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'default');
  const setTheme = (next: string) => {
    if (!themes.some(t => t.id === next)) return;
    localStorage.setItem('power-theme', next);
    applyTheme(next);
    listeners.forEach(listener => listener());
  };
  return { theme, setTheme, themes };
}
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label="App theme">
      {themes.map(t => (
        <Button key={t.id} variant="outline" aria-pressed={theme === t.id} onClick={() => setTheme(t.id)}
          className={cn('h-auto min-h-16 justify-start whitespace-normal p-3 rounded-lg', `theme-option-${t.id}`,
            theme === t.id ? 'border-primary bg-accent' : 'border-border bg-card')}>
          <span className="theme-swatch flex h-10 w-10 shrink-0 items-center justify-center gap-0.5 rounded-md border border-border">
            <span className="theme-swatch-primary h-6 w-2 rounded-sm" />
            <span className="theme-swatch-accent h-6 w-2 rounded-sm" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-bold">{t.name}</span>
            <span className="block text-xs text-muted-foreground mt-0.5">{t.tagline}</span>
          </span>
          {theme === t.id && <Check className="text-primary shrink-0" />}
        </Button>
      ))}
    </div>
  );
}
