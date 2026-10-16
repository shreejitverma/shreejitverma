import { clientIp, oauthErrorResponse, oauthJson, oauthPreflight, readJson } from '@/app/lib/auth/http';
import { registerAgent } from '@/app/lib/auth/server';

// auth.md agentic registration (anonymous identity type).
export async function POST(request: Request) {
  try {
    return oauthJson(await registerAgent(await readJson(request), clientIp(request)));
  } catch (error) {
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
