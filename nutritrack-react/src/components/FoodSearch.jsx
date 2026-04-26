import React, { useState, useRef, useEffect, useCallback } from 'react'
import { searchFoods, calcMacros } from '../data/foods.js'
import { Card, CardTitle, Btn, Input, Select, Modal, Tip, Spinner, MealTimePill } from './ui.jsx'

// ── Qty Modal ─────────────────────────────────────────────────────────────
function QtyModal({ food, onConfirm, onClose }) {
  const isItem = food.unit === 'item'
  const [qty, setQty] = useState(isItem ? 1 : 100)
  const macros = calcMacros(food, qty)

  const change = (d) => setQty(q => Math.max(isItem ? 0.5 : 10, q + d))

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 20, marginBottom: 2 }}>{food.emoji} <strong>{food.name}</strong></div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
        {isItem ? `לפריט (${food.unitGrams}g)` : 'ל-100 גרם'}
      </div>

      {/* Qty control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button onClick={() => change(isItem ? -1 : -10)} style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 22, cursor: 'pointer' }}>−</button>
        <input
          type="number" value={qty}
          onChange={e => setQty(parseFloat(e.target.value) || 0)}
          style={{ flex: 1, textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 10, color: 'var(--text)', fontSize: 20, fontFamily: 'var(--mono)', fontWeight: 700 }}
        />
        <span style={{ color: 'var(--muted)', fontSize: 13, minWidth: 32 }}>{isItem ? 'יח׳' : 'g'}</span>
        <button onClick={() => change(isItem ? 1 : 10)} style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 22, cursor: 'pointer' }}>+</button>
      </div>

      {/* Macro preview */}
      <div style={{ background: 'rgba(108,99,255,.08)', border: '1px solid rgba(108,99,255,.2)', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
        {[
          ['🔥', macros.calories, 'קל׳', 'var(--accent)'],
          ['💪', macros.protein + 'g', 'חלבון', '#6c63ff'],
          ['🌾', macros.carbs + 'g', 'פחמ׳', 'var(--orange)'],
          ['🧈', macros.fat + 'g', 'שומן', 'var(--green)'],
        ].map(([icon, val, label, color]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="green" style={{ flex: 1 }} onClick={() => onConfirm(food, qty, macros)}>✓ הוסף</Btn>
        <Btn variant="outline" style={{ flex: 1 }} onClick={onClose}>בטל</Btn>
      </div>
    </Modal>
  )
}

// ── Manual Entry ──────────────────────────────────────────────────────────
function ManualModal({ name, onConfirm, onClose }) {
  const [vals, setVals] = useState({ calories: '', protein: '', carbs: '', fat: '' })
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }))
  const confirm = () => onConfirm({
    name, emoji: '🍽️',
    calories: parseInt(vals.calories) || 0,
    protein:  parseFloat(vals.protein) || 0,
    carbs:    parseFloat(vals.carbs) || 0,
    fat:      parseFloat(vals.fat) || 0,
  })

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>הכנסה ידנית</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>🍽️ {name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[['calories','קלוריות'],['protein','חלבון (g)'],['carbs','פחמימות (g)'],['fat','שומן (g)']].map(([k, label]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
            <Input type="number" placeholder="0" value={vals[k]} onChange={set(k)} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="green" style={{ flex: 1 }} onClick={confirm}>✓ הוסף</Btn>
        <Btn variant="outline" style={{ flex: 1 }} onClick={onClose}>בטל</Btn>
      </div>
    </Modal>
  )
}

// ── Barcode Scanner ───────────────────────────────────────────────────────
function BarcodeModal({ onFound, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const [status, setStatus] = useState('starting') // starting | scanning | found | error | manual
  const [found, setFound] = useState(null)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStatus('scanning')
      startDetection()
    } catch {
      setStatus('error')
    }
  }

  function stopCamera() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }

  function startDetection() {
    if (!('BarcodeDetector' in window)) { setStatus('manual'); return }
    const detector = new BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128'] })
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes.length) {
          clearInterval(intervalRef.current)
          await lookupBarcode(codes[0].rawValue)
        }
      } catch {}
    }, 400)
  }

  async function lookupBarcode(code) {
    setStatus('loading')
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
      const data = await res.json()
      if (data.status !== 1 || !data.product) { setStatus('notfound'); return }
      const p = data.product
      const n = p.nutriments || {}
      const item = {
        name: p.product_name_he || p.product_name || p.product_name_en || 'מוצר',
        emoji: '📦',
        calories: Math.round(n['energy-kcal_100g'] || 0),
        protein:  Math.round((n['proteins_100g'] || 0) * 10) / 10,
        carbs:    Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
        fat:      Math.round((n['fat_100g'] || 0) * 10) / 10,
        note: p.brands || '',
      }
      setFound(item)
      setStatus('found')
    } catch { setStatus('error') }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px', background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        <span style={{ color: '#fff', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 700 }}>סרוק ברקוד</span>
      </div>

      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* Frame overlay */}
      {status === 'scanning' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 260, height: 160, border: '3px solid var(--accent)', borderRadius: 16, boxShadow: '0 0 0 9999px rgba(0,0,0,.5)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'var(--accent2)', animation: 'scanLine 2s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      {/* Bottom sheet */}
      {status === 'loading' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card)', padding: 20, borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)' }}>
            <Spinner /> מחפש מוצר...
          </div>
        </div>
      )}

      {status === 'found' && found && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card)', padding: 20, borderRadius: '20px 20px 0 0', animation: 'slideUp .3s ease' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>📦 {found.name}</div>
          {found.note && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{found.note}</div>}
          <div style={{ display: 'flex', gap: 12, fontSize: 13, marginBottom: 14, flexWrap: 'wrap' }}>
            <span>🔥 <strong style={{ color: 'var(--accent)' }}>{found.calories}</strong> קל׳/100g</span>
            <span>💪 <strong>{found.protein}g</strong> חלבון</span>
            <span>🌾 <strong>{found.carbs}g</strong> פחמ׳</span>
            <span>🧈 <strong>{found.fat}g</strong> שומן</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="green" style={{ flex: 1 }} onClick={() => { stopCamera(); onFound(found) }}>✓ הוסף</Btn>
            <Btn variant="outline" style={{ flex: 1 }} onClick={onClose}>בטל</Btn>
          </div>
        </div>
      )}

      {(status === 'notfound' || status === 'error') && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card)', padding: 20, borderRadius: '20px 20px 0 0' }}>
          <div style={{ color: 'var(--accent2)', marginBottom: 10 }}>❌ {status === 'notfound' ? 'מוצר לא נמצא' : 'שגיאה. בדוק חיבור לאינטרנט'}</div>
          <Btn variant="outline" style={{ width: '100%' }} onClick={() => { setStatus('scanning'); startDetection() }}>נסה שנית</Btn>
        </div>
      )}

      {status === 'manual' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card)', padding: 20, borderRadius: '20px 20px 0 0' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>הדפדפן לא תומך בסריקה אוטומטית. הכנס ברקוד ידנית:</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input type="number" placeholder="מספר ברקוד..." value={manualCode} onChange={e => setManualCode(e.target.value)} />
            <Btn onClick={() => lookupBarcode(manualCode)}>חפש</Btn>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card)', padding: 20, borderRadius: '20px 20px 0 0' }}>
          <div style={{ color: 'var(--accent2)', marginBottom: 12 }}>⚠️ לא ניתן לגשת למצלמה. בדוק הרשאות.</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>הכנס ברקוד ידנית:</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input type="number" placeholder="מספר ברקוד..." value={manualCode} onChange={e => setManualCode(e.target.value)} />
            <Btn onClick={() => lookupBarcode(manualCode)}>חפש</Btn>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main FoodSearch Component ─────────────────────────────────────────────
export default function FoodSearch({ onAdd, onSaveFavourite }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [mealTime, setMealTime] = useState('lunch')
  const [qtyFood, setQtyFood] = useState(null)   // food awaiting qty selection
  const [manualName, setManualName] = useState(null)
  const [showBarcode, setShowBarcode] = useState(false)
  const [barcodeFood, setBarcodeFood] = useState(null) // barcode result awaiting qty
  const inputRef = useRef(null)

  // Photo handler
  const handlePhoto = useCallback(async (file) => {
    if (!file) return
    // Compress to JPEG
    const dataUrl = await new Promise(resolve => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        const max = 1024
        if (w > max || h > max) { if (w > h) { h = Math.round(h * max / w); w = max } else { w = Math.round(w * max / h); h = max } }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
      img.src = url
    })
    if (!dataUrl) return
    const base64 = dataUrl.split(',')[1]
    // Call Anthropic API for photo recognition
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: 'אתה מזהה אוכל בתמונות. החזר JSON בלבד: {"name":"שם בעברית","emoji":"אמוג\'י","calories":0,"protein":0,"carbs":0,"fat":0}',
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
            { type: 'text', text: 'מה האוכל בתמונה? החזר JSON בלבד.' }
          ]}]
        })
      })
      const data = await res.json()
      const text = data.content?.map(i => i.text || '').join('') || ''
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      if (parsed.name) onAdd({ ...parsed, time: mealTime })
    } catch (e) {
      alert('לא הצלחתי לזהות. נסה ידנית.')
    }
  }, [mealTime, onAdd])

  const handleQtyConfirm = useCallback((food, qty, macros) => {
    const qtyLabel = food.unit === 'item' ? `×${qty}` : `${qty}g`
    onAdd({ name: `${food.name} (${qtyLabel})`, emoji: food.emoji, ...macros, time: mealTime })
    setQtyFood(null)
    setQuery('')
    setResults([])
  }, [mealTime, onAdd])

  const handleBarcodeFound = useCallback((food) => {
    setShowBarcode(false)
    setBarcodeFood(food) // open qty for barcode item
  }, [])

  const handleBarcodQtyConfirm = useCallback((_, qty, macros) => {
    const qtyLabel = `${qty}g`
    onAdd({ name: `${barcodeFood.name} (${qtyLabel})`, emoji: '📦', ...macros, time: mealTime })
    setBarcodeFood(null)
  }, [barcodeFood, mealTime, onAdd])

  return (
    <Card>
      <CardTitle>✍️ הוסף ארוחה</CardTitle>
      <Tip>הקלד שם מאכל ובחר מהרשימה — או סרוק ברקוד</Tip>

      {/* Search row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setResults(searchFoods(e.target.value)) }}
            onKeyDown={e => { if (e.key === 'Enter' && !results.length && query) setManualName(query) }}
            placeholder='חפש: "שקדים", "חזה עוף"...'
          />
          {/* Dropdown */}
          {results.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0, left: 0,
              background: 'var(--card2)', border: '1px solid var(--accent)',
              borderRadius: 12, zIndex: 50, maxHeight: 240, overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,.5)',
            }}>
              {results.map((f) => (
                <div
                  key={f.name}
                  onClick={() => { setQtyFood(f); setResults([]); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 20 }}>{f.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>💪{f.prot100}g · 🌾{f.carb100}g · 🧈{f.fat100}g {f.unit === 'item' ? 'לפריט' : 'ל-100g'}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{f.cal100}</span>
                </div>
              ))}
              {/* Manual entry option */}
              <div
                onClick={() => { setManualName(query); setResults([]) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', color: 'var(--muted)', fontSize: 13 }}
              >
                ✏️ הכנס ידנית: "{query}"
              </div>
            </div>
          )}
        </div>
        {/* Barcode btn */}
        <Btn variant="outline" onClick={() => setShowBarcode(true)} style={{ padding: '10px 14px', flexShrink: 0 }} title="סרוק ברקוד">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="5" width="2" height="14"/><rect x="6" y="5" width="1" height="14"/>
            <rect x="9" y="5" width="2" height="14"/><rect x="13" y="5" width="1" height="14"/>
            <rect x="16" y="5" width="3" height="14"/><rect x="21" y="5" width="1" height="14"/>
          </svg>
        </Btn>
      </div>

      {/* Meal time + photo row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Select value={mealTime} onChange={e => setMealTime(e.target.value)} style={{ flex: 'none', width: 130 }}>
          <option value="breakfast">☀️ בוקר</option>
          <option value="lunch">🌤️ צהריים</option>
          <option value="dinner">🌙 ערב</option>
          <option value="snack">🍎 חטיף</option>
        </Select>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, padding: '10px 14px', background: 'rgba(255,101,132,.12)', border: '1px solid rgba(255,101,132,.3)', color: 'var(--accent2)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          📷 צלם
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handlePhoto(e.target.files[0])} />
        </label>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, padding: '10px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          🖼️ גלריה
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhoto(e.target.files[0])} />
        </label>
      </div>

      {/* Modals */}
      {qtyFood && <QtyModal food={qtyFood} onConfirm={handleQtyConfirm} onClose={() => setQtyFood(null)} />}
      {manualName && <ManualModal name={manualName} onConfirm={meal => { onAdd({ ...meal, time: mealTime }); setManualName(null); setQuery('') }} onClose={() => setManualName(null)} />}
      {showBarcode && <BarcodeModal onFound={handleBarcodeFound} onClose={() => setShowBarcode(false)} />}
      {barcodeFood && (
        <QtyModal
          food={{ ...barcodeFood, cal100: barcodeFood.calories, prot100: barcodeFood.protein, carb100: barcodeFood.carbs, fat100: barcodeFood.fat, unit: 'g', unitGrams: 100 }}
          onConfirm={handleBarcodQtyConfirm}
          onClose={() => setBarcodeFood(null)}
        />
      )}
    </Card>
  )
}
