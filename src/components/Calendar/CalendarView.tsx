import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  onDateClick: (date: Date) => void;
  workoutDates: Date[];
}

export function CalendarView({ onDateClick, workoutDates }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const hasWorkout = (date: Date) =>
    workoutDates.some(d => isSameDay(d, date));

  // Count workouts this month
  const monthWorkoutCount = workoutDates.filter(d => isSameMonth(d, currentMonth)).length;

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {monthWorkoutCount} session{monthWorkoutCount !== 1 ? 's' : ''} logged
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const hasSession = hasWorkout(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className={cn(
                  "aspect-square rounded-lg text-sm font-medium transition-all duration-150 relative flex flex-col items-center justify-center",
                  "hover:bg-secondary",
                  !isCurrentMonth && "opacity-25",
                  isCurrentDay && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
                  hasSession && "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                <span className={cn(
                  "text-sm",
                  isCurrentDay && !hasSession && "font-bold"
                )}>
                  {format(day, 'd')}
                </span>
                {hasSession && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gold" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
