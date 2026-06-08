CREATE TABLE "education_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "education_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "education_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "educations" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "educations" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "educations" ADD COLUMN "category_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "educations" ADD COLUMN "views_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "educations" ADD COLUMN "read_time" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "educations" ADD CONSTRAINT "educations_category_id_education_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."education_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educations" DROP COLUMN "category";--> statement-breakpoint
DROP TYPE "public"."education_category";