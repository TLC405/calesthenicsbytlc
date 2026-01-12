import { Flame, Target, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  streak: number;
  totalXp: number;
  level: number;
  workoutsThisWeek: number;
}

export function QuickStats({ streak, totalXp, level, workoutsThisWeek }: QuickStatsProps) {
  const stats = [
    {
      icon: Flame,
      label: 'Streak',
      value: streak,
      unit: 'days',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Zap,
      label: 'XP',
      value: totalXp,
      unit: '',
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      icon: Trophy,
      label: 'Level',
      value: level,
      unit: '',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Target,
      label: 'This Week',
      value: workoutsThisWeek,
      unit: 'workouts',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="premium-card p-4 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
            stat.bgColor
          )}>
            <stat.icon className={cn("w-5 h-5", stat.color)} />
          </div>
          <div className="font-mono text-2xl font-bold text-foreground">
            {stat.value.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {stat.label} {stat.unit && <span className="opacity-60">{stat.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
