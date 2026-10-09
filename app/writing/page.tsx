import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import { ARTICLES, articleUrl } from '../lib/writing';

export const metadata: Metadata = {
  title: 'Writing | Low-Latency Systems, Market Risk, and Quantitative Engineering',
  description:
    'Technical writing by Shreejit Verma on low-latency C++ trading systems, FRTB market risk engines, market microstructure, and quantitative engineering.',
  alternates: { canonical: 'https://www.shreejitverma.com/writing' },
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export default function WritingIndex() {
  return (
    <>
      <SiteNav />
      <main className='relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-20'>
        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4'>Writing</h1>
          <p className='text-lg text-muted-foreground leading-relaxed'>
            Notes on low-latency trading systems, market risk engines, and quantitative engineering.
          </p>
        </header>
        <ul className='space-y-6'>
          {ARTICLES.map((article) => (
            <li key={article.slug} className='p-6 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/40 transition-colors'>
              <p className='text-xs font-mono text-muted-foreground mb-2'>
                <time dateTime={article.published}>{formatDate(article.published)}</time> · {article.readingMinutes} min read
              </p>
              <h2 className='text-xl font-bold text-foreground mb-2'>
                <Link href={articleUrl(article.slug)} className='hover:text-primary transition-colors'>{article.title}</Link>
              </h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-4'>{article.description}</p>
              <Link href={articleUrl(article.slug)} className='inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4'>
                Read the article <ArrowRight className='w-4 h-4' />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
