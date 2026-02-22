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

  const monthWorkoutCount = workoutDates.filter(d => isSameMonth(d, currentMonth)).length;

  return (
    <div className="border-2 border-foreground bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground">
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
            {monthWorkoutCount} session{monthWorkoutCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const hasSession = hasWorkout(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className={cn(
                  "aspect-square text-xs font-mono font-medium transition-all duration-100 relative flex items-center justify-center",
                  "hover:bg-secondary",
                  !isCurrentMonth && "opacity-20",
                  isCurrentDay && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
                  hasSession && "bg-foreground text-background hover:bg-foreground/90 font-bold"
                )}
              >
                {format(day, 'd')}
                {hasSession && (
                  <span className="absolute bottom-0.5 w-1 h-0.5 bg-destructive" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
