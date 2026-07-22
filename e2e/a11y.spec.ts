import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './helpers';

test.describe('Accessibility', () => {
  for (const { path } of PAGES) {
    test(`${path} has no critical accessibility violations`, async ({ page }) => {
      await page.goto(path);
      // networkidle can hang or flake under parallel load; settle on 'load'
      // plus a bounded quiet period instead.
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const critical = results.violations.filter((v) => v.impact === 'critical');
      expect(
        critical,
        critical
          .map((v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`)
          .join('\n'),
      ).toEqual([]);

      const serious = results.violations.filter((v) => v.impact === 'serious');
      if (serious.length > 0) {
        console.warn(
          `[a11y] ${path} serious violations:\n` +
            serious.map((v) => `  ${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('\n'),
        );
      }
    });
  }
});
