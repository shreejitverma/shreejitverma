import { oauthErrorResponse, oauthJson, oauthPreflight, readJson } from '@/app/lib/auth/http';
import { startClaim } from '@/app/lib/auth/server';

// auth.md claim ceremony: mints a user_code and verification_uri.
export async function POST(request: Request) {
  try {
    return oauthJson(await startClaim(await readJson(request)));
  } catch (error) {
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
