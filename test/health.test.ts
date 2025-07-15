import { app } from '../src/index';
import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';

const sqlite = new Database(':memory:');
const testEnv = {
  VITEST_DB: sqlite,
  JWT_ACCESS_SECRET: 'test-secret',
  JWT_REFRESH_SECRET: 'test-secret',
};

describe('Basic Endpoint Tests', () => {
  it('GET /health should return 200 OK with a health message', async () => {
    const req = new Request('http://localhost/health', { method: 'GET' });
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok', message: 'Health check successful' });
  });

  it('GET /api/doc should return 200 OK for Swagger UI', async () => {
    const req = new Request('http://localhost/api/doc', { method: 'GET' });
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
  });
});
