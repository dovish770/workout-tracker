CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"sets" integer NOT NULL,
	"reps" integer,
	"max_weight" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercises_workout_position_idx" ON "exercises" USING btree ("workout_id","position");--> statement-breakpoint

-- Data migration, hand-written: drizzle-kit emits the DDL above and the DROP
-- below, but nothing in between, so the jsonb contents have to be moved here.
-- WITH ORDINALITY is what preserves the array order as an explicit position.
INSERT INTO "exercises" ("id", "workout_id", "position", "name", "sets", "reps", "max_weight")
SELECT
	COALESCE((item.value ->> 'id')::uuid, gen_random_uuid()),
	w."id",
	item.ordinality - 1,
	item.value ->> 'name',
	(item.value ->> 'sets')::integer,
	(item.value ->> 'reps')::integer,
	(item.value ->> 'maxWeight')::numeric
FROM "workouts" w
CROSS JOIN LATERAL jsonb_array_elements(w."exercises") WITH ORDINALITY AS item(value, ordinality);
--> statement-breakpoint

-- Refuse to drop the column unless every jsonb element became a row.
DO $$
DECLARE
	expected integer;
	actual integer;
BEGIN
	SELECT COALESCE(SUM(jsonb_array_length("exercises")), 0) INTO expected FROM "workouts";
	SELECT COUNT(*) INTO actual FROM "exercises";

	IF expected <> actual THEN
		RAISE EXCEPTION 'exercise migration mismatch: expected % rows, inserted %', expected, actual;
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "workouts" DROP COLUMN "exercises";
