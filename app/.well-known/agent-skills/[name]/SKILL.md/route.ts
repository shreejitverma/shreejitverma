import { AGENT_SKILLS } from '@/app/lib/agent/discovery';
import { corsPreflight, textResponse } from '@/app/lib/agent/http';

// The index at /.well-known/agent-skills/index.json carries each file's
// SHA-256 digest, computed from the same markdown() function served here.

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const skill = AGENT_SKILLS[(await params).name];
  if (!skill) return textResponse('Unknown skill. See /.well-known/agent-skills/index.json\n', 'text/plain', { status: 404, cacheControl: 'no-store' });
  return textResponse(skill.markdown(), 'text/markdown');
}

export const OPTIONS = corsPreflight;
