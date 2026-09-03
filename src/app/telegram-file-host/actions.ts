'use server';

/**
 * @fileOverview Server actions for File Host.
 * Exclusively handles Telegram Cloud Protocol for all file types.
 */

export interface FileLinkMatrix {
  fileId?: string;
  directUrl?: string;
  name: string;
  size: number;
  mime: string;
}

// Studio Standard Fallbacks for zero-config hosting
const DEFAULT_TOKEN = '7170817006:AAH5Z8W6p_Hj7Z7M-J9q1L6_3_v4X3M5J8E';
const DEFAULT_CHAT_ID = '-1002142277028';

/**
 * Singular Node: Telegram Cloud Protocol
 */
export async function uploadToTelegram(formData: FormData, customToken?: string, customChatId?: string) {
  try {
    // Priority: Custom UI Input -> Vercel Environment Variable -> Studio Public Fallback
    const token = (customToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TOKEN).trim();
    const chatId = (customChatId || process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID).trim();

    if (!token || !chatId) {
      return { success: false, error: "CREDENTIALS_MISSING", message: "Telegram node credentials not identified." };
    }

    const file = formData.get('document') as File;
    if (!file) throw new Error("Missing binary payload.");

    const telegramForm = new FormData();
    telegramForm.append('chat_id', chatId);
    telegramForm.append('document', file);
    telegramForm.append('caption', `📁 File: ${file.name}\n⚖️ Size: ${(file.size / 1024).toFixed(1)} KB\n🚀 My Kit Tool Uplink`);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: telegramForm,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: "TELEGRAM_REJECTED", 
        message: `Telegram Node: ${result.description || 'Access Denied'} (HTTP ${response.status})` 
      };
    }

    const message = result.result;
    const fileData = message.document || message.audio || message.video || message.voice || (message.photo ? message.photo[message.photo.length - 1] : null);

    if (!fileData?.file_id) throw new Error("Identity token retrieval failure from remote host.");

    return { 
      success: true, 
      provider: 'Telegram',
      data: {
        fileId: fileData.file_id,
        name: fileData.file_name || file.name,
        size: fileData.file_size || file.size,
        mime: fileData.mime_type || file.type || 'application/octet-stream'
      }
    };
  } catch (error: any) {
    console.error('Telegram Uplink Error:', error);
    return { success: false, error: "UPLINK_FAILURE", message: `Protocol Error: ${error.message || 'Connection timed out'}` };
  }
}

/**
 * Retrieves the proxy download link for a Telegram file.
 */
export async function getDownloadProtocol(fileId: string, customToken?: string) {
  try {
    const token = (customToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TOKEN).trim();
    if (!token) throw new Error("Credentials missing");

    const response = await fetch(`https://api.api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (!data.ok) throw new Error(data.description || "File unreachable");
    return { success: true, url: `/api/telegram-proxy?fileId=${fileId}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tests the connection to the Telegram Bot API.
 */
export async function testConnection(token: string, chatId: string) {
  try {
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();
    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`, { cache: 'no-store' });
    const data = await response.json();

    if (!data.ok) throw new Error("Invalid Token Identifier");

    const testMsg = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: "⚡ [My Kit Tool] Node Handshake Initialized.",
        disable_notification: true
      })
    });
    
    const msgData = await testMsg.json();
    if (!msgData.ok) throw new Error("Chat ID restricted or node access denied.");

    return { success: true, botName: data.result.first_name, username: data.result.username };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
