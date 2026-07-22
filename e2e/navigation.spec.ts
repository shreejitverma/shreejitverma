import { test, expect } from '@playwright/test';

test.describe('Navigation and interactions', () => {
  test('desktop nav links target existing sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop nav is hidden on mobile');
    await page.goto('/');
    const navAnchors = page.locator('nav a[href^="#"]');
    const count = await navAnchors.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      const href = (await navAnchors.nth(i).getAttribute('href')) ?? '';
      await expect(page.locator(href), `target ${href} missing`).toHaveCount(1);
    }
  });

  test('mobile menu opens, navigates, and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only interaction');
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
    // The dropdown stays mounted and is collapsed with max-h-0/overflow-hidden,
    // so assert its state class rather than Playwright visibility.
    const dropdown = page.locator('nav div.absolute.top-full');
    await expect(dropdown).toHaveClass(/max-h-0/);
    await menuButton.click();
    await expect(dropdown).toHaveClass(/max-h-96/);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const menuLink = dropdown.locator('a[href="#experience"]').first();
    await menuLink.click();
    await expect(dropdown).toHaveClass(/max-h-0/);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('theme toggle switches between dark and light', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Toggle theme' }).first();
    await expect(toggle).toBeVisible();
    const before = (await page.locator('html').getAttribute('class')) ?? '';
    await toggle.click();
    await expect
      .poll(async () => (await page.locator('html').getAttribute('class')) ?? '')
      .not.toBe(before);
  });

  test('cross-page navigation links work', async ({ page }) => {
    await page.goto('/value-investing');
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
