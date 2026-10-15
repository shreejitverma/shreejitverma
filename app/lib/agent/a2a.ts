// A2A agent served at /a2a over JSON-RPC, protocol 1.0 and 0.3.
//
// The agent is deterministic retrieval, not a language model: it answers a
// question with the best-matching profile facts (Markdown text part) and the
// same hits as structured data (JSON data part). Replies are direct messages,
// never long-running tasks, so the in-memory task store holds nothing
// between requests and the endpoint is safe to run statelessly.

import { randomUUID } from 'node:crypto';
import { Role, type AgentCard, type Message, type Part } from '@a2a-js/sdk';
import {
  AgentEvent, DefaultRequestHandler, InMemoryTaskStore, JsonRpcTransportHandler, ServerCallContext,
  validateVersion, type AgentExecutor,
} from '@a2a-js/sdk/server';
import { LegacyJsonRpcTransportHandler } from '@a2a-js/sdk/compat/v0_3/server';
import { a2aAgentCard } from './discovery';
import { absoluteUrl, getProfile, searchProfile } from './knowledge';
import { AGENT_PATHS } from './constants';

const OVERVIEW_QUERY = /^(|overview|summary|hi|hello|who is (he|shreejit( verma)?)\??|tell me about (him|shreejit( verma)?))$/i;

function textPart(value: string, mediaType = 'text/markdown'): Part {
  return { content: { $case: 'text', value }, metadata: undefined, filename: '', mediaType };
}

function dataPart(value: unknown): Part {
  return { content: { $case: 'data', value }, metadata: undefined, filename: '', mediaType: 'application/json' };
}

export function answer(rawQuestion: string): { markdown: string; data: unknown } {
  const question = rawQuestion.trim();
  if (OVERVIEW_QUERY.test(question)) {
    const profile = getProfile();
    const markdown = [
      `**${profile.name}**: ${profile.current}, ${profile.location}.`,
      '',
      profile.summary,
      '',
      ...profile.highlights.map((h) => `- ${h}`),
      '',
      `Resume: ${profile.links.resume} (PDF: ${profile.links.resumePdf}, JSON: ${profile.links.resumeJson})`,
      `Contact: ${profile.contact.email}, or book a call at ${profile.contact.bookACall}`,
    ].join('\n');
    return { markdown, data: profile };
  }

  const hits = searchProfile(question, 5);
  if (hits.length === 0) {
    return {
      markdown:
        `No profile facts matched "${question}". Try specific terms such as a company, technology, or topic ` +
        `(for example "C++ market making" or "FRTB"), or read the full resume at ${absoluteUrl(AGENT_PATHS.resumeJson)}.`,
      data: { query: question, hits: [] },
    };
  }
  const markdown = [
    `Best-matching facts from shreejitverma.com for "${question}":`,
    '',
    ...hits.map((hit, i) => `${i + 1}. **${hit.title}** (${hit.kind})\n   ${hit.snippet}\n   Source: ${hit.url}`),
    '',
    `Full resume: ${absoluteUrl(AGENT_PATHS.resumeJson)}`,
  ].join('\n');
  return { markdown, data: { query: question, hits } };
}

const executor: AgentExecutor = {
  async execute(requestContext, eventBus) {
    const question = requestContext.userMessage.parts
      .map((part) => (part.content?.$case === 'text' ? part.content.value : ''))
      .join(' ');
    const { markdown, data } = answer(question);
    const reply: Message = {
      messageId: randomUUID(),
      contextId: requestContext.contextId,
      taskId: '',
      role: Role.ROLE_AGENT,
      parts: [textPart(markdown), dataPart(data)],
      metadata: undefined,
      extensions: [],
      referenceTaskIds: [],
    };
    eventBus.publish(AgentEvent.message(reply));
    eventBus.finished();
  },
  async cancelTask() {
    // Replies are immediate messages, so there is never a running task to cancel.
  },
};

const agentCard = a2aAgentCard() as AgentCard;
const requestHandler = new DefaultRequestHandler(agentCard, new InMemoryTaskStore(), executor);
const transport = new JsonRpcTransportHandler(requestHandler);
const legacyTransport = new LegacyJsonRpcTransportHandler(requestHandler);

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function rpcError(id: unknown, code: number, message: string, status = 200): Response {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, { status, headers: JSON_HEADERS });
}

// Mirrors the SDK's Express JSON-RPC adapter (jsonRpcHandler) on web-standard
// Request/Response. The A2A-Version header selects the protocol; a request
// without it is v0.3, as the A2A 1.0 spec requires.
export async function handleA2aRequest(request: Request): Promise<Response> {
  let body: { id?: unknown; method?: unknown };
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, 'Parse error: request body must be JSON-RPC 2.0');
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return rpcError(null, -32600, 'Invalid Request: body must be a JSON-RPC 2.0 request object');
  }

  const requestedVersion = request.headers.get('A2A-Version') || undefined;
  const useLegacy = (requestedVersion ?? '0.3') === '0.3';
  const mapError = useLegacy ? LegacyJsonRpcTransportHandler.mapToLegacyJSONRPCError : JsonRpcTransportHandler.mapToJSONRPCError;
  try {
    const context = new ServerCallContext({ requestedVersion, state: new Map([['headers', Object.fromEntries(request.headers)]]) });
    validateVersion(context.requestedVersion, agentCard, 'JSONRPC');
    const result = await (useLegacy ? legacyTransport : transport).handle(body as Record<string, unknown>, context);
    if (result && typeof (result as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function') {
      // Streaming is not advertised (capabilities.streaming is false), but a
      // client that asks anyway still gets a well-formed SSE stream.
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of result as AsyncIterable<unknown>) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ jsonrpc: '2.0', id: body?.id ?? null, error: mapError(error) })}\n\n`));
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
    }
    return Response.json(result, { headers: JSON_HEADERS });
  } catch (error) {
    return Response.json({ jsonrpc: '2.0', id: body?.id ?? null, error: mapError(error) }, { headers: JSON_HEADERS });
  }
}
