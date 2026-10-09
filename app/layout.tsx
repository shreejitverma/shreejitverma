import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.shreejitverma.com'),
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
  authors: [{ name: 'Shreejit Verma', url: 'https://www.shreejitverma.com' }],
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
    siteName: 'Shreejit Verma Portfolio',
    locale: 'en_US',
    url: 'https://www.shreejitverma.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shreejit Verma | Senior Quantitative Developer & Quantitative Researcher',
    description: 'Senior Quantitative Developer at Barclays. Low-latency C++ trading and risk systems, FPGA and kernel-bypass market making, statistical arbitrage.',
    creator: '@shreejitverma',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://www.shreejitverma.com/#person',
        name: 'Shreejit Verma',
        url: 'https://www.shreejitverma.com',
        image: 'https://www.shreejitverma.com/Shreejit_Verma_profile_pic.jpg',
        email: 'mailto:shreejitverma@gmail.com',
        jobTitle: [
          'Senior Quantitative Developer',
          'Quantitative Developer',
          'Quantitative Researcher',
          'Quantitative Trading Engineer',
        ],
        description:
          'Senior Quantitative Developer at Barclays building FRTB and Basel IV market risk engines, specializing in C++ low-latency automated market making, FPGA/DPDK sub-10 microsecond trading systems, statistical arbitrage, and machine-learning-driven alpha research for hedge funds, proprietary trading, and high frequency trading firms.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'New York',
          addressRegion: 'NY',
          addressCountry: 'US',
        },
        nationality: { '@type': 'Country', name: 'India' },
        worksFor: { '@type': 'Organization', name: 'Barclays', url: 'https://www.ib.barclays/' },
        hasOccupation: {
          '@type': 'Occupation',
          name: 'Senior Quantitative Developer',
          occupationLocation: { '@type': 'City', name: 'New York' },
          skills:
            'C++, Python, KDB+/q, FRTB, Basel IV market risk, Expected Shortfall, FPGA, DPDK, kernel bypass, lock-free data structures, limit order books, market microstructure, stochastic calculus, statistical arbitrage, machine learning, portfolio optimization, risk management',
        },
        alumniOf: [
          { '@type': 'CollegeOrUniversity', name: 'Georgia Institute of Technology' },
          { '@type': 'CollegeOrUniversity', name: 'Stevens Institute of Technology' },
          { '@type': 'CollegeOrUniversity', name: 'WorldQuant University' },
          { '@type': 'CollegeOrUniversity', name: 'Carnegie Mellon University' },
          { '@type': 'CollegeOrUniversity', name: 'Vellore Institute of Technology' },
        ],
        hasCredential: [
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: 'M.S. in Computer Science (Computing Systems), Georgia Institute of Technology (in progress, expected Dec 2026)',
          },
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: 'M.S. in Financial Engineering, Stevens Institute of Technology (GPA 3.974/4.0)',
          },
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: 'M.S. in Financial Engineering, WorldQuant University',
          },
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'certification',
            name: 'CFA Level 1',
          },
        ],
        knowsAbout: [
          'Quantitative Finance',
          'High Frequency Trading',
          'Automated Market Making',
          'Market Microstructure',
          'FRTB',
          'Basel IV Market Risk',
          'Expected Shortfall',
          'Low Latency C++',
          'FPGA Market Data Handlers',
          'Kernel Bypass (DPDK)',
          'Limit Order Books',
          'Lock-Free Data Structures',
          'Statistical Arbitrage',
          'Merger Arbitrage',
          'Execution Algorithms',
          'Stochastic Calculus',
          'Derivatives Pricing',
          'Portfolio Optimization',
          'Risk Management',
          'Time Series Analysis',
          'Machine Learning',
          'Python',
          'KDB+/q',
        ],
        sameAs: [
          'https://www.linkedin.com/in/shreejitverma/',
          'https://github.com/shreejitverma',
          'https://scholar.google.com/citations?hl=en&user=qMzU8iAAAAAJ',
          'https://twitter.com/shreejitverma',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.shreejitverma.com/#website',
        url: 'https://www.shreejitverma.com',
        name: 'Shreejit Verma | Quantitative Developer & Quantitative Researcher',
        publisher: { '@id': 'https://www.shreejitverma.com/#person' },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ProfilePage',
        '@id': 'https://www.shreejitverma.com/#profilepage',
        url: 'https://www.shreejitverma.com',
        name: 'Shreejit Verma | Quantitative Developer, Quantitative Researcher, Quantitative Trading Engineer',
        isPartOf: { '@id': 'https://www.shreejitverma.com/#website' },
        mainEntity: { '@id': 'https://www.shreejitverma.com/#person' },
        inLanguage: 'en-US',
      },
    ],
  };

  return (
    <html lang='en' className={clsx(inter.variable, jetbrainsMono.variable, 'scroll-smooth')} suppressHydrationWarning>
      <head>
        <Script
          id="json-ld-profile"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
