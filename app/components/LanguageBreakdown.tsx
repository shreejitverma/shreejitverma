import type { LanguageShare } from '@/app/lib/github';

const OTHER_COLOR = '#8b949e';

const percent = (share: number) => `${(share * 100).toFixed(1)}%`;

// Share of last-year commits per programming language, drawn from
// github-stats.json so it follows the site theme and stays accessible.
export default function LanguageBreakdown({ languages }: { languages: LanguageShare[] }) {
  const summary = languages.map((language) => `${language.name} ${percent(language.share)}`).join(', ');
  return (
    <figure className='rounded-2xl bg-card/40 dark:bg-card border border-border p-6'>
      <figcaption>
        <h3 className='text-lg font-bold text-foreground'>Languages</h3>
        <p className='mt-1 text-sm text-muted-foreground'>Share of commits in the last 12 months, by language</p>
      </figcaption>
      <div className='mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-muted' role='img' aria-label={`Language share: ${summary}`}>
        {languages.map((language) => (
          <span
            key={language.name}
            className='h-full'
            style={{ width: percent(language.share), backgroundColor: language.color ?? OTHER_COLOR }}
          />
        ))}
      </div>
      <ul className='mt-5 grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm' aria-label='Languages by share of commits'>
        {languages.map((language) => (
          <li key={language.name} className='flex items-center gap-2.5'>
            <span className='h-2.5 w-2.5 shrink-0 rounded-full' style={{ backgroundColor: language.color ?? OTHER_COLOR }} aria-hidden='true' />
            <span className='text-foreground'>{language.name}</span>
            <span className='ml-auto font-mono text-muted-foreground'>{percent(language.share)}</span>
          </li>
        ))}
      </ul>
      <p className='mt-5 text-xs text-muted-foreground'>
        Each repository&apos;s commits are split by its language mix; notebooks count as Python and markup is excluded.
      </p>
    </figure>
  );
}
