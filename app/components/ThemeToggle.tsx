'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useHydrated } from './useHydrated';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client; render a placeholder until then.
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-card/50">
        <div className="w-5 h-5" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-card/50 hover:border-primary/50 hover:bg-muted transition-all text-muted-foreground hover:text-primary"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
