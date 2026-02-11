import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ArrowUpFromLine, 
  ArrowDownToLine, 
  Footprints, 
  Target, 
  Sparkles, 
  Wind,
  ArrowRight
} from 'lucide-react';

const categories = [
  { name: 'Push', icon: ArrowUpFromLine, description: 'Push-ups, dips, HSPU', accent: 'border-red-500/30 hover:border-red-500/60', iconColor: 'text-red-500' },
  { name: 'Pull', icon: ArrowDownToLine, description: 'Pull-ups, rows, muscle-ups', accent: 'border-blue-500/30 hover:border-blue-500/60', iconColor: 'text-blue-500' },
  { name: 'Legs', icon: Footprints, description: 'Squats, lunges, pistols', accent: 'border-green-500/30 hover:border-green-500/60', iconColor: 'text-green-500' },
  { name: 'Core', icon: Target, description: 'Planks, L-sits, levers', accent: 'border-orange-500/30 hover:border-orange-500/60', iconColor: 'text-orange-500' },
  { name: 'Skills', icon: Sparkles, description: 'Handstands, flags, planches', accent: 'border-gold/30 hover:border-gold/60', iconColor: 'text-gold' },
  { name: 'Mobility', icon: Wind, description: 'Stretches, flows, balance', accent: 'border-purple-500/30 hover:border-purple-500/60', iconColor: 'text-purple-500' },
];

export function MasterSkillList() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate('/library', { state: { category } });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => handleCategoryClick(cat.name)}
          className={cn(
            "group flex flex-col justify-between p-4 rounded-xl border bg-card text-left transition-all duration-200",
            cat.accent
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <cat.icon className={cn("w-5 h-5", cat.iconColor)} />
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground">
              {cat.name}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {cat.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
