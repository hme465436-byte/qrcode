
'use server';

/**
 * @fileOverview Server actions for Telegram File Host.
 * Handles secure communication with Telegram Bot API.
 */

export async function uploadToTelegram(formData: FormData) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId || chatId === 'YOUR_NUMERIC_CHAT_ID') {
      throw new Error("Studio Node Error: Telegram credentials not configured in environment. Please set TELEGRAM_BOT_TOKEN and a valid numeric TELEGRAM_CHAT_ID.");
    }

    const file = formData.get('document') as File;
    if (!file) throw new Error("Missing binary payload.");

    // Create a new FormData to send to Telegram
    const telegramForm = new FormData();
    telegramForm.append('chat_id', chatId);
    telegramForm.append('document', file);
    telegramForm.append('caption', `📁 File: ${file.name}\n⚖️ Size: ${(file.size / 1024).toFixed(1)} KB\n🚀 Uploaded via MY KIT TOOL`);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: telegramForm,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.description || `Telegram Node Error: ${response.status}`);
    }

    const result = await response.json();
    const doc = result.result.document;

    return { 
      success: true, 
      data: {
        fileId: doc.file_id,
        fileUniqueId: doc.file_unique_id,
        messageId: result.result.message_id,
        name: doc.file_name,
        size: doc.file_size,
        mime: doc.mime_type
      }
    };
  } catch (error: any) {
    console.error('Telegram Upload Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}
