ALTER TABLE "users" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "cadres" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "midwifes" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posyandus" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "childrens" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "relation_childrens" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vaccines" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "immunization_records" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vitamin_records" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "kipi_details" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nutrition_records" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pregnancy_records" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "examinations" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "examination_schedules" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "examination_records" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "educations" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "education_categories" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inventories" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "users_is_deleted_idx" ON "users" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_is_deleted_idx" ON "sessions" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_is_deleted_idx" ON "accounts" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "verifications_is_deleted_idx" ON "verifications" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "parents_user_id_idx" ON "parents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "parents_is_deleted_idx" ON "parents" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "cadres_is_deleted_idx" ON "cadres" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "cadres_posyandu_id_idx" ON "cadres" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "midwifes_posyandu_id_idx" ON "midwifes" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "midwifes_is_deleted_idx" ON "midwifes" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "posyandus_is_deleted_idx" ON "posyandus" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "childrens_posyandu_id_idx" ON "childrens" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "childrens_is_deleted_idx" ON "childrens" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "relation_childrens_parent_id_idx" ON "relation_childrens" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "relation_childrens_children_id_idx" ON "relation_childrens" USING btree ("children_id");--> statement-breakpoint
CREATE INDEX "relation_childrens_is_deleted_idx" ON "relation_childrens" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "vaccines_is_deleted_idx" ON "vaccines" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "vitamins_is_deleted_idx" ON "vitamins" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "immunization_records_children_id_idx" ON "immunization_records" USING btree ("children_id");--> statement-breakpoint
CREATE INDEX "immunization_records_vaccine_id_idx" ON "immunization_records" USING btree ("vaccine_id");--> statement-breakpoint
CREATE INDEX "immunization_records_cadre_id_idx" ON "immunization_records" USING btree ("cadre_id");--> statement-breakpoint
CREATE INDEX "immunization_records_midwife_id_idx" ON "immunization_records" USING btree ("midwife_id");--> statement-breakpoint
CREATE INDEX "immunization_records_posyandu_id_idx" ON "immunization_records" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "immunization_records_inventory_id_idx" ON "immunization_records" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "immunization_records_is_deleted_idx" ON "immunization_records" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "vitamin_records_children_id_idx" ON "vitamin_records" USING btree ("children_id");--> statement-breakpoint
CREATE INDEX "vitamin_records_vitamin_id_idx" ON "vitamin_records" USING btree ("vitamin_id");--> statement-breakpoint
CREATE INDEX "vitamin_records_cadre_id_idx" ON "vitamin_records" USING btree ("cadre_id");--> statement-breakpoint
CREATE INDEX "vitamin_records_midwife_id_idx" ON "vitamin_records" USING btree ("midwife_id");--> statement-breakpoint
CREATE INDEX "vitamin_records_posyandu_id_idx" ON "vitamin_records" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "vitamin_records_is_deleted_idx" ON "vitamin_records" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "kipi_details_immunization_record_id_idx" ON "kipi_details" USING btree ("immunization_record_id");--> statement-breakpoint
CREATE INDEX "kipi_details_is_deleted_idx" ON "kipi_details" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "nutrition_records_is_deleted_idx" ON "nutrition_records" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "pregnancy_records_is_deleted_idx" ON "pregnancy_records" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "consultations_is_deleted_idx" ON "consultations" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "notifications_is_deleted_idx" ON "notifications" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "examinations_is_deleted_idx" ON "examinations" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "examination_schedules_is_deleted_idx" ON "examination_schedules" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "examination_records_examination_id_idx" ON "examination_records" USING btree ("examination_id");--> statement-breakpoint
CREATE INDEX "examination_records_schedule_id_idx" ON "examination_records" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "examination_records_posyandu_id_idx" ON "examination_records" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "examination_records_children_id_idx" ON "examination_records" USING btree ("children_id");--> statement-breakpoint
CREATE INDEX "examination_records_parent_id_idx" ON "examination_records" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "examination_records_cadre_id_idx" ON "examination_records" USING btree ("cadre_id");--> statement-breakpoint
CREATE INDEX "examination_records_midwife_id_idx" ON "examination_records" USING btree ("midwife_id");--> statement-breakpoint
CREATE INDEX "examination_records_medically_validated_by_midwife_id_idx" ON "examination_records" USING btree ("medically_validated_by_midwife_id");--> statement-breakpoint
CREATE INDEX "examination_records_is_deleted_idx" ON "examination_records" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "educations_category_id_idx" ON "educations" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "educations_posyandu_id_idx" ON "educations" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "educations_created_by_user_id_idx" ON "educations" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "educations_is_deleted_idx" ON "educations" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "education_categories_is_deleted_idx" ON "education_categories" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "inventories_posyandu_id_idx" ON "inventories" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "inventories_managed_by_midwife_id_idx" ON "inventories" USING btree ("managed_by_midwife_id");--> statement-breakpoint
CREATE INDEX "inventories_is_deleted_idx" ON "inventories" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "audit_logs_is_deleted_idx" ON "audit_logs" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "media_is_deleted_idx" ON "media" USING btree ("is_deleted");