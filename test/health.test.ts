import { app } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('GET /health', () => {
  it('should return 200 OK with a health message', async () => {
    const req = new Request('http://localhost/health', { method: 'GET' });
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok', message: 'Health check successful' });
  });
});
