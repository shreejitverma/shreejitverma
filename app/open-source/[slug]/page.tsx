import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Github } from 'lucide-react';
import SiteNav from '@/app/components/SiteNav';
import SiteFooter from '@/app/components/SiteFooter';
import KnowledgeBaseCard, { RepoStatsBadges } from '@/app/components/KnowledgeBaseCard';
import {
  KNOWLEDGE_BASES, OPEN_SOURCE_PATH, STATS_AS_OF, findKnowledgeBase, getRepoStats, kbPath, repoFileUrl, repoUrl,
} from '@/app/lib/open-source';
import { socialMetadata } from '@/app/lib/seo';
import { knowledgeBaseGraph } from '@/app/lib/structured-data';
import { AuthorPanel, PathList, panel } from '../shared';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return KNOWLEDGE_BASES.map((kb) => ({ slug: kb.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kb = findKnowledgeBase((await params).slug);
  if (!kb) return {};
  const path = kbPath(kb);
  return {
    title: kb.seoTitle,
    description: kb.seoDescription,
    keywords: [kb.name, ...kb.topics, 'open source', 'free', 'Shreejit Verma'],
    ...socialMetadata({
      path,
      title: `${kb.seoTitle} | Shreejit Verma`,
      description: kb.seoDescription,
      image: { url: `${path}/opengraph-image`, width: 1200, height: 630, alt: `${kb.name}, an open-source knowledge base by Shreejit Verma` },
    }),
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export default async function KnowledgeBasePage({ params }: Props) {
  const kb = findKnowledgeBase((await params).slug);
  if (!kb) notFound();
  const others = KNOWLEDGE_BASES.filter((other) => other.slug !== kb.slug);
  const [stats, ...otherStats] = await Promise.all([getRepoStats(kb), ...others.map(getRepoStats)]);
  const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

  return (
    <>
      <SiteNav />
      <main className='relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20'>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(knowledgeBaseGraph(kb)) }} />
        <nav aria-label='Breadcrumb' className='text-sm mb-8'>
          <ol className='flex flex-wrap items-center gap-2 text-muted-foreground'>
            <li><Link href='/' className='hover:text-primary transition-colors'>Home</Link></li>
            <li aria-hidden='true'>/</li>
            <li><Link href={OPEN_SOURCE_PATH} className='hover:text-primary transition-colors'>Open Source</Link></li>
            <li aria-hidden='true'>/</li>
            <li aria-current='page' className='text-foreground'>{kb.name}</li>
          </ol>
        </nav>

        <header className='max-w-4xl mb-12'>
          <div className='flex flex-wrap items-center gap-x-5 gap-y-2 mb-4'>
            <p className='text-xs font-mono text-primary'>Open source · MIT · since {kb.since}</p>
            <RepoStatsBadges stats={stats ?? undefined} />
            {stats && (
              <p className='text-xs font-mono text-muted-foreground'>
                Last updated <time dateTime={stats.pushedAt}>{formatDate(stats.pushedAt)}</time>
              </p>
            )}
          </div>
          <h1 className='text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-5'>{kb.name}</h1>
          <p className='text-xl text-foreground/90 leading-relaxed mb-4'>{kb.tagline}</p>
          <p className='text-base md:text-lg leading-relaxed mb-8'>{kb.summary}</p>
          <div className='flex flex-wrap gap-3 text-sm font-semibold'>
            <a href={repoUrl(kb)} {...external} className='inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity'>
              <Github className='w-4 h-4' aria-hidden='true' /> Open on GitHub
            </a>
            <a href={`${repoUrl(kb)}/stargazers`} {...external} className='inline-flex items-center gap-2 px-6 py-3 rounded border border-border text-foreground hover:border-primary/50 hover:text-primary transition-colors'>
              Star the repository
            </a>
            <a href='#quick-start' className='inline-flex items-center gap-2 px-6 py-3 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors'>
              Quick start <ArrowRight className='w-4 h-4' aria-hidden='true' />
            </a>
          </div>
        </header>

        <section aria-labelledby='numbers' className='mb-16'>
          <h2 id='numbers' className='sr-only'>{kb.name} in numbers</h2>
          <ul className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4'>
            {kb.stats.map((stat) => (
              <li key={stat.label} className={`${panel} p-5`}>
                <p className='text-2xl md:text-3xl font-bold text-foreground font-mono tracking-tight'>{stat.value}</p>
                <p className='mt-1 text-sm'>{stat.label}</p>
              </li>
            ))}
          </ul>
          <p className='mt-3 text-xs text-muted-foreground'>
            Counts from the repository README as of <time dateTime={STATS_AS_OF}>{formatDate(STATS_AS_OF)}</time>; stars and forks are live.
          </p>
        </section>

        <section aria-labelledby='inside' className='mb-16'>
          <h2 id='inside' className='text-3xl font-bold text-foreground mb-8'>What is inside</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            {kb.pillars.map((pillar) => (
              <article key={pillar.title} className={`${panel} p-6 flex flex-col hover:border-primary/40 transition-colors`}>
                <h3 className='text-lg font-bold text-foreground mb-2'>
                  <a href={repoFileUrl(kb, pillar.path)} {...external} className='hover:text-primary transition-colors'>{pillar.title}</a>
                </h3>
                <p className='text-sm leading-relaxed mb-4 flex-1'>{pillar.detail}</p>
                <a href={repoFileUrl(kb, pillar.path)} {...external} className='inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4'>
                  Read it on GitHub <ArrowUpRight className='w-4 h-4' aria-hidden='true' />
                </a>
              </article>
            ))}
          </div>
        </section>

        {kb.firms && (
          <section aria-labelledby='firms' className='mb-16'>
            <h2 id='firms' className='text-3xl font-bold text-foreground mb-3'>Firm guides</h2>
            <p className='max-w-3xl leading-relaxed mb-6'>
              One guide per firm: business model, roles, interview process, what each round tests, and the syllabus
              topics to prioritise. <code className='text-sm'>./qp firms</code> ranks your readiness for each one.
            </p>
            <ul className='flex flex-wrap gap-2'>
              {kb.firms.map((firm) => (
                <li key={firm.name}>
                  <a href={repoFileUrl(kb, firm.path)} {...external} className='inline-flex px-3 py-1.5 text-sm rounded-full border border-border bg-card/40 dark:bg-card text-foreground hover:border-primary/50 hover:text-primary transition-colors'>
                    {firm.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby='paths' className='mb-16'>
          <h2 id='paths' className='text-3xl font-bold text-foreground mb-8'>Pick your path</h2>
          <PathList paths={kb.paths} />
        </section>

        <section aria-labelledby='standards' className='mb-16'>
          <h2 id='standards' className='text-3xl font-bold text-foreground mb-6'>Why you can rely on it</h2>
          <ul className={`${panel} p-6 list-disc list-outside pl-10 space-y-2 leading-relaxed`}>
            {kb.standards.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </section>

        <section id='quick-start' aria-labelledby='quick-start-title' className='mb-16 scroll-mt-24'>
          <h2 id='quick-start-title' className='text-3xl font-bold text-foreground mb-6'>Quick start</h2>
          {/* Focusable so keyboard users can scroll it when the commands overflow. */}
          <pre tabIndex={0} aria-label={`${kb.name} quick start commands`} className={`${panel} p-5 overflow-x-auto text-sm font-mono text-foreground focus-visible:outline-2 focus-visible:outline-primary`}><code>{kb.quickStart}</code></pre>
        </section>

        <section aria-labelledby='companion' className='mb-16'>
          <h2 id='companion' className='text-3xl font-bold text-foreground mb-6'>Companion repository</h2>
          <div className='grid gap-6'>
            {others.map((other, i) => (
              <KnowledgeBaseCard key={other.slug} kb={other} stats={otherStats[i] ?? undefined} />
            ))}
          </div>
        </section>

        <AuthorPanel />
      </main>
      <SiteFooter />
    </>
  );
}
