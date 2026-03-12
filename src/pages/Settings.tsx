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
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Download, LogOut, User, Shield, Music, Link, Palette, Settings as SettingsIcon, Image } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const music = useMusic();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [playlistInput, setPlaylistInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteConfig, setSiteConfig] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => { if (!user) { navigate('/auth'); return; } fetchProfile(); checkAdmin(); fetchSiteConfig(); }, [user, navigate]);
  useEffect(() => { setPlaylistInput(music.playlistUrl); }, [music.playlistUrl]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) { setProfile(data); setDisplayName(data.display_name || ''); }
  };

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
    setIsAdmin(!!(data && data.length > 0));
  };

  const fetchSiteConfig = async () => {
    const { data } = await supabase.from('site_config').select('*');
    if (data) {
      const config: Record<string, string> = {};
      data.forEach((row: any) => { config[row.key] = row.value || ''; });
      setSiteConfig(config);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Saved', description: 'Profile updated.' }); fetchProfile(); }
    setLoading(false);
  };

  const handleExportData = async () => {
    if (!user) return;
    const { data: workouts } = await supabase.from('workouts').select('*').eq('user_id', user.id);
    const dataStr = JSON.stringify({ workouts, profile }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'power-training-data.json';
    link.click();
    toast({ title: 'Exported', description: 'Training data downloaded.' });
  };

  const handleSavePlaylist = () => {
    music.setPlaylistUrl(playlistInput);
    toast({ title: 'Saved', description: 'Playlist URL updated.' });
  };

  const updateSiteConfig = async (key: string, value: string) => {
    setConfigLoading(true);
    const { error } = await supabase.from('site_config').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      setSiteConfig(prev => ({ ...prev, [key]: value }));
      toast({ title: 'Updated', description: `${key} saved.` });
    }
    setConfigLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-foreground" />
          <h1 className="font-display text-base font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* Theme */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight">Theme</h2>
          </div>
          <ThemeSwitcher />
        </section>

        {/* Profile */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent/60 border border-border/30 flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight">Profile</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="h-11 rounded-xl bg-accent/30 border-border/30 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">Display Name</Label>
              <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-11 rounded-xl border-border/50 bg-card focus:border-ring" />
            </div>
            <Button type="submit" disabled={loading} size="sm" className="font-mono uppercase tracking-wider text-[10px] rounded-xl">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Music */}
        <section className="rounded-2xl border border-primary/20 bg-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-border/30">
              <Music className="w-4 h-4 text-primary" />
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
                <Input type="url" placeholder="https://www.youtube.com/playlist?list=..." value={playlistInput} onChange={(e) => setPlaylistInput(e.target.value)}
                  className="h-11 rounded-xl border-border/50 bg-card focus:border-ring flex-1" />
                <Button onClick={handleSavePlaylist} size="sm" variant="outline" className="font-mono uppercase tracking-wider text-[10px] h-11 px-4 rounded-xl border-border/50">
                  <Link className="w-3 h-3 mr-1" />Save
                </Button>
              </div>
              <p className="text-[8px] font-mono text-muted-foreground">Paste a YouTube Music playlist URL.</p>
            </div>
          </div>
        </section>

        {/* Data Export */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/60 border border-border/30 flex items-center justify-center">
              <Download className="w-4 h-4 text-muted-foreground" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight">Data Export</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Download your training data as JSON.</p>
          <Button onClick={handleExportData} variant="outline" size="sm" className="font-mono uppercase tracking-wider text-[10px] rounded-xl border-border/50">
            <Download className="w-3.5 h-3.5 mr-1.5" />Export
          </Button>
        </section>

        {/* Admin Panel */}
        {isAdmin && (
          <section className="rounded-2xl border border-primary/30 bg-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <SettingsIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold tracking-tight">Admin Panel</h2>
                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">App Configuration</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Image className="w-3 h-3" /> Loading Screen Image URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={siteConfig.loading_image_url || ''}
                    onChange={e => setSiteConfig(prev => ({ ...prev, loading_image_url: e.target.value }))}
                    className="h-11 rounded-xl border-border/50 bg-card focus:border-ring flex-1"
                  />
                  <Button onClick={() => updateSiteConfig('loading_image_url', siteConfig.loading_image_url || '')} size="sm" variant="outline" disabled={configLoading}
                    className="font-mono uppercase tracking-wider text-[10px] h-11 px-4 rounded-xl border-border/50">
                    Save
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Loading Screen Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={siteConfig.loading_video_url || ''}
                    onChange={e => setSiteConfig(prev => ({ ...prev, loading_video_url: e.target.value }))}
                    className="h-11 rounded-xl border-border/50 bg-card focus:border-ring flex-1"
                  />
                  <Button onClick={() => updateSiteConfig('loading_video_url', siteConfig.loading_video_url || '')} size="sm" variant="outline" disabled={configLoading}
                    className="font-mono uppercase tracking-wider text-[10px] h-11 px-4 rounded-xl border-border/50">
                    Save
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">App Tagline</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="I GOT THE POWER"
                    value={siteConfig.app_tagline || ''}
                    onChange={e => setSiteConfig(prev => ({ ...prev, app_tagline: e.target.value }))}
                    className="h-11 rounded-xl border-border/50 bg-card focus:border-ring flex-1"
                  />
                  <Button onClick={() => updateSiteConfig('app_tagline', siteConfig.app_tagline || '')} size="sm" variant="outline" disabled={configLoading}
                    className="font-mono uppercase tracking-wider text-[10px] h-11 px-4 rounded-xl border-border/50">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Account */}
        <section className="rounded-2xl border border-destructive/20 bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            <h2 className="font-display text-sm font-bold tracking-tight text-destructive">Account</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Sign out of your account.</p>
          <Button onClick={async () => { await signOut(); navigate('/auth'); }} variant="destructive" size="sm" className="font-mono uppercase tracking-wider text-[10px] rounded-xl">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />Sign Out
          </Button>
        </section>
      </main>
    </div>
  );
}
