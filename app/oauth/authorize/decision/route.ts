import { decideConsent, OAuthFailure } from '@/app/lib/auth/server';
import { AuthNotConfiguredError } from '@/app/lib/auth/runtime';
import { notConfigured } from '@/app/lib/auth/resource';

// The consent form posts here; the answer is a 303 back to the client.
export async function POST(request: Request) {
  try {
    const location = await decideConsent(await request.formData());
    return new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof AuthNotConfiguredError) return notConfigured(error);
    const message = error instanceof OAuthFailure ? error.message : 'Something went wrong. Start the connection again from your app.';
    if (!(error instanceof OAuthFailure)) console.error('consent decision failed', error);
    return new Response(`${message}\n`, { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
}
