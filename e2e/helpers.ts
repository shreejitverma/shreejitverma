import type { ConsoleMessage } from '@playwright/test';

export const SITE = 'https://www.shreejitverma.com';

export const PAGES: { path: string; canonical: string }[] = [
  { path: '/', canonical: SITE },
  { path: '/resume', canonical: `${SITE}/resume` },
  { path: '/books', canonical: `${SITE}/books` },
  { path: '/value-investing', canonical: `${SITE}/value-investing` },
];

// Console noise from third-party services that is identifiable by message
// text alone and must not fail the suite.
const IGNORED_CONSOLE_PATTERNS = [/visitor-badge/i, /third-party cookie/i];

// Resource-load failures are only ignorable when the failing URL belongs to a
// third-party origin (unreachable or rate-limited in CI); same-origin
// failures indicate a broken first-party asset and must fail the suite.
const RESOURCE_FAILURE_PATTERNS = [/net::ERR_/i, /Failed to load resource/i];

const FIRST_PARTY_ORIGIN = 'http://localhost:3000';

// Vercel injects these analytics scripts at the platform edge; under local
// `next start` and CI they 404 without indicating a product defect.
const IGNORED_FIRST_PARTY_PATHS = [/^\/_vercel\//];

export function isIgnoredConsoleError(message: ConsoleMessage): boolean {
  const text = message.text();
  if (IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }
  if (RESOURCE_FAILURE_PATTERNS.some((pattern) => pattern.test(text))) {
    const { url } = message.location();
    if (!url) return false;
    try {
      const parsed = new URL(url);
      if (parsed.origin !== FIRST_PARTY_ORIGIN) return true;
      return IGNORED_FIRST_PARTY_PATHS.some((pattern) => pattern.test(parsed.pathname));
    } catch {
      return false;
    }
  }
  return false;
}
