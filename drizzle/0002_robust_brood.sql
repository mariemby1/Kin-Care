UPDATE `appointments` SET `status` = 'confirmed' WHERE `status` NOT IN ('confirmed', 'cancelled');--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`appointment_date` integer NOT NULL,
	`duration` integer DEFAULT 30 NOT NULL,
	`treatment` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_appointments`("id", "patient_id", "appointment_date", "duration", "treatment", "status", "notes", "created_at", "updated_at") SELECT "id", "patient_id", "appointment_date", "duration", "treatment", "status", "notes", "created_at", "updated_at" FROM `appointments`;--> statement-breakpoint
DROP TABLE `appointments`;--> statement-breakpoint
ALTER TABLE `__new_appointments` RENAME TO `appointments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;