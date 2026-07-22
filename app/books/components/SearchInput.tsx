'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
}

export default function SearchInput({ onSearch }: SearchInputProps) {
  const [value, setValue] = useState('');
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Never notify for the initial mount value: the parent already has it, and
    // a delayed timer firing after user interaction would clobber newer state
    // (e.g. reset pagination the user just changed).
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative max-w-xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card/50 dark:bg-card text-muted-foreground placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-background dark:focus:bg-slate-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm transition-all"
        placeholder="Search by title or author..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
