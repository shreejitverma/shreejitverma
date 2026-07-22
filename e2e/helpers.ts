export const SITE = 'https://www.shreejitverma.com';

export const PAGES: { path: string; canonical: string }[] = [
  { path: '/', canonical: SITE },
  { path: '/resume', canonical: `${SITE}/resume` },
  { path: '/books', canonical: `${SITE}/books` },
  { path: '/value-investing', canonical: `${SITE}/value-investing` },
];

// Console/resource errors from third-party hosts that are unreachable or
// rate-limited in CI must not fail the suite.
export const IGNORED_CONSOLE_PATTERNS = [
  /visitor-badge/i,
  /net::ERR_/i,
  /Failed to load resource/i,
  /third-party cookie/i,
];
