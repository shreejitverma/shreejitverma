'use client';

import { memo } from 'react';
import { ChevronRight } from 'lucide-react';

export interface CategoryOption {
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryOption[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter = memo(({ categories, activeCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className='flex flex-wrap gap-3 mb-12' role='group' aria-label='Filter books by category'>
      {categories.map(({ name, count }) => {
        const isActive = activeCategory === name;
        return (
          <button
            key={name}
            onClick={() => onSelectCategory(name)}
            aria-pressed={isActive}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
              isActive
                ? 'bg-primary text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-card/50 dark:bg-card text-muted-foreground dark:text-muted-foreground border border-border hover:border-cyan-500/40 hover:text-primary'
            }`}
          >
            {isActive && <ChevronRight className='w-3 h-3' />}
            {name}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-muted text-muted-foreground'
              }`}
            >
              {count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;
