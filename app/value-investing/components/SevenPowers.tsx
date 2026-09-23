import { Shield, Zap, Users, BarChart, Award, Lock, Repeat } from 'lucide-react';
import { clsx } from 'clsx';

// Author's qualitative 0-100 assessment of Microsoft (MSFT), matching the
// framework trace on the page. A judgment call, not an output of the screen.
const powers = [
  { 
    name: 'Switching Costs', 
    icon: <Repeat className="w-4 h-4" />, 
    description: 'Loss of value if customer switches to alternative.',
    score: 95,
    text: 'text-primary',
    chip: 'bg-cyan-400/10 border-cyan-500/20',
    bar: 'bg-primary'
  },
  { 
    name: 'Network Economies', 
    icon: <Users className="w-4 h-4" />, 
    description: 'Value increases as more people use the product.',
    score: 88,
    text: 'text-blue-700 dark:text-blue-400',
    chip: 'bg-blue-400/10 border-blue-500/20',
    bar: 'bg-blue-500'
  },
  { 
    name: 'Scale Economies', 
    icon: <BarChart className="w-4 h-4" />, 
    description: 'Unit cost declines as volume increases.',
    score: 92,
    text: 'text-indigo-700 dark:text-indigo-400',
    chip: 'bg-indigo-400/10 border-indigo-500/20',
    bar: 'bg-indigo-500'
  },
  { 
    name: 'Counter-Positioning', 
    icon: <Zap className="w-4 h-4" />, 
    description: 'New business model that incumbents cannot copy.',
    score: 45,
    text: 'text-amber-700 dark:text-amber-400',
    chip: 'bg-amber-400/10 border-amber-500/20',
    bar: 'bg-amber-500'
  },
  { 
    name: 'Branding', 
    icon: <Award className="w-4 h-4" />, 
    description: 'Higher perceived value due to reputation.',
    score: 85,
    text: 'text-rose-700 dark:text-rose-400',
    chip: 'bg-rose-400/10 border-rose-500/20',
    bar: 'bg-rose-500'
  },
  { 
    name: 'Cornered Resource', 
    icon: <Lock className="w-4 h-4" />, 
    description: 'Preferential access to a valuable input.',
    score: 78,
    text: 'text-emerald-700 dark:text-emerald-400',
    chip: 'bg-emerald-400/10 border-emerald-500/20',
    bar: 'bg-emerald-500'
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
        <span className='text-[10px] font-mono text-muted-foreground'>MSFT · AUTHOR&apos;S JUDGMENT · HAMILTON HELMER</span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {powers.map((power) => (
          <div key={power.name} className='p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-all'>
            <div className='flex items-center justify-between mb-2'>
              <div className={clsx('p-1.5 rounded-lg border', power.chip, power.text)}>
                {power.icon}
              </div>
              <span className={clsx('text-xs font-mono font-bold', power.text)}>{power.score}</span>
            </div>
            <h4 className='text-xs font-bold text-foreground mb-1'>{power.name}</h4>
            <p className='text-[10px] text-muted-foreground leading-tight'>{power.description}</p>
            
            <div className='mt-3 h-1 w-full bg-muted dark:bg-muted rounded-full overflow-hidden'>
              <div 
                className={clsx('h-full rounded-full transition-all duration-1000', power.bar)}
                style={{ width: `${power.score}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}