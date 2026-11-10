import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { CONTACT, HEADLINE } from '@/app/lib/profile';
import type { KbPath } from '@/app/lib/open-source';

export const panel = 'rounded-2xl bg-card/40 dark:bg-card border border-border';

// Role-by-role reading routes.
export function PathList({ paths }: { paths: KbPath[] }) {
  return (
    <dl className='grid md:grid-cols-2 gap-4'>
      {paths.map((path) => (
        <div key={path.role} className={`${panel} p-5`}>
          <dt className='font-semibold text-foreground mb-1.5'>{path.role}</dt>
          <dd className='text-sm leading-relaxed'>{path.route}</dd>
        </div>
      ))}
    </dl>
  );
}

// Who writes and maintains the knowledge bases, with the hiring links. The
// repositories are the long-form evidence behind the resume, so every page
// about them ends by connecting the two.
export function AuthorPanel() {
  return (
    <aside className={`${panel} p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start`} aria-label='About the author'>
      <span className='relative w-20 h-20 rounded-full overflow-hidden border border-border shrink-0'>
        <Image src='/images/profile-square.jpg' alt='' fill sizes='80px' className='object-cover' />
      </span>
      <div className='text-sm leading-relaxed'>
        <p className='text-xs font-mono text-primary mb-1'>Written and maintained by</p>
        <p className='text-lg font-bold text-foreground'>{HEADLINE.name}</p>
        <p className='mb-3'>
          {HEADLINE.current} in {HEADLINE.location}. I build low-latency C++ trading and market risk systems: FRTB
          engines at Barclays, automated market making at BNP Paribas, and an FPGA market maker for my MS thesis.
          These repositories are the notes behind that work, shared so others can go further, faster.
        </p>
        <div className='flex flex-wrap gap-x-5 gap-y-2 font-semibold'>
          <Link href='/resume' className='inline-flex items-center gap-1.5 text-primary hover:underline underline-offset-4'>
            Resume <ArrowRight className='w-3.5 h-3.5' aria-hidden='true' />
          </Link>
          <Link href='/#experience' className='text-primary hover:underline underline-offset-4'>Experience</Link>
          <a href={CONTACT.linkedin} target='_blank' rel='noopener noreferrer' className='text-primary hover:underline underline-offset-4'>LinkedIn</a>
          <a href={`mailto:${CONTACT.email}`} className='inline-flex items-center gap-1.5 text-primary hover:underline underline-offset-4'>
            <Mail className='w-3.5 h-3.5' aria-hidden='true' /> Email
          </a>
        </div>
      </div>
    </aside>
  );
}
