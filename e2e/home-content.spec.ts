import { test, expect } from '@playwright/test';
import dataset from '../public/books_data_validated.json';

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
    for (const id of ['experience', 'research', 'projects', 'skills', 'philosophy', 'education', 'impact', 'writing', 'awards', 'certifications', 'books']) {
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

  test('every research and project card links somewhere real', async ({ page }) => {
    // Regression: project cards used to link to "#" and open a blank tab.
    const hrefs = await page.locator('#research a, #projects a').evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, 'card link must not be a placeholder').not.toMatch(/^#?$/);
    }
    await expect(page.locator('#research a[href="/work/trishul"]').first()).toBeAttached();
  });

  test('research section shows the theses and the Value Intelligence Platform', async ({ page }) => {
    const research = page.locator('#research');
    await expect(research).toContainText('Trishul');
    await expect(research).toContainText('Dynamic Portfolio Optimization');
    await expect(research.locator('a[href="/value-investing"]').first()).toBeAttached();
  });

  test('key projects include every project from the previous site', async ({ page }) => {
    const projects = page.locator('#projects');
    for (const name of [
      'Adaptive Volatility Regime-Based Execution and Risk Framework',
      'Statistical Arbitrage Reversal and Momentum Strategies',
      'CryoZen: Sovereign AI Command Center',
      'Plug-and-Play Agentic AI Engineering Harness',
      'ESG Merger Arbitrage Strategy',
      'Financial Modelling using Stochastic Calculus',
      'Blockchain in Retail',
      'QS Rank Predictor',
    ]) {
      await expect(projects.getByRole('heading', { name, exact: true }), name).toBeVisible();
    }
    // Projects without public source render as plain headings, not links.
    await expect(projects.getByRole('link', { name: 'QS Rank Predictor' })).toHaveCount(0);
  });

  test('technical arsenal covers every skill family', async ({ page }) => {
    const skills = page.locator('#skills');
    for (const group of ['Low-Latency Systems', 'Programming Languages', 'Quantitative Finance', 'Market Risk', 'Mathematics & Statistics', 'Machine Learning & AI', 'Data & Distributed Compute', 'Systems & DevOps']) {
      await expect(skills.getByRole('heading', { name: group, exact: true }), group).toBeVisible();
    }
    for (const skill of ['kdb+/q', 'OCaml', 'PyTorch', 'ZeroMQ', 'Markov chains']) {
      await expect(skills.getByText(skill, { exact: true }).first(), skill).toBeVisible();
    }
  });

  test('engineering philosophy ties each principle to real work', async ({ page }) => {
    const philosophy = page.locator('#philosophy');
    await expect(philosophy.locator('li')).toHaveCount(6);
    const links = philosophy.getByRole('link', { name: /^In practice:/ });
    await expect(links).toHaveCount(6);
    // No unsourced percentage scores.
    await expect(philosophy).not.toContainText('%');
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

  test('awards list interests and every language level', async ({ page }) => {
    const awards = page.locator('#awards');
    await expect(awards).toContainText('Cooking');
    for (const level of ['Fluent', 'Intermediate', 'Beginner']) {
      await expect(awards.getByText(level, { exact: true })).toBeVisible();
    }
    await expect(awards).toContainText('Tamil');
  });

  test('certifications are listed on the home page with credential links', async ({ page }) => {
    const certifications = page.locator('#certifications');
    await expect(certifications.getByRole('link', { name: 'CFA Level 1' })).toHaveAttribute('href', /^https?:\/\//);
    await expect(certifications.getByRole('link', { name: 'Algorithms, Part I & II (Princeton)' })).toBeVisible();
  });

  test('reading list preview shows real covers, shelf counts, and links to /books', async ({ page }) => {
    const books = page.locator('#books');
    await expect(books.getByRole('link', { name: 'View Full Reading List' })).toHaveAttribute('href', '/books');
    await expect(books).toContainText(`${dataset.length.toLocaleString('en-US')} books`);
    const covers = books.locator('img');
    await expect(covers).toHaveCount(12);
    await covers.last().scrollIntoViewIfNeeded();
    for (const cover of await covers.all()) {
      await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { message: await cover.getAttribute('alt') ?? '' }).toBe(true);
    }
  });

  test('GitHub impact section embeds every published metrics card', async ({ request }) => {
    // Cards load from the output branch at view time, so assert the
    // server-rendered markup rather than third-party availability.
    const html = await (await request.get('/')).text();
    for (const file of [
      'contrib3d.green-animate.svg', 'contrib3d.night-green.svg', 'metrics.calendar.svg',
      'streak.light.svg', 'streak.dark.svg', 'snake.light.svg', 'snake.dark.svg',
    ]) {
      expect(html, file).toContain(`https://raw.githubusercontent.com/shreejitverma/shreejitverma/output/${file}`);
    }
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
