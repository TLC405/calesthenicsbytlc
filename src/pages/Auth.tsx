import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Lock, Mail, User, ArrowLeft } from 'lucide-react';

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
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else if (isSignUp) {
        toast({ title: "Welcome to TLC's Workout", description: 'Check your email to confirm your account.' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Dark branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-foreground relative overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted)/0.06)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="TLC's Workout" className="w-10 h-10 rounded-lg object-cover border border-background/10" />
            <div>
              <h1 className="font-display text-base font-bold text-background">TLC's Hybrid</h1>
              <p className="text-[10px] text-background/40 uppercase tracking-[0.2em] font-mono">Training System</p>
            </div>
          </div>

          {/* Center hero */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-background/30 text-xs uppercase tracking-[0.3em] font-mono">
                Master Your Training
              </p>
              <h2 className="font-display text-4xl xl:text-5xl font-bold text-background leading-[1.15]">
                Build Strength.<br />
                Track Progress.<br />
                Achieve Goals.
              </h2>
            </div>
            
            <div className="flex gap-10 pt-2">
              {[
                { value: '120+', label: 'Exercises' },
                { value: '6', label: 'Categories' },
                { value: 'AI', label: 'Coaching' },
              ].map(stat => (
                <div key={stat.label} className="space-y-1">
                  <p className="font-display text-2xl font-bold text-background">{stat.value}</p>
                  <p className="text-background/40 text-xs font-mono">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-background/20 text-xs font-mono">
            © {new Date().getFullYear()} TLC's Hybrid Training
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <img src={logo} alt="TLC's Workout" className="w-10 h-10 rounded-lg object-cover border border-border" />
            <div>
              <h1 className="font-display text-lg font-bold">TLC's Hybrid</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">Training System</p>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Start your training journey today' : 'Sign in to continue your training'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName" type="text" value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 pl-10 bg-secondary/50 border-border focus:border-foreground transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="h-11 pl-10 bg-secondary/50 border-border focus:border-foreground transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="h-11 pl-10 bg-secondary/50 border-border focus:border-foreground transition-colors"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 font-semibold">
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

          {/* Toggle */}
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
