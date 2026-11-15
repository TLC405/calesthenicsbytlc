import { useSyncExternalStore, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { Check, Palette, ShieldCheck } from 'lucide-react';
import { selectTheme, subscribeTheme, themeSnapshot, DEFAULT_THEME } from '@/lib/themePreference';

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
    name: 'Super Human · DBZ Light',
    kicker: 'THE LIGHT POWER COLLECTION',
    description: 'Dragon Ball Z-inspired training: warm ivory, bright orange, cobalt and tournament gold.',
    primary: '#BD4B0B',
    accent: '#1658AD',
    bg: '#EAD9B2',
    surface: '#FFFAF0',
    text: '#162B4C',
  },
  {
    id: 'vasa',
    name: 'VASA Performance',
    kicker: 'PRECISION STRENGTH',
    description: 'Concrete floor, bright chalk-white panels, graphite and racing red.',
    primary: '#AB1E34',
    accent: '#303E4B',
    bg: '#E6E2DA',
    surface: '#FFFDFA',
    text: '#24272C',
  },
  {
    id: 'planet-fitness',
    name: 'Planet Fitness',
    kicker: 'THE NIGHT EDITION',
    description: 'Velvet plum, gilded controls and high-contrast violet.',
    primary: '#B992EB',
    accent: '#EFD27E',
    bg: '#140D1B',
    surface: '#2C1D37',
    text: '#FAF3FF',
  },
  {
    id: 'ymca',
    name: 'YMCA Studio',
    kicker: 'THE OPEN STUDIO',
    description: 'Fresh pool-blue tile, crisp white panels and deep teal.',
    primary: '#00669B',
    accent: '#0D8784',
    bg: '#DCEBF0',
    surface: '#FFFFFF',
    text: '#0C2C3E',
  },
  {
    id: 'okc-thunder',
    name: 'OKC Thunder',
    kicker: 'HOME COURT STRENGTH',
    description: 'Arena midnight, vivid cobalt, ice blue and competition orange.',
    primary: '#51B6ED',
    accent: '#F78B49',
    bg: '#07162D',
    surface: '#153A62',
    text: '#F5FAFF',
  },
];

export function useTheme() {
  const theme=useSyncExternalStore(subscribeTheme,themeSnapshot,()=>DEFAULT_THEME);
  return { theme, setTheme: selectTheme, themes };
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
          <p>Five tactile training worlds. Distinct surfaces, real depth, and precise color contrast.</p>
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
