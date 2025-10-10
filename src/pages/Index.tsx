import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import logo from '@/assets/logo.jfif';
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
      <div className="neumorph p-12 rounded-3xl max-w-2xl w-full text-center">
        <img 
          src={logo} 
          alt="CalX Bulls" 
          className="w-32 h-32 object-contain rounded-2xl shadow-lg mx-auto mb-8"
        />
        <h1 className="text-5xl font-bold text-navy mb-6">
          CalX Bulls
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Elite Calisthenics Training System
        </p>
        <p className="text-muted-foreground mb-8">
          Your complete workout logger and planner with 115+ exercises
        </p>
        <Button
          onClick={() => navigate('/auth')}
          size="lg"
          className="neumorph-flat neumorph-hover text-lg px-8"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
