import { a2aAgentCard } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return jsonResponse(a2aAgentCard(), 'application/json', { request });
}

export const OPTIONS = corsPreflight;
