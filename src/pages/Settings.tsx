import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import '@/styles/neumorph.css';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      fetchProfile();
    }
    setLoading(false);
  };

  const handleExportData = async () => {
    if (!user) return;

    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id);

    const dataStr = JSON.stringify({ workouts, profile }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tlc-planner-data.json';
    link.click();

    toast({
      title: 'Success',
      description: 'Data exported successfully',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="neumorph p-6 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="neumorph-flat neumorph-hover"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-navy">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="neumorph p-6">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="neumorph-inset"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="neumorph-inset"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="neumorph-hover neumorph-pressed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          <div className="neumorph p-6">
            <h2 className="text-xl font-bold mb-4">Data Export</h2>
            <p className="text-muted-foreground mb-4">
              Download your workout data and profile information
            </p>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="neumorph-flat neumorph-hover"
            >
              Export Data (JSON)
            </Button>
          </div>

          <div className="neumorph p-6">
            <h2 className="text-xl font-bold mb-4 text-destructive">Danger Zone</h2>
            <p className="text-muted-foreground mb-4">
              Sign out of your account
            </p>
            <Button
              onClick={async () => {
                await signOut();
                navigate('/auth');
              }}
              variant="destructive"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
