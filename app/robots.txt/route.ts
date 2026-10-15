import { robotsTxt } from '@/app/lib/agent/llms';

// Replaces app/robots.ts: the Metadata API cannot emit Content-Signal or
// commented crawler groups.
export const dynamic = 'force-static';

export function GET() {
  return new Response(robotsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
