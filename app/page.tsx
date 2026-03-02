'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileImage from './components/ProfileImage';
import Section from './components/Section';
import { 
  Github, Linkedin, Mail, Terminal, BookOpen, Briefcase, Code2, 
  GraduationCap, Award, Cpu, Menu, X 
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
    <div className='relative min-h-screen bg-transparent text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden'>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'backdrop-blur-md border-slate-800/50 bg-slate-950/80 h-16' : 'bg-transparent border-transparent h-20'
      }`}>
        <div className='max-w-7xl mx-auto px-6 h-full flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative w-10 h-10 rounded-full overflow-hidden border border-slate-700 shadow-lg shrink-0'>
              <Image 
                src="/images/user-profile.png" 
                alt="Shreejit Verma" 
                fill
                className='object-cover'
              />
            </div>
            <div className='font-mono text-xl font-bold text-cyan-400 tracking-tighter'>
              SV<span className='text-slate-500'>.quant</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className='hidden lg:flex gap-8 text-sm font-medium'>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className='hover:text-cyan-400 transition-colors'>
                {link.name}
              </a>
            ))}
            <Link href='/books' className='hover:text-cyan-400 transition-colors'>Reading List</Link>
          </div>

          <div className='flex items-center gap-4'>
            <div className='hidden sm:flex items-center gap-4 mr-2'>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='hover:text-cyan-400 transition-colors'>
                <Github className='w-5 h-5' />
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='hover:text-cyan-400 transition-colors'>
                <Linkedin className='w-5 h-5' />
              </a>
            </div>
            <a href='/Shreejit Verma Resume.pdf' target='_blank' rel="noopener noreferrer" className='px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20'>
              RESUME
            </a>
            
            {/* Mobile Menu Button */}
            <button 
              className='lg:hidden text-slate-300 hover:text-cyan-400 transition-colors'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}>
          <div className='flex flex-col p-6 gap-4'>
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className='text-lg font-medium hover:text-cyan-400 transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link 
              href='/books' 
              className='text-lg font-medium hover:text-cyan-400 transition-colors'
              onClick={() => setIsMenuOpen(false)}
            >
              Reading List
            </Link>
            <div className='flex gap-6 mt-2 pt-4 border-t border-slate-800'>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='text-slate-400 hover:text-cyan-400'>
                <Github className='w-6 h-6' />
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='text-slate-400 hover:text-cyan-400'>
                <Linkedin className='w-6 h-6' />
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
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-6 border border-cyan-500/20'>
                <Terminal className='w-3 h-3' />
                <span>SYSTEM_READY</span>
              </div>
              <h1 className='text-5xl md:text-7xl font-bold text-slate-100 mb-6 tracking-tight'>
                Quantitative <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>
                  Developer & Researcher
                </span>
              </h1>
              <p className='text-xl text-slate-400 mb-8 max-w-2xl leading-relaxed mx-auto md:mx-0'>
                Engineering high-performance trading systems and statistical models. 
                Specializing in low-latency infrastructure, algorithmic strategies, and financial engineering.
              </p>
              <div className='flex flex-wrap justify-center md:justify-start gap-4'>
                <a href='#experience' className='px-6 py-3 bg-slate-100 text-slate-950 font-semibold rounded hover:bg-slate-200 transition-colors'>
                  View Experience
                </a>
                <a href='#projects' className='px-6 py-3 border border-slate-700 text-slate-300 font-semibold rounded hover:border-cyan-500/50 hover:text-cyan-400 transition-colors'>
                  Key Projects
                </a>
              </div>
            </div>
            <div className='relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl shrink-0 order-first md:order-last'>
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
                gpa: "GPA: 3.968/4.0",
                details: "Coursework: Market Microstructure, Quantitative Hedge Fund Strategies, Algorithmic Trading Strategies, Multivariate Statistics."
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
              <div key={i} className='p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-slate-100'>{edu.school}</h3>
                  <span className='text-xs font-mono text-cyan-400 whitespace-nowrap ml-2'>{edu.date}</span>
                </div>
                <div className='text-sm text-slate-300 font-medium mb-1'>{edu.degree}</div>
                {edu.gpa && <div className='text-xs text-cyan-500 mb-3 font-mono'>{edu.gpa}</div>}
                <p className='text-sm text-slate-400'>{edu.details}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Experience Section */}
        <Section id='experience' title='Professional Experience' icon={<Briefcase className='w-6 h-6' />}>
          <div className='space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent'>
            
            {/* BNP Paribas */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-cyan-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-cyan-500 rounded-full animate-pulse'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-slate-100'><a href="https://cib.bnpparibas/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">BNP Paribas CIB</a></h3>
                  <span className='text-xs font-mono text-cyan-400'>Feb 2026 – Present</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>C++ Quantitative Developer (Automated Market Making)</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Developing high-performance C++ trading systems with FPGA for Automated Market Making strategies at BNP Paribas CIB.</li>
                  <li>Collaborating with front-office to optimize latency and enhance execution performance in a hybrid on-site trading environment.</li>
                </ul>
              </div>
            </div>

            {/* LogiNext */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-cyan-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-slate-600 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-slate-100'><a href="https://loginextsolutions.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">LogiNext Solutions Inc.</a></h3>
                  <span className='text-xs font-mono text-cyan-400'>Mar 2023 – Jun 2025</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>Senior Software Engineer Analytics</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Designed and implemented **Map Construction and Routing Algorithms** to solve complex NP-hard problems.</li>
                  <li>Built a **Large Language Model (LLM)** for internal development and bug query resolution, reducing issue resolution time by 80%.</li>
                  <li>Led a team of 12 to develop a high-performance **geospatial mapping application** using PostGIS, MongoDB, and AWS.</li>
                </ul>
              </div>
            </div>

            {/* Versor */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-cyan-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-slate-600 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-slate-100'><a href="https://versorinvest.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Versor Investments</a></h3>
                  <span className='text-xs font-mono text-slate-500'>Feb 2022 – Oct 2022</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>Quantitative Developer</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Developed ML-driven **Order and Execution Management Systems**, improving trade execution efficiency by 20%.</li>
                  <li>Backtested and deployed **systematic merger arbitrage strategies**, increasing alpha capture by 15%.</li>
                  <li>Engineered **risk-adjusted return models** for optimizing portfolio risk exposure and factor analysis.</li>
                  <li>Managed a combined **AUM of $8.5 Billion** across merger arbitrage and stock selection portfolios.</li>
                </ul>
              </div>
            </div>

            {/* BoA 1 */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-cyan-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-slate-600 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-slate-100'><a href="https://www.bankofamerica.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Bank of America</a></h3>
                  <span className='text-xs font-mono text-slate-500'>Jan 2020 – Jul 2021</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>Senior Software Engineer (FICC)</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Engineered Python-based trading services to enhance the storage, processing, matching, and execution of trades on QUARTZ.</li>
                  <li>Integrated C++ pipelines to store trades in the object-oriented database SANDRA, reducing trade processing latency by <strong className="text-slate-300">50%</strong>.</li>
                  <li>Led migration of 1 million+ lines of code to Python 3.8, enhancing system scalability and execution efficiency by <strong className="text-slate-300">40%</strong>.</li>
                </ul>
              </div>
            </div>

            {/* BoA 2 */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-cyan-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-slate-600 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-slate-100'>Bank of America</h3>
                  <span className='text-xs font-mono text-slate-500'>Jun 2018 – Dec 2019</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>Senior Tech Associate (Data Analysis and Insight Technology)</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Architected and developed an ML/AI platform to deploy predictive models, increasing decision-making accuracy by <strong className="text-slate-300">67%</strong>.</li>
                  <li>Designed machine learning models for data validation rules prediction, reducing close to <strong className="text-slate-300">36 Full-Time Equivalents (FTEs)</strong>.</li>
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
              <div key={i} className='p-6 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <h3 className='text-lg font-semibold text-slate-100 mb-3'>{group.category}</h3>
                <div className='flex flex-wrap gap-2'>
                  {group.skills.split(', ').map((skill, j) => (
                    <span key={j} className='px-2 py-1 text-xs font-mono rounded bg-slate-900 text-slate-400 border border-slate-800'>
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
              <div key={i} className='p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-slate-100'>{res.title}</h3>
                  <span className='text-xs font-mono text-cyan-400 whitespace-nowrap ml-2'>{res.date}</span>
                </div>
                <div className='text-sm text-slate-300 font-medium mb-3'>{res.subtitle}</div>
                <p className='text-sm text-slate-400 mb-4'>{res.details}</p>
                {res.link && (
                  <a href={res.link} target='_blank' rel='noopener noreferrer' className='text-xs font-mono text-cyan-500 hover:underline'>
                    VIEW_ON_GITHUB
                  </a>
                )}
              </div>
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
                link: 'https://github.com/shreejitverma/Statistical-Arbitrage-Reversal-and-Momentum-Strategies'
              },
              {
                title: 'Financial Modelling: Stochastic Calculus',
                desc: 'Modeled asset prices & derivative strategies using Brownian Motion, GBM, Ito\'s Lemma, Martingales, Girsanov\'s Theorem. Applied SDEs, Fokker-Planck and Kolmogorov forward/backward equations, Ornstein-Uhlenbeck mean-reverting processes.',
                tech: ['Stochastic Calculus', 'Derivative Pricing', 'SDEs'],
                link: '#'
              },
              {
                title: 'Environmental Social Governance (ESG) Merger Arbitrage Strategy',
                desc: 'Developed the ESG Strategy that was further converted to a portfolio and embedded in all the existing portfolio. It caters to the arbitrage opportunity being made by the effect of ESG scores on target and acquirer pre- and post-merger statistics.',
                tech: ['Merger Arbitrage', 'ESG', 'Strategy'],
                link: '#'
              },
              {
                title: 'Blockchain In Retail',
                desc: 'Decentralized e-commerce platform with smart contracts, currency conversion, and matching algorithms using Ethereum/Solidity, Truffle, MetaMask, Ganache, GETH, Solc, Puppeth.',
                tech: ['Blockchain', 'Solidity', 'Smart Contracts'],
                link: '#'
              },
              {
                title: 'QS Rank Predictor',
                desc: 'Constructed ensemble machine learning model consisting of multiple deep neural networks to predict QS World Ranking, helping in achieving a world ranking of 301 - 400 for the VIT CS in 2020.',
                tech: ['Deep Learning', 'Neural Networks', 'Python'],
                link: '#'
              }
            ].map((project, i) => (
              <a 
                key={i} 
                href={project.link}
                target='_blank'
                rel='noopener noreferrer'
                className='group p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 block'
              >
                <div className='flex justify-between items-start mb-3'>
                  <h3 className='text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors'>{project.title}</h3>
                  <Github className='w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100' />
                </div>
                <p className='text-slate-400 mb-6 text-sm leading-relaxed'>{project.desc}</p>
                <div className='flex flex-wrap gap-2'>
                  {project.tech.map((t, j) => (
                    <span key={j} className='px-3 py-1 text-xs font-mono rounded-full bg-slate-900 text-slate-400 border border-slate-800'>
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
            <div className='p-6 rounded-2xl bg-slate-900/30 border border-slate-800'>
              <h3 className='text-lg font-bold text-slate-100 mb-4 flex items-center gap-2'>
                <Award className='w-5 h-5 text-yellow-500' /> Awards
              </h3>
              <ul className='space-y-3 text-sm text-slate-400'>
                <li><strong className="text-slate-200">Global Recognition Gold Award</strong> (Bank of America) - Led enterprise-wide AI/ML campaign identifying 64 high-impact use cases.</li>
                <li><strong className="text-slate-200">Global Recognition Silver Award</strong> (Bank of America, 2x) - For Total Return Swap Bonds contributions and AI/ML framework.</li>
                <li><strong className="text-slate-200">1st Place</strong> - Vanguard ETF Trading Challenge (Personal Portfolio), 6th Place for the team portfolio.</li>
                <li><strong className="text-slate-200">State Rank Holder</strong> - International Science Olympiad & International Math Olympiad.</li>
                <li><strong className="text-slate-200">President</strong> - Stevens Graduate Financial Association.</li>
              </ul>
            </div>
            <div className='p-6 rounded-2xl bg-slate-900/30 border border-slate-800'>
              <h3 className='text-lg font-bold text-slate-100 mb-4 flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-cyan-500' /> Certifications
              </h3>
              <div className='grid grid-cols-1 gap-4 text-sm text-slate-400'>
                <div>
                  <h4 className='text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>Finance</h4>
                  <ul className='space-y-1'>
                    <li>CFA Level 1</li>
                    <li>Bloomberg Market Concepts (BMC)</li>
                    <li><a href="https://www.coursera.org/specializations/financial-engineering" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Financial Engineering & Risk Mgmt Part I & II (Columbia)</a></li>
                    <li><a href="http://basno.com/cfbvwwwf" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Investment Foundations Program (CFA Institute)</a></li>
                    <li><a href="https://www.udemy.com/course/the-complete-financial-analyst-training-and-investing-course/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">The Complete Financial Analyst Training & Investing Course</a></li>
                    <li><a href="https://coursera.org/share/7a85fee31445a626d1212f7c2f55eeab" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">ML for Trading Specialization (Google Cloud/NYIF)</a></li>
                    <li><a href="https://www.coursera.org/specializations/investment-management" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Investment Management Specialization (Geneva/UBS)</a></li>
                    <li><a href="https://www.coursera.org/specializations/trading-strategy#courses" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Trading Strategies in Emerging Markets (ISB)</a></li>
                    <li><a href="https://coursera.org/share/abe2916c68432d5d156494c2f1f59b6d" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Finance & Quant Modeling for Analysts (Wharton)</a></li>
                    <li><a href="https://coursera.org/share/ad6c6e3574db71e2e38777b74b6af97f" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Corporate Finance and Valuation (NYU Stern/Damodaran)</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className='text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>Computer Science</h4>
                  <ul className='space-y-1'>
                    <li><a href="https://coursera.org/share/62c6f8a2d4a998dc4856249a1a937e17" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Deep Learning Specialization (Andrew Ng)</a></li>
                    <li><a href="https://coursera.org/share/a24e1310f62486c32f6a2393fa1240dc" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Applied Data Science with Python (Michigan)</a></li>
                    <li><a href="https://coursera.org/share/3ca9e040262f60d9c367379013a1e7c1" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Data Science Foundations using R (Johns Hopkins)</a></li>
                    <li><a href="https://coursera.org/share/e3c471b726d96029d683efcfec957692" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Big Data Specialization (UC San Diego)</a></li>
                    <li><a href="https://coursera.org/share/98a957a6518b5ca605f44f365df05151" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Data Structures and Algorithms Specialization</a></li>
                    <li><a href="https://www.coursera.org/learn/algorithms-part1" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Algorithms, Part I & II (Princeton)</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Books Preview */}
        <section id='books' className='py-20 max-w-7xl mx-auto px-6'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <BookOpen className='w-6 h-6 text-cyan-400' />
                <h2 className='text-3xl font-bold text-slate-100'>Essential Reading</h2>
              </div>
              <p className='text-slate-400 max-w-2xl text-balance'>
                A curated collection of books that have influenced my trading philosophy and technical approach. From stochastic calculus to Eastern philosophy.
              </p>
            </div>
            <Link 
              href='/books' 
              className='px-6 py-3 bg-cyan-500/10 text-cyan-400 font-semibold rounded-lg border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 transition-all duration-300 w-fit'
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
              <div key={i} className='aspect-[2/3] relative rounded-lg overflow-hidden border border-slate-800 grayscale hover:grayscale-0 transition-all'>
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
              <div className='p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="https://raw.githubusercontent.com/shreejitverma/shreejitverma/metrics/metrics.main.svg" 
                  alt="GitHub Overview" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
              <div className='p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="https://raw.githubusercontent.com/shreejitverma/shreejitverma/metrics/metrics.habits.svg" 
                  alt="Coding Habits" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
            </div>
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="https://raw.githubusercontent.com/shreejitverma/shreejitverma/metrics/metrics.activity.svg" 
                  alt="Commit Activity" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
              <div className='p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="https://raw.githubusercontent.com/shreejitverma/shreejitverma/metrics/metrics.advanced.svg" 
                  alt="Advanced Metrics" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
            </div>
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-center overflow-hidden'>
                <img 
                  src="https://raw.githubusercontent.com/shreejitverma/shreejitverma/metrics/metrics.streak.svg" 
                  alt="GitHub Streak" 
                  className='max-w-full h-auto rounded-lg'
                  loading="lazy"
                />
              </div>
              <div className='p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-center overflow-hidden'>
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
        <footer className='py-12 border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm'>
          <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='text-slate-500 text-sm'>
              © {new Date().getFullYear()} Shreejit Verma. Built with Next.js & Tailwind.
            </div>
            <div className='flex gap-6'>
              <a href='mailto:shreejitverma@gmail.com' className='flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors'>
                <Mail className='w-4 h-4' />
                <span>Contact Me</span>
              </a>
              <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='text-slate-400 hover:text-cyan-400 transition-colors'>
                LinkedIn
              </a>
              <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='text-slate-400 hover:text-cyan-400 transition-colors'>
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
