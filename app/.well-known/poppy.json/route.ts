import { poppyManifest } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(poppyManifest(), 'application/json');
}

export const OPTIONS = corsPreflight;
