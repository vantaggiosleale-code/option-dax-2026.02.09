CREATE TABLE `structures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tag` varchar(100) NOT NULL,
	`legsPerContract` int NOT NULL DEFAULT 2,
	`legs` text NOT NULL,
	`status` enum('active','closed') NOT NULL DEFAULT 'active',
	`openPnl` varchar(50),
	`pdc` varchar(50),
	`delta` varchar(50),
	`gamma` varchar(50),
	`theta` varchar(50),
	`vega` varchar(50),
	`closingDate` varchar(50),
	`realizedPnl` varchar(50),
	`sharedWith` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `structures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `structures` ADD CONSTRAINT `structures_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;