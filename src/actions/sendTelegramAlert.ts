'use server'

import { getComplaints } from './complaintStore'

export async function updateTelegramPinnedHeader() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    // 1. Fetch complaints
    const complaints = await getComplaints();
    const openCount = complaints.filter((c: any) => c.status !== 'RESOLVED').length;
    const closedCount = complaints.filter((c: any) => c.status === 'RESOLVED').length;
    
    const headerText = `📊 <b>LIVE SYSTEM STATUS</b>\n━━━━━━━━━━━━━━━━━━━━\n🔴 Open Complaints: <b>${openCount}</b>\n🟢 Resolved Cases: <b>${closedCount}</b>\n\n<i>Last updated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</i>`;

    // 2. Get current chat to find pinned message
    const chatRes = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`);
    if (chatRes.ok) {
      const chatData = await chatRes.json();
      const pinnedMessage = chatData.result?.pinned_message;
      
      // If there's a pinned message and it looks like our status board, edit it!
      if (pinnedMessage && pinnedMessage.text && pinnedMessage.text.includes('LIVE SYSTEM STATUS')) {
        const editRes = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: pinnedMessage.message_id,
            text: headerText,
            parse_mode: 'HTML'
          })
        });
        if (editRes.ok) return; // Successfully edited
      }
    }

    // 3. If we couldn't edit, send a new message and pin it
    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: headerText, parse_mode: 'HTML' })
    });
    
    if (sendRes.ok) {
      const sendData = await sendRes.json();
      await fetch(`https://api.telegram.org/bot${token}/pinChatMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: sendData.result.message_id,
          disable_notification: true
        })
      });
    }
  } catch (error) {
    console.error('Failed to update telegram pinned header:', error);
  }
}

export async function sendTelegramAlert(message: string) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn('Telegram Bot Token or Chat ID is not configured. Skipping alert.');
      return { success: false, error: 'Telegram credentials missing' };
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending Telegram alert:', errorData);
      return { success: false, error: errorData.description };
    }

    const data = await response.json();
    return { success: true, messageId: data.result.message_id };
  } catch (error: any) {
    console.error('Failed to send Telegram alert:', error);
    return { success: false, error: error.message };
  }
}
