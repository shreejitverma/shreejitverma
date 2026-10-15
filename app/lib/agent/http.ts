// Response helpers for the public, read-only agent endpoints.

import { PUBLIC_CORS } from './constants';

// Discovery documents and API responses change only on deploy. Vercel's CDN
// caches per deployment, so s-maxage cannot serve stale content after a
// release; max-age bounds how long clients keep their own copy.
const CACHEABLE = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

export function jsonResponse(body: unknown, contentType = 'application/json', init?: { cacheControl?: string; status?: number }): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: init?.status ?? 200,
    headers: { 'Content-Type': `${contentType}; charset=utf-8`, 'Cache-Control': init?.cacheControl ?? CACHEABLE, ...PUBLIC_CORS },
  });
}

export function textResponse(body: string, contentType: string, init?: { cacheControl?: string; status?: number; headers?: Record<string, string> }): Response {
  return new Response(body, {
    status: init?.status ?? 200,
    headers: { 'Content-Type': `${contentType}; charset=utf-8`, 'Cache-Control': init?.cacheControl ?? CACHEABLE, ...PUBLIC_CORS, ...init?.headers },
  });
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: { ...PUBLIC_CORS, 'Access-Control-Max-Age': '86400' } });
}
