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
  description: 'Quantitative Developer and Researcher specializing in HFT, Statistical Arbitrage, and Market Microstructure. Expertise in C++, Python, FPGA, and Stochastic Calculus.',
  keywords: [
    'Quantitative Developer', 'Quantitative Researcher', 'HFT', 'High Frequency Trading', 
    'Algorithmic Trading', 'C++', 'Python', 'Stochastic Calculus', 'Market Microstructure',
    'Financial Engineering', 'Prop Trading', 'Hedge Funds', 'Alpha Generation',
    'FPGA', 'Low Latency', 'Statistical Arbitrage', 'Machine Learning in Finance'
  ],
  authors: [{ name: 'Shreejit Verma', url: 'https://www.shreejitverma.com' }],
  creator: 'Shreejit Verma',
  openGraph: {
    type: 'profile',
    firstName: 'Shreejit',
    lastName: 'Verma',
    username: 'shreejitverma',
    gender: 'male',
    title: 'Shreejit Verma | Quantitative Developer & Researcher',
    description: 'Specializing in high-performance trading systems, statistical models, and algorithmic strategies for top-tier hedge funds and prop shops.',
    siteName: 'Shreejit Verma Portfolio',
    images: [
      {
        url: 'https://avatars.githubusercontent.com/u/24782948?v=4',
        width: 400,
        height: 400,
        alt: 'Shreejit Verma Profile',
      },
    ],
    locale: 'en_US',
    url: 'https://www.shreejitverma.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shreejit Verma | Quantitative Developer',
    description: 'Engineering alpha through code. Expert in C++, Python, and HFT strategies.',
    creator: '@shreejitverma', // Assuming handle based on previous context, can be updated
    images: ['https://avatars.githubusercontent.com/u/24782948?v=4'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shreejit Verma',
    url: 'https://www.shreejitverma.com',
    image: 'https://avatars.githubusercontent.com/u/24782948?v=4',
    jobTitle: 'Quantitative Developer',
    description: 'Senior Software Engineer and Quantitative Developer specializing in algorithmic trading, HFT, and financial modeling.',
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
      }
    ],
    worksFor: [
      {
        '@type': 'Organization',
        name: 'LogiNext Solutions Inc.',
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
        {children}
      </body>
    </html>
  );
}
