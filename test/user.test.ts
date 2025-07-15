import { app } from '@/index';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/db/schema';
import { sign } from 'hono/jwt';
import { hash } from 'bcryptjs';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite, { schema });

describe('User Routes', () => {
  const testEnv = {
    VITEST_DB: sqlite,
    JWT_ACCESS_SECRET: 'test-secret-for-user-routes',
  };
  let testUser;
  let token;

  beforeAll(async () => {
    migrate(db, { migrationsFolder: './drizzle' });
    
    const passwordHash = await hash('password123', 10);
    [testUser] = await db.insert(schema.users).values({
      id: 'user-me-test',
      email: 'me@example.com',
      passwordHash,
      nickname: 'MeMyself',
      role: 'USER',
    }).returning();

    const payload = { sub: testUser.id, role: testUser.role, exp: Math.floor(Date.now() / 1000) + 60 * 5 };
    token = await sign(payload, testEnv.JWT_ACCESS_SECRET);
  });

  afterAll(async () => {
    await db.delete(schema.users);
  });

  describe('GET /api/users/me', () => {
    it('should return 401 if no token is provided', async () => {
      const req = new Request('http://localhost/api/users/me');
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(401);
    });

    it('should return the current user profile for a valid token', async () => {
      const req = new Request('http://localhost/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await app.fetch(req, testEnv);
      
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(testUser.id);
      expect(body.email).toBe(testUser.email);
      expect(body.nickname).toBe(testUser.nickname);
      expect(body).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /api/users/check/nickname/:nickname', () => {
    it('should return isAvailable: true for a nickname that is not taken', async () => {
      const req = new Request('http://localhost/api/users/check/nickname/available-nick');
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isAvailable).toBe(true);
    });

    it('should return isAvailable: false for a nickname that is already taken', async () => {
      const req = new Request(`http://localhost/api/users/check/nickname/${testUser.nickname}`);
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isAvailable).toBe(false);
    });

    it('should return 400 for an invalid nickname (too short)', async () => {
      const req = new Request('http://localhost/api/users/check/nickname/ab');
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/check/email/:email', () => {
    it('should return isAvailable: true for an email that is not taken', async () => {
      const req = new Request('http://localhost/api/users/check/email/available@example.com');
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isAvailable).toBe(true);
    });

    it('should return isAvailable: false for an email that is already taken', async () => {
      const req = new Request(`http://localhost/api/users/check/email/${testUser.email}`);
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isAvailable).toBe(false);
    });

    it('should return 400 for an invalid email format', async () => {
      const req = new Request('http://localhost/api/users/check/email/invalid-email');
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(400);
    });
  });
});
