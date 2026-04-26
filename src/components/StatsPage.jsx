import React, { useMemo, useState, useRef, useEffect } from 'react'
import { Card, CardTitle, Btn, Input } from './ui.jsx'

const todayKey = () => new Date().toISOString().split('T')[0]

// ── Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data, goal, color = '#6c63ff' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const vals = data.map(d => d.value)
    const maxVal = Math.max(...vals, goal || 1) * 1.15
    const pad = { l: 4, r: 4, t: 8, b: 28 }
    const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b
    const barW = (cW / data.length) * 0.7
    const gap   = (cW / data.length) * 0.3

    // Goal line
    if (goal) {
      const gy = pad.t + (1 - goal / maxVal) * cH
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy)
      ctx.strokeStyle = 'rgba(255,101,132,.5)'; ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])
    }

    data.forEach((d, i) => {
      const x = pad.l + i * (cW / data.length) + gap / 2
      const barH = (d.value / maxVal) * cH
      const y = pad.t + cH - barH
      const isToday = d.label === 'היום'
      const over = goal && d.value > goal

      // Bar
      const grad = ctx.createLinearGradient(0, y, 0, y + barH)
      grad.addColorStop(0, over ? '#ff6584' : color)
      grad.addColorStop(1, over ? 'rgba(255,101,132,.3)' : color + '55')
      ctx.fillStyle = grad
      const r = Math.min(4, barW / 2)
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, [r, r, 0, 0])
      ctx.fill()

      // Today highlight
      if (isToday) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Label
      ctx.fillStyle = isToday ? '#eeeef5' : '#77778a'
      ctx.font = `${isToday ? 'bold ' : ''}9px "Heebo"`
      ctx.textAlign = 'center'
      ctx.fillText(d.label, x + barW / 2, H - 6)

      // Value on top
      if (d.value > 0) {
        ctx.fillStyle = isToday ? '#eeeef5' : '#77778a'
        ctx.font = '8px "Space Mono"'
        ctx.fillText(d.value > 999 ? Math.round(d.value/100)/10+'k' : d.value, x + barW / 2, y - 2)
      }
    })
  }, [data, goal, color])

  if (!data.length) return <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:13 }}>אין נתונים</div>
  return <canvas ref={canvasRef} style={{ width:'100%', height:140, display:'block' }} />
}

// ── Calories History ──────────────────────────────────────────────────────
function CaloriesHistory({ history, goal }) {
  const [range, setRange] = useState('week')

  const ranges = [
    { key:'week',   label:'שבוע', days:7  },
    { key:'month',  label:'חודש', days:30 },
    { key:'3month', label:'3 חודשים', days:90 },
    { key:'all',    label:'הכל', days:3650 },
  ]

  const data = useMemo(() => {
    const days = ranges.find(r => r.key === range)?.days || 7
    const result = []
    const now = new Date()

    // For week/month show individual days; for 3m/all show weekly averages
    if (days <= 30) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        const dayData = history[key]
        const cals = dayData?.meals?.reduce((a, m) => a + (m.calories || 0), 0) || 0
        const isToday = i === 0
        const label = isToday ? 'היום'
          : days <= 7 ? ['א','ב','ג','ד','ה','ו','ש'][d.getDay()]
          : `${d.getDate()}/${d.getMonth()+1}`
        result.push({ label, value: cals, date: key })
      }
    } else {
      // Weekly buckets
      const weeks = Math.min(Math.ceil(days / 7), 52)
      for (let w = weeks - 1; w >= 0; w--) {
        let totalCals = 0, daysWithData = 0
        for (let d = 0; d < 7; d++) {
          const date = new Date(now)
          date.setDate(date.getDate() - (w * 7 + d))
          const key = date.toISOString().split('T')[0]
          const dayData = history[key]
          if (dayData?.meals?.length) {
            totalCals += dayData.meals.reduce((a, m) => a + (m.calories || 0), 0)
            daysWithData++
          }
        }
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - w * 7)
        const label = w === 0 ? 'השבוע' : `${weekStart.getDate()}/${weekStart.getMonth()+1}`
        result.push({ label, value: daysWithData ? Math.round(totalCals / daysWithData) : 0 })
      }
    }

    return result
  }, [history, range])

  const daysWithData = data.filter(d => d.value > 0)
  const avg = daysWithData.length ? Math.round(daysWithData.reduce((a, d) => a + d.value, 0) / daysWithData.length) : 0

  return (
    <Card>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <CardTitle style={{ margin:0 }}>📊 היסטוריית קלוריות</CardTitle>
        <div style={{ display:'flex', gap:4 }}>
          {ranges.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)} style={{
              padding:'4px 8px', borderRadius:8, fontSize:10, fontWeight:700, fontFamily:'var(--font)',
              cursor:'pointer', border:'none',
              background: range === r.key ? 'var(--accent)' : 'var(--surface)',
              color: range === r.key ? '#fff' : 'var(--muted)',
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      <BarChart data={data} goal={goal} color="#6c63ff" />

      <div style={{ display:'flex', justifyContent:'space-around', marginTop:8, padding:'8px 0', borderTop:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:700, color:'var(--accent)' }}>{avg}</div>
          <div style={{ fontSize:10, color:'var(--muted)' }}>ממוצע יומי</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:700, color:'var(--green)' }}>{goal}</div>
          <div style={{ fontSize:10, color:'var(--muted)' }}>יעד יומי</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:700, color: avg > goal ? 'var(--accent2)' : 'var(--green)' }}>
            {avg > goal ? `+${avg - goal}` : avg ? `-${goal - avg}` : '—'}
          </div>
          <div style={{ fontSize:10, color:'var(--muted)' }}>הפרש ממוצע</div>
        </div>
      </div>
    </Card>
  )
}

// ── Stats Page ────────────────────────────────────────────────────────────
export default function StatsPage({ store }) {
  const { state, setGoals, clearAll } = store
  const { history, goals } = state

  const [calInput,  setCalInput]  = useState(goals.calories)
  const [protInput, setProtInput] = useState(goals.protein)

  const stats = useMemo(() => {
    const days = Object.values(history).filter(d => d.meals?.length)
    const totalCals  = days.reduce((a, d) => a + d.meals.reduce((b, m) => b + (m.calories||0), 0), 0)
    const totalProt  = days.reduce((a, d) => a + d.meals.reduce((b, m) => b + (m.protein||0),  0), 0)
    const totalMeals = days.reduce((a, d) => a + d.meals.length, 0)

    const wEntries = Object.entries(history).filter(([,d])=>d.weight).sort((a,b)=>a[0].localeCompare(b[0]))
    const wDelta = wEntries.length >= 2
      ? (wEntries[0][1].weight - wEntries[wEntries.length-1][1].weight).toFixed(1)
      : null

    let streak = 0
    const d = new Date()
    for (let i = 0; i < 365; i++) {
      const k = d.toISOString().split('T')[0]
      if (history[k]?.meals?.length) { streak++; d.setDate(d.getDate()-1) } else break
    }

    return {
      avgCal: days.length ? Math.round(totalCals / days.length) : null,
      avgProt: days.length ? Math.round(totalProt / days.length) : null,
      totalMeals, wDelta, streak, daysLogged: days.length,
    }
  }, [history])

  return (
    <div style={{ padding:'12px 16px 0' }}>

      {/* Streak */}
      <div style={{ background:'linear-gradient(135deg,rgba(108,99,255,.18),rgba(255,101,132,.12))', border:'1px solid rgba(108,99,255,.3)', borderRadius:'var(--radius)', padding:'20px', textAlign:'center', marginBottom:12 }}>
        <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>רצף מעקב</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:60, fontWeight:700, background:'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>
          {stats.streak}
        </div>
        <div style={{ fontSize:14, color:'var(--muted)', marginTop:4 }}>ימים ברצף 🔥</div>
      </div>

      {/* Quick stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        {[
          { label:'ממוצע קלוריות', val:stats.avgCal, unit:'קל׳/יום', color:'var(--accent)' },
          { label:'ממוצע חלבון',   val:stats.avgProt, unit:'g/יום',   color:'#6c63ff' },
          { label:'ימים שנרשמו',   val:stats.daysLogged, unit:'ימים', color:'var(--orange)' },
          { label:'ארוחות שנרשמו', val:stats.totalMeals, unit:'ארוחות', color:'var(--green)' },
        ].map(({ label, val, unit, color }) => (
          <div key={label} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px' }}>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:.5 }}>{label}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:26, fontWeight:700, color }}>{val ?? '—'}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Weight delta */}
      {stats.wDelta !== null && (
        <Card style={{ textAlign:'center' }}>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>שינוי משקל כולל</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:36, fontWeight:700, color: parseFloat(stats.wDelta) > 0 ? 'var(--green)' : 'var(--accent2)' }}>
            {parseFloat(stats.wDelta) > 0 ? `-${stats.wDelta}` : `+${Math.abs(parseFloat(stats.wDelta))}`} ק"ג
          </div>
        </Card>
      )}

      {/* Calories history chart */}
      <CaloriesHistory history={history} goal={goals.calories} />

      {/* Goals */}
      <Card>
        <CardTitle>⚙️ יעדים יומיים</CardTitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4 }}>קלוריות</div>
            <Input type="number" value={calInput} onChange={e => setCalInput(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4 }}>חלבון (g)</div>
            <Input type="number" value={protInput} onChange={e => setProtInput(e.target.value)} />
          </div>
        </div>
        <Btn variant="green" style={{ width:'100%' }} onClick={() => setGoals({ calories:parseInt(calInput), protein:parseInt(protInput) })}>
          💾 שמור
        </Btn>
      </Card>

      {/* Backup */}
      <Card>
        <CardTitle>💾 גיבוי ושחזור</CardTitle>
        <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>ייצא/ייבא נתונים — להעברה בין מכשירים</div>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <Btn variant="outline" style={{ flex:1 }} onClick={() => {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `nutritrack-${new Date().toISOString().split('T')[0]}.json`
            a.click()
          }}>📤 ייצא</Btn>
          <label style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, borderRadius:10, padding:'10px 16px', background:'transparent', border:'1px solid var(--border)', color:'var(--text)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>
            📥 ייבא
            <input type="file" accept=".json" style={{ display:'none' }} onChange={e => {
              const file = e.target.files[0]; if (!file) return
              const reader = new FileReader()
              reader.onload = ev => {
                try {
                  const parsed = JSON.parse(ev.target.result)
                  if (parsed.history && parsed.goals) {
                    if (confirm('לשחזר נתונים? הנתונים הנוכחיים יוחלפו!')) {
                      localStorage.setItem('nutritrack_v3', JSON.stringify(parsed))
                      window.location.reload()
                    }
                  } else alert('קובץ לא תקין')
                } catch { alert('שגיאה בקריאת הקובץ') }
              }
              reader.readAsText(file); e.target.value = ''
            }} />
          </label>
        </div>
        <div style={{ fontSize:11, color:'var(--muted)', background:'rgba(61,232,132,.07)', border:'1px solid rgba(61,232,132,.2)', borderRadius:8, padding:'8px 12px' }}>
          💡 העברה לטלפון חדש: ייצא כאן → שלח לעצמך ב-WhatsApp → פתח באתר בטלפון החדש → ייבא
        </div>
      </Card>

      {/* Danger */}
      <Card>
        <CardTitle>🗑️ אזור מסוכן</CardTitle>
        <Btn variant="danger" style={{ width:'100%' }} onClick={() => { if (confirm('למחוק הכל?')) clearAll() }}>
          מחק את כל הנתונים
        </Btn>
      </Card>
    </div>
  )
}
