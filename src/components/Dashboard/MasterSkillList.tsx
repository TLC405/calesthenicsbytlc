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
  StretchHorizontal
} from 'lucide-react';

const categories = [
  { name: 'Push', icon: ArrowUpFromLine, description: 'Push-ups, dips, HSPU', color: 'bg-[hsl(0,84%,60%)]', hoverBg: 'hover:bg-[hsl(0,84%,60%)]/10' },
  { name: 'Pull', icon: ArrowDownToLine, description: 'Pull-ups, rows, muscle-ups', color: 'bg-[hsl(217,91%,60%)]', hoverBg: 'hover:bg-[hsl(217,91%,60%)]/10' },
  { name: 'Legs', icon: Footprints, description: 'Squats, lunges, pistols', color: 'bg-[hsl(142,71%,45%)]', hoverBg: 'hover:bg-[hsl(142,71%,45%)]/10' },
  { name: 'Core', icon: Target, description: 'Planks, L-sits, levers', color: 'bg-[hsl(25,95%,53%)]', hoverBg: 'hover:bg-[hsl(25,95%,53%)]/10' },
  { name: 'Skills', icon: Sparkles, description: 'Handstands, flags, planches', color: 'bg-[hsl(270,76%,55%)]', hoverBg: 'hover:bg-[hsl(270,76%,55%)]/10' },
  { name: 'Yoga', icon: Flower2, description: 'Poses, flows, balance', color: 'bg-[hsl(330,65%,55%)]', hoverBg: 'hover:bg-[hsl(330,65%,55%)]/10' },
  { name: 'Mobility', icon: Wind, description: 'Dynamic drills, joint work', color: 'bg-[hsl(174,72%,40%)]', hoverBg: 'hover:bg-[hsl(174,72%,40%)]/10' },
  { name: 'Flexibility', icon: StretchHorizontal, description: 'Splits, stretches, ROM', color: 'bg-[hsl(40,96%,50%)]', hoverBg: 'hover:bg-[hsl(40,96%,50%)]/10' },
  { name: 'Rings', icon: Target, description: 'Supports, dips, muscle-ups', color: 'bg-[hsl(40,70%,40%)]', hoverBg: 'hover:bg-[hsl(40,70%,40%)]/10' },
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
            "group flex flex-col justify-between p-3 border-2 border-foreground bg-card text-left transition-all duration-150 relative overflow-hidden",
            cat.hoverBg
          )}
        >
          {/* Color bar top */}
          <div className={cn("absolute top-0 left-0 w-full h-1", cat.color)} />
          
          <div className="flex items-start justify-between mb-2 mt-1">
            <div className={cn("w-7 h-7 flex items-center justify-center", cat.color)}>
              <cat.icon className="w-3.5 h-3.5 text-white" />
            </div>
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
