import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Award, Briefcase, Calendar, Code2, Cpu, Download, FileText, Github, GraduationCap, Mail, PenLine } from 'lucide-react';
import Section from './components/Section';
import SiteNav from './components/SiteNav';
import SiteFooter from './components/SiteFooter';
import { AWARDS, CONTACT, EDUCATION, EXPERIENCE, INTERESTS, LANGUAGES, PROJECTS, PROOF_METRICS, SKILLS } from './lib/profile';
import { ARTICLES, articleUrl } from './lib/writing';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.shreejitverma.com',
  },
};

const card = 'rounded-2xl bg-card/40 dark:bg-card border border-border';

export default function Home() {
  const [featured, ...otherProjects] = PROJECTS;

  return (
    <div className='relative min-h-screen bg-transparent text-muted-foreground font-sans selection:bg-primary/30 overflow-x-hidden'>
      <SiteNav onHome />

      <main className='relative z-10'>
        {/* Hero */}
        <section className='pt-36 pb-16 px-6 max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='max-w-3xl flex-1 text-center md:text-left'>
              <p className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 border border-primary/20'>
                <span className='w-1.5 h-1.5 rounded-full bg-primary' aria-hidden='true' />
                Senior Quantitative Developer at Barclays · New York
              </p>
              <h1 className='text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight'>
                Shreejit Verma
                <span className='block mt-2 text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500'>
                  Quantitative Developer &amp; Researcher
                </span>
              </h1>
              <p className='text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed mx-auto md:mx-0'>
                Quantitative Developer, Quantitative Researcher, and Quantitative Trading Engineer based in New York.
                I build low-latency <strong className='text-foreground'>C++ trading and risk systems</strong>: FRTB market risk
                engines at <strong className='text-foreground'>Barclays</strong>, automated market making at{' '}
                <strong className='text-foreground'>BNP Paribas</strong>, and an <strong className='text-foreground'>FPGA and kernel-bypass</strong>{' '}
                market-making system for my MS thesis.
              </p>
              <div className='flex flex-wrap justify-center md:justify-start gap-3'>
                <Link href='/resume' className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90 transition-opacity'>
                  <FileText className='w-4 h-4' /> View Resume
                </Link>
                <a href={CONTACT.resumePdf} className='inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded hover:border-primary/50 hover:text-primary transition-colors'>
                  <Download className='w-4 h-4' /> Download PDF
                </a>
                <a href={`mailto:${CONTACT.email}`} className='inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded hover:border-primary/50 hover:text-primary transition-colors'>
                  <Mail className='w-4 h-4' /> Email
                </a>
                <a href={CONTACT.calendly} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary border border-primary/20 font-semibold rounded hover:bg-primary/20 transition-colors'>
                  <Calendar className='w-4 h-4' /> Book a Call
                </a>
              </div>
            </div>
            <div className='relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-border shadow-2xl shrink-0 order-first md:order-last'>
              <Image
                src='/images/profile-square.jpg'
                alt='Shreejit Verma'
                fill
                priority
                sizes='(max-width: 768px) 192px, 256px'
                className='object-cover'
              />
            </div>
          </div>

          <ul className='mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4' aria-label='Career highlights'>
            {PROOF_METRICS.map((metric) => (
              <li key={metric.label} className={`${card} p-5`}>
                <p className='text-3xl md:text-4xl font-bold text-foreground font-mono tracking-tight'>{metric.value}</p>
                <p className='mt-1 text-sm font-medium text-foreground'>{metric.label}</p>
                <p className='mt-2 text-xs text-muted-foreground'>{metric.context}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Experience */}
        <Section id='experience' title='Professional Experience' icon={<Briefcase className='w-6 h-6' />}>
          <div className='space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent'>
            {EXPERIENCE.map((role) => (
              <div key={`${role.company}-${role.dates}`} className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card group-hover:border-primary/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                  <div className={role.current ? 'w-3 h-3 bg-cyan-600 dark:bg-primary rounded-full animate-pulse' : 'w-3 h-3 bg-muted-foreground/50 rounded-full'} />
                </div>
                <article className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 ${card} hover:border-primary/30 transition-colors`}>
                  <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-2'>
                    <h3 className='font-bold text-foreground'>
                      <a href={role.url} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>{role.company}</a>
                    </h3>
                    <span className={`text-xs font-mono whitespace-nowrap ${role.current ? 'text-primary' : 'text-muted-foreground'}`}>{role.dates.replace(' - ', ' – ')}</span>
                  </div>
                  <div className='text-sm text-muted-foreground mb-4 font-medium'>{role.title} | {role.location}</div>
                  <ul className='list-disc list-outside ml-4 text-sm text-muted-foreground space-y-2 marker:text-muted-foreground'>
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              </div>
            ))}
          </div>
        </Section>

        {/* Selected work */}
        <Section id='work' title='Selected Work & Research' icon={<Code2 className='w-6 h-6' />}>
          <article className={`${card} p-8 mb-6 hover:border-primary/40 transition-colors`}>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3'>
              <div>
                <p className='text-xs font-mono text-primary mb-2'>Featured case study</p>
                <h3 className='text-2xl font-bold text-foreground'>
                  <Link href={featured.caseStudy ?? featured.repo ?? '#'} className='hover:text-primary transition-colors'>{featured.name}</Link>
                </h3>
                <p className='text-sm font-medium text-muted-foreground mt-1'>{featured.context}</p>
              </div>
              <span className='text-xs font-mono text-muted-foreground whitespace-nowrap'>{featured.dates.replace(' - ', ' – ')}</span>
            </div>
            <p className='text-sm md:text-base leading-relaxed mb-5 max-w-4xl'>{featured.detail}</p>
            <div className='flex flex-wrap gap-2 mb-6'>
              {featured.tags.map((tag) => (
                <span key={tag} className='px-3 py-1 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>{tag}</span>
              ))}
            </div>
            <div className='flex flex-wrap gap-4 text-sm font-semibold'>
              {featured.caseStudy && (
                <Link href={featured.caseStudy} className='inline-flex items-center gap-2 text-primary hover:underline underline-offset-4'>
                  Read the case study <ArrowRight className='w-4 h-4' />
                </Link>
              )}
              {featured.repo && (
                <a href={featured.repo} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors'>
                  <Github className='w-4 h-4' /> Source code
                </a>
              )}
            </div>
          </article>

          <div className='grid md:grid-cols-2 gap-6'>
            {otherProjects.map((project) => (
              <article key={project.name} className={`${card} p-6 flex flex-col hover:border-primary/40 transition-colors`}>
                <div className='flex justify-between items-start gap-3 mb-1'>
                  <h3 className='text-lg font-bold text-foreground'>
                    {project.repo ? (
                      <a href={project.repo} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>{project.name}</a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  {project.repo && <Github className='w-4 h-4 mt-1 shrink-0 text-muted-foreground' aria-hidden='true' />}
                </div>
                <p className='text-xs font-mono text-muted-foreground mb-3'>{project.context} · {project.dates.replace(' - ', ' – ')}</p>
                <p className='text-sm leading-relaxed mb-5 flex-1'>{project.detail}</p>
                <div className='flex flex-wrap gap-2'>
                  {project.tags.map((tag) => (
                    <span key={tag} className='px-2.5 py-0.5 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
            <article className={`${card} p-6 flex flex-col hover:border-primary/40 transition-colors`}>
              <h3 className='text-lg font-bold text-foreground mb-1'>
                <Link href='/value-investing' className='hover:text-primary transition-colors'>Value Intelligence Platform</Link>
              </h3>
              <p className='text-xs font-mono text-muted-foreground mb-3'>Research tool · live on this site</p>
              <p className='text-sm leading-relaxed mb-5 flex-1'>
                Reproducible value-investing screen: a deterministic multi-factor scoring engine with published formulas,
                weights, and limitations, golden-value tests, and CSV export.
              </p>
              <Link href='/value-investing' className='inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4'>
                Open the platform <ArrowUpRight className='w-4 h-4' />
              </Link>
            </article>
          </div>
        </Section>

        {/* Skills */}
        <Section id='skills' title='Technical Skills' icon={<Cpu className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {SKILLS.map((group) => (
              <div key={group.label} className={`${card} p-6`}>
                <h3 className='text-lg font-semibold text-foreground mb-3'>{group.label}</h3>
                <ul className='flex flex-wrap gap-2'>
                  {group.items.map((skill) => (
                    <li key={skill} className='px-2 py-1 text-xs font-mono rounded bg-card text-muted-foreground border border-border'>{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Education */}
        <Section id='education' title='Education' icon={<GraduationCap className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 gap-6'>
            {EDUCATION.map((edu) => (
              <div key={edu.school} className={`${card} p-6`}>
                <div className='flex justify-between items-start gap-3 mb-2'>
                  <h3 className='font-bold text-foreground'>{edu.school}</h3>
                  <span className='text-xs font-mono text-primary whitespace-nowrap'>{edu.dates.replace(' - ', ' – ')}</span>
                </div>
                <div className='text-sm text-foreground font-medium mb-1'>{edu.degree}</div>
                {edu.gpa && <div className='text-xs text-cyan-700 dark:text-cyan-500 mb-3 font-mono'>{edu.gpa}</div>}
                <p className='text-sm text-muted-foreground'>Coursework: {edu.coursework}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Writing */}
        <Section id='writing' title='Writing' icon={<PenLine className='w-6 h-6' />}>
          <div className='grid gap-6'>
            {ARTICLES.map((article) => (
              <article key={article.slug} className={`${card} p-6 md:p-8 hover:border-primary/40 transition-colors`}>
                <p className='text-xs font-mono text-muted-foreground mb-2'>
                  <time dateTime={article.published}>{new Date(`${article.published}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time>
                  {' · '}{article.readingMinutes} min read
                </p>
                <h3 className='text-xl font-bold text-foreground mb-3'>
                  <Link href={articleUrl(article.slug)} className='hover:text-primary transition-colors'>{article.title}</Link>
                </h3>
                <p className='text-sm leading-relaxed mb-4 max-w-4xl'>{article.description}</p>
                <Link href={articleUrl(article.slug)} className='inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4'>
                  Read the article <ArrowRight className='w-4 h-4' />
                </Link>
              </article>
            ))}
          </div>
        </Section>

        {/* Awards */}
        <Section id='awards' title='Awards & Leadership' icon={<Award className='w-6 h-6' />}>
          <div className='grid md:grid-cols-[2fr_1fr] gap-6'>
            <ul className={`${card} p-6 space-y-3 text-sm`}>
              {AWARDS.map((award) => (
                <li key={award.title}>
                  <strong className='text-foreground'>{award.title}</strong>
                  <span className='text-muted-foreground'> - {award.detail}</span>
                </li>
              ))}
            </ul>
            <div className={`${card} p-6 space-y-4 text-sm`}>
              <div>
                <h3 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>Beyond work</h3>
                <p>{INTERESTS}</p>
              </div>
              <div>
                <h3 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>Languages</h3>
                <p>{LANGUAGES}</p>
              </div>
              <p>
                Certifications (CFA Level 1, Bloomberg Market Concepts, and more) are listed on the{' '}
                <Link href='/resume#resume-certifications' className='text-primary underline underline-offset-2'>resume page</Link>.
              </p>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
