import { authMd } from '@/app/lib/auth/metadata';
import { corsPreflight, textResponse } from '@/app/lib/agent/http';

// Instructions for agents (https://workos.com/auth-md).
export function GET(request: Request) {
  return textResponse(authMd(), 'text/markdown', { request });
}

export const OPTIONS = corsPreflight;
