import { handleA2aRequest } from '@/app/lib/agent/a2a';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, A2A-Version, A2A-Extensions, X-A2A-Extensions',
};

export async function POST(request: Request) {
  const response = await handleA2aRequest(request);
  for (const [key, value] of Object.entries(CORS)) response.headers.set(key, value);
  return response;
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
}
