import { app } from '@/index';
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/db/schema';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite, { schema });

describe('Signup Validation Flow Integration Test', () => {
  const testEnv = {
    VITEST_DB: sqlite,
    JWT_ACCESS_SECRET: 'test-secret-for-validation-flow',
    JWT_REFRESH_SECRET: 'test-secret-for-validation-flow-refresh',
  };

  beforeAll(() => {
    migrate(db, { migrationsFolder: './drizzle' });
  });

  afterEach(async () => {
    await db.delete(schema.users);
  });

  it('should correctly handle nickname and email availability checks and prevent duplicates', async () => {
    const newUser = {
      nickname: 'new-user',
      email: 'new-user@example.com',
      password: 'Password123!',
    };

    // 1. Check that nickname and email are initially available
    let res = await app.fetch(new Request(`http://localhost/api/users/check/nickname/${newUser.nickname}`), testEnv);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ isAvailable: true });

    res = await app.fetch(new Request(`http://localhost/api/users/check/email/${newUser.email}`), testEnv);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ isAvailable: true });

    // 2. Register the new user
    const registerReq = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    res = await app.fetch(registerReq, testEnv);
    expect(res.status).toBe(201);

    // 3. Check that nickname is now taken
    res = await app.fetch(new Request(`http://localhost/api/users/check/nickname/${newUser.nickname}`), testEnv);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ isAvailable: false });

    // 4. Check that email is now taken
    res = await app.fetch(new Request(`http://localhost/api/users/check/email/${newUser.email}`), testEnv);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ isAvailable: false });

    // 5. Attempt to register with the same nickname
    const duplicateNicknameReq = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, email: 'another-email@example.com' }),
    });
    res = await app.fetch(duplicateNicknameReq, testEnv);
    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe('Nickname already in use');

    // 6. Attempt to register with the same email
    const duplicateEmailReq = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, nickname: 'another-nickname' }),
    });
    res = await app.fetch(duplicateEmailReq, testEnv);
    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe('Email already in use');
  });
});
