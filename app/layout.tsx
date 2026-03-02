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
    default: 'Shreejit Verma | Quantitative Developer & Researcher',
    template: '%s | Shreejit Verma',
  },
  description: 'Senior Quantitative Developer & Researcher specializing in HFT execution, low-latency systems (FPGA/DPDK), and alpha-generating statistical strategies. Expertise in C++23, Python, Stochastic Calculus, and Market Microstructure.',
  keywords: [
    'Jane Street', 'Citadel', 'Jump Trading', 'Optiver', 'Hudson River Trading', 'HRT', 'Two Sigma', 'IMC Trading', 'Radley James', 'Tower Research', 'Akuna Capital', 'DRW', 'Virtu Financial',
    'Quantitative Developer', 'Quantitative Researcher', 'HFT', 'High Frequency Trading', 
    'Ultra Low Latency', 'Deterministic Execution', 'FPGA Market Data', 'Kernel Bypass', 'DPDK',
    'Algorithmic Trading', 'C++23', 'Python', 'Stochastic Calculus', 'Market Microstructure',
    'Financial Engineering', 'Prop Trading', 'Hedge Funds', 'Alpha Generation',
    'FPGA', 'DPDK', 'Low Latency', 'Statistical Arbitrage', 'Machine Learning in Finance', 
    'Order Execution', 'Market Making', 'Execution Algorithms'
  ],
  authors: [{ name: 'Shreejit Verma', url: 'https://www.shreejitverma.com' }],
  creator: 'Shreejit Verma',
  openGraph: {
    type: 'profile',
    firstName: 'Shreejit',
    lastName: 'Verma',
    username: 'shreejitverma',
    gender: 'male',
    title: 'Shreejit Verma | Senior Quantitative Developer & Researcher',
    description: 'Engineering sub-microsecond trading systems and sophisticated alpha strategies. Expert in low-latency infrastructure and financial engineering.',
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
    title: 'Shreejit Verma | Quantitative Developer & Researcher',
    description: 'Engineering alpha through low-latency code and statistical modeling. Expert in C++, FPGA, and HFT strategies.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    // ... existing jsonLd ...
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shreejit Verma',
    url: 'https://www.shreejitverma.com',
    image: 'https://www.shreejitverma.com/Shreejit_Verma_profile_pic.jpg',
    jobTitle: 'Senior Quantitative Developer',
    description: 'Senior Quantitative Developer and Researcher specializing in sub-microsecond trading systems, HFT, and alpha generation.',
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'Stevens Institute of Technology',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'Georgia Institute of Technology',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'WorldQuant University',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'Carnegie Mellon University',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'Vellore Institute of Technology',
      }
    ],
    worksFor: [
      {
        '@type': 'Organization',
        name: 'BNP Paribas CIB',
      },
      {
        '@type': 'Organization',
        name: 'LogiNext Solutions Inc.',
      },
      {
        '@type': 'Organization',
        name: 'Versor Investments',
      },
      {
        '@type': 'Organization',
        name: 'Bank of America',
      }
    ],
    knowsAbout: [
      'Quantitative Finance',
      'High Frequency Trading',
      'Stochastic Calculus',
      'C++',
      'Python',
      'Machine Learning',
      'Market Microstructure',
      'Derivatives Pricing'
    ],
    sameAs: [
      'https://www.linkedin.com/in/shreejitverma/',
      'https://github.com/shreejitverma',
      'https://twitter.com/shreejitverma'
    ]
  };

  return (
    <html lang='en' className='scroll-smooth'>
      <head>
        <Script
          id="json-ld-profile"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={clsx(inter.variable, jetbrainsMono.variable, 'bg-slate-950 text-slate-300 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 font-sans')}>
        <BackgroundCanvas />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
