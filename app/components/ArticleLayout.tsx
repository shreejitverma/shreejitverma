import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import { CONTACT, SITE_URL } from '@/app/lib/profile';

interface ArticleLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  published?: string; // ISO date; omitted for evergreen case studies
  readingMinutes?: number;
  back: { href: string; label: string };
  children: ReactNode;
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export default function ArticleLayout({ eyebrow, title, description, path, published, readingMinutes, back, children }: ArticleLayoutProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': published ? 'TechArticle' : 'CreativeWork',
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    ...(published ? { datePublished: published, dateModified: published } : {}),
    author: { '@id': `${SITE_URL}/#person`, '@type': 'Person', name: 'Shreejit Verma', url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#person` },
    inLanguage: 'en-US',
  };

  return (
    <>
      <SiteNav />
      <main className='relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-20'>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <nav aria-label='Breadcrumb' className='text-sm mb-8'>
          <Link href={back.href} className='text-muted-foreground hover:text-primary transition-colors'>&larr; {back.label}</Link>
        </nav>
        <header className='mb-10'>
          <p className='text-xs font-mono text-primary mb-3'>{eyebrow}</p>
          <h1 className='text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-5'>{title}</h1>
          <p className='text-lg text-muted-foreground leading-relaxed mb-6'>{description}</p>
          <div className='flex items-center gap-3 text-sm text-muted-foreground'>
            <span className='relative w-9 h-9 rounded-full overflow-hidden border border-border shrink-0'>
              <Image src='/images/profile-square.jpg' alt='' fill sizes='36px' className='object-cover' />
            </span>
            <span>
              <span className='text-foreground font-medium'>Shreejit Verma</span>
              {published && (
                <>
                  {' · '}<time dateTime={published}>{formatDate(published)}</time>
                </>
              )}
              {readingMinutes && <>{' · '}{readingMinutes} min read</>}
            </span>
          </div>
        </header>
        <article className='prose-article'>{children}</article>
        <aside className='mt-16 p-6 rounded-2xl bg-card/40 dark:bg-card border border-border text-sm'>
          <p className='text-foreground font-semibold mb-1'>Shreejit Verma</p>
          <p className='text-muted-foreground mb-4'>
            Senior Quantitative Developer in New York, building low-latency C++ trading and market risk systems.
          </p>
          <div className='flex flex-wrap gap-4 font-semibold'>
            <Link href='/resume' className='text-primary hover:underline underline-offset-4'>Resume</Link>
            <a href={`mailto:${CONTACT.email}`} className='text-primary hover:underline underline-offset-4'>Email</a>
            <a href={CONTACT.linkedin} target='_blank' rel='noopener noreferrer' className='text-primary hover:underline underline-offset-4'>LinkedIn</a>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
