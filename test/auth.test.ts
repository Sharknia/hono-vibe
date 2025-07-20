import { app } from '@/index';
import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/db/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';

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
        body: JSON.stringify({ email: 'test@example.com', password: 'password123', nickname: 'testuser' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.message).toBe('User created successfully');
    });

    it('should return 409 if email already exists', async () => {
        await db.insert(schema.users).values({ id: 'user-1', email: 'test@example.com', passwordHash: 'hash', nickname: 'testuser' });
        const req = new Request('http://localhost/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123', nickname: 'anotheruser' }),
        });
        const res = await app.fetch(req, testEnv);
        expect(res.status).toBe(409);
        const body = await res.json();
        expect(body.message).toBe('Email already in use');
    });

    it('should return 409 if nickname already exists', async () => {
      await db.insert(schema.users).values({ id: 'user-1', email: 'test@example.com', passwordHash: 'hash', nickname: 'testuser' });
      const req = new Request('http://localhost/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'another@example.com', password: 'password123', nickname: 'testuser' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.message).toBe('Nickname already in use');
  });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await hash('password123', 10);
      await db.insert(schema.users).values({ id: 'user-123', email: 'test@example.com', passwordHash, nickname: 'loginuser' });
    });

    it('should login successfully and return tokens', async () => {
        const req = new Request('http://localhost/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        });
        const res = await app.fetch(req, testEnv);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
    });

    it('should return 401 for incorrect password', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      const passwordHash = await hash('password123', 10);
      const refreshToken = await sign({ sub: 'user-refresh' }, testEnv.JWT_REFRESH_SECRET);
      await db.insert(schema.users).values({ 
          id: 'user-refresh', 
          email: 'refresh@example.com', 
          passwordHash,
          refreshToken,
          nickname: 'refreshuser'
      });
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
      const body = await res.json();
      expect(body.message).toBe('Invalid or expired refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken = '';
    const userId = 'user-logout';

    beforeEach(async () => {
        const passwordHash = await hash('password123', 10);
        accessToken = await sign({ sub: userId, role: 'USER' }, testEnv.JWT_ACCESS_SECRET);
        await db.insert(schema.users).values({ 
            id: userId, 
            email: 'logout@example.com', 
            passwordHash,
            refreshToken: 'some-token',
            nickname: 'logoutuser'
        });
    });

    it('should clear the refresh token and return 204 on logout', async () => {
      const req = new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(204);
      
      const userInDb = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
      expect(userInDb?.refreshToken).toBeNull();
    });
  });
});
