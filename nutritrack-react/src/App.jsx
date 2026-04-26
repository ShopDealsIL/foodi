import React, { useState } from 'react'
import { useStore } from './useStore.js'
import TodayPage   from './components/TodayPage.jsx'
import WeightPage  from './components/WeightPage.jsx'
import WorkoutPage from './components/WorkoutPage.jsx'
import StatsPage   from './components/StatsPage.jsx'

const PAGES = ['today','weight','workout','stats']

const NavIcon = ({ page, active }) => {
  const icons = {
    today:   <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>,
    weight:  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>,
    workout: <><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></>,
    stats:   <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
  }
  const labels = { today: 'היום', weight: 'משקל', workout: 'אימון', stats: 'סטטס' }
  return (
    <svg fill="none" stroke={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth="1.8" viewBox="0 0 24 24" width="22" height="22">
      {icons[page]}
    </svg>
  )
}

export default function App() {
  const [page, setPage] = useState('today')
  const store = useStore()

  const todayDate = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 25% 15%,rgba(108,99,255,.1) 0%,transparent 55%), radial-gradient(ellipse at 75% 85%,rgba(255,101,132,.07) 0%,transparent 55%)'
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NutriTrack
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 20 }}>
          {todayDate}
        </div>
      </div>

      {/* Page area */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 2 }}>
        {page === 'today'   && <TodayPage   store={store} />}
        {page === 'weight'  && <WeightPage  store={store} />}
        {page === 'workout' && <WorkoutPage store={store} />}
        {page === 'stats'   && <StatsPage   store={store} />}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'relative', zIndex: 10, flexShrink: 0,
        display: 'flex',
        background: 'rgba(17,17,24,.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {PAGES.map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              flex: 1, padding: '10px 8px 8px',
              background: 'none', border: 'none',
              color: p === page ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              fontFamily: 'var(--font)', fontSize: 10, fontWeight: 600,
              transition: 'color .2s',
            }}
          >
            <NavIcon page={p} active={p === page} />
            {{ today:'היום', weight:'משקל', workout:'אימון', stats:'סטטס' }[p]}
          </button>
        ))}
      </nav>
    </div>
  )
}
