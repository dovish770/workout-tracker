CREATE TYPE "public"."session_status" AS ENUM('active', 'completed', 'abandoned');--> statement-breakpoint
CREATE TABLE "session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"source_exercise_id" uuid,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"target_sets" integer NOT NULL,
	"target_reps" integer,
	"target_max_weight" numeric(6, 2),
	"completed_sets" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid,
	"workout_name" text NOT NULL,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_exercises_session_position_idx" ON "session_exercises" USING btree ("session_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_sessions_single_active_idx" ON "workout_sessions" USING btree ("status") WHERE "workout_sessions"."status" = 'active';--> statement-breakpoint
CREATE INDEX "workout_sessions_started_at_idx" ON "workout_sessions" USING btree ("started_at");