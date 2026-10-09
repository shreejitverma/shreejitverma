// Index of published articles. Each entry has a matching page at
// app/writing/<slug>/page.tsx; the sitemap and /writing list read from here.

export interface Article {
  slug: string;
  title: string;
  description: string;
  published: string; // ISO date
  readingMinutes: number;
  tags: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'frtb-for-engineers',
    title: 'FRTB for Engineers: What a Market Risk Capital Engine Actually Computes',
    description:
      'A systems view of the Fundamental Review of the Trading Book: Expected Shortfall with liquidity horizons, NMRF stress scenarios, the Default Risk Charge, the Sensitivities-Based Method, and the PLA and backtesting tests that decide whether a desk may use its internal model.',
    published: '2026-10-09',
    readingMinutes: 11,
    tags: ['FRTB', 'Basel IV', 'Market Risk', 'Expected Shortfall', 'Risk Engines'],
  },
];

export const articleUrl = (slug: string) => `/writing/${slug}`;
