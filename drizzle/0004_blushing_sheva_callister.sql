CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`amount_cents` integer NOT NULL,
	`payment_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `payments` (`patient_id`, `amount_cents`, `payment_date`, `created_at`)
SELECT `patient_id`, `payment_amount_cents`, `appointment_date`, `appointment_date`
FROM `appointments`
WHERE `payment_amount_cents` IS NOT NULL;
