import { formatNumber } from '@/lib/format'

/**
 * The Hebrew dictionary — the single source of every user-visible string.
 *
 * This object also defines the *shape* every future locale must satisfy
 * (see `dictionary.ts`), so keep it grouped by area and name keys by meaning
 * rather than by their current wording.
 *
 * Anything variable is a function, never string concatenation at the call
 * site — a language with different word order must be able to reorder it.
 */
export const he = {
  meta: {
    title: 'מעקב אימונים',
    description: 'ניהול אימונים ותרגילים',
  },

  common: {
    save: 'שמירה',
    cancel: 'ביטול',
    delete: 'מחיקה',
    edit: 'עריכה',
    add: 'הוספה',
    remove: 'הסרה',
    back: 'חזרה',
    close: 'סגירה',
    loading: 'טוען…',
    optional: 'לא חובה',
    emptyValue: '—',
  },

  errors: {
    title: 'משהו השתבש',
    generic: 'הפעולה נכשלה. נסה שוב.',
    description: 'אירעה שגיאה בלתי צפויה. אפשר לנסות שוב.',
    retry: 'נסה שוב',
    notFound: 'הדף לא נמצא',
    notFoundDescription: 'הכתובת שביקשת לא קיימת.',
    backHome: 'חזרה לאימונים',
  },

  a11y: {
    skipToContent: 'דילוג לתוכן הראשי',
    notifications: 'הודעות מערכת',
    dismiss: 'סגירת ההודעה',
  },

  unsavedChanges: {
    title: 'לצאת בלי לשמור?',
    description: 'יש שינויים שלא נשמרו. אם תעזוב את הדף הם יאבדו.',
    confirm: 'צא בלי לשמור',
    cancel: 'המשך עריכה',
  },

  nav: {
    brand: 'מעקב אימונים',
    workouts: 'האימונים שלי',
    newWorkout: 'אימון חדש',
  },

  workouts: {
    list: {
      title: 'האימונים שלי',
      description: 'כל האימונים שיצרת',
      caption: 'טבלת האימונים',
      newAction: 'אימון חדש',
      columns: {
        name: 'שם האימון',
        description: 'תיאור',
        exerciseCount: 'תרגילים',
      },
      empty: {
        title: 'עדיין אין אימונים',
        description: 'צור את האימון הראשון שלך כדי להתחיל לעקוב.',
        action: 'יצירת אימון',
      },
    },

    detail: {
      exercisesTitle: 'תרגילים',
      backToList: 'חזרה לרשימה',
      setsValue: (count: number) => `${formatNumber(count)} סטים`,
      repsValue: (count: number) => `${formatNumber(count)} חזרות`,
      weightValue: (weight: number) => `${formatNumber(weight)} ק״ג`,
      notFoundTitle: 'האימון לא נמצא',
      notFoundDescription: 'ייתכן שהאימון נמחק או שהקישור שגוי.',
      noExercises: 'לאימון הזה אין תרגילים',
      saved: 'השינויים נשמרו',
    },

    form: {
      detailsTitle: 'פרטי האימון',
      nameLabel: 'שם האימון',
      namePlaceholder: 'לדוגמה: פלג גוף עליון',
      descriptionLabel: 'תיאור קצר',
      descriptionPlaceholder: 'לדוגמה: חזה, כתפיים וטרייספס',
      exercisesTitle: 'תרגילים',
      exerciseNameLabel: 'שם התרגיל',
      exerciseNamePlaceholder: 'לדוגמה: לחיצת חזה',
      setsLabel: 'סטים',
      repsLabel: 'חזרות',
      maxWeightLabel: 'משקל שיא',
      weightUnit: 'ק״ג',
      exercisePosition: (index: number) => `תרגיל ${formatNumber(index)}`,
      addExercise: 'הוספת תרגיל',
      removeExercise: 'הסרת התרגיל',
      dragHandle: 'גרירה לשינוי הסדר',
      createSubmit: 'יצירת אימון',
      updateSubmit: 'שמירת שינויים',
      submitting: 'שומר…',
    },

    validation: {
      nameRequired: 'חובה להזין שם לאימון',
      nameTooLong: (max: number) => `שם האימון יכול להכיל עד ${formatNumber(max)} תווים`,
      descriptionTooLong: (max: number) =>
        `התיאור יכול להכיל עד ${formatNumber(max)} תווים`,
      exerciseNameRequired: 'חובה להזין שם לתרגיל',
      exerciseNameTooLong: (max: number) =>
        `שם התרגיל יכול להכיל עד ${formatNumber(max)} תווים`,
      setsRequired: 'חובה להזין מספר סטים',
      setsInteger: 'מספר הסטים חייב להיות מספר שלם',
      setsRange: (min: number, max: number) =>
        `מספר הסטים חייב להיות בין ${formatNumber(min)} ל־${formatNumber(max)}`,
      repsInteger: 'מספר החזרות חייב להיות מספר שלם',
      repsRange: (min: number, max: number) =>
        `מספר החזרות חייב להיות בין ${formatNumber(min)} ל־${formatNumber(max)}`,
      weightRange: (min: number, max: number) =>
        `המשקל חייב להיות בין ${formatNumber(min)} ל־${formatNumber(max)}`,
      exercisesMin: 'האימון חייב לכלול לפחות תרגיל אחד',
    },

    confirmDelete: {
      title: 'למחוק את האימון?',
      description: 'הפעולה אינה הפיכה והאימון יימחק לצמיתות.',
      confirm: 'מחיקת האימון',
    },

    reorder: {
      instructions:
        'הקש רווח או Enter כדי להתחיל לגרור תרגיל. השתמש בחיצים למעלה ולמטה כדי להזיז אותו, רווח או Enter כדי לשחרר, ו־Escape כדי לבטל.',
      onDragStart: (position: number) =>
        `התחלת גרירה של תרגיל במיקום ${formatNumber(position)}`,
      onDragOver: (position: number) =>
        `התרגיל נמצא כעת במיקום ${formatNumber(position)}`,
      onDragEnd: (position: number) => `התרגיל הועבר למיקום ${formatNumber(position)}`,
      onDragCancel: (position: number) =>
        `הגרירה בוטלה. התרגיל חזר למיקום ${formatNumber(position)}`,
    },
  },
} as const
