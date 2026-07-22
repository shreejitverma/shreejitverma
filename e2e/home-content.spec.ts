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
    for (const id of ['about', 'experience', 'skills', 'research', 'projects', 'impact']) {
      await expect(page.locator(`#${id}`), `#${id} missing`).toHaveCount(1);
    }
  });

  test('education lists all five schools with Stevens GPA', async ({ page }) => {
    const about = page.locator('#about');
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

  test('certifications section renders finance and CS credentials', async ({ page }) => {
    const certifications = page.locator('#certifications');
    await expect(certifications).toContainText('CFA Level 1');
    await expect(certifications).toContainText('Deep Learning Specialization');
    const certLinks = certifications.locator('a[href]');
    expect(await certLinks.count()).toBeGreaterThanOrEqual(15);
  });

  test('nav RESUME button opens the resume page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'resume button is in the desktop header');
    await page.getByRole('link', { name: 'RESUME' }).click();
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
