import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Dumbbell, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AILabChat } from '@/components/AILab/AILabChat';
import { useAuth } from '@/providers/AuthProvider';

export default function AILab() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickPrompts = [
    { icon: TrendingUp, text: 'Planche progressions', prompt: 'What are the progressions for learning the planche?' },
    { icon: Dumbbell, text: 'Core exercises', prompt: 'Suggest advanced core exercises for calisthenics' },
    { icon: Search, text: 'Pull strength', prompt: 'What exercises build pulling strength for muscle-ups?' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Exercise Lab
                </h1>
                <p className="text-sm text-muted-foreground">
                  Discover exercises with AI-powered coaching
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Sign in to use AI Lab</h2>
                <p className="text-muted-foreground">
                  Get personalized exercise recommendations, progressions, and add them directly to your library.
                </p>
                <Button onClick={() => navigate('/auth')}>Sign In</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <AILabChat />
        )}
      </main>
    </div>
  );
}