# NutriTrack — React PWA

## מבנה הפרויקט

```
src/
├── App.jsx              ← ניווט ראשי
├── main.jsx             ← entry point
├── index.css            ← design system
├── useStore.js          ← כל ה-state + localStorage
├── data/
│   └── foods.js         ← מסד נתונים ~130 מאכלים
└── components/
    ├── ui.jsx           ← קומפוננטות משותפות
    ├── FoodSearch.jsx   ← חיפוש + ברקוד + תמונה
    ├── TodayPage.jsx    ← עמוד היום
    ├── WeightPage.jsx   ← מעקב משקל
    ├── WorkoutPage.jsx  ← אימונים
    └── StatsPage.jsx    ← סטטיסטיקות
```

## ייבוא ל-Lovable

### דרך 1 — GitHub (מומלץ)
1. צור repo חדש ב-GitHub והעלה את כל הקבצים
2. ב-Lovable: **"Import from GitHub"**
3. בחר את ה-repo

### דרך 2 — העתק-הדבק
1. ב-Lovable צור פרויקט React חדש
2. מחק את כל הקבצים הקיימים
3. צור את הקבצים לפי המבנה למעלה והעתק את התוכן

## פקודות פיתוח

```bash
npm install
npm run dev      # פיתוח
npm run build    # בנייה לייצור
```

## הוספת פיצ'רים ב-Lovable

דוגמאות לבקשות שאפשר לשלוח לצ'אט:

- **"הוסף מאכל חדש למסד הנתונים: פלאפל עם טחינה"**
- **"שנה את הצבע הראשי מסגול לכחול"**
- **"הוסף גרף עוגה לפירוט המקרו"**
- **"הוסף אפשרות לרישום כמות מים"**
- **"חבר ל-Supabase כדי לשמור נתונים בענן"**

## טכנולוגיות

- React 18 + Vite
- localStorage לנתונים (ללא שרת)
- OpenFoodFacts API לברקוד (חינמי)
- BarcodeDetector API לסריקה
- Vite PWA Plugin להתקנה כאפליקציה

## עלות: ₪0 🎉
