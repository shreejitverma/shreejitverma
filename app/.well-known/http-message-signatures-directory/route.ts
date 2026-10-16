import { AuthNotConfiguredError } from '@/app/lib/auth/runtime';
import { signedDirectory } from '@/app/lib/agent/web-bot-auth';

// Web Bot Auth key directory: the public keys this site signs its bot
// requests with. Signed per request (the signature covers the authority and
// expires in minutes), so it is never cached by a shared cache.
export async function GET(request: Request) {
  try {
    const { body, headers } = await signedDirectory(new URL(request.url).host);
    return new Response(body, { headers: { ...headers, 'Cache-Control': 'public, max-age=60', 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    if (!(error instanceof AuthNotConfiguredError)) throw error;
    return Response.json({ error: 'not_configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
