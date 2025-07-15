import { app } from '@/index';
import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/db/schema';
import { hash } from 'bcryptjs';
import { verify } from 'hono/jwt';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite, { schema });

describe('Auth Routes', () => {
  const testEnv = {
    VITEST_DB: sqlite,
    JWT_ACCESS_SECRET: 'test-secret-for-auth-access',
    JWT_REFRESH_SECRET: 'test-secret-for-auth-refresh',
  };

  beforeAll(() => {
    migrate(db, { migrationsFolder: './drizzle' });
  });

  afterEach(async () => {
    await db.delete(schema.users);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(201);
    });

    it('should return 409 if email already exists', async () => {
      await db.insert(schema.users).values({ id: 'test-id', email: 'test@example.com', passwordHash: 'hashed' });
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await hash('password123', 10);
      await db.insert(schema.users).values({ id: 'user-123', email: 'test@example.com', passwordHash });
    });

    it('should login a user and return valid JWT tokens', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(200);
      const body = await res.json();
      const accessPayload = await verify(body.accessToken, testEnv.JWT_ACCESS_SECRET);
      expect(accessPayload.sub).toBe('user-123');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken = '';
    beforeEach(async () => {
      const passwordHash = await hash('password123', 10);
      await db.insert(schema.users).values({ id: 'user-refresh', email: 'refresh@example.com', passwordHash });
      const loginReq = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'refresh@example.com', password: 'password123' }),
      });
      const loginRes = await app.fetch(loginReq, testEnv);
      if (loginRes.status !== 200) throw new Error('Login failed in test setup');
      const body = await loginRes.json();
      refreshToken = body.refreshToken;
    });

    it('should return a new access token for a valid refresh token', async () => {
      const req = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(200);
      const body = await res.json();
      const newAccessPayload = await verify(body.accessToken, testEnv.JWT_ACCESS_SECRET);
      expect(newAccessPayload.sub).toBe('user-refresh');
    });
  });
});