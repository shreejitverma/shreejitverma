'use client';

import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// A compact numbered window: 1 ... p-1 p p+1 ... N (ellipses collapse ranges).
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const ordered = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  let previous = 0;
  for (const p of ordered) {
    if (previous && p - previous > 1) result.push('gap');
    result.push(p);
    previous = p;
  }
  return result;
}

const Pagination = memo(({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;
  const buttonBase =
    'min-w-[2.5rem] px-3 py-2 rounded-lg border text-sm font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <nav className='flex flex-wrap justify-center items-center gap-2 mt-16' aria-label='Book pages'>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label='Previous page'
        className={`${buttonBase} bg-card/50 dark:bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex items-center gap-1`}
      >
        <ChevronLeft className='w-4 h-4' />
        <span className='hidden sm:inline'>Previous</span>
      </button>

      {pageWindow(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className='px-1 text-muted-foreground/60 select-none' aria-hidden='true'>
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${buttonBase} ${
              item === page
                ? 'bg-primary text-slate-950 border-primary shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-card/50 dark:bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label='Next page'
        className={`${buttonBase} bg-card/50 dark:bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex items-center gap-1`}
      >
        <span className='hidden sm:inline'>Next</span>
        <ChevronRight className='w-4 h-4' />
      </button>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
