import { generateKeyPairSync } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { calculateJwkThumbprint, exportJWK, importPKCS8 } from 'jose';
import { normalizePkcs8 } from '../app/lib/auth/runtime';

// Signing keys arrive through env var UIs, which mangle multi-line values.
// Every realistic paste of a valid key must load as that same key; the
// oracle is the key's RFC 7638 thumbprint from the original PEM.

const thumbprint = async (pem: string) => {
  const { kty, crv, x } = await exportJWK(await importPKCS8(pem, 'EdDSA', { extractable: true }));
  return calculateJwkThumbprint({ kty, crv, x }, 'sha256');
};

test('every realistic paste of a PKCS#8 PEM loads as the same key', async () => {
  const pem = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  const other = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  const expected = await thumbprint(pem);
  const body = pem.split('\n').filter((line) => line && !line.startsWith('-----')).join('');
  const pastes: Record<string, string> = {
    intact: pem,
    'wrapped in double quotes': `"${pem.trim()}"`,
    'leading and trailing whitespace': `   ${pem}\n\n`,
    'newlines flattened to spaces': pem.replace(/\n/g, ' '),
    'newlines removed': pem.replace(/\n/g, ''),
    'escaped \\n': pem.replace(/\n/g, '\\n'),
    'CRLF line breaks': pem.replace(/\n/g, '\r\n'),
    'shell prompt line included': `$ cat auth.pem\n${pem}`,
    'base64 body only': body,
    'two keys pasted (first wins)': pem + other,
  };
  for (const [name, value] of Object.entries(pastes)) {
    const normalized = normalizePkcs8(value);
    expect(normalized, name).not.toBeNull();
    expect(await thumbprint(normalized!), name).toBe(expected);
  }
});

test('a value with no key material is rejected, not guessed', () => {
  expect(normalizePkcs8('')).toBeNull();
  expect(normalizePkcs8('   "" ')).toBeNull();
});
