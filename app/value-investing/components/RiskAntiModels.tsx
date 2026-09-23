import { AlertTriangle, Fingerprint, ZapOff, Activity, Ghost } from 'lucide-react';

// Qualitative red flags drawn from the historical cases below. They are a
// manual review checklist, not a scored or automated signal.
const antiModels = [
  {
    name: 'Complexity Trap',
    icon: <Fingerprint className='w-4 h-4' />,
    description: 'Opaque accounting or organizational structure concealing systemic risk.',
    tone: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-500',
  },
  {
    name: 'Financial Engineering',
    icon: <ZapOff className='w-4 h-4' />,
    description: 'Growth driven by buybacks and leverage rather than operations.',
    tone: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-500',
  },
  {
    name: 'Diworsification',
    icon: <Activity className='w-4 h-4' />,
    description: 'Expansion into low-return, unrelated businesses.',
    tone: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-500',
  },
  {
    name: 'The Fall from Godhood',
    icon: <Ghost className='w-4 h-4' />,
    description: 'Cultural decay and loss of founding vision.',
    tone: 'bg-slate-400/10 border-slate-400/20 text-muted-foreground',
  },
];

export default function RiskAntiModels() {
  return (
    <div className='bg-background dark:bg-card/50 border border-border rounded-2xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
          <AlertTriangle className='w-4 h-4 text-rose-700 dark:text-rose-500' />
          RISK_ANTI_MODELS
        </h3>
        <span className='text-[10px] font-mono text-muted-foreground'>QUALITATIVE</span>
      </div>

      <div className='space-y-3'>
        {antiModels.map((model) => (
          <div key={model.name} className='flex items-center gap-4 p-3 rounded-xl bg-background/50 border border-border hover:border-rose-500/30 transition-all group'>
            <div className={`p-2 rounded-lg border shrink-0 ${model.tone}`}>
              {model.icon}
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='text-xs font-bold text-foreground truncate mb-1'>{model.name}</h4>
              <p className='text-[10px] text-muted-foreground leading-tight line-clamp-1 group-hover:line-clamp-none transition-all'>{model.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex gap-3 items-start'>
        <AlertTriangle className='w-4 h-4 text-rose-700 dark:text-rose-500 shrink-0 mt-0.5' />
        <p className='text-[10px] text-rose-700 dark:text-rose-400 leading-relaxed font-mono'>
          Red flags from the historical cases below, reviewed by hand. They are not part of the composite score.
        </p>
      </div>
    </div>
  );
}
