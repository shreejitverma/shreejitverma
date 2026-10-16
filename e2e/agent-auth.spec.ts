import { createHash, randomBytes, webcrypto } from 'node:crypto';
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { verify } from 'web-bot-auth';
import { verifierFromJWK } from 'web-bot-auth/crypto';
import { signedBotHeaders } from '../app/lib/agent/web-bot-auth';
import { SITE } from './helpers';

// Agent authentication: OAuth 2.1 (dynamic registration, authorization code
// with PKCE, refresh rotation, revocation), auth.md agentic registration with
// the claim ceremony, the protected opportunity endpoints, and Web Bot Auth.
// Expected values come from the specs (RFC 6749, 7009, 7591, 7636, 8414,
// 9207, 9728, 9421, auth.md), not from the implementation.

const REDIRECT = 'http://127.0.0.1:8765/cb';
const OPPORTUNITY = {
  role: 'Senior Quantitative Developer',
  company: 'Example Capital',
  location: 'New York, hybrid',
  description: 'Low-latency C++ market making on the US equities desk; FPGA experience valued.',
};

// RFC 7636 appendix B: code_challenge = BASE64URL(SHA256(ASCII(code_verifier))).
function pkcePair() {
  const verifier = randomBytes(32).toString('base64url');
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
}

// Rate limits are per client IP. Vercel sets x-real-ip itself, so clients
// cannot choose it in production; locally each test uses its own address so
// one test's registrations never count against another's.
const freshIp = () => ({ 'x-real-ip': `10.${randomBytes(3).join('.')}` });

async function registerClient(request: APIRequestContext) {
  const response = await request.post('/oauth/register', { headers: freshIp(), data: { redirect_uris: [REDIRECT], client_name: 'E2E Recruiter Bot' } });
  expect(response.status()).toBe(201);
  return (await response.json()).client_id as string;
}

function authorizeUrl(clientId: string, challenge: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: REDIRECT, code_challenge: challenge,
    code_challenge_method: 'S256', state: 'xyz', resource: SITE, ...extra,
  });
  return `/oauth/authorize?${params}`;
}

// The client's redirect URI as the browser requested it. Nothing listens on
// that port, so the navigation itself fails; the request is what matters.
// (page.route cannot be used: it does not see requests produced by a redirect.)
function redirectRequest(page: Page): Promise<URL> {
  return page.waitForRequest((r) => r.url().startsWith(REDIRECT)).then((r) => new URL(r.url()));
}

// Approves (or denies) on the consent page; returns where the client was sent.
// Each call uses its own tab: the previous redirect ends on Chromium's error
// page, and that navigation would otherwise race the next page.goto.
async function approve(page: Page, path: string, decision: 'approve' | 'deny' = 'approve'): Promise<URL> {
  const tab = await page.context().newPage();
  try {
    await tab.goto(path);
    if (decision === 'approve') {
      await tab.getByLabel('Your name').fill('Ada Recruiter');
      await tab.getByLabel('Your email').fill('ada@example.com');
      await tab.getByLabel('Company (optional)').fill('Example Capital');
    }
    const redirected = redirectRequest(tab);
    await tab.getByRole('button', { name: decision === 'approve' ? 'Approve' : 'Deny' }).click();
    return await redirected;
  } finally {
    await tab.close();
  }
}

async function form(request: APIRequestContext, path: string, fields: Record<string, string>) {
  return request.post(path, { form: fields });
}

test.describe('Discovery', () => {
  test('authorization server metadata (RFC 8414) with the auth.md agent_auth block', async ({ request }) => {
    const meta = await (await request.get('/.well-known/oauth-authorization-server')).json();
    expect(meta.issuer).toBe(SITE);
    for (const field of ['authorization_endpoint', 'token_endpoint', 'jwks_uri', 'registration_endpoint', 'revocation_endpoint']) {
      expect(meta[field], field).toMatch(new RegExp(`^${SITE}/`));
    }
    expect(meta.code_challenge_methods_supported).toEqual(['S256']);
    expect(meta.grant_types_supported).toEqual(expect.arrayContaining(['authorization_code', 'urn:ietf:params:oauth:grant-type:jwt-bearer']));
    expect(meta.agent_auth.skill).toBe(`${SITE}/auth.md`);
    expect(meta.agent_auth.identity_types_supported).toEqual(['anonymous']);
  });

  test('protected resource metadata (RFC 9728) for the site and each endpoint', async ({ request }) => {
    for (const [path, resource] of [['', SITE], ['/mcp/recruiter', `${SITE}/mcp/recruiter`], ['/api/opportunities', `${SITE}/api/opportunities`]]) {
      const meta = await (await request.get(`/.well-known/oauth-protected-resource${path}`)).json();
      expect(meta.resource, path).toBe(resource);
      expect(meta.authorization_servers).toEqual([SITE]);
      expect(meta.bearer_methods_supported).toEqual(['header']);
    }
  });

  test('auth.md is Markdown with an H1 naming auth.md', async ({ request }) => {
    const response = await request.get('/auth.md');
    expect(response.headers()['content-type']).toContain('text/markdown');
    expect((await response.text()).split('\n')[0]).toMatch(/^# .*auth\.md/);
  });

  test('JWKS publishes an Ed25519 public key and never the private part', async ({ request }) => {
    const { keys } = await (await request.get('/oauth/jwks.json')).json();
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatchObject({ kty: 'OKP', crv: 'Ed25519', alg: 'EdDSA' });
    expect(keys[0].d).toBeUndefined();
  });

  test('protected endpoints challenge with a resource_metadata pointer', async ({ request }) => {
    for (const path of ['/api/opportunities', '/mcp/recruiter']) {
      const response = await request.post(path, { data: {} });
      expect(response.status(), path).toBe(401);
      expect(response.headers()['www-authenticate']).toContain(`resource_metadata="${SITE}/.well-known/oauth-protected-resource${path}"`);
    }
  });
});

test.describe('Authorization code flow', () => {
  test('consent, PKCE exchange, MCP and REST use, refresh rotation, revocation', async ({ page, request }) => {
    const clientId = await registerClient(request);
    const { verifier, challenge } = pkcePair();
    const landed = await approve(page, authorizeUrl(clientId, challenge));
    // RFC 9207: the issuer is returned with the code.
    expect(landed.searchParams.get('iss')).toBe(SITE);
    expect(landed.searchParams.get('state')).toBe('xyz');
    const code = landed.searchParams.get('code')!;

    const exchange = { grant_type: 'authorization_code', code, client_id: clientId, redirect_uri: REDIRECT };
    // A wrong verifier fails, and the failed attempt burns the code.
    expect((await form(request, '/oauth/token', { ...exchange, code_verifier: pkcePair().verifier })).status()).toBe(400);
    expect((await (await form(request, '/oauth/token', { ...exchange, code_verifier: verifier })).json()).error).toBe('invalid_grant');

    // Fresh approval, correct verifier.
    const second = pkcePair();
    const code2 = (await approve(page, authorizeUrl(clientId, second.challenge))).searchParams.get('code')!;
    const tokenResponse = await form(request, '/oauth/token', { ...exchange, code: code2, code_verifier: second.verifier });
    expect(tokenResponse.status()).toBe(200);
    expect(tokenResponse.headers()['cache-control']).toContain('no-store');
    const tokens = await tokenResponse.json();
    expect(tokens.token_type).toBe('Bearer');
    // Single use: replaying the code fails.
    expect((await form(request, '/oauth/token', { ...exchange, code: code2, code_verifier: second.verifier })).status()).toBe(400);

    const auth = { Authorization: `Bearer ${tokens.access_token}` };
    const mcp = await request.post('/mcp/recruiter', {
      headers: { ...auth, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-06-18' },
      data: { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'whoami', arguments: {} } },
    });
    expect(mcp.status()).toBe(200);
    const mcpText = await mcp.text();
    expect(mcpText).toContain('ada@example.com');

    const submitted = await request.post('/api/opportunities', { headers: auth, data: OPPORTUNITY });
    expect(submitted.status()).toBe(201);
    expect((await submitted.json()).reference).toMatch(/^opp_/);

    // Refresh rotates: the new token works, the old one is spent.
    const refreshed = await (await form(request, '/oauth/token', { grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: clientId })).json();
    expect(refreshed.refresh_token).toBeTruthy();
    expect(refreshed.refresh_token).not.toBe(tokens.refresh_token);
    expect((await form(request, '/oauth/token', { grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: clientId })).status()).toBe(400);

    // Revocation (RFC 7009) ends the grant, including live access tokens.
    expect((await form(request, '/oauth/revoke', { token: refreshed.refresh_token })).status()).toBe(200);
    expect((await request.post('/api/opportunities', { headers: auth, data: OPPORTUNITY })).status()).toBe(401);
  });

  test('a mismatched redirect_uri is shown as an error, never redirected to', async ({ page, request }) => {
    const clientId = await registerClient(request);
    await page.goto(authorizeUrl(clientId, pkcePair().challenge, { redirect_uri: 'https://evil.example/cb' }));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This connection request is not valid');
    expect(page.url()).toContain('/oauth/authorize');
  });

  test('missing PKCE is refused back to the client', async ({ page, request }) => {
    const clientId = await registerClient(request);
    const refused = redirectRequest(page);
    // The redirect target is unreachable, so the navigation itself errors.
    await page.goto(authorizeUrl(clientId, '', { code_challenge_method: 'plain' })).catch(() => undefined);
    expect((await refused).searchParams.get('error')).toBe('invalid_request');
  });

  test('denying returns access_denied to the client', async ({ page, request }) => {
    const clientId = await registerClient(request);
    const denied = await approve(page, authorizeUrl(clientId, pkcePair().challenge), 'deny');
    expect(denied.searchParams.get('error')).toBe('access_denied');
    expect(denied.searchParams.get('state')).toBe('xyz');
  });

  test('the consent page cannot be framed or cached', async ({ request }) => {
    const response = await request.get('/oauth/authorize?client_id=none');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(response.headers()['cache-control']).toContain('no-store');
  });

  test('registration is rate limited per client IP', async ({ request }) => {
    const ip = freshIp();
    const register = () => request.post('/oauth/register', { headers: ip, data: { redirect_uris: [REDIRECT] } });
    for (let i = 0; i < 20; i++) expect((await register()).status()).toBe(201);
    const limited = await register();
    expect(limited.status()).toBe(429);
    expect((await limited.json()).error).toBe('rate_limited');
    // Another client is unaffected.
    expect((await request.post('/oauth/register', { headers: freshIp(), data: { redirect_uris: [REDIRECT] } })).status()).toBe(201);
  });

  test('registration rejects unsafe redirect URIs and confidential clients', async ({ request }) => {
    for (const uri of ['javascript:alert(1)', 'http://example.com/cb', 'https://example.com/cb#frag']) {
      const response = await request.post('/oauth/register', { headers: freshIp(), data: { redirect_uris: [uri] } });
      expect(response.status(), uri).toBe(400);
    }
    const secretClient = await request.post('/oauth/register', { headers: freshIp(), data: { redirect_uris: [REDIRECT], token_endpoint_auth_method: 'client_secret_basic' } });
    expect(secretClient.status()).toBe(400);
  });
});

test.describe('auth.md agentic registration', () => {
  test('anonymous agent: read-only until a person claims it, then it can submit', async ({ page, request }) => {
    test.setTimeout(90_000);
    const reg = await (await request.post('/agent/identity', { headers: freshIp(), data: { type: 'anonymous' } })).json();
    expect(reg.registration_type).toBe('anonymous');
    expect(reg.pre_claim_scopes).toEqual(['profile:read']);

    const pre = await (await form(request, '/oauth/token', { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: reg.identity_assertion })).json();
    expect(pre.scope).toBe('profile:read');
    const preAuth = { Authorization: `Bearer ${pre.access_token}` };
    // Unclaimed: authenticated but not allowed to submit (insufficient_scope).
    expect((await request.post('/api/opportunities', { headers: preAuth, data: OPPORTUNITY })).status()).toBe(403);

    const claim = await (await request.post('/agent/identity/claim', { data: { claim_token: reg.claim_token, email: 'grace@example.com' } })).json();
    expect(claim.claim_attempt.user_code).toMatch(/^\d{6}$/);
    const pending = await form(request, '/oauth/token', { grant_type: 'urn:workos:agent-auth:grant-type:claim', claim_token: reg.claim_token });
    expect((await pending.json()).error).toBe('authorization_pending');

    // The person opens the verification link and types the code.
    await page.goto(new URL(claim.claim_attempt.verification_uri).pathname + new URL(claim.claim_attempt.verification_uri).search);
    await expect(page.getByText('grace@example.com')).toBeVisible();
    await page.getByLabel('6-digit code from your agent').fill(claim.claim_attempt.user_code);
    await page.getByLabel('Your name').fill('Grace Hopper');
    await page.getByRole('button', { name: 'Approve agent' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your agent is approved');

    // Honor the polling interval (RFC 8628 section 3.5).
    await page.waitForTimeout(claim.claim_attempt.interval * 1000);
    const post = await (await form(request, '/oauth/token', { grant_type: 'urn:workos:agent-auth:grant-type:claim', claim_token: reg.claim_token })).json();
    expect(post.scope).toBe('profile:read opportunities:write');
    expect(post.identity_assertion).toBeTruthy();

    // Claiming revoked the pre-claim token; the new one can submit.
    expect((await request.post('/api/opportunities', { headers: preAuth, data: OPPORTUNITY })).status()).toBe(401);
    const submitted = await request.post('/api/opportunities', { headers: { Authorization: `Bearer ${post.access_token}` }, data: OPPORTUNITY });
    expect(submitted.status()).toBe(201);

    // The v2 assertion refreshes via the JWT-bearer grant; the v1 one is superseded.
    expect((await form(request, '/oauth/token', { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: post.identity_assertion })).status()).toBe(200);
    expect((await form(request, '/oauth/token', { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: reg.identity_assertion })).status()).toBe(400);
  });

  test('wrong codes burn the claim attempt after five tries', async ({ page, request }) => {
    const reg = await (await request.post('/agent/identity', { headers: freshIp(), data: { type: 'anonymous' } })).json();
    const claim = await (await request.post('/agent/identity/claim', { data: { claim_token: reg.claim_token, email: 'eve@example.com' } })).json();
    const link = new URL(claim.claim_attempt.verification_uri);
    const wrong = claim.claim_attempt.user_code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      await page.goto(link.pathname + link.search);
      await page.getByLabel('6-digit code from your agent').fill(wrong);
      await page.getByLabel('Your name').fill('Eve');
      await page.getByRole('button', { name: 'Approve agent' }).click();
    }
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This approval link has expired');
  });

  test('unsupported identity types answer with *_not_enabled', async ({ request }) => {
    for (const type of ['service_auth', 'identity_assertion']) {
      const body = await (await request.post('/agent/identity', { headers: freshIp(), data: { type } })).json();
      expect(body.error).toBe(`${type}_not_enabled`);
    }
  });
});

test.describe('Opportunities', () => {
  test('invalid bodies are rejected and an approval may send at most three per day', async ({ page, request }) => {
    const clientId = await registerClient(request);
    const { verifier, challenge } = pkcePair();
    const code = (await approve(page, authorizeUrl(clientId, challenge, { resource: `${SITE}/api/opportunities` }))).searchParams.get('code')!;
    const tokens = await (await form(request, '/oauth/token', { grant_type: 'authorization_code', code, client_id: clientId, redirect_uri: REDIRECT, code_verifier: verifier })).json();
    const auth = { Authorization: `Bearer ${tokens.access_token}` };

    const invalid = await request.post('/api/opportunities', { headers: auth, data: { role: 'Quant' } });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).error).toBe('invalid_request');

    for (let i = 0; i < 3; i++) expect((await request.post('/api/opportunities', { headers: auth, data: OPPORTUNITY })).status()).toBe(201);
    expect((await request.post('/api/opportunities', { headers: auth, data: OPPORTUNITY })).status()).toBe(429);
  });

  test('a token for one endpoint is refused at another (RFC 8707 audience)', async ({ page, request }) => {
    const clientId = await registerClient(request);
    const { verifier, challenge } = pkcePair();
    const code = (await approve(page, authorizeUrl(clientId, challenge, { resource: `${SITE}/mcp/recruiter` }))).searchParams.get('code')!;
    const tokens = await (await form(request, '/oauth/token', { grant_type: 'authorization_code', code, client_id: clientId, redirect_uri: REDIRECT, code_verifier: verifier })).json();
    const response = await request.post('/api/opportunities', { headers: { Authorization: `Bearer ${tokens.access_token}` }, data: OPPORTUNITY });
    expect(response.status()).toBe(401);
  });
});

test.describe('Web Bot Auth', () => {
  test('the key directory is signed and verifies against its own key', async ({ request }) => {
    const response = await request.get('/.well-known/http-message-signatures-directory');
    expect(response.headers()['content-type']).toBe('application/http-message-signatures-directory+json');
    const { keys } = await response.json();
    expect(keys[0]).toMatchObject({ kty: 'OKP', crv: 'Ed25519' });
    expect(keys[0].d).toBeUndefined();

    // Rebuild the RFC 9421 signature base for `("@authority";req)` and verify.
    const input = response.headers()['signature-input'];
    const params = input.replace(/^binding0=/, '');
    expect(params).toContain('tag="http-message-signatures-directory"');
    expect(params).toContain(`keyid="${keys[0].kid}"`);
    const base = `"@authority";req: localhost:3000\n"@signature-params": ${params}`;
    const signature = Buffer.from(response.headers()['signature'].match(/^binding0=:(.+):$/)![1], 'base64');
    const key = await webcrypto.subtle.importKey('jwk', { kty: 'OKP', crv: 'Ed25519', x: keys[0].x }, 'Ed25519', false, ['verify']);
    expect(await webcrypto.subtle.verify('Ed25519', key, signature, new TextEncoder().encode(base))).toBe(true);
  });

  test("the site's bot requests verify with Cloudflare's web-bot-auth library", async () => {
    // Same process as the signer, so the key is the one the module loaded.
    const target = new URL(`${SITE}/resume`);
    const headers = await signedBotHeaders(target);
    expect(headers['Signature-Agent']).toBe(`"${SITE}/.well-known/http-message-signatures-directory"`);
    const { botSigningKey } = await import('../app/lib/auth/runtime');
    const { publicJwk } = await botSigningKey();
    const verifier = await verifierFromJWK({ kty: publicJwk.kty!, crv: publicJwk.crv!, x: publicJwk.x!, alg: 'EdDSA' });
    const verified = await verify(new Request(target, { headers }), { resolver: () => verifier });
    expect(verified.tag).toBe('web-bot-auth');
    // A tampered request fails.
    await expect(verify(new Request('https://evil.example/resume', { headers }), { resolver: () => verifier })).rejects.toThrow();
  });
});
