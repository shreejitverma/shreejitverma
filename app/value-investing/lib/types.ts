export interface CompanyFundamentals {
  ticker: string;
  name: string;
  currency: 'USD' | 'EUR';
  fiscalYearEnd: string;
  /** All monetary figures in billions of the stated currency, from the FY2024 annual filing. */
  revenue: number;
  revenueFiveYearsAgo: number;
  netIncome: number;
  ebit: number;
  grossMarginPct: number;
  shareholderEquity: number;
  totalDebt: number;
  operatingCashFlow: number;
  capex: number;
  /** Per-share figures in the stated currency. */
  eps: number;
  bookValuePerShare: number;
  moat: 'Wide' | 'Narrow';
}

export interface ComputedMetrics {
  ticker: string;
  name: string;
  /** Reporting currency; only the per-share Graham Number is denominated in it. */
  currency: CompanyFundamentals['currency'];
  moat: 'Wide' | 'Narrow';
  roePct: number;
  operatingMarginPct: number;
  fcfMarginPct: number;
  revenueCagrPct: number;
  debtToEquity: number;
  grahamNumber: number;
  compositeScore: number;
  signal: Signal;
}

export type Signal = 'Exceptional' | 'Strong' | 'Solid' | 'Watch';

export interface FactorDefinition {
  key: MetricKey;
  label: string;
  formula: string;
  weight: number;
  higherIsBetter: boolean;
  rationale: string;
}

export type MetricKey = 'roePct' | 'operatingMarginPct' | 'fcfMarginPct' | 'revenueCagrPct' | 'debtToEquity';
