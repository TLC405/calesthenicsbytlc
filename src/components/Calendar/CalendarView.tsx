import { useState, useMemo } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay, addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  onDateClick: (date: Date) => void;
  workoutDates: Date[];
}

const dotColors = [
  'bg-[hsl(var(--cat-skills))]', 'bg-[hsl(var(--cat-pull))]', 'bg-[hsl(var(--cat-mobility))]',
  'bg-[hsl(var(--cat-legs))]', 'bg-[hsl(var(--cat-core))]', 'bg-[hsl(var(--cat-push))]', 'bg-[hsl(var(--electric))]',
];

export function CalendarView({ onDateClick, workoutDates }: CalendarViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart.toISOString()]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const hasWorkout = (date: Date) => workoutDates.some(d => isSameDay(d, date));
  const weekWorkoutCount = weekDays.filter(d => hasWorkout(d)).length;
  const monthWorkoutCount = workoutDates.filter(d => isSameMonth(d, currentMonth)).length;

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          {/* Mini streak bars */}
          <div className="flex gap-[3px]">
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className={cn("w-[3px] h-4 rounded-full transition-all", i < weekWorkoutCount ? dotColors[i] : 'bg-border/40')} />
            ))}
          </div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight leading-none">
              {expanded ? format(currentMonth, 'MMMM yyyy') : 'This Week'}
            </h2>
            <p className="text-[8px] text-muted-foreground font-mono mt-0.5 tracking-wide">
              {expanded ? `${monthWorkoutCount} sessions` : `${weekWorkoutCount}/7 days`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {expanded && (
            <>
              <Button variant="ghost" size="icon" onClick={previousMonth} className="h-7 w-7 rounded-lg text-muted-foreground">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 rounded-lg text-muted-foreground">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="h-7 w-7 rounded-lg ml-0.5 text-muted-foreground">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="p-3">
        {!expanded ? (
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((day, idx) => {
              const isTodayDate = isToday(day);
              const hasSession = hasWorkout(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDateClick(day)}
                  className={cn(
                    "flex flex-col items-center py-3 px-1 rounded-xl transition-all duration-150 relative",
                    "hover:bg-accent/50",
                    isTodayDate && "bg-accent border border-border/50"
                  )}
                >
                  <span className="text-[8px] font-mono font-medium text-muted-foreground mb-1.5">{format(day, 'EEE')}</span>
                  <span className={cn("text-lg font-display font-bold leading-none", hasSession ? "text-foreground" : "text-muted-foreground/50")}>
                    {format(day, 'd')}
                  </span>
                  {hasSession && <div className={cn("mt-2 w-1.5 h-1.5 rounded-full", dotColors[idx])} />}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 mb-1">
              {['S','M','T','W','T','F','S'].map((day, i) => (
                <div key={i} className="text-center text-[8px] font-mono font-medium text-muted-foreground/50 py-1.5">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthDays.map(day => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const hasSession = hasWorkout(day);
                const dow = day.getDay();
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDateClick(day)}
                    className={cn(
                      "aspect-square text-xs font-mono font-medium rounded-lg transition-all relative flex flex-col items-center justify-center gap-0.5",
                      "hover:bg-accent/50",
                      !isCurrentMonth && "opacity-15",
                      isCurrentDay && "bg-accent border border-border/50",
                      hasSession && "font-bold"
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasSession && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[dow])} />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
