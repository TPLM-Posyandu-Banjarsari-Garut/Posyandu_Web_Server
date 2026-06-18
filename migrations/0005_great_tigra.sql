CREATE TYPE "public"."consultation_type" AS ENUM('pregnancy', 'child_development', 'general');--> statement-breakpoint
CREATE TYPE "public"."pregnancy_risk" AS ENUM('low', 'moderate', 'high');--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD COLUMN "posyandu_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD COLUMN "midwife_id" text;--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD COLUMN "risk_level" "pregnancy_risk" DEFAULT 'low';--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD COLUMN "abortus" integer;--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "children_id" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "consultation_type" "consultation_type" DEFAULT 'pregnancy' NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "actual_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "follow_up_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "follow_up_date" date;--> statement-breakpoint
ALTER TABLE "examinations" ADD COLUMN "target_trimester" varchar(50);--> statement-breakpoint
ALTER TABLE "examinations" ADD COLUMN "checklist_items" jsonb;--> statement-breakpoint
ALTER TABLE "examinations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD COLUMN "midwife_id" text;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD COLUMN "cadre_id" text;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD COLUMN "current_participants" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD COLUMN "location_notes" varchar(200);--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD CONSTRAINT "pregnancy_records_posyandu_id_posyandus_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD CONSTRAINT "pregnancy_records_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD CONSTRAINT "examination_schedules_midwife_id_midwifes_id_fk" FOREIGN KEY ("midwife_id") REFERENCES "public"."midwifes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD CONSTRAINT "examination_schedules_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_context_check" CHECK (("consultations"."consultation_type" = 'pregnancy' AND "consultations"."pregnancy_record_id" IS NOT NULL) OR ("consultations"."consultation_type" = 'child_development' AND "consultations"."children_id" IS NOT NULL) OR "consultations"."consultation_type" = 'general');