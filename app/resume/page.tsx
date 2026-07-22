import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Mail, Github, Linkedin, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Resume | Quantitative Developer, Quantitative Researcher & Quantitative Trading Engineer',
  description:
    'Resume of Shreejit Verma - Quantitative Developer, Quantitative Researcher, and Quantitative Trading Engineer in New York. C++ automated market making at BNP Paribas, FPGA/DPDK sub-10us trading systems, statistical arbitrage, merger arbitrage, and ML-driven alpha research.',
  alternates: {
    canonical: 'https://www.shreejitverma.com/resume',
  },
  openGraph: {
    title: 'Shreejit Verma | Resume - Quantitative Developer & Quantitative Researcher',
    description:
      'C++ low-latency market making, FPGA/DPDK trading systems, statistical arbitrage, and ML-driven alpha research. Full resume with experience, education, projects, and certifications.',
    url: 'https://www.shreejitverma.com/resume',
    type: 'profile',
  },
};

const experience = [
  {
    company: 'BNP Paribas CIB',
    url: 'https://cib.bnpparibas/',
    role: 'C++ Quantitative Developer (Co-op), Automated Market Making',
    location: 'New York, USA',
    dates: 'Feb 2026 - May 2026',
    bullets: [
      'Built low-latency components of the automated market-making stack for the Prime Credit Market (average $500M of daily market-making volume), spanning real-time market-data ingestion, tick analytics, and pricing/execution paths.',
      'Profiled and optimized the software hot path feeding FPGA-accelerated market-data handlers and quoting engines.',
      'Integrated secure on-premise LLM tooling with Git/Jira/Confluence to automate code, testing, and documentation workflows.',
    ],
  },
  {
    company: 'LogiNext Solutions Inc.',
    url: 'https://loginextsolutions.com/',
    role: 'Senior Software Engineer, Analytics',
    location: 'Mumbai, India',
    dates: 'Mar 2023 - Jul 2024',
    bullets: [
      'Architected Map Construction, Map Routing, and Rich Vehicle Routing algorithms (3 nested NP-Hard problems) using CP-SAT constraint programming and convex optimization over PostGIS, MongoDB, and S3.',
      'Led a 12-engineer team delivering a high-throughput geospatial mapping application platform.',
      'Built an LLM-powered debugging and query-resolution tool used company-wide, cutting mean bug-resolution time by 80%.',
    ],
  },
  {
    company: 'Versor Investments (QR Systems LLP)',
    url: 'https://versorinvest.com/',
    role: 'Quantitative Developer, Merger Arbitrage and Stock Selection Portfolio',
    location: 'Mumbai, India',
    dates: 'Feb 2022 - Oct 2022',
    bullets: [
      'Developed and backtested systematic merger-arbitrage strategies for an $8.5 Billion AUM fund, improving alpha capture by 15%.',
      'Built and deployed ML pipelines for Order and Execution Management Systems, increasing trade execution efficiency by 29%.',
      'Designed an ESG-driven merger-arbitrage signal capitalizing on pre- and post-merger statistics.',
    ],
  },
  {
    company: 'Bank of America',
    url: 'https://www.bankofamerica.com/',
    role: 'Senior Software Engineer, Fixed Income Commodities and Currencies (FICC)',
    location: 'Chennai, India',
    dates: 'Jan 2020 - Jul 2021',
    bullets: [
      'Engineered Python-based trading services enhancing storage, processing, matching, and execution of trades on QUARTZ.',
      'Integrated C++ pipelines to store trades in the object-oriented database SANDRA, reducing trade processing latency by 50%.',
      'Led the migration of 1 million+ lines of code to Python 3.8, enhancing scalability and execution efficiency by 40%.',
    ],
  },
  {
    company: 'Bank of America',
    url: 'https://www.bankofamerica.com/',
    role: 'Senior Tech Associate, Data Analysis and Insight Technology',
    location: 'Chennai, India',
    dates: 'Jun 2018 - Dec 2019',
    bullets: [
      'Architected and developed an ML/AI platform to deploy predictive models, increasing decision-making accuracy by 67%.',
      'Designed machine learning models for data validation rules prediction, reducing workload by close to 36 Full-Time Equivalents (FTEs).',
    ],
  },
];

const education = [
  {
    school: 'Georgia Institute of Technology (Online)',
    degree: 'M.S. in Computer Science, Specialization in Computing Systems',
    dates: 'Aug 2024 - Expected Dec 2026',
  },
  {
    school: 'Stevens Institute of Technology',
    degree: 'M.S. in Financial Engineering, GPA 3.974/4.0',
    dates: 'Aug 2024 - May 2026',
  },
  {
    school: 'WorldQuant University',
    degree: 'M.S. in Financial Engineering, GPA 86%',
    dates: 'Dec 2021 - May 2024',
  },
  {
    school: 'Carnegie Mellon University, Tepper School of Business',
    degree: 'M.S. in Computational Finance (program withdrawn due to father’s illness)',
    dates: 'Aug 2021 - Oct 2021',
  },
  {
    school: 'Vellore Institute of Technology',
    degree: 'B.Tech in Computer Science and Engineering, GPA 8.78/10.0',
    dates: 'Jul 2014 - Sept 2018',
  },
];

const projects = [
  {
    name: 'AI-Integrated FPGA for Market Making in Volatile Environments (MS Thesis, Stevens)',
    url: 'https://github.com/shreejitverma/trishul-ultra-hft-project',
    dates: 'Oct 2025 - May 2026',
    detail:
      'Sub-10us low-latency trading system with a custom-built limit order book, FPGA market data handlers, kernel bypass (DPDK), hardware timestamping, and lock-free data structures for deterministic, microsecond-level execution.',
  },
  {
    name: 'Sovereign AI Command Center',
    url: 'https://github.com/shreejitverma/srijan',
    dates: 'May 2026 - Jul 2026',
    detail:
      'Local-first, autonomous agentic AI platform orchestrating LLM providers behind a unified API with MCP tool-calling, RAG and persistent semantic memory on ChromaDB, and hardware-aware deployment of quantized open-weight models.',
  },
  {
    name: 'Plug-and-Play Agentic AI Engineering Harness',
    url: 'https://github.com/shreejitverma/dotfiles-nix',
    dates: 'May 2026 - Jul 2026',
    detail:
      'Cross-platform agentic AI developer platform on NixOS with declarative configuration, multi-agent orchestration, isolated Git worktrees, autonomous task execution, and CI-gated shipping.',
  },
  {
    name: 'Adaptive Volatility Regime-Based Execution and Risk Framework',
    url: 'https://github.com/shreejitverma/Adaptive-Volatility-Regime-Based-Execution-and-Risk-Framework',
    dates: 'Sept 2025 - Dec 2025',
    detail:
      'Adaptive volatility regime-switching framework selecting among passive, TWAP, and aggressive execution: +20.0% Sharpe Ratio, -6.1% transaction costs, -20.1% CVaR.',
  },
  {
    name: 'Statistical Arbitrage Reversal and Momentum Strategies (Quant Researcher, WallStreetQuants)',
    url: 'https://github.com/shreejitverma/Statistical-Arbitrage-Reversal-and-Momentum-Strategies',
    dates: 'Jun 2025 - Aug 2025',
    detail:
      '120-day volume-momentum crypto portfolio strategy: 155.76% annualized return and 1.94 Sharpe Ratio post transaction costs, outperforming the Bitcoin buy-and-hold benchmark.',
  },
  {
    name: 'Dynamic Portfolio Optimization (MS Thesis, WorldQuant University)',
    url: 'https://github.com/shreejitverma/Dynamic-Portfolio-Optimization',
    dates: 'Mar 2024 - Jun 2024',
    detail:
      'Real-time portfolio optimization with convex and non-convex methods, adaptive rebalancing, and multi-factor modeling across interest rate, FX, credit, and market risks.',
  },
];

const skills = [
  {
    label: 'Mathematics & Statistics',
    items: 'Probability, Stochastic Calculus, Differential Equations, PDE, Linear Algebra, Numerical Methods, Markov Chains',
  },
  {
    label: 'Quantitative Finance',
    items: 'Statistical Analysis, Derivative Pricing, Time Series Analysis, Factor Modeling, Predictive Modeling, Greeks, Market Microstructure',
  },
  {
    label: 'Machine Learning',
    items: 'Linear Regression, Clustering, Random Forest, XGBoost, RNN, LSTM, Deep Learning, Neural Networks, NLP, LLMs',
  },
  {
    label: 'Programming',
    items: 'C++ (17/20/23, primary), Python, C, Java, R, MATLAB, NumPy, Pandas, Polars, SciPy, PyTorch, TensorFlow, Scikit-learn, QuantLib, CVXPY, OpenMP, MPI, CUDA, Bash',
  },
  {
    label: 'Data Engineering',
    items: 'Airflow, Dask, Spark, PySpark, FastAPI, Kafka, Flink, SQL, KDB+/Q, PostgreSQL, MongoDB, ZeroMQ, Cassandra, Redis, Hadoop',
  },
  {
    label: 'Systems & Low Latency',
    items: 'TCP/IP, UDP, Multicast, cache and multithreading optimization, FPGA (Verilog, VHDL), kernel bypass (DPDK), lock-free data structures',
  },
  {
    label: 'Cloud & DevOps',
    items: 'Linux, Git, Jenkins, CI/CD, Ansible, Docker, Kubernetes, Helm, AWS, GCP',
  },
];

const achievements = [
  '1st Place, Vanguard ETF Trading Challenge (personal portfolio)',
  'President, Stevens Graduate Financial Association',
  'Beta Gamma Sigma Member',
  'Global Recognition Gold Award, Bank of America',
  'Global Recognition Silver Award, Bank of America (2x)',
  'State Rank Holder, International Science Olympiad and International Mathematics Olympiad',
  'CFA Level 1',
];

export default function ResumePage() {
  return (
    <main className='relative z-10 max-w-4xl mx-auto px-6 py-20 text-muted-foreground'>
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-3'>Shreejit Verma</h1>
        <p className='text-lg text-foreground font-medium mb-4'>
          Quantitative Developer | Quantitative Researcher | Quantitative Trading Engineer
        </p>
        <p className='text-sm mb-6'>New York, NY, USA</p>
        <div className='flex flex-wrap gap-4 text-sm'>
          <a
            href='/Shreejit_Verma_Resume.pdf'
            className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 font-semibold rounded hover:bg-primary/20 transition-colors'
          >
            <Download className='w-4 h-4' />
            Download PDF
          </a>
          <a href='mailto:shreejitverma@gmail.com' className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
            <Mail className='w-4 h-4' /> shreejitverma@gmail.com
          </a>
          <a href='https://github.com/shreejitverma' target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
            <Github className='w-4 h-4' /> GitHub
          </a>
          <a href='https://www.linkedin.com/in/shreejitverma/' target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
            <Linkedin className='w-4 h-4' /> LinkedIn
          </a>
          <Link href='/' className='inline-flex items-center gap-2 hover:text-primary transition-colors'>
            <Globe className='w-4 h-4' /> shreejitverma.com
          </Link>
        </div>
      </header>

      <section aria-labelledby='resume-summary' className='mb-12'>
        <h2 id='resume-summary' className='text-2xl font-bold text-foreground mb-4'>Summary</h2>
        <p className='leading-relaxed'>
          Quantitative Developer and Researcher engineering ultra-low latency trading infrastructure and
          alpha-generating strategies for hedge funds, proprietary trading, and high frequency trading
          environments. Most recently built C++ automated market-making components at BNP Paribas CIB for the
          Prime Credit Market; previously developed systematic merger-arbitrage strategies at an $8.5B AUM fund
          and FICC trading services at Bank of America.
        </p>
      </section>

      <section aria-labelledby='resume-experience' className='mb-12'>
        <h2 id='resume-experience' className='text-2xl font-bold text-foreground mb-6'>Professional Experience</h2>
        <div className='space-y-8'>
          {experience.map((job, i) => (
            <article key={i}>
              <div className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1'>
                <h3 className='text-lg font-bold text-foreground'>
                  <a href={job.url} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                    {job.company}
                  </a>
                </h3>
                <span className='text-xs font-mono text-primary'>{job.dates}</span>
              </div>
              <div className='text-sm font-medium mb-2'>{job.role} | {job.location}</div>
              <ul className='list-disc list-outside ml-5 text-sm space-y-1'>
                {job.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby='resume-education' className='mb-12'>
        <h2 id='resume-education' className='text-2xl font-bold text-foreground mb-6'>Education</h2>
        <ul className='space-y-3'>
          {education.map((edu, i) => (
            <li key={i} className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between'>
              <span>
                <span className='font-semibold text-foreground'>{edu.school}</span>
                <span className='block sm:inline sm:ml-2 text-sm'>{edu.degree}</span>
              </span>
              <span className='text-xs font-mono text-primary whitespace-nowrap'>{edu.dates}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby='resume-skills' className='mb-12'>
        <h2 id='resume-skills' className='text-2xl font-bold text-foreground mb-6'>Skills</h2>
        <ul className='space-y-2 text-sm'>
          {skills.map((group, i) => (
            <li key={i}>
              <span className='font-semibold text-foreground'>{group.label}:</span> {group.items}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby='resume-projects' className='mb-12'>
        <h2 id='resume-projects' className='text-2xl font-bold text-foreground mb-6'>Research & Selected Projects</h2>
        <div className='space-y-6'>
          {projects.map((proj, i) => (
            <article key={i}>
              <div className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1'>
                <h3 className='font-semibold text-foreground'>
                  <a href={proj.url} target='_blank' rel='noopener noreferrer' className='hover:text-primary transition-colors'>
                    {proj.name}
                  </a>
                </h3>
                <span className='text-xs font-mono text-primary whitespace-nowrap'>{proj.dates}</span>
              </div>
              <p className='text-sm'>{proj.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby='resume-achievements' className='mb-12'>
        <h2 id='resume-achievements' className='text-2xl font-bold text-foreground mb-6'>Achievements & Certifications</h2>
        <ul className='list-disc list-outside ml-5 text-sm space-y-1'>
          {achievements.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
        <p className='text-sm mt-4'>
          Full certification list on the <Link href='/' className='text-primary hover:underline'>home page</Link> and
          in the <a href='/Shreejit_Verma_Resume.pdf' className='text-primary hover:underline'>PDF resume</a>.
        </p>
      </section>
    </main>
  );
}
