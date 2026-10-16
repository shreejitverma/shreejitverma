import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';
import { SITE_URL } from '@/app/lib/profile';
import { SITE_NAME, TWITTER_HANDLE } from '@/app/lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Shreejit Verma | Senior Quantitative Developer & Quantitative Researcher | Low-Latency C++',
    template: '%s | Shreejit Verma',
  },
  description: 'Shreejit Verma - Senior Quantitative Developer at Barclays (FRTB market risk), Quantitative Researcher, and Quantitative Trading Engineer in New York. Low-latency C++ trading and risk systems: FRTB/Basel IV market risk engines, automated market making at BNP Paribas, FPGA and kernel-bypass market making, statistical arbitrage, and ML-driven alpha research.',
  keywords: [
    'Shreejit Verma',
    'Quantitative Developer', 'Senior Quantitative Developer', 'Quantitative Researcher', 'Quantitative Trading Engineer',
    'Quant Developer', 'Quant Researcher', 'Low Latency C++', 'C++20', 'High Frequency Trading', 'HFT',
    'Market Making', 'Automated Market Making', 'Market Microstructure', 'Limit Order Book',
    'FPGA Trading', 'Kernel Bypass', 'DPDK', 'Lock-Free Data Structures',
    'Statistical Arbitrage', 'Merger Arbitrage', 'Alpha Research', 'Execution Algorithms',
    'FRTB', 'Basel IV', 'Market Risk', 'Expected Shortfall', 'P&L Attribution',
    'Stochastic Calculus', 'Derivatives Pricing', 'Portfolio Optimization', 'kdb+/q', 'Python', 'New York',
  ],
  authors: [{ name: 'Shreejit Verma', url: SITE_URL }],
  creator: 'Shreejit Verma',
  publisher: 'Shreejit Verma',
  category: 'technology',
  openGraph: {
    type: 'profile',
    firstName: 'Shreejit',
    lastName: 'Verma',
    username: 'shreejitverma',
    gender: 'male',
    title: 'Shreejit Verma | Senior Quantitative Developer & Quantitative Researcher',
    description: 'Senior Quantitative Developer at Barclays (FRTB market risk), previously C++ automated market making at BNP Paribas. FPGA and kernel-bypass market making, statistical arbitrage, and ML-driven alpha research. New York.',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shreejit Verma | Senior Quantitative Developer & Quantitative Researcher',
    description: 'Senior Quantitative Developer at Barclays. Low-latency C++ trading and risk systems, FPGA and kernel-bypass market making, statistical arbitrage.',
    creator: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import BackgroundCanvas from '@/app/components/BackgroundCanvas';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { AGENT_PATHS } from '@/app/lib/agent/constants';
import { SITE_PAGES } from '@/app/lib/agent/pages';
import { webMcpScript } from '@/app/lib/agent/webmcp';
import { siteGraph } from '@/app/lib/structured-data';

const WEBMCP_SCRIPT = webMcpScript(SITE_PAGES.map(({ path, title, summary }) => ({ path, title, summary })));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={clsx(inter.variable, jetbrainsMono.variable, 'scroll-smooth')} suppressHydrationWarning>
      <head>
        <script
          id="json-ld-profile"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }}
        />
        {/* Agent discovery; also sent as Link response headers (next.config.ts). */}
        <link rel='ai-catalog' href={AGENT_PATHS.aiCatalog} type='application/ai-catalog+json' />
        <link rel='api-catalog' href={AGENT_PATHS.apiCatalog} type='application/linkset+json' />
        <link rel='help' href={AGENT_PATHS.llms} type='text/plain' title='llms.txt' />
        <link rel='alternate' href='/feed.xml' type='application/atom+xml' title='Shreejit Verma - Writing' />
        <script id='webmcp-tools' dangerouslySetInnerHTML={{ __html: WEBMCP_SCRIPT }} />
      </head>
      <body className={clsx('bg-background text-foreground antialiased selection:bg-primary/30 selection:text-cyan-900 dark:selection:text-cyan-100 font-sans')}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <BackgroundCanvas />
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
