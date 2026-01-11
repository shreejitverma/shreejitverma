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
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
              : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-400'
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
