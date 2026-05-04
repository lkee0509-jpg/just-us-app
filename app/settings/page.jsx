'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const ZODIAC = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

export default function SettingsPage() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ username: '', phone_number: '', location_name: '', zodiac_sign: 'Libra' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setForm({
          username: prof.username || '',
          phone_number: prof.phone_number || '',
          location_name: prof.location_name || '',
          zodiac_sign: prof.zodiac_sign || 'Libra',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setMessage({ text: '', type: '' })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Geocode location if it changed
    let lat = profile.location_lat
    let lon = profile.location_lon
    let locationName = form.location_name

    if (form.location_name !== profile.location_name) {
      try {
        const res = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: form.location_name })
        })
        const geo = await res.json()
        if (geo.lat) { lat = geo.lat; lon = geo.lon; locationName = geo.name }
        else { setMessage({ text: 'City not found. Try a different format (e.g. "Newark, NJ").', type: 'error' }); setSaving(false); return }
      } catch {
        setMessage({ text: 'Could not geocode that city. Check your location and try again.', type: 'error' })
        setSaving(false)
        return
      }
    }

    const { error } = await supabase.from('profiles').update({
      username: form.username,
      phone_number: form.phone_number,
      location_name: locationName,
      location_lat: lat,
      location_lon: lon,
      zodiac_sign: form.zodiac_sign,
    }).eq('id', user.id)

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({ text: 'Saved! Your settings have been updated.', type: 'success' })
      setProfile(p => ({ ...p, location_lat: lat, location_lon: lon, location_name: locationName }))
    }
    setSaving(false)
  }

  if (loading) return <LoadingScreen />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '80px', paddingBottom: '100px' }}>
      <Navbar username={profile?.username} />

      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--cream-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Update your info. Changes save to the app and affect your daily WhatsApp messages.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <Field label="Display name" hint="This is how you appear to each other">
              <Input value={form.username} onChange={v => update('username', v)} />
            </Field>

            <Field label="WhatsApp number" hint="Include country code, e.g. +12015551234">
              <Input type="tel" value={form.phone_number} onChange={v => update('phone_number', v)} />
            </Field>

            <Field label="Your city" hint="Used for your personalized morning weather. Type a city name.">
              <Input value={form.location_name} onChange={v => update('location_name', v)} placeholder="e.g. Newark, NJ" />
            </Field>

            <Field label="Zodiac sign" hint="Used for your daily song suggestion">
              <select value={form.zodiac_sign} onChange={e => update('zodiac_sign', e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'var(--surface)',
                  border: '1px solid var(--bronze)', borderRadius: '10px', color: 'var(--cream)',
                  fontFamily: 'Outfit', fontSize: '0.9rem',
                }}>
                {ZODIAC.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </Field>

            {message.text && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem',
                background: message.type === 'error' ? 'rgba(139,58,26,0.3)' : 'rgba(50,100,50,0.3)',
                border: `1px solid ${message.type === 'error' ? 'rgba(139,58,26,0.5)' : 'rgba(50,150,50,0.4)'}`,
                color: message.type === 'error' ? '#f5a282' : '#88d4a0',
              }}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={saving}
              style={{
                padding: '0.85rem', borderRadius: '10px', border: 'none',
                background: saving ? 'var(--bronze)' : 'var(--gold)',
                color: 'var(--dark)', fontFamily: 'Outfit', fontWeight: 700,
                fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem', transition: 'all 0.2s',
              }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* WhatsApp setup instructions */}
        <div style={{
          marginTop: '3rem', padding: '1.5rem', borderRadius: '14px',
          background: 'var(--card)', border: '1px solid rgba(201,151,58,0.12)',
        }}>
          <p style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ✦ WhatsApp Setup
          </p>
          <p style={{ color: 'var(--cream-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
            To receive notifications, both of you must join the Twilio WhatsApp Sandbox.
            Send the message <strong style={{ color: 'var(--cream)' }}>join [your-keyword]</strong> to
            <strong style={{ color: 'var(--cream)' }}> +1 (415) 523-8886</strong> on WhatsApp.
            Find your exact join keyword in your Twilio Console under Messaging → Try it out → Send a WhatsApp message.
          </p>
        </div>

      </main>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', color: 'var(--cream-muted)', fontSize: '0.8rem', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ color: 'var(--bronze)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  )
}

function Input({ type = 'text', value, onChange, placeholder }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required
      style={{
        width: '100%', padding: '0.75rem 1rem', background: 'var(--surface)',
        border: '1px solid var(--bronze)', borderRadius: '10px', color: 'var(--cream)',
        fontFamily: 'Outfit', fontSize: '0.9rem',
      }}
    />
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)' }}>
      <div className="font-display" style={{ color: 'var(--gold)', fontSize: '1.5rem', opacity: 0.7 }}>⚙</div>
    </div>
  )
}
