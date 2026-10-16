import { apiCatalog } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return jsonResponse(apiCatalog(), 'application/linkset+json', { request });
}

export const OPTIONS = corsPreflight;
