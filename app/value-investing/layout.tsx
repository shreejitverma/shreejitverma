import type { Metadata } from 'next';
import { socialMetadata } from '@/app/lib/seo';

export const metadata: Metadata = {
  title: 'Value Intelligence Platform | Quantitative Quality-Value Research',
  description:
    'Reproducible quality-value factor research by Shreejit Verma: a transparent five-factor fundamental scoring engine (ROE, operating margin, FCF margin, revenue CAGR, leverage) over a curated compounder universe, with 7 Powers moat decomposition and published methodology.',
  ...socialMetadata({
    path: '/value-investing',
    title: 'Value Intelligence Platform | Quantitative Quality-Value Research',
    description:
      'Transparent, reproducible factor scoring over a curated compounder universe - formulas, weights, and limitations published.',
  }),
};

export default function ValueInvestingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
