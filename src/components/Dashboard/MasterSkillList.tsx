import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ArrowUpFromLine, 
  ArrowDownToLine, 
  Footprints, 
  Target, 
  Sparkles, 
  Wind,
  ArrowRight,
  Flower2,
  StretchHorizontal,
} from 'lucide-react';

const categories = [
  { name: 'Push', icon: ArrowUpFromLine, description: 'Push-ups, dips, HSPU', color: 'hsl(0, 84%, 60%)' },
  { name: 'Pull', icon: ArrowDownToLine, description: 'Pull-ups, rows, muscle-ups', color: 'hsl(217, 91%, 60%)' },
  { name: 'Legs', icon: Footprints, description: 'Squats, lunges, pistols', color: 'hsl(142, 71%, 45%)' },
  { name: 'Core', icon: Target, description: 'Planks, L-sits, levers', color: 'hsl(25, 95%, 53%)' },
  { name: 'Skills', icon: Sparkles, description: 'Handstands, flags, planches', color: 'hsl(270, 76%, 55%)' },
  { name: 'Yoga', icon: Flower2, description: 'Poses, flows, balance', color: 'hsl(330, 65%, 55%)' },
  { name: 'Mobility', icon: Wind, description: 'Dynamic drills, joint work', color: 'hsl(174, 72%, 40%)' },
  { name: 'Flexibility', icon: StretchHorizontal, description: 'Splits, stretches, ROM', color: 'hsl(40, 96%, 50%)' },
  { name: 'Rings', icon: Target, description: 'Supports, dips, muscle-ups', color: 'hsl(40, 70%, 40%)' },
];

export function MasterSkillList() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate('/library', { state: { category } });
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:shadow-sm hover:border-border/60 transition-all duration-200 text-center relative overflow-hidden"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: cat.color }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-foreground leading-none">
                {cat.name}
              </h3>
              <p className="text-[8px] text-muted-foreground font-mono mt-0.5 leading-snug hidden sm:block">
                {cat.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
