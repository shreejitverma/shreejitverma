import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.shreejitverma.com'),
  title: {
    default: 'Shreejit Verma | Quantitative Developer & Quantitative Researcher | HFT C++ Engineer',
    template: '%s | Shreejit Verma',
  },
  description: 'Shreejit Verma - Quantitative Developer, Quantitative Researcher, and Quantitative Trading Engineer in New York. C++ low-latency automated market making at BNP Paribas, FPGA/DPDK sub-10us trading systems, statistical arbitrage, and ML-driven alpha research for hedge funds, prop trading, and HFT firms.',
  keywords: [
    'Shreejit Verma',
    'Quantitative Developer', 'Quantitative Researcher', 'Quantitative Trading Engineer',
    'Quant Developer', 'Quant Researcher', 'Quant Trader', 'Quantitative Analyst',
    'HFT', 'High Frequency Trading', 'HFT Developer', 'HFT Engineer',
    'C++ Quantitative Developer', 'Low Latency C++', 'C++23', 'Ultra Low Latency',
    'FPGA Trading', 'FPGA Market Data', 'Kernel Bypass', 'DPDK', 'Deterministic Execution',
    'Limit Order Book', 'Market Making', 'Automated Market Making', 'Market Microstructure',
    'Statistical Arbitrage', 'Merger Arbitrage', 'Alpha Generation', 'Alpha Research',
    'Algorithmic Trading', 'Execution Algorithms', 'Order Execution', 'TWAP', 'Smart Order Routing',
    'Stochastic Calculus', 'Derivatives Pricing', 'Financial Engineering', 'Portfolio Optimization',
    'Machine Learning in Finance', 'Time Series Analysis', 'KDB+', 'Python', 'Risk Management',
    'Hedge Funds', 'Prop Trading', 'Proprietary Trading', 'Sell Side', 'Buy Side',
    'Jane Street', 'Citadel', 'Citadel Securities', 'Jump Trading', 'Optiver',
    'Hudson River Trading', 'HRT', 'Two Sigma', 'IMC Trading', 'Tower Research',
    'Akuna Capital', 'DRW', 'Virtu Financial', 'SIG', 'Susquehanna', 'Five Rings',
    'Millennium', 'Point72', 'Balyasny', 'Squarepoint', 'XTX Markets', 'Radix Trading',
    'New York Quant', 'London Quant', 'Chicago Quant', 'Singapore Quant', 'Hong Kong Quant', 'Amsterdam Quant',
  ],
  authors: [{ name: 'Shreejit Verma', url: 'https://www.shreejitverma.com' }],
  creator: 'Shreejit Verma',
  publisher: 'Shreejit Verma',
  category: 'technology',
  icons: {
    icon: '/Shreejit_Verma_profile_pic.jpg',
    shortcut: '/Shreejit_Verma_profile_pic.jpg',
    apple: '/Shreejit_Verma_profile_pic.jpg',
  },
  openGraph: {
    type: 'profile',
    firstName: 'Shreejit',
    lastName: 'Verma',
    username: 'shreejitverma',
    gender: 'male',
    title: 'Shreejit Verma | Quantitative Developer & Quantitative Researcher',
    description: 'C++ Quantitative Developer (BNP Paribas automated market making), FPGA/DPDK sub-10us trading systems, statistical arbitrage, and ML-driven alpha research. New York based, open to global quant roles.',
    siteName: 'Shreejit Verma Portfolio',
    images: [
      {
        url: 'https://www.shreejitverma.com/Shreejit_Verma_profile_pic.jpg',
        width: 1200,
        height: 630,
        alt: 'Shreejit Verma | Senior Quantitative Developer',
      },
    ],
    locale: 'en_US',
    url: 'https://www.shreejitverma.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shreejit Verma | Quantitative Developer & Quantitative Researcher',
    description: 'Engineering alpha through low-latency C++, FPGA market data handlers, and statistical modeling for HFT, hedge funds, and prop trading.',
    creator: '@shreejitverma',
    images: ['https://www.shreejitverma.com/Shreejit_Verma_profile_pic.jpg'],
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
          'Quantitative Developer',
          'Quantitative Researcher',
          'Quantitative Trading Engineer',
        ],
        description:
          'Quantitative Developer and Researcher specializing in C++ low-latency automated market making, FPGA/DPDK sub-10 microsecond trading systems, statistical arbitrage, and machine-learning-driven alpha research for hedge funds, proprietary trading, and high frequency trading firms.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'New York',
          addressRegion: 'NY',
          addressCountry: 'US',
        },
        nationality: { '@type': 'Country', name: 'India' },
        hasOccupation: {
          '@type': 'Occupation',
          name: 'Quantitative Developer',
          occupationLocation: { '@type': 'City', name: 'New York' },
          skills:
            'C++, Python, KDB+/q, FPGA, DPDK, kernel bypass, lock-free data structures, limit order books, market microstructure, stochastic calculus, statistical arbitrage, machine learning, portfolio optimization, risk management',
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
    <html lang='en' className='scroll-smooth' suppressHydrationWarning>
      <head>
        <Script
          id="json-ld-profile"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={clsx(inter.variable, jetbrainsMono.variable, 'bg-background text-foreground antialiased selection:bg-primary/30 selection:text-cyan-900 dark:selection:text-cyan-100 font-sans')}>
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
