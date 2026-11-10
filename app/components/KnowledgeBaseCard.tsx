import Link from 'next/link';
import { ArrowRight, GitFork, Github, Star } from 'lucide-react';
import { formatCount } from '@/app/lib/github';
import { kbPath, repoUrl, type KnowledgeBase, type RepoStats } from '@/app/lib/open-source';

interface KnowledgeBaseCardProps {
  kb: KnowledgeBase;
  stats?: RepoStats;
  // Heading level for the card title: h3 under a home page section, h2 on /open-source.
  headingLevel?: 'h2' | 'h3';
}

// Live stars and forks, shown only when the GitHub API answered.
export function RepoStatsBadges({ stats }: { stats?: RepoStats }) {
  if (!stats) return null;
  return (
    <span className='inline-flex items-center gap-3 text-xs font-mono text-muted-foreground'>
      <span className='inline-flex items-center gap-1' title='GitHub stars'>
        <Star className='w-3.5 h-3.5 text-yellow-700 dark:text-yellow-500' aria-hidden='true' />
        {formatCount(stats.stars)}<span className='sr-only'> stars</span>
      </span>
      <span className='inline-flex items-center gap-1' title='GitHub forks'>
        <GitFork className='w-3.5 h-3.5' aria-hidden='true' />
        {formatCount(stats.forks)}<span className='sr-only'> forks</span>
      </span>
    </span>
  );
}

export default function KnowledgeBaseCard({ kb, stats, headingLevel = 'h3' }: KnowledgeBaseCardProps) {
  const Heading = headingLevel;
  return (
    <article className='rounded-2xl bg-card/40 dark:bg-card border border-border p-6 md:p-8 flex flex-col hover:border-primary/40 transition-colors'>
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3'>
        <p className='text-xs font-mono text-primary'>Open source · MIT · since {kb.since}</p>
        <RepoStatsBadges stats={stats} />
      </div>
      <Heading className='text-2xl font-bold text-foreground mb-2'>
        <Link href={kbPath(kb)} className='hover:text-primary transition-colors'>{kb.name}</Link>
      </Heading>
      <p className='text-sm md:text-base text-foreground/90 leading-relaxed mb-5'>{kb.tagline}</p>
      <ul className='grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6' aria-label={`${kb.name} in numbers`}>
        {kb.stats.map((stat) => (
          <li key={stat.label} className='rounded-xl border border-border bg-background/40 px-3 py-3'>
            <p className='text-xl md:text-2xl font-bold font-mono text-foreground tracking-tight'>{stat.value}</p>
            <p className='text-xs text-muted-foreground leading-snug mt-0.5'>{stat.label}</p>
          </li>
        ))}
      </ul>
      <ul className='flex flex-wrap gap-2 mb-6' aria-label={`${kb.name} is written for`}>
        {kb.audience.map((role) => (
          <li key={role} className='px-2.5 py-0.5 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>{role}</li>
        ))}
      </ul>
      <div className='mt-auto flex flex-wrap gap-3 text-sm font-semibold'>
        <Link href={kbPath(kb)} className='inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity'>
          Explore {kb.name} <ArrowRight className='w-4 h-4' aria-hidden='true' />
        </Link>
        <a
          href={repoUrl(kb)}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-foreground hover:border-primary/50 hover:text-primary transition-colors'
        >
          <Github className='w-4 h-4' aria-hidden='true' /> Star on GitHub
        </a>
      </div>
    </article>
  );
}
