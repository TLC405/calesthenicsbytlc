import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ArrowUpFromLine, ArrowDownToLine, Footprints, Target,
  Sparkles, Wind, Flower2, StretchHorizontal,
} from 'lucide-react';

const categories = [
  { name: 'Push', icon: ArrowUpFromLine, desc: 'Push-ups, dips, HSPU', color: 'hsl(var(--cat-push))' },
  { name: 'Pull', icon: ArrowDownToLine, desc: 'Pull-ups, rows', color: 'hsl(var(--cat-pull))' },
  { name: 'Legs', icon: Footprints, desc: 'Squats, pistols', color: 'hsl(var(--cat-legs))' },
  { name: 'Core', icon: Target, desc: 'Planks, L-sits', color: 'hsl(var(--cat-core))' },
  { name: 'Skills', icon: Sparkles, desc: 'Handstands, flags', color: 'hsl(var(--cat-skills))' },
  { name: 'Yoga', icon: Flower2, desc: 'Poses, flows', color: 'hsl(330, 65%, 55%)' },
  { name: 'Mobility', icon: Wind, desc: 'Dynamic drills', color: 'hsl(var(--cat-mobility))' },
  { name: 'Flexibility', icon: StretchHorizontal, desc: 'Splits, ROM', color: 'hsl(40, 96%, 50%)' },
  { name: 'Rings', icon: Target, desc: 'Ring supports', color: 'hsl(40, 70%, 40%)' },
];

export function MasterSkillList() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.name}
            onClick={() => navigate('/library', { state: { category: cat.name } })}
            className="group flex flex-col items-center gap-2.5 p-3.5 rounded-2xl bg-card border border-border/40 hover:border-border transition-all duration-200 text-center relative overflow-hidden"
          >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-2 right-2 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 border border-border/30"
              style={{ backgroundColor: `${cat.color}15` }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: cat.color }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-foreground leading-none">
                {cat.name}
              </h3>
              <p className="text-[7px] text-muted-foreground font-mono mt-1 leading-snug hidden sm:block">
                {cat.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
