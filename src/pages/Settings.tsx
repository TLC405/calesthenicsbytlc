import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useMusic } from '@/providers/MusicProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Download, LogOut, User, Shield, Music, Link } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const music = useMusic();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [playlistInput, setPlaylistInput] = useState('');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    setPlaylistInput(music.playlistUrl);
  }, [music.playlistUrl]);

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

  const handleSavePlaylist = () => {
    music.setPlaylistUrl(playlistInput);
    toast({ title: 'Saved', description: 'Playlist URL updated.' });
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-14 flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-foreground" />
          <h1 className="font-display text-sm font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* Profile */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight">Profile</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="h-10 rounded-xl bg-muted/30 border-border text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">Display Name</Label>
              <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-10 rounded-xl border-border focus:border-ring transition-colors" />
            </div>
            <Button type="submit" disabled={loading} size="sm" className="font-mono uppercase tracking-wider text-[10px] rounded-lg">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Music */}
        <section className="rounded-xl border border-[hsl(var(--cat-skills))] bg-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--cat-skills))] flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight">Music</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Background Music</Label>
              <Switch checked={music.musicEnabled} onCheckedChange={music.setMusicEnabled} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Volume</Label>
              <Slider value={[music.volume]} onValueChange={([v]) => music.setVolume(v)} max={100} step={1} className="w-full" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">YouTube Playlist URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/playlist?list=..."
                  value={playlistInput}
                  onChange={(e) => setPlaylistInput(e.target.value)}
                  className="h-10 rounded-xl border-border focus:border-[hsl(var(--cat-skills))] transition-colors flex-1"
                />
                <Button onClick={handleSavePlaylist} size="sm" variant="outline" className="font-mono uppercase tracking-wider text-[10px] h-10 px-4 rounded-lg">
                  <Link className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground">Paste a YouTube or YouTube Music playlist URL to play across the app.</p>
            </div>
          </div>
        </section>

        {/* Data Export */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight">Data Export</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Download your training data as JSON.</p>
          <Button onClick={handleExportData} variant="outline" size="sm" className="font-mono uppercase tracking-wider text-[10px] rounded-lg">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </section>

        {/* Account */}
        <section className="rounded-xl border border-destructive/30 bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight text-destructive">Account</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Sign out of your account.</p>
          <Button onClick={async () => { await signOut(); navigate('/auth'); }} variant="destructive" size="sm" className="font-mono uppercase tracking-wider text-[10px] rounded-lg">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </section>
      </main>
    </div>
  );
}
