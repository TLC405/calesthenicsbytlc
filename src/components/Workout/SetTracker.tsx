import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface SetData {
  reps: number;
  weight?: number;
  seconds?: number;
  rpe?: number;
}

interface SetTrackerProps {
  sets: SetData[];
  onChange: (sets: SetData[]) => void;
  showWeight?: boolean;
  unit?: 'reps' | 'seconds';
}

export function SetTracker({ sets, onChange, showWeight = false, unit = 'reps' }: SetTrackerProps) {
  const field: 'reps' | 'seconds' = unit === 'seconds' ? 'seconds' : 'reps';
  const step = unit === 'seconds' ? 5 : 1;
  const updateSet = (index: number, fieldName: keyof SetData, value: number) => {
    onChange(sets.map((set, i) => i === index ? { ...set, [fieldName]: value } : set));
  };
  const addSet = () => {
    const previous = sets[sets.length - 1];
    onChange([...sets, previous ? { ...previous } : (unit === 'seconds' ? { reps: 0, seconds: 15 } : { reps: 8 })]);
  };

  return <div className="space-y-2">
    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
      <span className="w-8 text-center">Set</span>
      <span className="flex-1 text-center">{unit === 'seconds' ? 'Hold (sec)' : 'Reps'}</span>
      {showWeight && <span className="flex-1 text-center">Weight</span>}
      <span className="w-11"/>
    </div>
    {sets.map((set, index) => {
      const value = set[field] ?? (unit === 'seconds' ? 15 : 8);
      return <div key={index} className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-secondary text-foreground flex items-center justify-center text-sm font-semibold tabular-nums">
          {index + 1}
        </span>
        <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-lg"
            aria-label={'Decrease ' + (unit === 'seconds' ? 'seconds' : 'reps')}
            onClick={() => updateSet(index, field, Math.max(unit === 'seconds' ? 5 : 1, value - step))}>
            <Minus className="w-4 h-4"/>
          </Button>
          <Input type="number" inputMode="numeric" min={unit === 'seconds' ? 5 : 1}
            value={value} aria-label={'Set ' + (index + 1) + ' ' + unit}
            onChange={e => updateSet(index, field, Math.max(0, Number(e.target.value) || 0))}
            className="h-10 min-w-0 w-16 text-center rounded-lg"/>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-lg"
            aria-label={'Increase ' + (unit === 'seconds' ? 'seconds' : 'reps')}
            onClick={() => updateSet(index, field, value + step)}>
            <Plus className="w-4 h-4"/>
          </Button>
        </div>
        {showWeight && <Input type="number" inputMode="decimal" value={set.weight ?? ''}
          aria-label={'Set ' + (index + 1) + ' external weight'}
          onChange={e => updateSet(index, 'weight', Number(e.target.value) || 0)}
          className="h-10 w-20 flex-1 text-center rounded-lg" placeholder="Weight"/>}
        <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-muted-foreground"
          aria-label={'Remove set ' + (index + 1)} onClick={() => { if (sets.length > 1) onChange(sets.filter((_, i) => i !== index)); }}
          disabled={sets.length <= 1}><Trash2 className="w-4 h-4"/></Button>
      </div>;
    })}
    <Button variant="outline" size="sm" className="w-full min-h-11 mt-2 rounded-xl" onClick={addSet}>
      <Plus className="w-4 h-4 mr-1"/> Add Set
    </Button>
  </div>;
}
