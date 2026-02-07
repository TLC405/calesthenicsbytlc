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
  {
    name: 'Push',
    icon: ArrowUpFromLine,
    description: 'Push-ups, dips, HSPU',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    name: 'Pull',
    icon: ArrowDownToLine,
    description: 'Pull-ups, rows, muscle-ups',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    name: 'Legs',
    icon: Footprints,
    description: 'Squats, lunges, pistols',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    name: 'Core',
    icon: Target,
    description: 'Planks, L-sits, levers',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    name: 'Skills',
    icon: Sparkles,
    description: 'Handstands, flags, planches',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    name: 'Mobility',
    icon: Wind,
    description: 'Stretches, flows, balance',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export function MasterSkillList() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate('/library', { state: { category } });
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Master Skills
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((cat, index) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className="premium-card p-4 text-left group hover:shadow-lg transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                cat.bgColor
              )}>
                <cat.icon className={cn("w-5 h-5", cat.color)} />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-display font-semibold text-foreground">
              {cat.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {cat.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
