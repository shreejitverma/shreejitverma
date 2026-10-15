// OpenAPI 3.1 description of the REST endpoints: profile search and the
// JSON Resume. Referenced from the RFC 9727 API catalog.

import { HEADLINE, SITE_URL } from '../profile';
import { AGENT_API_VERSION, AGENT_PATHS } from './constants';

export function openApiDocument() {
  const hit = {
    type: 'object',
    required: ['kind', 'title', 'snippet', 'url', 'score'],
    properties: {
      kind: { type: 'string', enum: ['experience', 'project', 'education', 'skills', 'article', 'page', 'award', 'certification'] },
      title: { type: 'string' },
      snippet: { type: 'string', description: 'The line of the source that best matches the query' },
      url: { type: 'string', format: 'uri', description: 'Where the fact is published' },
      score: { type: 'number', description: 'Relevance; higher is better' },
    },
  };
  return {
    openapi: '3.1.0',
    info: {
      title: `${HEADLINE.name} profile API`,
      version: AGENT_API_VERSION,
      description: `Read-only, unauthenticated access to the professional profile of ${HEADLINE.name}. For tool-calling agents, the same data is available over MCP at ${SITE_URL}${AGENT_PATHS.mcp}.`,
    },
    servers: [{ url: SITE_URL }],
    paths: {
      [AGENT_PATHS.search]: {
        get: {
          operationId: 'searchProfile',
          summary: 'Keyword search across the profile',
          description: 'Ranks experience, projects, education, skills, awards, certifications, and articles against the query.',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 200 }, example: 'market making C++' },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 20, default: 5 } },
          ],
          responses: {
            '200': {
              description: 'Ranked results',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['query', 'results'],
                    properties: { query: { type: 'string' }, total: { type: 'integer' }, results: { type: 'array', items: hit } },
                  },
                },
              },
            },
            '400': { description: 'Missing or invalid query' },
          },
        },
      },
      [AGENT_PATHS.resumeJson]: {
        get: {
          operationId: 'getResume',
          summary: 'Full resume as a JSON Resume document',
          responses: {
            '200': {
              description: 'JSON Resume v1.0.0',
              content: { 'application/json': { schema: { $ref: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json' } } },
            },
          },
        },
      },
    },
  };
}
