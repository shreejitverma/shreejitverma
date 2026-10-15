import { llmsFullTxt } from '@/app/lib/agent/llms';
import { corsPreflight, textResponse } from '@/app/lib/agent/http';
import { PageFetchError, selfFetchOrigin } from '@/app/lib/agent/markdown';

// Converted from the live pages on each request (see app/lib/agent/markdown.ts).
export async function GET(request: Request) {
  try {
    return textResponse(await llmsFullTxt(selfFetchOrigin(request.url)), 'text/plain', { cacheControl: 'public, max-age=300' });
  } catch (error) {
    if (!(error instanceof PageFetchError)) throw error;
    return textResponse(`Could not assemble llms-full.txt: ${error.message}\n`, 'text/plain', { status: 502, cacheControl: 'no-store' });
  }
}

export const OPTIONS = corsPreflight;
