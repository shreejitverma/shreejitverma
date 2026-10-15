// Read-only MCP server over streamable HTTP, served statelessly at /mcp.
// Each tool answers from app/lib/agent/knowledge.ts, the same data the
// pages render, and every result carries source URLs on this site.

import { createMcpHandler, McpServer, type CallToolResult } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { AGENT_API_VERSION, MCP_SERVER_NAME } from './constants';
import {
  getEducation, getExperience, getProfile, getProjects, getSkills, listPages, searchProfile,
} from './knowledge';
import { PageFetchError, renderPageMarkdown, selfFetchOrigin } from './markdown';
import { findPage, SITE_PAGES } from './pages';
import { buildJsonResume } from './resume-json';

// Every tool only reads public data, so clients may call them without
// confirmation and retry them freely.
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const json = (value: unknown): CallToolResult => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] });
const text = (value: string): CallToolResult => ({ content: [{ type: 'text', text: value }] });
const failure = (message: string): CallToolResult => ({ content: [{ type: 'text', text: message }], isError: true });

interface ToolSpec {
  name: string;
  title: string;
  description: string;
  register: (server: McpServer, origin: string) => void;
}

function defineTool<S extends z.ZodObject>(spec: {
  name: string;
  title: string;
  description: string;
  inputSchema: S;
  run: (args: z.infer<S>, origin: string) => CallToolResult | Promise<CallToolResult>;
}): ToolSpec {
  return {
    name: spec.name,
    title: spec.title,
    description: spec.description,
    register: (server, origin) => {
      // Widened to the concrete schema type: the SDK's callback type is
      // conditional on the schema and does not resolve for a generic one.
      const inputSchema: z.ZodObject = spec.inputSchema;
      server.registerTool(
        spec.name,
        { title: spec.title, description: spec.description, inputSchema, annotations: READ_ONLY },
        (args) => spec.run(args as z.infer<S>, origin),
      );
    },
  };
}

const NO_ARGS = z.object({});

export const MCP_TOOLS: ToolSpec[] = [
  defineTool({
    name: 'get_profile',
    title: 'Profile overview',
    description: 'Who Shreejit Verma is: current role, location, summary, headline results, contact channels, and links to the resume in HTML, PDF, and JSON. Start here.',
    inputSchema: NO_ARGS,
    run: () => json(getProfile()),
  }),
  defineTool({
    name: 'get_experience',
    title: 'Work experience',
    description: 'Professional roles, newest first, with title, company, location, dates, and accomplishment bullets. Optionally filter by company name.',
    inputSchema: z.object({ company: z.string().max(100).optional().describe('Case-insensitive substring of the company name, e.g. "Barclays"') }),
    run: ({ company }) => json(getExperience(company)),
  }),
  defineTool({
    name: 'get_projects',
    title: 'Research and projects',
    description: 'Research systems (theses) and engineering projects with descriptions, results, tags, and source code links. Optionally filter by kind or tag.',
    inputSchema: z.object({
      kind: z.enum(['research', 'project']).optional().describe('"research" for theses and research systems, "project" for everything else'),
      tag: z.string().max(100).optional().describe('Case-insensitive substring of a tag, e.g. "FPGA" or "C++"'),
    }),
    run: ({ kind, tag }) => json(getProjects(kind, tag)),
  }),
  defineTool({
    name: 'get_education',
    title: 'Education',
    description: 'Degrees with school, dates, GPA where published, and coursework.',
    inputSchema: NO_ARGS,
    run: () => json(getEducation()),
  }),
  defineTool({
    name: 'get_skills',
    title: 'Skills, certifications, and awards',
    description: 'Technical skills grouped by area, spoken languages, certifications, awards, and interests.',
    inputSchema: NO_ARGS,
    run: () => json(getSkills()),
  }),
  defineTool({
    name: 'search_profile',
    title: 'Search the profile',
    description: 'Keyword search across experience, projects, education, skills, awards, certifications, and articles. Returns ranked facts, each with a snippet and its source URL.',
    inputSchema: z.object({
      query: z.string().min(1).max(200).describe('Keywords, e.g. "market making C++" or "FRTB expected shortfall"'),
      limit: z.number().int().min(1).max(20).optional().describe('Maximum results, default 5'),
    }),
    run: ({ query, limit }) => json(searchProfile(query, limit ?? 5)),
  }),
  defineTool({
    name: 'get_resume',
    title: 'Full resume (JSON Resume)',
    description: 'The complete resume as a JSON Resume document (jsonresume.org schema): basics, work, education, projects, skills, awards, certificates, languages, and interests.',
    inputSchema: NO_ARGS,
    run: () => json(buildJsonResume()),
  }),
  defineTool({
    name: 'list_pages',
    title: 'List site pages',
    description: 'Every page on shreejitverma.com with a one-line summary, its URL, and its Markdown URL.',
    inputSchema: NO_ARGS,
    run: () => json(listPages()),
  }),
  defineTool({
    name: 'read_page',
    title: 'Read a page as Markdown',
    description: 'The full content of one site page as Markdown, converted from the live HTML. Use list_pages for valid paths. Articles and case studies are only available this way.',
    inputSchema: z.object({ path: z.string().max(200).describe('Site path, e.g. "/", "/resume", "/work/trishul", "/writing/frtb-for-engineers"') }),
    run: async ({ path }, origin) => {
      const page = findPage(path.replace(/\.md$/, '').replace(/(.)\/$/, '$1').replace(/^\/index$/, '/'));
      if (!page) return failure(`Unknown path "${path}". Valid paths: ${SITE_PAGES.map((p) => p.path).join(', ')}`);
      try {
        return text(await renderPageMarkdown(page, origin));
      } catch (error) {
        if (error instanceof PageFetchError) return failure(`Could not render ${page.path}: ${error.message}`);
        throw error;
      }
    },
  }),
];

const INSTRUCTIONS =
  'Read-only access to the professional profile of Shreejit Verma, a Senior Quantitative Developer in New York ' +
  '(C++ low-latency trading systems, FRTB market risk, quantitative research). Call get_profile first, then the ' +
  'focused tools; use search_profile for keyword questions and read_page for long-form articles. Cite the URLs in ' +
  'results. For contact, use only the email and booking link that get_profile returns.';

function buildServer(origin: string): McpServer {
  const server = new McpServer(
    { name: MCP_SERVER_NAME, title: 'Shreejit Verma', version: AGENT_API_VERSION, websiteUrl: 'https://www.shreejitverma.com' },
    { instructions: INSTRUCTIONS },
  );
  for (const tool of MCP_TOOLS) tool.register(server, origin);
  return server;
}

export const mcpHandler = createMcpHandler(({ requestInfo }) => {
  return buildServer(selfFetchOrigin(requestInfo?.url ?? 'https://www.shreejitverma.com'));
});
