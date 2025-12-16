import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categoryStyles: Record<string, string> = {
  'All': 'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
  'Push': 'data-[active=true]:bg-red-500 data-[active=true]:text-white',
  'Pull': 'data-[active=true]:bg-blue-500 data-[active=true]:text-white',
  'Legs': 'data-[active=true]:bg-green-500 data-[active=true]:text-white',
  'Core': 'data-[active=true]:bg-yellow-500 data-[active=true]:text-black',
  'Skills': 'data-[active=true]:bg-purple-500 data-[active=true]:text-white',
  'Mobility': 'data-[active=true]:bg-teal-500 data-[active=true]:text-white',
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        data-active={activeCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all",
          "neumorph-flat hover:shadow-md",
          categoryStyles['All']
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          data-active={activeCategory === category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            "neumorph-flat hover:shadow-md",
            categoryStyles[category] || categoryStyles['All']
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
