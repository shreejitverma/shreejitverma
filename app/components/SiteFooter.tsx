import Link from 'next/link';
import { Mail } from 'lucide-react';
import { CONTACT, HEADLINE } from '@/app/lib/profile';

export default function SiteFooter() {
  return (
    <footer className='relative z-10 py-12 border-t border-border bg-background/80 backdrop-blur-sm'>
      <div className='max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-[1fr_auto_auto] md:items-start'>
        <div className='text-sm text-muted-foreground space-y-2'>
          <p className='text-foreground font-semibold'>{HEADLINE.name}</p>
          <p>{HEADLINE.current} · {HEADLINE.location}</p>
          <p>© {new Date().getFullYear()} {HEADLINE.name}. Built with Next.js &amp; Tailwind.</p>
        </div>
        <div className='text-sm space-y-2'>
          <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Contact</p>
          <ul className='space-y-2'>
            <li>
              <a href={`mailto:${CONTACT.email}`} className='inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'>
                <Mail className='w-4 h-4' /> {CONTACT.email}
              </a>
            </li>
            <li><a href={CONTACT.linkedin} target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary transition-colors'>LinkedIn</a></li>
            <li><a href={CONTACT.github} target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary transition-colors'>GitHub</a></li>
            <li><a href={CONTACT.scholar} target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary transition-colors'>Google Scholar</a></li>
            <li><a href={CONTACT.calendly} target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary transition-colors'>Book a call</a></li>
          </ul>
        </div>
        <div className='text-sm space-y-2'>
          <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>More</p>
          <ul className='space-y-2'>
            <li><Link href='/resume' className='text-muted-foreground hover:text-primary transition-colors'>Resume</Link></li>
            <li><Link href='/work/trishul' className='text-muted-foreground hover:text-primary transition-colors'>Trishul case study</Link></li>
            <li><Link href='/writing' className='text-muted-foreground hover:text-primary transition-colors'>Writing</Link></li>
            <li><Link href='/value-investing' className='text-muted-foreground hover:text-primary transition-colors'>Value Intelligence Platform</Link></li>
            <li><Link href='/books' className='text-muted-foreground hover:text-primary transition-colors'>Reading list</Link></li>
            <li><Link href='/#impact' className='text-muted-foreground hover:text-primary transition-colors'>GitHub impact</Link></li>
            <li><Link href='/#certifications' className='text-muted-foreground hover:text-primary transition-colors'>Certifications</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
