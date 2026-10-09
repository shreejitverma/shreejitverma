import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Code2,
  Compass,
  Cpu,
  Download,
  FileText,
  FlaskConical,
  Github,
  GraduationCap,
  Library,
  Mail,
  PenLine,
  Terminal,
} from 'lucide-react';
import Section from './components/Section';
import SiteNav from './components/SiteNav';
import SiteFooter from './components/SiteFooter';
import ProfileImage from './components/ProfileImage';
import EngineeringPhilosophy from './components/EngineeringPhilosophy';
import MetricCard from './components/MetricCard';
import LanguageBreakdown from './components/LanguageBreakdown';
import {
  AWARDS,
  CERTIFICATIONS,
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  HEADLINE,
  INTERESTS,
  LANGUAGES,
  PROJECTS,
  PROOF_METRICS,
  SITE_URL,
  SKILLS,
  type Certification,
  type Project,
} from './lib/profile';
import { ARTICLES, articleUrl } from './lib/writing';
import { GITHUB_LOGIN, METRIC_CARDS, getGitHubStats, type GitHubStats } from './lib/github';
import { FEATURED_BOOKS, getLibraryStats } from './lib/reading';

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

const card = 'rounded-2xl bg-card/40 dark:bg-card border border-border';
const tag = 'px-2.5 py-0.5 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border';
const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

const enDash = (range: string) => range.replace(' - ', ' – ');
const formatCount = (value: number) => value.toLocaleString('en-US');

function ProjectCard({ project }: { project: Project }) {
  const meta = [project.context, project.dates && enDash(project.dates)].filter(Boolean).join(' · ');
  return (
    <article className={`${card} p-6 flex flex-col hover:border-primary/40 transition-colors`}>
      <div className='flex justify-between items-start gap-3 mb-1'>
        <h3 className='text-lg font-bold text-foreground'>
          {project.repo ? (
            <a href={project.repo} {...external} className='hover:text-primary transition-colors'>{project.name}</a>
          ) : (
            project.name
          )}
        </h3>
        {project.repo && <Github className='w-4 h-4 mt-1 shrink-0 text-muted-foreground' aria-hidden='true' />}
      </div>
      {meta && <p className='text-xs font-mono text-muted-foreground mb-3'>{meta}</p>}
      <p className='text-sm leading-relaxed mb-5 flex-1'>{project.detail}</p>
      <div className='flex flex-wrap gap-2'>
        {project.tags.map((t) => (
          <span key={t} className={tag}>{t}</span>
        ))}
      </div>
    </article>
  );
}

function CertificationList({ title, items }: { title: string; items: Certification[] }) {
  return (
    <div>
      <h3 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3'>{title}</h3>
      <ul className='space-y-2 text-sm'>
        {items.map((cert) => (
          <li key={cert.name}>
            <a href={cert.url} {...external} className='inline-flex items-start gap-1.5 text-muted-foreground hover:text-primary transition-colors'>
              {cert.name}
              <ArrowUpRight className='w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60' aria-hidden='true' />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GitHubStatTiles({ stats }: { stats: GitHubStats }) {
  const { lastYear, streak, pullRequests, repositories } = stats;
  const tiles = [
    { value: formatCount(lastYear.contributions), label: 'contributions in the last year', context: 'Across public and private repositories' },
    { value: formatCount(lastYear.commits), label: 'commits in the last year', context: `${formatCount(lastYear.pullRequests)} pull requests opened` },
    { value: formatCount(pullRequests.merged), label: 'pull requests merged', context: `${pullRequests.open} open, ${pullRequests.closed} closed without merge` },
    { value: `${streak.current}d`, label: 'current contribution streak', context: `Longest in the last year: ${streak.longest} days` },
    { value: formatCount(lastYear.repositoriesContributedTo), label: 'repositories committed to', context: `${formatCount(repositories.public)} public repositories, ${formatCount(repositories.stars)} stars` },
    { value: String(stats.memberSince), label: 'on GitHub since', context: `${formatCount(stats.followers)} followers` },
  ];
  const updated = new Date(stats.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className='mb-8'>
      <ul className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4' aria-label='GitHub statistics'>
        {tiles.map((tile) => (
          <li key={tile.label} className={`${card} p-5`}>
            <p className='text-2xl md:text-3xl font-bold text-foreground font-mono tracking-tight'>{tile.value}</p>
            <p className='mt-1 text-sm font-medium text-foreground'>{tile.label}</p>
            <p className='mt-2 text-xs text-muted-foreground'>{tile.context}</p>
          </li>
        ))}
      </ul>
      <p className='mt-3 text-xs text-muted-foreground'>
        From the GitHub API, updated <time dateTime={stats.generatedAt}>{updated}</time>. Contribution counts include private repositories.
      </p>
    </div>
  );
}

export default async function Home() {
  const research = PROJECTS.filter((p) => p.kind === 'research');
  const projects = PROJECTS.filter((p) => p.kind === 'project');
  const [featured, ...otherResearch] = research;
  const githubStats = await getGitHubStats();
  const library = getLibraryStats();

  return (
    <div className='relative min-h-screen bg-transparent text-muted-foreground font-sans selection:bg-primary/30 overflow-x-hidden'>
      <SiteNav onHome />

      <main className='relative z-10'>
        {/* Hero */}
        <section className='pt-36 pb-16 px-6 max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='max-w-3xl flex-1 text-center md:text-left'>
              <p className='inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl sm:rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 border border-primary/20'>
                <Terminal className='w-3 h-3 shrink-0' aria-hidden='true' />
                <span className='hidden sm:inline'>SYSTEM_READY</span>
                <span className='hidden sm:inline text-primary/50' aria-hidden='true'>|</span>
                <span>{HEADLINE.current} · {HEADLINE.location}</span>
              </p>
              <h1 className='text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight'>
                {HEADLINE.name}
                <span className='block mt-2 text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500'>
                  Quantitative Developer &amp; Researcher
                </span>
              </h1>
              <p className='text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed mx-auto md:mx-0'>
                Quantitative Developer, Quantitative Researcher, and Quantitative Trading Engineer based in New York.
                I build low-latency <strong className='text-foreground'>C++ trading and risk systems</strong>: FRTB market risk
                engines at <strong className='text-foreground'>Barclays</strong>, automated market making at{' '}
                <strong className='text-foreground'>BNP Paribas</strong>, and an <strong className='text-foreground'>FPGA and kernel-bypass</strong>{' '}
                market-making system for my MS thesis, plus statistical arbitrage and ML-driven alpha research.
              </p>
              <div className='flex flex-wrap justify-center md:justify-start gap-3'>
                <Link href='/resume' className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90 transition-opacity'>
                  <FileText className='w-4 h-4' /> View Resume
                </Link>
                <a href={CONTACT.resumePdf} className='inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded hover:border-primary/50 hover:text-primary transition-colors'>
                  <Download className='w-4 h-4' /> Download PDF
                </a>
                <a href={CONTACT.calendly} {...external} className='inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary border border-primary/20 font-semibold rounded hover:bg-primary/20 transition-colors'>
                  <Calendar className='w-4 h-4' /> Book a Call
                </a>
              </div>
              <p className='mt-5 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-sm font-medium'>
                <a href='#experience' className='inline-flex items-center gap-1.5 hover:text-primary transition-colors'>
                  View Experience <ArrowRight className='w-3.5 h-3.5' />
                </a>
                <a href='#projects' className='inline-flex items-center gap-1.5 hover:text-primary transition-colors'>
                  Key Projects <ArrowRight className='w-3.5 h-3.5' />
                </a>
                <a href={`mailto:${CONTACT.email}`} className='inline-flex items-center gap-1.5 hover:text-primary transition-colors'>
                  <Mail className='w-3.5 h-3.5' /> {CONTACT.email}
                </a>
              </p>
            </div>
            <div className='relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-border shadow-2xl shrink-0 order-first md:order-last'>
              <ProfileImage
                src='/images/profile-square.jpg'
                alt={HEADLINE.name}
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
                      <a href={role.url} {...external} className='hover:text-primary transition-colors'>{role.company}</a>
                    </h3>
                    <span className={`text-xs font-mono whitespace-nowrap ${role.current ? 'text-primary' : 'text-muted-foreground'}`}>{enDash(role.dates)}</span>
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

        {/* Research */}
        <Section
          id='research'
          title='Research'
          icon={<FlaskConical className='w-6 h-6' />}
          description='Thesis work and research systems, each with source code or a live tool.'
        >
          <article className={`${card} p-8 mb-6 hover:border-primary/40 transition-colors`}>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3'>
              <div>
                <p className='text-xs font-mono text-primary mb-2'>Featured case study</p>
                <h3 className='text-2xl font-bold text-foreground'>
                  {featured.caseStudy ? (
                    <Link href={featured.caseStudy} className='hover:text-primary transition-colors'>{featured.name}</Link>
                  ) : (
                    featured.name
                  )}
                </h3>
                <p className='text-sm font-medium text-muted-foreground mt-1'>{featured.context}</p>
              </div>
              {featured.dates && <span className='text-xs font-mono text-muted-foreground whitespace-nowrap'>{enDash(featured.dates)}</span>}
            </div>
            <p className='text-sm md:text-base leading-relaxed mb-5 max-w-4xl'>{featured.detail}</p>
            <div className='flex flex-wrap gap-2 mb-6'>
              {featured.tags.map((t) => (
                <span key={t} className='px-3 py-1 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>{t}</span>
              ))}
            </div>
            <div className='flex flex-wrap gap-4 text-sm font-semibold'>
              {featured.caseStudy && (
                <Link href={featured.caseStudy} className='inline-flex items-center gap-2 text-primary hover:underline underline-offset-4'>
                  Read the case study <ArrowRight className='w-4 h-4' />
                </Link>
              )}
              {featured.repo && (
                <a href={featured.repo} {...external} className='inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors'>
                  <Github className='w-4 h-4' /> Source code
                </a>
              )}
            </div>
          </article>

          <div className='grid md:grid-cols-2 gap-6'>
            {otherResearch.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
            <article className={`${card} p-6 flex flex-col hover:border-primary/40 transition-colors`}>
              <div className='flex justify-between items-start gap-3 mb-1'>
                <h3 className='text-lg font-bold text-foreground'>
                  <Link href='/value-investing' className='hover:text-primary transition-colors'>Value Intelligence Platform</Link>
                </h3>
                <span className='text-xs font-mono text-primary whitespace-nowrap'>Live</span>
              </div>
              <p className='text-xs font-mono text-muted-foreground mb-3'>Research tool · runs on this site</p>
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

        {/* Projects */}
        <Section
          id='projects'
          title='Key Projects'
          icon={<Code2 className='w-6 h-6' />}
          description='Execution, alpha research, and engineering projects. Cards with a GitHub icon link to the source.'
        >
          <div className='grid md:grid-cols-2 gap-6'>
            {projects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </Section>

        {/* Skills */}
        <Section id='skills' title='Technical Arsenal' icon={<Cpu className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
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

        {/* Engineering philosophy */}
        <Section
          id='philosophy'
          title='Engineering Philosophy'
          icon={<Compass className='w-6 h-6' />}
          description='The principles behind the systems above, each tied to where it was applied.'
        >
          <EngineeringPhilosophy />
        </Section>

        {/* Education */}
        <Section id='education' title='Education' icon={<GraduationCap className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 gap-6'>
            {EDUCATION.map((edu) => (
              <div key={edu.school} className={`${card} p-6 hover:border-primary/30 transition-colors`}>
                <div className='flex justify-between items-start gap-3 mb-2'>
                  <h3 className='font-bold text-foreground'>{edu.school}</h3>
                  <span className='text-xs font-mono text-primary whitespace-nowrap'>{enDash(edu.dates)}</span>
                </div>
                <div className='text-sm text-foreground font-medium mb-1'>{edu.degree}</div>
                {edu.gpa && <div className='text-xs text-cyan-700 dark:text-cyan-500 mb-3 font-mono'>{edu.gpa}</div>}
                <p className='text-sm text-muted-foreground'>Coursework: {edu.coursework}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* GitHub impact */}
        <Section
          id='impact'
          title='GitHub Impact'
          icon={<Github className='w-6 h-6' />}
          description={
            <>
              Activity across public and private repositories, refreshed daily from the GitHub API.{' '}
              <a href={`https://github.com/${GITHUB_LOGIN}`} {...external} className='text-primary underline underline-offset-2'>
                View the GitHub profile
              </a>
              .
            </>
          }
        >
          {githubStats && <GitHubStatTiles stats={githubStats} />}
          <div className='space-y-6'>
            <div className='grid lg:grid-cols-2 gap-6 items-start'>
              <div className='space-y-6'>
                {githubStats && <LanguageBreakdown languages={githubStats.languages} />}
                <MetricCard card={METRIC_CARDS.streak} />
              </div>
              <MetricCard card={METRIC_CARDS.calendar} />
            </div>
            <MetricCard card={METRIC_CARDS.contrib3d} />
            <MetricCard card={METRIC_CARDS.snake} />
            <div className='flex justify-center'>
              {/* eslint-disable-next-line @next/next/no-img-element -- third-party dynamic badge; must not be proxied or cached */}
              <img src='https://visitor-badge.laobi.icu/badge?page_id=shreejitverma' alt='Profile visitor count' loading='lazy' className='h-5' />
            </div>
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
          <div className='grid md:grid-cols-[3fr_2fr] gap-6'>
            <div className={`${card} p-6`}>
              <h3 className='text-lg font-bold text-foreground mb-4 flex items-center gap-2'>
                <Award className='w-5 h-5 text-yellow-700 dark:text-yellow-500' /> Awards
              </h3>
              <ul className='space-y-3 text-sm'>
                {AWARDS.map((award) => (
                  <li key={award.title}>
                    <strong className='text-foreground'>{award.title}</strong>
                    <span className='text-muted-foreground'> - {award.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${card} p-6 space-y-5 text-sm`}>
              <h3 className='text-lg font-bold text-foreground flex items-center gap-2'>
                <Cpu className='w-5 h-5 text-cyan-700 dark:text-cyan-500' /> Interests &amp; Languages
              </h3>
              <div>
                <h4 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>Interests</h4>
                <p>{INTERESTS}</p>
              </div>
              <div>
                <h4 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>Languages</h4>
                <dl className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-1'>
                  {LANGUAGES.map((lang) => (
                    <div key={lang.level} className='contents'>
                      <dt className='font-medium text-foreground'>{lang.level}</dt>
                      <dd>{lang.names}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Section>

        {/* Certifications */}
        <Section id='certifications' title='Certifications' icon={<BookOpen className='w-6 h-6' />}>
          <div className={`${card} p-6 grid md:grid-cols-2 gap-8`}>
            <CertificationList title='Finance' items={CERTIFICATIONS.finance} />
            <CertificationList title='Computer Science' items={CERTIFICATIONS.computerScience} />
          </div>
        </Section>

        {/* Reading list */}
        <Section
          id='books'
          title='Essential Reading'
          icon={<Library className='w-6 h-6' />}
          description='A curated library of the books that shaped my trading philosophy and technical approach, from stochastic calculus to Eastern philosophy.'
        >
          <div className='flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8'>
            <div>
              <p className='text-foreground'>
                <span className='text-3xl font-bold font-mono'>{formatCount(library.total)}</span>{' '}
                <span className='text-sm'>books across {library.shelves.length} shelves</span>
              </p>
              <ul className='mt-4 flex flex-wrap gap-2' aria-label='Reading list shelves'>
                {library.shelves.map((shelf) => (
                  <li key={shelf.name} className={tag}>
                    {shelf.name} <span className='text-primary'>{formatCount(shelf.count)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href='/books'
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary font-semibold rounded-lg border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors w-fit shrink-0'
            >
              View Full Reading List <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
          <ul className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 md:gap-6'>
            {FEATURED_BOOKS.map((book) => (
              <li key={book.title} className='group'>
                <div className='aspect-[2/3] relative rounded-lg overflow-hidden border border-border shadow-sm grayscale-[40%] group-hover:grayscale-0 group-hover:-translate-y-1 transition-all duration-300'>
                  <Image src={book.cover} alt={`${book.title} cover`} fill sizes='(max-width: 768px) 30vw, (max-width: 1024px) 22vw, 180px' className='object-cover' />
                </div>
                <p className='mt-2 text-xs md:text-sm font-medium text-foreground leading-snug line-clamp-2'>{book.title}</p>
                <p className='text-[11px] md:text-xs text-muted-foreground line-clamp-1'>{book.author}</p>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
