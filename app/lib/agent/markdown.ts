// Markdown rendering of site pages for AI agents.
//
// The Markdown is converted from the page's own rendered HTML rather than
// written separately, so it can never drift from what a browser shows. Only
// <main> is converted: navigation, footer, and decorative elements are
// dropped, links are made absolute, and Next.js image-optimizer URLs are
// unwrapped to the original asset.

import { NodeHtmlMarkdown } from 'node-html-markdown';
import { parse, TextNode, type HTMLElement } from 'node-html-parser';
import { SITE_URL } from '../profile';
import type { SitePage } from './pages';
import { signedBotHeaders } from './web-bot-auth';

// Elements with no content for a reader of the Markdown. `aria-hidden` marks
// decoration for screen readers, which is the same audience test.
const DROP_SELECTOR = [
  'script', 'style', 'noscript', 'template', 'svg', 'canvas', 'iframe', 'button',
  '[aria-hidden="true"]', '[data-agent="skip"]',
].join(', ');

// Inline elements that pages render as separate visual items (tag chips,
// button rows). With no whitespace between them their text would run
// together, so a separator is inserted between adjacent siblings.
const INLINE_TAGS = new Set(['a', 'span', 'code', 'strong', 'em', 'b', 'i', 'small', 'time', 'abbr']);
const INLINE_SEPARATOR = ' · ';

const converter = new NodeHtmlMarkdown({ bulletMarker: '-', codeFence: '```', maxConsecutiveNewlines: 2 });

function isInlineElement(node: unknown): node is HTMLElement {
  return typeof node === 'object' && node !== null && 'rawTagName' in node
    && INLINE_TAGS.has(String((node as HTMLElement).rawTagName).toLowerCase());
}

function absolutize(value: string, pageUrl: string): string {
  try {
    return new URL(value, pageUrl).toString();
  } catch {
    return value;
  }
}

// `/_next/image?url=%2Fimages%2Fx.jpg&w=3840&q=75` -> `<site>/images/x.jpg`
function unwrapOptimizedImage(src: string, pageUrl: string): string {
  const url = new URL(src, pageUrl);
  const original = url.pathname === '/_next/image' ? url.searchParams.get('url') : null;
  return absolutize(original ?? src, pageUrl);
}

export function htmlToMarkdown(html: string, pageUrl: string): string {
  const root = parse(html, { comment: false });
  const main = root.querySelector('main') ?? root.querySelector('body') ?? root;

  for (const el of main.querySelectorAll(DROP_SELECTOR)) el.remove();
  for (const el of main.querySelectorAll('a[href]')) el.setAttribute('href', absolutize(el.getAttribute('href')!, pageUrl));
  for (const el of main.querySelectorAll('img[src]')) {
    el.setAttribute('src', unwrapOptimizedImage(el.getAttribute('src')!, pageUrl));
    el.removeAttribute('srcset');
  }

  for (const el of main.querySelectorAll('*')) {
    const children = el.childNodes;
    for (let i = children.length - 1; i > 0; i--) {
      if (isInlineElement(children[i]) && isInlineElement(children[i - 1])) {
        children.splice(i, 0, new TextNode(INLINE_SEPARATOR, el));
      }
    }
  }

  return converter
    .translate(main.innerHTML)
    // The converter percent-encodes `_` in link targets to dodge emphasis
    // parsing; CommonMark does not need that inside `(...)`, and `%5F` and `_`
    // are the same URL (RFC 3986 unreserved character).
    .replaceAll('%5F', '_')
    // Icons removed above leave a leading space inside link text.
    .replace(/\[\s+/g, '[')
    .trim();
}

// Rough token count (about 4 characters per token for English prose), sent
// as `x-markdown-tokens` so an agent can budget context before reading.
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function frontmatter(page: SitePage): string {
  const fields: [string, string | undefined][] = [
    ['title', page.title],
    ['description', page.summary],
    ['url', `${SITE_URL}${page.path === '/' ? '' : page.path}`],
    ['published', page.published],
    ['author', 'Shreejit Verma'],
  ];
  const lines = fields.filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join('\n')}\n---`;
}

export class PageFetchError extends Error {}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

// Origin to fetch this deployment's own HTML from, given the URL of the
// request being served. Production always reads the canonical site. Other
// deployments (local, preview) read themselves. A loopback host is always
// plain HTTP: behind a TLS-terminating proxy or tunnel, Next.js reports the
// forwarded `https` scheme with the local host, which `next start` does not
// serve.
export function selfFetchOrigin(requestUrl: string): string {
  if (process.env.VERCEL_ENV === 'production') return SITE_URL;
  const url = new URL(requestUrl);
  if (LOOPBACK_HOSTS.has(url.hostname)) url.protocol = 'http:';
  return url.origin;
}

// Converts this deployment's own HTML for `page`; `origin` comes from
// selfFetchOrigin. On a protected Vercel preview the request carries the
// automation bypass secret when the project has one configured.
export async function renderPageMarkdown(page: SitePage, origin: string): Promise<string> {
  // A named User-Agent for analytics, and a Web Bot Auth signature that
  // proves the request comes from this site (unlike the User-Agent, it cannot
  // be copied). Pay per crawl never charges this bot either way.
  const target = new URL(page.path, origin);
  const headers: Record<string, string> = {
    accept: 'text/html',
    'user-agent': `shreejitverma-markdown/1.0 (+${SITE_URL})`,
    ...(await signedBotHeaders(target)),
  };
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypass && process.env.VERCEL_ENV !== 'production') headers['x-vercel-protection-bypass'] = bypass;

  let response: Response;
  try {
    response = await fetch(target, { headers, redirect: 'follow', signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    // DNS, TLS, connection, and timeout failures reject instead of returning
    // a response; report them like an HTTP failure so callers answer 502.
    throw new PageFetchError(`GET ${page.path} from ${origin} failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  if (!response.ok || !(response.headers.get('content-type') ?? '').includes('text/html')) {
    throw new PageFetchError(`GET ${page.path} returned ${response.status} ${response.headers.get('content-type') ?? ''}`.trim());
  }
  const pageUrl = `${SITE_URL}${page.path}`;
  return `${frontmatter(page)}\n\n${htmlToMarkdown(await response.text(), pageUrl)}\n`;
}
