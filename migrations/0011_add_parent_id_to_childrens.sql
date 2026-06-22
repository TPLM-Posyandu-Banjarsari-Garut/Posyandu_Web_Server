ALTER TABLE "childrens" ADD COLUMN IF NOT EXISTS "parent_id" text REFERENCES "parents"("id");
