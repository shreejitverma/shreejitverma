import { completeClaim, OAuthFailure } from '@/app/lib/auth/server';
import { AuthNotConfiguredError } from '@/app/lib/auth/runtime';
import { notConfigured } from '@/app/lib/auth/resource';

// The claim page's form posts here; answers redirect back to the page.
export async function POST(request: Request) {
  const form = await request.formData();
  const back = new URL('/claim', request.url);
  try {
    await completeClaim(form);
    back.searchParams.set('status', 'claimed');
  } catch (error) {
    if (error instanceof AuthNotConfiguredError) return notConfigured(error);
    if (!(error instanceof OAuthFailure)) console.error('claim completion failed', error);
    back.searchParams.set('claim_attempt_token', String(form.get('claim_attempt_token') ?? ''));
    back.searchParams.set('error', error instanceof OAuthFailure ? error.message : 'Something went wrong. Try again.');
  }
  return new Response(null, { status: 303, headers: { Location: back.pathname + back.search, 'Cache-Control': 'no-store' } });
}
