'use client';

import { 
  ArrowUpDown, 
  MoreHorizontal, 
  ExternalLink, 
  ShieldCheck,
  Zap,
  Flame
} from 'lucide-react';
import { clsx } from 'clsx';

const mockStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: '182.41', roe: '141.5%', cagr: '30.0%', de: '0.80', fcf: '2.2%', moat: 'Wide', signal: 'Strong Buy' },
  { ticker: 'NVDA', name: 'NVIDIA', price: '726.13', roe: '114.3%', cagr: '68.5%', de: '0.07', fcf: '0.9%', moat: 'Wide', signal: 'Hold' },
  { ticker: 'ADBE', name: 'Adobe Inc.', price: '584.22', roe: '58.8%', cagr: '10.1%', de: '0.58', fcf: '8.9%', moat: 'Wide', signal: 'Buy' },
  { ticker: 'ORCL', name: 'Oracle', price: '124.51', roe: '57.6%', cagr: '20.6%', de: '4.15', fcf: '-3.4%', moat: 'Narrow', signal: 'Sell' },
  { ticker: 'ASML', name: 'ASML Holding', price: '892.31', roe: '52.2%', cagr: '32.8%', de: '0.13', fcf: '1.5%', moat: 'Wide', signal: 'Buy' },
  { ticker: 'GOOGL', name: 'Alphabet', price: '142.71', roe: '38.9%', cagr: '26.2%', de: '0.20', fcf: '0.6%', moat: 'Wide', signal: 'Buy' },
  { ticker: 'MSFT', name: 'Microsoft', price: '450.24', roe: '34.0%', cagr: '25.4%', de: '0.30', fcf: '1.1%', moat: 'Wide', signal: 'Strong Buy' },
  { ticker: 'INFY', name: 'Infosys', price: '18.42', roe: '31.4%', cagr: '9.2%', de: '0.10', fcf: '0.1%', moat: 'Wide', signal: 'Buy' },
];

export default function QuantTable() {
  return (
    <div className='bg-background dark:bg-card/50 border border-border rounded-2xl overflow-hidden'>
      <div className='p-6 border-b border-border flex items-center justify-between'>
        <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
          <ShieldCheck className='w-4 h-4 text-primary' />
          SECTOR_BENCHMARK_v2
        </h3>
        <div className='flex gap-2'>
          <button className='text-[10px] font-mono px-3 py-1 rounded-md bg-muted dark:bg-muted text-muted-foreground hover:text-primary transition-colors'>EXPORT_CSV</button>
          <button className='text-[10px] font-mono px-3 py-1 rounded-md bg-primary/10 text-cyan-500 border border-cyan-500/20'>LIVE_MODE</button>
        </div>
      </div>
      
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-slate-50/50 dark:bg-background/50'>
              <th className='px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>
                <div className='flex items-center gap-2 cursor-pointer hover:text-primary'>
                  Security <ArrowUpDown className='w-3 h-3' />
                </div>
              </th>
              <th className='px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>ROE</th>
              <th className='px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>10y CAGR</th>
              <th className='px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>D/E</th>
              <th className='px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>FCF Yield</th>
              <th className='px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>Moat</th>
              <th className='px-6 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>Signal</th>
              <th className='px-6 py-4 border-b border-border'></th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
            {mockStocks.map((stock, i) => (
              <tr key={i} className='hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group'>
                <td className='px-6 py-4'>
                  <div className='flex flex-col'>
                    <span className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>{stock.ticker}</span>
                    <span className='text-[10px] text-muted-foreground'>{stock.name}</span>
                  </div>
                </td>
                <td className='px-6 py-4 text-xs font-mono font-bold text-emerald-500'>{stock.roe}</td>
                <td className='px-6 py-4 text-xs font-mono text-muted-foreground'>{stock.cagr}</td>
                <td className={clsx(
                  'px-6 py-4 text-xs font-mono font-bold',
                  parseFloat(stock.de) < 0.5 ? 'text-cyan-500' : 'text-muted-foreground'
                )}>{stock.de}</td>
                <td className='px-6 py-4 text-xs font-mono text-muted-foreground'>{stock.fcf}</td>
                <td className='px-6 py-4'>
                  <span className={clsx(
                    'px-2 py-0.5 rounded text-[9px] font-bold uppercase',
                    stock.moat === 'Wide' ? 'bg-primary/10 text-cyan-500' : 'bg-muted dark:bg-muted text-muted-foreground'
                  )}>{stock.moat}</span>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    {stock.signal.includes('Strong') ? <Flame className='w-3 h-3 text-orange-500 animate-pulse' /> : <Zap className='w-3 h-3 text-primary' />}
                    <span className={clsx(
                      'text-xs font-bold',
                      stock.signal.includes('Buy') ? 'text-emerald-500' : 
                      stock.signal === 'Hold' ? 'text-amber-500' : 'text-rose-500'
                    )}>{stock.signal}</span>
                  </div>
                </td>
                <td className='px-6 py-4 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <button className='p-1.5 hover:bg-muted dark:hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100'>
                      <ExternalLink className='w-3 h-3 text-muted-foreground' />
                    </button>
                    <button className='p-1.5 hover:bg-muted dark:hover:bg-muted rounded-md transition-colors'>
                      <MoreHorizontal className='w-3 h-3 text-muted-foreground' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className='p-4 border-t border-border bg-slate-50/50 dark:bg-background/50 flex items-center justify-center'>
        <button className='text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest'>Load More Securities</button>
      </div>
    </div>
  );
}