'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '', password: '', username: '', phone: '',
    location: '', zodiac: 'Libra', inviteCode: ''
  })
  const router = useRouter()
  const supabase = createClient()

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.inviteCode !== process.env.NEXT_PUBLIC_INVITE_CODE) {
      setError('Incorrect invite code. Ask your friend for it.')
      setLoading(false)
      return
    }
    if (!form.phone.startsWith('+')) {
      setError('Phone must include country code, e.g. +12015551234')
      setLoading(false)
      return
    }

    // Geocode the city before creating account
    let lat = 40.7128, lon = -74.0060, locationName = form.location
    if (form.location) {
      try {
        const res = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: form.location })
        })
        const geo = await res.json()
        if (geo.lat) { lat = geo.lat; lon = geo.lon; locationName = geo.name }
      } catch {}
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${location.origin}/api/auth/callback`,
        data: {
          username: form.username,
          phone_number: form.phone,
          location_name: locationName,
          zodiac_sign: form.zodiac,
        }
      }
    })

    if (error) { setError(error.message); setLoading(false); return }

    setLoading(false)
    setError('Check your email to confirm your account, then come back to log in.')
    setMode('login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✦</div>
          <h1 className="font-display" style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Just Us
          </h1>
          <p style={{ color: 'var(--cream-muted)', fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            our private little world
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '12px', padding: '4px', marginBottom: '2rem' }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: mode === m ? 'var(--gold)' : 'transparent',
                color: mode === m ? 'var(--dark)' : 'var(--cream-muted)',
                fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem',
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}>{m === 'login' ? 'Sign In' : 'Create Account'}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <Input label="Email" type="email" value={form.email} onChange={v => update('email', v)} />
            <Input label="Password" type="password" value={form.password} onChange={v => update('password', v)} />

            {mode === 'signup' && <>
              <Input label="Your name (displayed to each other)" value={form.username} onChange={v => update('username', v)} />
              <Input label="WhatsApp number (with country code, e.g. +12015551234)" type="tel" value={form.phone} onChange={v => update('phone', v)} />
              <Input label="Your city (e.g. Newark, NJ)" value={form.location} onChange={v => update('location', v)} />
              <div>
                <label style={{ display: 'block', color: 'var(--cream-muted)', fontSize: '0.8rem', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                  Your zodiac sign
                </label>
                <select value={form.zodiac} onChange={e => update('zodiac', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--bronze)', borderRadius: '10px', color: 'var(--cream)', fontFamily: 'Outfit', fontSize: '0.9rem' }}>
                  {ZODIAC_SIGNS.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <Input label="Invite code (get this from your friend)" value={form.inviteCode} onChange={v => update('inviteCode', v)} />
            </>}

            {error && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(139,58,26,0.3)', border: '1px solid rgba(139,58,26,0.5)', color: '#f5a282', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                padding: '0.85rem', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'var(--bronze)' : 'var(--gold)',
                color: 'var(--dark)', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem',
                transition: 'all 0.2s', marginTop: '0.5rem',
              }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Input({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', color: 'var(--cream-muted)', fontSize: '0.8rem', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required
        style={{
          width: '100%', padding: '0.75rem 1rem', background: 'var(--surface)',
          border: '1px solid var(--bronze)', borderRadius: '10px', color: 'var(--cream)',
          fontFamily: 'Outfit', fontSize: '0.9rem',
        }} />
    </div>
  )
}
