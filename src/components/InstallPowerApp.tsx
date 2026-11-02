import { useEffect, useState } from 'react';
import { Download, Share2, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
};

/** Chrome/Android install flow, with clear iOS and browser-menu fallbacks. */
export function InstallPowerApp({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const inApp = window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(inApp);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => { setInstalled(true); setOpen(false); setPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  const requestInstall = async () => {
    if (prompt) {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'accepted') setDismissed(true);
      setPrompt(null);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <Button
        type="button"
        size={compact ? 'sm' : 'lg'}
        onClick={() => void requestInstall()}
        variant={compact ? 'outline' : 'default'}
        className={compact ? 'gap-1.5 rounded-xl text-[10px] font-bold' : 'gap-2 rounded-2xl font-bold'}
        aria-label="Install I Got The Power on your device"
      >
        <Download className="h-4 w-4" />
        {compact ? 'Install' : 'Install free app'}
      </Button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="install-title"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-3 sm:items-center"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <section className="w-full max-w-sm rounded-[28px] border border-border/50 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <button aria-label="Close installation instructions" type="button"
                className="rounded-xl p-2 text-muted-foreground hover:bg-accent" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 id="install-title" className="mt-5 font-display text-2xl font-black tracking-tight">
              Install POWER
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Add POWER to your home screen to launch it like a native app, without an app store.
            </p>
            {ios ? (
              <div className="mt-5 space-y-3 rounded-2xl border border-border/60 bg-accent/30 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold"><Share2 className="h-4 w-4" /> On iPhone / iPad</p>
                <p>1. Open this page in Safari.</p>
                <p>2. Tap Share <Share2 className="inline h-3.5 w-3.5" />.</p>
                <p>3. Select <strong>Add to Home Screen</strong>, then Add.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3 rounded-2xl border border-border/60 bg-accent/30 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Android / Desktop</p>
                <p>1. Open POWER in Chrome or your preferred supported browser.</p>
                <p>2. Open the browser menu (⋮).</p>
                <p>3. Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
              </div>
            )}
            <Button className="mt-5 w-full h-11 rounded-xl" onClick={() => setOpen(false)}>Got it</Button>
          </section>
        </div>
      )}
    </>
  );
}
