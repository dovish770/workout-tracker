import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { workouts } from '../src/db/schema'
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
      { id: randomUUID(), name: 'לחיצת חזה במוט', sets: 4, reps: 8, maxWeight: 80 },
      { id: randomUUID(), name: 'לחיצת כתפיים בשיבה', sets: 3, reps: 10, maxWeight: 40 },
      { id: randomUUID(), name: 'פרפר בפולי', sets: 3, reps: 12, maxWeight: 25 },
      {
        id: randomUUID(),
        name: 'פשיטת מרפקים בפולי',
        sets: 3,
        reps: 15,
        maxWeight: null,
      },
    ],
  },
  {
    name: 'רגליים',
    description: 'סקוואט, דדליפט ותאומים',
    exercises: [
      { id: randomUUID(), name: 'סקוואט', sets: 5, reps: 5, maxWeight: 120 },
      { id: randomUUID(), name: 'דדליפט רומני', sets: 4, reps: 8, maxWeight: 100 },
      { id: randomUUID(), name: 'לחיצת רגליים', sets: 3, reps: 12, maxWeight: 180 },
    ],
  },
  {
    name: 'גב וביצפס',
    description: '',
    exercises: [
      { id: randomUUID(), name: 'מתח רחב', sets: 4, reps: null, maxWeight: null },
      { id: randomUUID(), name: 'חתירה במוט', sets: 4, reps: 10, maxWeight: 70 },
      {
        id: randomUUID(),
        name: 'כפיפת מרפקים במוט EZ',
        sets: 3,
        reps: 12,
        maxWeight: 30,
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

  const inserted = await db.insert(workouts).values(SEED_WORKOUTS).returning({
    id: workouts.id,
    name: workouts.name,
  })

  console.log(`seed: inserted ${inserted.length} workouts`)
  for (const workout of inserted) console.log(`  ${workout.id}  ${workout.name}`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
