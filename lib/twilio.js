// Handles sending WhatsApp messages via Twilio
const twilio = require('twilio')

function getClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

// Send a WhatsApp message to one phone number
export async function sendWhatsApp(phone, message) {
  try {
    const client = getClient()
    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phone}`,
      body: message,
    })
    console.log(`WhatsApp sent to ${phone}: ${result.sid}`)
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error(`WhatsApp failed to ${phone}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Send same message to multiple phone numbers
export async function sendToAll(phones, message) {
  const results = await Promise.all(phones.map(phone => sendWhatsApp(phone, message)))
  return results
}
