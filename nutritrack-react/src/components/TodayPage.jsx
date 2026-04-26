import React, { useMemo } from 'react'
import { Card, CardTitle, MacroRow, MealTimePill } from './ui.jsx'
import FoodSearch from './FoodSearch.jsx'

// ── Calorie Ring ──────────────────────────────────────────────────────────
function CalRing({ consumed, goal }) {
  const pct = Math.min(consumed / goal, 1)
  const r = 42, circ = 2 * Math.PI * r
  const offset = circ - pct * circ
  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c63ff" />
            <stop offset="100%" stopColor="#ff6584" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#rg)" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset .8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{consumed}</div>
        <div style={{ fontSize: 9, color: 'var(--muted)' }}>קלוריות</div>
      </div>
    </div>
  )
}

// ── Meal Item ─────────────────────────────────────────────────────────────
function MealItem({ meal, onDelete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', animation: 'fadeUp .3s ease' }}>
      <div style={{ width: 36, height: 36, background: 'var(--surface)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {meal.emoji || '🍽️'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meal.name}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <MealTimePill time={meal.time} />
          <span>💪{meal.protein}g · 🌾{meal.carbs}g · 🧈{meal.fat}g</span>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{meal.calories}</div>
      <button onClick={() => onDelete(meal.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20, padding: '2px 4px', lineHeight: 1, borderRadius: 6, transition: 'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >×</button>
    </div>
  )
}

// ── Saved Meals ───────────────────────────────────────────────────────────
function SavedMeals({ meals, onUse, onDelete }) {
  if (!meals.length) return null
  return (
    <Card>
      <CardTitle>⭐ מועדפים</CardTitle>
      {meals.map((m, i) => (
        <div key={m.name + i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < meals.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <span style={{ fontSize: 20 }}>{m.emoji || '🍽️'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>🔥{m.calories} קל׳ · 💪{m.protein}g</div>
          </div>
          <button onClick={() => onUse(m)} style={{ background: 'rgba(61,232,132,.1)', border: '1px solid rgba(61,232,132,.3)', color: 'var(--green)', padding: '5px 12px', borderRadius: 8, fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>הוסף</button>
          <button onClick={() => onDelete(m.name)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', padding: '2px 4px' }}>×</button>
        </div>
      ))}
    </Card>
  )
}

// ── Today Page ────────────────────────────────────────────────────────────
export default function TodayPage({ store }) {
  const { todayMeals, addMeal, deleteMeal, saveFavourite, deleteFavourite, state } = store
  const { goals, savedMeals } = state

  const totals = useMemo(() => todayMeals.reduce(
    (a, m) => ({ calories: a.calories + m.calories, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ), [todayMeals])

  const calStatus = totals.calories === 0 ? null
    : totals.calories < goals.calories * 0.85 ? 'ok'
    : totals.calories < goals.calories ? 'warn'
    : 'over'

  const statusStyles = {
    ok:   { bg: 'rgba(61,232,132,.1)',   border: 'rgba(61,232,132,.25)',   color: 'var(--green)',   text: `✅ ${totals.calories} / ${goals.calories} קל׳ — בכיוון הנכון!` },
    warn: { bg: 'rgba(247,151,30,.1)',   border: 'rgba(247,151,30,.25)',   color: 'var(--orange)',  text: `⚠️ ${totals.calories} / ${goals.calories} קל׳ — מתקרב ליעד` },
    over: { bg: 'rgba(255,101,132,.1)', border: 'rgba(255,101,132,.25)', color: 'var(--accent2)', text: `🔴 ${totals.calories} / ${goals.calories} קל׳ — חרגת מהיעד` },
  }

  const handleAdd = (meal) => addMeal(meal)
  const handleUseSaved = (meal) => addMeal({ ...meal, time: 'snack' })

  return (
    <div style={{ padding: '12px 16px 0' }}>
      {/* Summary card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CalRing consumed={totals.calories} goal={goals.calories} />
          <div style={{ flex: 1 }}>
            <MacroRow label="💪 חלבון" value={`${Math.round(totals.protein)}g`} color="var(--accent)" pct={totals.protein / goals.protein * 100} />
            <MacroRow label="🌾 פחמ׳"  value={`${Math.round(totals.carbs)}g`}   color="var(--orange)" pct={totals.carbs / 250 * 100} />
            <MacroRow label="🧈 שומן"  value={`${Math.round(totals.fat)}g`}    color="var(--green)"  pct={totals.fat / 70 * 100} />
          </div>
        </div>
        {calStatus && (
          <div style={{ marginTop: 10, padding: '7px 12px', borderRadius: 8, background: statusStyles[calStatus].bg, border: `1px solid ${statusStyles[calStatus].border}`, color: statusStyles[calStatus].color, fontSize: 12, fontWeight: 600 }}>
            {statusStyles[calStatus].text}
          </div>
        )}
      </Card>

      {/* Food search */}
      <FoodSearch onAdd={handleAdd} onSaveFavourite={saveFavourite} />

      {/* Saved meals */}
      <SavedMeals meals={savedMeals || []} onUse={handleUseSaved} onDelete={deleteFavourite} />

      {/* Meal log */}
      <Card>
        <CardTitle>📋 יומן היום</CardTitle>
        {!todayMeals.length ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>עדיין לא הוספת ארוחות 🍽️</div>
        ) : (
          <>
            {todayMeals.map(m => <MealItem key={m.id} meal={m} onDelete={deleteMeal} />)}
            {/* Save last meal as favourite */}
            <button
              onClick={() => saveFavourite(todayMeals[todayMeals.length - 1])}
              style={{ marginTop: 10, width: '100%', background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}
            >
              ⭐ שמור ארוחה אחרונה כמועדף
            </button>
          </>
        )}
      </Card>
    </div>
  )
}
