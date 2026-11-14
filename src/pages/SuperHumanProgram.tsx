import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ChevronDown, Clock3, Play, ShieldCheck, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { EmbeddedMedia } from '@/components/Exercise/EmbeddedMedia';
import { AssistedSkillsLab } from '@/components/Training/AssistedSkillsLab';
import {
  SUPERHUMAN_BALANCE, SUPERHUMAN_REELS, SUPERHUMAN_SESSIONS,
  type RoutineMove, type SessionKey,
} from '@/data/superHumanRoutine';

type Preferences = { frequency: 3 | 4; day: SessionKey; week: number; plancheMax: string; lsitMax: string };
const STORAGE_KEY = 'power-superhuman-blueprint-v1';
const defaults: Preferences = { frequency: 3, day: 'A', week: 1, plancheMax: '', lsitMax: '' };
function readPreferences(): Preferences {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Partial<Preferences> | null;
    if (!stored) return defaults;
    return {
      frequency: stored.frequency === 4 ? 4 : 3,
      day: ['A', 'B', 'C', 'D'].includes(stored.day || '') ? stored.day as SessionKey : 'A',
      week: Number.isInteger(stored.week) && Number(stored.week) >= 1 && Number(stored.week) <= 12 ? Number(stored.week) : 1,
      plancheMax: typeof stored.plancheMax === 'string' ? stored.plancheMax : '',
      lsitMax: typeof stored.lsitMax === 'string' ? stored.lsitMax : '',
    };
  } catch { return defaults; }
}
function safeMax(value: string): number | undefined {
  const n = Number(value);
  return value.trim() !== '' && Number.isFinite(n) && n > 0 && n <= 300 ? n : undefined;
}
function dose(move: RoutineMove, deload: boolean, plancheMax: string, lsitMax: string): string {
  if (move.count) return String(deload ? Math.ceil(move.count / 2) : move.count) + ' ' + (move.countUnit || 'tries');
  const sets = move.sets ? (deload ? Math.ceil(move.sets / 2) : move.sets) : undefined;
  if (move.holdMetric) {
    const best = safeMax(move.holdMetric === 'planche' ? plancheMax : lsitMax);
    const goal = best ? String(Math.max(1, Math.round(best * 0.65))) + ' sec' : '65% of your best hold';
    return String(sets || 3) + ' × ' + goal;
  }
  return sets ? String(sets) + ' × ' + (move.target || 'quality practice') : (move.target || 'quality practice');
}
function MovementRow({ move, deload, plancheMax, lsitMax }: {
  move: RoutineMove; deload: boolean; plancheMax: string; lsitMax: string;
}) {
  return <div className="group flex items-start gap-3 border-b border-border/60 py-3 last:border-b-0">
    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/70" aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-semibold leading-5 text-foreground">{move.name}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{dose(move, deload, plancheMax, lsitMax)}</p>
      {move.note && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{move.note}</p>}
    </div>
    {move.slug && move.goal && <Link
      to={'/?goal=' + encodeURIComponent(move.goal) + '&node=' + encodeURIComponent(move.slug)}
      className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 text-[11px] font-semibold text-primary hover:bg-accent"
      aria-label={'Explore ' + move.name + ' in your movement library'}
    >Explore <ArrowRight size={13} /></Link>}
  </div>;
}

export default function SuperHumanProgram() {
  const [prefs, setPrefs] = useState<Preferences>(readPreferences);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [allVideos, setAllVideos] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* Device may disallow storage. */ }
  }, [prefs]);

  const day = prefs.frequency === 3 && prefs.day === 'D' ? 'A' : prefs.day;
  const session = SUPERHUMAN_SESSIONS.find(item => item.key === day) || SUPERHUMAN_SESSIONS[0];
  const isDeload = prefs.week % 4 === 0;
  const isRetest = prefs.week % 3 === 0;
  const reels = useMemo(() => allVideos
    ? SUPERHUMAN_REELS
    : SUPERHUMAN_REELS.filter(clip => clip.days.includes(day)), [day, allVideos]);
  const playing = SUPERHUMAN_REELS.find(clip => clip.id === selectedVideo);
  const patch = (change: Partial<Preferences>) => setPrefs(old => ({ ...old, ...change }));
  const labeledDays = prefs.frequency === 4 ? SUPERHUMAN_SESSIONS : SUPERHUMAN_SESSIONS.slice(0, 3);

  return <main className="min-h-screen bg-background pb-28 text-foreground md:pb-14">
    <div className="mx-auto max-w-5xl space-y-5 px-3 py-5 sm:px-6 sm:py-8">
      <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16}/> Back to my workout builder
      </Link>

      <header className="relative overflow-hidden rounded-[24px] border border-amber-500/20 bg-[#161819] p-5 text-zinc-50 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border-[24px] border-amber-400/10" aria-hidden="true" />
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">TLC / Super Human Strength</p>
        <h1 className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">Your Skill Blueprint<span className="text-amber-400">.</span></h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300">Handstand · Planche · Press · Compression · Human flag. A suggested training formula, never a preloaded workout.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-semibold">3 or 4 sessions</span>
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-semibold">No fixed weekdays</span>
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-semibold">Adaptive holds</span>
          <a href="#assisted-skills" className="rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-200 hover:bg-amber-400/20">Bands & gear ↓</a>
        </div>
      </header>

      <section aria-label="Set training frequency and week" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Your training rhythm</p>
            <h2 className="mt-1 text-lg font-bold">Choose your weekly structure</h2>
          </div>
          <div role="group" aria-label="Training days" className="flex rounded-xl border border-border bg-background p-1">
            {([3,4] as const).map(n => <button key={n} type="button" aria-pressed={prefs.frequency === n}
              onClick={() => patch({frequency:n,day:n===3&&prefs.day==='D'?'A':prefs.day})}
              className={'min-h-10 rounded-lg px-4 text-xs font-bold transition-colors ' + (prefs.frequency===n?'bg-foreground text-background':'text-muted-foreground hover:bg-accent')}>{n} days</button>)}
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {prefs.frequency===3 ? 'A → rest → B → rest → C. Never train A, B and C on back-to-back days.' : 'A → B → rest → C → D. No more than two training days in a row.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold"><CalendarDays size={15} className="text-primary"/> Training week</div>
          <select aria-label="Select training week" value={prefs.week} onChange={event=>patch({week:Number(event.target.value)})}
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold">
            {Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={n}>Week {n}{n%4===0?' · deload':''}{n%3===0?' · retest':''}</option>)}
          </select>
        </div>
        {(isDeload||isRetest) && <div className="mt-3 flex flex-wrap gap-2">
          {isDeload && <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-foreground">Deload week: sets and attempts shown at about half volume.</p>}
          {isRetest && <p className="rounded-lg border border-border bg-accent/40 px-3 py-2 text-xs font-semibold">Retest best holds this week, while fresh.</p>}
        </div>}
      </section>

      <section aria-labelledby="current-session" className="space-y-4">
        <div className="flex items-end justify-between gap-3 px-1">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Select your session</p><h2 id="current-session" className="mt-1 text-xl font-black">A–D skill sessions</h2></div>
          <span className="text-[11px] text-muted-foreground">Select, review, then build</span>
        </div>
        <div role="group" aria-label="Choose session" className={'grid gap-2 ' + (prefs.frequency===4?'grid-cols-4':'grid-cols-3')}>
          {labeledDays.map(item => <button key={item.key} type="button" aria-pressed={day===item.key} onClick={()=>patch({day:item.key})}
            className={'min-h-[67px] rounded-xl border p-2 text-left transition-colors sm:p-3 ' + (day===item.key?'border-amber-500 bg-amber-500/10 shadow-sm':'border-border bg-card hover:bg-accent')}>
            <span className="block text-base font-black">Day {item.key}</span><span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">{item.key==='A'?'Push + Planche':item.key==='B'?'Press + Core':item.key==='C'?'Flag + Pull':'Technique'}</span>
          </button>)}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-accent/30 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Day {session.key} / {prefs.frequency} day formula</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock3 size={14}/>{session.duration}</span>
            </div>
            <h3 className="mt-2 text-lg font-black sm:text-xl">{session.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{session.focus}</p>
          </div>
          <p className="px-4 pt-4 text-xs text-muted-foreground sm:px-5"><ShieldCheck size={14} className="mr-1 inline align-[-2px]"/> Start with wrist and shoulder preparation. Work at a controlled difficulty; rest as needed to maintain form.</p>
          <div className="space-y-5 p-4 sm:p-5">
            {session.groups.map(group=><section key={group.title} aria-label={group.title}>
              <h4 className="border-b border-border pb-2 text-[11px] font-black uppercase tracking-[0.11em] text-primary">{group.title}</h4>
              <div>{group.movements.map(move=><MovementRow key={move.name} move={move} deload={isDeload} plancheMax={prefs.plancheMax} lsitMax={prefs.lsitMax}/>)}</div>
            </section>)}
          </div>
        </div>
      </section>

      <section aria-labelledby="hold-targets" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2"><Target size={18} className="text-primary"/><h2 id="hold-targets" className="text-base font-black">Calculate your 65% hold targets</h2></div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Enter your best clean hold at your current progression. The program calculates a working target; it does not automatically advance your level.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {([{key:'plancheMax',label:'Planche best hold',value:prefs.plancheMax},{key:'lsitMax',label:'L-sit best hold',value:prefs.lsitMax}] as const).map(item=>
            <label key={item.key} className="block text-xs font-semibold">
              {item.label}<span className="mt-1.5 flex min-h-12 items-center rounded-xl border border-border bg-background px-3">
                <input type="number" min="1" max="300" step="1" inputMode="numeric" placeholder="Enter seconds"
                  className="min-w-0 w-full bg-transparent text-base font-bold outline-none" value={item.value}
                  onChange={event=>patch({[item.key]:event.target.value} as Partial<Preferences>)}/>
                <span className="text-xs text-muted-foreground">sec</span>
              </span>
              <span className="mt-1 block font-normal text-muted-foreground">{safeMax(item.value)?'Working hold: '+Math.max(1,Math.round(safeMax(item.value)!*0.65))+' sec':'No hold entered'}</span>
            </label>)}
        </div>
      </section>

      <section aria-label="Balance on off days" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <button type="button" aria-expanded={balanceOpen} onClick={()=>setBalanceOpen(v=>!v)}
          className="flex min-h-20 w-full items-center gap-3 px-4 py-3 text-left sm:px-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/50"><CalendarDays size={19} className="text-primary"/></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-black">10-minute balance practice</span><span className="mt-0.5 block text-xs text-muted-foreground">2–3 off-days · light skill practice</span></span>
          <ChevronDown size={18} className={'shrink-0 text-muted-foreground transition-transform '+(balanceOpen?'rotate-180':'')}/>
        </button>
        {balanceOpen && <div className="border-t border-border px-4 py-3 sm:px-5">
          {SUPERHUMAN_BALANCE[0].movements.map(move=><MovementRow key={move.name} move={move} deload={isDeload} plancheMax={prefs.plancheMax} lsitMax={prefs.lsitMax}/>)}
          <p className="mt-3 text-xs text-muted-foreground">These should stay easy, especially after high wrist or shoulder loads. Never force additional balance attempts through pain.</p>
        </div>}
      </section>

      <section aria-labelledby="starting-point" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary"/><h2 id="starting-point" className="text-base font-black">Start where you are</h2></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ['Planche','Frog stand → controlled short tuck holds','planche'],
            ['Human flag','Flag plank until the readiness assessment is passed','human-flag'],
            ['Compression','Tuck L-sit before extended-leg work','l-sit'],
            ['Handstand','Chest-to-wall holds before free attempts','handstand'],
          ].map(([name,stage,goal])=><Link to={'/assessment?skill='+goal} key={goal} className="flex min-h-[76px] items-center justify-between gap-2 rounded-xl border border-border bg-background p-3 hover:bg-accent">
            <span><strong className="block text-xs">{name}</strong><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{stage}</span></span><ArrowRight size={15} className="shrink-0 text-primary"/>
          </Link>)}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Skill links open the existing movement library or readiness test. Nothing is added to your workout unless you choose it.</p>
      </section>

      <AssistedSkillsLab />

      <section aria-labelledby="coaching-library" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Technique references</p><h2 id="coaching-library" className="mt-1 text-base font-black">Coach reel library</h2><p className="mt-1 text-xs text-muted-foreground">Eight reels you shared · public Instagram embeds inside the app.</p></div>
          <button type="button" onClick={()=>setAllVideos(v=>!v)} className="min-h-10 rounded-lg border border-border px-3 text-xs font-bold hover:bg-accent">{allVideos?'Show Day '+day:'View all 8'}</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {reels.map(clip=><button key={clip.id} type="button" onClick={()=>setSelectedVideo(clip.id)}
            className="flex min-h-[88px] items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/60 hover:bg-accent">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card"><Play size={17} className="text-primary"/></span>
            <span className="min-w-0 flex-1"><strong className="block text-[12px] leading-snug">{clip.title}</strong><small className="mt-1 block text-[11px] text-primary">{clip.skill}</small><small className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{clip.teaches}</small></span>
          </button>)}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Embedded reels depend on creator permissions and Instagram availability; videos have not been independently technique-reviewed.</p>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
        <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">Retest clean holds every 3 weeks. Halve sets every 4th week. Treat all targets as adjustable suggestions, not readiness standards.</p>
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-bold text-background">Open my workout builder <ArrowRight size={16}/></Link>
      </footer>
    </div>

    <Dialog open={Boolean(playing)} onOpenChange={open=>{if(!open)setSelectedVideo(null);}}>
      <DialogContent className="max-h-[88dvh] max-w-[min(94vw,650px)] overflow-y-auto">
        <DialogTitle className="pr-5 text-lg">{playing?.title || 'Coach reel'}</DialogTitle>
        <DialogDescription>{playing?.teaches || 'Movement reference'} · plays inside TLC's Super Human Strength.</DialogDescription>
        {playing && <EmbeddedMedia key={playing.id} url={playing.url} title={playing.title}/>}
      </DialogContent>
    </Dialog>
  </main>;
}
