// Single source of truth for profile content rendered on the home page and
// /resume. Facts must match public/Shreejit_Verma_Resume.pdf (plus the current
// Barclays role, which postdates the PDF); README.md mirrors them by hand.

export const SITE_URL = 'https://www.shreejitverma.com';

export const CONTACT = {
  email: 'shreejitverma@gmail.com',
  github: 'https://github.com/shreejitverma',
  linkedin: 'https://www.linkedin.com/in/shreejitverma/',
  scholar: 'https://scholar.google.com/citations?hl=en&user=qMzU8iAAAAAJ',
  calendly: 'https://calendly.com/shreejitverma',
  resumePdf: '/Shreejit_Verma_Resume.pdf',
} as const;

export const HEADLINE = {
  name: 'Shreejit Verma',
  roles: 'Quantitative Developer | Quantitative Researcher | Quantitative Trading Engineer',
  current: 'Senior Quantitative Developer at Barclays',
  location: 'New York, NY',
} as const;

// Headline numbers for the hero proof strip. Each one is a resume fact with
// its context, so a reader can trace where it comes from.
export interface ProofMetric {
  value: string;
  label: string;
  context: string;
}

export const PROOF_METRICS: ProofMetric[] = [
  {
    value: '$500M',
    label: 'daily market-making volume',
    context: 'C++ automated market-making stack, BNP Paribas CIB',
  },
  {
    value: '$8.5B',
    label: 'AUM merger-arbitrage book',
    context: 'Systematic strategies, Versor Investments',
  },
  {
    value: '50%',
    label: 'lower trade processing latency',
    context: 'C++ trade pipelines, Bank of America FICC',
  },
  {
    value: '+20%',
    label: 'higher Sharpe ratio',
    context: 'Regime-based C++ execution framework, backtested',
  },
];

export interface Role {
  company: string;
  url: string;
  title: string;
  location: string;
  dates: string;
  current?: boolean;
  summary?: string;
  bullets: string[];
}

export const EXPERIENCE: Role[] = [
  {
    company: 'Barclays',
    url: 'https://www.ib.barclays/',
    title: 'Senior Quantitative Developer (Contract), FRTB Market Risk',
    location: 'New York, USA (Hybrid)',
    dates: 'Oct 2026 - Present',
    current: true,
    summary:
      'Optimizing enterprise-scale analytics engines and distributed calculation pipelines for the Fundamental Review of the Trading Book (FRTB) across the Corporate & Investment Bank, leading technical delivery of Basel IV market risk capital models under the Internal Model Approach (IMA) and Standardised Approach (SA).',
    bullets: [
      'Architecting low-latency C++ and Python distributed pricing and risk calculation pipelines, optimizing Expected Shortfall (ES), Default Risk Charge (DRC), and Non-Modellable Risk Factor (NMRF) simulations across multi-asset trading desks.',
      'Engineering high-throughput aggregation engines for the Sensitivities-Based Method (SBM), Gross Jump-to-Default (JTD), and Residual Risk Add-on (RRAO).',
      'Designing automated backtesting and P&L Attribution (PLA) test suites (Risk-Theoretical vs. Hypothetical P&L), establishing stable model eligibility pipelines and minimizing capital charge penalties across major trading desks.',
      'Scaling real-time scenario generation and risk factor time-series pipelines across high-performance grid environments, integrating kdb+/q and distributed message queues to ingest multi-terabyte tick and pricing feeds for risk factor observability.',
      'Partnering with Quantitative Research, Front Office Trading, Risk Methodology, and Model Risk Governance to implement, validate, and document Basel IV compliance frameworks for regulatory audits (Fed, PRA, FINMA).',
    ],
  },
  {
    company: 'BNP Paribas CIB',
    url: 'https://cib.bnpparibas/',
    title: 'C++ Quantitative Developer (Co-op), Automated Market Making',
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
    title: 'Senior Software Engineer, Analytics',
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
    title: 'Quantitative Developer, Merger Arbitrage and Stock Selection Portfolio',
    location: 'Mumbai, India',
    dates: 'Feb 2022 - Oct 2022',
    bullets: [
      'Developed and backtested systematic merger-arbitrage strategies for an $8.5 Billion AUM fund, improving alpha capture by 15%.',
      'Built and deployed ML pipelines for Order and Execution Management Systems, increasing trade execution efficiency by 29%.',
      'Designed an ESG-driven merger-arbitrage signal from pre- and post-merger statistics, later run as a standalone portfolio and embedded across existing portfolios.',
    ],
  },
  {
    company: 'Bank of America',
    url: 'https://www.bankofamerica.com/',
    title: 'Senior Software Engineer, Fixed Income Commodities and Currencies (FICC)',
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
    title: 'Senior Tech Associate, Data Analysis and Insight Technology',
    location: 'Chennai, India',
    dates: 'Jun 2018 - Dec 2019',
    bullets: [
      'Architected and developed an ML/AI platform to deploy predictive models, increasing decision-making accuracy by 67%.',
      'Designed machine learning models for data validation rules prediction, reducing workload by close to 36 Full-Time Equivalents (FTEs).',
    ],
  },
];

export interface School {
  school: string;
  degree: string;
  dates: string;
  gpa?: string;
  coursework: string;
}

export const EDUCATION: School[] = [
  {
    school: 'Georgia Institute of Technology (Online)',
    degree: 'M.S. in Computer Science, Specialization in Computing Systems',
    dates: 'Aug 2024 - Expected Dec 2026',
    coursework: 'Computer Networks, Advanced Operating Systems, Distributed Computing, Database Management Systems.',
  },
  {
    school: 'Stevens Institute of Technology',
    degree: 'M.S. in Financial Engineering',
    dates: 'Aug 2024 - May 2026',
    gpa: 'GPA 3.974/4.0',
    coursework: 'Market Microstructure, Portfolio Theory and Applications, Algorithmic Trading Strategies, Multivariate Statistics.',
  },
  {
    school: 'WorldQuant University',
    degree: 'M.S. in Financial Engineering',
    dates: 'Dec 2021 - May 2024',
    gpa: 'GPA 86%',
    coursework: 'Deep Learning for Finance, Financial Econometrics, Fixed Income, Equity, Portfolio Management, Risk Management.',
  },
  {
    school: 'Carnegie Mellon University, Tepper School of Business',
    degree: 'M.S. in Computational Finance (program withdrawn due to father’s illness)',
    dates: 'Aug 2021 - Oct 2021',
    coursework: 'Investments, Statistical Machine Learning, Simulation Methods, Financial Computing, Algorithmic Optimization.',
  },
  {
    school: 'Vellore Institute of Technology',
    degree: 'B.Tech in Computer Science and Engineering',
    dates: 'Jul 2014 - Sept 2018',
    gpa: 'GPA 8.78/10.0',
    coursework: 'Data Structures and Algorithms, Programming Language Translators, Natural Language Processing.',
  },
];

export interface Project {
  name: string;
  context: string;
  dates: string;
  detail: string;
  tags: string[];
  repo?: string;
  caseStudy?: string;
}

export const PROJECTS: Project[] = [
  {
    name: 'Trishul: AI-Integrated FPGA for Market Making',
    context: 'MS Thesis, Stevens Institute of Technology',
    dates: 'Oct 2025 - May 2026',
    detail:
      'Sub-10us hardware-software co-designed market-making system: Verilog ITCH 5.0 parsing, L2 book, fixed-point RL inference, and single-cycle pre-trade risk on the FPGA critical path, with a zero-allocation C++20 control plane using lock-free SPSC queues and kernel-bypass style polling.',
    tags: ['C++20', 'Verilog', 'FPGA', 'Kernel Bypass', 'Limit Order Book', 'RL'],
    repo: 'https://github.com/shreejitverma/trishul-ultra-hft-project',
    caseStudy: '/work/trishul',
  },
  {
    name: 'Adaptive Volatility Regime-Based Execution and Risk Framework',
    context: 'C++ library',
    dates: 'Sept 2025 - Dec 2025',
    detail:
      'Regime-switching execution framework selecting among passive, TWAP, and aggressive execution using microstructure-robust volatility estimators, a Gaussian HMM, and Hawkes-process liquidity stress detection: +20.0% Sharpe Ratio, -6.1% transaction costs, -20.1% CVaR.',
    tags: ['C++17', 'Execution Algorithms', 'HMM', 'Risk'],
    repo: 'https://github.com/shreejitverma/Adaptive-Volatility-Regime-Based-Execution-and-Risk-Framework',
  },
  {
    name: 'Statistical Arbitrage Reversal and Momentum Strategies',
    context: 'Quant Researcher, WallStreetQuants',
    dates: 'Jun 2025 - Aug 2025',
    detail:
      '120-day volume-momentum crypto portfolio strategy: 155.76% annualized return and 1.94 Sharpe Ratio post transaction costs, outperforming the Bitcoin buy-and-hold benchmark.',
    tags: ['Python', 'Backtesting', 'Alpha Research'],
    repo: 'https://github.com/shreejitverma/Statistical-Arbitrage-Reversal-and-Momentum-Strategies',
  },
  {
    name: 'Dynamic Portfolio Optimization',
    context: 'MS Thesis, WorldQuant University',
    dates: 'Mar 2024 - Jun 2024',
    detail:
      'Real-time portfolio optimization with convex and non-convex methods, adaptive rebalancing, and multi-factor modeling across interest rate, FX, credit, and market risks.',
    tags: ['Portfolio Optimization', 'CVXPY', 'Factor Models'],
    repo: 'https://github.com/shreejitverma/Dynamic-Portfolio-Optimization',
  },
  {
    name: 'CryoZen: Sovereign AI Command Center',
    context: 'Independent project',
    dates: 'May 2026 - Present',
    detail:
      'Self-hosted, local-first AI workspace orchestrating LLM providers behind a unified API, with MCP tool-calling agents, RAG and persistent semantic memory, and hardware-aware deployment of quantized open-weight models; nothing leaves the host by default.',
    tags: ['LLM Infrastructure', 'MCP', 'RAG', 'Agents'],
    repo: 'https://github.com/shreejitverma/srijan',
  },
  {
    name: 'Plug-and-Play Agentic AI Engineering Harness',
    context: 'Independent project',
    dates: 'May 2026 - Present',
    detail:
      'Cross-platform agentic developer platform on NixOS with declarative configuration, multi-agent orchestration, isolated Git worktrees, autonomous task execution, and CI-gated shipping.',
    tags: ['NixOS', 'Multi-Agent Systems', 'DevEx'],
    repo: 'https://github.com/shreejitverma/dotfiles-nix',
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const SKILLS: SkillGroup[] = [
  {
    label: 'Low-Latency Systems',
    items: ['C++20/23', 'Lock-free data structures', 'Memory pools', 'SIMD', 'Cache-aware design', 'DPDK / kernel bypass', 'FPGA (Verilog, VHDL)', 'TCP/IP, UDP multicast', 'Linux performance tuning'],
  },
  {
    label: 'Quantitative Finance',
    items: ['Market microstructure', 'Market making', 'Execution algorithms', 'Statistical arbitrage', 'Derivatives pricing', 'Greeks', 'Factor modeling', 'Portfolio optimization'],
  },
  {
    label: 'Market Risk',
    items: ['FRTB (IMA / SA)', 'Basel IV', 'Expected Shortfall', 'DRC / NMRF', 'Sensitivities-Based Method', 'P&L Attribution', 'Backtesting'],
  },
  {
    label: 'Mathematics & ML',
    items: ['Stochastic calculus', 'Probability', 'Time series analysis', 'Numerical methods', 'Bayesian statistics', 'XGBoost', 'Deep learning', 'Reinforcement learning'],
  },
  {
    label: 'Data & Distributed Compute',
    items: ['kdb+/q', 'Python (NumPy, SciPy, Polars, pandas)', 'Kafka', 'Spark', 'Airflow', 'PostgreSQL', 'Redis', 'Slurm', 'IBM Symphony'],
  },
  {
    label: 'Infrastructure',
    items: ['Docker', 'Kubernetes / OpenShift', 'CMake', 'Git', 'CI/CD', 'AWS', 'GCP', 'Bash'],
  },
];

export const AWARDS: { title: string; detail: string }[] = [
  { title: '1st Place, Vanguard ETF Trading Challenge', detail: 'Personal portfolio; 6th place for the team portfolio.' },
  { title: 'Global Recognition Gold Award, Bank of America', detail: 'Led an enterprise-wide AI/ML campaign identifying 64 high-impact use cases; delivered AI/ML lectures to 2500+ employees across 4 events.' },
  { title: 'Global Recognition Silver Award, Bank of America (2x)', detail: 'Total Return Swap post-trade processing contributions and an end-to-end in-house AI/ML framework.' },
  { title: 'President, Stevens Graduate Financial Association', detail: 'Led the graduate finance student organization at Stevens.' },
  { title: 'Beta Gamma Sigma', detail: 'International business honor society.' },
  { title: 'State Rank Holder', detail: 'International Science Olympiad and International Mathematics Olympiad.' },
];

export const INTERESTS = 'Chess, Poker, F1, Martial Arts, Cricket, Boxing, Badminton, Psychology, History, Philosophy';

export const LANGUAGES = 'English and Hindi (fluent); French, Sanskrit, Spanish, Russian (intermediate)';

export interface Certification {
  name: string;
  url: string;
}

export const CERTIFICATIONS: { finance: Certification[]; computerScience: Certification[] } = {
  finance: [
    { name: 'CFA Level 1', url: 'http://basno.com/l2c3uqav' },
    { name: 'Bloomberg Market Concepts (BMC)', url: 'https://portal.bloombergforeducation.com/certificates/8Nm9y3yx5b9yaWztgxSmewLD' },
    { name: 'Financial Engineering and Risk Management Part I & II (Columbia)', url: 'https://coursera.org/share/70b94743c090c143954cdcbe01ebf521' },
    { name: 'Investment Foundations Program (CFA Institute)', url: 'http://basno.com/cfbvwwwf' },
    { name: 'Machine Learning for Trading Specialization (Google Cloud / NYIF)', url: 'https://coursera.org/share/7a85fee31445a626d1212f7c2f55eeab' },
    { name: 'Investment Management Specialization (Geneva / UBS)', url: 'https://www.coursera.org/specializations/investment-management' },
    { name: 'Trading Strategies in Emerging Markets (ISB)', url: 'https://www.coursera.org/specializations/trading-strategy#courses' },
    { name: 'Finance & Quantitative Modeling for Analysts (Wharton)', url: 'https://coursera.org/share/abe2916c68432d5d156494c2f1f59b6d' },
    { name: 'Corporate Finance and Valuation (NYU Stern, Aswath Damodaran)', url: 'https://coursera.org/share/ad6c6e3574db71e2e38777b74b6af97f' },
    { name: 'The Complete Financial Analyst Training & Investing Course', url: 'https://www.udemy.com/course/the-complete-financial-analyst-training-and-investing-course/' },
  ],
  computerScience: [
    { name: 'Deep Learning Specialization (Andrew Ng)', url: 'https://coursera.org/share/62c6f8a2d4a998dc4856249a1a937e17' },
    { name: 'Algorithms, Part I & II (Princeton)', url: 'https://www.coursera.org/learn/algorithms-part1' },
    { name: 'Data Structures and Algorithms Specialization', url: 'https://coursera.org/share/98a957a6518b5ca605f44f365df05151' },
    { name: 'Applied Data Science with Python (Michigan)', url: 'https://coursera.org/share/a24e1310f62486c32f6a2393fa1240dc' },
    { name: 'Data Science Statistics and Machine Learning (Johns Hopkins)', url: 'https://www.coursera.org/specializations/data-science-statistics-machine-learning' },
    { name: 'Data Science Foundations using R (Johns Hopkins)', url: 'https://coursera.org/share/3ca9e040262f60d9c367379013a1e7c1' },
    { name: 'Big Data Specialization (UC San Diego)', url: 'https://coursera.org/share/e3c471b726d96029d683efcfec957692' },
  ],
};
