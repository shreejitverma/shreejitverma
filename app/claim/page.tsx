import type { Metadata } from 'next';
import AuthCard, { fieldClass, labelClass, primaryButton } from '@/app/components/AuthCard';
import { AUTH_PATHS, SCOPE_DESCRIPTIONS, SCOPES } from '@/app/lib/auth/config';
import { AuthNotConfiguredError } from '@/app/lib/auth/runtime';
import { CLAIM_ERRORS, describeClaimAttempt, type ClaimError } from '@/app/lib/auth/server';

export const metadata: Metadata = {
  title: 'Approve your agent',
  robots: { index: false, follow: false },
};

// auth.md claim ceremony: the person types the 6-digit code their agent
// showed them, which lets that agent send opportunities on their behalf.
export default async function ClaimPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const one = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : undefined);

  if (one('status') === 'claimed') {
    return (
      <AuthCard title='Your agent is approved'>
        <p>Go back to your agent. It can now send opportunities to Shreejit Verma on your behalf.</p>
      </AuthCard>
    );
  }

  const attemptToken = one('claim_attempt_token') ?? '';
  let attempt: { email: string } | null = null;
  try {
    attempt = attemptToken ? await describeClaimAttempt(attemptToken) : null;
  } catch (error) {
    if (!(error instanceof AuthNotConfiguredError)) throw error;
  }
  if (!attempt) {
    return (
      <AuthCard title='This approval link has expired'>
        <p>Ask your agent for a new link and code. Links last ten minutes.</p>
      </AuthCard>
    );
  }

  // Only known codes are shown, as fixed text; anything else in the URL is ignored.
  const errorCode = one('error');
  const error = errorCode && errorCode in CLAIM_ERRORS ? CLAIM_ERRORS[errorCode as ClaimError] : undefined;
  return (
    <AuthCard title='Approve your agent'>
      <p className='mb-4'>
        An agent asked to act for <strong className='text-foreground'>{attempt.email}</strong>. If you approve, it will be able to:
      </p>
      <ul className='list-disc pl-5 mb-4'>
        <li>{SCOPE_DESCRIPTIONS[SCOPES.opportunitiesWrite]}</li>
      </ul>
      <p className='text-sm mb-6'>Only continue if you started this from your own agent and it showed you a 6-digit code. Your name, email, and company are attached to what it sends; they are not verified.</p>
      {error && <p role='alert' className='mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-foreground'>{error}</p>}
      <form method='post' action={AUTH_PATHS.claimComplete} className='space-y-4'>
        <input type='hidden' name='claim_attempt_token' value={attemptToken} />
        <label className={labelClass}>6-digit code from your agent
          <input className={`${fieldClass} font-mono tracking-widest`} name='user_code' required inputMode='numeric' pattern='[0-9]{6}' maxLength={6} autoComplete='one-time-code' />
        </label>
        <label className={labelClass}>Your name
          <input className={fieldClass} name='name' required maxLength={100} autoComplete='name' />
        </label>
        <label className={labelClass}>Company (optional)
          <input className={fieldClass} name='company' maxLength={120} autoComplete='organization' />
        </label>
        <button className={primaryButton} type='submit'>Approve agent</button>
      </form>
    </AuthCard>
  );
}
