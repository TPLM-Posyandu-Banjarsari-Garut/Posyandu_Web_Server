CREATE INDEX "users_email_status_idx" ON "users" USING btree ("email","status");--> statement-breakpoint
CREATE INDEX "users_role_status_idx" ON "users" USING btree ("role","status");--> statement-breakpoint
CREATE INDEX "users_phone_status_idx" ON "users" USING btree ("phone_number","status");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "childrens_posyandu_deleted_idx" ON "childrens" USING btree ("posyandu_id","deleted_at");--> statement-breakpoint
CREATE INDEX "childrens_gender_category_idx" ON "childrens" USING btree ("gender","child_category","deleted_at");--> statement-breakpoint
CREATE INDEX "relation_childrens_parent_idx" ON "relation_childrens" USING btree ("parent_id","children_id");--> statement-breakpoint
CREATE INDEX "immunization_records_date_idx" ON "immunization_records" USING btree ("date_given","children_id");