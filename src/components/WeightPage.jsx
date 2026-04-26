import React, { useState, useRef, useEffect } from 'react'
import { Card, CardTitle, Btn, Input } from './ui.jsx'

// ── BMI Calculator ────────────────────────────────────────────────────────
function BMICard({ weight, height, onSetHeight }) {
  const [inputH, setInputH] = useState(height || '')

  const bmi = weight && height ? weight / ((height / 100) ** 2) : null
  const bmiInfo = bmi === null ? null
    : bmi < 18.5 ? { label: 'תת-משקל', color: '#60bfff', range: '< 18.5' }
    : bmi < 25   ? { label: 'משקל תקין', color: 'var(--green)', range: '18.5 – 24.9' }
    : bmi < 30   ? { label: 'עודף משקל', color: 'var(--orange)', range: '25 – 29.9' }
    : bmi < 35   ? { label: 'השמנה דרגה 1', color: '#ff9f43', range: '30 – 34.9' }
    :              { label: 'השמנה דרגה 2+', color: 'var(--accent2)', range: '≥ 35' }

  // BMI scale segments
  const segments = [
    { label: 'תת', color: '#60bfff', from: 10, to: 18.5 },
    { label: 'תקין', color: '#3de884', from: 18.5, to: 25 },
    { label: 'עודף', color: '#f7971e', from: 25, to: 30 },
    { label: 'השמנה', color: '#ff6584', from: 30, to: 40 },
  ]
  const scaleMin = 10, scaleMax = 40
  const bmiPct = bmi ? Math.min(Math.max((bmi - scaleMin) / (scaleMax - scaleMin) * 100, 0), 100) : null

  return (
    <Card>
      <CardTitle>📏 BMI — מדד מסת הגוף</CardTitle>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Input
          type="number" placeholder="גובה (ס״מ)" value={inputH}
          onChange={e => setInputH(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSetHeight(parseFloat(inputH))}
          style={{ flex: 1 }}
        />
        <Btn onClick={() => onSetHeight(parseFloat(inputH))} style={{ flexShrink: 0 }}>שמור</Btn>
      </div>

      {bmi && bmiInfo ? (
        <>
          {/* BMI number */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 700, color: bmiInfo.color, lineHeight: 1 }}>
              {bmi.toFixed(1)}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: bmiInfo.color }}>{bmiInfo.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bmiInfo.range}</div>
            </div>
          </div>

          {/* Scale bar */}
          <div style={{ position: 'relative', marginBottom: 4 }}>
            <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
              {segments.map(s => (
                <div key={s.label} style={{ flex: s.to - s.from, background: s.color, opacity: 0.5 }} />
              ))}
            </div>
            {/* Indicator */}
            {bmiPct !== null && (
              <div style={{
                position: 'absolute', top: -3, left: `${bmiPct}%`,
                transform: 'translateX(-50%)',
                width: 16, height: 16, borderRadius: '50%',
                background: bmiInfo.color, border: '3px solid var(--bg)',
                boxShadow: `0 0 8px ${bmiInfo.color}`,
              }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>
              {segments.map(s => <span key={s.label}>{s.label}</span>)}
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, background: 'var(--surface)', borderRadius: 8, padding: '8px 10px' }}>
            {weight}kg ÷ ({height}cm)² = BMI {bmi.toFixed(1)}
            {bmiInfo.label === 'משקל תקין' && ' ✅ כל הכבוד!'}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--muted)', fontSize: 13 }}>
          {weight ? 'הכנס גובה לחישוב BMI' : 'הוסף מדידת משקל לחישוב BMI'}
        </div>
      )}
    </Card>
  )
}

// ── Weight Chart ──────────────────────────────────────────────────────────
function WeightChart({ log }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || log.length < 2) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const vals = log.map(d => d.weight)
    const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1
    const pad = { l: 8, r: 8, t: 10, b: 24 }
    const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b

    const x = i => pad.l + (i / (log.length - 1)) * cW
    const y = v => pad.t + (1 - (v - min) / (max - min)) * cH

    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH)
    grad.addColorStop(0, 'rgba(61,232,132,.28)')
    grad.addColorStop(1, 'rgba(61,232,132,0)')

    ctx.beginPath()
    ctx.moveTo(x(0), y(vals[0]))
    for (let i = 1; i < log.length; i++) {
      const mx = (x(i-1)+x(i))/2
      ctx.bezierCurveTo(mx, y(vals[i-1]), mx, y(vals[i]), x(i), y(vals[i]))
    }
    ctx.lineTo(x(log.length-1), pad.t+cH); ctx.lineTo(x(0), pad.t+cH); ctx.closePath()
    ctx.fillStyle = grad; ctx.fill()

    ctx.beginPath(); ctx.moveTo(x(0), y(vals[0]))
    for (let i = 1; i < log.length; i++) {
      const mx = (x(i-1)+x(i))/2
      ctx.bezierCurveTo(mx, y(vals[i-1]), mx, y(vals[i]), x(i), y(vals[i]))
    }
    ctx.strokeStyle = '#3de884'; ctx.lineWidth = 2; ctx.stroke()

    ctx.fillStyle = '#77778a'; ctx.font = `10px "Space Mono"`; ctx.textAlign = 'center'
    const step = Math.ceil(log.length / 5)
    log.forEach((d, i) => {
      if (i % step === 0 || i === log.length - 1) {
        ctx.fillText(new Date(d.date).toLocaleDateString('he-IL', { day:'numeric', month:'short' }), x(i), H - 4)
      }
    })

    log.forEach((_, i) => {
      ctx.beginPath(); ctx.arc(x(i), y(vals[i]), 3.5, 0, Math.PI*2)
      ctx.fillStyle = '#3de884'; ctx.fill()
    })
  }, [log])

  if (log.length < 2) return (
    <div style={{ height: 120, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:13 }}>
      הוסף לפחות 2 מדידות לגרף
    </div>
  )
  return <canvas ref={canvasRef} style={{ width:'100%', height:120, display:'block' }} />
}

// ── Weight Page ───────────────────────────────────────────────────────────
export default function WeightPage({ store }) {
  const { weightLog, addWeight, state, setGoalWeight, update } = store
  const [input, setInput] = useState('')
  const [goalInput, setGoalInput] = useState(state.goalWeight || '')

  const current = weightLog.length ? weightLog[weightLog.length-1] : null
  const prev    = weightLog.length > 1 ? weightLog[weightLog.length-2] : null
  const diff    = current && prev ? (current.weight - prev.weight).toFixed(1) : null

  const firstWeight = weightLog.length ? weightLog[0].weight : null
  const goalPct = state.goalWeight && firstWeight && current
    ? Math.min(Math.abs(firstWeight - current.weight) / Math.abs(firstWeight - state.goalWeight) * 100, 100)
    : 0

  const handleAdd = () => {
    const val = parseFloat(input)
    if (!val || val < 20 || val > 400) return
    addWeight(val)
    setInput('')
  }

  const setHeight = (h) => {
    if (!h || h < 50 || h > 280) return
    update(prev => ({ ...prev, height: h }))
  }

  return (
    <div style={{ padding: '12px 16px 0' }}>
      {/* Current weight */}
      <Card>
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>משקל נוכחי</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 56, fontWeight: 700, background: 'linear-gradient(135deg,#3de884,#38f9d7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
            {current ? current.weight : '—'}
          </div>
          <div style={{ fontSize: 16, color: 'var(--muted)' }}>ק"ג</div>
          {diff !== null && (
            <div style={{ fontSize: 13, marginTop: 4, color: parseFloat(diff) < 0 ? 'var(--green)' : parseFloat(diff) > 0 ? 'var(--accent2)' : 'var(--muted)' }}>
              {parseFloat(diff) > 0 ? `↑ +${diff}` : parseFloat(diff) < 0 ? `↓ ${diff}` : '±0'} מהמדידה הקודמת
            </div>
          )}
        </div>
        <WeightChart log={weightLog.slice(-30)} />
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <Input type="number" step="0.1" placeholder="משקל היום (ק״ג)" value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleAdd()} />
          <Btn variant="green" onClick={handleAdd} style={{ flexShrink:0 }}>שמור</Btn>
        </div>
      </Card>

      {/* BMI */}
      <BMICard weight={current?.weight} height={state.height} onSetHeight={setHeight} />

      {/* Goal */}
      <Card>
        <CardTitle>🎯 יעד משקל</CardTitle>
        <div style={{ display:'flex', gap:8, marginBottom: state.goalWeight ? 12 : 0 }}>
          <Input type="number" step="0.1" placeholder="יעד (ק״ג)" value={goalInput} onChange={e => setGoalInput(e.target.value)} />
          <Btn onClick={() => setGoalWeight(parseFloat(goalInput))} style={{ flexShrink:0 }}>קבע</Btn>
        </div>
        {state.goalWeight && current && (
          <>
            <div style={{ fontSize:13, color:'var(--muted)', marginBottom:6 }}>
              יעד: <strong style={{color:'var(--text)'}}>{state.goalWeight} ק"ג</strong> · נשאר: <strong style={{color:'var(--accent)'}}>{Math.abs(current.weight - state.goalWeight).toFixed(1)} ק"ג</strong>
            </div>
            <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${goalPct}%`, background:'linear-gradient(90deg,#3de884,#38f9d7)', borderRadius:4, transition:'width .6s ease' }} />
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{Math.round(goalPct)}% מהדרך</div>
          </>
        )}
      </Card>

      {/* History */}
      <Card>
        <CardTitle>📅 היסטוריה</CardTitle>
        {!weightLog.length ? (
          <div style={{ textAlign:'center', padding:'16px 0', color:'var(--muted)', fontSize:13 }}>עדיין אין מדידות</div>
        ) : (
          [...weightLog].reverse().slice(0,14).map((entry, i, arr) => {
            const prevE = arr[i+1]
            const d = prevE ? (entry.weight - prevE.weight).toFixed(1) : null
            return (
              <div key={entry.date} style={{ display:'flex', alignItems:'center', padding:'8px 0', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize:12, color:'var(--muted)', flex:1 }}>
                  {new Date(entry.date).toLocaleDateString('he-IL', { weekday:'short', day:'numeric', month:'short' })}
                </div>
                {d !== null && (
                  <span style={{ fontSize:12, color: parseFloat(d)<0 ? 'var(--green)' : parseFloat(d)>0 ? 'var(--accent2)' : 'var(--muted)' }}>
                    {parseFloat(d)>0 ? `↑+${d}` : `↓${d}`}
                  </span>
                )}
                <div style={{ fontFamily:'var(--mono)', fontSize:15, fontWeight:700, color:'var(--green)', marginRight:8, marginLeft:8 }}>{entry.weight} ק"ג</div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
