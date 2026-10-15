import { openApiDocument } from '@/app/lib/agent/openapi';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(openApiDocument(), 'application/vnd.oai.openapi+json');
}

export const OPTIONS = corsPreflight;
