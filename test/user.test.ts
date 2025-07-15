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
});
