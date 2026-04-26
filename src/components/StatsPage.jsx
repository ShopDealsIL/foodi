import React, { useMemo, useState } from 'react'
import { Card, CardTitle, Btn, Input } from './ui.jsx'

const todayKey = () => new Date().toISOString().split('T')[0]

export default function StatsPage({ store }) {
  const { state, setGoals, clearAll } = store
  const { history, goals } = state

  const [calInput, setCalInput]   = useState(goals.calories)
  const [protInput, setProtInput] = useState(goals.protein)

  const stats = useMemo(() => {
    const days = Object.values(history).filter(d => d.meals?.length)
    const totalCals  = days.reduce((a, d) => a + d.meals.reduce((b, m) => b + m.calories, 0), 0)
    const totalProt  = days.reduce((a, d) => a + d.meals.reduce((b, m) => b + m.protein, 0), 0)
    const totalMeals = days.reduce((a, d) => a + d.meals.length, 0)

    // Weight delta
    const wEntries = Object.entries(history).filter(([,d]) => d.weight).sort((a,b)=>a[0].localeCompare(b[0]))
    const wDelta = wEntries.length >= 2 ? (wEntries[0][1].weight - wEntries[wEntries.length-1][1].weight).toFixed(1) : null

    // Streak
    let streak = 0
    const d = new Date()
    for (let i = 0; i < 365; i++) {
      const k = d.toISOString().split('T')[0]
      if (history[k]?.meals?.length) { streak++; d.setDate(d.getDate()-1) } else break
    }

    return {
      avgCal:    days.length ? Math.round(totalCals  / days.length) : null,
      avgProt:   days.length ? Math.round(totalProt  / days.length) : null,
      totalMeals,
      wDelta,
      streak,
      daysLogged: days.length,
    }
  }, [history])

  return (
    <div style={{ padding: '12px 16px 0' }}>
      {/* Streak hero */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(108,99,255,.18),rgba(255,101,132,.12))',
        border: '1px solid rgba(108,99,255,.3)',
        borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center', marginBottom: 12,
      }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>רצף מעקב</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 60, fontWeight: 700, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
          {stats.streak}
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>ימים ברצף 🔥</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'ממוצע קלוריות', val: stats.avgCal, unit: 'קל׳/יום' },
          { label: 'ממוצע חלבון',  val: stats.avgProt, unit: 'g/יום' },
          { label: 'ימים שנרשמו',  val: stats.daysLogged, unit: 'ימים' },
          { label: 'ארוחות שנרשמו', val: stats.totalMeals, unit: 'ארוחות' },
        ].map(({ label, val, unit }) => (
          <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700 }}>{val ?? '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Weight delta */}
      {stats.wDelta !== null && (
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>שינוי משקל כולל</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700, color: parseFloat(stats.wDelta) > 0 ? 'var(--green)' : 'var(--accent2)' }}>
            {parseFloat(stats.wDelta) > 0 ? `-${stats.wDelta}` : `+${Math.abs(parseFloat(stats.wDelta))}`} ק"ג
          </div>
        </Card>
      )}

      {/* Goals settings */}
      <Card>
        <CardTitle>⚙️ יעדים יומיים</CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>קלוריות</div>
            <Input type="number" value={calInput} onChange={e => setCalInput(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>חלבון (g)</div>
            <Input type="number" value={protInput} onChange={e => setProtInput(e.target.value)} />
          </div>
        </div>
        <Btn variant="green" style={{ width: '100%' }} onClick={() => setGoals({ calories: parseInt(calInput), protein: parseInt(protInput) })}>
          💾 שמור
        </Btn>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardTitle>🗑️ אזור מסוכן</CardTitle>
        <Btn variant="danger" style={{ width: '100%' }} onClick={() => { if (confirm('למחוק הכל? לא ניתן לשחזר!')) clearAll() }}>
          מחק את כל הנתונים
        </Btn>
      </Card>
    </div>
  )
}
