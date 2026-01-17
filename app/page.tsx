'use client';

import Image from 'next/image';
import Link from 'next/link';
import ProfileImage from './components/ProfileImage';
import Section from './components/Section';
import { 
  Github, Linkedin, Mail, Terminal, BookOpen, Briefcase, Code2, 
  GraduationCap, Award, Cpu 
} from 'lucide-react';

export default function Home() {
  return (
    <div className='relative min-h-screen bg-transparent text-slate-300 font-sans selection:bg-cyan-500/30 overflow-hidden'>
      {/* Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-slate-800/50 bg-slate-950/80'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='font-mono text-xl font-bold text-cyan-400 tracking-tighter'>
            SV<span className='text-slate-500'>.quant</span>
          </div>
          <div className='hidden md:flex gap-8 text-sm font-medium'>
            <a href='#about' className='hover:text-cyan-400 transition-colors'>About</a>
            <a href='#experience' className='hover:text-cyan-400 transition-colors'>Experience</a>
            <a href='#projects' className='hover:text-cyan-400 transition-colors'>Projects</a>
            <a href='#impact' className='hover:text-cyan-400 transition-colors'>Impact</a>
            <Link href='/books' className='hover:text-cyan-400 transition-colors'>Reading List</Link>
          </div>
          <div className='flex items-center gap-4'>
            <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='hover:text-cyan-400 transition-colors'>
              <Github className='w-5 h-5' />
            </a>
            <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='hover:text-cyan-400 transition-colors'>
              <Linkedin className='w-5 h-5' />
            </a>
            <a href='/Shreejit_Verma_Resume.pdf' target='_blank' rel="noopener noreferrer" className='px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded hover:bg-cyan-300 transition-colors'>
              RESUME
            </a>
          </div>
        </div>
      </nav>

      <main className='relative z-10'>
        {/* Hero Section */}
        <section className='pt-32 pb-20 px-6 max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='max-w-3xl flex-1'>
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
              <p className='text-xl text-slate-400 mb-8 max-w-2xl leading-relaxed'>
                Engineering high-performance trading systems and statistical models. 
                Specializing in low-latency infrastructure, algorithmic strategies, and financial engineering.
              </p>
              <div className='flex gap-4'>
                <a href='#experience' className='px-6 py-3 bg-slate-100 text-slate-950 font-semibold rounded hover:bg-slate-200 transition-colors'>
                  View Experience
                </a>
                <a href='#projects' className='px-6 py-3 border border-slate-700 text-slate-300 font-semibold rounded hover:border-cyan-500/50 hover:text-cyan-400 transition-colors'>
                  Key Projects
                </a>
              </div>
            </div>
            <div className='relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl shrink-0'>
              <ProfileImage 
                src="/Shreejit_Verma_profile_pic.jpg" 
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
                school: "Stevens Institute of Technology",
                degree: "Master of Science in Financial Engineering",
                date: "Aug 2024 – May 2026",
                gpa: "GPA: 3.968/4.0",
                details: "Coursework: Market Microstructure, Quantitative Hedge Fund Strategies, Algorithmic Trading Strategies, Multivariate Statistics."
              },
              {
                school: "Georgia Institute of Technology",
                degree: "Master of Science in Computer Science",
                date: "Aug 2024 – Dec 2025",
                gpa: "",
                details: "Specialization in Computing Systems. Coursework: High-Performance Computing, Distributed Computing, DBMS, Bayesian Statistics."
              },
              {
                school: "WorldQuant University",
                degree: "Master of Science in Financial Engineering",
                date: "Dec 2021 – May 2024",
                gpa: "GPA: 86%",
                details: "Coursework: Deep Learning for Finance, Financial Econometrics, Fixed Income, Portfolio Management, Risk Management."
              },
              {
                school: "Vellore Institute of Technology",
                degree: "Bachelor of Technology in Computer Science",
                date: "Jul 2014 – Sept 2018",
                gpa: "GPA: 8.78/10.0",
                details: "Coursework: Data Structures and Algorithms, Computer Networks, Reinforcement Learning, NLP."
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

        {/* Skills Section - Categorized */}
        <Section id='skills' title='Technical Arsenal' icon={<Cpu className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              {
                category: "Quantitative Finance",
                skills: "Stochastic Calculus, Derivative Pricing, Time Series Analysis, Factor Modeling, Greeks, Risk Management"
              },
              {
                category: "Mathematics & Stats",
                skills: "Probability, PDE, Linear Algebra, Markov Chains, Bayesian Statistics, Numerical Methods"
              },
              {
                category: "Programming",
                skills: "Python, C++, C, Java, R, MATLAB, KDB+/Q, JavaScript, Verilog, VHDL"
              },
              {
                category: "Machine Learning",
                skills: "TensorFlow, PyTorch, Scikit-learn, XGBoost, RNN, LSTM, Random Forest, Clustering"
              },
              {
                category: "Data Engineering",
                skills: "Spark, Hadoop, Kafka, Airflow, PostgreSQL, MongoDB, Redis, ZeroMQ"
              },
              {
                category: "Systems & DevOps",
                skills: "Docker, Kubernetes, AWS, GCP, Linux, Git, Jenkins, Ansible, CI/CD"
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

        {/* Experience Section */}
        <Section id='experience' title='Professional Experience' icon={<Briefcase className='w-6 h-6' />}>
          <div className='space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent'>
            
            {/* LogiNext */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-cyan-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-cyan-500 rounded-full animate-pulse'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-slate-100'>LogiNext Solutions Inc.</h3>
                  <span className='text-xs font-mono text-cyan-400'>Mar 2023 – Jun 2025</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>Senior Software Engineer Analytics</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Architected Map Construction & Routing Algorithms solving nested NP-Hard problems using Constraint Programming (PostGIS, MongoDB).</li>
                  <li>Led a team of 12 to develop a high-performance geospatial mapping application.</li>
                  <li>Built a Large Language Model (LLM) for internal query resolution, improving efficiency by <strong className="text-slate-300">80%</strong>.</li>
                  <li>Engineered ELK stack pipeline for proactive error detection and log analysis.</li>
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
                  <h3 className='font-bold text-slate-100'>Versor Investments</h3>
                  <span className='text-xs font-mono text-slate-500'>Feb 2022 – Oct 2022</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>Quantitative Developer</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Managed <strong className="text-slate-300">$8.5 Billion AUM</strong> across Merger Arbitrage and Stock Selection portfolios.</li>
                  <li>Backtested systematic strategies yielding a <strong className="text-slate-300">15% improvement</strong> in alpha capture.</li>
                  <li>Deployed scalable ML pipelines increasing trade execution efficiency by <strong className="text-slate-300">29%</strong>.</li>
                  <li>Built ESG-focused portfolio strategies capitalizing on arbitrage opportunities.</li>
                </ul>
              </div>
            </div>

            {/* BoA */}
            <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:border-cyan-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                <div className='w-3 h-3 bg-slate-600 rounded-full'></div>
              </div>
              <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                  <h3 className='font-bold text-slate-100'>Bank of America</h3>
                  <span className='text-xs font-mono text-slate-500'>Jun 2018 – Jul 2021</span>
                </div>
                <div className='text-sm text-slate-400 mb-4 font-medium'>Senior Software Engineer (FICC)</div>
                <ul className='list-disc list-outside ml-4 text-sm text-slate-400 space-y-2 marker:text-slate-600'>
                  <li>Engineered Python services for QUARTZ trade processing.</li>
                  <li>Integrated C++ pipelines in SANDRA, reducing trade processing latency by <strong className="text-slate-300">50%</strong>.</li>
                  <li>Led migration of 1M+ lines of code to Python 3.8, boosting efficiency by <strong className="text-slate-300">40%</strong>.</li>
                  <li>Architected ML/AI platform increasing decision-making accuracy by <strong className="text-slate-300">67%</strong>.</li>
                </ul>
              </div>
            </div>

          </div>
        </Section>

        {/* Projects Section */}
        <Section id='projects' title='Key Projects' icon={<Code2 className='w-6 h-6' />}>
          <div className='grid md:grid-cols-2 gap-6'>
            {[
              {
                title: 'AI-Integrated FPGA for Market Making',
                desc: 'Engineering a sub-10µs trading platform with custom-built limit order book, FPGA market data handlers, and kernel bypass (DPDK) for deterministic execution.',
                tech: ['FPGA', 'C++', 'Verilog', 'HFT'],
                link: 'https://github.com/shreejitverma/trishul-ultra-hft-project'
              },
              {
                title: 'Adaptive Volatility Regime Execution',
                desc: 'Developed a regime-switching framework dynamically selecting between passive, TWAP, and aggressive strategies. Achieved 20% increase in Sharpe Ratio.',
                tech: ['Python', 'ML', 'Algo Trading'],
                link: 'https://github.com/shreejitverma/Adaptive-Volatility-Regime-Based-Execution-and-Risk-Framework'
              },
              {
                title: 'Statistical Arbitrage Reversal Strategies',
                desc: 'Designed volume-momentum-based crypto portfolio strategy yielding 155.76% annualized return and 1.94 Sharpe Ratio.',
                tech: ['Quant Research', 'Python', 'Crypto'],
                link: 'https://github.com/shreejitverma/Statistical-Arbitrage-Reversal-and-Momentum-Strategies'
              },
              {
                title: 'Dynamic Portfolio Optimization',
                desc: 'Built real-time portfolio optimization system using convex/non-convex methods, enhancing risk-adjusted returns via adaptive asset rebalancing.',
                tech: ['Optimization', 'Python', 'Risk Mgmt'],
                link: 'https://github.com/shreejitverma/Dynamic-Portfolio-Optimization'
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
                <li><strong className="text-slate-200">Global Recognition Gold Award</strong> (Bank of America) - Led enterprise-wide AI/ML campaign.</li>
                <li><strong className="text-slate-200">Global Recognition Silver Award</strong> (Bank of America, 2x) - For Total Return Swap Bonds contributions.</li>
                <li><strong className="text-slate-200">1st Place</strong> - Vanguard ETF Trading Challenge.</li>
                <li><strong className="text-slate-200">State Rank Holder</strong> - International Science Olympiad & Math Olympiad.</li>
              </ul>
            </div>
            <div className='p-6 rounded-2xl bg-slate-900/30 border border-slate-800'>
              <h3 className='text-lg font-bold text-slate-100 mb-4 flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-cyan-500' /> Certifications
              </h3>
              <ul className='space-y-3 text-sm text-slate-400'>
                <li>CFA Level 1</li>
                <li>Bloomberg Market Certification</li>
                <li>Financial Engineering & Risk Management (Columbia/Coursera)</li>
                <li>Machine Learning for Trading Specialization (Google Cloud/NY Institute of Finance)</li>
                <li>Deep Learning Specialization (Andrew Ng/Coursera)</li>
              </ul>
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
              <p className='text-slate-400 max-w-2xl'>
                A curated collection of books that have influenced my trading philosophy and technical approach. From stochastic calculus to Eastern philosophy.
              </p>
            </div>
            <Link 
              href='/books' 
              className='px-6 py-3 bg-cyan-500/10 text-cyan-400 font-semibold rounded-lg border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 transition-all duration-300'
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
                  src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Fshreejitverma%2Fshreejitverma&label=VISITORS&countColor=%232ccce4&style=flat-square" 
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
