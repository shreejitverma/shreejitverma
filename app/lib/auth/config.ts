// OAuth 2.1 authorization server and protected resources for agents.
//
// What is protected: submitting a job opportunity to Shreejit (MCP tool
// `send_opportunity` at /mcp/recruiter, REST POST /api/opportunities). Every
// read surface stays public. A human must approve before any agent can
// submit: either the consent page of the authorization-code flow (MCP
// clients such as Claude) or the claim page of the auth.md agentic
// registration flow (autonomous agents).

import { SITE_URL } from '../profile';

export const ISSUER = SITE_URL; // RFC 8414: no trailing slash; tokens' iss

export const AUTH_PATHS = {
  asMetadata: '/.well-known/oauth-authorization-server',
  prm: '/.well-known/oauth-protected-resource',
  authorize: '/oauth/authorize',
  authorizeDecision: '/oauth/authorize/decision',
  token: '/oauth/token',
  register: '/oauth/register',
  revoke: '/oauth/revoke',
  jwks: '/oauth/jwks.json',
  agentIdentity: '/agent/identity',
  agentClaim: '/agent/identity/claim',
  claimPage: '/claim',
  claimComplete: '/claim/complete',
  authMd: '/auth.md',
  mcpRecruiter: '/mcp/recruiter',
  opportunities: '/api/opportunities',
} as const;

export const url = (path: string) => `${ISSUER}${path}`;

// RFC 8707 resource identifiers. A token is bound to one of these through its
// `aud`; the site-wide identifier is accepted by every protected endpoint.
export const RESOURCES = {
  site: ISSUER,
  mcpRecruiter: url(AUTH_PATHS.mcpRecruiter),
  opportunities: url(AUTH_PATHS.opportunities),
} as const;

export const KNOWN_RESOURCES: readonly string[] = Object.values(RESOURCES);

export const SCOPES = {
  profileRead: 'profile:read',
  opportunitiesWrite: 'opportunities:write',
} as const;

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  [SCOPES.profileRead]: 'Read who you are signed in as (all profile data is public anyway)',
  [SCOPES.opportunitiesWrite]: 'Send job opportunities to Shreejit on behalf of the approving person',
};

// auth.md agentic registration: an anonymous agent can only read until a
// human claims it.
export const PRE_CLAIM_SCOPES = [SCOPES.profileRead];
export const POST_CLAIM_SCOPES = [SCOPES.profileRead, SCOPES.opportunitiesWrite];

export const GRANTS = {
  authorizationCode: 'authorization_code',
  refreshToken: 'refresh_token',
  jwtBearer: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  claim: 'urn:workos:agent-auth:grant-type:claim',
} as const;

// Lifetimes in seconds.
export const TTL = {
  accessToken: 15 * 60,
  authorizationCode: 60,
  consentRequest: 10 * 60,
  refreshToken: 30 * 24 * 3600,
  preClaimAssertion: 3600,
  postClaimAssertion: 30 * 24 * 3600,
  claimWindow: 24 * 3600,
  claimAttempt: 10 * 60,
  client: 180 * 24 * 3600,
} as const;

export const CLAIM_POLL_INTERVAL = 5; // seconds, RFC 8628 `interval`
export const MAX_USER_CODE_ATTEMPTS = 5;

// Abuse limits, per fixed window.
export const LIMITS = {
  registrationsPerIpPerHour: 20,
  identitiesPerIpPerHour: 20,
  // Approving is a form any script can submit (there are no accounts), so the
  // approval steps are rate limited per IP, and submissions are capped per IP
  // and per client before the global cap; one actor cannot exhaust the day.
  approvalsPerIpPerHour: 10,
  submissionsPerPrincipalPerDay: 3,
  submissionsPerIpPerDay: 5,
  submissionsPerClientPerDay: 10,
  submissionsPerDay: 30,
} as const;
