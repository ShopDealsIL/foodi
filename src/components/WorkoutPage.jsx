import React, { useState } from 'react'
import { Card, CardTitle, Btn, Input, Select } from './ui.jsx'

const DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
const todayDow = new Date().getDay()

export default function WorkoutPage({ store }) {
  const { state, toggleExercise, addExercise, deleteExercise } = store
  const { workout } = state
  const [expanded, setExpanded] = useState(todayDow)
  const [newEx, setNewEx] = useState({ name: '', sets: '', reps: '' })
  const [addingTo, setAddingTo] = useState(null)

  const handleAddEx = (dayIdx) => {
    if (!newEx.name.trim()) return
    addExercise(dayIdx, { name: newEx.name, sets: parseInt(newEx.sets) || 3, reps: newEx.reps || '10' })
    setNewEx({ name: '', sets: '', reps: '' })
    setAddingTo(null)
  }

  return (
    <div style={{ padding: '12px 16px 0' }}>
      {workout.days.map((day, di) => {
        const isToday = di === todayDow
        const doneCount = day.exercises.filter(e => e.done).length
        const isOpen = expanded === di

        return (
          <div key={day.name} style={{
            background: 'var(--card)',
            border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            marginBottom: 10,
            overflow: 'hidden',
            ...(isToday ? { background: 'rgba(108,99,255,.04)' } : {}),
          }}>
            {/* Day header */}
            <div
              onClick={() => setExpanded(isOpen ? null : di)}
              style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', gap: 10 }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>
                  {day.name}
                  {isToday && <span style={{ fontSize: 11, color: 'var(--accent)', marginRight: 8 }}>• היום</span>}
                </div>
                {day.exercises.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {doneCount}/{day.exercises.length} הושלמו
                  </div>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(108,99,255,.12)', color: 'var(--accent)' }}>
                {day.focus}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 18 }}>{isOpen ? '↑' : '↓'}</span>
            </div>

            {/* Exercises */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '4px 16px 14px' }}>
                {!day.exercises.length && (
                  <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>יום מנוחה 😴</div>
                )}
                {day.exercises.map((ex, ei) => (
                  <div key={ei} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                    <div
                      onClick={() => toggleExercise(di, ei)}
                      style={{
                        width: 24, height: 24, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                        border: ex.done ? 'none' : '2px solid var(--border)',
                        background: ex.done ? 'var(--green)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#051a0e', fontSize: 14, fontWeight: 700,
                        transition: 'all .2s',
                      }}
                    >
                      {ex.done ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, textDecoration: ex.done ? 'line-through' : 'none', color: ex.done ? 'var(--muted)' : 'var(--text)' }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ex.sets} סטים × {ex.reps}</div>
                    </div>
                    <button onClick={() => deleteExercise(di, ei)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', padding: '2px 4px' }}>×</button>
                  </div>
                ))}

                {/* Progress bar */}
                {day.exercises.length > 0 && (
                  <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${doneCount / day.exercises.length * 100}%`, background: 'var(--green)', borderRadius: 2, transition: 'width .4s ease' }} />
                  </div>
                )}

                {/* Add exercise */}
                {addingTo === di ? (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Input placeholder="שם התרגיל" value={newEx.name} onChange={e => setNewEx(v => ({ ...v, name: e.target.value }))} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Input type="number" placeholder="סטים" value={newEx.sets} onChange={e => setNewEx(v => ({ ...v, sets: e.target.value }))} style={{ width: 80 }} />
                      <Input placeholder="חזרות / זמן" value={newEx.reps} onChange={e => setNewEx(v => ({ ...v, reps: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn variant="green" style={{ flex: 1 }} onClick={() => handleAddEx(di)}>הוסף</Btn>
                      <Btn variant="outline" style={{ flex: 1 }} onClick={() => setAddingTo(null)}>בטל</Btn>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(di)}
                    style={{ marginTop: 10, width: '100%', background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}
                  >
                    + הוסף תרגיל
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
