import { sqliteTable, text, integer, primaryKey, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  nickname: text('nickname').notNull().unique(),
  role: text('role', { enum: ['USER', 'ADMIN'] }).default('USER').notNull(),
  notificationPreferences: text('notification_preferences', { mode: 'json' }).$type<{ email: boolean; push: boolean; }>().default('{"email":true,"push":true}'),
  snoozeUntil: integer('snooze_until', { mode: 'timestamp' }),
  pushToken: text('push_token'),
  refreshToken: text('refresh_token'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
  };
});

// Keywords Table
export const keywords = sqliteTable('keywords', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    nameIdx: uniqueIndex('name_idx').on(table.name),
  };
});

// UserKeywords (Many-to-Many)
export const userKeywords = sqliteTable('user_keywords', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  keywordId: integer('keyword_id').notNull().references(() => keywords.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.keywordId] }),
    userIdx: index('user_keywords_user_id_idx').on(table.userId),
    keywordIdx: index('user_keywords_keyword_id_idx').on(table.keywordId),
  };
});

// CrawlingSites Table
export const crawlingSites = sqliteTable('crawling_sites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  baseUrl: text('base_url').notNull(),
  strategy: text('strategy').notNull(), // Identifier for the crawling strategy
});

// CrawledResults Table
export const crawledResults = sqliteTable('crawled_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  keywordId: integer('keyword_id').notNull().references(() => keywords.id, { onDelete: 'cascade' }),
  siteId: integer('site_id').notNull().references(() => crawlingSites.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  price: integer('price'),
  crawledAt: integer('crawled_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    urlIdx: uniqueIndex('crawled_results_url_idx').on(table.url),
    keywordIdx: index('crawled_results_keyword_id_idx').on(table.keywordId),
  };
});

// Notifications Table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  url: text('url'),
  type: text('type', { enum: ['email', 'push'] }).notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    userIdx: index('notifications_user_id_idx').on(table.userId),
  };
});
