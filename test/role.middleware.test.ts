import { Hono } from 'hono';
import { describe, it, expect } from 'vitest';
import { sign } from 'hono/jwt';
import { authMiddleware, AuthPayload } from '@/presentation/middlewares/auth.middleware';
import { roleMiddleware } from '@/presentation/middlewares/role.middleware';
import { errorHandler } from '@/presentation/middlewares/error.middleware';

describe('Role Middleware', () => {
  const testEnv = {
    JWT_ACCESS_SECRET: 'test-secret-for-role-middleware',
  };

  type AppEnv = { Variables: { authPayload: AuthPayload } };
  const app = new Hono<AppEnv>();

  // Register error handler first
  app.onError(errorHandler);

  // Setup middleware chain
  app.use('/admin/*', authMiddleware);
  app.use('/admin/*', roleMiddleware('ADMIN'));
  
  app.get('/admin/dashboard', (c) => c.json({ message: 'Welcome, Admin!' }));

  it('should return 401 for unauthenticated users', async () => {
    const req = new Request('http://localhost/admin/dashboard');
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(401);
  });

  it('should return 403 for users with insufficient role', async () => {
    const payload = { sub: 'user-123', role: 'USER', exp: Math.floor(Date.now() / 1000) + 60 * 5 };
    const token = await sign(payload, testEnv.JWT_ACCESS_SECRET);
    
    const req = new Request('http://localhost/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(403);
  });

  it('should allow access for users with the correct role', async () => {
    const payload = { sub: 'admin-456', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 60 * 5 };
    const token = await sign(payload, testEnv.JWT_ACCESS_SECRET);

    const req = new Request('http://localhost/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Welcome, Admin!');
  });
});