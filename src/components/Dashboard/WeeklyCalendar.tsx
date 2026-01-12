import { useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface WeeklyCalendarProps {
  workoutDates: Date[];
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
}

export function WeeklyCalendar({ workoutDates, onDateClick, selectedDate }: WeeklyCalendarProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  const hasWorkout = (date: Date) => {
    return workoutDates.some(d => isSameDay(d, date));
  };

  return (
    <div className="premium-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">This Week</h3>
        <span className="text-xs font-mono text-muted-foreground">
          {format(new Date(), 'MMMM yyyy')}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasWorkoutToday = hasWorkout(day);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl transition-all duration-200",
                "hover:bg-primary/10 hover:scale-105",
                isSelected && "bg-primary text-primary-foreground shadow-lg",
                isTodayDate && !isSelected && "ring-2 ring-gold ring-offset-2 ring-offset-background"
              )}
            >
              <span className={cn(
                "text-xs font-medium mb-1",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {format(day, 'EEE')}
              </span>
              <span className={cn(
                "text-lg font-mono font-semibold",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(day, 'd')}
              </span>
              {hasWorkoutToday && (
                <Flame className={cn(
                  "w-3 h-3 mt-1",
                  isSelected ? "text-gold-light" : "text-gold"
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
