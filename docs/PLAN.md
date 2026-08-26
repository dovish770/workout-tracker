# תוכנית בנייה — Workout Tracker

מסמך עבודה. הקונבנציות והארכיטקטורה מפורטות ב־`.claude/skills/project-conventions/SKILL.md`, וכל שלב כאן מניח אותן.

**החלטות שנסגרו:** ממשק בעברית RTL עם תשתית להחלפת שפה · כל טקסט ומספר בקבועים, לא בקוד · עריכה inline באותו דף · accent ליים `#C8F751` · שדה חזרות · גרירה לסידור תרגילים · Neon כבר בשלב 2.

> **Neon מחובר.** `DATABASE_URL` ב־`.env`, המיגרציה הוחלה, ה־seed רץ.

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

## שלב 1 — שפת עיצוב, מילון טקסטים, ו־UI primitives ✅

**1א · תשתית טקסטים** — נבנית ראשונה כדי שאף קומפוננטה לא תיוולד עם מחרוזת בתוכה

- [x] `i18n/locales/he.ts` — מילון מקונן: `common`, `nav`, `workouts.list`, `workouts.form`, `workouts.detail`, `workouts.errors`, `workouts.confirm`
- [x] `i18n/dictionary.ts` — `dict` + `type Dictionary = typeof he`, ו־`i18n/index.ts`
- [x] ערכי אינטרפולציה כפונקציות (`exerciseCount: (n) => ...`), לא שרשור מחרוזות
- [x] `features/workouts/constants.ts` — כל הגבולות והדיפולטים (`SETS_MIN/MAX`, `DEFAULT_SETS`, `NAME_MAX`, `DESCRIPTION_MAX`, `WEIGHT_MAX`, `REPS_MAX`)

**1ב · טוקנים ועיצוב**

- [x] `globals.css`: `@theme` עם `bg #0A0A0B`, `surface #141416`, `line #26262A`, `text #F4F4F5`, `muted #8A8A93`, `accent #C8F751`, `danger #F4515B`, רדיוסים, מרווחים
- [x] reset בסיסי + `:focus-visible` גלובלי + `selection`

**1ג · primitives גנריים** (בלי `dict`, בלי דומיין — הכל דרך props)

- [x] `ui/button.tsx` — `primary | ghost | danger`, `sm | md`, `isLoading`, `disabled`
- [x] `ui/input.tsx`, `ui/textarea.tsx` — `aria-invalid` + מצב שגיאה
- [x] `ui/field.tsx` — label + control + שגיאה + hint (הקומפוננטה שמבטלת חזרתיות בטפסים)
- [x] `ui/card.tsx`, `ui/page-header.tsx` (כותרת + תיאור + slot לפעולות), `ui/empty-state.tsx`, `ui/badge.tsx`, `ui/icon-button.tsx`
- [x] `ui/data-table.tsx` — טבלה גנרית `columns: Column<T>[]` עם `renderCell`, מצב ריק, `rowHref` אופציונלי
- [x] `ui/sortable-list.tsx` — עטיפה גנרית מעל dnd-kit: מקבלת `items`, `onReorder(from, to)`, ו־`renderItem` עם `dragHandleProps`. לא יודעת מה זה תרגיל
- [x] `ui/confirm-dialog.tsx` — לאישור מחיקה
- [x] `components/layout/app-shell.tsx` + `nav.tsx` + חיבור ב־`layout.tsx`
- [x] דף `/design` זמני (dev בלבד) להצגת כל ה־primitives
- **מוכן כאשר:** כל הרכיבים נראים בדף אחד, אף אחד מהם לא מכיר workout ואף אחד לא מכיל מחרוזת עברית

## שלב 2 — מודל הנתונים + חיבור Neon ✅

**2א · סכימה וטיפוסים**

- [x] `features/workouts/schema.ts` — `exerciseSchema`, `workoutInputSchema`, `workoutSchema` + טיפוסים ב־`z.infer`. הודעות מ־`dict`, גבולות מ־`constants.ts`
  - שם תרגיל: חובה, עד `EXERCISE_NAME_MAX`
  - סטים: שלם, `SETS_MIN`–`SETS_MAX`, ברירת מחדל `DEFAULT_SETS`
  - חזרות: אופציונלי, שלם, `'' → null`
  - משקל שיא: אופציונלי, חיובי, `'' → null`
  - שם אימון: חובה · תיאור: אופציונלי · לפחות תרגיל אחד
- [x] `lib/result.ts` — `ActionResult<T>` + `ok()` / `fail()`

**2ב · Neon**

- [x] אתה: יצירת פרויקט ב־Neon והעברת `DATABASE_URL` (pooled connection string)
- [x] התקנת `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`
- [x] `db/schema.ts` — טבלת `workouts` לפי §7 בקונבנציות, `jsonb().$type<Exercise[]>()`
- [x] `db/client.ts` — singleton
- [x] `drizzle.config.ts` + סקריפטים `db:generate` / `db:migrate` / `db:studio`
- [x] `DATABASE_URL` הופך לחובה ב־`lib/env.ts`
- [x] הרצת המיגרציה הראשונה מול Neon

**2ג · שכבת גישה**

- [x] `db/repository.ts` — ה־interface + `drizzleWorkoutRepository`
- [x] `features/workouts/queries.ts` — `getWorkouts`, `getWorkoutById`
- [x] `features/workouts/actions.ts` — `createWorkout`, `updateWorkout`, `deleteWorkout` (ולידציה מחדש + `revalidatePath` + `redirect`)
- [x] סקריפט `db:seed` עם 3 אימוני דוגמה
- **מוכן כאשר:** ה־seed רץ, `drizzle-studio` מציג את השורות, ואפשר לקרוא ולכתוב מקוד שרת בלי UI

## שלב 3 — דף רשימת האימונים (`/workouts`) ✅

- [x] `app/workouts/page.tsx` — Server Component דק: `getWorkouts()` + הרכבה
- [x] `features/workouts/components/workouts-table.tsx` — הגדרת עמודות מעל `DataTable`: שם, תיאור, מספר תרגילים
- [x] שורה שלמה מקושרת ל־`/workouts/[id]`
- [x] מצב ריק עם CTA ל"אימון חדש"
- [x] `loading.tsx` עם שלד טבלה
- [x] כפתור "אימון חדש" ב־`PageHeader`
- **מוכן כאשר:** הרשימה מציגה נתונים אמיתיים מ־Neon, נראית טוב ב־375px, ולוחצת לדף פרטים

## שלב 4 — דף יצירת אימון (`/workouts/new`) ✅

- [x] `workout-form.tsx` — client component יחיד שמשרת יצירה **ועריכה** (`defaultValues`, `submitLabel`, `onSubmitAction`)
- [x] `exercise-fields.tsx` — `useFieldArray`: מתחיל בשורה אחת, "הוסף תרגיל", הסרה (חסומה כשנשאר אחד)
- [x] `exercise-row.tsx` — ידית גרירה / שם / סטים / חזרות / משקל שיא, בנוי מ־`Field`
- [x] חיבור `ExerciseFields` ל־`SortableList` — גרירה קוראת ל־`move()` של RHF
- [x] גרירה נגישה מהמקלדת (`KeyboardSensor`) + הכרזת מיקום ב־`aria-live`
- [x] חיבור `createWorkout` + טיפול ב־`fieldErrors` מהשרת
- [x] מצב שליחה: כפתור מושבת, טקסט pending, אין submit כפול
- [x] אזהרת יציאה עם שינויים שלא נשמרו — `useUnsavedChangesGuard`, חל אוטומטית גם על דף העריכה בשלב 6
- [x] אחרי שמירה — redirect לדף האימון שנוצר
- **מוכן כאשר:** אפשר ליצור אימון עם N תרגילים בסדר שנקבע בגרירה, והוא נשמר ב־Neon

## שלב 5 — נרמול התרגילים לטבלה נפרדת ✅

מעבר מ־`exercises` כעמודת jsonb לטבלה משלה, ביחס many-to-one לאימונים.
נעשה **לפני** דף העריכה, כי מסלול השמירה של אותו דף הוא בדיוק מה שמושפע.

**5א · סכימה ומיגרציה**

- [x] טבלת `exercises`: `id`, `workout_id`, `position`, `name`, `sets`, `reps`, `max_weight`, `created_at`, `updated_at`
- [x] `workout_id` → `references workouts(id) on delete cascade` — מחיקת אימון מוחקת את תרגיליו ברמת ה־DB, לא בקוד
- [x] אינדקס על `(workout_id, position)` — **בלי `unique`**: סידור מחדש עובר דרך מצבי ביניים שבהם שני תרגילים חולקים position, ואילוץ ייחודיות היה נכשל באמצע
- [x] `relations()` ב־`db/schema.ts` כדי לאפשר `with: { exercises }`
- [x] מיגרציה בשני חלקים: DDL אוטומטי מ־drizzle-kit, ואז SQL **ידני** שמעביר את ה־jsonb הקיים לשורות (`jsonb_array_elements` עם `ordinality` בשביל ה־position)
- [x] אימות שמספר השורות שנוצרו שווה למספר האיברים ב־jsonb — ורק אז `DROP COLUMN exercises`

**5ב · כתיבה**

- [x] אסטרטגיית שמירה: מחיקת כל תרגילי האימון והכנסה מחדש, עם ה־ids שהגיעו מהטופס. פשוט, אטומי, ומשמר ids של תרגילים קיימים
- [x] `position` נגזר מהאינדקס במערך — הסדר עדיין נקבע בטופס, רק מאוחסן אחרת
- [x] הכל בתוך `db.batch()`: הדרייבר של Neon מעל HTTP **לא תומך** ב־`db.transaction()` אינטראקטיבי, אבל batch רץ כטרנזקציה אחת ב־round trip אחד
- [x] אם בעתיד נצטרך טרנזקציות אינטראקטיביות — מעבר ל־`drizzle-orm/neon-serverless` עם `Pool` מעל WebSocket. לא נדרש עכשיו

**5ג · קריאה**

- [x] `list()` מפסיק להביא תרגילים בכלל — `count()` ב־left join. שיפור אמיתי: דף הרשימה כבר לא מוריד את כל התרגילים של כל האימונים
- [x] טיפוס `WorkoutSummary` (עם `exerciseCount`) לרשימה, מול `Workout` (עם `exercises`) לדף הפרטים
- [x] `getById` עם `with: { exercises: { orderBy: position } }`

**5ד · מה לא אמור להשתנות**

- [x] אפס שינויים תחת `app/` ו־`components/` — זו הבדיקה האמיתית לגבול ה־repository שבנינו בשלב 2
- [x] הסכימות של zod, הטופס והגרירה נשארים כמו שהם
- [x] עדכון §7 בקובץ הקונבנציות, שכרגע אומר במפורש "jsonb ולא טבלה שנייה"

**מה זה עולה:** כל שמירה הופכת מ־UPDATE אחד לכמה statements, ומחיקה+הכנסה מחדש מייצרת id חדש לכל תרגיל שלא היה קיים. בתמורה — שלמות נתונים ברמת ה־DB, דף רשימה זול יותר, ואפשרות לשאול שאלות חוצות־אימונים ("איפה שיא הסקוואט שלי", "כמה פעמים עשיתי חזה החודש") שעם jsonb היו מסורבלות.

- **מוכן כאשר:** ה־seed רץ מחדש, 3 האימונים מציגים את אותם תרגילים ואותם מונים, `exercises` היא טבלה נפרדת, ומחיקת אימון מוחקת את תרגיליו

## שלב 6 — דף אימון: תצוגה ועריכה inline (`/workouts/[id]`)

- [ ] `app/workouts/[id]/page.tsx` — `getWorkoutById` + `notFound()`
- [ ] תצוגת קריאה: כותרת, תיאור, רשימת תרגילים עם סטים/חזרות/משקל
- [ ] `workout-view.tsx` — client wrapper עם `isEditing`; מצב עריכה מרנדר את **אותה** `WorkoutForm` עם `defaultValues` של האימון
- [ ] כפתורי עריכה / ביטול; ביטול מחזיר לערכים המקוריים בלי לשמור
- [ ] הוספה, הסרה, עריכה וסידור מחדש של תרגילים — דרך אותו `ExerciseFields`
- [ ] מחיקת אימון עם `ConfirmDialog` + redirect לרשימה
- [ ] `not-found.tsx` ייעודי
- **מוכן כאשר:** מעגל CRUD מלא עובד מקצה לקצה מול Neon

## שלב 7 — ליטוש וסגירה

- [ ] מעבר על ארבעת המצבים (loading / empty / error / success) בכל מסך
- [ ] `error.tsx` גלובלי + toast להצלחה ולכישלון
- [ ] נגישות: מעבר מקלדת מלא, labels, `aria-live` להודעות
- [ ] רספונסיביות 375 / 768 / 1440 — הטבלה הופכת לכרטיסים במובייל
- [ ] ביקורת RTL: אפס `ml-`/`pr-`/`left-`/`right-`/`text-left` בקוד
- [ ] ביקורת מחרוזות: grep שמוודא שאין טקסט עברי מחוץ ל־`i18n/`
- [ ] מטא־דאטה, favicon, `not-found` גלובלי
- [ ] הסרת דף `/design`, ניקוי TODO, README מעודכן
- [ ] `lint` + `tsc` + `build` נקיים

## שלב 8 — משתמשים ובעלות על אימונים 🆕

כל משתמש רואה ועורך רק את האימונים שלו. יחס 1:N — לאימון יש בעלים אחד, אין שיתוף.

**החלטה שצריך לסגור לפני שמתחילים:** ספק אימות. ארבע אפשרויות ריאליות —
`Auth.js v5` (חינמי, גמיש, יותר קוד), `Clerk` (הכי מהיר להרים, UI מוכן, תשלום בקנה מידה),
`Better Auth` (TypeScript-first, הכל בבסיס הנתונים שלנו), או `Neon Auth` (יושב על Neon שכבר יש לנו).

**8א · סכימה**

- [ ] טבלת `users` (או מזהה חיצוני מהספק, תלוי בהחלטה)
- [ ] `workouts.user_id` → `not null references users(id) on delete cascade`
- [ ] אינדקס על `(user_id, created_at desc)` — זו השאילתה של דף הרשימה
- [ ] backfill: ל־3 האימונים הקיימים צריך בעלים לפני שהעמודה הופכת ל־not null

**8ב · העיקרון — שאי אפשר לשכוח את הסינון**

- [ ] לא מסננים ב־UI ולא סומכים על כך שכל שאילתה תזכור להוסיף `where user_id = ...`
- [ ] במקום: `createWorkoutRepository(userId)` שנבנה פעם אחת לכל בקשה, וה־userId סגור בתוכו. אין API שמאפשר לשאול בלי סינון
- [ ] כל מוטציה מאמתת בעלות **בתוך אותה שאילתה שכותבת** (`where id = ? and user_id = ?`), לא בקריאה נפרדת לפניה — אחרת יש חלון ל־race
- [ ] `getWorkoutById` של אימון של מישהו אחר מחזיר `null`, לא 403 — לא מדליפים את עצם הקיום

**8ג · ממשק**

- [ ] דף התחברות, יציאה בהדר, מצב "מי מחובר"
- [ ] middleware שמגן על `/workouts/*`
- [ ] הרחבת המילון: `auth.*` — התחברות, יציאה, שגיאות
- **מוכן כאשר:** שני משתמשים שונים רואים שתי רשימות שונות, וניסיון לגשת ישירות ל־uuid של אימון זר מחזיר 404

## שלב 9 (עתידי) — החלפת שפה בפועל

התשתית משלב 1 מספיקה כדי שהשלב הזה יהיה מכני. כשתרצה:

- [ ] `i18n/locales/en.ts` המקיים את `Dictionary` (ה־type check מוודא שלא נשכח מפתח)
- [ ] מעבר ל־`[locale]` segment או cookie + `getDictionary(locale)`
- [ ] `dir` דינמי לפי השפה
- אף קומפוננטה לא משתנה

---

## נקודות פתוחות

1. **ספק אימות לשלב 8** — ארבע האפשרויות למעלה. לא דחוף, אבל משפיע על סכימת ה־`users`.
2. **שיתוף אימונים** — שלב 8 מניח בעלים יחיד. אם תרצה בעתיד לשתף אימון בין משתמשים, זה הופך ל־many-to-many וצריך טבלת קישור. עדיף להחליט לפני 8א.
3. **תאריך ביצוע** — ירד מהתוכנית לפי בקשתך. `created_at` נשאר בטבלה כי הוא שימושי למיון, אבל לא מוצג.
4. **מיון ברשימה** — כרגע לפי `created_at` יורד. מיון לפי עמודה הוא תוספת קטנה ל־`DataTable`.
5. **מחיקת תרגיל בודד** — כרגע תרגיל נמחק רק בשמירת האימון. אחרי שלב 5 אפשר יהיה גם למחוק תרגיל ישירות, אם תרצה.
