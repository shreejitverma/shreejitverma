import type { ReactNode } from 'react';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';

// Shell for the consent and claim pages: a single centered card.
export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className='relative z-10 max-w-xl mx-auto px-6 pt-32 pb-20 text-muted-foreground'>
        <div className='rounded-2xl bg-card/40 dark:bg-card border border-border p-6 md:p-8'>
          <h1 className='text-2xl md:text-3xl font-bold text-foreground mb-4'>{title}</h1>
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const fieldClass = 'w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60';
export const labelClass = 'block text-sm font-medium text-foreground';
export const primaryButton = 'px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90 transition-opacity';
export const secondaryButton = 'px-5 py-2.5 border border-border text-foreground font-semibold rounded hover:border-primary/50 transition-colors';
