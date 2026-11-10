import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Crosshair, Dumbbell, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PRESS_COMPRESSION_MENU,
  PRESS_FOUNDATION_LADDER,
  HANDSTAND_LADDER,
  PISTOL_LADDER,
  PRESS_SESSIONS,
  PRESS_STEPS,
  resolvedPressExercises,
  type PressSession,
} from '@/data/pressProgram';

interface PressProgramPanelProps {
  onLoad: (session: PressSession, level: number) => void;
  busy?: boolean;
}

export function PressProgramPanel({ onLoad, busy = false }: PressProgramPanelProps) {
  const [day, setDay] = useState<PressSession['key']>('A');
  const [level, setLevel] = useState(2);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const session = PRESS_SESSIONS.find(item => item.key === day) || PRESS_SESSIONS[0];
  const chosen = PRESS_STEPS[level - 1];
  const exercises = resolvedPressExercises(session, level);

  return (
    <section aria-label="Straight-arm pike press training program" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-accent/20 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-primary">
          <Crosshair className="h-3.5 w-3.5" /> Featured skill formula
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">Straight-Arm Press Formula</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Pike press · Handstand · Active compression · Pistol squat
            </p>
          </div>
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 sm:flex">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ['Sessions', '3 + 1 optional'],
            ['Cycle', '8–12+ weeks'],
            ['Main skill', 'Straight-arm press'],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-xl border border-border/70 bg-background/60 px-2.5 py-3">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
              <div className="mt-1 text-[11px] font-semibold leading-tight sm:text-xs">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <p className="mb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Choose your workout</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESS_SESSIONS.map(item => (
              <button type="button" key={item.key} aria-pressed={day === item.key} onClick={() => setDay(item.key)}
                className={'min-h-[52px] rounded-xl border px-2 py-2 text-center transition-colors ' +
                  (day === item.key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background hover:bg-accent')}>
                <span className="block text-sm font-bold">Day {item.key}</span>
                <span className="block text-[9px] leading-tight opacity-75">
                  {item.optional ? 'Optional' : item.key === 'A' ? 'Press' : item.key === 'B' ? 'Balance' : 'Integration'}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{session.title}</p>
              <p className="text-xs text-muted-foreground">{session.subtitle}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />{session.duration}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-3.5">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Your current press level</p>
          <div className="mt-2 flex items-center gap-3">
            <button type="button" aria-label="Previous press level" disabled={level === 1} onClick={() => setLevel(value => Math.max(1, value - 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <div className="text-xs font-bold">Level {level} of {PRESS_STEPS.length}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{chosen.name}</div>
            </div>
            <button type="button" aria-label="Next press level" disabled={level === PRESS_STEPS.length} onClick={() => setLevel(value => Math.min(PRESS_STEPS.length, value + 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{chosen.cue}</p>
        </div>

        <div className="rounded-xl border border-border bg-background/40 px-3.5 py-3">
          <div className="text-[11px] font-semibold">Day {session.key} preview</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(['warmup', 'compression', 'workout', 'cooldown'] as const).map(group => {
              const count = exercises.filter(item => item.section === group).length;
              return count ? (
                <span key={group} className="rounded-lg bg-accent px-2 py-1 text-[10px] capitalize text-muted-foreground">
                  {group === 'warmup' ? 'Prep' : group === 'workout' ? 'Skills + strength' : group} · {count}
                </span>
              ) : null;
            })}
          </div>
          <div className="mt-3 space-y-1.5">
            {exercises.filter(item => item.section === 'workout').slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-start justify-between gap-2 text-[11px]">
                <span>{item.name}</span>
                <span className="shrink-0 text-muted-foreground">{item.sets} × {item.target} {item.unit === 'seconds' ? 's' : 'reps'}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="h-12 w-full rounded-xl text-sm font-semibold" onClick={() => onLoad(session, level)} disabled={busy}>
          {busy ? 'Loading workout…' : 'Load Day ' + session.key + ' into Builder'}
          {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        <button type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen(value => !value)}
          className="flex w-full items-center justify-between gap-2 border-t border-border pt-3 text-left text-xs font-semibold">
          Progression ladders + training rules
          <ChevronDown className={'h-4 w-4 transition-transform ' + (detailsOpen ? 'rotate-180' : '')} />
        </button>
        {detailsOpen && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="mb-1.5 font-semibold">Straight-arm press ladder</h3>
              <ol className="space-y-1.5 pl-4 list-decimal text-muted-foreground">
                {PRESS_STEPS.map(step => <li key={step.name}>{step.name}</li>)}
              </ol>
            </div>
            <div>
              <h3 className="mb-1.5 font-semibold">Foundation / assisted pathway</h3>
              <ol className="space-y-1.5 pl-4 list-decimal text-muted-foreground">
                {PRESS_FOUNDATION_LADDER.map(item => <li key={item}>{item}</li>)}
              </ol>
            </div>
            <div>
              <h3 className="mb-1.5 font-semibold">Handstand mastery ladder</h3>
              <ol className="space-y-1.5 pl-4 list-decimal text-muted-foreground">
                {HANDSTAND_LADDER.map(item => <li key={item}>{item}</li>)}
              </ol>
            </div>
            <div>
              <h3 className="mb-1.5 font-semibold">Pistol squat ladder</h3>
              <ol className="space-y-1.5 pl-4 list-decimal text-muted-foreground">
                {PISTOL_LADDER.map(item => <li key={item}>{item}</li>)}
              </ol>
            </div>
            <div>
              <h3 className="mb-1.5 font-semibold">Compression menu</h3>
              <p className="leading-relaxed text-muted-foreground">{PRESS_COMPRESSION_MENU.join(' · ')}</p>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Train 3 days weekly, with an optional easy fourth day. Rest roughly 2–3 minutes for demanding presses,
              and as needed for balance quality. Progress only when control is repeatable; treat hold targets as coaching
              guidelines, not scientific cutoffs. Reduce volume about 40–50% for a deload when fatigue accumulates,
              often around weeks 4–5. Pain in wrists, elbows, or shoulders is a reason to regress or stop.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
