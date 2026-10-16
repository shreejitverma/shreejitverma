import { test, expect, type Page } from '@playwright/test';
import { ARTICLES, PAGES, SITE } from './helpers';

// Crawl efficiency: honest sitemap dates, revalidation with 304s, and the
// Atom feed. XML is parsed with the browser's DOMParser so assertions are
// about the documents' meaning, not their text.

async function parseXml(page: Page, path: string) {
  await page.goto('/robots.txt');
  return page.evaluate(async (url) => {
    const doc = new DOMParser().parseFromString(await (await fetch(url)).text(), 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error(`${url} is not well-formed XML`);
    return doc.documentElement.outerHTML;
  }, path);
}

test.describe('Sitemap dates', () => {
  test('only pages with a real date carry lastmod, and it equals that date', async ({ page }) => {
    await page.goto('/robots.txt');
    const entries = await page.evaluate(async () => {
      const doc = new DOMParser().parseFromString(await (await fetch('/sitemap.xml')).text(), 'application/xml');
      return [...doc.getElementsByTagName('url')].map((u) => ({
        loc: u.getElementsByTagName('loc')[0].textContent,
        lastmod: u.getElementsByTagName('lastmod')[0]?.textContent ?? null,
      }));
    });
    const articleDates = new Map(ARTICLES.map(({ path, published }) => [`${SITE}${path}`, published]));
    const expectedLocations = [...PAGES.map(({ canonical }) => canonical), `${SITE}/Shreejit_Verma_Resume.pdf`].sort();
    expect(entries.map(({ loc }) => loc).sort()).toEqual(expectedLocations);
    for (const { loc, lastmod } of entries) {
      const published = articleDates.get(loc);
      if (published) {
        expect(lastmod, loc).not.toBeNull();
        expect(new Date(lastmod!).toISOString().slice(0, 10), loc).toBe(published);
      } else {
        // Undated pages must not claim a change on every deploy.
        expect(lastmod, loc).toBeNull();
      }
    }
  });
});

test.describe('Revalidation', () => {
  for (const path of ['/resume.json', '/llms.txt', '/mcp/server-card', '/.well-known/agent-card.json', '/index.md']) {
    test(`${path} answers a matching If-None-Match with 304 and no body`, async ({ request }) => {
      const first = await request.get(path);
      expect(first.status()).toBe(200);
      const etag = first.headers()['etag'];
      expect(etag).toMatch(/^"[\w-]+"$/);

      const again = await request.get(path, { headers: { 'If-None-Match': etag } });
      expect(again.status()).toBe(304);
      expect((await again.body()).length).toBe(0);
      expect(again.headers()['etag']).toBe(etag);

      // A weak form of the same tag from an intermediary still matches (RFC 9110 13.1.2).
      expect((await request.get(path, { headers: { 'If-None-Match': `W/${etag}` } })).status()).toBe(304);
      // A stale tag gets the full representation.
      expect((await request.get(path, { headers: { 'If-None-Match': '"stale"' } })).status()).toBe(200);
    });
  }

  test('error responses carry no validator', async ({ request }) => {
    const missing = await request.get('/api/search');
    expect(missing.status()).toBe(400);
    expect(missing.headers()['etag']).toBeUndefined();
  });
});

test.describe('Atom feed', () => {
  test('is well-formed Atom listing every article, newest first', async ({ page }) => {
    await parseXml(page, '/feed.xml');
    const feed = await page.evaluate(async () => {
      const doc = new DOMParser().parseFromString(await (await fetch('/feed.xml')).text(), 'application/xml');
      const atom = 'http://www.w3.org/2005/Atom';
      return {
        ns: doc.documentElement.namespaceURI,
        self: doc.querySelector('feed > link[rel="self"]')?.getAttribute('href'),
        entries: [...doc.getElementsByTagNameNS(atom, 'entry')].map((e) => ({
          id: e.getElementsByTagNameNS(atom, 'id')[0].textContent,
          published: e.getElementsByTagNameNS(atom, 'published')[0].textContent,
        })),
      };
    });
    expect(feed.ns).toBe('http://www.w3.org/2005/Atom');
    expect(feed.self).toBe(`${SITE}/feed.xml`);
    const expectedEntries = ARTICLES
      .map(({ path, published }) => ({ id: `${SITE}${path}`, published }))
      .sort((a, b) => b.published.localeCompare(a.published));
    expect(feed.entries).toEqual(expectedEntries);
  });

  test('every page advertises the feed', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.locator('head link[rel="alternate"][type="application/atom+xml"]')).toHaveAttribute('href', '/feed.xml');
  });
});
