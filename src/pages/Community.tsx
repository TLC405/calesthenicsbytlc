import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowRight, Heart, MessageCircle, Send, ShieldCheck,
  Sparkles, TrendingUp, Users, Zap, Trash2, RefreshCw, Radio, Dumbbell,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/Community/NotificationBell';
import { MessageLikeButton } from '@/components/Community/MessageLikeButton';

type Post = Pick<Tables<'messages'>, 'id' | 'author_id' | 'author_name' | 'body' | 'like_count' | 'created_at'>;
type SortOrder = 'recent' | 'popular';
const MAX_POST_LENGTH = 2000;

function initialDemoPosts(): Post[] {
  const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
  return [
    {
      id: 'demo-post-maya', author_id: 'demo-maya', author_name: 'Maya R.',
      body: 'First unassisted handstand hold today. Only six seconds, but six seconds I earned. Consistency really is everything. 🤸',
      like_count: 28, created_at: minutesAgo(13),
    },
    {
      id: 'demo-post-jordan', author_id: 'demo-jordan', author_name: 'Jordan K.',
      body: 'Today’s session: 5 × 5 pull-ups, ring rows, and 15 minutes of shoulder mobility. Nothing flashy. Just showing up and getting stronger.',
      like_count: 16, created_at: minutesAgo(47),
    },
    {
      id: 'demo-post-you', author_id: 'demo-user', author_name: 'You',
      body: 'Working toward a cleaner L-sit and controlled ring support. What cue made the biggest difference for you?',
      like_count: 7, created_at: minutesAgo(124),
    },
    {
      id: 'demo-post-avery', author_id: 'demo-avery', author_name: 'Avery T.',
      body: 'Reminder: recovery is training, too. Rested yesterday. Came back stronger today. 💪',
      like_count: 12, created_at: minutesAgo(238),
    },
  ];
}

function initials(name: string) {
  return name.split(/\s+/).map(part => part[0] || '').join('').slice(0, 2).toUpperCase();
}

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  const viewerId = demo ? 'demo-user' : user?.id;
  const [posts, setPosts] = useState<Post[]>([]);
  const [demoPosts, setDemoPosts] = useState<Post[]>(initialDemoPosts);
  const [demoLikedIds, setDemoLikedIds] = useState<Set<string>>(() => new Set(['demo-post-jordan']));
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortOrder>('recent');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState('');

  const loadFeed = useCallback(async (showLoading = false) => {
    if (demo || !user) return;
    if (showLoading) setLoading(true);

    let query = supabase.from('messages')
      .select('id,author_id,author_name,body,like_count,created_at');
    query = sort === 'popular'
      ? query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false });
    const { data, error: fetchError } = await query.limit(40);

    if (fetchError) {
      setError('The community database is not connected yet. Apply the Power Circle Supabase migration to enable live posts.');
      setLoading(false);
      return;
    }

    const results = data ?? [];
    const ids = results.map(post => post.id);
    const likesResult = ids.length
      ? await supabase.from('message_likes').select('message_id')
          .eq('user_id', user.id).in('message_id', ids)
      : { data: [], error: null };

    if (likesResult.error) {
      toast.error('Your saved likes could not be loaded');
    }
    setLikedIds(new Set((likesResult.data ?? []).map(like => like.message_id)));
    setPosts(results);
    setError('');
    setLoading(false);
  }, [demo, user, sort]);

  useEffect(() => {
    if (!demo && user) void loadFeed(true);
    else setLoading(false);
  }, [demo, user, loadFeed]);

  useEffect(() => {
    if (demo || !user) return;
    const channel = supabase.channel('power-circle-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
        () => { void loadFeed(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_likes' },
        () => { void loadFeed(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [demo, user, loadFeed]);

  const orderedPosts = (demo ? demoPosts : posts).slice().sort((a, b) =>
    sort === 'popular'
      ? b.like_count - a.like_count || b.created_at.localeCompare(a.created_at)
      : b.created_at.localeCompare(a.created_at)
  );

  useEffect(() => {
    const id = location.hash.replace('#post-', '');
    if (id && orderedPosts.some(post => post.id === id)) {
      document.getElementById(`post-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location.hash, orderedPosts.length, loading]);

  async function publish() {
    const body = draft.trim();
    if (!viewerId || !body || body.length > MAX_POST_LENGTH || sending) return;
    setSending(true);
    if (demo) {
      setDemoPosts(prev => [{
        id: `demo-post-${Date.now()}`, author_id: 'demo-user', author_name: 'You',
        body, like_count: 0, created_at: new Date().toISOString(),
      }, ...prev]);
      setDraft('');
      toast.success('Demo post published locally');
    } else if (user) {
      const { error: insertError } = await supabase.from('messages')
        .insert({ author_id: user.id, body });
      if (insertError) toast.error('Could not publish your post', { description: insertError.message });
      else {
        setDraft('');
        toast.success('Your update is live!');
        void loadFeed();
      }
    }
    setSending(false);
  }

  async function removePost(post: Post) {
    if (post.author_id !== viewerId) return;
    if (!window.confirm('Delete this training update? This also removes its likes and notifications.')) return;
    if (demo) {
      setDemoPosts(prev => prev.filter(p => p.id !== post.id));
      toast.success('Demo post removed');
      return;
    }
    const { error: deleteError } = await supabase.from('messages')
      .delete().eq('id', post.id).eq('author_id', viewerId!);
    if (deleteError) toast.error('Could not delete the post', { description: deleteError.message });
    else void loadFeed();
  }

  function demoToggle(id: string, nextLiked: boolean) {
    setDemoLikedIds(prev => {
      const next = new Set(prev);
      if (nextLiked) next.add(id);
      else next.delete(id);
      return next;
    });
    setDemoPosts(prev => prev.map(post =>
      post.id === id ? { ...post, like_count: Math.max(0, post.like_count + (nextLiked ? 1 : -1)) } : post
    ));
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 h-[74px] md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Back to dashboard" onClick={() => navigate('/dashboard')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card hover:bg-accent transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-black uppercase tracking-tight truncate">Power Circle</p>
                <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-foreground">I Got The Power / Community</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {demo && <span className="hidden sm:inline-flex text-[9px] font-mono font-bold tracking-widest rounded-full bg-amber-500/10 text-amber-600 px-3 py-2">DEMO MODE</span>}
            <NotificationBell userId={user?.id} demo={demo} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <section className="relative overflow-hidden border-b border-border/50 py-11 sm:py-16">
          <div className="absolute right-[-32px] top-0 select-none pointer-events-none opacity-[0.035] dark:opacity-[0.065]">
            <Zap className="h-56 w-56 md:h-80 md:w-80" strokeWidth={0.65} />
          </div>
          <div className="relative max-w-2xl">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> The athlete network <span className="text-muted-foreground/40">/ 001</span>
            </div>
            <h1 className="font-display text-[clamp(2.65rem,7vw,5.5rem)] font-black tracking-[-0.065em] leading-[0.95] uppercase">
              Strive together.<br />
              <span className="text-primary">Rise together.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              The training floor beyond the gym. Share progress, ask real questions,
              and give other athletes their flowers. Every rep has a story.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" /> Athlete-first</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Members only</span>
              <span className="inline-flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-primary" /> Live reactions</span>
            </div>
          </div>
        </section>

        {demo && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span><strong>Interactive preview:</strong> posts and likes here are sample data and are not saved.</span>
            </div>
            {user && <Button variant="outline" size="sm" onClick={() => navigate('/community')}>Open live feed <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>}
          </div>
        )}

        {!demo && !user ? (
          <div className="mx-auto my-16 max-w-lg rounded-[28px] border border-border/60 bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users className="h-7 w-7" /></div>
            <h2 className="font-display text-2xl font-black tracking-tight">Your people are here.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Sign in to publish, like, and receive instant updates from other athletes.</p>
            <Button className="mt-6 w-full h-12 rounded-xl font-bold" onClick={() => navigate('/auth')}>Sign in / Join the circle <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button variant="ghost" className="mt-2 text-xs" onClick={() => navigate('/community?demo=1')}>Explore interactive demo</Button>
          </div>
        ) : (
          <div className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_282px] md:gap-10">
            <div className="min-w-0 space-y-7">
              <section className="rounded-[26px] border border-border/60 bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-sm font-black tracking-tight">Your next chapter</h2>
                    <p className="text-[11px] text-muted-foreground">Progress worth sharing, big or small.</p>
                  </div>
                </div>
                <label htmlFor="community-draft" className="sr-only">Share a training update</label>
                <Textarea id="community-draft" value={draft} onChange={e => setDraft(e.target.value)}
                  placeholder="What's one win, struggle, or breakthrough from your training today?"
                  maxLength={MAX_POST_LENGTH} rows={4}
                  className="min-h-[116px] resize-y rounded-2xl border-border/50 bg-background/60 p-4 text-sm focus-visible:ring-primary/40"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={cn('font-mono text-[10px] text-muted-foreground', draft.length > 1900 && 'text-amber-500')}>
                    {draft.length} / {MAX_POST_LENGTH}
                  </span>
                  <Button onClick={() => void publish()} disabled={!draft.trim() || sending || draft.trim().length > MAX_POST_LENGTH}
                    className="h-11 rounded-xl px-5 text-xs font-bold uppercase tracking-wider">
                    {sending ? 'Publishing...' : 'Post update'} <Send className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </section>

              <section aria-label="Community posts">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <h2 className="font-display text-lg font-black tracking-tight">The Feed</h2>
                    <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] text-muted-foreground tabular-nums">{orderedPosts.length}</span>
                  </div>
                  <div className="inline-flex rounded-xl border border-border/60 bg-card p-1">
                    {([
                      { id: 'recent', label: 'Latest', icon: Activity },
                      { id: 'popular', label: 'Top liked', icon: TrendingUp },
                    ] as const).map(option => (
                      <button key={option.id} type="button" aria-pressed={sort === option.id}
                        onClick={() => setSort(option.id)}
                        className={cn('flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold transition-colors',
                          sort === option.id ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                        <option.icon className="h-3.5 w-3.5" />{option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div role="alert" className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
                    <p className="text-sm font-bold">Community setup needed</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{error}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => void loadFeed(true)}>
                      <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
                    </Button>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-3" aria-label="Loading community posts">
                    {[1, 2, 3].map(n => <div key={n} className="h-44 animate-pulse rounded-[26px] border border-border/50 bg-card" />)}
                  </div>
                ) : orderedPosts.length === 0 && !error ? (
                  <div className="rounded-[26px] border border-dashed border-border p-9 text-center">
                    <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary/60" />
                    <h3 className="font-display text-lg font-black">Be the first to show up.</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Your first update could inspire someone else's next rep.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderedPosts.map((post, index) => (
                      <article id={`post-${post.id}`} key={post.id}
                        className="scroll-mt-28 rounded-[26px] border border-border/60 bg-card p-5 shadow-sm transition-colors hover:border-primary/25 sm:p-6">
                        <div className="flex items-start gap-3">
                          <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background font-display text-xs font-black tracking-tight">
                            {initials(post.author_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="font-display text-sm font-extrabold">{post.author_name}</h3>
                              {post.author_id === viewerId && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">YOU</span>}
                            </div>
                            <p className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} · TRAINING JOURNAL
                            </p>
                          </div>
                          {post.author_id === viewerId && (
                            <button type="button" title="Delete post" aria-label="Delete your post"
                              onClick={() => void removePost(post)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="my-5 whitespace-pre-wrap break-words text-sm leading-[1.85] text-foreground/90">{post.body}</p>
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                          <MessageLikeButton key={post.id}
                            messageId={post.id} initialLiked={demo ? demoLikedIds.has(post.id) : likedIds.has(post.id)}
                            initialLikeCount={post.like_count} currentUserId={viewerId} demo={demo}
                            onToggle={demo ? next => demoToggle(post.id, next) : undefined}
                          />
                          <span className="text-[9px] font-mono tracking-[0.14em] text-muted-foreground/70 uppercase">
                            {index === 0 && sort === 'recent' ? 'Fresh off the floor' : 'Keep moving'}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="hidden space-y-4 md:block">
              <div className="sticky top-28 space-y-4">
                <div className="rounded-[24px] bg-foreground p-6 text-background">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">The mindset</span>
                    <Zap className="h-5 w-5 fill-current" />
                  </div>
                  <h3 className="mt-7 font-display text-3xl font-black uppercase leading-[0.97] tracking-[-0.05em]">
                    Small wins.<br />Real power.
                  </h3>
                  <p className="mt-4 text-xs leading-relaxed opacity-70">
                    Real progress is built in public and earned in private. Share the work.
                  </p>
                  <div className="mt-7 h-1 w-14 rounded-full bg-primary" />
                </div>
                <div className="rounded-[24px] border border-border/60 bg-card p-5">
                  <div className="mb-4 flex items-center gap-2 font-display text-xs font-black">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Circle code
                  </div>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <p><strong className="text-foreground">01.</strong> Celebrate effort, not just outcomes.</p>
                    <p><strong className="text-foreground">02.</strong> Give constructive, respectful feedback.</p>
                    <p><strong className="text-foreground">03.</strong> Keep it about training and growth.</p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-dashed border-border/60 px-5 py-4">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Power Circle / V1</span>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 text-red-500" /> Likes notify the original author instantly.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
