'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
}

export default function SearchInput({ onSearch }: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative max-w-xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-500" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-xl leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm transition-all"
        placeholder="Search by title or author..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
