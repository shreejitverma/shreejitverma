import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './helpers';

// Both site themes ship to real visitors, so both must meet WCAG 2 AA.
const THEMES = ['dark', 'light'] as const;

test.describe('Accessibility', () => {
  for (const { path } of PAGES) {
    for (const theme of THEMES) {
      test(`${path} (${theme}) has no serious or critical accessibility violations`, async ({ page }) => {
        // next-themes reads its persisted choice from localStorage before paint.
        await page.addInitScript((value) => window.localStorage.setItem('theme', value), theme);
        await page.goto(path);
        await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
        // networkidle can hang or flake under parallel load; settle on 'load'
        // plus a bounded quiet period (longer than the 0.3s color transitions).
        await page.waitForLoadState('load');
        await page.waitForTimeout(1000);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        const blocking = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
        expect(
          blocking,
          blocking
            .map((v) => `${v.impact} ${v.id}: ${v.description}\n` + v.nodes.slice(0, 5).map((n) => `    ${n.target.join(' ')}`).join('\n'))
            .join('\n'),
        ).toEqual([]);
      });
    }
  }
});
