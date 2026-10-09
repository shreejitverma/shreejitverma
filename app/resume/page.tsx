import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Mail, Github, Linkedin, Globe } from 'lucide-react';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import { AWARDS, CERTIFICATIONS, CONTACT, EDUCATION, EXPERIENCE, HEADLINE, PROJECTS, SKILLS } from '../lib/profile';
import { socialMetadata } from '../lib/seo';

export const metadata: Metadata = {
  title: 'Resume | Quantitative Developer, Quantitative Researcher & Quantitative Trading Engineer',
  description:
    'Resume of Shreejit Verma - Senior Quantitative Developer at Barclays (FRTB market risk), Quantitative Researcher, and Quantitative Trading Engineer in New York. C++ automated market making at BNP Paribas, FPGA/DPDK sub-10us trading systems, statistical arbitrage, merger arbitrage, and ML-driven alpha research.',
  ...socialMetadata({
    path: '/resume',
    title: 'Shreejit Verma | Resume - Quantitative Developer & Quantitative Researcher',
    description:
      'FRTB and Basel IV market risk engines at Barclays, C++ low-latency market making, FPGA/DPDK trading systems, statistical arbitrage, and ML-driven alpha research. Full resume with experience, education, projects, and certifications.',
    type: 'profile',
  }),
};

const sectionHeading = 'text-2xl font-bold text-foreground';

export default function ResumePage() {
  return (
    <>
      <SiteNav />
      <main className='relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20 text-muted-foreground'>
        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-3'>{HEADLINE.name}</h1>
          <p className='text-lg text-foreground font-medium mb-2'>{HEADLINE.roles}</p>
          <p className='text-sm mb-6'>{HEADLINE.current} · {HEADLINE.location}</p>
          <div className='flex flex-wrap gap-4 text-sm'>
            <a
              href={CONTACT.resumePdf}
              className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 font-semibold rounded hover:bg-primary/20 transition-colors'
            >
              <Download className='w-4 h-4' />
              Download PDF
            </a>
            <a href={`mailto:${CONTACT.email}`} className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
              <Mail className='w-4 h-4' /> {CONTACT.email}
            </a>
            <a href={CONTACT.github} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
              <Github className='w-4 h-4' /> GitHub
            </a>
            <a href={CONTACT.linkedin} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
              <Linkedin className='w-4 h-4' /> LinkedIn
            </a>
            <Link href='/' className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
              <Globe className='w-4 h-4' /> shreejitverma.com
            </Link>
          </div>
        </header>

        <section aria-labelledby='resume-summary' className='mb-12'>
          <h2 id='resume-summary' className={`${sectionHeading} mb-4`}>Summary</h2>
          <p className='leading-relaxed'>
            Quantitative Developer and Researcher engineering low-latency trading and risk infrastructure and
            alpha-generating strategies for hedge funds, proprietary trading, and high frequency trading
            environments. Currently a Senior Quantitative Developer at Barclays, building C++ and Python FRTB market
            risk engines for Basel IV capital (IMA and SA). Previously built C++ automated market-making components
            at BNP Paribas CIB for the Prime Credit Market, developed systematic merger-arbitrage strategies at an
            $8.5B AUM fund, and built FICC trading services at Bank of America.
          </p>
        </section>

        <section aria-labelledby='resume-experience' className='mb-12'>
          <h2 id='resume-experience' className={`${sectionHeading} mb-6`}>Professional Experience</h2>
          <div className='space-y-8'>
            {EXPERIENCE.map((job) => (
              <article key={`${job.company}-${job.dates}`}>
                <div className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1'>
                  <h3 className='text-lg font-bold text-foreground'>
                    <a href={job.url} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                      {job.company}
                    </a>
                  </h3>
                  <span className='text-xs font-mono text-primary'>{job.dates}</span>
                </div>
                <div className='text-sm font-medium mb-2'>{job.title} | {job.location}</div>
                {job.summary && <p className='text-sm mb-2'>{job.summary}</p>}
                <ul className='list-disc list-outside ml-5 text-sm space-y-1'>
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby='resume-education' className='mb-12'>
          <h2 id='resume-education' className={`${sectionHeading} mb-6`}>Education</h2>
          <ul className='space-y-3'>
            {EDUCATION.map((edu) => (
              <li key={edu.school} className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1'>
                <span>
                  <span className='font-semibold text-foreground'>{edu.school}</span>
                  <span className='block sm:inline sm:ml-2 text-sm'>{edu.degree}{edu.gpa ? `, ${edu.gpa}` : ''}</span>
                </span>
                <span className='text-xs font-mono text-primary whitespace-nowrap'>{edu.dates}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby='resume-skills' className='mb-12'>
          <h2 id='resume-skills' className={`${sectionHeading} mb-6`}>Skills</h2>
          <ul className='space-y-2 text-sm'>
            {SKILLS.map((group) => (
              <li key={group.label}>
                <span className='font-semibold text-foreground'>{group.label}:</span> {group.items.join(', ')}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby='resume-projects' className='mb-12'>
          <h2 id='resume-projects' className={`${sectionHeading} mb-6`}>Research & Selected Projects</h2>
          <div className='space-y-6'>
            {PROJECTS.filter((proj) => !proj.homeOnly).map((proj) => (
              <article key={proj.name}>
                <div className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1'>
                  <h3 className='font-semibold text-foreground'>
                    {proj.repo ? (
                      <a href={proj.repo} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                        {proj.name}
                      </a>
                    ) : (
                      proj.name
                    )}
                  </h3>
                  <span className='text-xs font-mono text-primary whitespace-nowrap'>{proj.dates}</span>
                </div>
                <p className='text-xs font-mono mb-1'>{proj.context}</p>
                <p className='text-sm'>{proj.detail}</p>
                {proj.caseStudy && (
                  <Link href={proj.caseStudy} className='text-sm text-primary underline underline-offset-2'>Read the case study</Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby='resume-achievements' className='mb-12'>
          <h2 id='resume-achievements' className={`${sectionHeading} mb-6`}>Achievements & Certifications</h2>
          <ul className='list-disc list-outside ml-5 text-sm space-y-1'>
            {AWARDS.map((award) => (
              <li key={award.title}>{award.title}</li>
            ))}
          </ul>
          <h3 id='resume-certifications' className='text-lg font-semibold text-foreground mt-8 mb-3 scroll-mt-24'>Certifications</h3>
          <div className='grid sm:grid-cols-2 gap-6 text-sm'>
            <div>
              <h4 className='text-xs font-bold uppercase tracking-wider mb-2'>Finance</h4>
              <ul className='space-y-1'>
                {CERTIFICATIONS.finance.map((cert) => (
                  <li key={cert.name}>
                    <a href={cert.url} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>{cert.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className='text-xs font-bold uppercase tracking-wider mb-2'>Computer Science</h4>
              <ul className='space-y-1'>
                {CERTIFICATIONS.computerScience.map((cert) => (
                  <li key={cert.name}>
                    <a href={cert.url} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>{cert.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
