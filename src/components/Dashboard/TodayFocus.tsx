import { Play, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TodayFocusProps {
  hasWorkout: boolean;
  exerciseCount?: number;
  onStartWorkout: () => void;
  onPlanWorkout: () => void;
}

export function TodayFocus({ hasWorkout, exerciseCount = 0, onStartWorkout, onPlanWorkout }: TodayFocusProps) {
  return (
    <div className="premium-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Today's Focus</h3>
        {hasWorkout && (
          <span className="text-xs font-mono px-2 py-1 rounded-full bg-green-500/10 text-green-600">
            Scheduled
          </span>
        )}
      </div>

      {hasWorkout ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {exerciseCount} exercises planned
              </p>
              <p className="text-sm text-muted-foreground">
                Ready to elevate your training
              </p>
            </div>
          </div>
          <Button
            onClick={onStartWorkout}
            className="w-full bg-gradient-to-r from-primary to-primary/80 premium-hover"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-1">No workout scheduled</p>
            <p className="text-xs text-muted-foreground/70">
              Plan your training to stay on track
            </p>
          </div>
          <Button
            onClick={onPlanWorkout}
            variant="outline"
            className="w-full premium-hover"
          >
            <Plus className="w-4 h-4 mr-2" />
            Plan Today's Workout
          </Button>
        </div>
      )}
    </div>
  );
}
