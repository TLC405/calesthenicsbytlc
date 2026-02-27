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

const dayColors = [
  'bg-[hsl(270,76%,55%)]', // Sun - purple
  'bg-[hsl(217,91%,60%)]', // Mon - blue
  'bg-[hsl(174,72%,40%)]', // Tue - teal
  'bg-[hsl(142,71%,45%)]', // Wed - green
  'bg-[hsl(45,93%,47%)]',  // Thu - gold
  'bg-[hsl(25,95%,53%)]',  // Fri - orange
  'bg-[hsl(0,84%,60%)]',   // Sat - red
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
    <div className="border-2 border-foreground bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground">
        <div className="flex items-center gap-3">
          {/* Colored week indicator dots */}
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-4 transition-all",
                  i < weekWorkoutCount 
                    ? dayColors[i] 
                    : 'bg-foreground/10'
                )} 
              />
            ))}
          </div>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wider leading-none">
              {expanded ? format(currentMonth, 'MMMM yyyy') : 'This Week'}
            </h2>
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
              {expanded ? `${monthWorkoutCount} sessions` : `${weekWorkoutCount}/7 days trained`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {expanded && (
            <>
              <Button variant="ghost" size="icon" onClick={previousMonth} className="h-7 w-7">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setExpanded(!expanded)} 
            className="h-7 w-7 ml-1"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="p-3">
        {!expanded ? (
          /* WEEK VIEW */
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((day, idx) => {
              const isTodayDate = isToday(day);
              const hasSession = hasWorkout(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDateClick(day)}
                  className={cn(
                    "flex flex-col items-center py-2.5 px-1 transition-all duration-150 relative group",
                    "hover:bg-secondary",
                    isTodayDate && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                  )}
                >
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    {format(day, 'EEE')}
                  </span>
                  <span className={cn(
                    "text-lg font-display font-bold leading-none",
                    hasSession ? "text-foreground" : "text-foreground/60"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {hasSession ? (
                    <div className={cn("mt-1.5 w-full h-1", dayColors[idx])} />
                  ) : (
                    <div className="mt-1.5 w-full h-1 bg-foreground/5" />
                  )}
                  {hasSession && (
                    <Flame className="w-3 h-3 mt-1 text-[hsl(25,95%,53%)]" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* MONTH VIEW */
          <>
            <div className="grid grid-cols-7 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider py-1.5">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const hasSession = hasWorkout(day);
                const dayOfWeek = day.getDay();

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDateClick(day)}
                    className={cn(
                      "aspect-square text-xs font-mono font-medium transition-all duration-100 relative flex flex-col items-center justify-center gap-0.5",
                      "hover:bg-secondary",
                      !isCurrentMonth && "opacity-20",
                      isCurrentDay && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
                      hasSession && "font-bold"
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasSession && (
                      <span className={cn("w-full h-[3px]", dayColors[dayOfWeek])} />
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
