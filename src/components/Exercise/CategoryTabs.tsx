import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  counts?: Record<string, number>;
}

// Group raw categories into simplified groups
export const CATEGORY_GROUPS: Record<string, string[]> = {
  'Strength': ['Push', 'Pull', 'Rings'],
  'Lower Body': ['Legs', 'Core'],
  'Skills': ['Skills', 'Yoga'],
  'Recovery': ['Mobility', 'Flexibility'],
};

const groupColors: Record<string, string> = {
  'Strength': 'data-[active=true]:bg-[hsl(var(--cat-push))] data-[active=true]:text-white data-[active=true]:border-[hsl(var(--cat-push))]',
  'Lower Body': 'data-[active=true]:bg-[hsl(var(--cat-legs))] data-[active=true]:text-white data-[active=true]:border-[hsl(var(--cat-legs))]',
  'Skills': 'data-[active=true]:bg-[hsl(var(--cat-skills))] data-[active=true]:text-white data-[active=true]:border-[hsl(var(--cat-skills))]',
  'Recovery': 'data-[active=true]:bg-[hsl(var(--cat-mobility))] data-[active=true]:text-white data-[active=true]:border-[hsl(var(--cat-mobility))]',
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange, counts }: CategoryTabsProps) {
  const totalCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  // Build group counts from raw category counts
  const groupCounts: Record<string, number> = {};
  for (const [group, cats] of Object.entries(CATEGORY_GROUPS)) {
    groupCounts[group] = cats.reduce((sum, c) => sum + (counts?.[c] || 0), 0);
  }

  const visibleGroups = Object.keys(CATEGORY_GROUPS).filter(group => CATEGORY_GROUPS[group].some(cat => categories.includes(cat)));

  // Check if activeCategory is a group name (for group-level filtering)
  const isGroupActive = (group: string) => {
    return activeCategory === group || CATEGORY_GROUPS[group]?.includes(activeCategory || '') || false;
  };

  const handleGroupClick = (group: string) => {
    onCategoryChange(activeCategory === group ? null : group);
  };

  return (
    <div className="power-category-track flex w-full max-w-full min-w-0 gap-2 overflow-x-auto whitespace-nowrap pb-2 overscroll-x-contain" aria-label="Exercise categories">
      <button
        type="button" aria-pressed={activeCategory === null} data-active={activeCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          "min-h-11 shrink-0 px-3 py-2 text-[11px] font-sans font-bold tracking-wide transition-colors duration-100 rounded-xl border",
          "border-border/40 bg-card text-muted-foreground hover:text-foreground hover:border-border",
          "data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:border-foreground"
        )}
      >
        All{totalCount !== null && <span className="ml-1 opacity-50">{totalCount}</span>}
      </button>
      {visibleGroups.map((group) => {
        const active = isGroupActive(group);
        return (
          <button
            key={group}
            type="button" aria-pressed={active} data-active={active}
            onClick={() => handleGroupClick(group)}
            className={cn(
              "min-h-11 shrink-0 px-3 py-2 text-[11px] font-sans font-bold tracking-wide transition-colors duration-100 rounded-xl border",
              "border-border/40 bg-card text-muted-foreground hover:text-foreground hover:border-border",
              groupColors[group] || "data-[active=true]:bg-foreground data-[active=true]:text-background"
            )}
          >
            {group}
            {groupCounts[group] > 0 && <span className="ml-1 opacity-50">{groupCounts[group]}</span>}
          </button>
        );
      })}
    </div>
  );
}
