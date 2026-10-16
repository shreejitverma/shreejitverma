// llms.txt (https://llmstxt.org) and robots.txt, generated from the profile
// and page list so they stay in step with the site.

import { CONTACT, EDUCATION, EXPERIENCE, HEADLINE, SITE_URL, SUMMARY } from '../profile';
import { AGENT_PATHS, CONTENT_SIGNAL } from './constants';
import { absoluteUrl } from './knowledge';
import { renderPageMarkdown } from './markdown';
import { markdownPath, SITE_PAGES } from './pages';

export function llmsTxt(): string {
  const [current, previous] = EXPERIENCE;
  const role = (r: (typeof EXPERIENCE)[number]) => `${r.title} at ${r.company}, ${r.location} (${r.dates})`;
  const url = absoluteUrl;
  return `# ${HEADLINE.name}

> ${SUMMARY}

Current role: ${role(current)}.
Previous role: ${role(previous)}.
Education: ${EDUCATION.filter((s) => !s.degree.includes('withdrawn')).map((s) => `${s.degree}, ${s.school} (${s.dates})`).join('; ')}.

Every page below links to its Markdown version. Any page also returns Markdown when requested with \`Accept: text/markdown\`.

## Pages

${SITE_PAGES.map((page) => `- [${page.title}](${url(markdownPath(page.path))}): ${page.summary}`).join('\n')}

## Machine-readable

- [Resume (JSON Resume)](${url(AGENT_PATHS.resumeJson)}): the full resume in the jsonresume.org schema
- [Resume (PDF)](${url(CONTACT.resumePdf)}): downloadable resume
- [Search API](${url(AGENT_PATHS.search)}?q=market%20making): keyword search with source URLs; described by [OpenAPI](${url(AGENT_PATHS.openapi)})
- [MCP server](${url(AGENT_PATHS.mcp)}): read-only streamable HTTP MCP server, no authentication ([Server Card](${url(AGENT_PATHS.mcpServerCard)}))
- [A2A agent](${url(AGENT_PATHS.a2a)}): JSON-RPC agent for profile questions ([Agent Card](${url(AGENT_PATHS.a2aAgentCard)}))
- [Agent Skills](${url(AGENT_PATHS.agentSkills)}): how an agent should use these endpoints
- [AI Catalog](${url(AGENT_PATHS.aiCatalog)}) and [API Catalog](${url(AGENT_PATHS.apiCatalog)}): discovery manifests
- [Full content](${url(AGENT_PATHS.llmsFull)}): every page in one Markdown file
- [Atom feed](${url('/feed.xml')}): new articles as they are published
- [auth.md](${url('/auth.md')}): how a recruiter's agent gets approved to send Shreejit an opportunity (OAuth 2.1 and agentic registration)

## Profiles

- [GitHub](${CONTACT.github})
- [LinkedIn](${CONTACT.linkedin})
- [Google Scholar](${CONTACT.scholar})

## Contact

- Email: ${CONTACT.email}
- Book a call: ${CONTACT.calendly}
`;
}

// Every page's Markdown, in sitemap order, after the llms.txt overview.
export async function llmsFullTxt(origin: string): Promise<string> {
  const pages = await Promise.all(SITE_PAGES.map((page) => renderPageMarkdown(page, origin)));
  return [llmsTxt(), ...pages].join('\n\n---\n\n');
}

// Crawlers grouped by purpose so each policy can be changed on its own.
// All groups currently share the site-wide policy: everything is public.
const AI_CRAWLERS: { purpose: string; agents: string[] }[] = [
  {
    purpose: 'AI search and answer engines: fetch the pages AI assistants cite',
    agents: ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'DuckAssistBot'],
  },
  {
    purpose: 'User-triggered AI fetchers: retrieve a page when a person asks an assistant about it',
    agents: ['ChatGPT-User', 'Claude-User', 'Perplexity-User', 'MistralAI-User'],
  },
  {
    purpose: 'AI training crawlers',
    agents: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Amazonbot', 'Meta-ExternalAgent', 'Bytespider'],
  },
];

export function robotsTxt(): string {
  const rules = [`Content-Signal: ${CONTENT_SIGNAL}`, 'Allow: /', 'Disallow: /private/'].join('\n');
  const groups = AI_CRAWLERS.map(({ purpose, agents }) => `# ${purpose}\n${agents.map((a) => `User-agent: ${a}`).join('\n')}\n${rules}`);
  return `# ${HEADLINE.name} - ${SITE_URL}
# Humans, crawlers, and AI agents are welcome.
# Start here: ${absoluteUrl(AGENT_PATHS.llms)}
# Content Signals (https://contentsignals.org): search=yes allows search indexing, ai-input=yes allows use as
# input to AI answers, ai-train=yes allows use for AI model training.

User-agent: *
${rules}

${groups.join('\n\n')}

Sitemap: ${absoluteUrl('/sitemap.xml')}
Agentmap: ${absoluteUrl(AGENT_PATHS.aiCatalog)}
`;
}
