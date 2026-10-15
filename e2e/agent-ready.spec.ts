import { createHash } from 'node:crypto';
import { test, expect, type APIRequestContext } from '@playwright/test';
import { PAGES, SITE } from './helpers';

// Agent readiness: Markdown for agents, discovery documents, and the MCP,
// A2A, and REST endpoints. The checks mirror what Cloudflare's Agent
// Readiness scanner (isitagentready.com) and real agent clients rely on.

const markdownPath = (path: string) => (path === '/' ? '/index.md' : `${path}.md`);
// Discovery documents carry production URLs; rebase them onto the server under test.
const local = (url: string) => url.replace(SITE, '');

async function getJson(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.status(), path).toBe(200);
  return { response, body: await response.json() };
}

test.describe('Markdown for agents', () => {
  for (const { path, canonical } of PAGES) {
    test(`${path} returns Markdown for Accept: text/markdown`, async ({ request }) => {
      const response = await request.get(path, { headers: { Accept: 'text/markdown' } });
      expect(response.status()).toBe(200);
      const headers = response.headers();
      expect(headers['content-type']).toContain('text/markdown');
      expect(Number(headers['x-markdown-tokens'])).toBeGreaterThan(50);
      expect(headers['vary']).toMatch(/accept/i);
      expect(headers['content-signal']).toContain('ai-input=yes');
      expect(headers['link']).toBe(`<${canonical}>; rel="canonical"`);
      const body = await response.text();
      expect(body.startsWith('---\ntitle: ')).toBe(true);
      expect(body).toContain(`url: "${canonical}"`);
      expect(body).not.toMatch(/<(div|span|svg|script)\b/);
      // Links are absolute so they work outside the page.
      expect(body).not.toMatch(/\]\(\/(?!\/)/);
    });

    test(`${path} has a .md twin with the same content`, async ({ request }) => {
      const [negotiated, twin] = await Promise.all([
        request.get(path, { headers: { Accept: 'text/markdown' } }),
        request.get(markdownPath(path)),
      ]);
      expect(twin.status()).toBe(200);
      expect(twin.headers()['content-type']).toContain('text/markdown');
      expect(await twin.text()).toBe(await negotiated.text());
    });
  }

  test('browsers still get HTML with discovery Link headers', async ({ request }) => {
    const response = await request.get('/', { headers: { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' } });
    expect(response.headers()['content-type']).toContain('text/html');
    const link = response.headers()['link'];
    expect(link).toContain('</.well-known/api-catalog>; rel="api-catalog"');
    expect(link).toContain('</mcp/server-card>; rel="service-desc"');
    expect(link).toContain('</index.md>; rel="alternate"; type="text/markdown"');
    // Next.js varies HTML on its RSC request headers; a config-level Vary
    // would replace that list, so guard it.
    expect(response.headers()['vary']).toContain('next-router-state-tree');
  });

  test('RSC payload responses keep the Next.js Vary list', async ({ request }) => {
    const response = await request.get('/resume?_rsc=e2e', { headers: { RSC: '1' } });
    expect(response.headers()['vary']).toContain('next-router-state-tree');
  });

  test('a mixed Accept list that includes Markdown gets Markdown', async ({ request }) => {
    const response = await request.get('/resume', { headers: { Accept: 'text/markdown, text/html;q=0.9' } });
    expect(response.headers()['content-type']).toContain('text/markdown');
  });

  test('unknown pages get a Markdown 404 listing the real pages', async ({ request }) => {
    const response = await request.get('/md/no-such-page');
    expect(response.status()).toBe(404);
    expect(response.headers()['content-type']).toContain('text/markdown');
    expect(await response.text()).toContain(`${SITE}/resume`);
  });

  test('static files ignore the Markdown Accept header', async ({ request }) => {
    const response = await request.get('/Shreejit_Verma_Resume.pdf', { headers: { Accept: 'text/markdown' } });
    expect(response.headers()['content-type']).toContain('pdf');
  });

  test('pages advertise their Markdown twin in <head>', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.locator('head link[rel="alternate"][type="text/markdown"]'), path)
        .toHaveAttribute('href', `${SITE}${markdownPath(path)}`);
    }
  });

  test('home Markdown keeps tag chips and the headline readable', async ({ request }) => {
    const body = await (await request.get('/index.md')).text();
    expect(body).toContain('# Shreejit Verma Quantitative Developer & Researcher');
    expect(body).toContain('C++20 · Verilog · FPGA');
    expect(body).not.toContain('SYSTEM_READY');
    expect(body).not.toContain('/_next/image');
  });
});

test.describe('Crawler policy and llms.txt', () => {
  test('robots.txt declares Content Signals and AI crawler groups', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=yes');
    for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'Google-Extended']) {
      expect(body, bot).toContain(`User-agent: ${bot}`);
    }
    expect(body).toContain(`Agentmap: ${SITE}/.well-known/ai-catalog.json`);
  });

  test('llms.txt links every page as Markdown and llms-full.txt contains them', async ({ request }) => {
    const index = await (await request.get('/llms.txt')).text();
    for (const { path } of PAGES) expect(index, path).toContain(`(${SITE}${markdownPath(path)})`);
    const full = await request.get('/llms-full.txt');
    expect(full.status()).toBe(200);
    const text = await full.text();
    for (const { canonical } of PAGES) expect(text, canonical).toContain(`url: "${canonical}"`);
    expect(full.headers()['cache-control']).toContain('s-maxage=');
  });
});

test.describe('Discovery documents', () => {
  test('MCP Server Card follows the server-card schema', async ({ request }) => {
    const { response, body } = await getJson(request, '/mcp/server-card');
    expect(response.headers()['content-type']).toContain('application/mcp-server-card+json');
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(body.$schema).toBe('https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json');
    expect(body.name).toMatch(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
    expect(body.remotes[0]).toMatchObject({ type: 'streamable-http', url: `${SITE}/mcp` });
    const wellKnown = await getJson(request, '/.well-known/mcp/server-card.json');
    expect(wellKnown.body).toEqual(body);
  });

  test('A2A Agent Card declares v1.0 and v0.3 JSON-RPC interfaces', async ({ request }) => {
    const { body } = await getJson(request, '/.well-known/agent-card.json');
    expect(body.name).toBeTruthy();
    expect(body.version).toBeTruthy();
    const versions = body.supportedInterfaces.map((i: { protocolVersion: string }) => i.protocolVersion).sort();
    expect(versions).toEqual(['0.3', '1.0']);
    expect(body.skills.length).toBeGreaterThan(0);
  });

  test('API catalog is an RFC 9727 linkset whose links resolve', async ({ request }) => {
    const { response, body } = await getJson(request, '/.well-known/api-catalog');
    expect(response.headers()['content-type']).toContain('application/linkset+json');
    expect(body.linkset.length).toBeGreaterThanOrEqual(3);
    for (const entry of body.linkset) {
      for (const { href } of entry['service-desc']) {
        expect((await request.get(local(href))).status(), href).toBe(200);
      }
    }
  });

  test('AI Catalog entries each have exactly one of url or data, and the urls resolve', async ({ request }) => {
    const { response, body } = await getJson(request, '/.well-known/ai-catalog.json');
    expect(response.headers()['content-type']).toContain('application/ai-catalog+json');
    expect(body.specVersion).toBeTruthy();
    expect(body.host.identifier).toBe('did:web:www.shreejitverma.com');
    for (const entry of body.entries) {
      expect(entry.identifier).toMatch(/^urn:air:shreejitverma\.com:/);
      expect(('url' in entry) !== ('data' in entry), entry.identifier).toBe(true);
      expect((await request.get(local(entry.url))).status(), entry.url).toBe(200);
    }
    const did = await getJson(request, '/.well-known/did.json');
    expect(did.body.id).toBe(body.host.identifier);
  });

  test('Agent Skills index digests match the served SKILL.md files', async ({ request }) => {
    const { body } = await getJson(request, '/.well-known/agent-skills/index.json');
    expect(body.$schema).toBe('https://schemas.agentskills.io/discovery/0.2.0/schema.json');
    for (const skill of body.skills) {
      const file = await request.get(skill.url);
      expect(file.status()).toBe(200);
      const digest = `sha256:${createHash('sha256').update(await file.body()).digest('hex')}`;
      expect(skill.digest, skill.name).toBe(digest);
    }
  });

  test('Agent Skills only serve listed skills, not inherited object keys', async ({ request }) => {
    for (const name of ['constructor', 'toString', 'unknown-skill']) {
      expect((await request.get(`/.well-known/agent-skills/${name}/SKILL.md`)).status(), name).toBe(404);
    }
  });

  test('Personal Agent Protocol manifest names this domain', async ({ request }) => {
    const { body } = await getJson(request, '/.well-known/poppy.json');
    expect(body).toMatchObject({ protocol_version: '0.1', organization: { domain: 'shreejitverma.com' }, web: {} });
  });
});

test.describe('Agent APIs', () => {
  test('resume.json is a JSON Resume with ISO month dates', async ({ request }) => {
    const { body } = await getJson(request, '/resume.json');
    expect(body.basics.name).toBe('Shreejit Verma');
    expect(body.work[0].name).toBe('Barclays');
    expect(body.work[0].endDate).toBeUndefined(); // current role
    for (const entry of [...body.work, ...body.education]) {
      expect(entry.startDate).toMatch(/^\d{4}-\d{2}$/);
      if (entry.endDate) expect(entry.endDate).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  test('search API ranks natural-language questions sensibly', async ({ request }) => {
    expect((await request.get('/api/search')).status()).toBe(400);
    const fpga = await getJson(request, `/api/search?q=${encodeURIComponent('What did he build with FPGAs?')}`);
    expect(fpga.body.results[0].title).toContain('Trishul');
    const frtb = await getJson(request, '/api/search?q=FRTB&limit=1');
    expect(frtb.body.results).toHaveLength(1);
    expect(frtb.body.results[0].title).toContain('Barclays');
  });

  test('MCP server initializes, lists read-only tools, and answers a call', async ({ request }) => {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-06-18' };
    // A 2025-era response may be framed as SSE; take the JSON-RPC payload either way.
    const rpc = async (body: object) => {
      const text = await (await request.post('/mcp', { headers, data: body })).text();
      return JSON.parse(text.startsWith('{') ? text : text.split('\n').find((l) => l.startsWith('data: '))!.slice(6));
    };
    const init = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'e2e', version: '1' } } });
    expect(init.result.serverInfo.name).toBe('com.shreejitverma/profile');
    const list = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const tools = list.result.tools as { name: string; annotations?: { readOnlyHint?: boolean } }[];
    expect(tools.map((t) => t.name)).toEqual(expect.arrayContaining(['get_profile', 'search_profile', 'read_page', 'get_resume']));
    expect(tools.every((t) => t.annotations?.readOnlyHint)).toBe(true);
    const call = await rpc({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'read_page', arguments: { path: '/resume' } } });
    expect(call.result.isError).toBeFalsy();
    expect(call.result.content[0].text).toContain('url: "https://www.shreejitverma.com/resume"');
  });

  test('A2A agent answers over JSON-RPC v1.0 and v0.3', async ({ request }) => {
    const v1 = await (await request.post('/a2a', {
      headers: { 'Content-Type': 'application/json', 'A2A-Version': '1.0' },
      data: { jsonrpc: '2.0', id: 1, method: 'SendMessage', params: { message: { messageId: 'e2e-1', role: 'ROLE_USER', parts: [{ text: 'FPGA market making' }] } } },
    })).json();
    expect(v1.result.message.role).toBe('ROLE_AGENT');
    expect(v1.result.message.parts[0].text).toContain('Trishul');

    const legacy = await (await request.post('/a2a', {
      headers: { 'Content-Type': 'application/json' },
      data: { jsonrpc: '2.0', id: 2, method: 'message/send', params: { message: { kind: 'message', messageId: 'e2e-2', role: 'user', parts: [{ kind: 'text', text: 'FRTB' }] } } },
    })).json();
    expect(legacy.result.kind).toBe('message');
    expect(legacy.result.parts[0].text).toContain('Barclays');
  });

  test('A2A agent answers a very long message quickly from its leading terms', async ({ request }) => {
    const filler = Array.from({ length: 200_000 }, (_, i) => `zq${i.toString(36)}`).join(' ');
    const started = Date.now();
    const response = await request.post('/a2a', {
      headers: { 'Content-Type': 'application/json', 'A2A-Version': '1.0' },
      data: { jsonrpc: '2.0', id: 3, method: 'SendMessage', params: { message: { messageId: 'e2e-3', role: 'ROLE_USER', parts: [{ text: `FPGA market making ${filler}` }] } } },
    });
    expect(Date.now() - started).toBeLessThan(5_000);
    const body = await response.json();
    expect(body.result.message.parts[0].text).toContain('Trishul');
  });

  test('A2A rejects a JSON body that is not a request object', async ({ request }) => {
    const response = await request.post('/a2a', { headers: { 'Content-Type': 'application/json' }, data: 'null' });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ jsonrpc: '2.0', id: null, error: { code: -32600, message: expect.any(String) } });
  });
});

test.describe('WebMCP', () => {
  test('pages register in-browser tools that work', async ({ page }) => {
    // Stand-in for a browser's WebMCP implementation: records registrations.
    await page.addInitScript(() => {
      const tools: Record<string, { execute: (input: object) => Promise<unknown> }> = {};
      Object.defineProperty(document, 'modelContext', {
        value: { registerTool: async (tool: { name: string; execute: (input: object) => Promise<unknown> }) => { tools[tool.name] = tool; } },
      });
      (window as unknown as { __webmcpTools: typeof tools }).__webmcpTools = tools;
    });
    // Agents and scanners look for tools when the page loads, so they must be
    // registered by the load event (not after hydration).
    await page.goto('/', { waitUntil: 'load' });
    expect(await page.evaluate(() => Object.keys((window as unknown as { __webmcpTools: object }).__webmcpTools).sort()))
      .toEqual(['get_resume', 'list_pages', 'open_page', 'read_page', 'search_profile']);
    const markdown = await page.evaluate(async () => {
      const tools = (window as unknown as { __webmcpTools: Record<string, { execute: (input: object) => Promise<{ markdown: string }> }> }).__webmcpTools;
      return (await tools.read_page.execute({ path: '/work/trishul' })).markdown;
    });
    expect(markdown).toContain('title: "Trishul case study"');
    const search = await page.evaluate(async () => {
      const tools = (window as unknown as { __webmcpTools: Record<string, { execute: (input: object) => Promise<{ results: { title: string }[] }> }> }).__webmcpTools;
      return tools.search_profile.execute({ query: 'FPGA', limit: 1 });
    });
    expect(search.results[0].title).toContain('Trishul');
  });
});
