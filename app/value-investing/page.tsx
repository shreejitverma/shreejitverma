'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Layers, 
  Zap, 
  Terminal, 
  Github, 
  Linkedin,
  Cpu
} from 'lucide-react';
import MetricCard from './components/MetricCard';
import QuantTable from './components/QuantTable';

import SevenPowers from './components/SevenPowers';
import ArchitectPerspectives from './components/ArchitectPerspectives';
import RiskAntiModels from './components/RiskAntiModels';
import HistoricalCases from './components/HistoricalCases';

export default function ValueInvestingPage() {
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setLastUpdate(new Date().toISOString());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className='min-h-screen bg-background text-muted-foreground font-sans selection:bg-primary/30'>
      {/* ... navigation ... */}
      <nav className='fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50 bg-background/80'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link href='/' className='font-mono text-xl font-bold text-primary tracking-tighter hover:text-cyan-500 transition-colors flex items-center gap-2'>
            <Cpu className="w-6 h-6" />
            SV<span className='text-muted-foreground/60'>.terminal</span>
          </Link>
          <div className='flex items-center gap-6'>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/books" className="text-sm font-medium hover:text-primary transition-colors">Archives</Link>
            <div className='flex items-center gap-4 border-l border-border pl-6'>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                <Github className='w-5 h-5' />
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                <Linkedin className='w-5 h-5' />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className='pt-24 pb-20 px-6 max-w-[1600px] mx-auto'>
        {/* System Header */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8'>
          <div className='lg:col-span-3 flex flex-col justify-end'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 border border-cyan-500/20 w-fit'>
              <Terminal className='w-3 h-3' />
              <span>VALUE_INTELLIGENCE_v4.5</span>
            </div>
            <h1 className='text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight'>
              Quant <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500'>Value</span> Research
            </h1>
            <p className='text-lg text-muted-foreground dark:text-muted-foreground max-w-3xl leading-relaxed'>
              Analyzing the &quot;Architects&quot; of wealth through the lens of modern quantitative finance. 
              Moat decomposition using the 7 Powers framework and deep factor analysis.
            </p>
          </div>
          
          <div className='bg-card/50 dark:bg-card border border-border p-6 rounded-2xl flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-mono text-muted-foreground'>RESEARCH_CORE</span>
              <span className='flex items-center gap-1 text-[10px] font-mono text-emerald-500'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                ACTIVE_FETCH
              </span>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between text-xs font-mono'>
                <span className='text-muted-foreground'>SEC_FILINGS</span>
                <span className='text-primary'>SYNCED</span>
              </div>
              <div className='flex justify-between text-xs font-mono'>
                <span className='text-muted-foreground'>MOAT_SCORE</span>
                <span className='text-primary'>9.4/10</span>
              </div>
              <div className='flex justify-between text-xs font-mono'>
                <span className='text-muted-foreground'>LAST_SYNC</span>
                <span className='text-primary truncate max-w-[120px]'>{lastUpdate.split('T')[1].split('.')[0]}</span>
              </div>
            </div>
            <div className='mt-auto pt-4 border-t border-border'>
              <button className='w-full py-2 bg-cyan-600 hover:bg-primary text-foreground rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2'>
                <BarChart3 className='w-3 h-3' />
                GENERATE ALPHA
              </button>
            </div>
          </div>
        </div>

        {/* Core Strategy Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8'>
          <MetricCard 
            title="Capital Efficiency" 
            value="34.01%" 
            label="ROE (MSFT)" 
            trend="+1.2%" 
            icon={<Shield className="w-5 h-5 text-primary" />}
            color="cyan"
          />
          <MetricCard 
            title="Compounding Power" 
            value="25.41%" 
            label="10y CAGR" 
            trend="+0.8%" 
            icon={<Layers className="w-5 h-5 text-blue-400" />}
            color="blue"
          />
          <MetricCard 
            title="Financial Strength" 
            value="0.30" 
            label="Debt/Equity" 
            trend="-0.02" 
            icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
            color="indigo"
          />
          <MetricCard 
            title="Cash Generation" 
            value="1.11%" 
            label="FCF Yield" 
            trend="+0.1%" 
            icon={<Zap className="w-5 h-5 text-emerald-400" />}
            color="emerald"
          />
        </div>

        {/* Dashboard Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          <div className='lg:col-span-2 space-y-6'>
            <SevenPowers />
            <QuantTable />
          </div>
          
          <div className='space-y-6'>
            <ArchitectPerspectives />
            <RiskAntiModels />

            {/* Terminal Output */}
            <div className='bg-background border border-border rounded-2xl p-6 font-mono text-[10px] space-y-2 overflow-hidden h-[300px]'>
              <div className='flex items-center gap-2 text-muted-foreground mb-2'>
                <div className='w-2 h-2 rounded-full bg-red-500/50' />
                <div className='w-2 h-2 rounded-full bg-amber-500/50' />
                <div className='w-2 h-2 rounded-full bg-emerald-500/50' />
                <span className='ml-2 opacity-50 uppercase'>kernel_logs</span>
              </div>
              <div className='text-emerald-500'>[OK] Running 7 Powers analysis for Microsoft (MSFT)...</div>
              <div className='text-muted-foreground'>[INFO] Switching Costs: Office 365 / ERP integration detected</div>
              <div className='text-muted-foreground'>[INFO] Network Economies: GitHub / LinkedIn growth sync</div>
              <div className='text-cyan-500'>[SIGNAL] Scale Economies: Azure infrastructure moat identified</div>
              <div className='text-muted-foreground'>[INFO] Cornered Resource: OpenAI exclusive Azure partnership</div>
              <div className='text-amber-500'>[WARN] Counter-Positioning: Lower score due to incumbent nature</div>
              <div className='text-muted-foreground'>[INFO] Calculating Graham-Number for Tech Sector...</div>
              <div className='text-emerald-500 animate-pulse'>_</div>
            </div>
          </div>
        </div>

        <HistoricalCases />
      </main>

      {/* Footer */}
      <footer className='py-12 border-t border-border mt-20'>
        <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6'>
          <div className='flex items-center gap-2 font-mono text-sm'>
            <span className='text-cyan-500 font-bold'>SV</span>
            <span className='text-muted-foreground'>{"//"} QUANT_RESEARCH_DEPT</span>
          </div>
          <p className='text-muted-foreground/60 text-xs'>
            © {new Date().getFullYear()} Shreejit Verma. Advanced Financial Engineering.
          </p>
          <div className='flex items-center gap-6'>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Terminals</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Documentation</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}