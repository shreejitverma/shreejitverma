// Authorization server logic: dynamic client registration (RFC 7591), the
// authorization-code flow with mandatory PKCE (OAuth 2.1), refresh-token
// rotation, revocation (RFC 7009), and auth.md agentic registration
// (anonymous registration, claim ceremony, RFC 7523 JWT-bearer exchange).
//
// Routes are thin wrappers; every decision is made here so it can be read
// and reviewed in one place.

import * as z from 'zod/v4';
import {
  CLAIM_POLL_INTERVAL, GRANTS, ISSUER, KNOWN_RESOURCES, LIMITS, MAX_USER_CODE_ATTEMPTS, POST_CLAIM_SCOPES,
  PRE_CLAIM_SCOPES, RESOURCES, SCOPES, TTL, AUTH_PATHS, url,
} from './config';
import { authStore } from './runtime';
import {
  constantTimeEqual, pkceMatches, randomId, randomToken, sha256, signAccessToken, signConsentRequest,
  signIdentityAssertion, userCode, verifyConsentRequest, verifyIdentityAssertion, type ConsentRequest,
} from './tokens';

// ---------------------------------------------------------------------------
// Errors

// An OAuth error answered as JSON `{ error, error_description }`.
export class OAuthFailure extends Error {
  constructor(readonly code: string, description: string, readonly status = 400, readonly extra: Record<string, unknown> = {}) {
    super(description);
  }
}

// ---------------------------------------------------------------------------
// Stored records

export interface Contact {
  name: string;
  email: string;
  company?: string;
}

interface ClientRecord {
  client_id: string;
  client_name?: string;
  redirect_uris: string[];
  created: number;
}

interface CodeRecord {
  clientId: string;
  clientName?: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string[];
  resource: string;
  contact: Contact;
}

interface RefreshRecord {
  clientId: string;
  sub: string;
  scope: string[];
  resource: string;
}

// A person who approved an MCP client on the consent page.
export interface UserPrincipal {
  kind: 'user';
  contact: Contact;
  clientId: string;
  clientName?: string;
}

// An auth.md agent registration.
export interface Registration {
  kind: 'registration';
  status: 'unclaimed' | 'claimed';
  ver: number; // bumped on claim, so pre-claim tokens stop working
  claimExpires: number; // epoch ms; end of the outer claim window
  attempt?: string; // hash of the active claim_attempt_token
  contact?: Contact;
}

interface ClaimAttempt {
  regId: string;
  codeHash: string;
  email: string;
  completed: boolean;
}

const KEY = {
  client: (id: string) => `client:${id}`,
  code: (code: string) => `code:${sha256(code)}`,
  refresh: (token: string) => `rt:${sha256(token)}`,
  // A rotated refresh token, kept so a replay can be detected (RFC 9700 4.14.2).
  spentRefresh: (token: string) => `rtspent:${sha256(token)}`,
  consentUsed: (jti: string) => `consent:${jti}`,
  claimTries: (hash: string) => `cattries:${hash}`,
  user: (sub: string) => `usr:${sub}`,
  registration: (id: string) => `reg:${id}`,
  claimToken: (token: string) => `clm:${sha256(token)}`,
  claimAttempt: (hash: string) => `cat:${hash}`,
  claimPoll: (token: string) => `poll:${sha256(token)}`,
  limit: (name: string, subject: string) => `rl:${name}:${subject}`,
};

async function enforceLimit(name: string, subject: string, max: number, windowSeconds: number) {
  const count = await authStore().incr(KEY.limit(name, subject), windowSeconds);
  if (count > max) throw new OAuthFailure('rate_limited', 'Rate limit exceeded; try again later.', 429, { retry_after: windowSeconds });
}

// ---------------------------------------------------------------------------
// Input validation

const emailSchema = z.string().trim().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'A valid email is required');

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: emailSchema,
  company: z.string().trim().max(120).optional().transform((v) => v || undefined),
});

export function parseContact(input: unknown): Contact {
  const result = contactSchema.safeParse(input);
  if (!result.success) throw new OAuthFailure('invalid_request', result.error.issues[0]?.message ?? 'Invalid contact details');
  return result.data;
}

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);
const FORBIDDEN_SCHEMES = new Set(['javascript:', 'data:', 'file:', 'vbscript:', 'blob:', 'about:']);

// OAuth 2.1 redirect URIs: https, http only on loopback (native apps,
// RFC 8252 section 7.3), or a private-use scheme (RFC 8252 section 7.1).
// Never a fragment.
function isAllowedRedirectUri(value: string): boolean {
  let uri: URL;
  try {
    uri = new URL(value);
  } catch {
    return false;
  }
  if (uri.hash || FORBIDDEN_SCHEMES.has(uri.protocol)) return false;
  if (uri.protocol === 'https:') return true;
  if (uri.protocol === 'http:') return LOOPBACK.has(uri.hostname);
  // Private-use schemes must be reverse-DNS (RFC 8252 section 7.1), which also
  // keeps out OS protocol handlers such as ms-msdt: or search-ms:.
  return /^[a-z][a-z0-9+-]*(\.[a-z0-9+-]+)+:$/.test(uri.protocol);
}

// Exact string match, except a loopback redirect may use any port
// (RFC 8252 section 7.3), since native apps bind an ephemeral port.
function redirectMatches(registered: string, requested: string): boolean {
  if (registered === requested) return true;
  try {
    const a = new URL(registered);
    const b = new URL(requested);
    return a.protocol === 'http:' && LOOPBACK.has(a.hostname) && a.hostname === b.hostname && a.protocol === b.protocol
      && a.pathname === b.pathname && a.search === b.search;
  } catch {
    return false;
  }
}

function parseScopes(raw: string | null | undefined, allowed: readonly string[], fallback: readonly string[]): string[] {
  if (!raw) return [...fallback];
  const scopes = [...new Set(raw.split(' ').filter(Boolean))];
  const unknown = scopes.filter((s) => !allowed.includes(s));
  if (unknown.length) throw new OAuthFailure('invalid_scope', `Unknown scope: ${unknown.join(' ')}`);
  return scopes;
}

function parseResource(raw: string | null | undefined, fallback: string = RESOURCES.site): string {
  if (!raw) return fallback;
  if (!KNOWN_RESOURCES.includes(raw.replace(/\/$/, ''))) {
    throw new OAuthFailure('invalid_target', `Unknown resource ${raw}. Known: ${KNOWN_RESOURCES.join(', ')}`);
  }
  return raw.replace(/\/$/, '');
}

// A token request may keep the approved audience or narrow a site-wide grant
// to one endpoint, never widen it (RFC 8707).
function narrowResource(requested: string | null, granted: string): string {
  if (!requested) return granted;
  const resource = parseResource(requested);
  if (resource === granted || granted === RESOURCES.site) return resource;
  throw new OAuthFailure('invalid_target', `The grant covers ${granted} only`);
}

// ---------------------------------------------------------------------------
// Dynamic client registration (RFC 7591)

const registrationSchema = z.object({
  redirect_uris: z.array(z.string().max(2000)).min(1).max(10),
  client_name: z.string().trim().max(100).optional(),
  grant_types: z.array(z.string()).optional(),
  response_types: z.array(z.string()).optional(),
  token_endpoint_auth_method: z.string().optional(),
});

export async function registerClient(body: unknown, ip: string) {
  await enforceLimit('register', ip, LIMITS.registrationsPerIpPerHour, 3600);
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) throw new OAuthFailure('invalid_client_metadata', parsed.error.issues[0]?.message ?? 'Invalid client metadata');
  const meta = parsed.data;
  const bad = meta.redirect_uris.find((u) => !isAllowedRedirectUri(u));
  if (bad) throw new OAuthFailure('invalid_redirect_uri', `Redirect URI not allowed: ${bad}`);
  const grants = meta.grant_types ?? [GRANTS.authorizationCode, GRANTS.refreshToken];
  if (grants.some((g) => g !== GRANTS.authorizationCode && g !== GRANTS.refreshToken)) {
    throw new OAuthFailure('invalid_client_metadata', 'Only authorization_code and refresh_token grants are supported for registered clients');
  }
  if (meta.response_types && meta.response_types.some((r) => r !== 'code')) {
    throw new OAuthFailure('invalid_client_metadata', 'Only the "code" response type is supported');
  }
  // Every client is public and proves possession with PKCE; there are no
  // client secrets to issue or leak.
  if (meta.token_endpoint_auth_method && meta.token_endpoint_auth_method !== 'none') {
    throw new OAuthFailure('invalid_client_metadata', 'Only public clients (token_endpoint_auth_method "none") are supported');
  }

  const record: ClientRecord = {
    client_id: randomId('cli'),
    client_name: meta.client_name,
    redirect_uris: meta.redirect_uris,
    created: Date.now(),
  };
  await authStore().set(KEY.client(record.client_id), record, TTL.client);
  return {
    client_id: record.client_id,
    client_id_issued_at: Math.floor(record.created / 1000),
    client_name: record.client_name,
    redirect_uris: record.redirect_uris,
    grant_types: grants,
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  };
}

async function loadClient(clientId: string | null | undefined): Promise<ClientRecord | null> {
  if (!clientId || clientId.length > 100) return null;
  return authStore().get<ClientRecord>(KEY.client(clientId));
}

// ---------------------------------------------------------------------------
// Authorization endpoint

// Errors before the person decides are shown on this site and never
// redirected: registration is open, so a redirect URI is attacker-chosen
// until a person has seen and acted on the consent page (RFC 9700 4.11.2).
export type AuthorizeOutcome =
  | { kind: 'error'; message: string }
  | { kind: 'consent'; request: ConsentRequest; consentToken: string; clientName?: string };

function redirectWith(redirectUri: string, params: Record<string, string | undefined>): string {
  const target = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) target.searchParams.set(k, v);
  target.searchParams.set('iss', ISSUER); // RFC 9207 mix-up defense
  return target.toString();
}

export async function validateAuthorizeRequest(params: URLSearchParams): Promise<AuthorizeOutcome> {
  const client = await loadClient(params.get('client_id'));
  if (!client) return { kind: 'error', message: 'Unknown client_id. Register the client first (dynamic client registration).' };

  const requested = params.get('redirect_uri');
  const redirectUri = requested ?? (client.redirect_uris.length === 1 ? client.redirect_uris[0] : null);
  if (!redirectUri || !client.redirect_uris.some((r) => redirectMatches(r, redirectUri))) {
    return { kind: 'error', message: 'redirect_uri is missing or does not match a URI registered for this client.' };
  }

  const state = params.get('state') ?? undefined;
  const fail = (error: string, description: string): AuthorizeOutcome => ({ kind: 'error', message: `${error}: ${description}` });

  if (params.get('response_type') !== 'code') return fail('unsupported_response_type', 'response_type must be "code"');
  const codeChallenge = params.get('code_challenge');
  if (!codeChallenge || !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge) || params.get('code_challenge_method') !== 'S256') {
    return fail('invalid_request', 'PKCE is required: send code_challenge with code_challenge_method=S256');
  }
  let scope: string[];
  let resource: string;
  try {
    scope = parseScopes(params.get('scope'), POST_CLAIM_SCOPES, POST_CLAIM_SCOPES);
    resource = parseResource(params.get('resource'));
  } catch (error) {
    if (error instanceof OAuthFailure) return fail(error.code, error.message);
    throw error;
  }

  const request: ConsentRequest = { clientId: client.client_id, redirectUri, codeChallenge, scope, resource, state };
  return { kind: 'consent', request, consentToken: await signConsentRequest(request), clientName: client.client_name };
}

// The consent page's form posts here. Returns the redirect location.
export async function decideConsent(form: FormData, ip: string): Promise<string> {
  await enforceLimit('approve', ip, LIMITS.approvalsPerIpPerHour, 3600);
  let request: ConsentRequest;
  let jti: string;
  try {
    ({ request, jti } = await verifyConsentRequest(String(form.get('consent') ?? '')));
  } catch {
    throw new OAuthFailure('invalid_request', 'This approval page has expired. Start the connection again from your app.');
  }
  // One decision per consent page: a replayed form cannot mint more grants.
  if (!(await authStore().setIfAbsent(KEY.consentUsed(jti), 1, TTL.consentRequest))) {
    throw new OAuthFailure('invalid_request', 'This approval was already submitted. Start the connection again from your app.');
  }
  // The client or its redirect URIs could have changed since the page loaded.
  const client = await loadClient(request.clientId);
  if (!client || !client.redirect_uris.some((r) => redirectMatches(r, request.redirectUri))) {
    throw new OAuthFailure('invalid_request', 'The client is no longer registered.');
  }
  if (form.get('decision') !== 'approve') {
    return redirectWith(request.redirectUri, { error: 'access_denied', error_description: 'The person declined', state: request.state });
  }
  const contact = parseContact({ name: form.get('name'), email: form.get('email'), company: form.get('company') ?? undefined });

  const code = randomToken('code');
  const record: CodeRecord = {
    clientId: request.clientId, clientName: client.client_name, redirectUri: request.redirectUri,
    codeChallenge: request.codeChallenge, scope: request.scope, resource: request.resource, contact,
  };
  await authStore().set(KEY.code(code), record, TTL.authorizationCode);
  return redirectWith(request.redirectUri, { code, state: request.state });
}

// ---------------------------------------------------------------------------
// Token endpoint

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
  refresh_token?: string;
  identity_assertion?: string;
  assertion_expires?: string;
}

async function accessResponse(sub: string, clientId: string, scope: string[], aud: string, ver?: number): Promise<TokenResponse> {
  return {
    access_token: await signAccessToken({ sub, clientId, scope, aud, ver }),
    token_type: 'Bearer',
    expires_in: TTL.accessToken,
    scope: scope.join(' '),
  };
}

export async function token(form: URLSearchParams): Promise<TokenResponse> {
  switch (form.get('grant_type')) {
    case GRANTS.authorizationCode:
      return exchangeCode(form);
    case GRANTS.refreshToken:
      return refresh(form);
    case GRANTS.jwtBearer:
      return exchangeAssertion(form);
    case GRANTS.claim:
      return pollClaim(form);
    default:
      throw new OAuthFailure('unsupported_grant_type', `Supported grant types: ${Object.values(GRANTS).join(', ')}`);
  }
}

async function exchangeCode(form: URLSearchParams): Promise<TokenResponse> {
  const code = form.get('code');
  if (!code) throw new OAuthFailure('invalid_request', 'code is required');
  // Single use: the record is deleted as it is read.
  const record = await authStore().take<CodeRecord>(KEY.code(code));
  if (!record) throw new OAuthFailure('invalid_grant', 'Authorization code is invalid, expired, or already used');
  if (form.get('client_id') !== record.clientId) throw new OAuthFailure('invalid_grant', 'Code was issued to another client');
  const redirectUri = form.get('redirect_uri');
  if (redirectUri !== null && redirectUri !== record.redirectUri) throw new OAuthFailure('invalid_grant', 'redirect_uri does not match the authorization request');
  if (!pkceMatches(form.get('code_verifier') ?? '', record.codeChallenge)) throw new OAuthFailure('invalid_grant', 'PKCE verification failed');
  const resource = narrowResource(form.get('resource'), record.resource);

  // The principal exists only once a code is actually redeemed.
  const sub = randomId('usr');
  const principal: UserPrincipal = { kind: 'user', contact: record.contact, clientId: record.clientId, clientName: record.clientName };
  await authStore().set(KEY.user(sub), principal, TTL.refreshToken);

  const response = await accessResponse(sub, record.clientId, record.scope, resource);
  const refreshToken = randomToken('rt');
  const refreshRecord: RefreshRecord = { clientId: record.clientId, sub, scope: record.scope, resource: record.resource };
  await authStore().set(KEY.refresh(refreshToken), refreshRecord, TTL.refreshToken);
  return { ...response, refresh_token: refreshToken };
}

async function refresh(form: URLSearchParams): Promise<TokenResponse> {
  const presented = form.get('refresh_token');
  if (!presented) throw new OAuthFailure('invalid_request', 'refresh_token is required');
  // Rotation: the presented token is consumed and a new one issued.
  const record = await authStore().take<RefreshRecord>(KEY.refresh(presented));
  if (!record) {
    // A rotated token presented again means two parties hold it: revoke the
    // whole grant so neither keeps access (RFC 9700 section 4.14.2).
    const replayedSub = await authStore().get<string>(KEY.spentRefresh(presented));
    if (replayedSub) await authStore().del(KEY.user(replayedSub));
    throw new OAuthFailure('invalid_grant', 'Refresh token is invalid, expired, or already used');
  }
  await authStore().set(KEY.spentRefresh(presented), record.sub, TTL.refreshToken);
  if (form.get('client_id') !== record.clientId) throw new OAuthFailure('invalid_grant', 'Refresh token was issued to another client');
  if (!(await authStore().get<UserPrincipal>(KEY.user(record.sub)))) throw new OAuthFailure('invalid_grant', 'The grant was revoked');
  const scope = parseScopes(form.get('scope'), record.scope, record.scope); // may narrow, never widen
  const resource = narrowResource(form.get('resource'), record.resource);

  const response = await accessResponse(record.sub, record.clientId, scope, resource);
  const next = randomToken('rt');
  await authStore().set(KEY.refresh(next), { ...record }, TTL.refreshToken);
  return { ...response, refresh_token: next };
}

async function liveRegistration(regId: string): Promise<Registration | null> {
  const reg = await authStore().get<Registration>(KEY.registration(regId));
  return reg && reg.kind === 'registration' ? reg : null;
}

async function exchangeAssertion(form: URLSearchParams): Promise<TokenResponse> {
  let claims: { regId: string; ver: number };
  try {
    claims = await verifyIdentityAssertion(form.get('assertion') ?? '');
  } catch {
    throw new OAuthFailure('invalid_grant', 'identity_assertion is invalid or expired; register again');
  }
  const reg = await liveRegistration(claims.regId);
  if (!reg || reg.ver !== claims.ver) throw new OAuthFailure('invalid_grant', 'identity_assertion was revoked or superseded; register again');
  const scope = reg.status === 'claimed' ? POST_CLAIM_SCOPES : PRE_CLAIM_SCOPES;
  return accessResponse(claims.regId, claims.regId, [...scope], parseResource(form.get('resource')), reg.ver);
}

async function pollClaim(form: URLSearchParams): Promise<TokenResponse> {
  const claimToken = form.get('claim_token') ?? '';
  const regId = await authStore().get<string>(KEY.claimToken(claimToken));
  if (!regId) throw new OAuthFailure('expired_token', 'claim_token is invalid or the claim window has closed; register again');

  // RFC 8628 section 3.5: polling faster than `interval` gets slow_down.
  if (await authStore().get<number>(KEY.claimPoll(claimToken))) {
    throw new OAuthFailure('slow_down', `Poll no more than once every ${CLAIM_POLL_INTERVAL} seconds`);
  }
  await authStore().set(KEY.claimPoll(claimToken), 1, CLAIM_POLL_INTERVAL - 1 || 1);

  const reg = await liveRegistration(regId);
  if (!reg) throw new OAuthFailure('expired_token', 'The registration has expired; register again');
  if (reg.status !== 'claimed') {
    if (reg.attempt && !(await authStore().get<ClaimAttempt>(KEY.claimAttempt(reg.attempt)))) {
      throw new OAuthFailure('expired_token', 'The user_code expired; start a new claim attempt');
    }
    throw new OAuthFailure('authorization_pending', 'Waiting for the person to enter the code');
  }

  // Claimed: the claim token has done its job and is retired.
  await authStore().del(KEY.claimToken(claimToken));
  const assertion = await signIdentityAssertion(regId, reg.ver, TTL.postClaimAssertion, reg.contact?.email);
  return {
    ...(await accessResponse(regId, regId, [...POST_CLAIM_SCOPES], parseResource(form.get('resource')), reg.ver)),
    identity_assertion: assertion,
    assertion_expires: new Date(Date.now() + TTL.postClaimAssertion * 1000).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Revocation (RFC 7009): always 200, even for unknown tokens.

export async function revoke(form: URLSearchParams): Promise<void> {
  const presented = form.get('token') ?? '';
  if (presented.startsWith('rt_')) {
    const record = await authStore().take<RefreshRecord>(KEY.refresh(presented));
    // Revoking the grant ends the principal, which invalidates its
    // outstanding access tokens immediately (see resource.ts).
    if (record) await authStore().del(KEY.user(record.sub));
    return;
  }
  try {
    const { regId } = await verifyIdentityAssertion(presented);
    await authStore().del(KEY.registration(regId));
  } catch {
    // Not a token this server can revoke; RFC 7009 still answers 200.
  }
}

// ---------------------------------------------------------------------------
// auth.md agentic registration

export async function registerAgent(body: unknown, ip: string) {
  const type = (body as { type?: unknown } | null)?.type;
  if (type === 'identity_assertion') throw new OAuthFailure('identity_assertion_not_enabled', 'This service accepts only anonymous registration');
  if (type === 'service_auth') throw new OAuthFailure('service_auth_not_enabled', 'This service accepts only anonymous registration');
  if (type !== 'anonymous') throw new OAuthFailure('invalid_request', 'type must be "anonymous"');
  await enforceLimit('identity', ip, LIMITS.identitiesPerIpPerHour, 3600);

  const regId = randomId('reg');
  const claimToken = randomToken('clm');
  const now = Date.now();
  const reg: Registration = { kind: 'registration', status: 'unclaimed', ver: 1, claimExpires: now + TTL.claimWindow * 1000 };
  await authStore().set(KEY.registration(regId), reg, TTL.claimWindow);
  await authStore().set(KEY.claimToken(claimToken), regId, TTL.claimWindow);

  return {
    registration_id: regId,
    registration_type: 'anonymous',
    identity_assertion: await signIdentityAssertion(regId, reg.ver, TTL.preClaimAssertion),
    assertion_expires: new Date(now + TTL.preClaimAssertion * 1000).toISOString(),
    pre_claim_scopes: PRE_CLAIM_SCOPES,
    claim_url: url(AUTH_PATHS.agentClaim),
    claim_token: claimToken,
    claim_token_expires: new Date(reg.claimExpires).toISOString(),
    post_claim_scopes: POST_CLAIM_SCOPES,
  };
}

export async function startClaim(body: unknown) {
  const input = (body ?? {}) as { claim_token?: unknown; email?: unknown };
  const regId = await authStore().get<string>(KEY.claimToken(String(input.claim_token ?? '')));
  const reg = regId ? await liveRegistration(regId) : null;
  if (!regId || !reg) throw new OAuthFailure('claim_expired', 'The registration is gone or the claim window has closed; register again', 410);
  if (reg.status === 'claimed') throw new OAuthFailure('already_claimed', 'This registration is already claimed; poll the token endpoint', 409);
  const parsedEmail = emailSchema.safeParse(input.email);
  if (!parsedEmail.success) throw new OAuthFailure('invalid_request', 'email is required: the person who will claim this agent');
  const email = parsedEmail.data;

  // A new attempt replaces any earlier one for this registration.
  if (reg.attempt) await authStore().del(KEY.claimAttempt(reg.attempt));
  const code = userCode();
  const attemptToken = randomToken('cat');
  const attempt: ClaimAttempt = { regId, codeHash: sha256(code), email, completed: false };
  const attemptHash = sha256(attemptToken);
  await authStore().set(KEY.claimAttempt(attemptHash), attempt, TTL.claimAttempt);
  await authStore().set(KEY.registration(regId), { ...reg, attempt: attemptHash }, Math.max(1, Math.ceil((reg.claimExpires - Date.now()) / 1000)));

  const verification = new URL(url(AUTH_PATHS.claimPage));
  verification.searchParams.set('claim_attempt_token', attemptToken);
  return {
    registration_id: regId,
    claim_attempt_id: `cla_${attemptHash.slice(0, 16)}`,
    status: 'initiated',
    expires_at: new Date(Date.now() + TTL.claimAttempt * 1000).toISOString(),
    claim_attempt: {
      user_code: code,
      expires_in: TTL.claimAttempt,
      verification_uri: verification.toString(),
      interval: CLAIM_POLL_INTERVAL,
    },
  };
}

// For the claim page: who the attempt is for, without revealing the code.
export async function describeClaimAttempt(attemptToken: string): Promise<{ email: string } | null> {
  const attempt = await authStore().get<ClaimAttempt>(KEY.claimAttempt(sha256(attemptToken)));
  return attempt && !attempt.completed ? { email: attempt.email } : null;
}

// Claim page outcomes. Only these codes travel in the URL, and the page maps
// them to fixed text, so a crafted link cannot put arbitrary words on it.
export const CLAIM_ERRORS = {
  expired: 'This approval link has expired. Ask your agent for a new code.',
  wrong_code: 'That code is not correct. Check the code your agent showed you.',
  too_many: 'Too many wrong codes. Ask your agent for a new code.',
  invalid_name: 'Enter your name.',
  rate_limited: 'Too many attempts from your network. Try again later.',
} as const;
export type ClaimError = keyof typeof CLAIM_ERRORS;

// The person submits the 6-digit code the agent showed them.
export async function completeClaim(form: FormData, ip: string): Promise<void> {
  const fail = (code: ClaimError): never => {
    throw new OAuthFailure(code, CLAIM_ERRORS[code]);
  };
  const count = await authStore().incr(KEY.limit('approve', ip), 3600);
  if (count > LIMITS.approvalsPerIpPerHour) fail('rate_limited');

  const attemptHash = sha256(String(form.get('claim_attempt_token') ?? ''));
  const attempt = await authStore().get<ClaimAttempt>(KEY.claimAttempt(attemptHash));
  if (!attempt || attempt.completed) fail('expired');
  const claim = attempt!;
  let contact: Contact;
  try {
    contact = parseContact({ name: form.get('name'), email: claim.email, company: form.get('company') ?? undefined });
  } catch {
    return fail('invalid_name');
  }

  // Count the guess atomically before comparing, so parallel wrong guesses
  // cannot all be checked against the same remaining budget.
  const tries = await authStore().incr(KEY.claimTries(attemptHash), TTL.claimAttempt);
  if (tries > MAX_USER_CODE_ATTEMPTS) {
    await authStore().del(KEY.claimAttempt(attemptHash));
    fail('too_many');
  }
  if (!constantTimeEqual(sha256(String(form.get('user_code') ?? '').trim()), claim.codeHash)) {
    // The last allowed wrong guess burns the attempt; the agent must start a new one.
    if (tries >= MAX_USER_CODE_ATTEMPTS) {
      await authStore().del(KEY.claimAttempt(attemptHash));
      fail('too_many');
    }
    fail('wrong_code');
  }

  const reg = await liveRegistration(claim.regId);
  if (!reg) fail('expired');
  await authStore().set(KEY.claimAttempt(attemptHash), { ...claim, completed: true }, TTL.claimAttempt);
  // Claimed registrations live as long as their post-claim assertion.
  const claimed: Registration = { ...reg!, status: 'claimed', ver: reg!.ver + 1, contact, attempt: undefined };
  await authStore().set(KEY.registration(claim.regId), claimed, TTL.postClaimAssertion);
}

// ---------------------------------------------------------------------------
// Principals, for the resource server

export async function loadPrincipal(sub: string, ver?: number): Promise<{ contact?: Contact; label: string } | null> {
  if (sub.startsWith('usr_')) {
    const user = await authStore().get<UserPrincipal>(KEY.user(sub));
    return user ? { contact: user.contact, label: user.clientName ?? user.clientId } : null;
  }
  if (sub.startsWith('reg_')) {
    const reg = await liveRegistration(sub);
    return reg && reg.ver === ver ? { contact: reg.contact, label: `agent registration ${sub}` } : null;
  }
  return null;
}

export const SCOPE_OPPORTUNITIES = SCOPES.opportunitiesWrite;
