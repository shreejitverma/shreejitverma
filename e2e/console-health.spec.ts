import { test, expect } from '@playwright/test';
import { PAGES, IGNORED_CONSOLE_PATTERNS } from './helpers';

test.describe('Runtime health', () => {
  for (const { path } of PAGES) {
    test(`${path} loads without console errors or page crashes`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) return;
        errors.push(text);
      });
      page.on('pageerror', (error) => {
        errors.push(`pageerror: ${error.message}`);
      });

      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      // networkidle can hang or flake under parallel load; settle on 'load'
      // plus a bounded quiet period instead.
      await page.waitForLoadState('load');
      // Exercise client-side hydration paths before judging.
      await page.mouse.wheel(0, 2000);
      await page.waitForTimeout(1000);

      expect(errors, errors.join('\n')).toEqual([]);
    });
  }

  test('unknown routes return the 404 page, not a crash', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
