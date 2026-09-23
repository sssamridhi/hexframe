import { beforeAll, describe, expect, it } from 'vitest';

let signToken: typeof import('../src/lib/auth').signToken;
let verifyToken: typeof import('../src/lib/auth').verifyToken;
let getTokenFromHeader: typeof import('../src/lib/auth').getTokenFromHeader;

beforeAll(async () => {
  process.env.JWT_SECRET = 'hexframe-ci-test-secret';
  const auth = await import('../src/lib/auth');
  signToken = auth.signToken;
  verifyToken = auth.verifyToken;
  getTokenFromHeader = auth.getTokenFromHeader;
});

describe('auth utilities', () => {
  it('signs and verifies a valid JWT payload', () => {
    const payload = { userId: 'user-123', email: 'samridhi@example.com' };
    const token = signToken(payload);
    const verified = verifyToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
  });

  it('rejects a malformed token', () => {
    expect(verifyToken('not-a-valid-jwt')).toBeNull();
  });

  it('extracts a Bearer token', () => {
    expect(getTokenFromHeader('Bearer abc123')).toBe('abc123');
  });

  it('rejects invalid authorization headers', () => {
    expect(getTokenFromHeader(null)).toBeNull();
    expect(getTokenFromHeader('abc123')).toBeNull();
    expect(getTokenFromHeader('Basic abc123')).toBeNull();
  });
});
