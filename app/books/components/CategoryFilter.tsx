'use client';

import { memo } from 'react';
import { ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter = memo(({ categories, activeCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className='flex flex-wrap gap-3 mb-12'>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeCategory === cat 
              ? 'bg-primary text-slate-950 shadow-lg shadow-cyan-500/20' 
              : 'bg-card/50 dark:bg-card text-muted-foreground dark:text-muted-foreground border border-border hover:border-cyan-500/40 hover:text-primary'
          }`}
        >
          {activeCategory === cat && <ChevronRight className="w-3 h-3" />}
          {cat}
        </button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;
