import { app } from '@/index';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/db/schema';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite, { schema });

describe('Auth Flow Integration Test', () => {
  const testEnv = {
    VITEST_DB: sqlite,
    JWT_ACCESS_SECRET: 'test-secret-for-integration-access',
    JWT_REFRESH_SECRET: 'test-secret-for-integration-refresh',
  };

  beforeAll(() => {
    migrate(db, { migrationsFolder: './drizzle' });
  });

  afterAll(async () => {
    await db.delete(schema.users);
  });

  it('should allow a user to register, login, and get their profile', async () => {
    const userCredentials = {
      email: 'integration-test@example.com',
      password: 'StrongPassword123',
    };

    // 1. Register a new user
    const registerReq = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userCredentials),
    });
    const registerRes = await app.fetch(registerReq, testEnv);
    expect(registerRes.status).toBe(201);

    // 2. Login with the new credentials
    const loginReq = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userCredentials),
    });
    const loginRes = await app.fetch(loginReq, testEnv);
    expect(loginRes.status).toBe(200);
    const { accessToken } = await loginRes.json();
    expect(accessToken).toBeDefined();

    // 3. Get user profile with the access token
    const profileReq = new Request('http://localhost/api/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileRes = await app.fetch(profileReq, testEnv);
    expect(profileRes.status).toBe(200);
    const profileBody = await profileRes.json();
    
    expect(profileBody.email).toBe(userCredentials.email);
    expect(profileBody).not.toHaveProperty('passwordHash');
  });
});