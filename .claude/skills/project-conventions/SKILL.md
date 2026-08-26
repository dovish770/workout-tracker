---
name: project-conventions
description: Architecture and coding conventions for the workout-tracker app (Next.js App Router, TypeScript, Tailwind v4, Drizzle + Neon, Hebrew RTL UI). Read this before creating, moving, or refactoring any file in this repo.
---

# Workout Tracker — Architecture & Conventions

Authoritative rules for this repo. When a request conflicts with a rule here, say so before writing code.

## 1. Stack

| Concern     | Choice                                      | Notes                                            |
| ----------- | ------------------------------------------- | ------------------------------------------------ |
| Framework   | Next.js 15+, App Router, React 19           | Server Components by default                     |
| Language    | TypeScript, `strict: true`                  | No `any`. No non-null `!` unless provably safe   |
| Styling     | Tailwind CSS v4 (`@theme` in `globals.css`) | No CSS modules, no styled-components             |
| Forms       | react-hook-form + `@hookform/resolvers/zod` | `useFieldArray` for repeating exercises          |
| Validation  | Zod — one schema, reused on client + server | Schema is the single source of truth for types   |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable`       | Keyboard-accessible; drives `useFieldArray.move` |
| DB          | Neon Postgres + Drizzle ORM                 | Wired from stage 2                               |
| UI language | Hebrew, `dir="rtl"`                         | Locale-swappable — see §3                        |
| Lint/format | ESLint (next/core-web-vitals) + Prettier    |                                                  |

## 2. Folder structure

```
src/
├─ app/                        # ROUTING ONLY. Pages stay thin: fetch + compose.
│  ├─ layout.tsx               # html lang="he" dir="rtl", fonts, AppShell
│  ├─ page.tsx                 # redirect -> /workouts
│  ├─ globals.css              # Tailwind import + @theme design tokens
│  └─ workouts/
│     ├─ page.tsx              # list (table of all workouts)
│     ├─ loading.tsx
│     ├─ new/page.tsx          # create
│     └─ [id]/
│        ├─ page.tsx           # view + inline edit
│        └─ not-found.tsx
├─ i18n/                       # ALL user-facing strings. See §3.
│  ├─ locales/he.ts            # the Hebrew dictionary (source of truth for shape)
│  ├─ dictionary.ts            # active dict + Dictionary type
│  ├─ config.ts                # APP_LOCALE / APP_DIRECTION / APP_INTL_LOCALE
│  └─ index.ts
├─ components/
│  ├─ ui/                      # GENERIC primitives. Zero domain knowledge, zero literal copy.
│  └─ layout/                  # app shell: header, nav, page container
├─ features/
│  └─ workouts/                # everything that knows what a "workout" is
│     ├─ components/
│     ├─ schema.ts             # zod schemas + inferred types
│     ├─ constants.ts          # limits, defaults, magic numbers
│     ├─ queries.ts            # reads (server-only)
│     └─ actions.ts            # 'use server' mutations
├─ db/
│  ├─ client.ts                # neon + drizzle instance (singleton)
│  ├─ schema.ts                # drizzle table definitions
│  └─ repository.ts            # data-access boundary (see §7)
├─ lib/
│  ├─ cn.ts                    # clsx + tailwind-merge
│  ├─ env.ts                   # zod-validated process.env
│  ├─ format.ts                # Intl-based number/date formatting
│  ├─ routes.ts                # every URL in the app; no path literals elsewhere
│  └─ result.ts                # ActionResult helpers
└─ types/                      # cross-feature shared types only
```

**One file, one purpose.** A file exports one primary thing (component / schema / action group). If a file needs a section-divider comment to stay readable, split it.

## 3. Text, numbers, and i18n — hard rule

**No user-visible string is ever written inline in a component, schema, or action.** Not a label, not a button, not a placeholder, not a validation message, not an `aria-label`, not a page title, not an empty-state line. Every one of them lives in `src/i18n/locales/he.ts` and is read from `dict`.

```ts
// src/i18n/locales/he.ts
export const he = {
  common: { save: 'שמירה', cancel: 'ביטול', delete: 'מחיקה', edit: 'עריכה' },
  workouts: {
    list: { title: 'האימונים שלי', columns: { name: 'שם האימון' /* ... */ } },
    form: { nameLabel: 'שם האימון', namePlaceholder: 'לדוגמה: פלג גוף עליון' },
    errors: { nameRequired: 'חובה להזין שם לאימון' },
  },
} as const

// src/i18n/dictionary.ts
export const dict = he
export type Dictionary = typeof he
```

Rules:

1. The dictionary is nested by area (`common`, `nav`, `workouts.list`, `workouts.form`, `workouts.errors`), never one flat bag of keys.
2. Keys describe **meaning**, not the current wording: `emptyStateCta`, not `addFirstWorkoutButton2`.
3. Interpolation uses a function value, never string concatenation at the call site:
   `exerciseCount: (n: number) => \`${n} תרגילים\``.
4. When a locale is added later, `en.ts` must satisfy `Dictionary` — that type check is what guarantees no key was missed. Adding a locale must not touch a single component.
5. `components/ui/*` never imports `dict`. Primitives receive all copy through props; only `features/**`, `app/**`, and `components/layout/**` read the dictionary.

**Numbers follow the same rule.** No magic number in a component or schema. Validation limits, defaults, and step values live in `features/workouts/constants.ts`:

```ts
export const EXERCISE_NAME_MAX = 80
export const SETS_MIN = 1
export const SETS_MAX = 50
export const DEFAULT_SETS = 3
```

Numbers rendered to the user go through `lib/format.ts` (`Intl.NumberFormat`, locale from `i18n/config.ts`), never raw `.toString()`.

**URLs follow the same rule.** Every path is built from `lib/routes.ts` (`ROUTES.workouts.detail(id)`) — no path literal in a `<Link>`, `redirect()`, or `revalidatePath()` call.

## 4. Naming

- Files & folders: `kebab-case.tsx` (`workout-form.tsx`, `exercise-row.tsx`).
- Components: `PascalCase`, named exports. **No default exports** except `app/**` route files (Next.js requires them).
- Hooks: `use-*.ts` exporting `useThing`.
- Server actions: verb-first — `createWorkout`, `updateWorkout`, `deleteWorkout`.
- Queries: `getWorkouts`, `getWorkoutById`.
- Constants: `SCREAMING_SNAKE_CASE`. Dictionary keys: `camelCase`.
- Booleans: `isX` / `hasX` / `canX`.
- Types: `Workout`, `WorkoutInput`, `Exercise`. Props type is `ComponentNameProps`, declared directly above the component.

## 5. Components

**Generic vs. domain — the dividing line:**

- `components/ui/*` may not import from `features/**` or `i18n/**`, may not mention "workout" or "exercise", and takes only presentational props. If it can't be dropped into an unrelated app, it belongs in `features/`.
- `features/workouts/components/*` composes `ui/` primitives, reads `dict`, and owns the domain.

**Rules**

1. Server Component by default. Add `'use client'` only for state, effects, refs, or event handlers — and push it to the smallest leaf possible.
2. Never duplicate markup. Two similar blocks → one component with props. Create and edit screens share **one** `WorkoutForm` driven by `defaultValues` / `submitLabel` / `onSubmitAction`, not two copies.
3. Props over conditionals-on-context: a component never asks "which page am I on".
4. Every list renders through a shared generic (`DataTable`, `SortableList`), never a hand-rolled `<table>` or reorder loop per page.
5. `className` is always the last prop and merged via `cn()`, so any component stays overridable.
6. No inline `style` unless the value is dynamic and impossible in Tailwind (dnd-kit transforms are the allowed exception).
7. Prefer composition (`children`, slots) over boolean prop explosions. More than ~6 props → probably needs slots.

## 6. Design language — dark, sporty, minimal, RTL

- Tokens live **only** in `@theme` inside `globals.css`. Never hardcode a hex in a component; use the token utilities (`bg-surface`, `text-muted`, `border-line`, `text-accent`).
- Palette: base `#0A0A0B`, surface `#141416`, hairline `#26262A`, text `#F4F4F5`, muted `#8A8A93`, accent `#C8F751`, danger `#F4515B`. Accent is reserved for primary actions, active states, and key numbers — never decoration.
- Minimal means: no gradients, no shadows heavier than a hairline border, no rounded-full blobs. Radius scale `md` (8px) / `lg` (12px) only. Generous vertical rhythm, tight horizontal.
- Type: one sans family with real Hebrew coverage. Numeric/stat text uses `tabular-nums`; small labels are uppercase with tight tracking (Latin only — Hebrew has no uppercase, so use weight and color for emphasis instead).
- **RTL is structural, not a patch.** Use logical Tailwind utilities everywhere — `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `border-s`/`border-e`. `left`/`right`/`ml`/`pr` are banned in app code; a flipped layout must never require a second stylesheet.
- Icons that imply direction (back arrow, chevron) mirror with `rtl:-scale-x-100`.
- Motion: 150ms ease-out on color / opacity / transform only. No layout animation.
- Every interactive element has a visible `:focus-visible` ring and a `:disabled` state.

## 7. Data layer

**The repository boundary.** UI and server actions talk to `db/repository.ts` — never to Drizzle directly. It exports `workoutRepository` implementing a fixed interface, so a query change never leaks past one file.

```ts
interface WorkoutRepository {
  list(): Promise<Workout[]>
  getById(id: string): Promise<Workout | null>
  create(input: WorkoutInput): Promise<Workout>
  update(id: string, input: WorkoutInput): Promise<Workout | null>
  remove(id: string): Promise<boolean>
}
```

**Schema (single table).**

```
workouts
  id           uuid        pk default gen_random_uuid()
  name         text        not null
  description  text        not null default ''
  exercises    jsonb       not null default '[]'   -- Exercise[], array order IS display order
  created_at   timestamptz not null default now()
  updated_at   timestamptz not null default now()

Exercise = {
  id: string          // client-generated uuid, stable across reorder
  name: string
  sets: number
  reps: number | null
  maxWeight: number | null
}
```

Exercises are a JSONB column, not a second table — they are only ever read and written together with their workout. Ordering needs no `position` field: the array order is the order, and reordering rewrites the array.

**Rules**

1. `db/client.ts` is the only file that constructs a DB connection, and only via validated `env.DATABASE_URL`.
2. Reads live in `queries.ts`; Server Components call them directly — no API routes for our own UI.
3. Writes live in `actions.ts` with `'use server'`, and every action must:
   - re-validate its input with the zod schema (client validation is a UX nicety, never trusted);
   - return `ActionResult<T>` (`{ ok: true, data } | { ok: false, error, fieldErrors? }`) instead of throwing for expected failures;
   - call `revalidatePath()` for affected routes;
   - `redirect()` from the action, never from the component.
4. Types flow one way: zod schema → `z.infer` → everything else. Never hand-write a type that duplicates a schema.
5. Sets, reps, and weight are `number` in TS and `integer` / `numeric` in SQL — never strings. Parse at the form boundary with `valueAsNumber`.
6. DB error messages are logged server-side and surfaced to the user only as a generic dictionary string — never a raw driver message.

## 8. Forms

- One zod schema per entity in `features/<entity>/schema.ts`, used by the resolver _and_ by the server action. Messages come from `dict`, limits from `constants.ts`.
- `useFieldArray` for exercises; every row keys off the stable `field.id` — never the array index. Reordering uses `move()`, never manual splice.
- Drag & drop must also work from the keyboard (dnd-kit `KeyboardSensor`) and expose the row's position via `aria`.
- Submit state: disable the button and show pending copy via RHF `isSubmitting`. Never allow a double submit.
- Optional numeric fields (reps, max weight) normalize `''` → `null` in the schema, never `NaN` or `0`.

## 9. Errors, loading, empty

Every data surface implements all four states: loading (`loading.tsx` or skeleton), empty (`EmptyState` with a primary action), error (inline message, never a raw stack), and success. A screen missing one of these is unfinished.

## 10. Definition of done for any task

1. `npm run lint` and `npx tsc --noEmit` pass clean.
2. **Zero hardcoded user-facing strings and zero magic numbers** — grep the diff before declaring done.
3. No duplicated markup or logic introduced — reuse or extract.
4. New generic components live in `components/ui`, are domain-free, and never import `dict`.
5. No physical direction utilities (`ml-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`).
6. Keyboard reachable, visible focus, labels tied to inputs.
7. Works at 375px and 1440px, in RTL.

## 11. Version gotchas (verified against the installed lockfile)

**Next.js 16** differs from most training data. `node_modules/next/dist/docs/` holds the version-accurate docs — read the relevant page before using an unfamiliar API.

- `params` and `searchParams` are **Promises**: `const { id } = await params`.
- Route props have generated global types — use `PageProps<'/workouts/[id]'>` and `LayoutProps<'/'>` instead of hand-writing prop types. They are generated into `.next/types`, so `tsc --noEmit` fails on a clean checkout until `next build` or `next dev` has run once.
- `next lint` is gone; the `lint` script calls `eslint` directly.
- `AGENTS.md` at the repo root is written and re-added by `next dev`. Commit it with your work rather than deleting it.

**Zod 4** renamed several APIs:

- String formats are top-level: `z.url()`, `z.email()`, `z.uuid()` — not `z.string().url()`.
- Error customization uses `error`, not `message` / `required_error` / `invalid_type_error`.
- `z.prettifyError(error)` formats a `ZodError` for logs; `error.flatten()` is deprecated in favor of `z.treeifyError()`.
