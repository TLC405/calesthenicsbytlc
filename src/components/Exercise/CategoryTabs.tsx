import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  counts?: Record<string, number>;
}

const categoryAccent: Record<string, string> = {
  'Push': 'data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:border-red-500',
  'Pull': 'data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:border-blue-500',
  'Legs': 'data-[active=true]:bg-green-500 data-[active=true]:text-white data-[active=true]:border-green-500',
  'Core': 'data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:border-orange-500',
  'Skills': 'data-[active=true]:bg-purple-500 data-[active=true]:text-white data-[active=true]:border-purple-500',
  'Yoga': 'data-[active=true]:bg-pink-500 data-[active=true]:text-white data-[active=true]:border-pink-500',
  'Mobility': 'data-[active=true]:bg-teal-500 data-[active=true]:text-white data-[active=true]:border-teal-500',
  'Flexibility': 'data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500',
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange, counts }: CategoryTabsProps) {
  const totalCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        data-active={activeCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          "px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] transition-all duration-100 border-2",
          "border-foreground/20 bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40",
          "data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:border-foreground"
        )}
      >
        All{totalCount !== null && <span className="ml-1 opacity-50">{totalCount}</span>}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          data-active={activeCategory === category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] transition-all duration-100 border-2",
            "border-foreground/20 bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40",
            categoryAccent[category] || "data-[active=true]:bg-foreground data-[active=true]:text-background"
          )}
        >
          {category}
          {counts && counts[category] !== undefined && (
            <span className="ml-1 opacity-50">{counts[category]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
