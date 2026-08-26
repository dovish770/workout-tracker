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

  sessions: {
    startAction: 'התחל אימון',
    resumeAction: 'המשך אימון',
    activeBanner: (name: string) => `אימון פעיל: ${name}`,

    startDialog: {
      title: 'להתחיל אימון?',
      description: 'בחר את האימון שתרצה לבצע עכשיו.',
      resumeTitle: 'יש לך אימון פעיל',
      resumeDescription: (name: string) =>
        `"${name}" עדיין באמצע. אפשר להמשיך מאיפה שהפסקת.`,
      dismiss: 'לא עכשיו',
      emptyWorkouts: 'אין עדיין אימונים להתחיל',
    },

    run: {
      firstExercise: 'התרגיל הראשון',
      nextExercise: 'התרגיל הבא',
      letsStart: 'בוא נתחיל',
      startAction: 'שנתחיל',
      readyAction: 'מוכן',
      setTitle: (index: number) => `סט ${formatNumber(index)}`,
      setsCount: (count: number) => `${formatNumber(count)} סטים`,
      restTitle: 'מנוחה',
      restContinue: 'המשך',
      restReset: 'אפס טיימר',
      restSkip: 'דלג על המנוחה',
      overdueBy: (seconds: number) => `+${formatNumber(seconds)} שניות מעבר לזמן`,
      timerEnable: 'הפעלת טיימר מנוחה',
      timerDisable: 'כיבוי טיימר מנוחה',
      timerShow: 'הצגת הטיימר',
      timerHide: 'הסתרת הטיימר',
      maxWeightLabel: 'משקל שיא',
      maxWeightNone: 'לא נקבע',
      editMaxWeight: 'עדכון משקל שיא',
      maxWeightSaved: 'משקל השיא עודכן',
      exit: 'יציאה ממצב אימון',
      settings: 'הגדרות אימון',
      weightUnit: 'ק״ג',
      weightPlaceholder: 'משקל בק״ג',
      doneTitle: 'סיימת',
      doneSubtitle: 'כל הכבוד',

      exerciseProgress: (current: number, total: number) =>
        `תרגיל ${formatNumber(current)} מתוך ${formatNumber(total)}`,
      setProgress: (done: number, total: number) =>
        `סט ${formatNumber(done)} מתוך ${formatNumber(total)}`,
      totalProgress: (done: number, total: number) =>
        `${formatNumber(done)} מתוך ${formatNumber(total)} סטים`,
      targetReps: (count: number) => `${formatNumber(count)} חזרות`,
      targetWeight: (weight: number) => `${formatNumber(weight)} ק״ג`,
      noTarget: 'ללא יעד',
      completeSet: 'סיום סט',
      undoSet: 'ביטול הסט האחרון',
      upNext: 'הבאים בתור',
      done: 'הושלם',
      allDone: 'סיימת את כל התרגילים',
      allDoneDescription: 'אפשר לסיים את האימון.',
      finish: 'סיום אימון',
      finished: 'האימון הושלם. כל הכבוד.',
      backToWorkouts: 'חזרה לאימונים',
    },

    abandon: {
      action: 'נטישת האימון',
      title: 'לנטוש את האימון?',
      description: 'ההתקדמות תישמר כאימון שננטש, ולא ניתן יהיה להמשיך אותו.',
      confirm: 'נטוש את האימון',
    },

    errors: {
      alreadyActive: 'כבר יש אימון פעיל. סיים אותו לפני שתתחיל חדש.',
      cannotStart: 'לא ניתן להתחיל את האימון הזה. ייתכן שהוא נמחק או שאין בו תרגילים.',
      notActive: 'האימון כבר אינו פעיל.',
      notFoundTitle: 'האימון הפעיל לא נמצא',
      notFoundDescription: 'ייתכן שהוא הסתיים או נמחק.',
    },
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
        start: 'התחלה',
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
      restLabel: 'מנוחה',
      restNone: 'ללא',
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
      restInvalid: 'זמן מנוחה לא תקין',
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
