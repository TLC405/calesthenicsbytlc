import { useState, useMemo } from 'react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay,
  addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  onDateClick: (date: Date) => void;
  workoutDates: Date[];
}

const dayDotColors = [
  'bg-[hsl(270,76%,55%)]',
  'bg-[hsl(217,91%,60%)]',
  'bg-[hsl(174,72%,40%)]',
  'bg-[hsl(142,71%,45%)]',
  'bg-[hsl(45,93%,47%)]',
  'bg-[hsl(25,95%,53%)]',
  'bg-[hsl(0,84%,60%)]',
];

export function CalendarView({ onDateClick, workoutDates }: CalendarViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), 
    [weekStart.toISOString()]
  );

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
    <div className="rounded-xl bg-card border border-border overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className={cn(
                  "w-1 h-3.5 rounded-full transition-all",
                  i < weekWorkoutCount 
                    ? dayDotColors[i] 
                    : 'bg-muted'
                )} 
              />
            ))}
          </div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight leading-none">
              {expanded ? format(currentMonth, 'MMMM yyyy') : 'This Week'}
            </h2>
            <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
              {expanded ? `${monthWorkoutCount} sessions` : `${weekWorkoutCount}/7 days trained`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {expanded && (
            <>
              <Button variant="ghost" size="icon" onClick={previousMonth} className="h-7 w-7 rounded-lg">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 rounded-lg">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="h-7 w-7 rounded-lg ml-0.5">
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
                    "flex flex-col items-center py-2.5 px-1 rounded-lg transition-all duration-150 relative group",
                    "hover:bg-accent",
                    isTodayDate && "bg-accent ring-1 ring-ring"
                  )}
                >
                  <span className="text-[9px] font-mono font-medium text-muted-foreground mb-1">
                    {format(day, 'EEE')}
                  </span>
                  <span className={cn(
                    "text-lg font-display font-bold leading-none",
                    hasSession ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {hasSession && (
                    <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full", dayDotColors[idx])} />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-[9px] font-mono font-medium text-muted-foreground py-1.5">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthDays.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const hasSession = hasWorkout(day);
                const dayOfWeek = day.getDay();

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDateClick(day)}
                    className={cn(
                      "aspect-square text-xs font-mono font-medium rounded-lg transition-all duration-100 relative flex flex-col items-center justify-center gap-0.5",
                      "hover:bg-accent",
                      !isCurrentMonth && "opacity-20",
                      isCurrentDay && "bg-accent ring-1 ring-ring",
                      hasSession && "font-bold"
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasSession && (
                      <span className={cn("w-1.5 h-1.5 rounded-full", dayDotColors[dayOfWeek])} />
                    )}
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
