import { test, expect } from '@playwright/test';

test.describe('Home page content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero states the target roles and location', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Quantitative');
    const hero = page.locator('main section').first();
    await expect(hero).toContainText('Quantitative Researcher');
    await expect(hero).toContainText('New York');
  });

  test('all navigation section anchors exist', async ({ page }) => {
    for (const id of ['experience', 'work', 'skills', 'education', 'writing', 'awards']) {
      await expect(page.locator(`#${id}`), `#${id} missing`).toHaveCount(1);
    }
  });

  test('hero leads with checkable proof metrics and contact actions', async ({ page }) => {
    const hero = page.locator('main section').first();
    for (const value of ['$500M', '$8.5B', '50%', '+20%']) {
      await expect(hero.getByText(value, { exact: true })).toBeVisible();
    }
    await expect(hero.getByRole('link', { name: 'View Resume' })).toHaveAttribute('href', '/resume');
    await expect(hero.getByRole('link', { name: 'Download PDF' })).toHaveAttribute('href', '/Shreejit_Verma_Resume.pdf');
    await expect(hero.locator('a[href^="mailto:shreejitverma@gmail.com"]')).toHaveCount(1);
  });

  test('every work card links somewhere real', async ({ page }) => {
    // Regression: project cards used to link to "#" and open a blank tab.
    const hrefs = await page.locator('#work a').evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, 'work card link must not be a placeholder').not.toMatch(/^#?$/);
    }
    await expect(page.locator('#work a[href="/work/trishul"]').first()).toBeAttached();
  });

  test('home links to the latest writing', async ({ page }) => {
    await expect(page.locator('#writing a[href="/writing/frtb-for-engineers"]').first()).toBeAttached();
  });

  test('education lists all five schools with Stevens GPA', async ({ page }) => {
    const about = page.locator('#education');
    for (const school of [
      'Georgia Institute of Technology',
      'Stevens Institute of Technology',
      'WorldQuant University',
      'Carnegie Mellon University',
      'Vellore Institute of Technology',
    ]) {
      await expect(about).toContainText(school);
    }
    await expect(about).toContainText('3.974');
  });

  test('experience shows all employers with correct dates and both BofA roles', async ({ page }) => {
    const experience = page.locator('#experience');
    await expect(experience).toContainText('Barclays');
    await expect(experience).toContainText('Oct 2026 – Present');
    await expect(experience).toContainText('FRTB');
    await expect(experience).toContainText('BNP Paribas CIB');
    await expect(experience).toContainText('Feb 2026 – May 2026');
    await expect(experience).toContainText('LogiNext Solutions');
    await expect(experience).toContainText('Jul 2024');
    await expect(experience).toContainText('Versor Investments');
    await expect(experience.getByText('Bank of America')).toHaveCount(2);
    await expect(experience).toContainText('Fixed Income Commodities and Currencies');
    await expect(experience).toContainText('Senior Tech Associate');
  });

  test('research and projects link to the GitHub repositories', async ({ page }) => {
    for (const repo of [
      'trishul-ultra-hft-project',
      'srijan',
      'dotfiles-nix',
      'Adaptive-Volatility-Regime-Based-Execution-and-Risk-Framework',
      'Statistical-Arbitrage-Reversal-and-Momentum-Strategies',
      'Dynamic-Portfolio-Optimization',
    ]) {
      const link = page.locator(`a[href*="github.com/shreejitverma/${repo}"]`).first();
      await expect(link, `link to ${repo} missing`).toBeAttached();
    }
  });

  test('awards include Beta Gamma Sigma and Vanguard win', async ({ page }) => {
    const awards = page.locator('#awards');
    await expect(awards).toContainText('Beta Gamma Sigma');
    await expect(awards).toContainText('Vanguard ETF Trading Challenge');
  });

  test('awards point to the certification list on the resume page', async ({ page }) => {
    await expect(page.locator('#awards a[href="/resume#resume-certifications"]')).toHaveCount(1);
  });

  test('nav RESUME button opens the resume page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'resume button is in the desktop header');
    await page.getByRole('link', { name: 'RESUME', exact: true }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator('h1')).toContainText('Shreejit Verma');
  });

  test('footer exposes contact channels', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(footer.locator('a[href*="linkedin.com"]').first()).toBeAttached();
    await expect(footer.locator('a[href*="github.com"]').first()).toBeAttached();
  });
});
