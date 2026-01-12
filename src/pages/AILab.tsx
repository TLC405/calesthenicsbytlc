import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Brain, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AILabChat } from '@/components/AILab/AILabChat';
import { useAuth } from '@/providers/AuthProvider';

export default function AILab() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Premium Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-bold flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="w-5 h-5 text-gold" />
                    <div className="absolute inset-0 animate-pulse-glow rounded-full" />
                  </div>
                  <span className="gradient-text">AI Coach</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Intelligent training guidance
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-1 rounded-full bg-gold/10 text-gold">
                Powered by AI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="premium-card max-w-md p-8 text-center animate-scale-in">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-gold" />
                </div>
                <div className="absolute inset-0 animate-pulse-glow rounded-2xl" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">
                Unlock AI Coaching
              </h2>
              <p className="text-muted-foreground mb-6">
                Get personalized exercise recommendations, progressions, and add them directly to your library.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Smart Suggestions</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-xs text-muted-foreground">Instant Results</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Goal-Focused</p>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-primary/80 premium-hover"
              >
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
