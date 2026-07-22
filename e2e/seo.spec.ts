import { test, expect } from '@playwright/test';
import { PAGES, SITE } from './helpers';

test.describe('SEO metadata', () => {
  for (const { path, canonical } of PAGES) {
    test(`${path} has title, description, canonical, and is indexable`, async ({ page }) => {
      await page.goto(path);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title).toContain('Shreejit Verma');

      const description = page.locator('head meta[name="description"]').first();
      const content = (await description.getAttribute('content')) ?? '';
      expect(content.length).toBeGreaterThan(50);

      const canonicalLink = page.locator('head link[rel="canonical"]');
      await expect(canonicalLink).toHaveCount(1);
      const href = ((await canonicalLink.getAttribute('href')) ?? '').replace(/\/$/, '');
      expect(href).toBe(canonical.replace(/\/$/, ''));

      const robotsMeta = page.locator('head meta[name="robots"]').first();
      if ((await robotsMeta.count()) > 0) {
        expect((await robotsMeta.getAttribute('content')) ?? '').not.toContain('noindex');
      }
    });
  }

  test('home page exposes Open Graph and Twitter cards', async ({ page }) => {
    await page.goto('/');
    for (const property of ['og:title', 'og:description', 'og:image', 'og:url']) {
      const tag = page.locator(`head meta[property="${property}"]`).first();
      expect((await tag.getAttribute('content')) ?? '', `${property} missing`).not.toBe('');
    }
    const twitterCard = page.locator('head meta[name="twitter:card"]').first();
    expect((await twitterCard.getAttribute('content')) ?? '').not.toBe('');
  });

  test('home page JSON-LD graph declares Person, WebSite, and ProfilePage', async ({ page }) => {
    await page.goto('/');
    const ldScripts = page.locator('script[type="application/ld+json"]');
    await ldScripts.first().waitFor({ state: 'attached' });
    const scripts = await ldScripts.allTextContents();
    expect(scripts.length).toBeGreaterThan(0);

    const nodes = scripts.flatMap((raw) => {
      const parsed = JSON.parse(raw);
      return parsed['@graph'] ?? [parsed];
    });

    const person = nodes.find((n: { '@type'?: string }) => n['@type'] === 'Person');
    expect(person, 'Person node missing').toBeTruthy();
    expect(person.name).toBe('Shreejit Verma');
    for (const role of ['Quantitative Developer', 'Quantitative Researcher', 'Quantitative Trading Engineer']) {
      expect(person.jobTitle, `jobTitle missing ${role}`).toContain(role);
    }
    expect(person.sameAs).toEqual(
      expect.arrayContaining([expect.stringContaining('linkedin.com'), expect.stringContaining('github.com')]),
    );
    expect(person.address?.addressLocality).toBe('New York');

    expect(nodes.some((n: { '@type'?: string }) => n['@type'] === 'WebSite'), 'WebSite node missing').toBe(true);
    expect(nodes.some((n: { '@type'?: string }) => n['@type'] === 'ProfilePage'), 'ProfilePage node missing').toBe(true);
  });

  test('home and resume pages have exactly one h1', async ({ page }) => {
    for (const path of ['/', '/resume']) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('sitemap.xml lists every indexable page', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();
    for (const url of [SITE, `${SITE}/resume`, `${SITE}/value-investing`, `${SITE}/books`, `${SITE}/Shreejit_Verma_Resume.pdf`]) {
      expect(xml, `sitemap missing ${url}`).toContain(`<loc>${url}</loc>`);
    }
  });

  test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Allow: /');
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
});
