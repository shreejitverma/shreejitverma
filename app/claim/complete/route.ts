import { CLAIM_ERRORS, completeClaim, OAuthFailure } from '@/app/lib/auth/server';
import { AuthNotConfiguredError } from '@/app/lib/auth/runtime';
import { notConfigured } from '@/app/lib/auth/resource';
import { clientIp } from '@/app/lib/auth/http';

// The claim page's form posts here; answers redirect back to the page with
// either status=claimed or an error code (never free text).
export async function POST(request: Request) {
  const form = await request.formData();
  const back = new URL('/claim', request.url);
  try {
    await completeClaim(form, clientIp(request));
    back.searchParams.set('status', 'claimed');
  } catch (error) {
    if (error instanceof AuthNotConfiguredError) return notConfigured(error);
    if (!(error instanceof OAuthFailure)) console.error('claim completion failed', error);
    back.searchParams.set('claim_attempt_token', String(form.get('claim_attempt_token') ?? ''));
    back.searchParams.set('error', error instanceof OAuthFailure && error.code in CLAIM_ERRORS ? error.code : 'expired');
  }
  return new Response(null, { status: 303, headers: { Location: back.pathname + back.search, 'Cache-Control': 'no-store' } });
}
