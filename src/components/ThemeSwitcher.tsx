import { useState, useEffect, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { Check, Palette, ShieldCheck } from 'lucide-react';
import { initialTheme } from '@/lib/themePreference';

interface ThemeOption {
  id: string;
  name: string;
  kicker: string;
  description: string;
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
}

const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Super Human Signature',
    kicker: 'THE SIGNATURE COLLECTION',
    description: 'Obsidian, champagne gold and machined metal.',
    primary: '#D9B677',
    accent: '#88704D',
    bg: '#12151C',
    surface: '#252B35',
    text: '#F3EFE7',
  },
  {
    id: 'vasa',
    name: 'VASA Performance',
    kicker: 'PRECISION STRENGTH',
    description: 'Warm concrete, signal red and graphite.',
    primary: '#B6253B',
    accent: '#323A43',
    bg: '#F5F2ED',
    surface: '#FFFFFF',
    text: '#252B32',
  },
  {
    id: 'planet-fitness',
    name: 'Planet Fitness',
    kicker: 'THE NIGHT EDITION',
    description: 'Deep plum, carbon and muted championship gold.',
    primary: '#8946B0',
    accent: '#E2C16E',
    bg: '#18131D',
    surface: '#302638',
    text: '#F3EFF6',
  },
  {
    id: 'ymca',
    name: 'YMCA Studio',
    kicker: 'THE OPEN STUDIO',
    description: 'Arctic white, ocean blue and brushed teal.',
    primary: '#096F9B',
    accent: '#147A79',
    bg: '#F4F9FA',
    surface: '#FFFFFF',
    text: '#153241',
  },
  {
    id: 'okc-thunder',
    name: 'OKC Thunder',
    kicker: 'HOME COURT STRENGTH',
    description: 'Midnight navy, electric blue and warm orange.',
    primary: '#138BCE',
    accent: '#EC7339',
    bg: '#101D34',
    surface: '#263C5B',
    text: '#F3F7FE',
  },
];

export function useTheme() {
  const [theme, setThemeState] = useState<string>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'default') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    localStorage.setItem('power-theme', theme);
    window.dispatchEvent(new CustomEvent('power-theme-changed', { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const sync = (event: Event) => setThemeState((event as CustomEvent<string>).detail);
    window.addEventListener('power-theme-changed', sync);
    return () => window.removeEventListener('power-theme-changed', sync);
  }, []);

  return { theme, setTheme: setThemeState, themes };
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const current = themes.find(option => option.id === theme) ?? themes[1];
  return (
    <section className="su-theme-control" aria-label="Choose a training theme">
      <header className="su-theme-heading">
        <div className="su-theme-heading-icon"><Palette size={20} aria-hidden="true" /></div>
        <div>
          <p className="su-theme-overline">TLC / APPEARANCE STUDIO</p>
          <h2>Make strength your own.</h2>
          <p>Five distinct environments. One consistent training experience.</p>
        </div>
      </header>
      <div className="su-active-theme" role="status" aria-live="polite">
        <div>
          <span className="su-active-label"><ShieldCheck size={13} aria-hidden="true" /> YOUR ACTIVE THEME</span>
          <strong>{current.name}</strong>
          <p>{current.description}</p>
        </div>
        <span className="su-active-mark" style={{ backgroundColor: current.primary }} aria-hidden="true" />
      </div>
      <div className="su-theme-grid" role="group" aria-label="Training theme choices">
        {themes.map((option) => {
          const isActive = option.id === theme;
          const previewStyle = {
            '--su-preview-bg': option.bg,
            '--su-preview-panel': option.surface,
            '--su-preview-main': option.primary,
            '--su-preview-accent': option.accent,
            '--su-preview-ink': option.text,
          } as CSSProperties;
          return (
            <button
              type="button"
              key={option.id}
              aria-pressed={isActive}
              aria-label={`Use ${option.name} theme`}
              onClick={() => setTheme(option.id)}
              className={cn('su-theme-option', isActive && 'is-selected')}
              style={previewStyle}
            >
              <span className="su-theme-preview" aria-hidden="true">
                <span className="su-preview-top"><span className="su-preview-monogram">TLC</span><span className="su-preview-dots"><i/><i/><i/></span></span>
                <span className="su-preview-hero"><span className="su-preview-eyebrow">SUPER HUMAN</span><b>STRENGTH</b><span className="su-preview-line" /></span>
                <span className="su-preview-metrics"><i/><i/><i/></span>
              </span>
              <span className="su-option-bottom">
                <span className="su-option-copy">
                  <span className="su-option-kicker">{option.kicker}</span>
                  <strong>{option.name}</strong>
                  <small>{option.description}</small>
                </span>
                <span className="su-option-status" aria-hidden="true">{isActive ? <Check size={17}/> : <span className="su-option-circle"/>}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="su-theme-note">Themes apply immediately and save to this device. Your skill checks, progress and workout drafts are unaffected.</p>
    </section>
  );
}
