import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Target } from 'lucide-react';
import logo from '@/assets/logo.jfif';
import '@/styles/neumorph.css';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="neumorph p-12 mb-12 text-center">
          <img 
            src={logo} 
            alt="CalX Bulls Logo" 
            className="w-24 h-24 object-contain rounded-2xl shadow-lg mx-auto mb-6"
          />
          <h1 className="text-5xl font-bold text-navy mb-4">CalX Bulls Planner</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Elite Calisthenics Training System - Master bodyweight movements through intelligent progression
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="neumorph-hover neumorph-pressed text-lg px-8"
            >
              Start Training
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              variant="outline"
              className="neumorph-flat neumorph-hover text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neumorph p-6 text-center">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Calendar-First Planning</h3>
            <p className="text-muted-foreground">
              Schedule workouts with an intuitive calendar interface
            </p>
          </div>

          <div className="neumorph p-6 text-center">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Skill Progressions</h3>
            <p className="text-muted-foreground">
              Follow proven progression paths to master advanced skills
            </p>
          </div>

          <div className="neumorph p-6 text-center">
            <Target className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Log workouts and monitor your journey to mastery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
