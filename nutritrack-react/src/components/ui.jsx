import React from 'react'

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px',
      marginBottom: '12px',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── CardTitle ─────────────────────────────────────────────────────────────
export function CardTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────
export function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        color: 'var(--text)',
        fontSize: 14,
        fontFamily: 'var(--font)',
        outline: 'none',
        width: '100%',
        transition: 'border-color .2s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────
export function Select({ style, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        color: 'var(--text)',
        fontSize: 14,
        fontFamily: 'var(--font)',
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </select>
  )
}

// ── Btn ───────────────────────────────────────────────────────────────────
const btnVariants = {
  primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
  green:   { background: 'linear-gradient(135deg,#3de884,#38f9d7)', color: '#051a0e', border: 'none' },
  photo:   { background: 'rgba(255,101,132,.15)', border: '1px solid rgba(255,101,132,.3)', color: 'var(--accent2)' },
  outline: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' },
  danger:  { background: 'transparent', border: '1px solid rgba(255,101,132,.4)', color: 'var(--accent2)' },
  ghost:   { background: 'transparent', border: 'none', color: 'var(--muted)' },
}

export function Btn({ variant = 'primary', style, children, ...props }) {
  return (
    <button
      {...props}
      style={{
        ...btnVariants[variant],
        borderRadius: 10,
        padding: '10px 16px',
        fontFamily: 'var(--font)',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        transition: 'opacity .15s, transform .15s',
        ...style,
      }}
      onMouseDown={e => e.currentTarget.style.opacity = '.8'}
      onMouseUp={e => e.currentTarget.style.opacity = '1'}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(.97)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  )
}

// ── Tip ───────────────────────────────────────────────────────────────────
export function Tip({ children }) {
  return (
    <div style={{
      background: 'rgba(67,233,123,.07)',
      border: '1px solid rgba(67,233,123,.2)',
      borderRadius: 10, padding: '8px 12px',
      fontSize: 12, color: 'var(--muted)',
      marginBottom: 10, display: 'flex', gap: 8,
    }}>
      <span>💡</span>
      <span>{children}</span>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: '2px solid rgba(108,99,255,.3)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin .7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── MacroRow ──────────────────────────────────────────────────────────────
export function MacroRow({ label, value, color, pct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--muted)', width: 52, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .6s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, width: 44, textAlign: 'left', flexShrink: 0 }}>{value}</span>
    </div>
  )
}

// ── Modal backdrop ────────────────────────────────────────────────────────
export function Modal({ onClose, children }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 400,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn .2s ease',
      }}
    >
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 36px',
        width: '100%', maxWidth: 480,
        animation: 'slideUp .3s ease',
      }}>
        {children}
      </div>
    </div>
  )
}

// ── Pill badge ────────────────────────────────────────────────────────────
const pillColors = {
  breakfast: ['rgba(247,151,30,.15)', '#f7971e'],
  lunch:     ['rgba(67,233,123,.15)', '#3de884'],
  dinner:    ['rgba(108,99,255,.15)', '#6c63ff'],
  snack:     ['rgba(255,101,132,.15)', '#ff6584'],
}
const pillNames = { breakfast: 'בוקר', lunch: 'צהריים', dinner: 'ערב', snack: 'חטיף' }

export function MealTimePill({ time }) {
  const [bg, color] = pillColors[time] || pillColors.snack
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: bg, color }}>
      {pillNames[time] || time}
    </span>
  )
}
