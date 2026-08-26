# Workout Tracker

ניהול אימונים ותרגילים. Next.js App Router · TypeScript · Tailwind v4 · Neon + Drizzle.
ממשק בעברית (RTL), עיצוב כהה ומינימלי.

## Getting started

```bash
npm install
cp .env.example .env       # DATABASE_URL from your Neon project (pooled)
npm run db:migrate
npm run db:seed            # optional sample data
npm run dev
```

## Scripts

| Script                | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Development server                          |
| `npm run build`       | Production build                            |
| `npm run lint`        | ESLint                                      |
| `npm run typecheck`   | `tsc --noEmit`                              |
| `npm run audit`       | Hardcoded-text and RTL conventions          |
| `npm run format`      | Prettier write                              |
| `npm run check`       | lint + typecheck + audit + format check     |
| `npm run db:generate` | Create a migration from the Drizzle schema  |
| `npm run db:migrate`  | Apply migrations                            |
| `npm run db:seed`     | Insert sample workouts (skips if not empty) |
| `npm run db:studio`   | Browse the database                         |

> Do not run `npm run build` while `npm run dev` is running — they share
> `.next`, and the build pulls the rug out from under the dev server.

## Routes

| Route            | Rendering | Purpose                     |
| ---------------- | --------- | --------------------------- |
| `/workouts`      | dynamic   | All workouts, name + count  |
| `/workouts/new`  | static    | Create a workout            |
| `/workouts/[id]` | dynamic   | View, edit in place, delete |

## Project layout

```
src/
├─ app/          routing only — thin pages
├─ i18n/         every user-facing string
├─ components/   ui/ = generic primitives, layout/ = app shell
├─ hooks/        generic, domain-free hooks
├─ features/     domain code (workouts)
├─ db/           drizzle schema, client, repository, migrations
├─ lib/          cn, env, format, routes, result
└─ types/
```

## Data model

One workout has many exercises. Exercise order is the `position` column,
written from the form's array order. Deleting a workout cascades to its
exercises in the database.

## Conventions

Architecture and coding rules live in
[`.claude/skills/project-conventions/SKILL.md`](.claude/skills/project-conventions/SKILL.md).
Three rules worth knowing before the first commit:

- **No user-facing string or magic number in code.** Text goes in `src/i18n/locales/he.ts`,
  numeric limits in `features/<entity>/constants.ts`, URLs in `lib/routes.ts`.
- **RTL is structural.** Only logical Tailwind utilities (`ms-`, `pe-`, `start-`, `text-start`).
- **Nothing above `db/repository.ts` knows about Drizzle.**

`npm run audit` fails the build on the first two.

## Build plan

[`docs/PLAN.md`](docs/PLAN.md)
