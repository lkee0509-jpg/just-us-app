// GET /api/todos — fetch all tasks
// POST /api/todos — create a new task
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data })
}

export async function POST(request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { title, description } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  // Get current user's profile for their name
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

  const { data, error } = await supabase.from('tasks').insert({
    title: title.trim(),
    description: description?.trim() || null,
    created_by_id: user.id,
    created_by_name: profile?.username || 'Someone',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}
