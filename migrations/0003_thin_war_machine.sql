ALTER TABLE "midwifes" RENAME COLUMN "assignment_status" TO "status";--> statement-breakpoint
ALTER TABLE "midwifes" DROP CONSTRAINT "midwifes_public_id_unique";--> statement-breakpoint
DROP INDEX "midwifes_user_id_posyandu_id_unique";--> statement-breakpoint
DROP INDEX "midwifes_license_number_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "midwives_user_id_posyandu_id_unique" ON "midwifes" USING btree ("user_id","posyandu_id");--> statement-breakpoint
CREATE UNIQUE INDEX "midwives_str_number_unique" ON "midwifes" USING btree ("license_number");--> statement-breakpoint
ALTER TABLE "midwifes" ADD CONSTRAINT "midwives_public_id_unique" UNIQUE("public_id");