import { authorizationServerMetadata } from '@/app/lib/auth/metadata';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

// RFC 8414 Authorization Server Metadata, with the auth.md agent_auth block.
export function GET(request: Request) {
  return jsonResponse(authorizationServerMetadata(), 'application/json', { request });
}

export const OPTIONS = corsPreflight;
