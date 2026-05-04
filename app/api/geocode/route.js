// POST /api/geocode — convert a city name to lat/lon for settings page
import { NextResponse } from 'next/server'
import { geocodeCity } from '@/lib/weather'

export async function POST(request) {
  const { city } = await request.json()
  if (!city) return NextResponse.json({ error: 'City name required' }, { status: 400 })

  try {
    const result = await geocodeCity(city)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
