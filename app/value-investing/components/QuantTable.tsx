'use client';

import { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Download, ShieldCheck, Flame, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { UNIVERSE, SNAPSHOT_AS_OF } from '../lib/data';
import { computeUniverse, toCsv } from '../lib/scoring';
import type { ComputedMetrics } from '../lib/types';
import { useHydrated } from '../../components/useHydrated';

type SortKey = keyof Pick<
  ComputedMetrics,
  'ticker' | 'roePct' | 'operatingMarginPct' | 'fcfMarginPct' | 'revenueCagrPct' | 'debtToEquity' | 'grahamNumber' | 'compositeScore'
>;

const COLUMNS: { key: SortKey; label: string; title: string }[] = [
  { key: 'ticker', label: 'Security', title: 'Ticker and company name' },
  { key: 'roePct', label: 'ROE', title: 'Net income / shareholder equity' },
  { key: 'operatingMarginPct', label: 'Op Margin', title: 'EBIT / revenue' },
  { key: 'fcfMarginPct', label: 'FCF Margin', title: '(Operating cash flow - capex) / revenue' },
  { key: 'revenueCagrPct', label: 'Rev CAGR 5y', title: 'Five-year revenue compound annual growth rate' },
  { key: 'debtToEquity', label: 'D/E', title: 'Total debt / shareholder equity' },
  { key: 'grahamNumber', label: 'Graham No.', title: 'sqrt(22.5 x EPS x book value per share), per share, in the reporting currency' },
  { key: 'compositeScore', label: 'Score', title: 'Weighted percentile-rank composite (see methodology)' },
];

export default function QuantTable() {
  const rows = useMemo(() => computeUniverse(UNIVERSE), []);
  const [sortKey, setSortKey] = useState<SortKey>('compositeScore');
  const [ascending, setAscending] = useState(false);
  // The table is server-rendered; keep controls inert-looking until React can
  // handle clicks so an early click is never silently dropped.
  const interactive = useHydrated();

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const cmp = typeof left === 'string' ? left.localeCompare(right as string) : (left as number) - (right as number);
      return ascending ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, ascending]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setAscending((a) => !a);
    } else {
      setSortKey(key);
      setAscending(key === 'ticker');
    }
  };

  const handleExport = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'quality-value-screen.csv';
    // Firefox only honors click() on an anchor attached to the document.
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoking synchronously can cancel the download in Safari and Firefox.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className='bg-background dark:bg-card/50 border border-border rounded-2xl overflow-hidden'>
      <div className='p-6 border-b border-border flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
            <ShieldCheck className='w-4 h-4 text-primary' />
            QUALITY_VALUE_SCREEN
          </h3>
          <p className='text-[10px] font-mono text-muted-foreground mt-1'>{SNAPSHOT_AS_OF} · fundamentals only, no market data</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!interactive}
          className='text-[10px] font-mono px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-cyan-500/20 hover:bg-primary/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait'
        >
          <Download className='w-3 h-3' />
          EXPORT_CSV
        </button>
      </div>

      {/* Focusable so keyboard users can scroll the table horizontally on narrow screens. */}
      <div className='overflow-x-auto' tabIndex={0} role='region' aria-label='Quality value screen, scrollable'>
        <table aria-label='Quality value screen' className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-slate-50/50 dark:bg-background/50'>
              {COLUMNS.map(({ key, label, title }) => (
                <th
                  key={key}
                  aria-sort={key === sortKey ? (ascending ? 'ascending' : 'descending') : 'none'}
                  className='px-3 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>
                  <button
                    onClick={() => handleSort(key)}
                    disabled={!interactive}
                    title={title}
                    aria-label={`Sort by ${label}`}
                    className={clsx('flex items-center gap-1.5 uppercase hover:text-primary transition-colors disabled:cursor-wait', key === sortKey && 'text-primary')}
                  >
                    {label}
                    {key === sortKey ? (
                      ascending ? <ArrowUp className='w-3 h-3' /> : <ArrowDown className='w-3 h-3' />
                    ) : (
                      <ArrowUpDown className='w-3 h-3 opacity-40' />
                    )}
                  </button>
                </th>
              ))}
              <th className='px-3 py-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>Signal</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
            {sorted.map((row) => (
              <tr key={row.ticker} className='hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group'>
                <td className='px-3 py-4'>
                  <div className='flex flex-col'>
                    <span className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>{row.ticker}</span>
                    <span className='text-[10px] text-muted-foreground'>{row.name}</span>
                  </div>
                </td>
                <td className='px-3 py-4 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-500'>{row.roePct.toFixed(1)}%</td>
                <td className='px-3 py-4 text-xs font-mono text-muted-foreground'>{row.operatingMarginPct.toFixed(1)}%</td>
                <td className='px-3 py-4 text-xs font-mono text-muted-foreground'>{row.fcfMarginPct.toFixed(1)}%</td>
                <td className='px-3 py-4 text-xs font-mono text-muted-foreground'>{row.revenueCagrPct.toFixed(1)}%</td>
                <td className={clsx('px-3 py-4 text-xs font-mono font-bold', row.debtToEquity < 0.5 ? 'text-cyan-700 dark:text-cyan-500' : 'text-muted-foreground')}>
                  {row.debtToEquity.toFixed(2)}
                </td>
                <td className='px-3 py-4 text-xs font-mono text-muted-foreground whitespace-nowrap'>
                  {row.grahamNumber.toFixed(1)} <span className='text-[10px]'>{row.currency}</span>
                </td>
                <td className='px-3 py-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-16 h-1.5 rounded-full bg-muted overflow-hidden'>
                      <div className='h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-500' style={{ width: `${row.compositeScore}%` }} />
                    </div>
                    <span className='text-xs font-mono font-bold text-foreground'>{row.compositeScore.toFixed(1)}</span>
                  </div>
                </td>
                <td className='px-3 py-4'>
                  <div className='flex items-center gap-2'>
                    {row.signal === 'Exceptional' ? (
                      <Flame className='w-3 h-3 text-orange-700 dark:text-orange-500' />
                    ) : (
                      <Zap className='w-3 h-3 text-primary' />
                    )}
                    <span
                      className={clsx(
                        'text-xs font-bold',
                        row.signal === 'Exceptional' ? 'text-emerald-700 dark:text-emerald-500' : row.signal === 'Strong' ? 'text-cyan-700 dark:text-cyan-500' : row.signal === 'Solid' ? 'text-amber-700 dark:text-amber-500' : 'text-muted-foreground',
                      )}
                    >
                      {row.signal}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='p-4 border-t border-border bg-slate-50/50 dark:bg-background/50'>
        <p className='text-[10px] font-mono text-muted-foreground text-center'>
          {UNIVERSE.length} securities · composite = weighted percentile ranks · ASML figures in EUR · see methodology below
        </p>
      </div>
    </div>
  );
}
