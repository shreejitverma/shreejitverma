import { a2aAgentCard } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(a2aAgentCard(), 'application/json');
}

export const OPTIONS = corsPreflight;
