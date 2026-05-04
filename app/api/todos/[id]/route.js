import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendToAll } from '@/lib/twilio'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function PUT(request, { params }) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const taskId = params.id

  const { data: profile } = await supabase.from('profiles').select('username, phone_number').eq('id', user.id).single()

  const update = {}
  if (body.completed !== undefined) {
    update.completed = body.completed
    if (body.completed) {
      update.completed_by_id = user.id
      update.completed_by_name = profile?.username || 'Someone'
      update.completed_at = new Date().toISOString()
    } else {
      update.completed_by_id = null
      update.completed_by_name = null
      update.completed_at = null
    }
  }

  const { data: task, error } = await supabase.from('tasks').update(update).eq('id', taskId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.completed) {
    try {
      const { data: allProfiles } = await supabase.from('profiles').select('phone_number, username')
      if (allProfiles && allProfiles.length > 0) {
        const phones = allProfiles.map(p => p.phone_number)
        const message = `✅ *Task completed!*\n\n"${task.title}" was checked off by ${profile?.username || 'someone'}.\n\n🕐 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })} ET`
        await sendToAll(phones, message)
      }
    } catch (err) {
      console.error('WhatsApp notification failed:', err.message)
    }
  }

  return NextResponse.json({ task })
}

export async function DELETE(request, { params }) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { error } = await supabase.from('tasks').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
