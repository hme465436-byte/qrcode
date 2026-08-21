'use server';

/**
 * @fileOverview Server actions for Telegram File Host.
 * Handles secure communication with Telegram Bot API using environment secrets.
 */

export async function uploadToTelegram(formData: FormData) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error("Studio Node Error: Telegram credentials not configured in environment.");
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
      cache: 'no-store'
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

/**
 * Verifies file availability and returns the internal proxy URL.
 */
export async function getDownloadProtocol(fileId: string) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("Missing credentials");

    // Call getFile to verify it still exists and is reachable
    const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || "File unreachable");
    }

    // We return our proxy URL to keep the token secret
    return { success: true, url: `/api/telegram-proxy?fileId=${fileId}` };
  } catch (error: any) {
    return { success: false, error: error.message || "Protocol Failure" };
  }
}
