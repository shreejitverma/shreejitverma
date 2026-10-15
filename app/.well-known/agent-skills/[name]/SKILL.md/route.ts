import { AGENT_SKILLS } from '@/app/lib/agent/discovery';
import { corsPreflight, textResponse } from '@/app/lib/agent/http';

// The index at /.well-known/agent-skills/index.json carries each file's
// SHA-256 digest, computed from the same markdown() function served here.

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!Object.hasOwn(AGENT_SKILLS, name)) return textResponse('Unknown skill. See /.well-known/agent-skills/index.json\n', 'text/plain', { status: 404, cacheControl: 'no-store' });
  return textResponse(AGENT_SKILLS[name].markdown(), 'text/markdown');
}

export const OPTIONS = corsPreflight;
