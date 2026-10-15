import { agentSkillsIndex } from '@/app/lib/agent/discovery';
import { corsPreflight, jsonResponse } from '@/app/lib/agent/http';

export function GET() {
  return jsonResponse(agentSkillsIndex(), 'application/json');
}

export const OPTIONS = corsPreflight;
