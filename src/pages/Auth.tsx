import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Lock, Mail, User } from 'lucide-react';

const logo = '/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png';

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
          description: 'Check your email to confirm your account.',
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
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="TLC's Workout" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-display text-xl font-bold text-background">
                TLC's Hybrid
              </h1>
              <p className="text-xs text-background/60 uppercase tracking-widest">
                Training System
              </p>
            </div>
          </div>

          {/* Center content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-background/60 text-sm uppercase tracking-widest">
                Master Your Training
              </p>
              <h2 className="font-display text-4xl font-bold text-background leading-tight">
                Build Strength.<br />
                Track Progress.<br />
                Achieve Goals.
              </h2>
            </div>
            
            <div className="flex gap-8 pt-4">
              <div className="space-y-1">
                <p className="font-display text-3xl font-bold text-background">120+</p>
                <p className="text-background/60 text-sm">Exercises</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl font-bold text-background">6</p>
                <p className="text-background/60 text-sm">Categories</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl font-bold text-background">∞</p>
                <p className="text-background/60 text-sm">Potential</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-background/40 text-xs">
            © 2025 TLC's Hybrid Training. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img 
              src={logo} 
              alt="TLC's Workout" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-display text-xl font-bold">TLC's Hybrid</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Training System
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Start your training journey today' 
                : 'Sign in to continue your training'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 bg-secondary border-2 border-border focus:border-foreground transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-12 bg-secondary border-2 border-border focus:border-foreground transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
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
                className="h-12 bg-secondary border-2 border-border focus:border-foreground transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 font-semibold text-base shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] transition-shadow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 animate-pulse" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-4 border-t border-border">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
