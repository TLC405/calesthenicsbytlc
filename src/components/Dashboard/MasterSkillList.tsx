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
  { name: 'Push', icon: ArrowUpFromLine, description: 'Push-ups, dips, HSPU', accent: 'border-l-red-500 hover:bg-red-500/5' },
  { name: 'Pull', icon: ArrowDownToLine, description: 'Pull-ups, rows, muscle-ups', accent: 'border-l-blue-500 hover:bg-blue-500/5' },
  { name: 'Legs', icon: Footprints, description: 'Squats, lunges, pistols', accent: 'border-l-green-500 hover:bg-green-500/5' },
  { name: 'Core', icon: Target, description: 'Planks, L-sits, levers', accent: 'border-l-orange-500 hover:bg-orange-500/5' },
  { name: 'Skills', icon: Sparkles, description: 'Handstands, flags, planches', accent: 'border-l-purple-500 hover:bg-purple-500/5' },
  { name: 'Mobility', icon: Wind, description: 'Stretches, flows, balance', accent: 'border-l-teal-500 hover:bg-teal-500/5' },
];

export function MasterSkillList() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate('/library', { state: { category } });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => handleCategoryClick(cat.name)}
          className={cn(
            "group flex flex-col justify-between p-3 border-2 border-foreground bg-card text-left transition-all duration-150 border-l-[4px]",
            cat.accent
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <cat.icon className="w-4 h-4 text-foreground" />
            <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-foreground">
              {cat.name}
            </h3>
            <p className="text-[9px] text-muted-foreground font-mono mt-0.5 leading-snug">
              {cat.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
