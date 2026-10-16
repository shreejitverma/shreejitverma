import { createMcpHandler, McpServer, type CallToolResult } from '@modelcontextprotocol/server';
import { AGENT_API_VERSION } from '@/app/lib/agent/constants';
import { RESOURCES, SCOPES } from '@/app/lib/auth/config';
import { authenticate, type Caller } from '@/app/lib/auth/resource';
import { opportunitySchema, submitOpportunity, SubmissionError } from '@/app/lib/opportunities';

// Authenticated MCP server: lets an approved agent send opportunities to
// Shreejit. An unauthenticated request gets 401 with a resource_metadata
// pointer, which is how MCP clients discover the OAuth flow. The public,
// read-only tools stay at /mcp.

const text = (value: string, isError = false): CallToolResult => ({ content: [{ type: 'text', text: value }], ...(isError ? { isError } : {}) });

function buildServer(caller: Caller): McpServer {
  const server = new McpServer(
    { name: 'com.shreejitverma/recruiter', title: 'Shreejit Verma - recruiter access', version: AGENT_API_VERSION },
    { instructions: 'Send a job opportunity to Shreejit Verma on behalf of the person who approved this connection. Call whoami to see who that is.' },
  );
  server.registerTool(
    'send_opportunity',
    {
      title: 'Send an opportunity',
      description: 'Send a job opportunity to Shreejit Verma. It is delivered with the approving person\'s name and email so he can reply. Limited to a few per day.',
      inputSchema: opportunitySchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (opportunity) => {
      try {
        const { reference } = await submitOpportunity(opportunity, caller);
        return text(`Delivered to Shreejit Verma. Reference: ${reference}.`);
      } catch (error) {
        if (error instanceof SubmissionError) return text(error.message, true);
        throw error;
      }
    },
  );
  server.registerTool(
    'whoami',
    {
      title: 'Who approved this connection',
      description: 'The person and client this connection acts for, and its scopes.',
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => text(JSON.stringify({ approvedBy: caller.contact ?? null, client: caller.label, scopes: caller.scopes }, null, 2)),
  );
  return server;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version, WWW-Authenticate',
};

async function handle(request: Request): Promise<Response> {
  const caller = await authenticate(request, RESOURCES.mcpRecruiter, SCOPES.opportunitiesWrite);
  // One handler per request: the server closes over this caller's identity.
  const response = caller instanceof Response ? caller : await createMcpHandler(() => buildServer(caller)).fetch(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
}
