'use client';

import { Activity, Maximize2 } from 'lucide-react';

export default function PortfolioOverview() {
  return (
    <div className='bg-background dark:bg-card/50 border border-border rounded-2xl p-6 overflow-hidden'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
            <Activity className='w-4 h-4 text-emerald-400' />
            PERFORMANCE_ANALYTICS
          </h3>
          <p className='text-xs text-muted-foreground font-mono mt-1'>SYSTEM_PORTFOLIO_v1 vs S&P500</p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 rounded-full bg-primary' />
            <span className='text-[10px] font-mono text-muted-foreground uppercase'>Strategy</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 rounded-full bg-slate-700' />
            <span className='text-[10px] font-mono text-muted-foreground uppercase'>Benchmark</span>
          </div>
          <button className='p-2 hover:bg-muted dark:hover:bg-muted rounded-lg transition-colors'>
            <Maximize2 className='w-4 h-4 text-muted-foreground' />
          </button>
        </div>
      </div>

      <div className='relative h-[300px] w-full flex items-end gap-[2%] px-2'>
        {/* Mock Chart Visualization */}
        {Array.from({ length: 24 }).map((_, i) => {
          const strategyHeight = 30 + Math.random() * 60;
          const benchmarkHeight = strategyHeight - 10 + Math.random() * 20;
          
          return (
            <div key={i} className='flex-1 group relative h-full flex flex-col justify-end gap-1'>
              <div 
                className='w-full bg-primary/20 group-hover:bg-primary/40 border-t border-cyan-500/50 rounded-t-sm transition-all duration-700' 
                style={{ height: `${strategyHeight}%` }} 
              />
              <div 
                className='w-full bg-slate-700/20 group-hover:bg-slate-700/40 border-t border-border/50 rounded-t-sm transition-all duration-700' 
                style={{ height: `${benchmarkHeight}%` }} 
              />
              
              {/* Tooltip on hover */}
              <div className='absolute -top-12 left-1/2 -translate-x-1/2 bg-background border border-border p-2 rounded text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap'>
                <div className='text-primary'>STRAT: +{(strategyHeight/5).toFixed(2)}%</div>
                <div className='text-muted-foreground'>BENCH: +{(benchmarkHeight/5).toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
        
        {/* Grid lines */}
        <div className='absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='w-full border-t border-slate-500 border-dashed' />
          ))}
        </div>
      </div>

      <div className='mt-8 grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[
          { label: 'Cumulative Return', value: '+284.2%', sub: 'Since Inception' },
          { label: 'Annualized Vol', value: '14.2%', sub: 'Realized 30D' },
          { label: 'Max Drawdown', value: '-12.4%', sub: 'Oct 2025' },
          { label: 'Tracking Error', value: '2.8%', sub: 'vs Benchmark' },
        ].map((stat, i) => (
          <div key={i} className='p-4 rounded-xl bg-slate-50 dark:bg-background/50 border border-border'>
            <div className='text-[10px] text-muted-foreground font-mono uppercase mb-1'>{stat.label}</div>
            <div className='text-lg font-bold text-foreground'>{stat.value}</div>
            <div className='text-[8px] text-muted-foreground font-mono'>{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}