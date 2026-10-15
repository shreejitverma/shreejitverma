import type { NextRequest } from 'next/server';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';
import { searchProfile } from '@/app/lib/agent/knowledge';

// GET /api/search?q=<keywords>&limit=<1-20>, described in /openapi.json.
export function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim();
  if (!query || query.length > 200) {
    return jsonResponse({ error: 'Query parameter q is required (1-200 characters).' }, 'application/json', { status: 400, cacheControl: 'no-store' });
  }
  const limitParam = Number(request.nextUrl.searchParams.get('limit') ?? 5);
  const limit = Number.isInteger(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : 5;
  const results = searchProfile(query, limit);
  return jsonResponse({ query, total: results.length, results }, 'application/json');
}

export const OPTIONS = corsPreflight;
