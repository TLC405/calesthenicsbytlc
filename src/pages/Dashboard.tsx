import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar, Library, Settings, LogOut } from 'lucide-react';
import '@/styles/neumorph.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="neumorph p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">TLC Planner</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.display_name || user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="neumorph-flat neumorph-hover"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/planner')}
            className="neumorph p-6 text-left neumorph-hover neumorph-pressed"
          >
            <Calendar className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Planner</h2>
            <p className="text-muted-foreground">
              Schedule and track your workouts
            </p>
          </button>

          <button
            onClick={() => navigate('/library')}
            className="neumorph p-6 text-left neumorph-hover neumorph-pressed"
          >
            <Library className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Exercise Library</h2>
            <p className="text-muted-foreground">
              Browse exercises and progressions
            </p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="neumorph p-6 text-left neumorph-hover neumorph-pressed"
          >
            <Settings className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </button>
        </div>

        <div className="neumorph p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Today's Focus</h2>
          <p className="text-muted-foreground">
            No workout scheduled for today. Visit the planner to create one!
          </p>
        </div>
      </div>
    </div>
  );
}
