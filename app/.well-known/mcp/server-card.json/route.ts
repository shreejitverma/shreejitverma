import { mcpServerCard } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return jsonResponse(mcpServerCard(), 'application/mcp-server-card+json', { request });
}

export const OPTIONS = corsPreflight;
