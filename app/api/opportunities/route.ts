import { RESOURCES, SCOPES } from '@/app/lib/auth/config';
import { clientIp, oauthErrorResponse, oauthJson, oauthPreflight, readJson } from '@/app/lib/auth/http';
import { authenticate } from '@/app/lib/auth/resource';
import { opportunitySchema, submitOpportunity, SubmissionError } from '@/app/lib/opportunities';

// POST an opportunity to Shreejit. Requires a bearer token with
// opportunities:write; agents learn how to get one from /auth.md.
export async function POST(request: Request) {
  const caller = await authenticate(request, RESOURCES.opportunities, SCOPES.opportunitiesWrite);
  if (caller instanceof Response) return caller;
  try {
    const parsed = opportunitySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return oauthJson({ error: 'invalid_request', error_description: `${issue?.path.join('.') || 'body'}: ${issue?.message}` }, 400);
    }
    const { reference } = await submitOpportunity(parsed.data, caller, clientIp(request));
    return oauthJson({ status: 'delivered', reference }, 201);
  } catch (error) {
    if (error instanceof SubmissionError) return oauthJson({ error: 'submission_failed', error_description: error.message }, error.status);
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
