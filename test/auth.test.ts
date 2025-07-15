import { app } from '@/index';
import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/db/schema';
import { hash } from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';

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

    it('should return 400 for password less than 8 characters', async () => {
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: '123' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await hash('password123', 10);
      await db.insert(schema.users).values({ id: 'user-123', email: 'test@example.com', passwordHash });
    });

    it('should return 401 for incorrect password', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(401);
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

    it('should return 401 for an expired refresh token', async () => {
      const expiredToken = await sign(
        { sub: 'user-refresh', exp: Math.floor(Date.now() / 1000) - 10 },
        testEnv.JWT_REFRESH_SECRET
      );
      const req = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: expiredToken }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken = '';
    let userId = 'user-logout';
    beforeEach(async () => {
      const passwordHash = await hash('password123', 10);
      await db.insert(schema.users).values({ id: userId, email: 'logout@example.com', passwordHash });
      const loginReq = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'logout@example.com', password: 'password123' }),
      });
      const loginRes = await app.fetch(loginReq, testEnv);
      const body = await loginRes.json();
      accessToken = body.accessToken;
    });

    it('should clear the refresh token on logout', async () => {
      const req = new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(200);
      const userInDb = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
      expect(userInDb?.refreshToken).toBeNull();
    });
  });
});