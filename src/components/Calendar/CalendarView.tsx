import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/neumorph.css';

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

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const hasWorkout = (date: Date) => {
    return workoutDates.some(d => 
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="neumorph p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="neumorph-flat neumorph-hover"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="neumorph-flat neumorph-hover"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const hasSession = hasWorkout(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`
                neumorph-flat neumorph-hover aspect-square p-2 text-sm
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isCurrentDay ? 'ring-2 ring-primary' : ''}
                ${hasSession ? 'bg-primary/10' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className={isCurrentDay ? 'font-bold text-primary' : ''}>
                  {format(day, 'd')}
                </span>
                {hasSession && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
