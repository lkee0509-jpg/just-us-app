const twilio = require('twilio')
function getClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}
export async function sendWhatsApp(phone, message) {
  try {
    const client = getClient()
    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:`,
      body: message,
    })
    console.log(`WhatsApp sent to : `)
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error(`WhatsApp failed to :`, error.message)
    return { success: false, error: error.message }
  }
}
export async function sendToAll(phones, message) {
  const results = await Promise.all(phones.map(phone => sendWhatsApp(phone, message)))
  return results
}
