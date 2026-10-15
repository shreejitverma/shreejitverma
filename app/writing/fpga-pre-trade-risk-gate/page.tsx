import type { Metadata } from 'next';
import ArticleLayout from '@/app/components/ArticleLayout';
import { socialMetadata } from '@/app/lib/seo';
import { ARTICLES, articleUrl } from '@/app/lib/writing';

const article = ARTICLES.find((a) => a.slug === 'fpga-pre-trade-risk-gate')!;
const path = articleUrl(article.slug);
const REPO = 'https://github.com/shreejitverma/trishul-ultra-hft-project';
const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  keywords: article.tags,
  ...socialMetadata({ path, title: article.title, description: article.description, published: article.published }),
};

export default function FpgaPreTradeRiskGate() {
  return (
    <ArticleLayout
      eyebrow='Low latency · FPGA · Risk'
      title={article.title}
      description={article.description}
      path={path}
      published={article.published}
      readingMinutes={article.readingMinutes}
      back={{ href: '/writing', label: 'All writing' }}
    >
      <p>
        In <a href='/work/trishul'>Trishul</a>, my market-making thesis system, the pre-trade risk check is not a function
        the strategy calls. It is a hardware stage wired in series between the decision logic and the order encoder, so
        an order that fails a check never reaches the wire. All three checks run in parallel and the verdict is
        registered in one clock cycle, about 3.1 ns.
      </p>
      <p>
        Fitting the checks into one cycle turned out to be the easy part. Rereading the module months later, the hard
        problems were at the edges: integer widths, state that only ever grows, and two implementations of the same
        rules that quietly disagree. This post walks through the design, then reviews it the way I would review
        someone else&apos;s pull request.
      </p>

      <h2 id='rule'>What the rule asks for</h2>
      <p>
        SEC Rule 15c3-5, the Market Access Rule, requires a broker-dealer with market access to run risk controls before
        orders reach an exchange. The financial controls in paragraph (c)(1) must:
      </p>
      <ul>
        <li>
          &quot;Prevent the entry of orders that exceed appropriate pre-set credit or capital thresholds,&quot; in aggregate
          for each customer and for the firm.
        </li>
        <li>
          &quot;Prevent the entry of erroneous orders, by rejecting orders that exceed appropriate price or size
          parameters,&quot; order by order or over a short period, including duplicative orders.
        </li>
      </ul>
      <p>
        Paragraph (d) adds that the controls must be under the firm&apos;s direct and exclusive control. The rule says
        nothing about latency. That is the engineering problem: a check that adds microseconds to every order is a cost
        a market maker pays on every quote.
      </p>

      <h2 id='why-hardware'>Why the check lives on the FPGA</h2>
      <p>
        Trishul keeps the whole tick-to-order path on the FPGA: it parses NASDAQ ITCH 5.0, maintains the L2 book, runs a
        fixed-point policy network, and encodes OUCH 5.0 orders. In simulation that path has a median of 822 ns and a
        99th percentile of 1,180 ns. A round trip to the CPU for a risk decision would cost more than the rest of the path
        combined.
      </p>
      <p>
        Putting the gate in hardware also changes what &quot;mandatory&quot; means. In software, a risk check is a call
        that a code path can skip. In the FPGA, the gate is the only wire between the decision core and the encoder, so
        there is no path around it.
      </p>

      <h2 id='design'>The design: three checks, one cycle</h2>
      <p>
        The module, <code>risk_gate.v</code>, takes an order (price, quantity, and a 64-bit hash) from the decision core
        and either forwards it to the encoder on the next clock edge or drops it and raises an alarm. Each check is
        combinational logic evaluated in parallel:
      </p>
      <pre tabIndex={0} aria-label='Combinational risk checks in Verilog'>
        <code>{`wire [PRICE_W+QTY_W-1:0] order_notional = in_order_price * in_order_qty;

wire check_credit     = (total_exposure + order_notional[PRICE_W-1:0] <= LIMIT_NOTIONAL);
wire check_fat_finger = (in_order_price <= cfg_max_price) &&
                        (in_order_price >= cfg_min_price) &&
                        (in_order_qty   <= cfg_max_qty);
wire check_duplicate  = (in_order_hash != last_order_hash) ||
                        (timestamp_counter > 32'd322); // 1 us at 322 MHz`}</code>
      </pre>
      <ul>
        <li>
          <strong>Fat finger.</strong> Price must sit inside a band and quantity under a cap. The thresholds are inputs
          from the control plane, so they can change intraday without resynthesis.
        </li>
        <li>
          <strong>Credit.</strong> Gross notional sent so far plus this order&apos;s notional must stay under a limit.
        </li>
        <li>
          <strong>Duplicate.</strong> An order with the same hash as the last accepted one is rejected unless more than
          322 cycles have passed. The clock is 322.265625 MHz, the rate of a 32-bit datapath at the 10.3125 Gb/s
          10GBASE-R line rate, so 322 cycles is 1.0 microsecond. This catches a runaway loop resending the same order.
        </li>
      </ul>
      <p>
        A clocked block ANDs the three results. On a pass it registers the order to the output and updates the exposure,
        hash, and window counter. On a fail it drops the order and sets one alarm flag per failed check. Because the three
        checks are independent, adding a fourth costs logic area, not latency.
      </p>
      <p>
        The C++ control plane carries a software twin, <code>PretradeChecker</code>, for the backtest and simulation
        path. It applies the same three checks plus a position limit, so the strategy can be tested end to end without
        hardware.
      </p>

      <h2 id='review'>Reviewing my own design</h2>
      <p>
        Here is what I would flag if this landed in my review queue, most serious first. Each item is in the public
        repository, so you can check it against <a href={`${REPO}/blob/main/fpga/rtl/risk/risk_gate.v`} {...external}>the RTL</a>.
      </p>

      <h3>1. The hardware and software limits disagree by 100x</h3>
      <p>
        The RTL default is <code>LIMIT_NOTIONAL = 64&apos;d1000000000</code>, commented as $10 million. The C++ side
        stores prices with <code>PRICE_SCALE = 10000</code>. If the FPGA uses the same scale, as it would for prices to
        cross the PCIe boundary unchanged, that constant is $100,000. The C++ checker enforces $10 million. Both paths
        pass their own tests, and a backtest would never reveal that production enforces a limit one hundred times
        tighter.
      </p>
      <p>
        <strong>Fix:</strong> generate both constants from one definition, and run the same order vectors through the C++
        checker and the RTL in simulation, failing the build when their verdicts differ.
      </p>

      <h3>2. Notional can overflow and pass the credit check</h3>
      <p>
        The product of a 64-bit price and a 32-bit quantity is 96 bits, but the credit check uses only the low 64. The sum
        with <code>total_exposure</code> is also 64 bits, so it can wrap. A large enough order can wrap to a small number
        and pass. The fat-finger caps make this unlikely with sane thresholds, but a risk control should not depend on
        another control being configured correctly.
      </p>
      <p>
        <strong>Fix:</strong> compare at full width, or saturate, so an overflow always rejects.
      </p>

      <h3>3. Exposure only ever goes up</h3>
      <p>
        <code>total_exposure</code> increases on every accepted order and never decreases. There is no input for fills,
        cancels, or a session reset. That makes it a session ceiling on gross notional sent, not a credit control. The
        software twin has the matching gap: its execution callback is a stub, and its position counter is never updated,
        so the position limit only ever compares a single order against zero.
      </p>
      <p>
        <strong>Fix:</strong> feed cancel and fill reports back into both implementations, and track open exposure and
        position, not just orders sent.
      </p>

      <h3>4. One cycle at 322 MHz is optimistic for a 64 by 32 multiply</h3>
      <p>
        The notional multiply, a 64-bit add, and the compare all sit in one 3.1 ns cycle. On real FPGA fabric that
        multiply spans several cascaded DSP slices, and I expect it to fail timing at this clock. I have not run it
        through synthesis and timing analysis, so treat this as a prediction. The fix is cheap: compute the notional in
        a first pipeline stage while the fat-finger checks run, then compare in the second. That costs one cycle, about
        3.1 ns, still a rounding error against the rest of the tick-to-order path.
      </p>

      <h3>5. Smaller items</h3>
      <ul>
        <li>
          <strong>Sticky alarms.</strong> A passing order does not clear the violation flags, so an alarm reports that
          something failed at some point, not that the last order failed. A per-order reject code in the telemetry stream
          would be clearer.
        </li>
        <li>
          <strong>One-entry duplicate memory.</strong> The check remembers only the last accepted hash, so it misses
          duplicates interleaved with other orders. The setup guide calls this a Bloom filter; it is a single comparator.
          A small set of recent hashes would close the gap.
        </li>
        <li>
          <strong>Missing controls.</strong> There is no hardware kill switch, no order-rate throttle, and no position
          limit. The C++ config defines <code>max_orders_per_second</code>, but nothing reads it.
        </li>
        <li>
          <strong>No testbench.</strong> The parser, book, decision core, and encoder each have a Verilog testbench. The
          risk gate does not, and it is the module where an edge case costs the most.
        </li>
      </ul>

      <h2 id='lessons'>What I take from it</h2>
      <p>
        The single-cycle number is the least interesting thing about this module. Parallel checks are easy to make
        fast. What decides whether a risk control works is what happens at the boundaries: the width of every
        intermediate value, every piece of state and the event that resets it, and every place the same rule exists
        twice. Those are the things I would test first, ahead of latency.
      </p>
      <p>
        Trishul is research software: it runs in simulation and RTL testbenches, not on an exchange connection. The
        items above are what I would fix before treating its risk gate as anything more than a design study.
      </p>

      <h2 id='references'>References</h2>
      <ul>
        <li>
          <a href='https://www.law.cornell.edu/cfr/text/17/240.15c3-5' {...external}>
            17 CFR 240.15c3-5, Risk management controls for brokers or dealers with market access
          </a>
          .
        </li>
        <li>
          <a href={REPO} {...external}>Trishul source code</a>, including <code>fpga/rtl/risk/risk_gate.v</code> and{' '}
          <code>src/risk/pretrade_checker.cpp</code>.
        </li>
        <li>
          <a href='/work/trishul'>Trishul case study</a>: the full architecture and simulation results.
        </li>
      </ul>
    </ArticleLayout>
  );
}
