import Link from 'next/link';
import { Activity, Cpu, Layers, Shield, Target, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

interface Principle {
  icon: ReactNode;
  title: string;
  desc: string;
  // Where the principle was applied, so each claim points at real work.
  evidence: string;
  href: string;
}

const PRINCIPLES: Principle[] = [
  {
    icon: <Zap className='w-5 h-5 text-amber-700 dark:text-amber-500' />,
    title: 'Ultra-Low Latency',
    desc: 'Minimizing microsecond-level overhead through kernel bypass (DPDK) and FPGA acceleration.',
    evidence: 'Trishul puts parsing, the book, inference, and risk on the FPGA critical path',
    href: '/work/trishul',
  },
  {
    icon: <Shield className='w-5 h-5 text-emerald-700 dark:text-emerald-500' />,
    title: 'Deterministic Execution',
    desc: 'Predictable response times via lock-free data structures, pre-allocated memory, and cache-line alignment.',
    evidence: 'Zero-allocation C++20 control plane with lock-free SPSC queues',
    href: '/work/trishul',
  },
  {
    icon: <Target className='w-5 h-5 text-blue-700 dark:text-blue-500' />,
    title: 'Alpha-Centric Design',
    desc: 'Translating quantitative signals into execution strategies with minimal slippage and transaction cost.',
    evidence: 'Merger-arbitrage strategies for an $8.5B AUM fund at Versor',
    href: '#experience',
  },
  {
    icon: <Layers className='w-5 h-5 text-cyan-700 dark:text-cyan-500' />,
    title: 'Scalable Architecture',
    desc: 'Modular systems that handle millions of events per second and degrade gracefully under load.',
    evidence: 'FRTB risk pipelines on high-performance grids at Barclays',
    href: '#experience',
  },
  {
    icon: <Cpu className='w-5 h-5 text-purple-700 dark:text-purple-500' />,
    title: 'Hardware Synergies',
    desc: 'Software shaped for modern CPUs (SIMD, branch prediction, cache hierarchy) and custom hardware.',
    evidence: 'Hot path feeding FPGA market-data handlers at BNP Paribas',
    href: '#experience',
  },
  {
    icon: <Activity className='w-5 h-5 text-rose-700 dark:text-rose-500' />,
    title: 'Statistical Rigor',
    desc: 'Rigorous backtesting and risk modeling so performance holds across market regimes.',
    evidence: 'Regime-switching execution framework with HMM and Hawkes models',
    href: '#projects',
  },
];

export default function EngineeringPhilosophy() {
  return (
    <ul className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {PRINCIPLES.map((p) => (
        <li
          key={p.title}
          className='p-5 rounded-2xl bg-card/40 dark:bg-card border border-border flex flex-col group hover:border-primary/40 transition-colors'
        >
          <div className='flex items-center gap-3 mb-3'>
            <span className='p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors' aria-hidden='true'>
              {p.icon}
            </span>
            <h3 className='text-base font-bold text-foreground'>{p.title}</h3>
          </div>
          <p className='text-sm text-muted-foreground leading-relaxed mb-4 flex-1'>{p.desc}</p>
          <Link
            href={p.href}
            className='text-xs font-mono text-primary border-t border-border pt-3 hover:underline underline-offset-4'
          >
            In practice: {p.evidence}
          </Link>
        </li>
      ))}
    </ul>
  );
}
