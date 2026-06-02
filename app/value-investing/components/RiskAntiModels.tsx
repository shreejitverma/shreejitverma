'use client';

import { AlertTriangle, Fingerprint, ZapOff, Activity, Ghost } from 'lucide-react';
import { clsx } from 'clsx';

const antiModels = [
  { 
    name: 'Complexity Trap', 
    icon: <Fingerprint className="w-4 h-4" />, 
    description: 'Opaque accounting or organizational structure concealing systemic risk.',
    riskLevel: 'LOW',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  { 
    name: 'Financial Engineering', 
    icon: <ZapOff className="w-4 h-4" />, 
    description: 'Growth driven by buybacks and leverage rather than operations.',
    riskLevel: 'MODERATE',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  { 
    name: 'Diworsification', 
    icon: <Activity className="w-4 h-4" />, 
    description: 'Expansion into low-return, unrelated businesses.',
    riskLevel: 'LOW',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  { 
    name: 'The Fall from Godhood', 
    icon: <Ghost className="w-4 h-4" />, 
    description: 'Cultural decay and loss of founding vision.',
    riskLevel: 'NEGLIGIBLE',
    color: 'text-muted-foreground',
    bg: 'bg-slate-400/10'
  },
];

export default function RiskAntiModels() {
  return (
    <div className='bg-background dark:bg-card/50 border border-border rounded-2xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
          <AlertTriangle className='w-4 h-4 text-rose-500' />
          RISK_ANTI_MODELS
        </h3>
        <span className='text-[10px] font-mono text-muted-foreground'>STATUS: MONITORING</span>
      </div>

      <div className='space-y-3'>
        {antiModels.map((model, i) => (
          <div key={i} className='flex items-center gap-4 p-3 rounded-xl bg-background/50 border border-border hover:border-rose-500/30 transition-all group'>
            <div className={clsx('p-2 rounded-lg border shrink-0', model.bg, model.color.replace('text-', 'border-').replace('500', '500/20'))}>
              {model.icon}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <h4 className='text-xs font-bold text-foreground truncate'>{model.name}</h4>
                <span className={clsx('text-[8px] font-mono font-bold px-1.5 py-0.5 rounded', model.bg, model.color)}>
                  {model.riskLevel}
                </span>
              </div>
              <p className='text-[10px] text-muted-foreground leading-tight line-clamp-1 group-hover:line-clamp-none transition-all'>{model.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className='mt-6 p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex gap-3 items-start'>
        <AlertTriangle className='w-4 h-4 text-rose-500 shrink-0 mt-0.5' />
        <p className='text-[9px] text-rose-500/80 leading-relaxed font-mono'>
          WARNING: Systematic risk detection active. Any score above MODERATE will trigger immediate position review and factor re-weighting.
        </p>
      </div>
    </div>
  );
}