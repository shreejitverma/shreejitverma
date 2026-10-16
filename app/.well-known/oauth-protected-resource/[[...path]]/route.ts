import { RESOURCES } from '@/app/lib/auth/config';
import { protectedResourceMetadata } from '@/app/lib/auth/resource';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

// RFC 9728 Protected Resource Metadata. The bare path describes the whole
// site; a path suffix describes one protected endpoint (section 3.1).
const BY_PATH: Record<string, string> = {
  '': RESOURCES.site,
  'mcp/recruiter': RESOURCES.mcpRecruiter,
  'api/opportunities': RESOURCES.opportunities,
};

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const resource = BY_PATH[((await params).path ?? []).join('/')];
  if (!resource) return jsonResponse({ error: 'not_found', error_description: 'No protected resource at this path' }, 'application/json', { status: 404, cacheControl: 'no-store' });
  return jsonResponse(protectedResourceMetadata(resource), 'application/json', { request });
}

export const OPTIONS = corsPreflight;
