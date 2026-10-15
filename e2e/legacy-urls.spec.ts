import { test, expect } from '@playwright/test';

// URLs from earlier versions of the site that search engines still index
// (found via site: search and the Wayback Machine). Each must answer with a
// permanent redirect to the current page, never a 404 or a stale document.
const LEGACY: [string, string][] = [
  ['/experience.html', '/#experience'],
  ['/Resources%20-%20Books.html', '/books'],
  ['/index.html', '/'],
  ['/resume.html', '/resume'],
  ['/some-old-page.html', '/'],
  ['/static/Resume.pdf', '/Shreejit_Verma_Resume.pdf'],
  ['/Resume.pdf', '/Shreejit_Verma_Resume.pdf'],
  ['/static/profile.png', '/Shreejit_Verma_profile_pic.jpg'],
];

test.describe('Legacy URLs', () => {
  for (const [from, to] of LEGACY) {
    test(`${decodeURIComponent(from)} permanently redirects to ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(response.headers()['location']).toBe(to);
    });
  }

  test('the old resume path serves the current resume PDF', async ({ request }) => {
    const [old, current] = await Promise.all([request.get('/Resume.pdf'), request.get('/Shreejit_Verma_Resume.pdf')]);
    expect(old.headers()['content-type']).toContain('pdf');
    expect((await old.body()).equals(await current.body())).toBe(true);
  });
});

test.describe('ProfilePage structured data', () => {
  const profilePages = async (page: import('@playwright/test').Page, path: string) => {
    await page.goto(path);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    return blocks.map((b) => JSON.parse(b)).flatMap((d) => d['@graph'] ?? [d]).filter((n) => n['@type'] === 'ProfilePage');
  };

  test('is declared on the pages about the person', async ({ page }) => {
    for (const path of ['/', '/resume']) {
      const nodes = await profilePages(page, path);
      expect(nodes, path).toHaveLength(1);
      expect(nodes[0].mainEntity['@id']).toBe('https://www.shreejitverma.com/#person');
    }
  });

  test('is not declared on articles or tools (Google ProfilePage guidelines)', async ({ page }) => {
    for (const path of ['/writing/frtb-for-engineers', '/books', '/value-investing']) {
      expect(await profilePages(page, path), path).toHaveLength(0);
    }
  });
});
