'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [song, setSong] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Load current user profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      // Load the other user's profile
      const { data: others } = await supabase.from('profiles').select('*').neq('id', user.id)
      if (others && others.length > 0) setOtherUser(others[0])

      // Load tasks
      const { data: taskData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      setTasks(taskData || [])

      // Load today's song
      const today = new Date().toISOString().split('T')[0]
      const { data: songData } = await supabase.from('daily_songs').select('*').eq('date', today).single()
      setSong(songData)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingScreen />

  const completed = tasks.filter(t => t.completed).length
  const pending = tasks.filter(t => !t.completed).length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '80px', paddingBottom: '80px' }}>
      <Navbar username={profile?.username} />

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.5s ease forwards' }}>
          <h1 className="font-display" style={{ fontSize: '2.8rem', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {greeting},<br />
            <span style={{ color: 'var(--gold)' }}>{profile?.username}</span>
          </h1>
          {otherUser && (
            <p style={{ color: 'var(--cream-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {otherUser.username} is here with you ✦
            </p>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard emoji="✓" label="Completed" value={completed} color="var(--gold)" />
          <StatCard emoji="○" label="Pending" value={pending} color="var(--cream-muted)" />
        </div>

        {/* Recent pending tasks */}
        {pending > 0 && (
          <Card title="Up next" icon="◎" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid var(--bronze)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--cream)', fontSize: '0.9rem' }}>{task.title}</span>
                </div>
              ))}
              {pending > 3 && (
                <Link href="/todos" style={{ color: 'var(--gold)', fontSize: '0.8rem', textDecoration: 'none', marginTop: '0.25rem' }}>
                  + {pending - 3} more tasks →
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Today's song */}
        {song && (
          <Card title="Song of the day" icon="♪" style={{ marginBottom: '1.5rem' }}>
            <p className="font-display" style={{ fontSize: '1.4rem', color: 'var(--cream)', fontStyle: 'italic' }}>
              "{song.title}"
            </p>
            <p style={{ color: 'var(--gold)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{song.artist}</p>
            {song.reason && <p style={{ color: 'var(--cream-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{song.reason}</p>}
            <p style={{ color: 'var(--bronze)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{song.zodiac_pair}</p>
          </Card>
        )}

        {!song && (
          <Card title="Song of the day" icon="♪" style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--cream-muted)', fontSize: '0.9rem' }}>
              Today's song will arrive at 10 AM in your WhatsApp. ✦
            </p>
          </Card>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <QuickLink href="/todos" emoji="✓" label="View all tasks" />
          <QuickLink href="/settings" emoji="⚙" label="Settings" />
        </div>

      </main>
    </div>
  )
}

function StatCard({ emoji, label, value, color }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: '16px', padding: '1.25rem',
      border: '1px solid rgba(201,151,58,0.12)', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{emoji}</div>
      <div style={{ fontSize: '2rem', fontWeight: 600, color, fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
      <div style={{ color: 'var(--cream-muted)', fontSize: '0.78rem', marginTop: '0.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

function Card({ title, icon, children, style }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: '16px', padding: '1.5rem',
      border: '1px solid rgba(201,151,58,0.12)', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>{icon}</span>
        <span style={{ color: 'var(--cream-muted)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function QuickLink({ href, emoji, label }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem',
      background: 'var(--surface)', borderRadius: '12px', border: '1px solid rgba(201,151,58,0.1)',
      textDecoration: 'none', color: 'var(--cream)', fontSize: '0.9rem', transition: 'all 0.2s',
    }}>
      <span>{emoji}</span> {label}
    </Link>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)' }}>
      <div className="font-display" style={{ color: 'var(--gold)', fontSize: '1.5rem', opacity: 0.7 }}>✦</div>
    </div>
  )
}

