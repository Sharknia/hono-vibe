import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/infrastructure/db/schema';
import { D1Database } from '@cloudflare/workers-types';
import BetterSqlite3 from 'better-sqlite3';

// This function determines which database driver to use based on the environment.
export const getDb = (env: { VITEST_DB?: BetterSqlite3.Database, DB?: D1Database }) => {
  // For Vitest: Use the in-memory SQLite database provided in the test environment.
  if (env.VITEST_DB) {
    return drizzleSqlite(env.VITEST_DB, { schema });
  }
  // For `wrangler dev` or production: Use the D1 database binding.
  if (env.DB) {
    return drizzle(env.DB, { schema });
  }
  throw new Error('Database environment is not configured correctly. Either VITEST_DB or DB must be provided.');
};