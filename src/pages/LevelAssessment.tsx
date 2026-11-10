import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Activity, ArrowRight, Check, ClipboardCheck, RotateCcw, Target } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { SKILL_PATHS, getSkillPath } from '@/data/skillPaths';
import { exerciseBySlug, nodeDose } from '@/lib/skillGraph';
import { readSkillChecks, saveSkillCheck, suggestedSkillStep, type SkillCheck } from '@/lib/skillCheck';

const featuredIds = [
  'planche', 'front-lever', 'back-lever', 'human-flag', 'handstand',
  'pike-press', 'hspu', 'straddle-press', 'ring-muscle-up', 'pull-up',
  'grip', 'l-sit', 'rings', 'pistol', 'straight-arm', 'pike-compression',
];
const allPaths = [...SKILL_PATHS].filter(path => path.slugs.length > 0);
const featured = featuredIds.map(id => getSkillPath(id)).filter((path): path is NonNullable<typeof path> => Boolean(path));
const formatResult = (check: SkillCheck) => {
  if (!check.slug) return 'Not tested yet';
  const name = exerciseBySlug.get(check.slug)?.name || check.slug;
  return name + (check.value === null ? '' : ' · ' + check.value + ' ' + check.metric) + ' · quality ' + check.quality + '/5';
};

export default function LevelAssessment() {
  const { user } = useAuth();
  const owner = user?.id || 'guest';
  const [params] = useSearchParams();
  const initial = getSkillPath(params.get('skill') || '')?.id || 'planche';
  const [pathId, setPathId] = useState(initial);
  const [checks, setChecks] = useState<Record<string, SkillCheck>>(() => readSkillChecks(owner));
  const [untested, setUntested] = useState(true);
  const [slug, setSlug] = useState('');
  const [value, setValue] = useState('');
  const [quality, setQuality] = useState(0);
  const [assistance, setAssistance] = useState<SkillCheck['assistance']>('none');
  const [comfortable, setComfortable] = useState(false);
  const [message, setMessage] = useState('');
  const path = getSkillPath(pathId) || allPaths[0];
  const current = checks[path.id];
  const suggestion = suggestedSkillStep(path, current);
  const selected = slug && path.slugs.includes(slug) ? slug : path.slugs[0];
  const metric = nodeDose(selected).metric;
  const stepNumber = current?.slug ? path.slugs.indexOf(current.slug) + 1 : 0;
  const completed = Object.keys(checks).length;

  useEffect(() => { setChecks(readSkillChecks(owner)); }, [owner]);
  useEffect(() => {
    const stored = checks[path.id];
    setUntested(!stored?.slug);
    setSlug(stored?.slug || path.slugs[0]);
    setValue(stored?.value === null || stored?.value === undefined ? '' : String(stored.value));
    setQuality(stored?.quality || 0);
    setAssistance(stored?.assistance || 'none');
    setComfortable(stored?.comfortable || false);
    setMessage('');
  }, [path.id, owner]);

  function save() {
    if (!untested && (!Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 999 || !quality)) {
      setMessage('Enter a controlled result and rate your technique from 1 to 5.');
      return;
    }
    const entry: SkillCheck = {
      pathId: path.id,
      slug: untested ? null : selected,
      metric,
      value: untested ? null : Number(value),
      quality: untested ? 0 : quality,
      assistance: untested ? 'none' : assistance,
      comfortable: untested ? false : comfortable,
      at: new Date().toISOString(),
    };
    if (!saveSkillCheck(owner, entry)) { setMessage('Could not save your check on this device.'); return; }
    setChecks(readSkillChecks(owner));
    setMessage('Skill check saved. Your training plan has not been changed.');
  }

  function choosePath(id: string) {
    setPathId(id);
    document.getElementById('skill-check-form')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  return <main className="power-simple-page max-w-6xl mx-auto px-4 sm:px-6 pb-32">
    <header className="power-simple-heading mt-5 mb-6">
      <div>
        <p className="power-simple-eyebrow flex items-center gap-2"><ClipboardCheck size={16}/> TLC / SUPER HUMAN SKILLS CHECK</p>
        <h1>Discover your super human starting point.</h1>
        <p>See where your super human strength stands. Measure one skill at a time, then explore optional next-level suggestions—never preset workouts.</p>
      </div>
    </header>

    <section className="grid grid-cols-2 gap-3 mb-6" aria-label="Assessment overview">
      <div className="power-elevated p-4 rounded-2xl">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Skills checked</p>
        <p className="font-display text-3xl font-bold mt-1">{completed}<span className="text-sm ml-1 text-muted-foreground">/ {allPaths.length}</span></p>
      </div>
      <div className="power-elevated p-4 rounded-2xl">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">How it works</p>
        <p className="font-bold text-sm mt-2">Measure → review → choose</p>
        <p className="text-xs text-muted-foreground mt-1">No automatic workouts</p>
      </div>
    </section>

    <section className="mb-6" aria-labelledby="featured-skill-checks">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 id="featured-skill-checks" className="font-bold text-lg">Popular skills</h2>
        <span className="text-xs text-muted-foreground">Pick a skill to assess</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {featured.map(item => <button key={item.id} type="button"
          onClick={() => choosePath(item.id)} aria-pressed={path.id === item.id}
          className={'rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ' +
            (path.id === item.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border/60 hover:border-primary/60')}>
          {checks[item.id]?.slug ? <Check size={12} className="inline mr-1"/> : null}{item.title}
        </button>)}
      </div>
    </section>

    <section id="skill-check-form" className="power-elevated rounded-2xl p-4 sm:p-7 space-y-5 scroll-mt-20" aria-label="Individual skill test">
      <div className="flex gap-3 items-center">
        <span className="h-11 w-11 flex items-center justify-center rounded-xl bg-primary/10 text-primary"><Target size={22}/></span>
        <div><p className="text-[10px] uppercase tracking-widest text-primary">Individual baseline</p><h2 className="font-display text-xl font-bold">Test your current strength</h2></div>
      </div>
      <label className="block text-sm font-semibold">Skill category
        <select className="mt-2 w-full min-h-12 rounded-xl border border-border bg-background px-3 text-sm" value={path.id} onChange={event => setPathId(event.target.value)}>
          {allPaths.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}
        </select>
      </label>
      <p className="text-sm text-muted-foreground">{path.focus}. Use a recent controlled result, or test gently with appropriate equipment and a safe exit. This is not a max-effort challenge.</p>
      <label className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-sm cursor-pointer">
        <input type="checkbox" className="h-5 w-5 accent-[hsl(var(--primary))]" checked={untested} onChange={event => setUntested(event.target.checked)}/>
        I haven't tested this skill yet / I'm not sure
      </label>
      {!untested && <>
        <label className="block text-sm font-semibold">Hardest variation you can perform with control
          <select className="mt-2 w-full min-h-12 rounded-xl border border-border bg-background px-3 text-sm" value={selected} onChange={event => { setSlug(event.target.value); setValue(''); }}>
            {path.slugs.map((movement, index) => <option key={movement} value={movement}>{index + 1}. {exerciseBySlug.get(movement)?.name || movement}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm font-semibold">Best controlled {metric === 'seconds' ? 'hold (seconds)' : 'repetitions'}
            <input type="number" inputMode="numeric" min="1" max="999" value={value} onChange={event => setValue(event.target.value)}
              className="mt-2 w-full min-h-12 rounded-xl border border-border bg-background px-3 text-base" placeholder={metric === 'seconds' ? 'e.g. 12' : 'e.g. 6'}/>
          </label>
          <label className="block text-sm font-semibold">Assistance used
            <select className="mt-2 w-full min-h-12 rounded-xl border border-border bg-background px-3 text-sm" value={assistance} onChange={event => setAssistance(event.target.value as SkillCheck['assistance'])}>
              <option value="none">None</option><option value="wall">Wall</option><option value="feet">Feet supported</option><option value="band">Band</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend className="font-semibold text-sm mb-2">Technique quality</legend>
          <p className="text-xs text-muted-foreground mb-3">1 = lost control · 3 = inconsistent · 5 = clean and repeatable</p>
          <div className="grid grid-cols-5 gap-2">
            {[1,2,3,4,5].map(n => <button key={n} type="button" aria-pressed={quality === n} onClick={() => setQuality(n)}
              className={'h-12 rounded-xl border font-bold text-sm ' + (quality === n ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card')}>{n}</button>)}
          </div>
        </fieldset>
        <label className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-sm cursor-pointer">
          <input type="checkbox" className="h-5 w-5 accent-[hsl(var(--primary))]" checked={comfortable} onChange={event => setComfortable(event.target.checked)}/>
          This variation felt comfortable, with no sharp or joint pain, and I could enter and exit safely
        </label>
      </>}
      <button type="button" onClick={save} className="w-full min-h-12 flex justify-center items-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
        <Check size={18}/> Save my skill check
      </button>
      {message && <p role="status" className="text-xs text-primary font-semibold">{message}</p>}
    </section>

    <section className="power-elevated rounded-2xl p-4 sm:p-6 mt-5 space-y-3" aria-label="Your skill assessment result">
      <div className="flex items-center gap-2"><Activity className="text-primary" size={19}/><h2 className="font-bold text-lg">Your super human level · {path.title}</h2></div>
      {current ? <>
        <p className="text-sm font-semibold">{formatResult(current)}</p>
        {current.slug && <div className="h-2 rounded-full bg-muted overflow-hidden" aria-label={'Step ' + stepNumber + ' of ' + path.slugs.length}>
          <div className="h-full bg-primary" style={{width: String(stepNumber / path.slugs.length * 100) + '%'}}/>
        </div>}
        <p className="text-xs text-muted-foreground">{current.slug ? 'Variation ' + stepNumber + ' of ' + path.slugs.length : 'Baseline not established'} · Last checked {new Date(current.at).toLocaleDateString()}</p>
        <div className="border-t border-border/50 pt-3">
          <p className="text-[10px] uppercase tracking-widest text-primary">Optional suggestion</p>
          <p className="font-bold text-base mt-1">{suggestion.label}</p>
          <p className="text-sm mt-1">{suggestion.slug ? exerciseBySlug.get(suggestion.slug)?.name || suggestion.slug : 'Choose a skill'}</p>
          <p className="text-xs text-muted-foreground mt-2">{suggestion.reason}</p>
          <Link to={'/skills/' + path.id} className="inline-flex items-center gap-2 min-h-11 text-sm font-semibold text-primary mt-2">Explore skill progression <ArrowRight size={17}/></Link>
        </div>
      </> : <div className="text-sm text-muted-foreground">No result saved for this skill yet. Choose your current variation above or mark it untested.</div>}
      <p className="text-[11px] text-muted-foreground">Based on self-reported performance, not a verified physical evaluation. Suggested steps are not automatic clearance for advanced skills. No workout has been added or scheduled.</p>
    </section>

    {completed > 0 && <section className="mt-7 space-y-3" aria-label="Other skill results">
      <div className="flex items-center justify-between"><h2 className="font-bold text-lg">Your strength profile</h2><span className="text-xs text-muted-foreground">Retest anytime</span></div>
      {Object.values(checks).sort((a,b) => b.at.localeCompare(a.at)).map(item => {
        const checkedPath = getSkillPath(item.pathId);
        return checkedPath && <button type="button" key={item.pathId} onClick={() => choosePath(item.pathId)} className="w-full rounded-xl border border-border/60 bg-card p-3 flex gap-3 items-center text-left">
          <span className="w-9 h-9 flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><RotateCcw size={17}/></span>
          <span className="min-w-0 flex-1"><strong className="block text-sm">{checkedPath.title}</strong><small className="block text-muted-foreground mt-1 text-xs truncate">{formatResult(item)}</small></span>
          <ArrowRight size={17} className="shrink-0 text-primary"/>
        </button>;
      })}
    </section>}
    <div className="mt-7 flex gap-4 text-sm"><Link to="/skills" className="text-primary font-semibold">Browse all skills</Link><Link to="/" className="text-primary font-semibold">Explore suggested movements</Link></div>
  </main>;
}
