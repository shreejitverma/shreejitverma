import { llmsTxt } from '@/app/lib/agent/llms';
import { corsPreflight, textResponse } from '@/app/lib/agent/http';

export function GET(request: Request) {
  return textResponse(llmsTxt(), 'text/plain', { request });
}

export const OPTIONS = corsPreflight;
