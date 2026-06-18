CREATE INDEX "nutrition_records_children_id_idx" ON "nutrition_records" USING btree ("children_id");--> statement-breakpoint
CREATE INDEX "nutrition_records_cadre_id_idx" ON "nutrition_records" USING btree ("cadre_id");--> statement-breakpoint
CREATE INDEX "nutrition_records_midwife_id_idx" ON "nutrition_records" USING btree ("midwife_id");--> statement-breakpoint
CREATE INDEX "pregnancy_records_parent_id_idx" ON "pregnancy_records" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "pregnancy_records_posyandu_id_idx" ON "pregnancy_records" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "pregnancy_records_midwife_id_idx" ON "pregnancy_records" USING btree ("midwife_id");--> statement-breakpoint
CREATE INDEX "consultations_parent_id_idx" ON "consultations" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "consultations_pregnancy_record_id_idx" ON "consultations" USING btree ("pregnancy_record_id");--> statement-breakpoint
CREATE INDEX "consultations_children_id_idx" ON "consultations" USING btree ("children_id");--> statement-breakpoint
CREATE INDEX "consultations_posyandu_id_idx" ON "consultations" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "consultations_midwife_id_idx" ON "consultations" USING btree ("midwife_id");--> statement-breakpoint
CREATE INDEX "consultations_cadre_id_idx" ON "consultations" USING btree ("cadre_id");--> statement-breakpoint
CREATE INDEX "examination_schedules_examination_id_idx" ON "examination_schedules" USING btree ("examination_id");--> statement-breakpoint
CREATE INDEX "examination_schedules_posyandu_id_idx" ON "examination_schedules" USING btree ("posyandu_id");--> statement-breakpoint
CREATE INDEX "examination_schedules_midwife_id_idx" ON "examination_schedules" USING btree ("midwife_id");--> statement-breakpoint
CREATE INDEX "examination_schedules_cadre_id_idx" ON "examination_schedules" USING btree ("cadre_id");