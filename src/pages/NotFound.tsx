import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Zap } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-14 h-14 border-2 border-foreground bg-[hsl(var(--cat-skills))] flex items-center justify-center mx-auto">
          <Zap className="w-7 h-7 text-background" />
        </div>

        <div>
          <h1 className="font-display text-7xl font-bold text-foreground leading-none">404</h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mt-2">
            Page not found
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)} className="border-2 border-foreground font-mono uppercase tracking-wider text-[10px]">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="border-2 border-foreground font-mono uppercase tracking-wider text-[10px]">
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Dashboard
          </Button>
        </div>

        <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-[0.3em]">
          I GOT THE POWA
        </p>
      </div>
    </div>
  );
};

export default NotFound;
