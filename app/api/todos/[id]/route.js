// PUT /api/todos/[id] — complete or update a task (sends WhatsApp notification)
// DELETE /api/todos/[id] — delete a task
import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabaseServer'
import { sendToAll } from '@/lib/twilio'

export async function PUT(request, { params }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const taskId = params.id

  // Get the current user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, phone_number')
    .eq('id', user.id)
    .single()

  // Build the update payload
  const update = {}
  if (body.completed !== undefined) {
    update.completed = body.completed
    if (body.completed) {
      update.completed_by_id = user.id
      update.completed_by_name = profile?.username || 'Someone'
      update.completed_at = new Date().toISOString()
    } else {
      // Uncompleting a task resets these fields
      update.completed_by_id = null
      update.completed_by_name = null
      update.completed_at = null
    }
  }

  // Update the task
  const { data: task, error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', taskId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send WhatsApp notification when a task is completed
  if (body.completed) {
    try {
      // Get all user phones (admin client to bypass RLS)
      const admin = createAdminClient()
      const { data: allProfiles } = await admin.from('profiles').select('phone_number, username')

      if (allProfiles && allProfiles.length > 0) {
        const phones = allProfiles.map(p => p.phone_number)
        const message = `✅ *Task completed!*\n\n"${task.title}" was checked off by ${profile?.username || 'someone'}.\n\n🕐 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })} ET`

        await sendToAll(phones, message)
      }
    } catch (err) {
      // WhatsApp failure should not break the task update
      console.error('WhatsApp notification failed:', err.message)
    }
  }

  return NextResponse.json({ task })
}

export async function DELETE(request, { params }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { error } = await supabase.from('tasks').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
