'use server'

import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_SANDBOX_NUMBER

const client = twilio(accountSid, authToken)

export async function sendTicketSMS(phone: string, ticketNum: string, name: string) {
  try {
    if (!accountSid || !authToken || !twilioNumber) return { success: false, error: 'Twilio not configured' }
    
    const message = await client.messages.create({
      body: `Hi ${name}, your complaint ticket no: *${ticketNum}* has been registered with CATLA BROADBAND. Our technician will resolve it shortly.`,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${phone.startsWith('+') ? phone : '+91' + phone.replace(/\D/g, '').slice(-10)}`
    })
    console.log('WhatsApp registration sent successfully:', message.sid)
    return { success: true, sid: message.sid }
  } catch (error: any) {
    console.error('Error sending Twilio WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

export async function sendAssignmentSMS(phone: string, ticketNum: string, name: string, techName: string) {
  try {
    if (!accountSid || !authToken || !twilioNumber) return { success: false, error: 'Twilio not configured' }
    
    const message = await client.messages.create({
      body: `Hi ${name}, our technician *${techName}* has been assigned to your complaint ticket no: *${ticketNum}*. They will reach out to you shortly.`,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${phone.startsWith('+') ? phone : '+91' + phone.replace(/\D/g, '').slice(-10)}`
    })
    console.log('WhatsApp assignment sent successfully:', message.sid)
    return { success: true, sid: message.sid }
  } catch (error: any) {
    console.error('Error sending Twilio assignment WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

export async function sendResolutionSMS(phone: string, ticketNum: string, name: string) {
  try {
    if (!accountSid || !authToken || !twilioNumber) return { success: false, error: 'Twilio not configured' }
    
    const message = await client.messages.create({
      body: `Hi ${name}, your complaint ticket no: *${ticketNum}* has been marked as RESOLVED by our technician. If you still face issues, please reply or contact support. Thank you for choosing CATLA BROADBAND!`,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${phone.startsWith('+') ? phone : '+91' + phone.replace(/\D/g, '').slice(-10)}`
    })
    console.log('WhatsApp resolution sent successfully:', message.sid)
    return { success: true, sid: message.sid }
  } catch (error: any) {
    console.error('Error sending Twilio resolution WhatsApp:', error)
    return { success: false, error: error.message }
  }
}
