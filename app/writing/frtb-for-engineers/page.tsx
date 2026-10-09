import type { Metadata } from 'next';
import ArticleLayout from '@/app/components/ArticleLayout';
import { socialMetadata } from '@/app/lib/seo';
import { ARTICLES, articleUrl } from '@/app/lib/writing';

const article = ARTICLES.find((a) => a.slug === 'frtb-for-engineers')!;
const path = articleUrl(article.slug);

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  keywords: article.tags,
  ...socialMetadata({ path, title: article.title, description: article.description, published: article.published }),
};

export default function FrtbForEngineers() {
  return (
    <ArticleLayout
      eyebrow='Market risk · Systems'
      title={article.title}
      description={article.description}
      path={path}
      published={article.published}
      readingMinutes={article.readingMinutes}
      back={{ href: '/writing', label: 'All writing' }}
    >
      <p>
        The Fundamental Review of the Trading Book (FRTB) is the Basel Committee&apos;s rewrite of how banks capitalize
        market risk. It is part of the Basel III final reforms that the industry usually calls Basel IV, and it is
        codified in the MAR chapters of the consolidated Basel Framework. Most explanations are written for risk
        managers. This one is written for the engineers who have to build the engine: what it computes, why each piece
        is expensive, and where the hard problems are.
      </p>
      <p>
        Everything here comes from the public Basel text. It describes the regulation, not any particular bank&apos;s
        implementation.
      </p>

      <h2 id='two-approaches'>Two approaches, both mandatory to compute</h2>
      <p>
        FRTB gives banks two ways to compute capital for each trading desk:
      </p>
      <ul>
        <li>
          <strong>The Standardised Approach (SA)</strong>: a prescribed formula driven by sensitivities and position
          data. Every in-scope desk must compute it, including desks approved for internal models, because it is the
          fallback and the reference point supervisors compare against.
        </li>
        <li>
          <strong>The Internal Models Approach (IMA)</strong>: a bank-built, supervisor-approved model based on Expected
          Shortfall. Approval is granted per desk, and a desk keeps it only while it keeps passing two statistical tests
          every quarter.
        </li>
      </ul>
      <p>
        From an engineering standpoint this means two engines with very different shapes. SA is a large, deterministic
        aggregation problem. IMA is a scenario revaluation problem followed by many tail-statistic aggregations. Both run
        daily, both must be reproducible for audit, and the eligibility tests tie IMA output back to front office P&amp;L.
      </p>

      <h2 id='sa'>The Standardised Approach: three charges</h2>
      <p>SA capital is the sum of three components.</p>

      <h3>1. Sensitivities-Based Method (SBM)</h3>
      <p>
        SBM covers seven risk classes: general interest rate risk (GIRR), credit spread risk for non-securitisations,
        for securitisations outside the correlation trading portfolio, and for the correlation trading portfolio, plus
        equity, commodity, and FX. Within each class there are three risk measures: <strong>delta</strong>,{' '}
        <strong>vega</strong>, and <strong>curvature</strong>.
      </p>
      <p>The computation is a fixed hierarchy:</p>
      <ol>
        <li>Compute each sensitivity to the prescribed risk factors (for GIRR, a set of tenors per curve and currency).</li>
        <li>Multiply by the prescribed risk weight to get a weighted sensitivity.</li>
        <li>
          Aggregate within each bucket using prescribed correlations: roughly{' '}
          <code>K_b = sqrt(max(0, sum_k WS_k^2 + sum_k sum_l rho_kl WS_k WS_l))</code>.
        </li>
        <li>Aggregate across buckets with cross-bucket correlations <code>gamma_bc</code>.</li>
        <li>
          Repeat the whole aggregation under three correlation scenarios: medium (the prescribed values), high
          (correlations scaled by 1.25 and capped at 1), and low (<code>max(2 rho - 1, 0.75 rho)</code>). The charge is the
          largest of the three totals.
        </li>
      </ol>
      <p>
        Curvature adds an up-shock and a down-shock full revaluation per risk factor, minus the delta-implied move, so it
        is the one SBM piece that needs pricing calls rather than just sensitivities.
      </p>
      <p>
        <strong>Why it is hard:</strong> the arithmetic is simple, but the volume is not. A large bank produces millions
        of sensitivities per day, and the correlation structure means every bucket is a dense quadratic form. The work is
        dominated by data movement: grouping sensitivities by risk class, bucket, and risk factor, building or caching
        the correlation matrices, and evaluating three scenarios. The productive design choices are a columnar layout
        keyed by (risk class, bucket, factor), computing all three correlation scenarios in a single pass over the data
        instead of three, and a fixed reduction order so the same inputs always produce bit-identical capital.
      </p>

      <h3>2. Default Risk Charge (DRC)</h3>
      <p>
        The SA DRC captures jump-to-default risk on credit and equity positions. For each position the engine computes a{' '}
        <strong>gross jump-to-default (JTD)</strong> amount from loss-given-default, notional, and current P&amp;L. Longs and
        shorts are then netted per obligor subject to seniority and maturity rules, and the net amounts are aggregated
        by bucket with a hedge benefit ratio that limits how much shorts can offset longs. Credit-quality-based risk
        weights convert net JTD into capital.
      </p>

      <h3>3. Residual Risk Add-On (RRAO)</h3>
      <p>
        RRAO is a deliberately blunt charge for risks the sensitivities do not capture: 1.0% of gross notional for
        instruments with exotic underlyings, and 0.1% for instruments with other residual risks such as certain
        path-dependent or multi-underlying payoffs. The computation is trivial. The engineering problem is classification:
        deciding, instrument by instrument and auditably, which bucket applies.
      </p>

      <h2 id='ima'>The Internal Models Approach</h2>

      <h3>Expected Shortfall with liquidity horizons</h3>
      <p>
        IMA replaces Value-at-Risk with <strong>Expected Shortfall (ES) at 97.5%</strong>, calibrated to a period of
        significant stress. Every risk factor is assigned a <strong>liquidity horizon</strong> of 10, 20, 40, 60, or 120
        days, reflecting how long it would take to exit or hedge the exposure. ES is computed on a 10-day base horizon
        and then scaled by a cascade over the horizons:
      </p>
      <pre tabIndex={0} aria-label='Liquidity-horizon scaled Expected Shortfall formula'>
        <code>{`ES = sqrt( ES_T(P)^2 + sum_{j>=2} ( ES_T(P, j) * sqrt((LH_j - LH_{j-1}) / T) )^2 )

T          = 10 days (base horizon)
ES_T(P)    = ES with all risk factors shocked
ES_T(P, j) = ES with only factors whose liquidity horizon is at least LH_j shocked`}</code>
      </pre>
      <p>
        Stress calibration adds a second layer. The bank picks a <strong>reduced set</strong> of risk factors that has
        a long enough history to cover the stress period and that explains at least 75% of the full model&apos;s ES. ES is
        then computed on the reduced set over the stress period and scaled up by the ratio of full-set to reduced-set ES
        over the current period, with that ratio floored at 1.
      </p>
      <p>
        Finally, ES is computed both on the whole portfolio and separately per broad risk class with no diversification
        across classes, and the two are blended 50/50. Count the runs: five liquidity-horizon subsets, times three
        calibrations (reduced set in stress, reduced set now, full set now), times the unconstrained portfolio plus
        five risk classes. That is on the order of ninety ES evaluations per desk per day, before any what-if analysis.
      </p>
      <p>
        <strong>Why it is hard, and how to make it cheap:</strong> each ES evaluation needs a P&amp;L vector across the
        scenarios, and producing those vectors means revaluing the portfolio under each scenario. Revaluation is the
        expensive part, and it should happen once. If the engine stores a P&amp;L vector per position (or per
        position and risk factor subset) for each scenario set, every one of the ninety ES numbers becomes an
        aggregation: sum the right vectors, then average the tail. With a few hundred scenarios the tail itself is a
        handful of observations, so a selection algorithm such as <code>std::nth_element</code> beats a full sort, and the
        whole aggregation layer becomes memory-bandwidth bound rather than compute bound. Grid compute belongs on the
        revaluation side; the aggregation side wants contiguous float vectors, SIMD-friendly loops, and no
        per-scenario allocation.
      </p>

      <h3>Non-Modellable Risk Factors (NMRF)</h3>
      <p>
        A risk factor may only enter the ES model if it passes the <strong>Risk Factor Eligibility Test (RFET)</strong>:
        at least 24 real price observations over the previous 12 months with no 90-day window containing fewer than four,
        or at least 100 observations over the 12 months. Factors that fail are non-modellable and are capitalized
        separately through a stressed scenario per factor. Idiosyncratic credit and equity NMRFs aggregate with zero
        correlation; the rest aggregate with a correlation of 0.6.
      </p>
      <p>
        <strong>Why it is hard:</strong> RFET is a data-engineering problem, not a modeling one. It needs an
        observation history per risk factor built from trades, committed quotes, and vendor data, mapped consistently
        onto the bank&apos;s risk factor taxonomy, and recomputed as the window rolls. A time-series store designed for tick
        data (kdb+ is common here) and a careful definition of what counts as a real price do most of the work. The
        capital impact of a factor flipping between modellable and non-modellable can be large, so the lineage behind
        each observation has to be inspectable.
      </p>

      <h3>The IMA Default Risk Charge</h3>
      <p>
        Under IMA, default risk is a separate model: a one-year, 99.9% Value-at-Risk of default losses, simulated with
        correlated defaults driven by at least two types of systematic factors, with a probability-of-default floor of
        0.03%. Structurally it is a Monte Carlo credit portfolio model, and it is usually the most compute-hungry single
        piece of the IMA stack.
      </p>

      <h2 id='eligibility'>Staying eligible: backtesting and P&amp;L attribution</h2>
      <p>
        IMA approval is conditional. Each desk is tested on its last 250 trading days.
      </p>
      <ul>
        <li>
          <strong>Backtesting:</strong> compare each day&apos;s P&amp;L with the desk&apos;s one-day VaR at 99% and at 97.5%.
          More than 12 exceptions at 99%, or more than 30 at 97.5%, and the desk moves to SA.
        </li>
        <li>
          <strong>P&amp;L attribution (PLA):</strong> compare the risk-theoretical P&amp;L (RTPL), which is what the risk
          model&apos;s own pricing and risk factors say the desk made, with the hypothetical P&amp;L (HPL) from front office
          pricing on unchanged positions. Two statistics decide the zone: the Spearman correlation of the two series and
          a Kolmogorov-Smirnov distance between their distributions. Green requires a Spearman correlation of at least
          0.80 and a KS metric of at most 0.09; a correlation below 0.70 or a KS metric above 0.12 is red, and red desks
          lose IMA. Amber desks keep IMA but pay a capital surcharge.
        </li>
      </ul>
      <p>
        <strong>Why it is hard:</strong> PLA is where the architecture shows. RTPL and HPL only line up when the risk
        engine and front office price the same positions off the same market data snapshot, the same curves, and
        compatible models. Every difference in interpolation, cut time, or risk factor mapping shows up as an
        attribution break. The engineering that keeps desks green is mostly plumbing: shared market data snapshots with
        explicit timestamps, a single risk factor taxonomy, and break-explain tooling that can decompose a gap between
        RTPL and HPL by risk factor so it can be fixed instead of argued about.
      </p>

      <h2 id='design-principles'>Design principles that survive an audit</h2>
      <ul>
        <li>
          <strong>Determinism.</strong> The same inputs must produce the same capital, bit for bit, on any rerun. Fix
          reduction orders, avoid order-dependent parallel floating-point sums, and version every input.
        </li>
        <li>
          <strong>Revalue once, aggregate many times.</strong> Separate the expensive pricing layer from the cheap
          aggregation layer, and make the aggregation layer fast enough to rerun freely for what-if and explain requests.
        </li>
        <li>
          <strong>Lineage over cleverness.</strong> Every number in a regulatory report should trace back to positions,
          market data, and configuration. Idempotent batch steps and immutable inputs make reruns and audits routine.
        </li>
        <li>
          <strong>Measure the batch, not the function.</strong> Intra-day risk batches are pipelines. The wins usually
          come from removing serialization points, recomputation, and data reshaping between stages, so profile the end
          to end critical path before optimizing any single kernel.
        </li>
      </ul>
      <p>
        FRTB is often described as a modeling change. For the people building it, it is just as much a systems change:
        more scenarios, more aggregation, stricter reproducibility, and a hard link between risk and front office P&amp;L.
        That combination rewards the same instincts as low-latency trading systems: know where the time goes, keep data
        contiguous, and make the fast path boring.
      </p>

      <h2 id='references'>References</h2>
      <ul>
        <li>
          Basel Committee on Banking Supervision,{' '}
          <a href='https://www.bis.org/bcbs/publ/d457.htm' target='_blank' rel='noopener noreferrer'>
            Minimum capital requirements for market risk (d457), January 2019
          </a>
          .
        </li>
        <li>
          Basel Framework,{' '}
          <a href='https://www.bis.org/basel_framework/standard/MAR.htm' target='_blank' rel='noopener noreferrer'>
            MAR: Calculation of RWA for market risk
          </a>
          .
        </li>
      </ul>
    </ArticleLayout>
  );
}
