import { test, expect } from '@playwright/test';

test.describe('Resume page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume');
  });

  test('states name, roles, and location', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Shreejit Verma');
    const header = page.locator('header').last();
    await expect(header).toContainText('Quantitative Developer');
    await expect(header).toContainText('Quantitative Researcher');
    await expect(header).toContainText('Quantitative Trading Engineer');
    await expect(header).toContainText('New York');
  });

  test('offers the PDF download and contact links', async ({ page }) => {
    const pdfLink = page.locator('a[href="/Shreejit_Verma_Resume.pdf"]').first();
    await expect(pdfLink).toBeVisible();
    await expect(page.locator('a[href^="mailto:shreejitverma@gmail.com"]').first()).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com/in/shreejitverma"]').first()).toBeVisible();
    await expect(page.locator('a[href*="github.com/shreejitverma"]').first()).toBeVisible();
  });

  test('renders every resume section', async ({ page }) => {
    for (const heading of ['Summary', 'Professional Experience', 'Education', 'Skills', 'Research & Selected Projects', 'Achievements & Certifications']) {
      await expect(page.getByRole('heading', { name: heading }), `section ${heading} missing`).toBeVisible();
    }
  });

  test('lists all five employment entries in order', async ({ page }) => {
    const companies = page.locator('#resume-experience ~ div article h3, section[aria-labelledby="resume-experience"] article h3');
    await expect(companies).toHaveCount(5);
    const texts = await companies.allTextContents();
    expect(texts[0]).toContain('BNP Paribas');
    expect(texts[1]).toContain('LogiNext');
    expect(texts[2]).toContain('Versor');
    expect(texts[3]).toContain('Bank of America');
    expect(texts[4]).toContain('Bank of America');
  });

  test('contains headline quantitative achievements', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('$500M');
    await expect(main).toContainText('$8.5 Billion');
    await expect(main).toContainText(/sub-10us/i);
    await expect(main).toContainText('155.76%');
  });
});
