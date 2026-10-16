// Signed tokens (EdDSA JWTs) and opaque secrets.
//
// Each JWT kind has its own `typ` header and is verified only as that kind,
// so a token minted for one purpose can never be replayed as another.

import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { ISSUER, KNOWN_RESOURCES, TTL } from './config';
import { authSigningKey } from './runtime';

const TYP = {
  access: 'at+jwt', // RFC 9068
  identity: 'agent-identity+jwt',
  consent: 'consent-request+jwt',
} as const;

// ---------------------------------------------------------------------------
// Opaque secrets: high-entropy random values, stored server-side only as
// SHA-256 hashes, so a leaked store does not leak usable secrets.

export const randomToken = (prefix: string) => `${prefix}_${randomBytes(32).toString('base64url')}`;
export const randomId = (prefix: string) => `${prefix}_${randomBytes(12).toString('base64url')}`;
export const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('base64url');

// Six digits from a CSPRNG, typed by a human on the claim page.
export const userCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

export function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// RFC 7636 S256: BASE64URL(SHA256(code_verifier)) == code_challenge.
export function pkceMatches(verifier: string, challenge: string): boolean {
  if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)) return false;
  return constantTimeEqual(sha256(verifier), challenge);
}

// ---------------------------------------------------------------------------
// JWTs

async function sign(typ: string, claims: JWTPayload, ttlSeconds: number): Promise<string> {
  const { privateKey, kid } = await authSigningKey();
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'EdDSA', kid, typ })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setJti(randomBytes(16).toString('base64url'))
    .sign(privateKey);
}

async function verify(typ: string, token: string, audience: string | string[]): Promise<JWTPayload> {
  const { publicKey } = await authSigningKey();
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: ISSUER,
    audience,
    typ,
    algorithms: ['EdDSA'],
    requiredClaims: ['exp', 'iat', 'sub', 'jti'],
  });
  return payload;
}

export interface AccessClaims {
  sub: string; // usr_... (authorization-code flow) or reg_... (auth.md registration)
  clientId: string;
  scope: string[];
  aud: string;
  ver?: number; // registration version, so claiming or revoking kills older tokens
}

export function signAccessToken({ sub, clientId, scope, aud, ver }: AccessClaims): Promise<string> {
  return sign(TYP.access, { sub, aud, client_id: clientId, scope: scope.join(' '), ...(ver ? { ver } : {}) }, TTL.accessToken);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims & { exp: number }> {
  const payload = await verify(TYP.access, token, [...KNOWN_RESOURCES]);
  return {
    sub: payload.sub!,
    clientId: String(payload.client_id ?? ''),
    scope: typeof payload.scope === 'string' ? payload.scope.split(' ').filter(Boolean) : [],
    aud: Array.isArray(payload.aud) ? payload.aud[0] : payload.aud!,
    ver: typeof payload.ver === 'number' ? payload.ver : undefined,
    exp: payload.exp!,
  };
}

// auth.md identity assertion: proves a registration to this issuer, and is
// exchanged at the token endpoint for access tokens (RFC 7523 JWT bearer).
export function signIdentityAssertion(regId: string, ver: number, ttlSeconds: number, email?: string): Promise<string> {
  return sign(TYP.identity, { sub: regId, aud: ISSUER, ver, ...(email ? { email, email_verified: false } : {}) }, ttlSeconds);
}

export async function verifyIdentityAssertion(token: string): Promise<{ regId: string; ver: number }> {
  const payload = await verify(TYP.identity, token, ISSUER);
  if (typeof payload.ver !== 'number') throw new Error('identity assertion without a version');
  return { regId: payload.sub!, ver: payload.ver };
}

// The consent form carries the validated authorization request, signed, so
// the decision endpoint acts only on parameters this server already checked.
export interface ConsentRequest {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string[];
  resource: string;
  state?: string;
}

export function signConsentRequest(request: ConsentRequest): Promise<string> {
  return sign(TYP.consent, { sub: request.clientId, aud: ISSUER, req: request }, TTL.consentRequest);
}

export async function verifyConsentRequest(token: string): Promise<{ request: ConsentRequest; jti: string }> {
  const payload = await verify(TYP.consent, token, ISSUER);
  return { request: payload.req as ConsentRequest, jti: payload.jti! };
}
