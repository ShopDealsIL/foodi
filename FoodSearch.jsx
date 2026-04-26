import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'nutritrack_v3'

const todayKey = () => new Date().toISOString().split('T')[0]

const defaultState = {
  history: {},        // { 'YYYY-MM-DD': { meals: [], weight: null } }
  savedMeals: [],     // favourite meals
  workout: {
    days: [
      { name: 'ראשון', focus: 'מנוחה', exercises: [] },
      { name: 'שני', focus: 'חזה וכתפיים', exercises: [
        { name: 'לחיצת חזה שטוח', sets: 4, reps: '8-10', done: false },
        { name: 'לחיצת כתף בישיבה', sets: 3, reps: '10-12', done: false },
        { name: 'פרפר בישיבה', sets: 3, reps: '12-15', done: false },
      ]},
      { name: 'שלישי', focus: 'גב ו-Biceps', exercises: [
        { name: 'משיכות לסנטר', sets: 4, reps: '6-8', done: false },
        { name: 'חתירה במוט', sets: 3, reps: '10-12', done: false },
        { name: 'כפיפות ביצפס', sets: 3, reps: '12', done: false },
      ]},
      { name: 'רביעי', focus: 'קרדיו', exercises: [
        { name: 'ריצה/הליכה', sets: 1, reps: '30 דקות', done: false },
        { name: 'קפיצה בחבל', sets: 3, reps: '3 דקות', done: false },
      ]},
      { name: 'חמישי', focus: 'רגליים', exercises: [
        { name: 'סקוואט', sets: 4, reps: '8-10', done: false },
        { name: 'לחיצת רגליים', sets: 3, reps: '12-15', done: false },
        { name: 'לנג׳', sets: 3, reps: '12 כל רגל', done: false },
      ]},
      { name: 'שישי', focus: 'בטן וליבה', exercises: [
        { name: 'פלאנק', sets: 3, reps: '45 שניות', done: false },
        { name: 'כפיפות בטן', sets: 3, reps: '20', done: false },
        { name: 'רוסי טוויסט', sets: 3, reps: '20', done: false },
      ]},
      { name: 'שבת', focus: 'מנוחה', exercises: [] },
    ],
  },
  goals: { calories: 2000, protein: 150 },
  goalWeight: null,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    // Merge with defaults to handle new fields
    return {
      ...defaultState,
      ...parsed,
      goals: { ...defaultState.goals, ...(parsed.goals || {}) },
      workout: parsed.workout || defaultState.workout,
    }
  } catch {
    return defaultState
  }
}

export function useStore() {
  const [state, setState] = useState(loadState)

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const update = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  // ── Today helpers ──────────────────────────────────────────────
  const today = todayKey()
  const todayData = state.history[today] || { meals: [], weight: null }
  const todayMeals = todayData.meals || []

  const addMeal = useCallback((meal) => {
    update(prev => {
      const key = todayKey()
      const day = prev.history[key] || { meals: [], weight: null }
      return {
        ...prev,
        history: {
          ...prev.history,
          [key]: { ...day, meals: [...day.meals, { ...meal, id: Date.now(), addedAt: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) }] },
        },
      }
    })
  }, [update])

  const deleteMeal = useCallback((id) => {
    update(prev => {
      const key = todayKey()
      const day = prev.history[key] || { meals: [] }
      return {
        ...prev,
        history: {
          ...prev.history,
          [key]: { ...day, meals: day.meals.filter(m => m.id !== id) },
        },
      }
    })
  }, [update])

  // ── Weight helpers ─────────────────────────────────────────────
  const weightLog = Object.entries(state.history)
    .filter(([, d]) => d.weight)
    .map(([date, d]) => ({ date, weight: d.weight }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const addWeight = useCallback((weight) => {
    update(prev => {
      const key = todayKey()
      const day = prev.history[key] || { meals: [] }
      return {
        ...prev,
        history: { ...prev.history, [key]: { ...day, weight } },
      }
    })
  }, [update])

  // ── Saved meals ────────────────────────────────────────────────
  const saveFavourite = useCallback((meal) => {
    update(prev => {
      if (prev.savedMeals.find(m => m.name === meal.name)) return prev
      return { ...prev, savedMeals: [...prev.savedMeals, meal] }
    })
  }, [update])

  const deleteFavourite = useCallback((name) => {
    update(prev => ({ ...prev, savedMeals: prev.savedMeals.filter(m => m.name !== name) }))
  }, [update])

  // ── Workout ────────────────────────────────────────────────────
  const toggleExercise = useCallback((dayIdx, exIdx) => {
    update(prev => {
      const days = prev.workout.days.map((d, di) => {
        if (di !== dayIdx) return d
        return { ...d, exercises: d.exercises.map((e, ei) => ei === exIdx ? { ...e, done: !e.done } : e) }
      })
      return { ...prev, workout: { ...prev.workout, days } }
    })
  }, [update])

  const addExercise = useCallback((dayIdx, exercise) => {
    update(prev => {
      const days = prev.workout.days.map((d, di) =>
        di === dayIdx ? { ...d, exercises: [...d.exercises, { ...exercise, done: false }] } : d
      )
      return { ...prev, workout: { ...prev.workout, days } }
    })
  }, [update])

  const updateDayFocus = useCallback((dayIdx, focus) => {
    update(prev => {
      const days = prev.workout.days.map((d, di) => di === dayIdx ? { ...d, focus } : d)
      return { ...prev, workout: { ...prev.workout, days } }
    })
  }, [update])

  const deleteExercise = useCallback((dayIdx, exIdx) => {
    update(prev => {
      const days = prev.workout.days.map((d, di) =>
        di === dayIdx ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) } : d
      )
      return { ...prev, workout: { ...prev.workout, days } }
    })
  }, [update])

  // ── Goals ──────────────────────────────────────────────────────
  const setGoals = useCallback((goals) => {
    update(prev => ({ ...prev, goals: { ...prev.goals, ...goals } }))
  }, [update])

  const setGoalWeight = useCallback((w) => {
    update(prev => ({ ...prev, goalWeight: w }))
  }, [update])

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState)
  }, [])

  return {
    state, update,
    today, todayMeals, todayData,
    addMeal, deleteMeal,
    weightLog, addWeight,
    saveFavourite, deleteFavourite,
    toggleExercise, addExercise, updateDayFocus, deleteExercise,
    setGoals, setGoalWeight, clearAll,
  }
}
