import { app } from '../src/index';
import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';

const sqlite = new Database(':memory:');

describe('OpenAPI Specification', () => {
  it('should return local server URL when ENV is "local"', async () => {
    const testEnv = {
      VITEST_DB: sqlite,
      ENV: 'local',
    };
    const req = new Request('http://localhost/api/openapi.json');
    const res = await app.fetch(req, testEnv);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.servers[0].url).toBe('http://localhost:8787');
    expect(json.servers[0].description).toBe('Local Server');
  });

  it('should return production server URL when ENV is "prod"', async () => {
    const testEnv = {
      VITEST_DB: sqlite,
      ENV: 'prod',
    };
    const req = new Request('http://localhost/api/openapi.json');
    const res = await app.fetch(req, testEnv);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.servers[0].url).toBe('https://hono-be.furychick0.workers.dev');
    expect(json.servers[0].description).toBe('Production Server');
  });

  it('should default to local server URL when ENV is not set', async () => {
    const testEnv = {
      VITEST_DB: sqlite,
    };
    const req = new Request('http://localhost/api/openapi.json');
    const res = await app.fetch(req, testEnv);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.servers[0].url).toBe('http://localhost:8787');
  });
});
