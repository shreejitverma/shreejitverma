// Response helpers for the public, read-only agent endpoints.

import { createHash } from 'node:crypto';
import { PUBLIC_CORS } from './constants';

// Discovery documents and API responses change only on deploy. Vercel's CDN
// caches per deployment, so s-maxage cannot serve stale content after a
// release; max-age bounds how long clients keep their own copy.
const CACHEABLE = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

interface ResponseInit {
  cacheControl?: string;
  status?: number;
  headers?: Record<string, string>;
  // The incoming request, so a matching If-None-Match gets a 304 instead of
  // the full body. Crawlers and agents that revalidate then pay one round
  // trip and no transfer.
  request?: Request;
}

// Strong validator over the exact bytes served (RFC 9110 section 8.8.3).
function entityTag(body: string): string {
  return `"${createHash('sha256').update(body, 'utf8').digest('base64url').slice(0, 27)}"`;
}

// RFC 9110 section 13.1.2: If-None-Match is a list of entity tags or `*`,
// compared weakly, so a W/ prefix from an intermediary still matches.
function matchesIfNoneMatch(header: string | null, etag: string): boolean {
  if (!header) return false;
  if (header.trim() === '*') return true;
  return header.split(',').some((tag) => tag.trim().replace(/^W\//, '') === etag);
}

export function textResponse(body: string, contentType: string, init: ResponseInit = {}): Response {
  const status = init.status ?? 200;
  const headers: Record<string, string> = {
    'Content-Type': `${contentType}; charset=utf-8`,
    'Cache-Control': init.cacheControl ?? CACHEABLE,
    ...PUBLIC_CORS,
    ...init.headers,
  };
  // Only successful representations get a validator; an error body must never
  // be revalidated into a 304 that a client would treat as fresh content.
  if (status !== 200) return new Response(body, { status, headers });

  const etag = entityTag(body);
  headers.ETag = etag;
  if (matchesIfNoneMatch(init.request?.headers.get('if-none-match') ?? null, etag)) {
    // A 304 carries the validator and caching fields but no representation
    // metadata such as Content-Type (RFC 9110 section 15.4.5).
    delete headers['Content-Type'];
    return new Response(null, { status: 304, headers });
  }
  return new Response(body, { status, headers });
}

export function jsonResponse(body: unknown, contentType = 'application/json', init: ResponseInit = {}): Response {
  return textResponse(JSON.stringify(body, null, 2), contentType, init);
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: { ...PUBLIC_CORS, 'Access-Control-Max-Age': '86400' } });
}
