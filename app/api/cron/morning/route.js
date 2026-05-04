// POST /api/cron/morning
// Runs every day at 10:00 AM EDT (14:00 UTC) via Vercel Cron
// Sends: personalized weather, world headlines, daily song → to both users' WhatsApp
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseServer'
import { getWeather } from '@/lib/weather'
import { getTopHeadlines } from '@/lib/news'
import { generateSong } from '@/lib/songAI'
import { sendWhatsApp } from '@/lib/twilio'

export async function POST(request) {
  // Verify this request comes from Vercel Cron (not a random person)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  try {
    // 1. Get all user profiles
    const { data: profiles, error: profileError } = await admin.from('profiles').select('*')
    if (profileError || !profiles || profiles.length === 0) {
      return NextResponse.json({ error: 'No profiles found' }, { status: 500 })
    }

    // 2. Get top world headlines (shared for everyone)
    const headlines = await getTopHeadlines(3)
    const newsText = `📰 *World Headlines*\n${headlines.join('\n')}`

    // 3. Generate today's song (based on both zodiac signs)
    const zodiacSigns = profiles.map(p => p.zodiac_sign)
    const zodiacPair = zodiacSigns.join(' + ')

    // Check if song already exists for today
    let song
    const { data: existingSong } = await admin
      .from('daily_songs')
      .select('*')
      .eq('date', today)
      .single()

    if (existingSong) {
      song = existingSong
    } else {
      song = await generateSong(zodiacSigns[0] || 'Libra', zodiacSigns[1] || 'Pisces')
      await admin.from('daily_songs').insert({
        date: today,
        title: song.title,
        artist: song.artist,
        reason: song.reason,
        zodiac_pair: zodiacPair,
      })
    }

    const songText = `🎵 *Song of the day* (${zodiacPair})\n"${song.title}" by ${song.artist}\n${song.reason || ''}`

    // 4. Send personalized message to each user with their local weather
    const results = []
    for (const profile of profiles) {
      try {
        const weather = await getWeather(profile.location_lat, profile.location_lon, profile.location_name)

        const hour = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York'
        })

        const greeting = `🌅 *Good morning, ${profile.username}!*\n_${hour} ET_`

        const message = [
          greeting,
          '',
          `☁️ *Your weather*`,
          weather.text,
          '',
          newsText,
          '',
          songText,
        ].join('\n')

        const result = await sendWhatsApp(profile.phone_number, message)
        results.push({ user: profile.username, ...result })
      } catch (err) {
        results.push({ user: profile.username, success: false, error: err.message })
      }
    }

    return NextResponse.json({ success: true, date: today, results })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
