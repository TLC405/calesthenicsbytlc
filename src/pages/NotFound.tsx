import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import '@/styles/neumorph.css';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="premium-card p-8 max-w-md text-center animate-scale-in">
        {/* Logo */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-primary/20 rounded-2xl blur-lg" />
          <img
            src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png"
            alt="TLC's Workout"
            className="relative w-16 h-16 object-contain rounded-xl mx-auto"
          />
        </div>

        {/* 404 Display */}
        <h1 className="font-display text-6xl font-bold gradient-text mb-2">404</h1>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            TLC's Hybrid Training
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
