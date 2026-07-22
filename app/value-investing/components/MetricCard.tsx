'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  label: string;
  trend: string;
  icon: ReactNode;
  color: 'cyan' | 'blue' | 'indigo' | 'emerald';
}

export default function MetricCard({ title, value, label, trend, icon, color }: MetricCardProps) {
  const isPositive = trend.startsWith('+');

  const colorClasses = {
    cyan: 'bg-primary/10 border-cyan-500/20 text-cyan-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
  };

  return (
    <div className='bg-background dark:bg-card/50 border border-border p-6 rounded-2xl hover:border-primary/30 transition-all group'>
      <div className='flex items-center justify-between mb-4'>
        <div className={clsx('p-2 rounded-lg border', colorClasses[color])}>
          {icon}
        </div>
        <div className={clsx(
          'flex items-center gap-1 text-xs font-mono font-bold',
          isPositive ? 'text-emerald-500' : 'text-rose-500'
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <h3 className='text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider'>{title}</h3>
        <div className='flex items-baseline gap-2'>
          <span className='text-2xl font-bold text-foreground'>{value}</span>
          <span className='text-xs text-muted-foreground font-medium'>{label}</span>
        </div>
      </div>
      
      {/* Mini sparkline visualization (CSS-based) */}
      <div className='mt-6 h-8 flex items-end gap-1'>
        {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
          <div 
            key={i} 
            className={clsx(
              'flex-1 rounded-t-sm transition-all duration-500 group-hover:opacity-100 opacity-50',
              isPositive ? 'bg-emerald-500/40' : 'bg-rose-500/40'
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}