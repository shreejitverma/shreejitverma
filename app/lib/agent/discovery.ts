// Discovery documents that tell agents what this site offers and where:
// MCP Server Card, A2A Agent Card, RFC 9727 API catalog, AI Catalog (ARD),
// Agent Skills index, Personal Agent Protocol, and the did:web document.
// Each is a pure function of the constants and profile data, so the routes
// that serve them can be static.

import { createHash } from 'node:crypto';
import { SUPPORTED_PROTOCOL_VERSIONS } from '@modelcontextprotocol/server';
import type { AgentCard } from '@a2a-js/sdk';
import { duplicateInterfacesForLegacy } from '@a2a-js/sdk/compat/v0_3';
import { CONTACT, HEADLINE, SITE_URL } from '../profile';
import { AGENT_API_VERSION, AGENT_PATHS, MCP_SERVER_NAME } from './constants';
import { absoluteUrl } from './knowledge';
import { MCP_TOOLS } from './mcp';
import { markdownPath } from './pages';

const HOST = new URL(SITE_URL).hostname; // www.shreejitverma.com
const DOMAIN = HOST.replace(/^www\./, ''); // shreejitverma.com
const ICON = { src: absoluteUrl('/icon.png'), mimeType: 'image/png', sizes: ['512x512'] };
const REPOSITORY = { url: 'https://github.com/shreejitverma/shreejitverma', source: 'github' };

// https://github.com/modelcontextprotocol/experimental-ext-server-card (schema.ts)
export function mcpServerCard() {
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    name: MCP_SERVER_NAME,
    version: AGENT_API_VERSION,
    title: HEADLINE.name,
    description:
      `Read-only MCP server for the professional profile of ${HEADLINE.name}, ${HEADLINE.current}: ` +
      'experience, research, projects, skills, education, the full resume as JSON Resume, keyword search, ' +
      'and every site page as Markdown. No authentication.',
    websiteUrl: SITE_URL,
    repository: REPOSITORY,
    icons: [ICON],
    remotes: [
      { type: 'streamable-http', url: absoluteUrl(AGENT_PATHS.mcp), supportedProtocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS] },
    ],
  };
}

// A2A Agent Card. The card carries both the v1.0 fields (supportedInterfaces)
// and the v0.3 fields (url, preferredTransport, protocolVersion), the same
// hybrid the A2A SDK serves for legacy compatibility, so v0.3 and v1.0
// clients can both connect. /a2a serves both protocol versions.
export function a2aAgentCard() {
  const url = absoluteUrl(AGENT_PATHS.a2a);
  const card: AgentCard = {
    name: `${HEADLINE.name} Profile Agent`,
    description:
      `Answers questions about ${HEADLINE.name} (${HEADLINE.current}, ${HEADLINE.location}): experience, research, ` +
      'projects, skills, education, writing, and contact. Answers are retrieved from the structured profile data ' +
      'behind shreejitverma.com, without a language model, and every fact links to its source.',
    supportedInterfaces: duplicateInterfacesForLegacy([{ url, protocolBinding: 'JSONRPC', tenant: '', protocolVersion: '1.0' }], ['JSONRPC']),
    provider: { organization: HEADLINE.name, url: SITE_URL },
    version: AGENT_API_VERSION,
    documentationUrl: absoluteUrl(AGENT_PATHS.llms),
    capabilities: { streaming: false, pushNotifications: false, extensions: [], extendedAgentCard: false },
    securitySchemes: {},
    securityRequirements: [],
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/markdown', 'application/json'],
    skills: [
      {
        id: 'profile-qa',
        name: 'Profile questions',
        description:
          'Answer a natural-language question about the profile with the best-matching facts, each with a snippet and source URL. ' +
          'An empty message or "overview" returns the profile summary.',
        tags: ['resume', 'recruiting', 'quantitative-finance', 'c++', 'market-risk'],
        examples: [
          'What low-latency C++ trading experience does he have?',
          'Has he worked on FRTB or Basel IV market risk?',
          'What did he build with FPGAs?',
          'How can I contact him?',
        ],
        inputModes: ['text/plain'],
        outputModes: ['text/markdown', 'application/json'],
        securityRequirements: [],
      },
    ],
    signatures: [],
    iconUrl: ICON.src,
  };
  return { ...card, protocolVersion: '0.3.0', url, preferredTransport: 'JSONRPC' };
}

// RFC 9727 API catalog: one linkset entry per API, each pointing at its
// machine-readable description and its human-readable documentation.
export function apiCatalog() {
  const llms = [{ href: absoluteUrl(AGENT_PATHS.llms), type: 'text/plain' }];
  return {
    linkset: [
      {
        anchor: absoluteUrl(AGENT_PATHS.mcp),
        'service-desc': [{ href: absoluteUrl(AGENT_PATHS.mcpServerCard), type: 'application/mcp-server-card+json' }],
        'service-doc': llms,
      },
      {
        anchor: absoluteUrl(AGENT_PATHS.a2a),
        'service-desc': [{ href: absoluteUrl(AGENT_PATHS.a2aAgentCard), type: 'application/a2a-agent-card+json' }],
        'service-doc': llms,
      },
      {
        anchor: absoluteUrl('/api'),
        'service-desc': [{ href: absoluteUrl(AGENT_PATHS.openapi), type: 'application/vnd.oai.openapi+json' }],
        'service-doc': llms,
      },
    ],
  };
}

// AI Catalog (https://github.com/Agent-Card/ai-catalog), the manifest the
// Agentic Resource Discovery spec and the MCP Server Card extension use for
// domain-level discovery.
export function aiCatalog() {
  const id = (namespace: string, name: string) => `urn:air:${DOMAIN}:${namespace}:${name}`;
  return {
    specVersion: '1.0',
    host: {
      displayName: HEADLINE.name,
      identifier: `did:web:${HOST}`,
      documentationUrl: absoluteUrl(AGENT_PATHS.llms),
      logoUrl: ICON.src,
    },
    entries: [
      {
        identifier: id('mcp', 'profile'),
        displayName: `${HEADLINE.name} profile (MCP)`,
        type: 'application/mcp-server-card+json',
        url: absoluteUrl(AGENT_PATHS.mcpServerCard),
        representativeQueries: [
          'What is Shreejit Verma\'s experience with low-latency C++?',
          'Summarize Shreejit Verma\'s resume',
          'Which banks has Shreejit Verma worked at?',
        ],
      },
      {
        identifier: id('a2a', 'profile-agent'),
        displayName: `${HEADLINE.name} Profile Agent (A2A)`,
        type: 'application/a2a-agent-card+json',
        url: absoluteUrl(AGENT_PATHS.a2aAgentCard),
        representativeQueries: [
          'Ask about Shreejit Verma\'s market risk and FRTB work',
          'Find a quantitative developer with FPGA market-making experience',
        ],
      },
      {
        identifier: id('skill', 'shreejit-verma-profile'),
        displayName: 'Shreejit Verma profile skill',
        type: 'application/agent-skills+md',
        url: absoluteUrl(skillPath(PROFILE_SKILL_NAME)),
        representativeQueries: [
          'How do I look up Shreejit Verma\'s resume programmatically?',
          'Evaluate Shreejit Verma as a candidate for a quant developer role',
        ],
      },
      {
        identifier: id('api', 'resume'),
        displayName: `${HEADLINE.name} resume (JSON Resume)`,
        type: 'application/json',
        url: absoluteUrl(AGENT_PATHS.resumeJson),
        representativeQueries: ['Get Shreejit Verma\'s resume as JSON', 'List Shreejit Verma\'s education and degrees'],
      },
    ],
  };
}

// Personal Agent Protocol draft 0.1, website-only: no agent sessions or
// sign-in are offered, so no auth issuer is declared.
export function poppyManifest() {
  return { protocol_version: '0.1', organization: { name: HEADLINE.name, domain: DOMAIN }, web: {} };
}

// did:web document backing the AI Catalog host identifier. It declares no
// keys: it binds the identifier to this domain and links the same identity
// on other sites.
export function didDocument() {
  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: `did:web:${HOST}`,
    alsoKnownAs: [SITE_URL, CONTACT.github, CONTACT.linkedin, CONTACT.scholar],
  };
}

// ---------------------------------------------------------------------------
// Agent Skills (https://github.com/cloudflare/agent-skills-discovery-rfc,
// v0.2.0). The skill is generated from the tool list and paths above, so it
// cannot describe an endpoint or tool that does not exist.

export const PROFILE_SKILL_NAME = 'shreejit-verma-profile';
export const skillPath = (name: string) => `/.well-known/agent-skills/${name}/SKILL.md`;

export function profileSkillMarkdown(): string {
  const url = absoluteUrl;
  const tools = MCP_TOOLS.map((tool) => `- \`${tool.name}\`: ${tool.description}`).join('\n');
  return `---
name: ${PROFILE_SKILL_NAME}
description: Look up facts about ${HEADLINE.name} (${HEADLINE.current}, ${HEADLINE.location}) - experience, research, projects, skills, education, writing, and contact - from the machine-readable endpoints on ${HOST}. Use when a task involves researching, evaluating, summarizing, or contacting ${HEADLINE.name} as a candidate or collaborator.
---

# ${HEADLINE.name} profile

Every endpoint below is public, read-only, and needs no authentication.
All of them answer from the same data as the website, so facts agree across formats.

## Fastest paths

1. Full resume as JSON Resume: \`GET ${url(AGENT_PATHS.resumeJson)}\`
2. Keyword search with source URLs: \`GET ${url(AGENT_PATHS.search)}?q=<keywords>&limit=5\`
3. Any page as Markdown: request it with \`Accept: text/markdown\`, or add \`.md\` (\`${url(markdownPath('/'))}\`, \`${url(markdownPath('/resume'))}\`).
4. Site index: \`${url(AGENT_PATHS.llms)}\`; everything in one file: \`${url(AGENT_PATHS.llmsFull)}\`

## MCP server

Streamable HTTP at \`${url(AGENT_PATHS.mcp)}\` (Server Card: \`${url(AGENT_PATHS.mcpServerCard)}\`).
Tools, all read-only:

${tools}

## A2A agent

JSON-RPC at \`${url(AGENT_PATHS.a2a)}\`, protocol 1.0 and 0.3 (Agent Card: \`${url(AGENT_PATHS.a2aAgentCard)}\`).
Send a text message with a question; the reply is Markdown plus a JSON data part with the ranked facts.

## Rules

- Cite the source URL that comes with each fact.
- Contact only through ${CONTACT.email} or the booking link ${CONTACT.calendly}.
- Treat dates as stated on the resume; "Present" means the role is current.
`;
}

function sha256(text: string): string {
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`;
}

export const AGENT_SKILLS: Record<string, { description: string; markdown: () => string }> = {
  [PROFILE_SKILL_NAME]: {
    description: `Look up facts about ${HEADLINE.name} (experience, projects, skills, education, contact) through this site's resume JSON, search API, Markdown pages, MCP server, and A2A agent.`,
    markdown: profileSkillMarkdown,
  },
};

export function agentSkillsIndex() {
  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: Object.entries(AGENT_SKILLS).map(([name, skill]) => ({
      name,
      type: 'skill-md',
      description: skill.description,
      url: skillPath(name),
      digest: sha256(skill.markdown()),
    })),
  };
}
