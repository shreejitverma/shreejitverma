import { openApiDocument } from '@/app/lib/agent/openapi';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return jsonResponse(openApiDocument(), 'application/vnd.oai.openapi+json', { request });
}

export const OPTIONS = corsPreflight;
