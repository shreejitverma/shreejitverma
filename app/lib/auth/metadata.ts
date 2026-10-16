// Discovery documents for the authorization server: RFC 8414 metadata (with
// the auth.md `agent_auth` profile block) and the auth.md instructions for
// agents. Both are generated from config.ts, so they cannot advertise an
// endpoint, grant, or scope the server does not implement.

import { HEADLINE } from '../profile';
import {
  AUTH_PATHS, CLAIM_POLL_INTERVAL, GRANTS, ISSUER, LIMITS, POST_CLAIM_SCOPES, PRE_CLAIM_SCOPES, RESOURCES,
  SCOPE_DESCRIPTIONS, TTL, url,
} from './config';
import { prmUrl } from './resource';

export function authorizationServerMetadata() {
  return {
    issuer: ISSUER,
    authorization_endpoint: url(AUTH_PATHS.authorize),
    token_endpoint: url(AUTH_PATHS.token),
    registration_endpoint: url(AUTH_PATHS.register),
    revocation_endpoint: url(AUTH_PATHS.revoke),
    jwks_uri: url(AUTH_PATHS.jwks),
    scopes_supported: Object.keys(SCOPE_DESCRIPTIONS),
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: Object.values(GRANTS),
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    revocation_endpoint_auth_methods_supported: ['none'],
    authorization_response_iss_parameter_supported: true,
    service_documentation: url(AUTH_PATHS.authMd),
    // Restated from the protected resource metadata, as auth.md expects.
    resource: RESOURCES.site,
    authorization_servers: [ISSUER],
    bearer_methods_supported: ['header'],
    agent_auth: {
      skill: url(AUTH_PATHS.authMd),
      // Both the auth.md reference names and the names some scanners read.
      identity_endpoint: url(AUTH_PATHS.agentIdentity),
      register_uri: url(AUTH_PATHS.agentIdentity),
      claim_endpoint: url(AUTH_PATHS.agentClaim),
      claim_uri: url(AUTH_PATHS.agentClaim),
      identity_types_supported: ['anonymous'],
      anonymous: {
        credential_types_supported: ['identity_assertion'],
        pre_claim_scopes: PRE_CLAIM_SCOPES,
        post_claim_scopes: POST_CLAIM_SCOPES,
      },
    },
  };
}

export function authMd(): string {
  const scopes = Object.entries(SCOPE_DESCRIPTIONS).map(([scope, text]) => `- \`${scope}\`: ${text}`).join('\n');
  return `# ${HEADLINE.name} auth.md

You are an agent. This service lets a recruiter's agent send job opportunities to ${HEADLINE.name} after a human approves it.
Everything else on ${ISSUER} (profile, resume, articles, search, the read-only MCP server at ${url('/mcp')}) is public and needs no authentication.

## What needs authentication

| Resource | Method | Scope |
| --- | --- | --- |
| \`${url(AUTH_PATHS.opportunities)}\` | \`POST\` JSON opportunity | \`opportunities:write\` |
| \`${url(AUTH_PATHS.mcpRecruiter)}\` | MCP (streamable HTTP), tools \`send_opportunity\` and \`whoami\` | \`opportunities:write\` |

Scopes:

${scopes}

An unauthenticated call answers \`401\` with \`WWW-Authenticate: Bearer resource_metadata="..."\`.
Protected Resource Metadata: \`${prmUrl(RESOURCES.site)}\` (and per endpoint: \`${prmUrl(RESOURCES.opportunities)}\`, \`${prmUrl(RESOURCES.mcpRecruiter)}\`).
Authorization Server metadata: \`${url(AUTH_PATHS.asMetadata)}\`.

## Option A: MCP clients (authorization code + PKCE)

If you are an MCP client such as Claude, connect to \`${url(AUTH_PATHS.mcpRecruiter)}\` and follow the standard MCP authorization flow:

1. Register with dynamic client registration: \`POST ${url(AUTH_PATHS.register)}\` with \`redirect_uris\`. Clients are public; use \`token_endpoint_auth_method: "none"\`.
2. Send the person to \`${url(AUTH_PATHS.authorize)}\` with PKCE (\`code_challenge_method=S256\` is required) and \`resource=${RESOURCES.mcpRecruiter}\`.
3. The person enters their name, email, and company and approves. Exchange the code at \`${url(AUTH_PATHS.token)}\`.
4. Access tokens last ${TTL.accessToken / 60} minutes. Refresh tokens rotate on every use.

## Option B: autonomous agents (agentic registration)

This service supports the \`anonymous\` identity type only. It does not accept \`identity_assertion\` (ID-JAG) or \`service_auth\` registrations.

1. Register: \`POST ${url(AUTH_PATHS.agentIdentity)}\` with \`{"type": "anonymous"}\`.
   The response has an \`identity_assertion\`, a \`claim_token\` (returned once; keep it in memory), and \`pre_claim_scopes\` of \`${PRE_CLAIM_SCOPES.join(' ')}\`.
2. Claim: an anonymous agent cannot send opportunities until a person approves it.
   \`POST ${url(AUTH_PATHS.agentClaim)}\` with \`{"claim_token": "...", "email": "<the person's email>"}\`.
   Show the person the returned \`claim_attempt.verification_uri\` and \`claim_attempt.user_code\`.
   They open the link, enter their name and company, type the 6-digit code, and approve.
3. Poll \`POST ${url(AUTH_PATHS.token)}\` with \`grant_type=${GRANTS.claim}&claim_token=...\` every ${CLAIM_POLL_INTERVAL} seconds.
   While waiting you get \`authorization_pending\`; polling faster gets \`slow_down\`; an expired code gets \`expired_token\` (start a new claim attempt).
   On success you receive an access token with \`${POST_CLAIM_SCOPES.join(' ')}\` and a new \`identity_assertion\` valid for ${TTL.postClaimAssertion / 86_400} days.
4. Refresh: exchange the identity assertion with \`grant_type=${GRANTS.jwtBearer}&assertion=...\` at the token endpoint. There are no refresh tokens in this flow.

Claiming revokes every access token minted before the claim.

## Sending an opportunity

\`\`\`http
POST ${url(AUTH_PATHS.opportunities)}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "Senior Quantitative Developer",
  "company": "Example Capital",
  "location": "New York, hybrid",
  "employment_type": "full-time",
  "compensation": "$250k-$350k base + bonus",
  "description": "Low-latency C++ market making on the US equities desk...",
  "apply_url": "https://example.com/jobs/123"
}
\`\`\`

\`role\`, \`company\`, and \`description\` are required. The response is \`201\` with a \`reference\`.
Limits: ${LIMITS.submissionsPerPrincipalPerDay} opportunities per approval per day, and ${LIMITS.submissionsPerDay} across all agents per day.

## Identity

This service has no user accounts.
The name, email, and company a person enters when approving are self-reported and are not verified; they are included with every opportunity the agent sends so Shreejit can reply.

## Revocation

\`POST ${url(AUTH_PATHS.revoke)}\` with \`token=<refresh_token or identity_assertion>\` ends the grant immediately, including outstanding access tokens.
`;
}
