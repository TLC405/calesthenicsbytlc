import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, LogOut, User, Shield } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) { setProfile(data); setDisplayName(data.display_name || ''); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Your profile has been updated.' });
      fetchProfile();
    }
    setLoading(false);
  };

  const handleExportData = async () => {
    if (!user) return;
    const { data: workouts } = await supabase.from('workouts').select('*').eq('user_id', user.id);
    const dataStr = JSON.stringify({ workouts, profile }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tlc-workout-data.json';
    link.click();
    toast({ title: 'Exported', description: 'Your training data has been downloaded.' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-lg font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Profile */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-foreground" />
            </div>
            <h2 className="font-display text-base font-semibold">Profile</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="h-10 bg-muted/30 border-border/50 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Display Name</Label>
              <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-10 bg-secondary/50 border-border focus:border-foreground transition-colors" />
            </div>
            <Button type="submit" disabled={loading} size="sm">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Data Export */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <Download className="w-4 h-4 text-foreground" />
            </div>
            <h2 className="font-display text-base font-semibold">Data Export</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Download your workout history and profile as JSON.</p>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Data
          </Button>
        </section>

        {/* Account */}
        <section className="rounded-xl border border-destructive/20 bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            <h2 className="font-display text-base font-semibold text-destructive">Account</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Sign out of your account on this device.</p>
          <Button onClick={async () => { await signOut(); navigate('/auth'); }} variant="destructive" size="sm">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </section>
      </main>
    </div>
  );
}
