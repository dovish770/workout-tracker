# תוכנית בנייה — Workout Tracker

מסמך עבודה. הקונבנציות והארכיטקטורה מפורטות ב־`.claude/skills/project-conventions/SKILL.md`, וכל שלב כאן מניח אותן.

**החלטות שנסגרו:** ממשק בעברית RTL עם תשתית להחלפת שפה · כל טקסט ומספר בקבועים, לא בקוד · עריכה inline באותו דף · accent ליים `#C8F751` · שדה חזרות · גרירה לסידור תרגילים · Neon כבר בשלב 2.

> **⚠️ נקודת החיבור שלך:** בתחילת שלב 2 אני עוצר וצריך ממך `DATABASE_URL` מפרויקט Neon. עד אז אין שום תלות בחיבור.

---

## שלב 0 — תשתית ופיגומים ✅

- [x] `create-next-app` — TypeScript, App Router, Tailwind v4, ESLint, `src/`, alias `@/*`
- [x] התקנת תלויות: `zod`, `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`
- [x] יצירת שלד התיקיות מ־§2 בקונבנציות
- [x] `lib/cn.ts` (clsx + tailwind-merge)
- [x] `lib/env.ts` — ולידציית `process.env` ב־zod (`DATABASE_URL` אופציונלי עד שלב 2)
- [x] `lib/format.ts` — `formatNumber` מבוסס `Intl.NumberFormat('he-IL')`
- [x] `app/layout.tsx` עם `lang="he" dir="rtl"` + פונט עם כיסוי עברי מלא
- [x] `.env.example`, `.gitignore`, `README.md` קצר
- [x] `git init` + commit ראשון
- **מוכן כאשר:** `npm run dev` עולה, `npm run lint` ו־`tsc --noEmit` נקיים

## שלב 1 — שפת עיצוב, מילון טקסטים, ו־UI primitives

**1א · תשתית טקסטים** — נבנית ראשונה כדי שאף קומפוננטה לא תיוולד עם מחרוזת בתוכה

- [ ] `i18n/locales/he.ts` — מילון מקונן: `common`, `nav`, `workouts.list`, `workouts.form`, `workouts.detail`, `workouts.errors`, `workouts.confirm`
- [ ] `i18n/dictionary.ts` — `dict` + `type Dictionary = typeof he`, ו־`i18n/index.ts`
- [ ] ערכי אינטרפולציה כפונקציות (`exerciseCount: (n) => ...`), לא שרשור מחרוזות
- [ ] `features/workouts/constants.ts` — כל הגבולות והדיפולטים (`SETS_MIN/MAX`, `DEFAULT_SETS`, `NAME_MAX`, `DESCRIPTION_MAX`, `WEIGHT_MAX`, `REPS_MAX`)

**1ב · טוקנים ועיצוב**

- [ ] `globals.css`: `@theme` עם `bg #0A0A0B`, `surface #141416`, `line #26262A`, `text #F4F4F5`, `muted #8A8A93`, `accent #C8F751`, `danger #F4515B`, רדיוסים, מרווחים
- [ ] reset בסיסי + `:focus-visible` גלובלי + `selection`

**1ג · primitives גנריים** (בלי `dict`, בלי דומיין — הכל דרך props)

- [ ] `ui/button.tsx` — `primary | ghost | danger`, `sm | md`, `isLoading`, `disabled`
- [ ] `ui/input.tsx`, `ui/textarea.tsx` — `aria-invalid` + מצב שגיאה
- [ ] `ui/field.tsx` — label + control + שגיאה + hint (הקומפוננטה שמבטלת חזרתיות בטפסים)
- [ ] `ui/card.tsx`, `ui/page-header.tsx` (כותרת + תיאור + slot לפעולות), `ui/empty-state.tsx`, `ui/badge.tsx`, `ui/icon-button.tsx`
- [ ] `ui/data-table.tsx` — טבלה גנרית `columns: Column<T>[]` עם `renderCell`, מצב ריק, `rowHref` אופציונלי
- [ ] `ui/sortable-list.tsx` — עטיפה גנרית מעל dnd-kit: מקבלת `items`, `onReorder(from, to)`, ו־`renderItem` עם `dragHandleProps`. לא יודעת מה זה תרגיל
- [ ] `ui/confirm-dialog.tsx` — לאישור מחיקה
- [ ] `components/layout/app-shell.tsx` + `nav.tsx` + חיבור ב־`layout.tsx`
- [ ] דף `/design` זמני (dev בלבד) להצגת כל ה־primitives
- **מוכן כאשר:** כל הרכיבים נראים בדף אחד, אף אחד מהם לא מכיר workout ואף אחד לא מכיל מחרוזת עברית

## שלב 2 — מודל הנתונים + חיבור Neon 🔌

**2א · סכימה וטיפוסים**

- [ ] `features/workouts/schema.ts` — `exerciseSchema`, `workoutInputSchema`, `workoutSchema` + טיפוסים ב־`z.infer`. הודעות מ־`dict`, גבולות מ־`constants.ts`
  - שם תרגיל: חובה, עד `EXERCISE_NAME_MAX`
  - סטים: שלם, `SETS_MIN`–`SETS_MAX`, ברירת מחדל `DEFAULT_SETS`
  - חזרות: אופציונלי, שלם, `'' → null`
  - משקל שיא: אופציונלי, חיובי, `'' → null`
  - שם אימון: חובה · תיאור: אופציונלי · לפחות תרגיל אחד
- [ ] `lib/result.ts` — `ActionResult<T>` + `ok()` / `fail()`

**2ב · Neon — כאן אני עוצר וצריך אותך**

- [ ] אתה: יצירת פרויקט ב־Neon והעברת `DATABASE_URL` (pooled connection string)
- [ ] התקנת `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`
- [ ] `db/schema.ts` — טבלת `workouts` לפי §7 בקונבנציות, `jsonb().$type<Exercise[]>()`
- [ ] `db/client.ts` — singleton
- [ ] `drizzle.config.ts` + סקריפטים `db:generate` / `db:migrate` / `db:studio`
- [ ] `DATABASE_URL` הופך לחובה ב־`lib/env.ts`
- [ ] הרצת המיגרציה הראשונה מול Neon

**2ג · שכבת גישה**

- [ ] `db/repository.ts` — ה־interface + `drizzleWorkoutRepository`
- [ ] `features/workouts/queries.ts` — `getWorkouts`, `getWorkoutById`
- [ ] `features/workouts/actions.ts` — `createWorkout`, `updateWorkout`, `deleteWorkout` (ולידציה מחדש + `revalidatePath` + `redirect`)
- [ ] סקריפט `db:seed` עם 3 אימוני דוגמה
- **מוכן כאשר:** ה־seed רץ, `drizzle-studio` מציג את השורות, ואפשר לקרוא ולכתוב מקוד שרת בלי UI

## שלב 3 — דף רשימת האימונים (`/workouts`)

- [ ] `app/workouts/page.tsx` — Server Component דק: `getWorkouts()` + הרכבה
- [ ] `features/workouts/components/workouts-table.tsx` — הגדרת עמודות מעל `DataTable`: שם, תיאור, מספר תרגילים
- [ ] שורה שלמה מקושרת ל־`/workouts/[id]`
- [ ] מצב ריק עם CTA ל"אימון חדש"
- [ ] `loading.tsx` עם שלד טבלה
- [ ] כפתור "אימון חדש" ב־`PageHeader`
- **מוכן כאשר:** הרשימה מציגה נתונים אמיתיים מ־Neon, נראית טוב ב־375px, ולוחצת לדף פרטים

## שלב 4 — דף יצירת אימון (`/workouts/new`)

- [ ] `workout-form.tsx` — client component יחיד שמשרת יצירה **ועריכה** (`defaultValues`, `submitLabel`, `onSubmitAction`)
- [ ] `exercise-fields.tsx` — `useFieldArray`: מתחיל בשורה אחת, "הוסף תרגיל", הסרה (חסומה כשנשאר אחד)
- [ ] `exercise-row.tsx` — ידית גרירה / שם / סטים / חזרות / משקל שיא, בנוי מ־`Field`
- [ ] חיבור `ExerciseFields` ל־`SortableList` — גרירה קוראת ל־`move()` של RHF
- [ ] גרירה נגישה מהמקלדת (`KeyboardSensor`) + הכרזת מיקום ב־`aria-live`
- [ ] חיבור `createWorkout` + טיפול ב־`fieldErrors` מהשרת
- [ ] מצב שליחה: כפתור מושבת, טקסט pending, אין submit כפול
- [ ] אחרי שמירה — redirect לדף האימון שנוצר
- **מוכן כאשר:** אפשר ליצור אימון עם N תרגילים בסדר שנקבע בגרירה, והוא נשמר ב־Neon

## שלב 5 — דף אימון: תצוגה ועריכה inline (`/workouts/[id]`)

- [ ] `app/workouts/[id]/page.tsx` — `getWorkoutById` + `notFound()`
- [ ] תצוגת קריאה: כותרת, תיאור, רשימת תרגילים עם סטים/חזרות/משקל
- [ ] `workout-view.tsx` — client wrapper עם `isEditing`; מצב עריכה מרנדר את **אותה** `WorkoutForm` עם `defaultValues` של האימון
- [ ] כפתורי עריכה / ביטול; ביטול מחזיר לערכים המקוריים בלי לשמור
- [ ] הוספה, הסרה, עריכה וסידור מחדש של תרגילים — דרך אותו `ExerciseFields`
- [ ] מחיקת אימון עם `ConfirmDialog` + redirect לרשימה
- [ ] `not-found.tsx` ייעודי
- **מוכן כאשר:** מעגל CRUD מלא עובד מקצה לקצה מול Neon

## שלב 6 — ליטוש וסגירה

- [ ] מעבר על ארבעת המצבים (loading / empty / error / success) בכל מסך
- [ ] `error.tsx` גלובלי + toast להצלחה ולכישלון
- [ ] נגישות: מעבר מקלדת מלא, labels, `aria-live` להודעות
- [ ] רספונסיביות 375 / 768 / 1440 — הטבלה הופכת לכרטיסים במובייל
- [ ] ביקורת RTL: אפס `ml-`/`pr-`/`left-`/`right-`/`text-left` בקוד
- [ ] ביקורת מחרוזות: grep שמוודא שאין טקסט עברי מחוץ ל־`i18n/`
- [ ] מטא־דאטה, favicon, `not-found` גלובלי
- [ ] הסרת דף `/design`, ניקוי TODO, README מעודכן
- [ ] `lint` + `tsc` + `build` נקיים

## שלב 7 (עתידי, לא עכשיו) — החלפת שפה בפועל

התשתית משלב 1 מספיקה כדי שהשלב הזה יהיה מכני. כשתרצה:

- [ ] `i18n/locales/en.ts` המקיים את `Dictionary` (ה־type check מוודא שלא נשכח מפתח)
- [ ] מעבר ל־`[locale]` segment או cookie + `getDictionary(locale)`
- [ ] `dir` דינמי לפי השפה
- אף קומפוננטה לא משתנה

---

## נקודות פתוחות קטנות

1. **חזרות — חובה או אופציונלי?** התכנון כרגע: אופציונלי, כמו משקל שיא. אם אתה רוצה שיהיה חובה כמו סטים — שינוי של שורה אחת בסכימה, תגיד לפני שלב 2.
2. **תאריך ביצוע** — יורד מהתוכנית לפי בקשתך. `created_at` נשאר בטבלה כי הוא שימושי למיון, אבל לא מוצג.
3. **מיון ברשימה** — כרגע לפי `created_at` יורד. אם תרצה מיון לפי עמודה בטבלה, זה תוספת קטנה ל־`DataTable` בשלב 3.
