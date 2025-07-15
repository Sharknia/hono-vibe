import { app } from '../src/index';
import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';

const sqlite = new Database(':memory:');
const testEnv = {
  VITEST_DB: sqlite,
  JWT_ACCESS_SECRET: 'test-secret',
  JWT_REFRESH_SECRET: 'test-secret',
};

describe('CORS Middleware', () => {
  const allowedOrigin = 'http://localhost:3000';
  const disallowedOrigin = 'http://unauthorized.com';

  it('should return correct CORS headers for allowed origin on OPTIONS request', async () => {
    const req = new Request('http://localhost/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': allowedOrigin,
        'Access-Control-Request-Method': 'GET',
      },
    });

    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(204); // No Content
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });

  it('should not return CORS headers for disallowed origin', async () => {
    const req = new Request('http://localhost/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': disallowedOrigin,
        'Access-Control-Request-Method': 'GET',
      },
    });

    const res = await app.fetch(req, testEnv);
    // For disallowed origins, Hono's CORS middleware might not add the header at all,
    // or it might be null. A simple 204 response without the header is also valid.
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('should include Access-Control-Allow-Origin header on actual GET request from allowed origin', async () => {
    const req = new Request('http://localhost/api/auth/login', { // Use an actual endpoint
      method: 'GET',
      headers: {
        'Origin': allowedOrigin,
      },
    });

    const res = await app.fetch(req, testEnv);
    // The actual response might be 405 Method Not Allowed if GET is not defined,
    // but the CORS header should still be present.
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
  });
});
