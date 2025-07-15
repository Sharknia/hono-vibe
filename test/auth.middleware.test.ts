import { Hono } from 'hono';
import { describe, it, expect } from 'vitest';
import { sign } from 'hono/jwt';
import { authMiddleware, AuthPayload } from '@/presentation/middlewares/auth.middleware';

describe('Auth Middleware', () => {
  const testEnv = {
    JWT_ACCESS_SECRET: 'test-secret-for-middleware',
  };

  // Mock app to test the middleware
  const app = new Hono<{ Variables: { authPayload: AuthPayload } }>();
  app.use('/protected/*', authMiddleware);
  app.get('/protected/profile', (c) => {
    const payload = c.get('authPayload');
    return c.json({ payload });
  });

  it('should return 401 if no token is provided', async () => {
    const req = new Request('http://localhost/protected/profile');
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(401);
  });

  it('should return 401 for an invalid token', async () => {
    const req = new Request('http://localhost/protected/profile', {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(401);
  });

  it('should allow access and set authPayload in context for a valid token', async () => {
    const testPayload = { sub: 'user-123', role: 'USER', exp: Math.floor(Date.now() / 1000) + 60 * 5 };
    const token = await sign(testPayload, testEnv.JWT_ACCESS_SECRET);

    const req = new Request('http://localhost/protected/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await app.fetch(req, testEnv);
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.payload.userId).toBe('user-123');
    expect(body.payload.role).toBe('USER');
  });
});
