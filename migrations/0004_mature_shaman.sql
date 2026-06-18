ALTER TABLE "health_centers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "health_centers" CASCADE;--> statement-breakpoint
ALTER TABLE "posyandus" DROP CONSTRAINT "posyandus_health_center_id_health_centers_id_fk";
--> statement-breakpoint
ALTER TABLE "posyandus" DROP COLUMN "health_center_id";