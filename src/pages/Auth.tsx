import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
const logo = '/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png';
import '@/styles/neumorph.css';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp
        ? await signUp(email, password, displayName)
        : await signIn(email, password);

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else if (isSignUp) {
        toast({
          title: "Welcome to TLC's Workout",
          description: 'Your account has been created. Start your journey!',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="premium-card p-8 w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-primary/20 rounded-2xl blur-lg" />
            <img 
              src={logo} 
              alt="TLC's Workout" 
              className="relative w-20 h-20 object-contain rounded-xl mx-auto"
            />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">
            <span className="gradient-text">TLC's</span>{' '}
            <span className="text-foreground">Workout</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="w-3 h-3 text-gold" />
            <p className="text-sm">
              {isSignUp ? 'Begin your transformation' : 'Welcome back, athlete'}
            </p>
            <Sparkles className="w-3 h-3 text-gold" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="h-12 bg-muted/50 border-border/50 focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-12 bg-muted/50 border-border/50 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="h-12 bg-muted/50 border-border/50 focus:border-primary transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary font-semibold premium-hover"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Bottom accent */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Master Your Training
          </p>
        </div>
      </div>
    </div>
  );
}
