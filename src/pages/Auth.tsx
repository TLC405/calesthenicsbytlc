import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Lock, Mail, User, Zap } from 'lucide-react';

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
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else if (isSignUp) {
        toast({ title: 'Welcome', description: 'Check your email to confirm your account.' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Brutalist branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--background)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--background)/0.04)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-background/20 bg-[hsl(var(--cat-skills))] flex items-center justify-center">
              <Zap className="w-5 h-5 text-background" />
            </div>
            <p className="text-[9px] text-background/30 uppercase tracking-[0.3em] font-mono">I GOT THE POWA</p>
          </div>

          <div className="space-y-8">
            <h2 className="font-display text-5xl xl:text-6xl font-bold text-background leading-[0.9] uppercase tracking-tighter">
              Train.<br />
              Track.<br />
              <span className="text-destructive">Dominate.</span>
            </h2>
            
            <div className="flex gap-8">
              {[
                { value: '150+', label: 'Exercises', color: 'hsl(var(--cat-push))' },
                { value: '8', label: 'Categories', color: 'hsl(var(--cat-pull))' },
                { value: 'AI', label: 'Coach', color: 'hsl(var(--cat-skills))' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-background">{stat.value}</p>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: stat.color }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-background/15 text-[9px] font-mono uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} I GOT THE POWA
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-foreground bg-[hsl(var(--cat-skills))] flex items-center justify-center">
              <Zap className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold uppercase tracking-wider">I GOT THE POWA</h1>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">
              {isSignUp ? 'Start your journey' : 'Continue training'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName" type="text" value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 pl-10 border-2 border-foreground/20 focus:border-foreground transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="h-11 pl-10 border-2 border-foreground/20 focus:border-foreground transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="h-11 pl-10 border-2 border-foreground/20 focus:border-foreground transition-colors"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 font-display font-bold uppercase tracking-wider text-sm border-2 border-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 animate-pulse" />
                  Loading...
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
