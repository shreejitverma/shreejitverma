'use client';

import { History, ExternalLink, Ghost, AlertCircle } from 'lucide-react';

const cases = [
  { 
    name: 'General Electric', 
    period: '2000 - 2024', 
    reason: 'Complexity Trap & Over-Financialization', 
    impact: '-92% Peak-to-Trough',
    status: 'DEEP_RESEARCH'
  },
  { 
    name: 'Nokia', 
    period: '2007 - 2013', 
    reason: 'Platform Burning & Innovation Blindness', 
    impact: 'Loss of Mobile Dominance',
    status: 'COMPLETE'
  },
  { 
    name: 'IBM', 
    period: '2012 - 2022', 
    reason: 'Financial Engineering & Buyback Trap', 
    impact: 'Decade of Underperformance',
    status: 'ACTIVE'
  },
];

export default function HistoricalCases() {
  return (
    <div className='mt-12 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h3 className='text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
            <History className='w-5 h-5 text-indigo-400' />
            HISTORICAL_ANTI_MODELS
          </h3>
          <p className='text-sm text-slate-500 font-mono mt-1'>LEARNING_FROM_THE_FALLEN</p>
        </div>
        <div className='hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-mono border border-rose-500/20'>
          <AlertCircle className='w-3 h-3' />
          <span>CAUTIONARY_TALES_ONLY</span>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {cases.map((item, i) => (
          <div key={i} className='p-6 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all group'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-400'>
                <Ghost className='w-4 h-4' />
              </div>
              <span className='text-[8px] font-mono text-slate-500 uppercase tracking-widest'>{item.status}</span>
            </div>
            <h4 className='text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-400 transition-colors'>{item.name}</h4>
            <div className='text-[10px] font-mono text-slate-400 mb-4'>{item.period}</div>
            
            <div className='space-y-3'>
              <div>
                <div className='text-[8px] font-bold text-slate-500 uppercase mb-1'>Critical Failure</div>
                <div className='text-xs text-slate-600 dark:text-slate-400 leading-snug'>{item.reason}</div>
              </div>
              <div className='pt-3 border-t border-slate-100 dark:border-slate-800'>
                <div className='text-[8px] font-bold text-rose-500 uppercase mb-1'>Destruction</div>
                <div className='text-xs font-bold text-rose-500'>{item.impact}</div>
              </div>
            </div>
            
            <button className='mt-6 w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-indigo-600 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-600 transition-all'>
              OPEN_CASE_STUDY
              <ExternalLink className='w-3 h-3' />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}