'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Github, GraduationCap, Linkedin, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CONTACT } from '@/app/lib/profile';

// Home-page sections the nav jumps to. On other pages the same links point
// back to the home page anchors.
const SECTIONS = [
  { name: 'Experience', id: 'experience' },
  { name: 'Research', id: 'research' },
  { name: 'Projects', id: 'projects' },
  { name: 'Skills', id: 'skills' },
  { name: 'Education', id: 'education' },
  { name: 'Impact', id: 'impact' },
  { name: 'Writing', id: 'writing' },
  { name: 'Awards', id: 'awards' },
];

// Standalone pages, listed after the sections.
const PAGES = [
  { name: 'Intelligence', href: '/value-investing' },
  { name: 'Reading List', href: '/books' },
];

const SOCIALS = [
  { name: 'GitHub', href: CONTACT.github, Icon: Github },
  { name: 'LinkedIn', href: CONTACT.linkedin, Icon: Linkedin },
  { name: 'Google Scholar', href: CONTACT.scholar, Icon: GraduationCap },
  { name: 'Book a call', href: CONTACT.calendly, Icon: Calendar },
];

interface SiteNavProps {
  // True on the home page, where section links are in-page anchors.
  onHome?: boolean;
}

export default function SiteNav({ onHome = false }: SiteNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hrefFor = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled || isMenuOpen ? 'backdrop-blur-md border-border/50 bg-background/85 h-16' : 'bg-transparent border-transparent h-20'
      }`}
    >
      <div className='max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-6'>
        <Link href='/' className='flex items-center gap-3 shrink-0' aria-label='Shreejit Verma, home'>
          <span className='relative w-10 h-10 rounded-full overflow-hidden border border-border shadow-lg shrink-0'>
            <Image src='/images/profile-square.jpg' alt='' fill sizes='40px' className='object-cover' />
          </span>
          <span className='font-mono text-xl font-bold text-primary tracking-tighter'>
            SV<span className='text-muted-foreground'>.quant</span>
          </span>
        </Link>

        <div className='hidden xl:flex items-center gap-5 text-sm font-medium'>
          {SECTIONS.map((section) => (
            <a key={section.id} href={hrefFor(section.id)} className='hover:text-primary transition-colors'>
              {section.name}
            </a>
          ))}
          <span className='w-px h-4 bg-border' aria-hidden='true' />
          {PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className={page.href === '/value-investing' ? 'text-primary font-bold hover:opacity-80 transition-opacity' : 'hover:text-primary transition-colors'}
            >
              {page.name}
            </Link>
          ))}
        </div>

        <div className='flex items-center gap-4 shrink-0'>
          <div className='hidden sm:flex xl:hidden 2xl:flex items-center gap-4 mr-1'>
            {SOCIALS.map(({ name, href, Icon }) => (
              <a key={name} href={href} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors' aria-label={name} title={name}>
                <Icon className='w-5 h-5' />
              </a>
            ))}
          </div>
          <ThemeToggle />
          <Link
            href='/resume'
            className='px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded hover:opacity-90 transition-colors shadow-lg shadow-primary/20'
          >
            RESUME
          </Link>
          <button
            className='xl:hidden text-muted-foreground hover:text-primary transition-colors'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label='Toggle navigation menu'
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      <div
        className={`xl:hidden absolute top-full left-0 right-0 bg-card border-b border-border transition-all duration-300 overflow-y-auto ${
          isMenuOpen ? 'max-h-[calc(100dvh-4rem)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className='flex flex-col p-6 gap-4'>
          <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
            {SECTIONS.map((section) => (
              <a key={section.id} href={hrefFor(section.id)} className='text-lg font-medium hover:text-primary transition-colors' onClick={closeMenu}>
                {section.name}
              </a>
            ))}
          </div>
          <div className='flex flex-col gap-4 pt-4 border-t border-border'>
            <Link href='/value-investing' className='text-lg font-bold text-primary hover:opacity-80 transition-opacity' onClick={closeMenu}>
              Intelligence Platform
            </Link>
            <Link href='/books' className='text-lg font-medium hover:text-primary transition-colors' onClick={closeMenu}>
              Reading List
            </Link>
          </div>
          <div className='flex gap-6 pt-4 border-t border-border'>
            {SOCIALS.map(({ name, href, Icon }) => (
              <a key={name} href={href} target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary' aria-label={name}>
                <Icon className='w-6 h-6' />
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
