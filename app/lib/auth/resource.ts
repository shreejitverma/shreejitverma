// Resource-server side: bearer-token checks for the protected endpoints and
// the RFC 9728 Protected Resource Metadata documents that describe them.

import { bearerAuthChallengeResponse, OAuthError, OAuthErrorCode, requireBearerAuth, type AuthInfo } from '@modelcontextprotocol/server';
import { AUTH_PATHS, ISSUER, RESOURCES, SCOPE_DESCRIPTIONS, url } from './config';
import { AuthNotConfiguredError, authSigningKey, authStore } from './runtime';
import { loadPrincipal, type Contact } from './server';
import { verifyAccessToken } from './tokens';

export interface Caller {
  sub: string;
  clientId: string;
  scopes: string[];
  contact?: Contact;
  label: string;
}

// RFC 9728 section 3: the metadata URL for a resource inserts the well-known
// segment between the origin and the resource's path.
export function prmUrl(resource: string): string {
  const path = new URL(resource).pathname.replace(/\/$/, '');
  return url(`${AUTH_PATHS.prm}${path}`);
}

export function protectedResourceMetadata(resource: string) {
  return {
    resource,
    resource_name: 'Shreejit Verma - recruiter access',
    authorization_servers: [ISSUER],
    scopes_supported: Object.keys(SCOPE_DESCRIPTIONS),
    bearer_methods_supported: ['header'],
    resource_documentation: url(AUTH_PATHS.authMd),
    resource_policy_uri: url(AUTH_PATHS.authMd),
  };
}

// Resolves to the caller, or to the ready-made 401/403/503 Response.
export async function authenticate(request: Request, resource: string, requiredScope: string): Promise<Caller | Response> {
  const verifier = {
    async verifyAccessToken(token: string): Promise<AuthInfo> {
      let claims;
      try {
        claims = await verifyAccessToken(token);
      } catch {
        throw new OAuthError(OAuthErrorCode.InvalidToken, 'Access token is invalid or expired');
      }
      // A token for the whole site is valid on every protected endpoint; one
      // for a specific endpoint only there (RFC 8707 audience restriction).
      if (claims.aud !== resource && claims.aud !== RESOURCES.site) {
        throw new OAuthError(OAuthErrorCode.InvalidToken, `Token audience ${claims.aud} is not ${resource}`);
      }
      // Revocation and claim upgrades take effect immediately, not at expiry.
      const principal = await loadPrincipal(claims.sub, claims.ver);
      if (!principal) throw new OAuthError(OAuthErrorCode.InvalidToken, 'The grant behind this token was revoked or superseded');
      return {
        token,
        clientId: claims.clientId,
        scopes: claims.scope,
        expiresAt: claims.exp,
        resource: new URL(resource),
        extra: { sub: claims.sub, contact: principal.contact, label: principal.label },
      };
    },
  };
  // The gate maps any verifier exception to a 500, so missing configuration is
  // checked first and answered as 503.
  try {
    await authSigningKey();
    authStore();
  } catch (error) {
    if (error instanceof AuthNotConfiguredError) return notConfigured(error);
    throw error;
  }
  const gate = requireBearerAuth({ verifier, requiredScopes: [requiredScope], resourceMetadataUrl: prmUrl(resource), expectedResource: new URL(resource) });
  try {
    const result = await gate(request);
    if (result instanceof Response) return result;
    const extra = (result as AuthInfo & { extra?: { sub: string; contact?: Contact; label: string } }).extra!;
    return { sub: extra.sub, clientId: result.clientId, scopes: result.scopes, contact: extra.contact, label: extra.label };
  } catch (error) {
    return bearerAuthChallengeResponse(error, { requiredScopes: [requiredScope], resourceMetadataUrl: prmUrl(resource) });
  }
}

export function notConfigured(error: Error): Response {
  console.error('agent auth is not configured:', error.message);
  return Response.json(
    { error: 'temporarily_unavailable', error_description: 'Agent authentication is not configured on this deployment.' },
    { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '3600' } },
  );
}
