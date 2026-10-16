import { oauthErrorResponse, oauthJson, oauthPreflight, readParams } from '@/app/lib/auth/http';
import { token } from '@/app/lib/auth/server';

export async function POST(request: Request) {
  try {
    return oauthJson(await token(await readParams(request)));
  } catch (error) {
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
