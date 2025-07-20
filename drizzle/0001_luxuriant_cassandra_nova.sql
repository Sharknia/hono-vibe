CREATE TABLE `crawled_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`keyword_id` integer NOT NULL,
	`site_id` integer NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`price` integer,
	`crawled_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`keyword_id`) REFERENCES `keywords`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`site_id`) REFERENCES `crawling_sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `crawled_results_url_unique` ON `crawled_results` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `crawled_results_url_idx` ON `crawled_results` (`url`);--> statement-breakpoint
CREATE INDEX `crawled_results_keyword_id_idx` ON `crawled_results` (`keyword_id`);--> statement-breakpoint
CREATE TABLE `crawling_sites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`base_url` text NOT NULL,
	`strategy` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `crawling_sites_name_unique` ON `crawling_sites` (`name`);--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keywords_name_unique` ON `keywords` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `name_idx` ON `keywords` (`name`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`url` text,
	`type` text NOT NULL,
	`is_read` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_keywords` (
	`user_id` text NOT NULL,
	`keyword_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `keyword_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`keyword_id`) REFERENCES `keywords`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_keywords_user_id_idx` ON `user_keywords` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_keywords_keyword_id_idx` ON `user_keywords` (`keyword_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`nickname` text NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`notification_preferences` text DEFAULT '{"email":true,"push":true}',
	`snooze_until` integer,
	`push_token` text,
	`refresh_token` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password_hash", "nickname", "role", "notification_preferences", "snooze_until", "push_token", "refresh_token", "created_at", "updated_at") SELECT "id", "email", "password_hash", "nickname", "role", "notification_preferences", "snooze_until", "push_token", "refresh_token", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `users` (`nickname`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (`email`);