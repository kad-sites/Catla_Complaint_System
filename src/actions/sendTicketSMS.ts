'use server'

import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_SANDBOX_NUMBER

const client = twilio(accountSid, authToken)

export async function sendTicketSMS(phone: string, ticketNum: string, name: string) {
  try {
    const message = await client.messages.create({
      body: `Hi ${name}, your complaint ticket no: *${ticketNum}* has been registered with CATLA BROADBAND. Our technician will resolve it shortly.`,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${phone}`
    })
    console.log('WhatsApp sent successfully:', message.sid)
    return { success: true, sid: message.sid }
  } catch (error: any) {
    console.error('Error sending Twilio WhatsApp:', error)
    return { success: false, error: error.message }
  }
}
