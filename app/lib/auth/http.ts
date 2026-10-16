// HTTP plumbing shared by the OAuth and agent-registration endpoints.

import { AuthNotConfiguredError } from './runtime';
import { notConfigured } from './resource';
import { OAuthFailure } from './server';

// Public clients (browser-based MCP inspectors, agents) call these endpoints
// cross-origin. No cookies or ambient credentials are involved, so `*` is safe.
export const OAUTH_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version',
  'Access-Control-Expose-Headers': 'WWW-Authenticate',
} as const;

// RFC 6749 section 5.1: token responses and errors must not be cached.
const NO_STORE = { 'Cache-Control': 'no-store', Pragma: 'no-cache' } as const;

export function oauthJson(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...OAUTH_CORS } });
}

export function oauthPreflight(): Response {
  return new Response(null, { status: 204, headers: { ...OAUTH_CORS, 'Access-Control-Max-Age': '86400' } });
}

// Maps a failure to its OAuth JSON error; anything unexpected is a 500 that
// reveals nothing, and is logged for the operator.
export function oauthErrorResponse(error: unknown): Response {
  if (error instanceof OAuthFailure) {
    return oauthJson({ error: error.code, error_description: error.message, ...error.extra }, error.status);
  }
  if (error instanceof AuthNotConfiguredError) return notConfigured(error);
  console.error('oauth endpoint failed', error);
  return oauthJson({ error: 'server_error', error_description: 'Unexpected error' }, 500);
}

// The connecting client as seen by Vercel's edge. `x-real-ip` is set by the
// platform and cannot be supplied by the client; headers like
// cf-connecting-ip are ignored because a client hitting Vercel directly could
// forge them to dodge rate limits.
export function clientIp(request: Request): string {
  return request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

// Token and revocation requests are form-encoded (RFC 6749); JSON is accepted
// too because some agents send it.
export async function readParams(request: Request): Promise<URLSearchParams> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') throw new OAuthFailure('invalid_request', 'Body must be a JSON object');
    return new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)]));
  }
  return new URLSearchParams(await request.text());
}

export async function readJson(request: Request): Promise<unknown> {
  const body = await request.json().catch(() => undefined);
  if (body === undefined) throw new OAuthFailure('invalid_request', 'Body must be JSON');
  return body;
}
