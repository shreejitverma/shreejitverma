import { oauthErrorResponse, oauthPreflight, OAUTH_CORS, readParams } from '@/app/lib/auth/http';
import { revoke } from '@/app/lib/auth/server';

// RFC 7009: 200 with an empty body, also for tokens that are unknown.
export async function POST(request: Request) {
  try {
    await revoke(await readParams(request));
    return new Response(null, { status: 200, headers: { 'Cache-Control': 'no-store', ...OAUTH_CORS } });
  } catch (error) {
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
