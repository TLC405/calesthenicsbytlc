import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Dumbbell, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AILabChat } from '@/components/AILab/AILabChat';
import { useAuth } from '@/providers/AuthProvider';

export default function AILab() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Frosted glass header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight">AI Coach</h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Powered by AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-border/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Unlock AI Coaching</h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Personalized exercise recommendations and training guidance.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Brain, label: 'Smart' },
                  { icon: Dumbbell, label: 'Progress' },
                  { icon: Target, label: 'Goals' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-xl border border-border/40 bg-card p-3 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
                    <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => navigate('/auth')} className="w-full h-11 font-display font-bold uppercase tracking-wider text-sm rounded-xl">
                Sign In to Continue
              </Button>
            </div>
          </div>
        ) : (
          <AILabChat />
        )}
      </main>
    </div>
  );
}
