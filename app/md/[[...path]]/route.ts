import { CONTENT_SIGNAL } from '@/app/lib/agent/constants';
import { corsPreflight, textResponse } from '@/app/lib/agent/http';
import { estimateTokens, PageFetchError, renderPageMarkdown, selfFetchOrigin } from '@/app/lib/agent/markdown';
import { findPage, SITE_PAGES } from '@/app/lib/agent/pages';
import { SITE_URL } from '@/app/lib/profile';

// Markdown twin of every page. Reached through the rewrites in
// next.config.ts: `Accept: text/markdown` on a page URL, or the page URL
// with `.md` appended (`/index.md` for the home page).
//
// Cacheable by the requesting agent only (`private`): the same URL serves
// HTML to browsers, and the HTML response cannot carry `Vary: Accept` (see
// next.config.ts), so no shared cache may store the Markdown under it.
const CACHE_CONTROL = 'private, max-age=300';

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const segments = (await params).path ?? [];
  const path = segments.length === 0 || (segments.length === 1 && segments[0] === 'index') ? '/' : `/${segments.join('/')}`;
  const page = findPage(path);
  if (!page) {
    const known = SITE_PAGES.map((p) => `- ${SITE_URL}${p.path}`).join('\n');
    return textResponse(`# Not found\n\nNo page at \`${path}\`. Pages with a Markdown version:\n\n${known}\n`, 'text/markdown', {
      status: 404, cacheControl: 'no-store', headers: { Vary: 'Accept' },
    });
  }
  try {
    const markdown = await renderPageMarkdown(page, selfFetchOrigin(request.url));
    return textResponse(markdown, 'text/markdown', {
      request,
      cacheControl: CACHE_CONTROL,
      headers: {
        Vary: 'Accept',
        'x-markdown-tokens': String(estimateTokens(markdown)),
        'Content-Signal': CONTENT_SIGNAL,
        Link: `<${SITE_URL}${page.path === '/' ? '' : page.path}>; rel="canonical"`,
      },
    });
  } catch (error) {
    if (!(error instanceof PageFetchError)) throw error;
    return textResponse(`# Unavailable\n\nThe Markdown version of ${page.path} could not be generated: ${error.message}\n`, 'text/markdown', {
      status: 502, cacheControl: 'no-store', headers: { Vary: 'Accept' },
    });
  }
}

export const OPTIONS = corsPreflight;
