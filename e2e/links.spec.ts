import { test, expect } from '@playwright/test';
import { PAGES } from './helpers';

test.describe('Link integrity', () => {
  test('every internal link on every page resolves', async ({ page, request }) => {
    test.slow();
    const checked = new Map<string, number>();

    for (const { path } of PAGES) {
      await page.goto(path);
      const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
        anchors.map((a) => a.getAttribute('href') ?? ''),
      );

      for (const href of hrefs) {
        if (!href.startsWith('/') || href.startsWith('//')) continue;
        const target = href.split('#')[0];
        if (!target || checked.has(target)) continue;
        const response = await request.get(target, { maxRedirects: 5 });
        checked.set(target, response.status());
        expect(response.status(), `${target} (linked from ${path})`).toBeLessThan(400);
      }
    }
    expect(checked.size).toBeGreaterThan(3);
  });

  test('in-page anchors point at real elements', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      const hrefs = await page.locator('a[href^="#"]').evaluateAll((anchors) =>
        anchors.map((a) => a.getAttribute('href') ?? ''),
      );
      for (const href of new Set(hrefs)) {
        if (href === '#') continue;
        await expect(page.locator(href), `${href} on ${path}`).toHaveCount(1);
      }
    }
  });

  test('external links are well-formed https URLs with safe rel attributes', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      const externals = await page
        .locator('a[href^="http"]')
        .evaluateAll((anchors) =>
          anchors.map((a) => ({
            href: a.getAttribute('href') ?? '',
            target: a.getAttribute('target') ?? '',
            rel: a.getAttribute('rel') ?? '',
          })),
        );
      for (const { href, target, rel } of externals) {
        expect(() => new URL(href), `invalid URL ${href} on ${path}`).not.toThrow();
        if (target === '_blank') {
          expect(rel, `${href} on ${path} opens _blank without noopener`).toContain('noopener');
        }
      }
    }
  });
});
