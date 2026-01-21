CREATE TABLE `structure_graphics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`structureId` int NOT NULL,
	`type` enum('apertura','aggiustamento','chiusura') NOT NULL,
	`imageUrl` varchar(1000) NOT NULL,
	`imageKey` varchar(500) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `structure_graphics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `structure_graphics` ADD CONSTRAINT `structure_graphics_structureId_structures_id_fk` FOREIGN KEY (`structureId`) REFERENCES `structures`(`id`) ON DELETE cascade ON UPDATE no action;