'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function SongPage() {
  const [song, setSong] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const today = new Date().toISOString().split('T')[0]
      const { data: songData } = await supabase.from('daily_songs').select('*').eq('date', today).single()
      setSong(songData)
      setLoading(false)
    }
    load()
  }, [])

  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) return <LoadingScreen />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '80px', paddingBottom: '100px' }}>
      <Navbar username={profile?.username} />

      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>

        <p style={{ color: 'var(--cream-muted)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          {todayFormatted}
        </p>

        <h1 className="font-display" style={{ fontSize: '2.8rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
          Song of the Day
        </h1>

        {song ? (
          <div style={{
            background: 'var(--card)', borderRadius: '24px', padding: '3rem 2.5rem',
            border: '1px solid rgba(201,151,58,0.2)',
            boxShadow: '0 0 60px rgba(201,151,58,0.06)',
            animation: 'fadeIn 0.6s ease forwards',
          }}>
            {/* Musical note decoration */}
            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem', opacity: 0.6 }}>♪</div>

            {/* Song title */}
            <p className="font-display" style={{ fontSize: '2rem', fontStyle: 'italic', color: 'var(--cream)', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              "{song.title}"
            </p>

            {/* Artist */}
            <p style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>
              {song.artist}
            </p>

            {/* Divider */}
            <div style={{ width: '40px', height: '1px', background: 'var(--bronze)', margin: '1.5rem auto' }} />

            {/* Reason */}
            {song.reason && (
              <p style={{ color: 'var(--cream-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                {song.reason}
              </p>
            )}

            {/* Zodiac pair */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', borderRadius: '20px',
              background: 'rgba(201,151,58,0.1)', border: '1px solid rgba(201,151,58,0.2)',
            }}>
              <span style={{ fontSize: '0.75rem' }}>✦</span>
              <span style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{song.zodiac_pair}</span>
              <span style={{ fontSize: '0.75rem' }}>✦</span>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--card)', borderRadius: '24px', padding: '3rem 2.5rem',
            border: '1px solid rgba(201,151,58,0.12)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem', opacity: 0.4 }}>♪</div>
            <p className="font-display" style={{ fontSize: '1.4rem', color: 'var(--cream-muted)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
              No song yet today
            </p>
            <p style={{ color: 'var(--bronze)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Your daily song arrives at 10 AM in your WhatsApp.<br />
              Check back after that.
            </p>
          </div>
        )}

        {/* Search on Spotify helper */}
        {song && (
          <a
            href={`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: '1.5rem', padding: '0.6rem 1.5rem',
              borderRadius: '20px', background: '#1DB954', color: '#000',
              fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
            }}>
            Search on Spotify →
          </a>
        )}

      </main>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)' }}>
      <div className="font-display" style={{ color: 'var(--gold)', fontSize: '1.5rem', opacity: 0.7 }}>♪</div>
    </div>
  )
}
