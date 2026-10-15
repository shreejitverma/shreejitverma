import { apiCatalog } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(apiCatalog(), 'application/linkset+json');
}

export const OPTIONS = corsPreflight;
