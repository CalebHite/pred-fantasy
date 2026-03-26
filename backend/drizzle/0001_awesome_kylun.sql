CREATE TABLE `game_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`category_key` text NOT NULL,
	`category_name` text NOT NULL,
	`category_type` text NOT NULL,
	`matching_rules` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `predictions` ADD `category_key` text;