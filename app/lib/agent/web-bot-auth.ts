// Web Bot Auth: this site signs the requests its own bots send, so the
// receiving server (including Cloudflare, once the site is proxied) can
// verify they come from shreejitverma.com. Today the bot is the Markdown
// converter, which fetches this site's pages.
//
// Signatures are HTTP Message Signatures (RFC 9421) with Ed25519, in the
// format Cloudflare documents for Web Bot Auth: a `Signature-Agent` header
// holding the quoted URL of the key directory, covered together with
// `@authority`, and `tag="web-bot-auth"`. The format is cross-checked in the
// e2e suite against Cloudflare's own `web-bot-auth` verifier.

import { randomBytes, webcrypto } from 'node:crypto';
import { SITE_URL } from '../profile';
import { AuthNotConfiguredError, botSigningKey } from '../auth/runtime';

export const DIRECTORY_PATH = '/.well-known/http-message-signatures-directory';
export const DIRECTORY_URL = `${SITE_URL}${DIRECTORY_PATH}`;
const REQUEST_LIFETIME = 60; // seconds; Cloudflare: "a minute is often sufficient"
const DIRECTORY_LIFETIME = 300;

async function signBase(base: string): Promise<string> {
  const { privateKey } = await botSigningKey();
  const signature = await webcrypto.subtle.sign('Ed25519', privateKey, new TextEncoder().encode(base));
  return Buffer.from(signature).toString('base64');
}

// Signature headers for one outbound request. Returns none (and the request
// goes out unsigned) if no signing key is configured, so a missing key never
// breaks the feature the bot serves.
export async function signedBotHeaders(target: URL): Promise<Record<string, string>> {
  let keyid: string;
  try {
    ({ kid: keyid } = await botSigningKey());
  } catch (error) {
    if (!(error instanceof AuthNotConfiguredError)) throw error;
    console.warn('Web Bot Auth: WEB_BOT_AUTH_KEY is not set; sending unsigned');
    return {};
  }
  const created = Math.floor(Date.now() / 1000);
  const agent = `"${DIRECTORY_URL}"`;
  const params =
    `("@authority" "signature-agent");created=${created};keyid="${keyid}";alg="ed25519";` +
    `expires=${created + REQUEST_LIFETIME};nonce="${randomBytes(64).toString('base64')}";tag="web-bot-auth"`;
  // RFC 9421 section 2.5 signature base: one line per covered component, then
  // the signature parameters, joined by LF with no trailing newline.
  const base = `"@authority": ${target.host.toLowerCase()}\n"signature-agent": ${agent}\n"@signature-params": ${params}`;
  return {
    'Signature-Agent': agent,
    'Signature-Input': `sig1=${params}`,
    Signature: `sig1=:${await signBase(base)}:`,
  };
}

// The key directory, signed once per key over the authority it was requested
// on, as in Cloudflare's reference directory (tag
// "http-message-signatures-directory", `"@authority";req`).
export async function signedDirectory(authority: string): Promise<{ body: string; headers: Record<string, string> }> {
  const { publicJwk, kid } = await botSigningKey();
  const body = JSON.stringify({ keys: [{ kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x, kid }] });
  const created = Math.floor(Date.now() / 1000);
  const params =
    `("@authority";req);created=${created};keyid="${kid}";alg="ed25519";` +
    `expires=${created + DIRECTORY_LIFETIME};tag="http-message-signatures-directory"`;
  const base = `"@authority";req: ${authority.toLowerCase()}\n"@signature-params": ${params}`;
  return {
    body,
    headers: {
      'Content-Type': 'application/http-message-signatures-directory+json',
      'Signature-Input': `binding0=${params}`,
      Signature: `binding0=:${await signBase(base)}:`,
    },
  };
}
