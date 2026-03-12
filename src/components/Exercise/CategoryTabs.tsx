import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  counts?: Record<string, number>;
}

// Group raw categories into simplified groups
const CATEGORY_GROUPS: Record<string, string[]> = {
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

  // Determine which group the active category belongs to
  const activeGroup = activeCategory
    ? Object.entries(CATEGORY_GROUPS).find(([_, cats]) => cats.includes(activeCategory))?.[0] || null
    : null;

  // Check if activeCategory is a group name (for group-level filtering)
  const isGroupActive = (group: string) => {
    if (!activeCategory) return false;
    return CATEGORY_GROUPS[group]?.includes(activeCategory) || activeCategory === group;
  };

  const handleGroupClick = (group: string) => {
    const cats = CATEGORY_GROUPS[group];
    // If clicking the already-active group, cycle through sub-categories then clear
    if (isGroupActive(group)) {
      if (cats.length > 1) {
        const currentIdx = cats.indexOf(activeCategory || '');
        if (currentIdx >= 0 && currentIdx < cats.length - 1) {
          onCategoryChange(cats[currentIdx + 1]);
        } else {
          onCategoryChange(null);
        }
      } else {
        onCategoryChange(null);
      }
    } else {
      // Set to first sub-category of this group
      onCategoryChange(cats[0]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        data-active={activeCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          "px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] transition-all duration-100 rounded-xl border",
          "border-border/40 bg-card text-muted-foreground hover:text-foreground hover:border-border",
          "data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:border-foreground"
        )}
      >
        All{totalCount !== null && <span className="ml-1 opacity-50">{totalCount}</span>}
      </button>
      {Object.keys(CATEGORY_GROUPS).map((group) => {
        const active = isGroupActive(group);
        const subLabel = active && activeCategory ? activeCategory : '';
        return (
          <button
            key={group}
            data-active={active}
            onClick={() => handleGroupClick(group)}
            className={cn(
              "px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] transition-all duration-100 rounded-xl border",
              "border-border/40 bg-card text-muted-foreground hover:text-foreground hover:border-border",
              groupColors[group] || "data-[active=true]:bg-foreground data-[active=true]:text-background"
            )}
          >
            {active && subLabel !== group ? subLabel : group}
            {groupCounts[group] > 0 && <span className="ml-1 opacity-50">{groupCounts[group]}</span>}
          </button>
        );
      })}
    </div>
  );
}
