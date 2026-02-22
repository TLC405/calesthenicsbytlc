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
      {/* Brutalist header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-foreground" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <h1 className="font-display text-sm font-bold uppercase tracking-wider">AI Coach</h1>
            </div>
          </div>
          <span className="text-[8px] font-mono px-2 py-1 border-2 border-foreground/20 text-muted-foreground uppercase tracking-[0.2em]">
            AI Powered
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm text-center space-y-6">
              <div className="w-14 h-14 border-2 border-foreground flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-tight">Unlock AI Coaching</h2>
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  Personalized exercise recommendations and training guidance.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Brain, label: 'Smart' },
                  { icon: Dumbbell, label: 'Progress' },
                  { icon: Target, label: 'Goals' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="border-2 border-foreground/20 p-3 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
                    <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => navigate('/auth')} className="w-full h-11 font-display font-bold uppercase tracking-wider text-sm border-2 border-foreground">
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
