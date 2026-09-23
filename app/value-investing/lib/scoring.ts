import type { CompanyFundamentals, ComputedMetrics, FactorDefinition, MetricKey, Signal } from './types';

/**
 * Quality-value scoring engine.
 *
 * Every metric is derived from filing fundamentals only (no market prices),
 * so results are fully reproducible from the dataset. The composite score is
 * a weighted average of cross-sectional percentile ranks - scale-free, robust
 * to outliers, and standard practice in factor research.
 */

export const FACTORS: FactorDefinition[] = [
  {
    key: 'roePct',
    label: 'Return on Equity',
    formula: 'net income / shareholder equity',
    weight: 0.3,
    higherIsBetter: true,
    rationale: 'Buffett-style capital efficiency: how much profit each dollar of equity produces.',
  },
  {
    key: 'operatingMarginPct',
    label: 'Operating Margin',
    formula: 'EBIT / revenue',
    weight: 0.2,
    higherIsBetter: true,
    rationale: 'Pricing power and cost discipline; persistent high margins signal a moat.',
  },
  {
    key: 'fcfMarginPct',
    label: 'FCF Margin',
    formula: '(operating cash flow - capex) / revenue',
    weight: 0.2,
    higherIsBetter: true,
    rationale: 'Cash conversion: earnings quality independent of accrual accounting.',
  },
  {
    key: 'revenueCagrPct',
    label: 'Revenue 5y CAGR',
    formula: '(revenue / revenue 5y ago)^(1/5) - 1',
    weight: 0.15,
    higherIsBetter: true,
    rationale: 'Durable growth compounds the other quality factors.',
  },
  {
    key: 'debtToEquity',
    label: 'Debt / Equity',
    formula: 'total debt / shareholder equity',
    weight: 0.15,
    higherIsBetter: false,
    rationale: 'Balance-sheet resilience; leverage amplifies fragility in drawdowns.',
  },
];

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function freeCashFlow(company: CompanyFundamentals): number {
  return company.operatingCashFlow - company.capex;
}

export function roePct(company: CompanyFundamentals): number {
  return (company.netIncome / company.shareholderEquity) * 100;
}

export function operatingMarginPct(company: CompanyFundamentals): number {
  return (company.ebit / company.revenue) * 100;
}

export function fcfMarginPct(company: CompanyFundamentals): number {
  return (freeCashFlow(company) / company.revenue) * 100;
}

export function revenueCagrPct(company: CompanyFundamentals): number {
  return ((company.revenue / company.revenueFiveYearsAgo) ** (1 / 5) - 1) * 100;
}

export function debtToEquity(company: CompanyFundamentals): number {
  return company.totalDebt / company.shareholderEquity;
}

/** Graham Number: fair-value ceiling sqrt(22.5 x EPS x BVPS), per-share, price-free. */
export function grahamNumber(company: CompanyFundamentals): number {
  if (company.eps <= 0 || company.bookValuePerShare <= 0) return 0;
  return Math.sqrt(22.5 * company.eps * company.bookValuePerShare);
}

/**
 * Percentile rank of values[index] within values, in [0, 100].
 * Uses the mean rank for ties; a single-element array ranks 50.
 */
export function percentileRank(values: number[], index: number): number {
  if (values.length <= 1) return 50;
  const target = values[index];
  let below = 0;
  let equal = 0;
  for (const value of values) {
    if (value < target) below += 1;
    else if (value === target) equal += 1;
  }
  return ((below + (equal - 1) / 2) / (values.length - 1)) * 100;
}

export function signalFromScore(score: number): Signal {
  if (score >= 75) return 'Exceptional';
  if (score >= 55) return 'Strong';
  if (score >= 35) return 'Solid';
  return 'Watch';
}

const METRIC_FNS: Record<MetricKey, (c: CompanyFundamentals) => number> = {
  roePct,
  operatingMarginPct,
  fcfMarginPct,
  revenueCagrPct,
  debtToEquity,
};

/** Compute all metrics and composite scores for a universe in one pass. */
export function computeUniverse(universe: CompanyFundamentals[]): ComputedMetrics[] {
  const raw = universe.map((company) => ({
    company,
    values: Object.fromEntries(
      (Object.keys(METRIC_FNS) as MetricKey[]).map((key) => [key, METRIC_FNS[key](company)]),
    ) as Record<MetricKey, number>,
  }));

  const columns = Object.fromEntries(
    (Object.keys(METRIC_FNS) as MetricKey[]).map((key) => [key, raw.map((row) => row.values[key])]),
  ) as Record<MetricKey, number[]>;

  return raw.map((row, index) => {
    const composite = FACTORS.reduce((total, factor) => {
      const rank = percentileRank(columns[factor.key], index);
      const oriented = factor.higherIsBetter ? rank : 100 - rank;
      return total + factor.weight * oriented;
    }, 0);
    // Thresholds apply to the published (rounded) score so the displayed
    // number and its signal can never disagree at a boundary.
    const compositeScore = roundTo(composite, 1);
    return {
      ticker: row.company.ticker,
      name: row.company.name,
      currency: row.company.currency,
      moat: row.company.moat,
      roePct: roundTo(row.values.roePct, 1),
      operatingMarginPct: roundTo(row.values.operatingMarginPct, 1),
      fcfMarginPct: roundTo(row.values.fcfMarginPct, 1),
      revenueCagrPct: roundTo(row.values.revenueCagrPct, 1),
      debtToEquity: roundTo(row.values.debtToEquity, 2),
      grahamNumber: roundTo(grahamNumber(row.company), 1),
      compositeScore,
      signal: signalFromScore(compositeScore),
    };
  });
}

export function median(values: number[]): number {
  if (values.length === 0) throw new RangeError('median of an empty array is undefined');
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** RFC 4180-style CSV of the computed universe, sorted by composite score. */
export function toCsv(rows: ComputedMetrics[]): string {
  const header = 'ticker,name,roe_pct,operating_margin_pct,fcf_margin_pct,revenue_cagr_5y_pct,debt_to_equity,graham_number,currency,moat,composite_score,signal';
  const escape = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const body = [...rows]
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((row) =>
      [
        row.ticker,
        escape(row.name),
        row.roePct,
        row.operatingMarginPct,
        row.fcfMarginPct,
        row.revenueCagrPct,
        row.debtToEquity,
        row.grahamNumber,
        row.currency,
        row.moat,
        row.compositeScore,
        row.signal,
      ].join(','),
    );
  return [header, ...body].join('\n');
}
