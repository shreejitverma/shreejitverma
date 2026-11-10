import { test, expect } from '@playwright/test';
import { SITE } from './helpers';

// The open-source knowledge bases: the home page section, the /open-source
// hub, one page per repository, and the structured data and agent surfaces
// that make them discoverable.

const REPOS = [
  { slug: 'the-quant-prep', name: 'The Quant Prep', repo: 'https://github.com/shreejitverma/The-Quant-Prep', stat: '6,264' },
  { slug: 'the-distinguished-engineer', name: 'The Distinguished Engineer', repo: 'https://github.com/shreejitverma/The-Distinguished-Engineer', stat: '6,800' },
];

type LdNode = Record<string, unknown> & { '@type'?: string | string[] };

async function ldNodes(page: import('@playwright/test').Page): Promise<LdNode[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return scripts.flatMap((raw) => {
    const parsed = JSON.parse(raw);
    return parsed['@graph'] ?? [parsed];
  });
}

const hasType = (node: LdNode, type: string) => ([] as string[]).concat(node['@type'] ?? []).includes(type);

test.describe('Open-source knowledge bases', () => {
  test('home page section links both repositories and the hub', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#open-source');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Open-Source Knowledge Bases');
    await expect(section.locator('a[href="/open-source"]').first()).toBeAttached();
    for (const { slug, name, repo, stat } of REPOS) {
      await expect(section.getByRole('heading', { level: 3, name })).toBeVisible();
      await expect(section.locator(`a[href="/open-source/${slug}"]`).first()).toBeAttached();
      await expect(section.locator(`a[href="${repo}"]`)).toHaveCount(1);
      await expect(section.getByText(stat, { exact: true })).toBeVisible();
    }
    await expect(page.locator('main section').first().locator('a[href="#open-source"]')).toHaveCount(1);
  });

  test('hub lists both repositories with CollectionPage structured data', async ({ page }) => {
    await page.goto('/open-source');
    await expect(page.locator('h1')).toHaveText('Open-Source Knowledge Bases');
    for (const { name, repo } of REPOS) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
      await expect(page.locator(`main a[href="${repo}/issues"]`)).toHaveCount(1);
    }
    const nodes = await ldNodes(page);
    const collection = nodes.find((n) => hasType(n, 'CollectionPage'));
    expect(collection, 'CollectionPage node').toBeTruthy();
    expect(collection!.hasPart).toEqual(REPOS.map(({ slug }) => ({ '@id': `${SITE}/open-source/${slug}#source` })));
    expect(nodes.filter((n) => hasType(n, 'SoftwareSourceCode'))).toHaveLength(REPOS.length);
    expect(nodes.some((n) => hasType(n, 'BreadcrumbList'))).toBe(true);
  });

  for (const { slug, name, repo, stat } of REPOS) {
    test(`/open-source/${slug} describes the repository and credits the author`, async ({ page }) => {
      await page.goto(`/open-source/${slug}`);
      await expect(page.locator('h1')).toHaveText(name);
      await expect(page.getByText(stat, { exact: true }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Open on GitHub' })).toHaveAttribute('href', repo);
      // Every section card deep-links into the repository.
      const deepLinks = await page.locator(`main a[href^="${repo}/tree/main/"]`).count();
      expect(deepLinks).toBeGreaterThanOrEqual(8);
      await expect(page.getByRole('complementary', { name: 'About the author' })).toContainText('Shreejit Verma');

      const source = (await ldNodes(page)).find((n) => hasType(n, 'SoftwareSourceCode'));
      expect(source, 'SoftwareSourceCode node').toBeTruthy();
      expect(source!.codeRepository).toBe(repo);
      expect(source!.author).toEqual({ '@id': `${SITE}/#person` });
      expect(source!.isAccessibleForFree).toBe(true);

      const ogImage = (await page.locator('head meta[property="og:image"]').first().getAttribute('content')) ?? '';
      expect(ogImage).toContain(`/open-source/${slug}/opengraph-image`);
    });

    test(`/open-source/${slug} share card renders`, async ({ request }) => {
      const response = await request.get(`/open-source/${slug}/opengraph-image`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
    });
  }

  test('unknown repository slugs are not found', async ({ request }) => {
    expect((await request.get('/open-source/not-a-repository')).status()).toBe(404);
  });

  test('agents can find the knowledge bases', async ({ request }) => {
    const llms = await (await request.get('/llms.txt')).text();
    expect(llms).toContain('## Open source');
    for (const { repo } of REPOS) expect(llms).toContain(repo);

    const search = await (await request.get('/api/search?q=jane%20street%20interview%20guide&limit=1')).json();
    expect(search.results[0].url).toBe(`${SITE}/open-source/the-quant-prep`);

    const resume = await (await request.get('/resume.json')).json();
    const names = (resume.projects as { name: string }[]).map((p) => p.name);
    for (const { name } of REPOS) expect(names).toContain(name);
  });

  test('MCP exposes the knowledge bases as a read-only tool', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      data: { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get_open_source', arguments: {} } },
    });
    expect(response.status()).toBe(200);
    const text = await response.text();
    const payload = JSON.parse(text.includes('data: ') ? text.split('data: ')[1].split('\n')[0] : text);
    const bases = JSON.parse(payload.result.content[0].text) as { name: string; repository: string }[];
    expect(bases.map((b) => b.repository)).toEqual(REPOS.map((r) => r.repo));
  });
});
