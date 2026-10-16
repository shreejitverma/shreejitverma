// Job opportunities sent by authenticated agents, delivered as issues in a
// private GitHub repository (GitHub then notifies Shreejit by email).
//
// Everything in a submission is untrusted text from a third party. It is
// rendered inside fenced code blocks, so it cannot inject Markdown, images,
// links, or @mentions into the issue.

import { randomBytes } from 'node:crypto';
import * as z from 'zod/v4';
import { LIMITS } from './auth/config';
import { authStore, AuthNotConfiguredError } from './auth/runtime';
import type { Caller } from './auth/resource';

export const opportunitySchema = z.object({
  role: z.string().trim().min(2).max(120).describe('Job title, e.g. "Senior Quantitative Developer"'),
  company: z.string().trim().min(1).max(120).describe('Hiring firm, or "Confidential"'),
  location: z.string().trim().max(120).optional().describe('City and work arrangement, e.g. "New York, hybrid"'),
  employment_type: z.enum(['full-time', 'contract', 'internship', 'other']).optional(),
  compensation: z.string().trim().max(120).optional().describe('Range and currency, e.g. "$250k-$350k base + bonus"'),
  description: z.string().trim().min(20).max(4000).describe('What the role involves and why it fits Shreejit'),
  apply_url: z.string().trim().url().max(500).optional().describe('Job posting or application link'),
  reply_to: z.string().trim().email().max(254).optional().describe('Where Shreejit should reply, if not the approving person\'s email'),
});

export type Opportunity = z.infer<typeof opportunitySchema>;

export class SubmissionError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

// Longest backtick run + 1, so no submitted text can close the fence.
function fenced(text: string): string {
  const longest = Math.max(2, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(longest + 1);
  return `${fence}text\n${text}\n${fence}`;
}

function oneLine(text: string, max: number): string {
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function issueFor(opportunity: Opportunity, caller: Caller, reference: string) {
  const contact = caller.contact;
  const fields: [string, string | undefined][] = [
    ['Role', opportunity.role],
    ['Company', opportunity.company],
    ['Location', opportunity.location],
    ['Employment type', opportunity.employment_type],
    ['Compensation', opportunity.compensation],
    ['Apply URL', opportunity.apply_url],
    ['Approved by (self-reported, unverified)', contact ? `${contact.name} <${contact.email}>${contact.company ? `, ${contact.company}` : ''}` : undefined],
    ['Reply to', opportunity.reply_to ?? contact?.email],
    ['Agent', caller.label],
  ];
  const body = [
    `Submitted through the agent API on ${new Date().toISOString()}. Reference \`${reference}\`.`,
    '',
    ...fields.filter(([, v]) => v).flatMap(([k, v]) => [`**${k}**`, fenced(v!), '']),
    '**Description**',
    fenced(opportunity.description),
  ].join('\n');
  return {
    title: oneLine(`Opportunity: ${opportunity.role} at ${opportunity.company}`, 200),
    body,
    labels: ['opportunity'],
  };
}

// Daily caps, narrowest first: per approval, per network, per client, then
// global. Approvals cost nothing to script (there are no accounts), so the
// per-IP and per-client caps are what stop one actor from using up the
// global cap and locking out real recruiters.
async function reserveQuota(caller: Caller, ip: string): Promise<string[]> {
  const day = new Date().toISOString().slice(0, 10);
  const store = authStore();
  const caps: [key: string, max: number, message: string][] = [
    [`rl:submit:sub:${caller.sub}:${day}`, LIMITS.submissionsPerPrincipalPerDay, `At most ${LIMITS.submissionsPerPrincipalPerDay} opportunities per day per approval`],
    [`rl:submit:ip:${ip}:${day}`, LIMITS.submissionsPerIpPerDay, 'Too many opportunities from this network today; try again tomorrow'],
    [`rl:submit:client:${caller.clientId}:${day}`, LIMITS.submissionsPerClientPerDay, 'This client has sent its daily maximum; try again tomorrow'],
    [`rl:submit:all:${day}`, LIMITS.submissionsPerDay, 'The daily submission limit is reached; try again tomorrow'],
  ];
  const reserved: string[] = [];
  for (const [key, max, message] of caps) {
    reserved.push(key);
    if ((await store.incr(key, 86_400)) > max) {
      await release(reserved);
      throw new SubmissionError(message, 429);
    }
  }
  return reserved;
}

// A submission that was refused or not delivered must not use up quota.
async function release(keys: string[]) {
  await Promise.all(keys.map((key) => authStore().decr(key)));
}

export async function submitOpportunity(opportunity: Opportunity, caller: Caller, ip: string): Promise<{ reference: string }> {
  const reserved = await reserveQuota(caller, ip);

  const reference = `opp_${randomBytes(6).toString('hex')}`;
  const issue = issueFor(opportunity, caller, reference);
  const token = process.env.GITHUB_OPPORTUNITIES_TOKEN;
  const repo = process.env.GITHUB_OPPORTUNITIES_REPO ?? 'shreejitverma/opportunities';
  if (!token) {
    if (process.env.VERCEL === '1') {
      await release(reserved);
      throw new AuthNotConfiguredError('GITHUB_OPPORTUNITIES_TOKEN is not set');
    }
    // Off Vercel (local runs, the e2e suite) there is nowhere to deliver to;
    // the submission is accepted and logged so the whole flow can be tested.
    console.info(`opportunity ${reference} (not delivered, no GITHUB_OPPORTUNITIES_TOKEN): ${issue.title}`);
    return { reference };
  }

  let response: Response;
  try {
    response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'shreejitverma-opportunities/1.0',
    },
    body: JSON.stringify(issue),
    signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    await release(reserved);
    console.error('opportunity delivery failed', error);
    throw new SubmissionError('The opportunity could not be delivered; try again later', 502);
  }
  if (!response.ok) {
    // The submission was not delivered; say so rather than report success,
    // and give the quota back.
    await release(reserved);
    console.error('opportunity delivery failed', response.status, (await response.text()).slice(0, 300));
    throw new SubmissionError('The opportunity could not be delivered; try again later', 502);
  }
  return { reference };
}
