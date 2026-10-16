import { didDocument } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return jsonResponse(didDocument(), 'application/did+json', { request });
}

export const OPTIONS = corsPreflight;
