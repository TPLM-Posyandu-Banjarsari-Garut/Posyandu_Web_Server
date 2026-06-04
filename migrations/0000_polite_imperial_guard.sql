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
	CONSTRAINT "parents_identity_number_unique" UNIQUE("identity_number")
);
--> statement-breakpoint
CREATE TABLE "cadres" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"posyandu_id" integer NOT NULL,
	"position" "cadre_position" DEFAULT 'member' NOT NULL,
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
	"license_number" varchar(50),
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
	"identity_number" varchar(20) NOT NULL,
	"gender" "gender" NOT NULL,
	"child_category" "child_category",
	"place_of_birth" varchar(100),
	"birth_date" date,
	"birth_order" integer,
	"blood_type" "blood_type",
	"birth_weight" numeric(5.2),
	"birth_length" numeric(5.2),
	"birth_head_circumference" numeric(5.2),
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
	"name" varchar(100) NOT NULL,
	"description" text,
	"target_age_months" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "vaccines_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "vaccines_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "vitamins" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
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
	"date_given" date,
	"status" "immunization_status" DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "immunization_records_public_id_unique" UNIQUE("public_id")
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
ALTER TABLE "immunization_records" ADD CONSTRAINT "immunization_records_cadre_id_cadres_id_fk" FOREIGN KEY ("cadre_id") REFERENCES "public"."cadres"("id") ON DELETE no action ON UPDATE no action;