'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { MetricCardSpec } from '@/app/lib/github';
import { GITHUB_LOGIN } from '@/app/lib/github';

interface MetricCardProps {
  card: MetricCardSpec;
  className?: string;
}

// An SVG card rendered by the metrics workflow. Cards with a dark variant
// follow the site theme; a card that fails to load is replaced by a link to
// the GitHub profile instead of a broken image.
export default function MetricCard({ card, className = '' }: MetricCardProps) {
  const [failed, setFailed] = useState(false);
  const frame = `rounded-2xl bg-card/40 dark:bg-card border border-border p-4 flex items-center justify-center overflow-hidden ${className}`;

  if (failed) {
    return (
      <a
        href={`https://github.com/${GITHUB_LOGIN}`}
        target='_blank'
        rel='noopener noreferrer'
        className={`${frame} min-h-32 text-sm text-muted-foreground hover:text-primary transition-colors gap-2`}
      >
        {card.label} is being refreshed. View activity on GitHub <ArrowUpRight className='w-4 h-4 shrink-0' />
      </a>
    );
  }

  const onError = () => setFailed(true);
  return (
    <figure className={frame}>
      {/* eslint-disable-next-line @next/next/no-img-element -- workflow-rendered SVG cards; next/image does not optimize SVG */}
      <img
        src={card.light}
        alt={card.alt}
        loading='lazy'
        decoding='async'
        onError={onError}
        className={`max-w-full h-auto ${card.dark ? 'dark:hidden' : ''}`}
      />
      {card.dark && (
        // eslint-disable-next-line @next/next/no-img-element -- see above
        <img
          src={card.dark}
          alt={card.alt}
          loading='lazy'
          decoding='async'
          onError={onError}
          className='max-w-full h-auto hidden dark:block'
        />
      )}
    </figure>
  );
}
