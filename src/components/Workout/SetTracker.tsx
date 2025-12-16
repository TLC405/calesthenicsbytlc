import { useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface SetData {
  reps: number;
  weight?: number;
  rpe?: number;
}

interface SetTrackerProps {
  sets: SetData[];
  onChange: (sets: SetData[]) => void;
  showWeight?: boolean;
}

export function SetTracker({ sets, onChange, showWeight = false }: SetTrackerProps) {
  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    onChange([...sets, lastSet ? { ...lastSet } : { reps: 10 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      onChange(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: keyof SetData, value: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    onChange(newSets);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
        <span className="w-8 text-center">Set</span>
        <span className="flex-1 text-center">Reps</span>
        {showWeight && <span className="flex-1 text-center">Weight</span>}
        <span className="w-8"></span>
      </div>
      
      {sets.map((set, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
            {index + 1}
          </span>
          
          <div className="flex-1 flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => updateSet(index, 'reps', Math.max(1, set.reps - 1))}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              value={set.reps}
              onChange={(e) => updateSet(index, 'reps', parseInt(e.target.value) || 0)}
              className="h-8 w-14 text-center neumorph-inset"
              min={1}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => updateSet(index, 'reps', set.reps + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {showWeight && (
            <div className="flex-1 flex items-center gap-1">
              <Input
                type="number"
                value={set.weight || ''}
                onChange={(e) => updateSet(index, 'weight', parseInt(e.target.value) || 0)}
                className="h-8 w-16 text-center neumorph-inset"
                placeholder="kg"
              />
            </div>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeSet(index)}
            disabled={sets.length <= 1}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2 neumorph-flat"
        onClick={addSet}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Set
      </Button>
    </div>
  );
}
