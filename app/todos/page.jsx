'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function TodosPage() {
  const [tasks, setTasks] = useState([])
  const [profile, setProfile] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [completingId, setCompletingId] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      await fetchTasks()
      setLoading(false)

      // Real-time subscription: auto-refresh when any task changes
      const channel = supabase
        .channel('tasks-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
          fetchTasks()
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    setTasks(data || [])
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTitle.trim() || !profile) return
    setAdding(true)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() })
    })

    setNewTitle('')
    setNewDesc('')
    setShowForm(false)
    setAdding(false)
  }

  async function toggleTask(task) {
    setCompletingId(task.id)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`/api/todos/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ completed: !task.completed })
    })
    setCompletingId(null)
  }

  async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`/api/todos/${taskId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${session.access_token}` } })
  }

  const pending = tasks.filter(t => !t.completed)
  const done = tasks.filter(t => t.completed)

  if (loading) return <LoadingScreen />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '80px', paddingBottom: '100px' }}>
      <Navbar username={profile?.username} />

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--cream)', letterSpacing: '-0.02em' }}>
              Our Tasks
            </h1>
            <p style={{ color: 'var(--cream-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {pending.length} pending · {done.length} done
            </p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: showForm ? 'var(--surface)' : 'var(--gold)',
              color: showForm ? 'var(--cream)' : 'var(--dark)',
              fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem', flexShrink: 0,
            }}>
            {showForm ? 'Cancel' : '+ Add task'}
          </button>
        </div>

        {/* Add task form */}
        {showForm && (
          <form onSubmit={addTask} style={{
            background: 'var(--card)', borderRadius: '16px', padding: '1.25rem',
            border: '1px solid rgba(201,151,58,0.2)', marginBottom: '1.5rem',
            animation: 'slideUp 0.3s ease forwards',
          }}>
            <input
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="Task title..."
              required
              style={{
                width: '100%', padding: '0.7rem 0.9rem', background: 'var(--surface)',
                border: '1px solid var(--bronze)', borderRadius: '10px', color: 'var(--cream)',
                fontFamily: 'Outfit', fontSize: '0.95rem', marginBottom: '0.75rem',
              }}
            />
            <textarea
              value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="Optional note..."
              rows={2}
              style={{
                width: '100%', padding: '0.7rem 0.9rem', background: 'var(--surface)',
                border: '1px solid var(--bronze)', borderRadius: '10px', color: 'var(--cream)',
                fontFamily: 'Outfit', fontSize: '0.9rem', resize: 'none', marginBottom: '0.75rem',
              }}
            />
            <button type="submit" disabled={adding}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none',
                background: 'var(--gold)', color: 'var(--dark)', fontFamily: 'Outfit',
                fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
              }}>
              {adding ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        )}

        {/* Pending tasks */}
        {pending.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <SectionLabel>To do</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pending.map(task => (
                <TaskCard
                  key={task.id} task={task}
                  completing={completingId === task.id}
                  onToggle={() => toggleTask(task)}
                  onDelete={() => deleteTask(task.id)}
                  currentUserId={profile?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed tasks */}
        {done.length > 0 && (
          <section>
            <SectionLabel>Completed</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {done.map(task => (
                <TaskCard
                  key={task.id} task={task}
                  completing={completingId === task.id}
                  onToggle={() => toggleTask(task)}
                  onDelete={() => deleteTask(task.id)}
                  currentUserId={profile?.id}
                  dimmed
                />
              ))}
            </div>
          </section>
        )}

        {tasks.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--cream-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✦</div>
            <p>No tasks yet. Add your first one.</p>
          </div>
        )}
      </main>

      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}

function TaskCard({ task, onToggle, onDelete, completing, currentUserId, dimmed }) {
  const isOwner = task.created_by_id === currentUserId

  return (
    <div style={{
      background: 'var(--card)', borderRadius: '14px', padding: '1rem 1.25rem',
      border: `1px solid ${task.completed ? 'rgba(201,151,58,0.08)' : 'rgba(201,151,58,0.15)'}`,
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
      opacity: dimmed ? 0.65 : 1, transition: 'opacity 0.2s',
    }}>
      {/* Checkbox */}
      <button onClick={onToggle} disabled={completing}
        style={{
          width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          border: task.completed ? 'none' : '2px solid var(--bronze)',
          background: task.completed ? 'var(--gold)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: '2px', transition: 'all 0.2s',
        }}>
        {task.completed && <span style={{ color: 'var(--dark)', fontSize: '12px', fontWeight: 700 }}>✓</span>}
        {completing && <span style={{ color: 'var(--gold)', fontSize: '10px' }}>…</span>}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          color: task.completed ? 'var(--cream-muted)' : 'var(--cream)',
          textDecoration: task.completed ? 'line-through' : 'none',
          fontSize: '0.95rem', fontWeight: 500, margin: 0,
        }}>{task.title}</p>

        {task.description && (
          <p style={{ color: 'var(--cream-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
          <span style={{ color: 'var(--bronze)', fontSize: '0.72rem' }}>
            Added by {task.created_by_name || 'someone'}
          </span>
          {task.completed && task.completed_by_name && (
            <span style={{ color: 'var(--gold)', fontSize: '0.72rem' }}>
              ✓ Done by {task.completed_by_name}
            </span>
          )}
        </div>
      </div>

      {/* Delete button (only for creator) */}
      {isOwner && (
        <button onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bronze)', fontSize: '1rem', padding: '0 0.25rem', flexShrink: 0 }}>
          ×
        </button>
      )}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ color: 'var(--cream-muted)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
      {children}
    </p>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)' }}>
      <div className="font-display" style={{ color: 'var(--gold)', fontSize: '1.5rem', opacity: 0.7 }}>✦</div>
    </div>
  )
}
