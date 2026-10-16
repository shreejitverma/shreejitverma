import { oauthErrorResponse, OAUTH_CORS } from '@/app/lib/auth/http';
import { authSigningKey } from '@/app/lib/auth/runtime';

// Public key for verifying tokens this server signs (RFC 7517).
export async function GET() {
  try {
    const { publicJwk } = await authSigningKey();
    return Response.json({ keys: [publicJwk] }, { headers: { 'Content-Type': 'application/jwk-set+json', 'Cache-Control': 'public, max-age=3600', ...OAUTH_CORS } });
  } catch (error) {
    return oauthErrorResponse(error);
  }
}
