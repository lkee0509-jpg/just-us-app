// Uses Claude AI to generate a daily song suggestion based on two zodiac signs
import Anthropic from '@anthropic-ai/sdk'

export async function generateSong(sign1, sign2) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `You are a music curator. Suggest ONE real existing song that perfectly fits the combined energy and vibe of ${sign1} and ${sign2} zodiac signs for today.

Respond ONLY in this exact format with nothing else before or after:
TITLE: [song title here]
ARTIST: [artist name here]
REASON: [one sentence, under 20 words, why this fits these signs today]`
    }]
  })

  const text = message.content[0].text.trim()
  const title = text.match(/TITLE:\s*(.+)/)?.[1]?.trim() || 'Unknown'
  const artist = text.match(/ARTIST:\s*(.+)/)?.[1]?.trim() || 'Unknown'
  const reason = text.match(/REASON:\s*(.+)/)?.[1]?.trim() || ''

  return { title, artist, reason }
}
