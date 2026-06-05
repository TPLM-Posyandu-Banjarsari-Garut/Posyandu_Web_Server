CREATE TYPE "public"."capsule_color" AS ENUM('blue', 'red');--> statement-breakpoint
CREATE TYPE "public"."distribution_period" AS ENUM('february', 'august');--> statement-breakpoint
CREATE TYPE "public"."schedule_compliance" AS ENUM('on_time', 'late', 'non_compliant');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'synced', 'failed');--> statement-breakpoint
CREATE TYPE "public"."service_location_type" AS ENUM('posyandu', 'puskesmas', 'pustu', 'home', 'school', 'paud', 'kindergarten', 'daycare');--> statement-breakpoint
CREATE TYPE "public"."vitamin_record_status" AS ENUM('not_yet', 'given', 'missed', 'sweeping');--> statement-breakpoint
CREATE TYPE "public"."kipi_severity" AS ENUM('mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."vaccine_route" AS ENUM('injection', 'oral');--> statement-breakpoint
CREATE TYPE "public"."inventory_item_type" AS ENUM('vaccine', 'vitamin', 'general');--> statement-breakpoint
ALTER TABLE "childrens" ALTER COLUMN "identity_number" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "vaccines" ADD COLUMN "code" varchar(10);--> statement-breakpoint
UPDATE "vaccines" SET "code" = 'V' || "id" WHERE "code" IS NULL;--> statement-breakpoint
ALTER TABLE "vaccines" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "vaccines" ADD COLUMN "max_doses" integer;--> statement-breakpoint
ALTER TABLE "vaccines" ADD COLUMN "min_interval_days" integer;--> statement-breakpoint
ALTER TABLE "vaccines" ADD COLUMN "route" "vaccine_route";--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "capsule_color" "capsule_color";--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "dosage_iu" integer;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "min_age_months" integer;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "max_age_months" integer;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "distributions_per_year" integer;--> statement-breakpoint
UPDATE "vitamins" SET "capsule_color" = 'blue', "dosage_iu" = 100000 WHERE "capsule_color" IS NULL;--> statement-breakpoint
ALTER TABLE "vitamins" ALTER COLUMN "capsule_color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vitamins" ALTER COLUMN "dosage_iu" SET NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventories" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"posyandu_id" integer NOT NULL,
	"item_name" varchar(100) NOT NULL,
	"item_type" "inventory_item_type" DEFAULT 'general' NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"unit" "inventory_unit" DEFAULT 'pcs' NOT NULL,
	"condition" "inventory_condition" DEFAULT 'good' NOT NULL,
	"batch_number" varchar(50),
	"expiry_date" date,
	"last_checked_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "inventories_public_id_unique" UNIQUE("public_id")
);--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "midwife_id" integer;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "posyandu_id" integer;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "inventory_id" integer;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "dose_number" integer;--> statement-breakpoint
UPDATE "immunization_records" SET "dose_number" = 1 WHERE "dose_number" IS NULL;--> statement-breakpoint
ALTER TABLE "immunization_records" ALTER COLUMN "dose_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "batch_number" varchar(50);--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "kipi_status" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "schedule_compliance" "schedule_compliance";--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "status_dofu" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "sync_status" "sync_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "external_ref_id" varchar(100);--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "location_type" "service_location_type";--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_child_vaccine_dose_unique" UNIQUE("children_id","vaccine_id","dose_number");--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "vitamin_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"children_id" integer NOT NULL,
	"vitamin_id" integer NOT NULL,
	"cadre_id" integer,
	"midwife_id" integer,
	"posyandu_id" integer,
	"distribution_period" "distribution_period" NOT NULL,
	"distribution_year" integer NOT NULL,
	"date_given" date,
	"status" "vitamin_record_status" DEFAULT 'not_yet' NOT NULL,
	"given_deworming" boolean DEFAULT false NOT NULL,
	"is_sweeping" boolean DEFAULT false NOT NULL,
	"is_received" boolean,
	"location_type" "service_location_type",
	"sync_status" "sync_status" DEFAULT 'pending' NOT NULL,
	"external_ref_id" varchar(100),
	"special_condition_notes" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "vitamin_records_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "vitamin_records_child_period_year_unique" UNIQUE("children_id","distribution_period","distribution_year")
);--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_vitamin_id_vitamins_id_fk" FOREIGN KEY ("vitamin_id") REFERENCES "public"."vitamins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "kipi_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"immunization_record_id" integer NOT NULL,
	"symptoms" text NOT NULL,
	"severity" "kipi_severity" NOT NULL,
	"action_taken" text,
	"referred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "kipi_details_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "kipi_details_immunization_record_id_unique" UNIQUE("immunization_record_id")
);--> statement-breakpoint
ALTER TABLE "kipi_details" ADD CONSTRAINT "kipi_details_immunization_record_id_immunization_records_id_fk" FOREIGN KEY ("immunization_record_id") REFERENCES "public"."immunization_records"("id") ON DELETE no action ON UPDATE no action;
