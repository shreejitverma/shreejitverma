'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileImage from './components/ProfileImage';
import Section from './components/Section';
import { ThemeToggle } from './components/ThemeToggle';
import EngineeringPhilosophy from './components/EngineeringPhilosophy';
import { 
  Github, Linkedin, Mail, Terminal, BookOpen, Briefcase, Code2, 
  GraduationCap, Award, Cpu, Menu, X, ArrowUpRight 
} from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Skills', href: '#skills' },
    { name: 'Research', href: '#research' },
    { name: 'Projects', href: '#projects' },
    { name: 'Impact', href: '#impact' },
  ];

  return (
    <div className='relative min-h-screen bg-transparent text-muted-foreground font-sans selection:bg-primary/30 overflow-x-hidden'>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'backdrop-blur-md border-border/50 bg-background/80 h-16' : 'bg-transparent border-transparent h-20'
      }`}>
        <div className='max-w-7xl mx-auto px-6 h-full flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative w-10 h-10 rounded-full overflow-hidden border border-border shadow-lg shrink-0'>
              <Image 
                src="/images/user-profile.png" 
                alt="Shreejit Verma" 
                fill
                className='object-cover'
              />
            </div>
            <div className='font-mono text-xl font-bold text-primary tracking-tighter'>
              SV<span className='text-muted-foreground/50'>.quant</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className='hidden lg:flex gap-8 text-sm font-medium'>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className='hover:text-primary transition-colors'>
                {link.name}
              </a>
            ))}
            <Link href='/value-investing' className='text-primary font-bold hover:text-cyan-500 transition-colors'>Intelligence</Link>
            <Link href='/books' className='hover:text-primary transition-colors'>Reading List</Link>
          </div>

          <div className='flex items-center gap-4'>
            <div className='hidden sm:flex items-center gap-4 mr-2'>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                <Github className='w-5 h-5' />
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
               <Linkedin className='w-5 h-5' />
              </a>
              <a href='https://scholar.google.com/citations?hl=en&user=qMzU8iAAAAAJ' target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors' title="Google Scholar">
               <GraduationCap className='w-5 h-5' />
              </a>
              </div>

            <ThemeToggle />
            <a href='https://shreejitverma.com/Shreejit_Verma_Resume.pdf' target='_blank' rel="noopener noreferrer" className='px-4 py-2 text-xs font-bold text-slate-950 bg-primary rounded hover:opacity-90 transition-colors shadow-lg shadow-primary/20'>
              RESUME
            </a>
            
            {/* Mobile Menu Button */}
            <button 
              className='lg:hidden text-muted-foreground hover:text-primary transition-colors'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-card border-b border-border transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}>
          <div className='flex flex-col p-6 gap-4'>
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className='text-lg font-medium hover:text-primary transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link 
              href='/value-investing' 
              className='text-lg font-bold text-primary hover:text-cyan-500 transition-colors'
              onClick={() => setIsMenuOpen(false)}
            >
              Intelligence Platform
            </Link>
            <Link 
              href='/books' 
              className='text-lg font-medium hover:text-primary transition-colors'
              onClick={() => setIsMenuOpen(false)}
            >
              Reading List
            </Link>
            <div className='flex gap-6 mt-2 pt-4 border-t border-border'>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary'>
                <Github className='w-6 h-6' />
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary'>
                <Linkedin className='w-6 h-6' />
              </a>
              <a href='https://scholar.google.com/citations?hl=en&user=qMzU8iAAAAAJ' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary'>
                <GraduationCap className='w-6 h-6' />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className='relative z-10'>
        {/* Hero Section */}
        <section className='pt-40 pb-20 px-6 max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='max-w-3xl flex-1 text-center md:text-left'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 border border-primary/20'>
                <Terminal className='w-3 h-3' />
                <span>SYSTEM_READY</span>
              </div>
              <h1 className='text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight'>
                Quantitative <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500'>
                  Developer & Researcher
                </span>
              </h1>
              <p className='text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed mx-auto md:mx-0'>
                Engineering ultra-low latency trading systems and alpha-generating models. 
                Expertise in <strong className='text-foreground'>FPGA/DPDK</strong> infrastructure, <strong className='text-foreground'>deterministic execution</strong>, and statistical arbitrage strategies for high-frequency environments.
              </p>
              <div className='flex flex-wrap justify-center md:justify-start gap-4'>
                <a href='#experience' className='px-6 py-3 bg-foreground dark:bg-background text-background dark:text-foreground font-semibold rounded hover:opacity-90 transition-colors'>
                  View Experience
                </a>
                <a href='#projects' className='px-6 py-3 border border-border text-muted-foreground font-semibold rounded hover:border-primary/50 hover:text-primary transition-colors'>
                  Key Projects
                </a>
              </div>
            </div>
            <div className='relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-border shadow-2xl shrink-0 order-first md:order-last'>
              <ProfileImage 
                src="/images/user-profile.png" 
                alt="Shreejit Verma" 
                className='object-cover'
              />
            </div>
          </div>
        </section>

        {/* Education Section */}
        <Section id='about' title='Education' icon={<GraduationCap className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 gap-6'>
            {[
              {
                school: "Georgia Institute of Technology (Online)",
                degree: "Master of Science in Computer Science with Specialization in Computing Systems",
                date: "Aug 2024 – Expected Dec 2026",
                gpa: "",
                details: "Coursework: High-Performance Computing, Distributed Computing, Database Management Systems, Bayesian Statistics."
              },
              {
                school: "Stevens Institute of Technology",
                degree: "Master of Science in Financial Engineering",
                date: "Aug 2024 – May 2026",
                gpa: "GPA: 3.974/4.0",
                details: "Coursework: Market Microstructure, Portfolio Theory and Applications, Algorithmic Trading Strategies, Multivariate Statistics."
              },
              {
                school: "WorldQuant University",
                degree: "Master of Science in Financial Engineering",
                date: "Dec 2021 – May 2024",
                gpa: "GPA: 86%",
                details: "Coursework: Deep Learning for Finance, Financial Econometrics, Fixed Income, Equity, Portfolio Management, Risk Management."
              },
              {
                school: "Carnegie Mellon University, Tepper School of Business",
                degree: "Master of Science in Computational Finance",
                date: "Aug 2021 – Oct 2021",
                gpa: "",
                details: "Coursework: Investments, Statistical Machine Learning, Simulation Methods, Financial Computing, Algorithmic Optimization. (Program withdrawn due to father's illness)"
              },
              {
                school: "Vellore Institute of Technology",
                degree: "Bachelor of Technology in Computer Science and Engineering",
                date: "Jul 2014 – Sept 2018",
                gpa: "GPA: 8.78/10.0",
                details: "Coursework: Data Structures and Algorithms, Computer Networks, Reinforcement Learning, Natural Language Processing (NLP)."
              }
            ].map((edu, i) => (
              <div key={i} className='p-6 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-foreground'>{edu.school}</h3>
                  <span className='text-xs font-mono text-primary whitespace-nowrap ml-2'>{edu.date}</span>
                </div>
                <div className='text-sm text-foreground font-medium mb-1'>{edu.degree}</div>
                {edu.gpa && <div className='text-xs text-cyan-600 dark:text-cyan-500 mb-3 font-mono'>{edu.gpa}</div>}
                <p className='text-sm text-muted-foreground'>{edu.details}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Experience Section */}
        <Section id='experience' title='Professional Experience' icon={<Briefcase className='w-6 h-6' />}>
          <div className='space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent'>
            
            {/* BNP Paribas */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card group-hover:border-primary/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-cyan-600 dark:bg-primary rounded-full animate-pulse'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-foreground'><a href="https://cib.bnpparibas/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">BNP Paribas CIB</a></h3>
                  <span className='text-xs font-mono text-primary'>Feb 2026 – Present</span>
                </div>
                <div className='text-sm text-muted-foreground mb-4 font-medium'>C++ Quantitative Developer (Automated Market Making)</div>
                <ul className='list-disc list-outside ml-4 text-sm text-muted-foreground space-y-2 marker:text-muted-foreground'>
                  <li>Developing high-performance C++ trading systems with FPGA for Automated Market Making strategies.</li>
                  <li>Collaborating with front-office to optimize latency and enhance execution performance.</li>
                  <li>Leading development for the Prime Credit Market platform, supporting ~$500 million in daily market-making.</li>
                  <li>Integrating agentic AI frameworks and LLM assistants with automated testing protocols.</li>
                </ul>
              </div>
            </div>

            {/* LogiNext */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card group-hover:border-primary/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-muted-foreground/50 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-foreground'><a href="https://loginextsolutions.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LogiNext Solutions Inc.</a></h3>
                  <span className='text-xs font-mono text-primary'>Mar 2023 – Jun 2025</span>
                </div>
                <div className='text-sm text-muted-foreground mb-4 font-medium'>Senior Software Engineer in Analytics Department</div>
                <ul className='list-disc list-outside ml-4 text-sm text-muted-foreground space-y-2 marker:text-muted-foreground'>
                  <li>Architected Map Construction and Routing Algorithms (solving 3 Nested NP-Hard Problems) using Constraint Programming.</li>
                  <li>Led a team of 12 as Head of the Data Analytics department.</li>
                  <li>Built an internal Large Language Model (LLM) that improved bug resolution by 80%.</li>
                </ul>
              </div>
            </div>

            {/* Versor */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card group-hover:border-primary/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-muted-foreground/50 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-foreground'><a href="https://versorinvest.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Versor Investments</a></h3>
                  <span className='text-xs font-mono text-muted-foreground/50'>Feb 2022 – Oct 2022</span>
                </div>
                <div className='text-sm text-muted-foreground mb-4 font-medium'>Quantitative Developer, Merger Arbitrage and Stock Selection Portfolio</div>
                <ul className='list-disc list-outside ml-4 text-sm text-muted-foreground space-y-2 marker:text-muted-foreground'>
                  <li>Contributed to the management of $8.5 Billion AUM.</li>
                  <li>Developed systematic strategies for merger arbitrage, yielding a 15% improvement in alpha capture.</li>
                  <li>Deployed scalable ML pipelines for Order & Execution Management Systems, increasing efficiency by 29%.</li>
                </ul>
              </div>
            </div>

            {/* Bank of America */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card group-hover:border-primary/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-muted-foreground/50 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-foreground'><a href="https://www.bankofamerica.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Bank of America</a></h3>
                  <span className='text-xs font-mono text-muted-foreground/50'>Jun 2018 – Jul 2021</span>
                </div>
                <div className='text-sm text-muted-foreground mb-4 font-medium'>Senior Software Engineer (FICC) / Senior Tech Associate</div>
                <ul className='list-disc list-outside ml-4 text-sm text-muted-foreground space-y-2 marker:text-muted-foreground'>
                  <li>Engineered Python-based trading services on QUARTZ and integrated C++ pipelines with SANDRA (OODB), reducing latency by 50%.</li>
                  <li>Led the migration of 1M+ lines of code to Python 3.8, increasing efficiency by 40%.</li>
                  <li>Architected an ML/AI platform that increased decision-making accuracy by 67% and reduced ~36 FTEs.</li>
                </ul>
              </div>
            </div>

          </div>
        </Section>

        {/* Skills Section - Categorized */}
        <Section id='skills' title='Technical Arsenal' icon={<Cpu className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              {
                category: "Quantitative Finance",
                skills: "Stochastic Calculus, Derivative Pricing, Time Series Analysis, Factor Modeling, Greeks, Risk Management, Market Microstructure"
              },
              {
                category: "Mathematics & Stats",
                skills: "Probability, PDE, Linear Algebra, Markov Chains, Bayesian Statistics, Numerical Methods, Differential Equations"
              },
              {
                category: "Programming",
                skills: "Python, C++, C, Java, R, MATLAB, KDB+/Q, OCaml, JavaScript, Verilog, VHDL, Bash, Linux"
              },
              {
                category: "Machine Learning",
                skills: "TensorFlow, PyTorch, Scikit-learn, XGBoost, RNN, LSTM, Random Forest, Clustering, NLP, Deep Learning, Neural Networks, LLMs"
              },
              {
                category: "Data Engineering",
                skills: "Spark, Hadoop, Kafka, Airflow, PostgreSQL, MongoDB, Redis, ZeroMQ, Cassandra, Dask, PySpark, FastAPI, REST APIs, InfluxDB, SQL, BQL"
              },
              {
                category: "Systems & DevOps",
                skills: "Docker, Kubernetes, AWS, GCP, Linux Kernel Tuning, DPDK, FPGA, Git, Jenkins, Ansible, CI/CD, Serverless Architecture"
              }
            ].map((group, i) => (
              <div key={i} className='p-6 rounded-xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all'>
                <h3 className='text-lg font-semibold text-foreground mb-3'>{group.category}</h3>
                <div className='flex flex-wrap gap-2'>
                  {group.skills.split(', ').map((skill, j) => (
                    <span key={j} className='px-2 py-1 text-xs font-mono rounded bg-card text-muted-foreground border border-border'>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Research Section */}
        <Section id='research' title='Research' icon={<BookOpen className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 gap-6'>
            <Link 
              href='/value-investing'
              className='group p-8 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 block relative overflow-hidden'
            >
              <div className='absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity'>
                <Cpu className='w-12 h-12 text-foreground' />
              </div>
              <div className='flex justify-between items-start mb-3'>
                <h3 className='text-xl font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-primary transition-colors'>Value Intelligence Platform</h3>
                <div className='flex items-center gap-3'>
                  <span className='text-xs font-mono text-primary whitespace-nowrap'>Active</span>
                  <ArrowUpRight className='w-5 h-5 text-muted-foreground/50 group-hover:text-cyan-600 dark:group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 shrink-0' />
                </div>
              </div>
              <div className='text-sm text-muted-foreground font-medium mb-3'>Autonomous Research Engine</div>
              <p className='text-sm text-muted-foreground mb-6 leading-relaxed'>
                A sophisticated quantitative platform aggregating factor-based strategies from Buffett, Dalio, and Lynch. Real-time alpha discovery and risk decomposition.
              </p>
              <div className='flex flex-wrap gap-2'>
                <span className='px-3 py-1 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>QUANT</span>
                <span className='px-3 py-1 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>ALPHA</span>
                <span className='px-3 py-1 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>HFT_READY</span>
              </div>
            </Link>
            {[
              {
                title: "AI-Integrated FPGA for Market Making in Volatile Environments",
                subtitle: "Master's Thesis",
                date: "Oct 2024 – Dec 2025",
                details: "Engineering a sub-10µs trading platform with a custom-built limit order book, FPGA market data handlers, kernel bypass (DPDK), hardware timestamping, and lock-free data structures for deterministic, microsecond-level execution performance.",
                link: "https://github.com/shreejitverma/trishul-ultra-hft-project"
              },
              {
                title: "Dynamic Portfolio Optimization",
                subtitle: "Master's Thesis (WorldQuant University)",
                date: "Mar 2024 – June 2024",
                details: "Built a real-time portfolio optimization system using convex and non-convex optimization methods, enhancing risk-adjusted returns via adaptive asset rebalancing and multi-factor modeling, managing interest rate, FX, credit, and market risks.",
                link: "https://github.com/shreejitverma/Dynamic-Portfolio-Optimization"
              }
            ].map((res, i) => (
              <a 
                key={i} 
                href={res.link}
                target='_blank'
                rel='noopener noreferrer'
                className='group p-8 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 block'
              >
                <div className='flex justify-between items-start mb-3'>
                  <h3 className='text-xl font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-primary transition-colors'>{res.title}</h3>
                  <div className='flex items-center gap-3'>
                    <span className='text-xs font-mono text-primary whitespace-nowrap'>{res.date}</span>
                    <Github className='w-5 h-5 text-muted-foreground/50 group-hover:text-cyan-600 dark:group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 shrink-0' />
                  </div>
                </div>
                <div className='text-sm text-muted-foreground font-medium mb-3'>{res.subtitle}</div>
                <p className='text-sm text-muted-foreground mb-4 leading-relaxed'>{res.details}</p>
              </a>
            ))}
          </div>
        </Section>

        {/* Projects Section */}
        <Section id='projects' title='Key Projects' icon={<Code2 className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 gap-6'>
            {[
              {
                title: 'Adaptive Volatility Regime Based Execution and Risk Framework',
                desc: 'Developed adaptive volatility regime switch framework dynamically selecting among passive, TWAP, and aggressive strategies. Achieved 20.0% increase in Sharpe Ratio, 6.1% transaction cost reduction, and 20.1% CVaR decrease.',
                tech: ['Python', 'Execution Algos', 'Risk Mgmt'],
                link: 'https://github.com/shreejitverma/Adaptive-Volatility-Regime-Based-Execution-and-Risk-Framework'
              },
              {
                title: 'Statistical Arbitrage Reversal and Momentum Strategies',
                desc: 'Designed and backtested a 120-day volume-momentum-based crypto portfolio strategy, yielding a 155.76% annualized return and 1.94 Sharpe Ratio, significantly outperforming the Bitcoin benchmark.',
                tech: ['Quant Research', 'Backtesting', 'Alpha Gen'],
                link: "https://github.com/shreejitverma/Statistical-Arbitrage-Reversal-and-Momentum-Strategies"
                },
                {
                title: 'Financial Modelling using Stochastic Calculus',
                desc: 'Modeled asset prices & derivative strategies using Brownian Motion, GBM, Ito’s Lemma, Martingales, Girsanov’s Theorem, SDEs, Fokker–Planck and Kolmogorov equations for volatility and interest rates.',
                tech: ['Stochastic Calculus', 'Derivative Pricing', 'Python'],
                link: '#'
                },
                {
                title: 'Environmental Social Governance (ESG) Merger Arbitrage Strategy',
                desc: 'Developed the ESG Strategy, which was subsequently converted into a portfolio and embedded across all existing portfolios. Caters to the arbitrage opportunity from ESG scores on pre- and post-merger statistics.',
                tech: ['ESG', 'Arbitrage', 'Portfolio Strategy'],
                link: '#'
                },
                {
                title: 'Blockchain In Retail',
                desc: 'Developed a decentralized e-commerce platform to secure and streamline retail transactions with smart contracts, currency conversion, custom hashing, and matching algorithms.',
                tech: ['Blockchain', 'Smart Contracts', 'Solidity'],
                link: '#'
                },
                {
                title: 'QS Rank Predictor',
                desc: 'Constructed an ensemble machine learning model consisting of multiple Deep neural networks to predict QS World Ranking and provided suggestions on areas to improve.',
                tech: ['Deep Learning', 'Neural Networks', 'Predictive Modeling'],
                link: '#'
                }
                ].map((project, i) => (

              <a 
                key={i} 
                href={project.link}
                target='_blank'
                rel='noopener noreferrer'
                className='group p-8 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 block'
              >
                <div className='flex justify-between items-start mb-3'>
                  <h3 className='text-xl font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-primary transition-colors'>{project.title}</h3>
                  <Github className='w-5 h-5 text-muted-foreground/50 group-hover:text-cyan-600 dark:group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100' />
                </div>
                <p className='text-muted-foreground mb-6 text-sm leading-relaxed'>{project.desc}</p>
                <div className='flex flex-wrap gap-2'>
                  {project.tech.map((t, j) => (
                    <span key={j} className='px-3 py-1 text-xs font-mono rounded-full bg-card text-muted-foreground border border-border'>
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </Section>

        {/* Certifications & Awards */}
        <Section id='awards' title='Awards & Certifications' icon={<Award className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 gap-8'>
            <div className='p-6 rounded-2xl bg-muted/40 dark:bg-slate-900/30 border border-border'>
              <h3 className='text-lg font-bold text-foreground mb-4 flex items-center gap-2'>
                <Award className='w-5 h-5 text-yellow-600 dark:text-yellow-500' /> Awards
              </h3>
              <ul className='space-y-3 text-sm text-muted-foreground'>
                <li><strong className="text-slate-900 dark:text-slate-200">Global Recognition Gold Award</strong> (Bank of America) - Led enterprise-wide AI/ML campaign identifying 64 high-impact use cases; organized 4 large-scale events for 2500+ employees.</li>
                <li><strong className="text-slate-900 dark:text-slate-200">Global Recognition Silver Award</strong> (Bank of America, 2x) - For Total Return Swap Bonds contributions and in-house AI/ML framework.</li>
                <li><strong className="text-slate-900 dark:text-slate-200">1st Place</strong> - Vanguard ETF Trading Challenge (Personal Portfolio), 6th Place for the team portfolio.</li>
                <li><strong className="text-slate-900 dark:text-slate-200">State Rank Holder</strong> - International Science Olympiad & International Math Olympiad.</li>
                <li><strong className="text-slate-900 dark:text-slate-200">President</strong> - Stevens Graduate Financial Association.</li>
              </ul>
            </div>
            <div className='p-6 rounded-2xl bg-muted/40 dark:bg-slate-900/30 border border-border'>
              <h3 className='text-lg font-bold text-foreground mb-4 flex items-center gap-2'>
                <Cpu className='w-5 h-5 text-cyan-600 dark:text-cyan-500' /> Interests & Languages
              </h3>
              <div className='space-y-4 text-sm'>
                <div>
                  <h4 className='text-xs font-bold text-muted-foreground/50 uppercase tracking-wider mb-2'>Interests</h4>
                  <p className='text-muted-foreground'>Chess, Poker, F1, Martial Arts, Cricket, Boxing, Badminton, Reading, Cooking, Dancing, Psychology, History, Philosophy</p>
                </div>
                <div>
                  <h4 className='text-xs font-bold text-muted-foreground/50 uppercase tracking-wider mb-2'>Languages</h4>
                  <p className='text-muted-foreground'>
                    <span className='font-medium'>Fluent:</span> English, Hindi<br />
                    <span className='font-medium'>Intermediate:</span> French, Sanskrit, Spanish, Russian<br />
                    <span className='font-medium'>Beginner:</span> Chinese, Italian, Tamil, Punjabi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Certifications Section */}
        <Section id='certifications' title='Certifications' icon={<BookOpen className='w-6 h-6' />}>
          <div className='p-6 rounded-2xl bg-muted/40 dark:bg-slate-900/30 border border-border'>
            <div className='grid md:grid-cols-2 gap-8 text-sm text-muted-foreground'>
              <div>
                <h4 className='text-xs font-bold text-muted-foreground/50 uppercase tracking-wider mb-2'>Finance</h4>
                <ul className='space-y-1'>
                  <li><a href="http://basno.com/l2c3uqav" target="_blank" rel="noopener noreferrer" className="hover:text-primary">CFA Level 1</a></li>
                  <li><a href="https://portal.bloombergforeducation.com/certificates/8Nm9y3yx5b9yaWztgxSmewLD" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Bloomberg Market Certification (BMC)</a></li>
                  <li><a href="https://coursera.org/share/70b94743c090c143954cdcbe01ebf521" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Financial Engineering & Risk Mgmt Part I & II (Columbia)</a></li>
                  <li><a href="http://basno.com/cfbvwwwf" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Investment Foundations Program (CFA Institute)</a></li>
                  <li><a href="https://www.udemy.com/course/the-complete-financial-analyst-training-and-investing-course/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">The Complete Financial Analyst Training & Investing Course</a></li>
                  <li><a href="https://coursera.org/share/7a85fee31445a626d1212f7c2f55eeab" target="_blank" rel="noopener noreferrer" className="hover:text-primary">ML for Trading Specialization (Google Cloud/NYIF)</a></li>
                  <li><a href="https://www.coursera.org/specializations/investment-management" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Investment Management Specialization (Geneva/UBS)</a></li>
                  <li><a href="https://www.coursera.org/specializations/trading-strategy#courses" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Trading Strategies in Emerging Markets (ISB)</a></li>
                  <li><a href="https://coursera.org/share/abe2916c68432d5d156494c2f1f59b6d" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Finance & Quant Modeling for Analysts (Wharton)</a></li>
                  <li><a href="https://coursera.org/share/ad6c6e3574db71e2e38777b74b6af97f" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Corporate Finance and Valuation (NYU Stern/Damodaran)</a></li>
                </ul>
              </div>
              <div>
                <h4 className='text-xs font-bold text-muted-foreground/50 uppercase tracking-wider mb-2'>Computer Science</h4>
                <ul className='space-y-1'>
                  <li><a href="https://coursera.org/share/62c6f8a2d4a998dc4856249a1a937e17" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Deep Learning Specialization (Andrew Ng)</a></li>
                  <li><a href="https://coursera.org/share/a24e1310f62486c32f6a2393fa1240dc" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Applied Data Science with Python (Michigan)</a></li>
                  <li><a href="https://coursera.org/share/3ca9e040262f60d9c367379013a1e7c1" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Data Science Foundations using R (Johns Hopkins)</a></li>
                  <li><a href="https://www.coursera.org/specializations/data-science-statistics-machine-learning" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Data Science Statistics and ML (Johns Hopkins)</a></li>
                  <li><a href="https://coursera.org/share/e3c471b726d96029d683efcfec957692" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Big Data Specialization (UC San Diego)</a></li>
                  <li><a href="https://coursera.org/share/98a957a6518b5ca605f44f365df05151" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Data Structures and Algorithms Specialization</a></li>
                  <li><a href="https://www.coursera.org/learn/algorithms-part1" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Algorithms, Part I & II (Princeton)</a></li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* Books Preview */}
        <section id='books' className='py-20 max-w-7xl mx-auto px-6'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <BookOpen className='w-6 h-6 text-primary' />
                <h2 className='text-3xl font-bold text-foreground'>Essential Reading</h2>
              </div>
              <p className='text-muted-foreground max-w-2xl text-balance'>
                A curated collection of books that have influenced my trading philosophy and technical approach. From stochastic calculus to Eastern philosophy.
              </p>
            </div>
            <Link 
              href='/books' 
              className='px-6 py-3 bg-primary/10 text-primary font-semibold rounded-lg border border-primary/20 hover:bg-primary hover:text-slate-950 transition-all duration-300 w-fit'
            >
              View Full Reading List
            </Link>
          </div>
          
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 opacity-60'>
            {[
               { src: '/books/51lKgRQh1XL._SX346_BO1204203200_.jpg.webp', title: 'Chart Patterns' },
               { src: '/books/51pJPs1sMHL._SX320_BO1204203200_.jpg.webp', title: 'Trading in the Zone' },
               { src: '/books/51DLoxAJ68L._SX324_BO1204203200_.jpg.webp', title: 'Intelligent Investor' },
               { src: '/books/0071363483.01._SCLZZZZZZZ_SX500_.jpg', title: 'Technical Analysis' },
               { src: '/books/51zIH54q13L._SX346_BO1204203200_.jpg.webp', title: 'Super Trader' },
               { src: '/books/51rC1PZVJjL._SX328_BO1204203200_.jpg.webp', title: 'High Prob Trading' },
            ].map((book, i) => (
              <div key={i} className='aspect-[2/3] relative rounded-lg overflow-hidden border border-border grayscale hover:grayscale-0 transition-all'>
                <Image
                  src={book.src}
                  alt={book.title}
                  fill
                  className='object-cover'
                />
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Impact Section */}
        <Section id='impact' title='GitHub Impact' icon={<Github className='w-6 h-6' />}>
          <div className='space-y-8'>
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='p-4 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="/metrics/metrics.main.svg"
 
                  alt="GitHub Overview" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
              <div className='p-4 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all'>
                <EngineeringPhilosophy />
              </div>
            </div>
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='p-4 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="/metrics/metrics.activity.svg"
 
                  alt="Commit Activity" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
              <div className='p-4 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="/metrics/metrics.advanced.svg"
 
                  alt="Advanced Metrics" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
            </div>
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='p-4 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="/metrics/metrics.streak.svg"
 
                  alt="GitHub Streak" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
              <div className='p-4 rounded-2xl bg-card/40 dark:bg-card border border-border hover:border-primary/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="https://visitor-badge.laobi.icu/badge?page_id=shreejitverma" 
                  alt="Visitor Badge" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Contact */}
        <footer className='py-12 border-t border-border bg-background/80 backdrop-blur-sm'>
          <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='text-muted-foreground text-sm'>
              © {new Date().getFullYear()} Shreejit Verma. Built with Next.js & Tailwind.
            </div>
            <div className='flex gap-6'>
              <a href='mailto:shreejitverma@gmail.com' className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'>
                <Mail className='w-4 h-4' />
                <span>Contact Me</span>
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary transition-colors'>
                LinkedIn
              </a>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary transition-colors'>
                GitHub
              </a>
              <a href='https://scholar.google.com/citations?hl=en&user=qMzU8iAAAAAJ' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary transition-colors'>
                Scholar
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
