import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, BarChart3, BrainCircuit, Dumbbell, Film, Heart, MessageSquare, RefreshCw, ShieldCheck, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';

type Overview = Record<string, number>;
const cards = [
  { key: 'users', label: 'Members', icon: Users },
  { key: 'exercises', label: 'Exercises', icon: Dumbbell },
  { key: 'videos', label: 'Video tutorials', icon: Film },
  { key: 'custom_exercises', label: 'Member exercises', icon: Zap },
  { key: 'workouts', label: 'Logged workouts', icon: Activity },
  { key: 'community_posts', label: 'Community posts', icon: MessageSquare },
  { key: 'likes', label: 'Post likes', icon: Heart },
  { key: 'ai_requests_today', label: 'AI requests today', icon: BrainCircuit },
];
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [access, setAccess] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const [overview, setOverview] = useState<Overview>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    if (!user) return;
    setBusy(true); setError('');
    const { data, error: rpcError } = await supabase.rpc('get_power_admin_overview');
    if (rpcError) {
      setError('Could not load admin data. Check database permissions and migration.');
      setAccess('denied');
    } else if (!data || typeof data !== 'object' || Array.isArray(data)) {
      setAccess('denied');
    } else {
      setOverview(data as Overview);
      setAccess('allowed');
    }
    setBusy(false);
  };
  useEffect(() => {
    if (!authLoading && user) void refresh();
    if (!authLoading && !user) setAccess('denied');
  }, [user?.id, authLoading]);
  if (authLoading || access === 'loading') return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Verifying administrator access…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (access === 'denied') return (
    <main className="min-h-screen bg-background px-5 py-14 text-center">
      <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
      <h1 className="mt-5 font-display text-2xl font-black">Admin access restricted</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">Only the confirmed POWER administrator can access this dashboard. {error}</p>
      <Button className="mt-6" onClick={() => navigate('/dashboard')}>Return home</Button>
    </main>
  );
  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Dashboard</Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void refresh()} className="gap-2 rounded-xl"><RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> Refresh</Button>
        </header>
        <div className="mt-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border bg-card"><ShieldCheck className="h-7 w-7 text-primary" /></div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Owner control center</p>
            <h1 className="font-display text-3xl font-black tracking-tight">POWER Admin</h1>
            <p className="mt-1 text-xs text-muted-foreground">{user.email} · secured by Supabase authentication and role-based access</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map(({key,label,icon:Icon}) => <div key={key} className="rounded-2xl border border-border/50 bg-card p-4">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-4 font-display text-3xl font-black tabular-nums">{(overview[key] ?? 0).toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>)}
        </div>
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => navigate('/library')} className="rounded-2xl border bg-card p-5 text-left hover:border-primary/40">
            <div className="flex items-center gap-2 font-semibold"><Film className="h-5 w-5 text-primary"/> Exercise and video library</div>
            <p className="mt-2 text-xs text-muted-foreground">Review exercise thumbnails, progression chains, and tutorial links.</p>
          </button>
          <button type="button" onClick={() => navigate('/community')} className="rounded-2xl border bg-card p-5 text-left hover:border-primary/40">
            <div className="flex items-center gap-2 font-semibold"><MessageSquare className="h-5 w-5 text-primary"/> Power Circle</div>
            <p className="mt-2 text-xs text-muted-foreground">Review your community feed. Moderation tooling is a separate upcoming release.</p>
          </button>
          <button type="button" onClick={() => navigate('/ai-lab')} className="rounded-2xl border bg-card p-5 text-left hover:border-primary/40">
            <div className="flex items-center gap-2 font-semibold"><BrainCircuit className="h-5 w-5 text-primary"/> AI coaching</div>
            <p className="mt-2 text-xs text-muted-foreground">Coach availability requires a server-side OpenAI API key. Daily member quotas are enforced in PostgreSQL.</p>
          </button>
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 font-semibold"><BarChart3 className="h-5 w-5 text-primary"/> Live analytics</div>
            <p className="mt-2 text-xs text-muted-foreground">Counts are fetched only after administrator authorization. No private user details are exposed.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
