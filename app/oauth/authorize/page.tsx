import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthCard, { fieldClass, labelClass, primaryButton, secondaryButton } from '@/app/components/AuthCard';
import { AUTH_PATHS, SCOPE_DESCRIPTIONS } from '@/app/lib/auth/config';
import { AuthNotConfiguredError } from '@/app/lib/auth/runtime';
import { validateAuthorizeRequest } from '@/app/lib/auth/server';

export const metadata: Metadata = {
  title: 'Approve agent access',
  robots: { index: false, follow: false },
};

// OAuth 2.1 authorization endpoint: validates the request, then asks the
// person to approve the client and to say who they are.
export default async function AuthorizePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const params = new URLSearchParams(Object.entries(raw).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])));
  let outcome;
  try {
    outcome = await validateAuthorizeRequest(params);
  } catch (error) {
    if (!(error instanceof AuthNotConfiguredError)) throw error;
    outcome = { kind: 'error' as const, message: 'Agent sign-in is not available on this deployment yet.' };
  }

  if (outcome.kind === 'redirect') redirect(outcome.location);
  if (outcome.kind === 'error') {
    return (
      <AuthCard title='This connection request is not valid'>
        <p className='mb-2'>{outcome.message}</p>
        <p>Start the connection again from the app you are using.</p>
      </AuthCard>
    );
  }

  const { request, consentToken, clientName } = outcome;
  return (
    <AuthCard title='Approve agent access'>
      <p className='mb-4'>
        <strong className='text-foreground'>{clientName ?? 'An app'}</strong> wants to act for you on Shreejit Verma&apos;s site. It
        will be able to:
      </p>
      <ul className='list-disc pl-5 mb-4 space-y-1'>
        {request.scope.map((scope) => <li key={scope}>{SCOPE_DESCRIPTIONS[scope] ?? scope}</li>)}
      </ul>
      <p className='text-sm mb-6'>
        Your name, email, and company are attached to every opportunity it sends, so Shreejit can reply. They are not verified.
        Returning to <code className='break-all'>{new URL(request.redirectUri).host || request.redirectUri}</code> after you choose.
      </p>
      <form method='post' action={AUTH_PATHS.authorizeDecision} className='space-y-4'>
        <input type='hidden' name='consent' value={consentToken} />
        <label className={labelClass}>Your name
          <input className={fieldClass} name='name' required maxLength={100} autoComplete='name' />
        </label>
        <label className={labelClass}>Your email
          <input className={fieldClass} name='email' type='email' required maxLength={254} autoComplete='email' />
        </label>
        <label className={labelClass}>Company (optional)
          <input className={fieldClass} name='company' maxLength={120} autoComplete='organization' />
        </label>
        <div className='flex gap-3 pt-2'>
          <button className={primaryButton} type='submit' name='decision' value='approve'>Approve</button>
          <button className={secondaryButton} type='submit' name='decision' value='deny' formNoValidate>Deny</button>
        </div>
      </form>
    </AuthCard>
  );
}
