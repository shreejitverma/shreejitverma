import { aiCatalog } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(aiCatalog(), 'application/ai-catalog+json');
}

export const OPTIONS = corsPreflight;
