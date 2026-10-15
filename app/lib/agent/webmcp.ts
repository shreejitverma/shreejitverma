// WebMCP (https://webmachinelearning.github.io/webmcp/): exposes this site's
// actions as tools to AI agents running in the visitor's browser.
//
// Shipped as an inline <head> script rather than a React effect: effects run
// after hydration, which is after the `load` event, and agents (and
// Cloudflare's Agent Readiness scanner) look for tools when the page loads.
// The script only defines tools; it does nothing in browsers without the API.
// e2e/agent-ready.spec.ts registers and executes every tool.

import { AGENT_PATHS } from './constants';
import type { SitePage } from './pages';

export function webMcpScript(pages: Pick<SitePage, 'path' | 'title' | 'summary'>[]): string {
  return `(() => {
  const mc = document.modelContext || navigator.modelContext;
  if (!mc || typeof mc.registerTool !== 'function') return;
  const pages = ${JSON.stringify(pages)};
  const known = new Set(pages.map((p) => p.path));
  const pagePath = (path) => {
    const value = typeof path === 'string' ? (path.split('#')[0] || '/') : '';
    if (!known.has(value)) throw new Error('Unknown page "' + path + '". Known pages: ' + [...known].join(', '));
    return value;
  };
  const get = async (url, init) => {
    const response = await fetch(url, init);
    if (!response.ok) throw new Error(url + ' returned HTTP ' + response.status);
    return response;
  };
  const noArgs = { type: 'object', properties: {} };
  const pathArg = (description) => ({ type: 'object', properties: { path: { type: 'string', description } }, required: ['path'] });
  const tools = [
    {
      name: 'search_profile',
      title: 'Search the profile',
      description: "Keyword search across Shreejit Verma's experience, projects, education, skills, awards, and articles. Returns ranked facts with source URLs.",
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Keywords, e.g. "market making C++"' },
          limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Maximum results, default 5' },
        },
        required: ['query'],
      },
      annotations: { readOnlyHint: true },
      execute: async ({ query, limit }) =>
        (await get('${AGENT_PATHS.search}?' + new URLSearchParams({ q: String(query || ''), limit: String(limit || 5) }))).json(),
    },
    {
      name: 'get_resume',
      title: 'Get the resume',
      description: 'The complete resume as a JSON Resume document: work, education, projects, skills, awards, certificates, and contact details.',
      inputSchema: noArgs,
      annotations: { readOnlyHint: true },
      execute: async () => (await get('${AGENT_PATHS.resumeJson}')).json(),
    },
    {
      name: 'list_pages',
      title: 'List site pages',
      description: 'Every page on this site with its path and a one-line summary.',
      inputSchema: noArgs,
      annotations: { readOnlyHint: true },
      execute: async () => pages,
    },
    {
      name: 'read_page',
      title: 'Read a page as Markdown',
      description: 'The full content of one page on this site as Markdown. Use list_pages for valid paths.',
      inputSchema: pathArg('Page path, e.g. "/resume" or "/work/trishul"'),
      annotations: { readOnlyHint: true },
      execute: async ({ path }) => ({ path, markdown: await (await get(pagePath(path), { headers: { Accept: 'text/markdown' } })).text() }),
    },
    {
      name: 'open_page',
      title: 'Open a page',
      description: 'Navigate this browser tab to a page on the site, optionally at a section (for example "/#experience").',
      inputSchema: pathArg('Page path, optionally with a #section, e.g. "/resume" or "/#projects"'),
      execute: async ({ path }) => {
        pagePath(path);
        location.assign(path);
        return { opened: path };
      },
    },
  ];
  for (const tool of tools) {
    // Rejects when the browser withholds the tools permission or the name is
    // taken; the page is unaffected either way.
    Promise.resolve(mc.registerTool(tool)).catch((error) => console.warn('WebMCP: could not register ' + tool.name, error));
  }
})();`;
}
