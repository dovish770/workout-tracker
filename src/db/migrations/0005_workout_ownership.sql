ALTER TYPE "public"."session_status" ADD VALUE 'expired';--> statement-breakpoint
DROP INDEX "workout_sessions_single_active_idx";--> statement-breakpoint

-- Added nullable first. drizzle-kit emits these as NOT NULL with no default,
-- which cannot succeed on tables that already hold rows; the backfill below is
-- what makes the constraint satisfiable.
ALTER TABLE "workouts" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint

-- Everything here predates accounts, so it belongs to the first account created.
DO $$
DECLARE
	owner_id text;
BEGIN
	SELECT id INTO owner_id FROM "user" ORDER BY created_at LIMIT 1;

	IF owner_id IS NULL THEN
		RAISE EXCEPTION 'no user rows exist, so existing workouts have no owner to assign. Sign in once, then run this migration.';
	END IF;

	UPDATE "workouts" SET "user_id" = owner_id WHERE "user_id" IS NULL;
	UPDATE "workout_sessions" SET "user_id" = owner_id WHERE "user_id" IS NULL;
END $$;
--> statement-breakpoint

-- The interval is written out rather than read from SESSION_MAX_HOURS on
-- purpose: a migration records what happened, and must not change meaning if
-- that constant is tuned later.
UPDATE "workout_sessions"
SET "expires_at" = "started_at" + interval '3 hours'
WHERE "expires_at" IS NULL;
--> statement-breakpoint

ALTER TABLE "workouts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_sessions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_sessions" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workouts_user_created_idx" ON "workouts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "workout_sessions_single_active_idx" ON "workout_sessions" USING btree ("user_id") WHERE "workout_sessions"."status" = 'active';
