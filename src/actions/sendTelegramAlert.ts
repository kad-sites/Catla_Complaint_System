'use server'

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
