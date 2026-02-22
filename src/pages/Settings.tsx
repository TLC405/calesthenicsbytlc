import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, LogOut, User, Shield } from 'lucide-react';

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
      toast({ title: 'Saved', description: 'Profile updated.' });
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
    link.download = 'powa-training-data.json';
    link.click();
    toast({ title: 'Exported', description: 'Training data downloaded.' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Brutalist header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-14 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-foreground" />
          <h1 className="font-display text-sm font-bold uppercase tracking-wider">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* Profile */}
        <section className="border-2 border-foreground bg-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em]">Profile</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="h-10 bg-muted/30 border-2 border-foreground/10 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Display Name</Label>
              <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-10 border-2 border-foreground/20 focus:border-foreground transition-colors" />
            </div>
            <Button type="submit" disabled={loading} size="sm" className="font-mono uppercase tracking-wider text-[10px] border-2 border-foreground">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Data Export */}
        <section className="border-2 border-foreground bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em]">Data Export</h2>
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-4">Download your training data as JSON.</p>
          <Button onClick={handleExportData} variant="outline" size="sm" className="font-mono uppercase tracking-wider text-[10px] border-2 border-foreground">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </section>

        {/* Account */}
        <section className="border-2 border-destructive bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-2 border-destructive flex items-center justify-center">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-destructive">Account</h2>
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-4">Sign out of your account.</p>
          <Button onClick={async () => { await signOut(); navigate('/auth'); }} variant="destructive" size="sm" className="font-mono uppercase tracking-wider text-[10px]">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </section>
      </main>
    </div>
  );
}
