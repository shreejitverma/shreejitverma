// Paths and identifiers shared by every agent-facing endpoint and the
// discovery documents that point at them.

// Bump when a tool, endpoint, or response shape changes incompatibly.
export const AGENT_API_VERSION = '1.0.0';

// Server Card names are reverse-DNS with exactly one slash.
export const MCP_SERVER_NAME = 'com.shreejitverma/profile';

// Content Signals (https://contentsignals.org): this is a public portfolio
// whose purpose is to be found, so search indexing, use as AI answer input,
// and AI training are all permitted.
export const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=yes';

export const AGENT_PATHS = {
  mcp: '/mcp',
  mcpServerCard: '/mcp/server-card',
  mcpServerCardWellKnown: '/.well-known/mcp/server-card.json',
  a2a: '/a2a',
  a2aAgentCard: '/.well-known/agent-card.json',
  agentSkills: '/.well-known/agent-skills/index.json',
  apiCatalog: '/.well-known/api-catalog',
  aiCatalog: '/.well-known/ai-catalog.json',
  did: '/.well-known/did.json',
  openapi: '/openapi.json',
  search: '/api/search',
  resumeJson: '/resume.json',
  llms: '/llms.txt',
  llmsFull: '/llms-full.txt',
} as const;

// CORS for public, read-only, credential-free endpoints: any origin may read
// them, which is what browser-based agents and the WebMCP tools need.
export const PUBLIC_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag, Link, x-markdown-tokens',
} as const;
