import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string;
  label: string;
  /** Short qualitative tag shown in the card corner. */
  trend: string;
  icon: ReactNode;
  color: 'cyan' | 'blue' | 'indigo' | 'emerald';
}

export default function MetricCard({ title, value, label, trend, icon, color }: MetricCardProps) {
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
        <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground'>{trend}</span>
      </div>
      <div>
        <h3 className='text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider'>{title}</h3>
        <div className='flex items-baseline gap-2'>
          <span className='text-2xl font-bold text-foreground'>{value}</span>
          <span className='text-xs text-muted-foreground font-medium'>{label}</span>
        </div>
      </div>
    </div>
  );
}