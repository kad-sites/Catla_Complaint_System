'use server'

import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_SANDBOX_NUMBER

const client = twilio(accountSid, authToken)

export async function sendAssignmentSMS(phone: string, ticketNum: string, techName: string, sla: string) {
  try {
    let formattedSla = sla;
    if (sla.endsWith('h')) {
      const hours = parseFloat(sla.replace('h', ''));
      if (hours < 1) {
        const mins = Math.round(hours * 60);
        formattedSla = `${mins} minute${mins !== 1 ? 's' : ''}`;
      } else {
        const h = Math.round(hours);
        formattedSla = `${h} hour${h !== 1 ? 's' : ''}`;
      }
    }

    const message = await client.messages.create({
      body: `Update on Ticket ${ticketNum}: Technician ${techName} has been assigned to resolve your issue. They will resolve it within ${formattedSla}.`,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${phone}`
    })
    console.log('Assignment WhatsApp sent successfully:', message.sid)
    return { success: true, sid: message.sid }
  } catch (error: any) {
    console.error('Error sending Twilio WhatsApp for assignment:', error)
    return { success: false, error: error.message }
  }
}
