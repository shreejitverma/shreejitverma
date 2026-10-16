// Secrets and state for the authorization server, resolved once per process.
//
// On Vercel every dependency must be configured; a missing one fails closed
// (AuthNotConfiguredError, answered as 503) instead of silently weakening
// auth. Off Vercel (local `next start`, the e2e suite) the signing keys are
// generated per process and state lives in memory, so the flows run end to
// end without credentials.

import { calculateJwkThumbprint, exportJWK, generateKeyPair, importJWK, importPKCS8, type CryptoKey, type JWK } from 'jose';
import { Redis } from '@upstash/redis';

export class AuthNotConfiguredError extends Error {}

const ON_VERCEL = process.env.VERCEL === '1';

export interface SigningKey {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicJwk: JWK; // kty, crv, x plus kid, alg, use; never `d`
  kid: string; // RFC 7638 SHA-256 JWK thumbprint
}

const PEM_BLOCK = /-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/;

// A PKCS#8 PEM rebuilt from however the value was pasted into an env var UI:
// surrounding quotes or whitespace, `\n` escapes, flattened or CRLF line
// breaks, a stray shell prompt line, or the base64 body alone. The first
// PEM block wins. Returns null when there is no key material at all.
export function normalizePkcs8(raw: string): string | null {
  const text = raw.replace(/\\n/g, '\n');
  const block = PEM_BLOCK.exec(text);
  const body = (block ? block[1] : text).replace(/[^A-Za-z0-9+/=]/g, '');
  if (!body) return null;
  return `-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g)!.join('\n')}\n-----END PRIVATE KEY-----\n`;
}

// Ed25519 private key as PKCS#8 PEM in `envName`. An unusable value is a
// configuration error (503 with the reason logged), never a bare 500.
async function loadEd25519(envName: string): Promise<SigningKey> {
  const raw = process.env[envName];
  let privateKey: CryptoKey;
  if (raw) {
    const pem = normalizePkcs8(raw);
    try {
      if (!pem) throw new Error('no key material');
      privateKey = await importPKCS8(pem, 'EdDSA', { extractable: true });
    } catch (error) {
      throw new AuthNotConfiguredError(`${envName} is not a valid Ed25519 private key in PKCS#8 PEM form (${error instanceof Error ? error.message : String(error)})`);
    }
  } else if (ON_VERCEL) throw new AuthNotConfiguredError(`${envName} is not set`);
  else ({ privateKey } = await generateKeyPair('EdDSA', { crv: 'Ed25519', extractable: true }));

  // Copy only the public members, so the private scalar `d` can never be
  // published by mistake.
  const full = await exportJWK(privateKey);
  if (full.kty !== 'OKP' || full.crv !== 'Ed25519' || !full.x) throw new AuthNotConfiguredError(`${envName} is not an Ed25519 key`);
  const base: JWK = { kty: full.kty, crv: full.crv, x: full.x };
  const kid = await calculateJwkThumbprint(base, 'sha256');
  const publicKey = (await importJWK({ ...base, alg: 'EdDSA' }, 'EdDSA')) as CryptoKey;
  return { privateKey, publicKey, kid, publicJwk: { ...base, kid, alg: 'EdDSA', use: 'sig' } };
}

// Process-wide state. Next.js bundles pages and route handlers into separate
// module graphs, so a plain module-level singleton would exist once per graph:
// the consent page and the token endpoint would see different ephemeral keys
// and different in-memory stores. Keeping them on globalThis makes them one.
const shared = globalThis as typeof globalThis & {
  __agentAuthKeys?: Map<string, Promise<SigningKey>>;
  __agentAuthStore?: Store;
};
const keyCache = (shared.__agentAuthKeys ??= new Map<string, Promise<SigningKey>>());

function cachedKey(envName: string): Promise<SigningKey> {
  let key = keyCache.get(envName);
  if (!key) {
    key = loadEd25519(envName);
    // A failed load must not be cached forever; retry on the next request.
    key.catch(() => keyCache.delete(envName));
    keyCache.set(envName, key);
  }
  return key;
}

// Signs access tokens, identity assertions, and consent requests.
export const authSigningKey = () => cachedKey('AUTH_SIGNING_KEY');
// Signs this site's outbound bot requests (Web Bot Auth).
export const botSigningKey = () => cachedKey('WEB_BOT_AUTH_KEY');

// ---------------------------------------------------------------------------
// State: registered clients, single-use codes, refresh tokens, agent
// registrations, and rate-limit counters. Values are JSON; every key has a TTL.

export interface Store {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  // Atomic read-and-delete, for single-use secrets (authorization codes,
  // refresh tokens): two concurrent redemptions cannot both succeed.
  take<T>(key: string): Promise<T | null>;
  del(key: string): Promise<void>;
  // Set only if the key does not exist; true when this call set it. Used to
  // make one-time artifacts (consent requests) single use.
  setIfAbsent(key: string, value: unknown, ttlSeconds: number): Promise<boolean>;
  // Increment a fixed-window counter, starting its TTL on first use.
  incr(key: string, windowSeconds: number): Promise<number>;
  // Undo one increment (a refund when the counted action did not happen).
  decr(key: string): Promise<void>;
}

class RedisStore implements Store {
  constructor(private readonly redis: Redis) {}
  get<T>(key: string) {
    return this.redis.get<T>(key);
  }
  async set(key: string, value: unknown, ttlSeconds: number) {
    await this.redis.set(key, value, { ex: ttlSeconds });
  }
  take<T>(key: string) {
    return this.redis.getdel<T>(key);
  }
  async del(key: string) {
    await this.redis.del(key);
  }
  async setIfAbsent(key: string, value: unknown, ttlSeconds: number) {
    return (await this.redis.set(key, value, { ex: ttlSeconds, nx: true })) === 'OK';
  }
  async incr(key: string, windowSeconds: number) {
    const [count] = await this.redis.pipeline().incr(key).expire(key, windowSeconds, 'NX').exec<[number, number]>();
    return count;
  }
  async decr(key: string) {
    await this.redis.decr(key);
  }
}

class MemoryStore implements Store {
  private readonly data = new Map<string, { value: string; expires: number }>();
  private live(key: string) {
    const entry = this.data.get(key);
    if (entry && entry.expires <= Date.now()) this.data.delete(key);
    return this.data.get(key);
  }
  async get<T>(key: string) {
    const entry = this.live(key);
    return entry ? (JSON.parse(entry.value) as T) : null;
  }
  async set(key: string, value: unknown, ttlSeconds: number) {
    this.data.set(key, { value: JSON.stringify(value), expires: Date.now() + ttlSeconds * 1000 });
  }
  async take<T>(key: string) {
    const entry = this.live(key);
    const value = entry ? (JSON.parse(entry.value) as T) : null;
    this.data.delete(key);
    return value;
  }
  async del(key: string) {
    this.data.delete(key);
  }
  async setIfAbsent(key: string, value: unknown, ttlSeconds: number) {
    if (this.live(key)) return false;
    this.data.set(key, { value: JSON.stringify(value), expires: Date.now() + ttlSeconds * 1000 });
    return true;
  }
  async incr(key: string, windowSeconds: number) {
    const entry = this.live(key);
    const count = (entry ? Number(JSON.parse(entry.value)) : 0) + 1;
    this.data.set(key, { value: JSON.stringify(count), expires: entry?.expires ?? Date.now() + windowSeconds * 1000 });
    return count;
  }
  async decr(key: string) {
    const entry = this.live(key);
    if (entry) this.data.set(key, { ...entry, value: JSON.stringify(Number(JSON.parse(entry.value)) - 1) });
  }
}

export function authStore(): Store {
  if (shared.__agentAuthStore) return shared.__agentAuthStore;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) shared.__agentAuthStore = new RedisStore(new Redis({ url, token }));
  else if (ON_VERCEL) throw new AuthNotConfiguredError('Redis (KV_REST_API_URL / KV_REST_API_TOKEN) is not configured');
  else shared.__agentAuthStore = new MemoryStore();
  return shared.__agentAuthStore;
}
