CREATE TABLE `game_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`event_ticker` text NOT NULL,
	`event_title` text NOT NULL,
	`event_type` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`host_address` text NOT NULL,
	`buy_in_amount` real NOT NULL,
	`max_participants` integer,
	`resolution_time` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`rules` text,
	`created_at` text NOT NULL,
	`started_at` text,
	`resolved_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_code_unique` ON `games` (`code`);--> statement-breakpoint
CREATE TABLE `gemini_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prediction_id` integer NOT NULL,
	`gemini_order_id` text,
	`symbol` text NOT NULL,
	`side` text NOT NULL,
	`outcome` text NOT NULL,
	`quantity` text NOT NULL,
	`price` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`avg_execution_price` text,
	`filled_quantity` text,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`prediction_id`) REFERENCES `predictions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`nickname` text NOT NULL,
	`has_paid` integer DEFAULT false NOT NULL,
	`joined_at` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participant_game_wallet_idx` ON `participants` (`game_id`,`wallet_address`);--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`participant_id` integer NOT NULL,
	`amount` real NOT NULL,
	`is_winner` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`participant_id` integer NOT NULL,
	`event_ticker` text NOT NULL,
	`contract_ticker` text NOT NULL,
	`outcome` text NOT NULL,
	`is_correct` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
