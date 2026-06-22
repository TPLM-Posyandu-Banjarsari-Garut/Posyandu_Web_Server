ALTER TABLE "parents" DROP CONSTRAINT "parents_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cadres" DROP CONSTRAINT "cadres_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "midwifes" DROP CONSTRAINT "midwifes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "relation_childrens" DROP CONSTRAINT "relation_childrens_parent_id_parents_id_fk";
--> statement-breakpoint
ALTER TABLE "relation_childrens" DROP CONSTRAINT "relation_childrens_children_id_childrens_id_fk";
--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadres" ADD CONSTRAINT "cadres_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midwifes" ADD CONSTRAINT "midwifes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relation_childrens" ADD CONSTRAINT "relation_childrens_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relation_childrens" ADD CONSTRAINT "relation_childrens_children_id_childrens_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."childrens"("id") ON DELETE cascade ON UPDATE no action;