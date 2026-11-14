import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, ChevronDown, ClipboardCheck, Dumbbell, Gauge,
  Minus, Plus, RotateCcw, ShieldCheck, Sparkles,
} from 'lucide-react';
import { ASSISTED_GEAR, ASSISTED_SKILLS, type AssistedArea } from '@/data/assistedSkills';

type BandStrength = 'heavy' | 'medium' | 'light' | 'none';
type SupportPoint = 'feet' | 'knees' | 'hips';
type SupportUnit = 'lb' | 'kg';
type LabState = {
  selected: AssistedArea;
  point: SupportPoint;
  band: BandStrength;
  baseline: string;
  assisted: string;
  units: SupportUnit;
  counts: Record<string, number>;
};
const STORAGE_KEY = 'power-assisted-skills-lab-v1';
const DEFAULT_STATE: LabState = {
  selected:'planche', point:'hips', band:'heavy',
  baseline:'', assisted:'', units:'lb', counts:{},
};
function readSaved(): LabState {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Partial<LabState> | null;
    if (!data) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      selected:ASSISTED_SKILLS.some(c=>c.id===data.selected) ? data.selected! : 'planche',
      point:['feet','knees','hips'].includes(data.point||'') ? data.point! : 'hips',
      band:['heavy','medium','light','none'].includes(data.band||'') ? data.band! : 'heavy',
      baseline:typeof data.baseline==='string' ? data.baseline : '',
      assisted:typeof data.assisted==='string' ? data.assisted : '',
      units:data.units==='kg' ? 'kg' : 'lb',
      counts:data.counts && typeof data.counts==='object' && !Array.isArray(data.counts) ? data.counts : {},
    };
  } catch { return DEFAULT_STATE; }
}

const n = (value: string) => value.trim() === '' ? NaN : Number(value);
const isValidReading = (value: number) => Number.isFinite(value) && value > 0 && value <= 2000;

export function AssistedSkillsLab() {
  const [open, setOpen] = useState(false);
  const [showGear, setShowGear] = useState(false);
  const [state, setState] = useState<LabState>(readSaved);
  const selected = ASSISTED_SKILLS.find(c=>c.id===state.selected) || ASSISTED_SKILLS[0];
  const patch = (next: Partial<LabState>) => setState(old=>({...old, ...next}));
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Optional device-only settings. */ }
  }, [state]);
  const key = state.selected + ':' + state.point + ':' + state.band;
  const logged = Math.max(0, Math.min(99, Number(state.counts[key]) || 0));
  const baseline = n(state.baseline);
  const assisted = n(state.assisted);
  const readingsOk = isValidReading(baseline) && isValidReading(assisted) && baseline >= assisted;
  const delta = readingsOk ? baseline - assisted : 0;
  const pct = readingsOk ? Math.round(delta / baseline * 100) : 0;
  function adjust(deltaSessions:number) {
    setState(old => {
      const count = Math.max(0, Math.min(99, (Number(old.counts[key]) || 0) + deltaSessions));
      return {...old, counts:{...old.counts, [key]:count}};
    });
  }

  return <section aria-label="Assisted skills and equipment" id="assisted-skills"
    className="overflow-hidden rounded-[22px] border border-border bg-card shadow-sm">
    <button type="button" aria-expanded={open} aria-controls="assisted-skills-content"
      onClick={()=>setOpen(v=>!v)}
      className="flex min-h-[106px] w-full items-center gap-3 p-4 text-left hover:bg-accent/30 sm:gap-4 sm:p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Dumbbell size={23} strokeWidth={1.6}/>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-black uppercase tracking-[0.15em] text-primary">Assisted skill progression</span>
        <span className="mt-1 block text-lg font-black tracking-tight">Bands & Equipment Lab</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          19 drills · 4 skills · band tracking · assistance estimator
        </span>
      </span>
      <ChevronDown className={'shrink-0 text-muted-foreground transition-transform '+(open?'rotate-180':'')} size={19}/>
    </button>

    {open && <div id="assisted-skills-content" className="space-y-5 border-t border-border p-4 sm:p-5">
      <div className="space-y-3 rounded-2xl border border-border bg-background/70 p-3.5 sm:p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary" size={17}/>
          <h3 className="text-sm font-black">Use assistance without losing the skill</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Overhead planche/press setup.</strong> Use a rated anchor directly overhead. Band supports the hips just below the navel, with hands aligned under the anchor.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Lower assistance gradually.</strong> Feet → knees → hips where the exercise setup allows; then move heavy → medium → light → unassisted.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Unassisted check first.</strong> Try a controlled, safe unassisted hold if you can exit reliably. Lean and brace actively even while supported; don't let the band do everything.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Assisted hold dose.</strong> 5–8 × 5–12 sec, about 2 min rest. Consider progressing after 3 × 10–15 sec clean with the current support.
          </p>
        </div>
        <p className="border-t border-border/70 pt-3 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Step loading:</strong> Keep the same assisted setup for 3–4 sessions before a small reduction. Band location and thickness don't guarantee an exact change in load: compare actual assistance. For human flag, require a clean 20-sec hold on both sides before reducing support. Stop or regress for wrist, shoulder or elbow pain.
        </p>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h3 className="text-sm font-black">Choose the skill</h3>
          <span className="text-[11px] text-muted-foreground">Reference drills · not a workout</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Assisted skill category">
          {ASSISTED_SKILLS.map(c=><button type="button" key={c.id} aria-pressed={state.selected===c.id}
            onClick={()=>patch({selected:c.id})}
            className={'min-h-[55px] rounded-xl border px-3 py-2 text-left transition-colors '+
              (state.selected===c.id?'border-amber-500 bg-amber-500/10 shadow-sm':'border-border bg-background hover:bg-accent')}>
            <span className="block text-[12px] font-black">{c.id==='compression'?'Compression':c.id==='flag'?'Human flag':c.title.split(' ')[0]}</span>
            <span className="mt-1 block text-[10px] text-muted-foreground">{c.drills.length} drills</span>
          </button>)}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="border-b border-border bg-accent/30 px-4 py-3.5">
          <h3 className="text-base font-black">{selected.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{selected.short}</p>
          <div className="mt-2 rounded-lg border border-border/80 bg-background/70 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Progression:</strong> {selected.progression}
          </div>
        </div>
        <div className="divide-y divide-border/70">
          {selected.drills.map((drill, i)=><article key={drill.id} className="flex items-start gap-3 px-3.5 py-3.5 sm:px-4">
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-muted-foreground">{String(i+1).padStart(2,'0')}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold">{drill.title}</p>
              <p className="mt-1 text-xs text-muted-foreground"><strong className="font-semibold text-foreground">Tool:</strong> {drill.tool}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground"><strong className="font-semibold text-foreground">Use when:</strong> {drill.when}</p>
              {drill.dose&&<p className="mt-1 text-xs font-bold text-primary">{drill.dose}</p>}
              {drill.note&&<p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{drill.note}</p>}
              {drill.goal&&drill.relatedSlug&&<Link
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-[11px] font-bold text-primary hover:underline"
                to={'/?goal='+encodeURIComponent(drill.goal)+'&node='+encodeURIComponent(drill.relatedSlug)}
                aria-label={'Explore related movement for '+drill.title}>Explore related movement <ArrowRight size={13}/></Link>}
            </div>
          </article>)}
        </div>
      </div>

      {(state.selected==='planche'||state.selected==='flag')&&<div className="rounded-2xl border border-border bg-background/80 p-3.5 sm:p-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={17} className="text-primary"/>
          <h3 className="text-sm font-black">Same-band practice tracker</h3>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Track a specific support position and band for 3–4 sessions. Logging doesn't automatically unlock the next progression.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold">Support point
            <select className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-2.5 text-sm font-bold"
              value={state.point} onChange={event=>patch({point:event.target.value as SupportPoint})}>
              <option value="feet">Feet</option><option value="knees">Knees</option><option value="hips">Hips</option>
            </select>
          </label>
          <label className="text-xs font-semibold">Band strength
            <select className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-2.5 text-sm font-bold"
              value={state.band} onChange={event=>patch({band:event.target.value as BandStrength})}>
              <option value="heavy">Heavy</option><option value="medium">Medium</option><option value="light">Light</option><option value="none">None</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="min-w-0 flex-1"><strong className="block text-sm">{logged} practice session{logged===1?'':'s'}</strong>
            <p className="mt-1 text-xs text-muted-foreground">{logged>=4?'Review hold quality before changing assistance':logged>=3?'You can consider a small reduction if all holds are clean':(3-logged)+' more to reach the minimum consistency check'}</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" aria-label="Undo last logged band session" disabled={!logged} onClick={()=>adjust(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border disabled:opacity-40"><Minus size={17}/></button>
            <button type="button" aria-label="Log one band training session" disabled={logged>=99} onClick={()=>adjust(1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background disabled:opacity-40"><Plus size={18}/></button>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">The same setup keeps its own count on this device. Moving the support changes which count you see.</p>
      </div>}

      <details className="rounded-2xl border border-border bg-background/80 p-3.5 sm:p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black">
          <span className="inline-flex items-center gap-2"><Gauge size={17} className="text-primary"/> Estimate band assistance with a scale</span>
          <ChevronDown size={17} className="shrink-0 text-muted-foreground"/>
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Stand on a bathroom scale. Note your normal reading, then pull the band to approximately the same stretched length as in your supported hold, using a stable overhead anchor. The scale-reading drop approximates upward band force only for this test geometry.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold">Scale without band
            <input type="number" min="1" step="0.5" inputMode="decimal" placeholder="e.g. 200" value={state.baseline}
              onChange={event=>patch({baseline:event.target.value})}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-base font-bold"/>
          </label>
          <label className="block text-xs font-semibold">Scale with band pull
            <input type="number" min="1" step="0.5" inputMode="decimal" placeholder="e.g. 175" value={state.assisted}
              onChange={event=>patch({assisted:event.target.value})}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-base font-bold"/>
          </label>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold">Unit
            <select className="h-10 rounded-lg border border-border bg-card px-2 text-xs" aria-label="Scale unit" value={state.units}
              onChange={event=>patch({units:event.target.value as SupportUnit})}>
              <option value="lb">lb</option><option value="kg">kg</option>
            </select>
          </label>
          <div aria-live="polite" className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estimated assistance</p>
            <p className="text-xl font-black">{readingsOk?delta.toFixed(1)+' '+state.units:'—'} <span className="text-xs text-muted-foreground">{readingsOk?'('+pct+'%)':''}</span></p>
          </div>
        </div>
        {state.baseline && state.assisted && !readingsOk && <p className="mt-2 text-xs text-destructive" role="status">Check both values: they must be positive, and assisted reading should not exceed the baseline.</p>}
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Approximate only: band stretch, direction and body position change assistance. Do not treat this as a calibrated measurement of planche or flag load.</p>
      </details>

      <div className="overflow-hidden rounded-2xl border border-border">
        <button type="button" aria-expanded={showGear} onClick={()=>setShowGear(v=>!v)}
          className="flex min-h-14 w-full items-center gap-2.5 bg-background/70 px-4 text-left">
          <Dumbbell className="text-primary" size={16}/><span className="flex-1 text-sm font-black">Equipment checklist</span>
          <span className="text-[11px] text-muted-foreground">{ASSISTED_GEAR.length} essentials</span>
          <ChevronDown size={16} className={'text-muted-foreground transition-transform '+(showGear?'rotate-180':'')}/>
        </button>
        {showGear && <ul className="space-y-2 border-t border-border p-4">
          {ASSISTED_GEAR.map(gear=><li key={gear} className="flex items-start gap-2 text-xs text-muted-foreground"><Check size={15} className="mt-0.5 shrink-0 text-primary"/>{gear}</li>)}
          <li className="pt-1 text-xs leading-relaxed text-muted-foreground">Firm, non-slip blocks are better under bodyweight than compressible foam. Inspect bands for wear, secure all anchors, and keep the band out of your face.</li>
        </ul>}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">These are training guidelines supplied for your program, not verified clinical cutoffs or automatic skill-test passes. Technique and readiness should determine when to advance.</p>
    </div>}
  </section>;
}
