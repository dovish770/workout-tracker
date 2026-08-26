# Workout Tracker

ניהול אימונים ותרגילים. Next.js App Router · TypeScript · Tailwind v4 · Neon + Drizzle.

## Getting started

```bash
npm install
cp .env.example .env.local   # DATABASE_URL required from stage 2 onward
npm run dev
```

## Scripts

| Script              | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | Development server              |
| `npm run build`     | Production build                |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | `tsc --noEmit`                  |
| `npm run format`    | Prettier write                  |
| `npm run check`     | lint + typecheck + format check |

## Project layout

```
src/
├─ app/          routing only — thin pages
├─ i18n/         every user-facing string
├─ components/   ui/ = generic primitives, layout/ = app shell
├─ features/     domain code (workouts)
├─ db/           drizzle schema, client, repository
├─ lib/          cn, env, format, routes, result
└─ types/
```

## Conventions

Architecture and coding rules live in
[`.claude/skills/project-conventions/SKILL.md`](.claude/skills/project-conventions/SKILL.md).
Two rules worth knowing before the first commit:

- **No user-facing string or magic number in code.** Text goes in `src/i18n/locales/he.ts`,
  numeric limits in `features/<entity>/constants.ts`, URLs in `lib/routes.ts`.
- **RTL is structural.** Only logical Tailwind utilities (`ms-`, `pe-`, `start-`, `text-start`).
  `ml-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` are banned in app code.

## Build plan

[`docs/PLAN.md`](docs/PLAN.md)
