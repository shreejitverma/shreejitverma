'use client';

import { Shield, Zap, Users, BarChart, Award, Lock, Repeat } from 'lucide-react';
import { clsx } from 'clsx';

const powers = [
  { 
    name: 'Switching Costs', 
    icon: <Repeat className="w-4 h-4" />, 
    description: 'Loss of value if customer switches to alternative.',
    score: 95,
    color: 'text-primary',
    bg: 'bg-cyan-400/10'
  },
  { 
    name: 'Network Economies', 
    icon: <Users className="w-4 h-4" />, 
    description: 'Value increases as more people use the product.',
    score: 88,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  { 
    name: 'Scale Economies', 
    icon: <BarChart className="w-4 h-4" />, 
    description: 'Unit cost declines as volume increases.',
    score: 92,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10'
  },
  { 
    name: 'Counter-Positioning', 
    icon: <Zap className="w-4 h-4" />, 
    description: 'New business model that incumbents cannot copy.',
    score: 45,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10'
  },
  { 
    name: 'Branding', 
    icon: <Award className="w-4 h-4" />, 
    description: 'Higher perceived value due to reputation.',
    score: 85,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10'
  },
  { 
    name: 'Cornered Resource', 
    icon: <Lock className="w-4 h-4" />, 
    description: 'Preferential access to a valuable input.',
    score: 78,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
];

export default function SevenPowers() {
  return (
    <div className='bg-background dark:bg-card/50 border border-border rounded-2xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
          <Shield className='w-4 h-4 text-primary' />
          7_POWERS_DECOMPOSITION
        </h3>
        <span className='text-[10px] font-mono text-muted-foreground'>FRAMEWORK: HAMILTON_HELMER</span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {powers.map((power, i) => (
          <div key={i} className='p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-all'>
            <div className='flex items-center justify-between mb-2'>
              <div className={clsx('p-1.5 rounded-lg border', power.bg, power.color.replace('text-', 'border-').replace('400', '500/20'))}>
                {power.icon}
              </div>
              <span className={clsx('text-xs font-mono font-bold', power.color)}>{power.score}%</span>
            </div>
            <h4 className='text-xs font-bold text-foreground mb-1'>{power.name}</h4>
            <p className='text-[10px] text-muted-foreground leading-tight'>{power.description}</p>
            
            <div className='mt-3 h-1 w-full bg-muted dark:bg-muted rounded-full overflow-hidden'>
              <div 
                className={clsx('h-full rounded-full transition-all duration-1000', power.color.replace('text-', 'bg-'))} 
                style={{ width: `${power.score}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}