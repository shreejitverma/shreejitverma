'use client';

import { Quote, MessageSquare } from 'lucide-react';

const architects = [
  { 
    name: 'Warren Buffett', 
    quote: 'The key to investing is not assessing how much an industry is going to affect society, or how much it will grow, but rather determining the competitive advantage of any given company and, above all, the durability of that advantage.',
    perspective: 'Would appreciate the "unbelievable" moat of the Windows/Office franchise and its high return on capital.',
    tag: 'MOAT'
  },
  { 
    name: 'Charlie Munger', 
    quote: 'The big money is not in the buying and the selling, but in the waiting.',
    perspective: 'Understood the power of the "standard" in computing and the multi-generational compounding effects.',
    tag: 'STANDARD'
  },
  { 
    name: 'Peter Lynch', 
    quote: 'Go for a business that any idiot can run – because sooner or later, any idiot is probably going to run it.',
    perspective: 'Values the "boring but essential" utility nature of enterprise software that businesses cannot function without.',
    tag: 'TEN_BAGGER'
  },
];

export default function ArchitectPerspectives() {
  return (
    <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6'>
      <h3 className='text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2'>
        <MessageSquare className='w-4 h-4 text-blue-400' />
        ARCHITECT_PERSPECTIVES
      </h3>
      
      <div className='space-y-6'>
        {architects.map((arch, i) => (
          <div key={i} className='relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-colors group'>
            <div className='absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 group-hover:border-cyan-500 transition-colors' />
            
            <div className='flex items-center justify-between mb-2'>
              <h4 className='text-xs font-bold text-slate-900 dark:text-slate-100'>{arch.name}</h4>
              <span className='text-[8px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500'>{arch.tag}</span>
            </div>
            
            <div className='relative mb-3'>
              <Quote className='w-3 h-3 text-slate-300 dark:text-slate-700 absolute -left-4 -top-1' />
              <p className='text-[10px] italic text-slate-500 leading-relaxed'>{arch.quote}</p>
            </div>
            
            <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400'>
              <span className='font-bold text-cyan-600 dark:text-cyan-500 mr-2'>SIGHT:</span>
              {arch.perspective}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}