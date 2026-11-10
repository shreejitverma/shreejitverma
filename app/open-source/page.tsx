import type { Metadata } from 'next';
import Link from 'next/link';
import { GitFork, Star } from 'lucide-react';
import SiteNav from '@/app/components/SiteNav';
import SiteFooter from '@/app/components/SiteFooter';
import KnowledgeBaseCard from '@/app/components/KnowledgeBaseCard';
import { formatCount } from '@/app/lib/github';
import { COMBINED_PATHS, KNOWLEDGE_BASES, OPEN_SOURCE_PATH, getAllRepoStats, repoUrl } from '@/app/lib/open-source';
import { socialMetadata } from '@/app/lib/seo';
import { openSourceGraph } from '@/app/lib/structured-data';
import { AuthorPanel, PathList, panel } from './shared';

const title = 'Open-Source Knowledge Bases for Quant Finance, Low-Latency C++, and Agentic AI';
const description =
  'Two free, MIT-licensed knowledge bases by Shreejit Verma: The Quant Prep for quant trader, researcher, developer, and risk interviews, and The Distinguished Engineer for C++, low-latency trading systems, system design, and agentic AI.';

export const metadata: Metadata = {
  title,
  description,
  ...socialMetadata({
    path: OPEN_SOURCE_PATH,
    title: `${title} | Shreejit Verma`,
    description,
    image: { url: `${OPEN_SOURCE_PATH}/opengraph-image`, width: 1200, height: 630, alt: 'The Quant Prep and The Distinguished Engineer, open-source knowledge bases by Shreejit Verma' },
  }),
};

export default async function OpenSource() {
  const stats = await getAllRepoStats();
  const loaded = KNOWLEDGE_BASES.filter((kb) => stats[kb.slug]);
  const totals = loaded.length === KNOWLEDGE_BASES.length
    ? loaded.reduce((sum, kb) => ({ stars: sum.stars + stats[kb.slug].stars, forks: sum.forks + stats[kb.slug].forks }), { stars: 0, forks: 0 })
    : null;

  return (
    <>
      <SiteNav />
      <main className='relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20'>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(openSourceGraph(title, description)) }} />
        <nav aria-label='Breadcrumb' className='text-sm mb-8'>
          <Link href='/' className='text-muted-foreground hover:text-primary transition-colors'>&larr; Home</Link>
        </nav>

        <header className='max-w-4xl mb-12'>
          <p className='text-xs font-mono text-primary mb-3'>Open source · Giving back to the community</p>
          <h1 className='text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6'>Open-Source Knowledge Bases</h1>
          <p className='text-lg md:text-xl leading-relaxed mb-4'>
            Over a decade of learning, notes, solved problems, and runnable code, open-sourced so the next engineer,
            researcher, or trader does not have to start from a blank page. Both are free, MIT-licensed, and maintained
            like production code.
          </p>
          {totals && (
            <p className='inline-flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-mono'>
              <span className='inline-flex items-center gap-1.5'>
                <Star className='w-4 h-4 text-yellow-700 dark:text-yellow-500' aria-hidden='true' /> {formatCount(totals.stars)} stars
              </span>
              <span className='inline-flex items-center gap-1.5'>
                <GitFork className='w-4 h-4' aria-hidden='true' /> {formatCount(totals.forks)} forks
              </span>
              <span className='text-muted-foreground'>across both repositories, live from GitHub</span>
            </p>
          )}
        </header>

        <div className='grid lg:grid-cols-2 gap-6 mb-20'>
          {KNOWLEDGE_BASES.map((kb) => (
            <KnowledgeBaseCard key={kb.slug} kb={kb} stats={stats[kb.slug]} headingLevel='h2' />
          ))}
        </div>

        <section aria-labelledby='paths' className='mb-20'>
          <h2 id='paths' className='text-3xl font-bold text-foreground mb-3'>Pick your path</h2>
          <p className='max-w-3xl leading-relaxed mb-8'>
            The two repositories are companions: The Distinguished Engineer covers the engineering, and The Quant Prep
            covers the mathematics, markets, and firms. Each links to the other instead of copying it.
          </p>
          <PathList paths={COMBINED_PATHS} />
        </section>

        <section aria-labelledby='standards' className='mb-20'>
          <h2 id='standards' className='text-3xl font-bold text-foreground mb-3'>Built like production code</h2>
          <p className='max-w-3xl leading-relaxed mb-8'>
            Study material is usually written once and never checked. These repositories are reviewed, tested, and
            linted on every change, the same way I ship trading systems.
          </p>
          <div className='grid lg:grid-cols-2 gap-6'>
            {KNOWLEDGE_BASES.map((kb) => (
              <div key={kb.slug} className={`${panel} p-6`}>
                <h3 className='font-bold text-foreground mb-3'>{kb.name}</h3>
                <ul className='list-disc list-outside ml-4 space-y-2 text-sm leading-relaxed'>
                  {kb.standards.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby='contribute' className='mb-20'>
          <h2 id='contribute' className='text-3xl font-bold text-foreground mb-3'>Use it, star it, improve it</h2>
          <p className='max-w-3xl leading-relaxed mb-6'>
            Corrections are the most valuable contribution: a wrong number in a public study guide misleads everyone
            who reads it. Open an issue or a pull request, and star a repository if it helped you so others can find it.
          </p>
          <ul className='flex flex-wrap gap-3 text-sm font-semibold'>
            {KNOWLEDGE_BASES.map((kb) => (
              <li key={kb.slug}>
                <a href={`${repoUrl(kb)}/issues`} target='_blank' rel='noopener noreferrer' className='inline-flex px-4 py-2 rounded border border-border text-foreground hover:border-primary/50 hover:text-primary transition-colors'>
                  {kb.name} issues
                </a>
              </li>
            ))}
          </ul>
        </section>

        <AuthorPanel />
      </main>
      <SiteFooter />
    </>
  );
}
