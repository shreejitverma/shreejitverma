import { aiCatalog } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return jsonResponse(aiCatalog(), 'application/ai-catalog+json', { request });
}

export const OPTIONS = corsPreflight;
