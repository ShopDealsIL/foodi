import React, { useMemo } from 'react'
import { Card, CardTitle, MacroRow, MealTimePill } from './ui.jsx'
import FoodSearch from './FoodSearch.jsx'

// ── Calorie Ring ──────────────────────────────────────────────────────────
function CalRing({ consumed, goal }) {
  const pct = Math.min(consumed / goal, 1)
  const r = 42, circ = 2 * Math.PI * r
  const offset = circ - pct * circ
  const over = consumed > goal
  return (
    <div style={{ position:'relative', width:100, height:100, flexShrink:0 }}>
      <svg width="100" height="100" style={{ transform:'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={over ? '#ff6584' : '#6c63ff'} />
            <stop offset="100%" stopColor={over ? '#ff9f43' : '#ff6584'} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#rg)" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition:'stroke-dashoffset .8s ease' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:17, fontWeight:700, lineHeight:1, color: over ? 'var(--accent2)' : 'var(--text)' }}>{consumed}</div>
        <div style={{ fontSize:8, color:'var(--muted)' }}>קלוריות</div>
      </div>
    </div>
  )
}

// ── Remaining Banner ──────────────────────────────────────────────────────
function RemainingBanner({ consumed, goal }) {
  const remaining = goal - consumed
  const pct = Math.round(consumed / goal * 100)
  if (consumed === 0) return null

  const [bg, border, color, icon, msg] =
    remaining > 0
      ? remaining > goal * 0.3
        ? ['rgba(61,232,132,.08)', 'rgba(61,232,132,.2)', 'var(--green)', '✅', `נותרו ${remaining} קל׳ (${100-pct}%)`]
        : ['rgba(247,151,30,.08)', 'rgba(247,151,30,.2)', 'var(--orange)', '⚠️', `נותרו רק ${remaining} קל׳ — היזהר!`]
      : ['rgba(255,101,132,.08)', 'rgba(255,101,132,.2)', 'var(--accent2)', '🔴', `חרגת ב-${Math.abs(remaining)} קל׳`]

  return (
    <div style={{ margin:'10px 0 0', padding:'10px 14px', borderRadius:10, background:bg, border:`1px solid ${border}`, color, fontSize:13, fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span>{icon} {msg}</span>
      <span style={{ fontFamily:'var(--mono)', fontSize:11, opacity:.7 }}>{consumed} / {goal}</span>
    </div>
  )
}

// ── Saved Meals Quick-Add ─────────────────────────────────────────────────
function SavedMealsBar({ meals, onUse, onDelete }) {
  if (!meals || !meals.length) return null
  return (
    <Card>
      <CardTitle>⭐ מועדפים — הוסף בלחיצה</CardTitle>
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {meals.map((m, i) => (
          <div key={m.name+i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom: i < meals.length-1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{m.emoji || '🍽️'}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.name}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>🔥{m.calories} קל׳ · 💪{m.protein}g</div>
            </div>
            <button onClick={() => onUse(m)} style={{ background:'rgba(61,232,132,.12)', border:'1px solid rgba(61,232,132,.3)', color:'var(--green)', padding:'6px 14px', borderRadius:8, fontFamily:'var(--font)', fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
              + הוסף
            </button>
            <button onClick={() => onDelete(m.name)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:18, cursor:'pointer', padding:'2px 4px', flexShrink:0 }}>×</button>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Meal Item ─────────────────────────────────────────────────────────────
function MealItem({ meal, onDelete, onSave }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border)', animation:'fadeUp .3s ease' }}>
      <div style={{ width:36, height:36, background:'var(--surface)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
        {meal.emoji || '🍽️'}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{meal.name}</div>
        <div style={{ fontSize:11, color:'var(--muted)', marginTop:2, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          <MealTimePill time={meal.time} />
          <span>💪{meal.protein}g · 🌾{meal.carbs}g · 🧈{meal.fat}g</span>
          {meal.addedAt && <span style={{opacity:.6}}>{meal.addedAt}</span>}
        </div>
      </div>
      <div style={{ fontFamily:'var(--mono)', fontSize:15, fontWeight:700, color:'var(--accent)', flexShrink:0 }}>{meal.calories}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        <button onClick={() => onSave(meal)} title="שמור כמועדף" style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:14, padding:'2px 4px', lineHeight:1 }}
          onMouseEnter={e=>e.currentTarget.style.color='#f7c948'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>⭐</button>
        <button onClick={() => onDelete(meal.id)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:18, padding:'2px 4px', lineHeight:1 }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--accent2)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>×</button>
      </div>
    </div>
  )
}

// ── Today Page ────────────────────────────────────────────────────────────
export default function TodayPage({ store }) {
  const { todayMeals, addMeal, deleteMeal, saveFavourite, deleteFavourite, state } = store
  const { goals, savedMeals } = state

  const totals = useMemo(() => todayMeals.reduce(
    (a, m) => ({ calories: a.calories+(m.calories||0), protein: a.protein+(m.protein||0), carbs: a.carbs+(m.carbs||0), fat: a.fat+(m.fat||0) }),
    { calories:0, protein:0, carbs:0, fat:0 }
  ), [todayMeals])

  const handleAdd = (meal) => addMeal(meal)
  const handleUseSaved = (meal) => addMeal({ ...meal, time: 'snack' })

  // Group meals by time
  const mealGroups = ['breakfast','lunch','dinner','snack']
  const groupLabels = { breakfast:'☀️ בוקר', lunch:'🌤️ צהריים', dinner:'🌙 ערב', snack:'🍎 חטיפים' }

  return (
    <div style={{ padding:'12px 16px 0' }}>

      {/* Summary */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <CalRing consumed={totals.calories} goal={goals.calories} />
          <div style={{ flex:1 }}>
            <MacroRow label="💪 חלבון" value={`${Math.round(totals.protein)}g`} color="var(--accent)" pct={totals.protein/goals.protein*100} />
            <MacroRow label="🌾 פחמ׳"  value={`${Math.round(totals.carbs)}g`}   color="var(--orange)" pct={totals.carbs/250*100} />
            <MacroRow label="🧈 שומן"  value={`${Math.round(totals.fat)}g`}    color="var(--green)"  pct={totals.fat/70*100} />
          </div>
        </div>
        <RemainingBanner consumed={totals.calories} goal={goals.calories} />
      </Card>

      {/* Saved meals quick-add */}
      <SavedMealsBar meals={savedMeals} onUse={handleUseSaved} onDelete={deleteFavourite} />

      {/* Food search */}
      <FoodSearch onAdd={handleAdd} />

      {/* Meal log */}
      <Card>
        <CardTitle>📋 יומן היום</CardTitle>
        {!todayMeals.length ? (
          <div style={{ textAlign:'center', padding:'20px 0', color:'var(--muted)', fontSize:13 }}>
            עדיין לא הוספת ארוחות היום 🍽️<br/>
            <span style={{fontSize:11}}>הנתונים מתאפסים אוטומטית בחצות</span>
          </div>
        ) : (
          <>
            {mealGroups.map(group => {
              const groupMeals = todayMeals.filter(m => m.time === group)
              if (!groupMeals.length) return null
              const groupTotal = groupMeals.reduce((a,m) => a+(m.calories||0), 0)
              return (
                <div key={group} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0 2px', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)' }}>{groupLabels[group]}</span>
                    <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>{groupTotal} קל׳</span>
                  </div>
                  {groupMeals.map(m => (
                    <MealItem key={m.id} meal={m} onDelete={deleteMeal} onSave={saveFavourite} />
                  ))}
                </div>
              )
            })}
            {/* Total row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0 0', marginTop:4, borderTop:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, fontWeight:700 }}>סה"כ היום</span>
              <span style={{ fontFamily:'var(--mono)', fontSize:16, fontWeight:700, color:'var(--accent)' }}>{totals.calories} קל׳</span>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
