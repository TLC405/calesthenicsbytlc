import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  counts?: Record<string, number>;
}

const categoryStyles: Record<string, string> = {
  'All': 'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg',
  'Push': 'data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:shadow-lg',
  'Pull': 'data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:shadow-lg',
  'Legs': 'data-[active=true]:bg-green-500 data-[active=true]:text-white data-[active=true]:shadow-lg',
  'Core': 'data-[active=true]:bg-yellow-500 data-[active=true]:text-black data-[active=true]:shadow-lg',
  'Skills': 'data-[active=true]:bg-purple-500 data-[active=true]:text-white data-[active=true]:shadow-lg',
  'Mobility': 'data-[active=true]:bg-teal-500 data-[active=true]:text-white data-[active=true]:shadow-lg',
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange, counts }: CategoryTabsProps) {
  const totalCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        data-active={activeCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          "bg-card hover:bg-muted hover:shadow-md",
          "flex items-center gap-2",
          categoryStyles['All']
        )}
      >
        All
        {totalCount !== null && (
          <span className="text-xs opacity-70 font-mono">{totalCount}</span>
        )}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          data-active={activeCategory === category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "bg-card hover:bg-muted hover:shadow-md",
            "flex items-center gap-2",
            categoryStyles[category] || categoryStyles['All']
          )}
        >
          {category}
          {counts && counts[category] !== undefined && (
            <span className="text-xs opacity-70 font-mono">{counts[category]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
