import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  primary: string;
  accent: string;
  bg: string;
  text: string;
}

const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    tagline: 'Premium Purple',
    primary: '#8B5CF6',
    accent: '#3B82F6',
    bg: '#FAFAFA',
    text: '#1a1a2e',
  },
  {
    id: 'vasa',
    name: 'Vasa Fitness',
    tagline: 'Orange & Teal',
    primary: '#FF6B00',
    accent: '#0D9488',
    bg: '#FAFAFA',
    text: '#1a1a2e',
  },
  {
    id: 'planet-fitness',
    name: 'Planet Fitness',
    tagline: 'Purple & Yellow',
    primary: '#A4278D',
    accent: '#F9F72E',
    bg: '#120818',
    text: '#F9F72E',
  },
  {
    id: 'ymca',
    name: 'YMCA',
    tagline: 'Red & Navy',
    primary: '#E00034',
    accent: '#1A3A5C',
    bg: '#FAFAFA',
    text: '#1a1a2e',
  },
  {
    id: 'okc-thunder',
    name: 'OKC Thunder',
    tagline: 'Thunder Up',
    primary: '#007AC1',
    accent: '#EF3B24',
    bg: '#002D62',
    text: '#FFFFFF',
  },
];

export function useTheme() {
  const [theme, setThemeState] = useState<string>(() => {
    return localStorage.getItem('powa-theme') || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('powa-theme', theme);
  }, [theme]);

  return { theme, setTheme: setThemeState, themes };
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 gap-2">
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left group",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/50 bg-card hover:border-border hover:shadow-sm"
            )}
          >
            {/* Color preview */}
            <div
              className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/30"
              style={{ backgroundColor: t.bg }}
            >
              <div className="flex gap-0.5">
                <div className="w-3 h-8 rounded-sm" style={{ backgroundColor: t.primary }} />
                <div className="w-3 h-8 rounded-sm" style={{ backgroundColor: t.accent }} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-bold tracking-tight">{t.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.1em]">{t.tagline}</p>
            </div>

            {isActive && (
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
