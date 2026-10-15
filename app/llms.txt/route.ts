import { llmsTxt } from '@/app/lib/agent/llms';
import { corsPreflight, textResponse } from '@/app/lib/agent/http';

export function GET() {
  return textResponse(llmsTxt(), 'text/plain');
}

export const OPTIONS = corsPreflight;
