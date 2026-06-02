'use client';

import React from 'react';
import { Activity, Zap, Shield, Target, Cpu, Layers } from 'lucide-react';

const EngineeringPhilosophy = () => {
  const principles = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: "Ultra-Low Latency",
      desc: "Minimizing microsecond-level overhead through kernel bypass (DPDK) and FPGA acceleration.",
      value: 98
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      title: "Deterministic Execution",
      desc: "Ensuring predictable response times via lock-free data structures and cache-line alignment.",
      value: 95
    },
    {
      icon: <Target className="w-5 h-5 text-blue-500" />,
      title: "Alpha-Centric Design",
      desc: "Translating quantitative signals into high-performance execution strategies with minimal slippage.",
      value: 92
    },
    {
      icon: <Layers className="w-5 h-5 text-cyan-500" />,
      title: "Scalable Architecture",
      desc: "Building modular systems that handle millions of events per second with graceful degradation.",
      value: 89
    },
    {
      icon: <Cpu className="w-5 h-5 text-purple-500" />,
      title: "Hardware Synergies",
      desc: "Optimizing software for modern CPU architectures (SIMD, branch prediction) and custom hardware.",
      value: 94
    },
    {
      icon: <Activity className="w-5 h-5 text-rose-500" />,
      title: "Statistical Rigor",
      desc: "Applying rigorous backtesting and risk modeling to ensure robust performance across regimes.",
      value: 91
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {principles.map((p, i) => (
        <div 
          key={i} 
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-cyan-500/10 transition-colors">
              {p.icon}
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
              CORE_METRIC_{i + 1}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{p.title}</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight mb-3">
              {p.desc}
            </p>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${p.value}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EngineeringPhilosophy;
