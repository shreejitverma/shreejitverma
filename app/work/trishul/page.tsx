import type { Metadata } from 'next';
import { ArrowDown, Github } from 'lucide-react';
import ArticleLayout from '@/app/components/ArticleLayout';
import { socialMetadata } from '@/app/lib/seo';

const path = '/work/trishul';
const title = 'Trishul: An AI-Integrated FPGA Market-Making System';
const description =
  'Case study of my Stevens MS thesis: a hardware-software co-designed market maker that puts packet parsing, the order book, reinforcement-learning inference, and pre-trade risk on the FPGA critical path, with a zero-allocation C++20 control plane.';
const REPO = 'https://github.com/shreejitverma/trishul-ultra-hft-project';

export const metadata: Metadata = {
  title: 'Trishul Case Study | FPGA Market Making, Low-Latency C++20, Kernel Bypass',
  description,
  ...socialMetadata({ path, title, description, type: 'article' }),
};

const FPGA_STAGES = [
  { name: 'rx_parser', detail: 'Strips Ethernet, IP, and UDP headers from 10GbE frames at line rate.' },
  { name: 'itch_decoder', detail: 'Fixed-offset extraction of NASDAQ ITCH 5.0 messages.' },
  { name: 'book_manager', detail: 'L2 book with O(1) best bid and offer registers; order book imbalance features.' },
  { name: 'strat_decide', detail: 'DSP-accelerated fixed-point systolic array running the quantized policy network.' },
  { name: 'risk_gate', detail: 'Single-cycle pre-trade checks: fat-finger, max notional, duplicate orders (SEC 15c3-5 style).' },
  { name: 'order_encode', detail: 'Endian-aware NASDAQ OUCH 5.0 packet formatter.' },
];

const CONTROL_PLANE = [
  'Model weight hot-swap over PCIe AXI-Lite without pausing the FPGA pipeline',
  'Lock-free SPSC queues (std::atomic, acquire/release) for telemetry',
  'Pre-allocated memory pools: no malloc or new on the hot path',
  'Huge-page (MAP_HUGETLB) buffers emulating DPDK/VFIO polling',
  'Asynchronous logger that keeps disk I/O off the strategy thread',
  'AVX2-vectorized signal generation and backtest simulation',
];

export default function TrishulCaseStudy() {
  return (
    <ArticleLayout
      eyebrow='Case study · MS thesis, Stevens Institute of Technology · Oct 2025 - May 2026'
      title={title}
      description={description}
      path={path}
      back={{ href: '/#work', label: 'Selected work' }}
    >
      <p>
        <a href={REPO} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2'>
          <Github className='w-4 h-4' aria-hidden='true' /> Source code, RTL, benchmarks, and the full thesis on GitHub
        </a>
      </p>

      <h2 id='problem'>The problem</h2>
      <p>
        Market makers face a trade-off between adaptability and determinism. Software models, including learned
        policies, adapt well to changing volatility regimes but run behind the operating system, the network stack, and
        the memory allocator, so their response time is long and its tail is unpredictable. Fixed hardware pipelines are
        fast and deterministic but traditionally only run simple, hand-written quoting logic.
      </p>
      <p>
        Trishul asks whether a volatility-aware policy can be trained in software and then executed directly in the
        FPGA data path, so the adaptive decision is made at wire speed while the CPU only supervises.
      </p>

      <h2 id='architecture'>Architecture</h2>
      <p>
        The system is split into a deterministic execution layer on the FPGA, which owns the entire tick-to-order
        critical path, and a C++20 control plane on the CPU, which handles everything that may be slow without touching
        the critical path.
      </p>
      <div className='not-prose grid md:grid-cols-[3fr_2fr] gap-6 my-8' role='group' aria-label='Trishul architecture diagram'>
        <div className='rounded-2xl border border-border bg-card/40 dark:bg-card p-5'>
          <p className='text-xs font-mono text-primary mb-4'>FPGA critical path (Verilog, Kintex UltraScale+ target)</p>
          <ol className='space-y-2 list-none pl-0'>
            {FPGA_STAGES.map((stage, i) => (
              <li key={stage.name} className='m-0'>
                <div className='rounded-lg border border-border bg-background/60 px-4 py-3'>
                  <code className='text-sm'>{stage.name}</code>
                  <p className='text-sm mt-1 mb-0 leading-snug'>{stage.detail}</p>
                </div>
                {i < FPGA_STAGES.length - 1 && <ArrowDown className='w-4 h-4 mx-auto my-1 text-muted-foreground' aria-hidden='true' />}
              </li>
            ))}
          </ol>
        </div>
        <div className='rounded-2xl border border-border bg-card/40 dark:bg-card p-5'>
          <p className='text-xs font-mono text-primary mb-4'>C++20 hybrid control plane (CPU)</p>
          <ul className='space-y-3 text-sm list-none pl-0'>
            {CONTROL_PLANE.map((item) => (
              <li key={item} className='m-0 rounded-lg border border-border bg-background/60 px-4 py-3 leading-snug'>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 id='decisions'>Key design decisions</h2>
      <h3>Train in floating point, deploy in fixed point</h3>
      <p>
        The policy is trained with Proximal Policy Optimization on order book imbalance and VPIN features, then pruned
        and quantized to 8- and 16-bit fixed point with quantization-aware training so it fits the FPGA&apos;s DSP slices
        and timing budget. The network is small on purpose: every layer costs clock cycles on the critical path.
      </p>
      <h3>Risk checks in the data path, not after it</h3>
      <p>
        Pre-trade risk runs as a single-cycle gate between the decision and the order encoder. Making risk part of the
        pipeline, rather than a software check the order has to wait for, keeps the control both mandatory and cheap.
      </p>
      <h3>A software stack with no surprises</h3>
      <p>
        Where software is unavoidable, the hot path does no dynamic allocation, communicates through single-producer
        single-consumer queues with explicit acquire/release ordering instead of mutexes, and pushes logging and disk I/O
        to background threads. The goal is not just a low median but a tight tail.
      </p>
      <h3>Stress the system with a generative market</h3>
      <p>
        Historical replay rarely contains enough liquidity crises to test a market maker. Trishul includes a synthetic
        market generator that combines Merton jump-diffusion for price gaps with a Hawkes process (simulated by Ogata
        thinning) for self-exciting order flow, and a model-selection script that justifies the hybrid against geometric
        Brownian motion using AIC and BIC.
      </p>

      <h2 id='limitations'>Scope and limitations</h2>
      <ul>
        <li>
          Trishul is research software. It simulates direct market access protocols and kernel-bypass networking and has
          never been connected to a live exchange or traded real capital.
        </li>
        <li>
          Results come from simulation and RTL testbenches, not from production hardware on an exchange network, so they
          should be read as design-level evidence rather than production latency.
        </li>
      </ul>

      <h2 id='next'>What I would do next</h2>
      <ul>
        <li>Synthesize to a physical card and measure tick-to-order latency with hardware timestamps on the wire.</li>
        <li>Replay real ITCH captures alongside the synthetic generator to check the policy against real order flow.</li>
        <li>Add a deterministic software fallback path with identical semantics for A/B validation against the FPGA.</li>
      </ul>
    </ArticleLayout>
  );
}
