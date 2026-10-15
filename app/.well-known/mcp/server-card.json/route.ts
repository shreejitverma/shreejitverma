import { mcpServerCard } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(mcpServerCard(), 'application/mcp-server-card+json');
}

export const OPTIONS = corsPreflight;
