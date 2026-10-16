import { clientIp, oauthErrorResponse, oauthJson, oauthPreflight, readJson } from '@/app/lib/auth/http';
import { registerClient } from '@/app/lib/auth/server';

// RFC 7591 dynamic client registration (public clients only).
export async function POST(request: Request) {
  try {
    return oauthJson(await registerClient(await readJson(request), clientIp(request)), 201);
  } catch (error) {
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
