import { buildJsonResume } from '@/app/lib/agent/resume-json';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return jsonResponse(buildJsonResume(), 'application/json', { request });
}

export const OPTIONS = corsPreflight;
