ALTER TABLE "users"
    ALTER COLUMN "phone_number" TYPE text USING "phone_number"::text;
--> statement-breakpoint
ALTER TABLE "childrens"
    ALTER COLUMN "identity_number" TYPE text USING "identity_number"::text;
--> statement-breakpoint
ALTER TABLE "parents"
    ALTER COLUMN "identity_number" TYPE text USING "identity_number"::text;
--> statement-breakpoint
ALTER TABLE "cadres"
    ALTER COLUMN "identity_number" TYPE text USING "identity_number"::text;
--> statement-breakpoint
ALTER TABLE "midwifes"
    ALTER COLUMN "identity_number" TYPE text USING "identity_number"::text,
    ALTER COLUMN "employee_number" TYPE text USING "employee_number"::text,
    ALTER COLUMN "license_number" TYPE text USING "license_number"::text;
--> statement-breakpoint
CREATE UNIQUE INDEX "childrens_identity_blind_unique"
    ON "childrens" (split_part("identity_number"::text, ':', 6))
    WHERE "identity_number" LIKE 'enc:v1:%';
--> statement-breakpoint
CREATE UNIQUE INDEX "parents_identity_blind_unique"
    ON "parents" (split_part("identity_number"::text, ':', 6))
    WHERE "identity_number" LIKE 'enc:v1:%';
--> statement-breakpoint
CREATE INDEX "parents_address_blind_idx"
    ON "parents" (split_part("address_line"::text, ':', 6))
    WHERE "address_line" LIKE 'enc:v1:%';
--> statement-breakpoint
CREATE INDEX "cadres_identity_blind_idx"
    ON "cadres" (split_part("identity_number"::text, ':', 6))
    WHERE "identity_number" LIKE 'enc:v1:%';
--> statement-breakpoint
CREATE UNIQUE INDEX "midwives_license_blind_unique"
    ON "midwifes" (split_part("license_number"::text, ':', 6))
    WHERE "license_number" LIKE 'enc:v1:%';
--> statement-breakpoint
CREATE INDEX "midwifes_identity_blind_idx"
    ON "midwifes" (split_part("identity_number"::text, ':', 6))
    WHERE "identity_number" LIKE 'enc:v1:%';
--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_blind_unique"
    ON "users" (split_part("phone_number"::text, ':', 6))
    WHERE "phone_number" LIKE 'enc:v1:%';
