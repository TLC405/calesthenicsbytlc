import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Lock, Mail, User, Zap, Loader2 } from 'lucide-react';

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
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cat-skills))] via-[hsl(var(--cat-pull))] to-[hsl(var(--cat-push))]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.3\'/%3E%3C/svg%3E")' }} />
        
        <div className="relative z-10 flex flex-col justify-between p-10 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-mono">I GOT THE POWA</p>
          </div>

          <div className="space-y-8">
            <h2 className="font-display text-5xl xl:text-6xl font-bold leading-[0.9] uppercase tracking-tighter">
              Train.<br />
              Track.<br />
              Dominate.
            </h2>
            
            <div className="flex gap-8">
              {[
                { value: '150+', label: 'Exercises' },
                { value: '8', label: 'Categories' },
                { value: 'AI', label: 'Coach' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-[9px] font-mono uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} I GOT THE POWA
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--cat-skills))] to-[hsl(var(--cat-pull))] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold uppercase tracking-wider">I GOT THE POWA</h1>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? 'Start your journey' : 'Continue training'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName" type="text" value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 pl-10 rounded-xl border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="h-11 pl-10 rounded-xl border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="h-11 pl-10 rounded-xl border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 font-display font-bold uppercase tracking-wider text-sm rounded-xl bg-gradient-to-r from-[hsl(var(--cat-skills))] to-[hsl(var(--cat-pull))] text-white hover:opacity-90 shadow-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
