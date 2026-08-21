'use server';

/**
 * @fileOverview Server actions for File Host.
 * Handles secure communication with cloud nodes using environment secrets or user-provided tokens.
 */

export async function uploadToTelegram(formData: FormData, customToken?: string, customChatId?: string) {
  try {
    const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error("Node Error: Credentials not identified.");
    }

    const file = formData.get('document') as File;
    if (!file) throw new Error("Missing binary payload.");

    const telegramForm = new FormData();
    telegramForm.append('chat_id', chatId);
    telegramForm.append('document', file);
    telegramForm.append('caption', `📁 File: ${file.name}\n⚖️ Size: ${(file.size / 1024).toFixed(1)} KB\n🚀 Processed via My Kit Tool`);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: telegramForm,
      cache: 'no-store'
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.description || `Node Error: ${response.status}`);
    }

    const result = await response.json();
    const message = result.result;

    if (!message) {
      throw new Error("Uplink failed. Please try again.");
    }

    // Safe extraction from various classification nodes (document, audio, video, etc)
    const fileData = message.document || 
                     message.audio || 
                     message.video || 
                     message.voice || 
                     message.animation || 
                     (message.photo ? message.photo[message.photo.length - 1] : null);

    if (!fileData || !fileData.file_id) {
      throw new Error("Upload failed. Identity token not identified.");
    }

    return { 
      success: true, 
      data: {
        fileId: fileData.file_id,
        fileUniqueId: fileData.file_unique_id,
        messageId: message.message_id,
        name: fileData.file_name || file.name || 'unnamed_asset',
        size: fileData.file_size || file.size,
        mime: fileData.mime_type || file.type || 'application/octet-stream'
      }
    };
  } catch (error: any) {
    console.error('Uplink Error:', error);
    return { success: false, error: error.message || 'Upload failed. Please try again.' };
  }
}

export async function getDownloadProtocol(fileId: string, customToken?: string) {
  try {
    const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("Missing credentials");

    const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || "File unreachable");
    }

    return { success: true, url: `/api/telegram-proxy?fileId=${fileId}` };
  } catch (error: any) {
    return { success: false, error: error.message || "Protocol Failure" };
  }
}

/**
 * Performs a clinical handshake to verify custom credentials.
 */
export async function testConnection(token: string, chatId: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      cache: 'no-store'
    });
    const data = await response.json();

    if (!data.ok) {
      throw new Error("Invalid Token");
    }

    const testMsg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "⚡ [My Kit Tool] Sovereign Node Handshake Initialized.",
        disable_notification: true
      })
    });
    
    const msgData = await testMsg.json();
    if (!msgData.ok) {
      throw new Error("Invalid ID or restricted node access.");
    }

    return { 
      success: true, 
      botName: data.result.first_name,
      username: data.result.username 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
