import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Brain, Dumbbell, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AILabChat } from '@/components/AILab/AILabChat';
import { useAuth } from '@/providers/AuthProvider';

export default function AILab() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <h1 className="font-display text-lg font-bold">AI Coach</h1>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-border text-muted-foreground uppercase tracking-wider">
            Powered by AI
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold">Unlock AI Coaching</h2>
                <p className="text-sm text-muted-foreground">
                  Get personalized exercise recommendations, progressions, and training guidance.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Brain, label: 'Smart Suggestions' },
                  { icon: Dumbbell, label: 'Progressions' },
                  { icon: Target, label: 'Goal-Focused' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-xl border border-border p-3 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => navigate('/auth')} className="w-full">
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
