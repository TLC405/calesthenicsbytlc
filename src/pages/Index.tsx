import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

import '@/styles/neumorph.css';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="premium-card p-12 max-w-2xl w-full text-center animate-fade-in">
        {/* Logo with gold glow */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-primary/20 rounded-3xl blur-xl" />
          <img 
            src="/lovable-uploads/7a4a3a95-2e51-4067-b126-c096a96fc31c.png" 
            alt="TLC's Workout" 
            className="relative w-32 h-32 object-contain rounded-2xl shadow-lg"
          />
        </div>

        {/* Premium Title */}
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
          <span className="gradient-text">TLC's</span>
          <br />
          <span className="text-foreground">Workout</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl text-muted-foreground mb-2 font-light tracking-wide">
          Master Your Training
        </p>
        
        {/* Subtitle with gold accent */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-4 h-4 text-gold" />
          <p className="text-muted-foreground font-mono text-sm">
            120+ Premium Exercises • AI Coaching • Progress Tracking
          </p>
          <Sparkles className="w-4 h-4 text-gold" />
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/auth')}
          size="lg"
          className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-lg px-8 py-6 premium-hover"
        >
          Begin Your Journey
          <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>

        {/* Bottom accent */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Elevate Your Training
          </p>
        </div>
      </div>
    </div>
  );
}
