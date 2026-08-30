import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { sql } from 'drizzle-orm'
import { exercises, workouts } from '../src/db/schema'
import type { WorkoutInput } from '../src/features/workouts/schema'

/**
 * Fills an empty database with a few realistic workouts.
 *
 * Runs outside Next.js, so it builds its own client rather than importing
 * `src/db/client.ts`, which is marked `server-only`.
 */
const SEED_WORKOUTS: WorkoutInput[] = [
  {
    name: 'פלג גוף עליון',
    description: 'חזה, כתפיים וטרייספס',
    exercises: [
      {
        id: randomUUID(),
        name: 'לחיצת חזה במוט',
        sets: 4,
        reps: 8,
        maxWeight: 80,
        restSeconds: 120,
      },
      {
        id: randomUUID(),
        name: 'לחיצת כתפיים בשיבה',
        sets: 3,
        reps: 10,
        maxWeight: 40,
        restSeconds: 90,
      },
      {
        id: randomUUID(),
        name: 'פרפר בפולי',
        sets: 3,
        reps: 12,
        maxWeight: 25,
        restSeconds: 90,
      },
      {
        id: randomUUID(),
        name: 'פשיטת מרפקים בפולי',
        sets: 3,
        reps: 15,
        maxWeight: null,
        restSeconds: null,
      },
    ],
  },
  {
    name: 'רגליים',
    description: 'סקוואט, דדליפט ותאומים',
    exercises: [
      {
        id: randomUUID(),
        name: 'סקוואט',
        sets: 5,
        reps: 5,
        maxWeight: 120,
        restSeconds: 120,
      },
      {
        id: randomUUID(),
        name: 'דדליפט רומני',
        sets: 4,
        reps: 8,
        maxWeight: 100,
        restSeconds: 120,
      },
      {
        id: randomUUID(),
        name: 'לחיצת רגליים',
        sets: 3,
        reps: 12,
        maxWeight: 180,
        restSeconds: 90,
      },
    ],
  },
  {
    name: 'גב וביצפס',
    description: '',
    exercises: [
      {
        id: randomUUID(),
        name: 'מתח רחב',
        sets: 4,
        reps: null,
        maxWeight: null,
        restSeconds: 90,
      },
      {
        id: randomUUID(),
        name: 'חתירה במוט',
        sets: 4,
        reps: 10,
        maxWeight: 70,
        restSeconds: 90,
      },
      {
        id: randomUUID(),
        name: 'כפיפת מרפקים במוט EZ',
        sets: 3,
        reps: 12,
        maxWeight: 30,
        restSeconds: null,
      },
    ],
  },
]

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.')

  const db = drizzle({ client: neon(databaseUrl) })

  const existing = await db.select({ id: workouts.id }).from(workouts).limit(1)
  if (existing.length > 0) {
    console.log('seed: table is not empty, nothing inserted')
    return
  }

  // Workouts belong to someone, so the seed needs an account to attach them to.
  const owners = await db.execute(sql`select id from "user" order by created_at limit 1`)
  const ownerId = ((owners.rows ?? owners) as { id: string }[])[0]?.id
  if (!ownerId) throw new Error('seed: no user rows. Sign in once, then run this again.')

  const workoutRows = SEED_WORKOUTS.map((workout) => ({
    id: randomUUID(),
    userId: ownerId,
    name: workout.name,
    description: workout.description,
  }))

  // Array order becomes the stored position, same rule as the app's saves.
  const exerciseRows = SEED_WORKOUTS.flatMap((workout, workoutIndex) =>
    workout.exercises.map((exercise, position) => ({
      ...exercise,
      workoutId: workoutRows[workoutIndex].id,
      position,
    })),
  )

  await db.insert(workouts).values(workoutRows)
  await db.insert(exercises).values(exerciseRows)

  console.log(
    `seed: inserted ${workoutRows.length} workouts, ${exerciseRows.length} exercises`,
  )
  for (const workout of workoutRows) console.log(`  ${workout.id}  ${workout.name}`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
