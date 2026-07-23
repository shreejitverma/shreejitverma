'use client';

import { BookOpen, AlertTriangle } from 'lucide-react';
import { FACTORS } from '../lib/scoring';
import { SNAPSHOT_AS_OF, UNIVERSE } from '../lib/data';

export default function Methodology() {
  return (
    <section id='methodology' className='scroll-mt-24 bg-background dark:bg-card/50 border border-border rounded-2xl p-8'>
      <h3 className='text-sm font-bold text-foreground flex items-center gap-2 mb-6'>
        <BookOpen className='w-4 h-4 text-primary' />
        METHODOLOGY
      </h3>

      <div className='grid md:grid-cols-2 gap-8'>
        <div>
          <h4 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4'>Factor model</h4>
          <p className='text-sm text-muted-foreground leading-relaxed mb-4'>
            Each security is scored on {FACTORS.length} price-independent fundamental factors. Raw values are
            converted to cross-sectional percentile ranks within the {UNIVERSE.length}-name universe (mean rank
            for ties), oriented so higher is better, and combined with the weights below. The composite is
            therefore scale-free and robust to outliers; signals are fixed thresholds on the composite
            (75/55/35), not discretionary calls.
          </p>
          <table className='w-full text-left'>
            <thead>
              <tr>
                <th className='py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>Factor</th>
                <th className='py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border'>Formula</th>
                <th className='py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border text-right'>Weight</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {FACTORS.map((factor) => (
                <tr key={factor.key}>
                  <td className='py-2.5 text-xs font-medium text-foreground' title={factor.rationale}>
                    {factor.label}
                    {!factor.higherIsBetter && <span className='text-muted-foreground font-mono text-[10px]'> (inverted)</span>}
                  </td>
                  <td className='py-2.5 text-[11px] font-mono text-muted-foreground'>{factor.formula}</td>
                  <td className='py-2.5 text-xs font-mono text-primary text-right'>{(factor.weight * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className='text-[11px] font-mono text-muted-foreground mt-4'>
            Graham Number = sqrt(22.5 x EPS x book value per share) - reported per share for reference, outside the composite.
          </p>
        </div>

        <div>
          <h4 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4'>Data and limitations</h4>
          <ul className='space-y-3 text-sm text-muted-foreground leading-relaxed list-disc list-outside ml-4'>
            <li>
              Inputs are approximate, rounded figures transcribed from each company&apos;s FY2024 annual filing
              ({SNAPSHOT_AS_OF}). This is a static research snapshot, not a live feed.
            </li>
            <li>
              Market prices are deliberately excluded, so the screen measures business quality, not valuation.
              A cheap-vs-expensive judgment still requires comparing the Graham Number and quality score against
              the prevailing price.
            </li>
            <li>
              The universe is small and hand-picked toward well-known compounders, so percentile ranks are
              relative to a strong peer group - a mediocre rank here can still be an excellent business globally.
            </li>
            <li>ASML reports in EUR; ratios are currency-neutral but the Graham Number is in EUR per share.</li>
            <li>Nothing on this page is investment advice; it is a methodology demonstration.</li>
          </ul>
          <div className='mt-5 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='w-4 h-4 text-amber-500 shrink-0 mt-0.5' />
            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              Factor weights are subjective research priors, not fitted parameters. Changing them changes the
              ranking; the point of publishing them is that the ranking is reproducible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
