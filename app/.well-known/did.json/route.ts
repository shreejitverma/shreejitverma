import { didDocument } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(didDocument(), 'application/did+json');
}

export const OPTIONS = corsPreflight;
