CREATE TYPE "public"."account_role" AS ENUM('posyandu_admin', 'village_admin', 'parent', 'cadre', 'midwife');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('active', 'inactive', 'disabled', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."admin_type" AS ENUM('posyandu_admin', 'village_admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."age_unit" AS ENUM('day', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."blood_type" AS ENUM('A', 'B', 'AB', 'O', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."cadre_position" AS ENUM('leader', 'secretary', 'treasurer', 'member');--> statement-breakpoint
CREATE TYPE "public"."capsule_color" AS ENUM('blue', 'red');--> statement-breakpoint
CREATE TYPE "public"."child_category" AS ENUM('infant', 'young_child', 'toddler');--> statement-breakpoint
CREATE TYPE "public"."consultation_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."distribution_period" AS ENUM('february', 'august');--> statement-breakpoint
CREATE TYPE "public"."education_category" AS ENUM('pregnancy', 'infant_care', 'nutrition', 'immunization', 'general');--> statement-breakpoint
CREATE TYPE "public"."examination_status" AS ENUM('pending', 'processing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."examination_type" AS ENUM('infant', 'pregnant_mother', 'toddler', 'young_child');--> statement-breakpoint
CREATE TYPE "public"."family_relation" AS ENUM('father', 'mother', 'guardian');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."immunization_status" AS ENUM('not_yet', 'scheduled', 'completed', 'missed');--> statement-breakpoint
CREATE TYPE "public"."inventory_condition" AS ENUM('good', 'minor_damage', 'major_damage', 'out_of_stock', 'under_repair');--> statement-breakpoint
CREATE TYPE "public"."inventory_item_type" AS ENUM('vaccine', 'vitamin', 'general');--> statement-breakpoint
CREATE TYPE "public"."inventory_unit" AS ENUM('pcs', 'box', 'bottle', 'pack', 'set');--> statement-breakpoint
CREATE TYPE "public"."kipi_severity" AS ENUM('mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('unread', 'read');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('immunization', 'consultation', 'examination', 'education', 'system');--> statement-breakpoint
CREATE TYPE "public"."nutrition_status" AS ENUM('normal', 'underweight', 'severely_underweight', 'stunted', 'wasted', 'overweight');--> statement-breakpoint
CREATE TYPE "public"."pregnancy_status" AS ENUM('first_trimester', 'second_trimester', 'third_trimester', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."schedule_compliance" AS ENUM('on_time', 'late', 'non_compliant');--> statement-breakpoint
CREATE TYPE "public"."service_location_type" AS ENUM('posyandu', 'puskesmas', 'pustu', 'home', 'school', 'paud', 'kindergarten', 'daycare');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'synced', 'failed');--> statement-breakpoint
CREATE TYPE "public"."vaccine_route" AS ENUM('injection', 'oral');--> statement-breakpoint
CREATE TYPE "public"."vitamin_record_status" AS ENUM('not_yet', 'given', 'missed', 'sweeping');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"phone_number" varchar(20),
	"role" "account_role" DEFAULT 'parent' NOT NULL,
	"status" "account_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"identity_number" varchar(16),
	"place_of_birth" varchar(50),
	"date_of_birth" date,
	"blood_type" "blood_type",
	"education" varchar(50),
	"occupation" varchar(50),
	"address_line" text,
	"rt" varchar(5),
	"rw" varchar(5),
	"village_name" varchar(100) DEFAULT 'Banjarsari',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "parents_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "parents_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "parents_identity_number_unique" UNIQUE("identity_number")
);
--> statement-breakpoint
CREATE TABLE "cadres" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"posyandu_id" integer NOT NULL,
	"identity_number" varchar(16),
	"position" "cadre_position" DEFAULT 'member' NOT NULL,
	"is_primary_assignment" boolean DEFAULT true NOT NULL,
	"duty_area_notes" text,
	"assignment_status" "status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "cadres_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "midwifes" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"posyandu_id" integer NOT NULL,
	"identity_number" varchar(16) NOT NULL,
	"employee_number" varchar(32),
	"license_number" varchar(50),
	"is_mtbs_trained" boolean DEFAULT false NOT NULL,
	"is_kelas_ibu_balita_facilitator" boolean DEFAULT false NOT NULL,
	"is_pkat_member" boolean DEFAULT false NOT NULL,
	"is_poned_provider" boolean DEFAULT false NOT NULL,
	"is_primary_assignment" boolean DEFAULT true NOT NULL,
	"duty_area_notes" text,
	"assignment_status" "status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "midwifes_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "posyandus" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"health_center_id" integer NOT NULL,
	"address_line" text,
	"rt" varchar(5),
	"rw" varchar(5),
	"village_name" varchar(100) DEFAULT 'Banjarsari',
	"contact_number" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "posyandus_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "posyandus_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "childrens" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"posyandu_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"identity_number" varchar(16) NOT NULL,
	"gender" "gender" NOT NULL,
	"child_category" "child_category",
	"place_of_birth" varchar(100),
	"birth_date" date,
	"birth_order" integer,
	"blood_type" "blood_type",
	"birth_weight" numeric(5, 2),
	"birth_length" numeric(5, 2),
	"birth_head_circumference" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "childrens_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "childrens_identity_number_unique" UNIQUE("identity_number")
);
--> statement-breakpoint
CREATE TABLE "relation_childrens" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" integer NOT NULL,
	"children_id" integer NOT NULL,
	"relation" "family_relation" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "relation_childrens_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "vaccines" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"target_age_months" integer,
	"max_doses" integer,
	"min_interval_days" integer,
	"route" "vaccine_route",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "vaccines_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "vaccines_code_unique" UNIQUE("code"),
	CONSTRAINT "vaccines_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "vitamins" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"capsule_color" "capsule_color" NOT NULL,
	"dosage_iu" integer NOT NULL,
	"min_age_months" integer,
	"max_age_months" integer,
	"distributions_per_year" integer,
	"target_age_months" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "vitamins_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "vitamins_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "immunization_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"children_id" integer NOT NULL,
	"vaccine_id" integer NOT NULL,
	"cadre_id" integer,
	"midwife_id" integer,
	"posyandu_id" integer,
	"inventory_id" integer,
	"dose_number" integer NOT NULL,
	"date_given" date,
	"batch_number" varchar(50),
	"status" "immunization_status" DEFAULT 'scheduled' NOT NULL,
	"kipi_status" boolean DEFAULT false NOT NULL,
	"schedule_compliance" "schedule_compliance",
	"status_dofu" boolean DEFAULT false NOT NULL,
	"sync_status" "sync_status" DEFAULT 'pending' NOT NULL,
	"external_ref_id" varchar(100),
	"location_type" "service_location_type",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "immunization_records_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "immunization_records_child_vaccine_dose_unique" UNIQUE("children_id","vaccine_id","dose_number")
);
--> statement-breakpoint
CREATE TABLE "health_centers" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"address_line" text,
	"village_name" varchar(100),
	"contact_number" varchar(20),
	"head_name" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "health_centers_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "health_centers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
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
);
--> statement-breakpoint
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
);
--> statement-breakpoint
CREATE TABLE "nutrition_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"children_id" integer NOT NULL,
	"measurement_date" date NOT NULL,
	"weight_kg" numeric(5, 2),
	"height_cm" numeric(5, 2),
	"head_circumference_cm" numeric(5, 2),
	"age_months" integer,
	"nutrition_status" "nutrition_status" NOT NULL,
	"cadre_id" integer,
	"midwife_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "nutrition_records_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "pregnancy_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" integer NOT NULL,
	"pregnancy_status" "pregnancy_status" DEFAULT 'first_trimester' NOT NULL,
	"last_menstrual_period" date,
	"estimated_due_date" date,
	"gravida" integer,
	"parity" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "pregnancy_records_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" integer NOT NULL,
	"pregnancy_record_id" integer,
	"midwife_id" integer,
	"cadre_id" integer,
	"posyandu_id" integer NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "consultation_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "consultations_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "examinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"posyandu_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"examination_type" "examination_type" NOT NULL,
	"target_age_months" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "examinations_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "examination_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"examination_id" integer NOT NULL,
	"posyandu_id" integer NOT NULL,
	"scheduled_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"max_participants" integer DEFAULT 20,
	"status" "examination_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "examination_schedules_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "examination_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"examination_id" integer NOT NULL,
	"schedule_id" integer,
	"posyandu_id" integer NOT NULL,
	"children_id" integer,
	"parent_id" integer,
	"cadre_id" integer,
	"midwife_id" integer,
	"examination_date" date NOT NULL,
	"status" "examination_status" DEFAULT 'pending' NOT NULL,
	"result_summary" text,
	"notes" text,
	"medically_validated_at" timestamp with time zone,
	"medically_validated_by_midwife_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "examination_records_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "examination_records_subject_check" CHECK ("examination_records"."children_id" IS NOT NULL OR "examination_records"."parent_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "educations" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"category" "education_category" DEFAULT 'general' NOT NULL,
	"posyandu_id" integer,
	"created_by_user_id" integer NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "educations_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "inventories" (
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
	"managed_by_midwife_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "inventories_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadres" ADD CONSTRAINT "cadres_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadres" ADD CONSTRAINT "cadres_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midwifes" ADD CONSTRAINT "midwifes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midwifes" ADD CONSTRAINT "midwifes_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posyandus" ADD CONSTRAINT "posyandus_health_center_id_health_centers_id_fk" FOREIGN KEY ("health_center_id") REFERENCES "public"."health_centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "childrens" ADD CONSTRAINT "childrens_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relation_childrens" ADD CONSTRAINT "relation_childrens_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relation_childrens" ADD CONSTRAINT "relation_childrens_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_vaccine_id_vaccines_id_fk" FOREIGN KEY ("vaccine_id") REFERENCES "public"."vaccines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_vitamin_id_vitamins_id_fk" FOREIGN KEY ("vitamin_id") REFERENCES "public"."vitamins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD CONSTRAINT "vitamin_records_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kipi_details" ADD CONSTRAINT "kipi_details_immunization_record_id_immunization_records_id_fk" FOREIGN KEY ("immunization_record_id") REFERENCES "public"."immunization_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_records" ADD CONSTRAINT "nutrition_records_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_records" ADD CONSTRAINT "nutrition_records_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_records" ADD CONSTRAINT "nutrition_records_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD CONSTRAINT "pregnancy_records_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_pregnancy_record_id_pregnancy_records_id_fk" FOREIGN KEY ("pregnancy_record_id") REFERENCES "public"."pregnancy_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD CONSTRAINT "examination_schedules_examination_id_examinations_id_fk" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD CONSTRAINT "examination_schedules_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_examination_id_examinations_id_fk" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_schedule_id_examination_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."examination_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_records" ADD CONSTRAINT "examination_records_medically_validated_by_midwife_id_midwifes_id_fk" FOREIGN KEY ("medically_validated_by_midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educations" ADD CONSTRAINT "educations_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educations" ADD CONSTRAINT "educations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_managed_by_midwife_id_midwifes_id_fk" FOREIGN KEY ("managed_by_midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cadres_user_id_posyandu_id_unique" ON "cadres" USING btree ("user_id","posyandu_id");--> statement-breakpoint
CREATE UNIQUE INDEX "midwifes_user_id_posyandu_id_unique" ON "midwifes" USING btree ("user_id","posyandu_id");--> statement-breakpoint
CREATE UNIQUE INDEX "midwifes_license_number_unique" ON "midwifes" USING btree ("license_number");--> statement-breakpoint
CREATE UNIQUE INDEX "examinations_posyandu_id_name_unique" ON "examinations" USING btree ("posyandu_id","name");