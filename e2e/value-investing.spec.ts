import { test, expect } from '@playwright/test';
import { UNIVERSE } from '../app/value-investing/lib/data';
import {
  computeUniverse,
  grahamNumber,
  percentileRank,
  roePct,
  fcfMarginPct,
  revenueCagrPct,
  signalFromScore,
  toCsv,
  median,
} from '../app/value-investing/lib/scoring';

test.describe('Scoring engine (pure math)', () => {
  const aapl = UNIVERSE.find((c) => c.ticker === 'AAPL')!;

  test('metric formulas produce known golden values', () => {
    // AAPL FY2024: 93.7 / 56.9 = 164.7%
    expect(roePct(aapl)).toBeCloseTo(164.68, 1);
    // (118.3 - 9.4) / 391.0 = 27.85%
    expect(fcfMarginPct(aapl)).toBeCloseTo(27.85, 1);
    // (391.0 / 260.2)^(1/5) - 1 = 8.48%
    expect(revenueCagrPct(aapl)).toBeCloseTo(8.48, 1);
    // sqrt(22.5 * 6.08 * 3.77) = 22.71
    expect(grahamNumber(aapl)).toBeCloseTo(22.71, 1);
  });

  test('percentileRank is correct at the edges and for ties', () => {
    expect(percentileRank([1, 2, 3, 4, 5], 0)).toBe(0);
    expect(percentileRank([1, 2, 3, 4, 5], 4)).toBe(100);
    expect(percentileRank([1, 2, 3, 4, 5], 2)).toBe(50);
    // Ties share the mean rank: [1, 2, 2, 3] index 1 -> (1 + 0.5) / 3 = 50
    expect(percentileRank([1, 2, 2, 3], 1)).toBe(50);
    expect(percentileRank([7], 0)).toBe(50);
  });

  test('signal thresholds are exact', () => {
    expect(signalFromScore(75)).toBe('Exceptional');
    expect(signalFromScore(74.9)).toBe('Strong');
    expect(signalFromScore(55)).toBe('Strong');
    expect(signalFromScore(54.9)).toBe('Solid');
    expect(signalFromScore(35)).toBe('Solid');
    expect(signalFromScore(34.9)).toBe('Watch');
  });

  test('dataset stays inside the domain where the ratios are meaningful', () => {
    // Negative equity would invert ROE and D/E rankings without any error.
    for (const c of UNIVERSE) {
      expect(c.shareholderEquity, `${c.ticker} equity`).toBeGreaterThan(0);
      expect(c.revenue, `${c.ticker} revenue`).toBeGreaterThan(0);
      expect(c.revenueFiveYearsAgo, `${c.ticker} base revenue`).toBeGreaterThan(0);
    }
    expect(new Set(UNIVERSE.map((c) => c.ticker)).size).toBe(UNIVERSE.length);
  });

  test('signal always agrees with the published composite score', () => {
    for (const row of computeUniverse(UNIVERSE)) {
      expect(row.signal, row.ticker).toBe(signalFromScore(row.compositeScore));
    }
  });

  test('composite scores are bounded, complete, and discriminating', () => {
    const rows = computeUniverse(UNIVERSE);
    expect(rows).toHaveLength(UNIVERSE.length);
    for (const row of rows) {
      expect(row.compositeScore).toBeGreaterThanOrEqual(0);
      expect(row.compositeScore).toBeLessThanOrEqual(100);
      expect(Number.isFinite(row.grahamNumber)).toBe(true);
    }
    const scores = rows.map((r) => r.compositeScore);
    expect(new Set(scores).size, 'scores should discriminate between companies').toBeGreaterThan(UNIVERSE.length / 2);
    // ORCL carries extreme leverage (D/E ~9.7) - it must not outrank NVDA (pristine balance sheet, hypergrowth).
    const nvda = rows.find((r) => r.ticker === 'NVDA')!;
    const orcl = rows.find((r) => r.ticker === 'ORCL')!;
    expect(nvda.compositeScore).toBeGreaterThan(orcl.compositeScore);
  });

  test('CSV export is well-formed and sorted by composite', () => {
    const csv = toCsv(computeUniverse(UNIVERSE));
    const lines = csv.split('\n');
    expect(lines).toHaveLength(UNIVERSE.length + 1);
    expect(lines[0]).toContain('ticker,name,roe_pct');
    // The Graham Number is per share in the reporting currency, so the
    // currency must travel with it.
    const header = lines[0].split(',');
    expect(header.indexOf('currency')).toBe(header.indexOf('graham_number') + 1);
    const asml = lines.find((line) => line.startsWith('ASML,'))!;
    expect(asml.split(',')[header.indexOf('currency')]).toBe('EUR');
    const scoreIndex = lines[0].split(',').indexOf('composite_score');
    const scores = lines.slice(1).map((line) => Number(line.split(',')[scoreIndex]));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  test('median handles odd and even lengths', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(() => median([])).toThrow(RangeError);
  });
});

test.describe('Value Intelligence Platform page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/value-investing');
    await expect(page.getByRole('table', { name: 'Quality value screen' })).toBeVisible({ timeout: 15_000 });
  });

  test('renders the full universe with computed columns', async ({ page }) => {
    const dataRows = page.getByRole('table', { name: 'Quality value screen' }).locator('tbody tr');
    await expect(dataRows).toHaveCount(UNIVERSE.length);
    // Top-scored row appears first under the default composite sort.
    const expectedTop = [...computeUniverse(UNIVERSE)].sort((a, b) => b.compositeScore - a.compositeScore)[0];
    await expect(dataRows.first()).toContainText(expectedTop.ticker);
  });

  test('column sorting reorders the table', async ({ page }) => {
    const screen = page.getByRole('table', { name: 'Quality value screen' });
    const firstTicker = screen.locator('tbody tr').first().locator('td').first().locator('span').first();
    const sortByDe = page.getByRole('button', { name: 'Sort by D/E' });
    const byDe = [...computeUniverse(UNIVERSE)].sort((a, b) => a.debtToEquity - b.debtToEquity);
    // A new numeric column sorts descending first: the most levered name leads.
    await sortByDe.click();
    await expect(firstTicker).toHaveText(byDe[byDe.length - 1].ticker);
    // A second click on the same column toggles to ascending.
    await sortByDe.click();
    await expect(firstTicker).toHaveText(byDe[0].ticker);
    await expect(screen.locator('th[aria-sort="ascending"]')).toContainText('D/E');
    await expect(screen.locator('th[aria-sort="descending"]')).toHaveCount(0);
  });

  test('CSV export downloads the computed screen', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'EXPORT_CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('quality-value-screen.csv');
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const csv = Buffer.concat(chunks).toString('utf-8');
    expect(csv.split('\n')).toHaveLength(UNIVERSE.length + 1);
    expect(csv).toContain('composite_score');
  });

  test('Graham Number cells show the reporting currency', async ({ page }) => {
    const asmlRow = page
      .getByRole('table', { name: 'Quality value screen' })
      .locator('tbody tr', { hasText: 'ASML' });
    await expect(asmlRow).toContainText('EUR');
  });

  test('methodology section discloses factors, weights, and limitations', async ({ page }) => {
    const methodology = page.locator('#methodology');
    await methodology.scrollIntoViewIfNeeded();
    await expect(methodology).toContainText('Return on Equity');
    await expect(methodology).toContainText('30%');
    await expect(methodology).toContainText('not a live feed');
    await expect(methodology).toContainText('Nothing on this page is investment advice');
  });

  test('page is honest: no fake live-data indicators remain', async ({ page }) => {
    const body = (await page.locator('body').innerText()).toUpperCase();
    for (const banned of ['LIVE_MODE', 'ACTIVE_FETCH', 'LAST_SYNC', 'SEC_FILINGS', 'MONITORING', 'DETECTION ACTIVE']) {
      expect(body, `fake indicator ${banned} present`).not.toContain(banned);
    }
    await expect(page.getByText('STATIC_SNAPSHOT')).toBeVisible();
  });

  test('metric cards derive from the dataset', async ({ page }) => {
    const rows = computeUniverse(UNIVERSE);
    const medianRoe = median(rows.map((r) => r.roePct));
    await expect(page.getByText(`${medianRoe.toFixed(1)}%`).first()).toBeVisible();
  });
});
