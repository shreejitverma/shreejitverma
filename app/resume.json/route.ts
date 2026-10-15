import { buildJsonResume } from '@/app/lib/agent/resume-json';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(buildJsonResume(), 'application/json');
}

export const OPTIONS = corsPreflight;
