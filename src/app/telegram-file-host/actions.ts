'use server';

/**
 * @fileOverview Advanced Server Actions for File Host.
 * Implements a multi-node redundancy protocol (Telegram -> Catbox -> ImgBB).
 */

/**
 * Node 1: Telegram Cloud Protocol
 */
export async function uploadToTelegram(formData: FormData, customToken?: string, customChatId?: string) {
  try {
    const token = (customToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const chatId = (customChatId || process.env.TELEGRAM_CHAT_ID || '').trim();

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
      cache: 'no-store'
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: "TELEGRAM_REJECTED", message: result.description || `Node Error: ${response.status}` };
    }

    const message = result.result;
    const fileData = message.document || message.audio || message.video || message.voice || (message.photo ? message.photo[message.photo.length - 1] : null);

    if (!fileData?.file_id) throw new Error("Identity token retrieval failure.");

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
    return { success: false, error: "UPLINK_FAILURE", message: error.message };
  }
}

/**
 * Node 2: Catbox Anonymous Protocol (General Files)
 */
export async function uploadToCatbox(formData: FormData) {
  try {
    const file = formData.get('document') as File;
    if (!file) throw new Error("No payload");

    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', file);

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxForm,
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`Catbox Node Error: ${response.status}`);

    const url = await response.text();
    if (!url.startsWith('http')) throw new Error("Invalid response from Catbox.");

    return {
      success: true,
      provider: 'Catbox',
      data: {
        directUrl: url,
        name: file.name,
        size: file.size,
        mime: file.type
      }
    };
  } catch (error: any) {
    return { success: false, error: "CATBOX_FAILURE", message: error.message };
  }
}

/**
 * Node 3: ImgBB Protocol (Visual Assets Only)
 */
export async function uploadToImgBB(formData: FormData) {
  try {
    const file = formData.get('document') as File;
    if (!file || !file.type.startsWith('image/')) {
      return { success: false, error: "TYPE_MISMATCH", message: "ImgBB only supports visual assets." };
    }

    const apiKey = '7dd99fb70a655cd8730f8c5bac31178f';
    const imgbbForm = new FormData();
    imgbbForm.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbForm,
      cache: 'no-store'
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "ImgBB Node Restricted");

    return {
      success: true,
      provider: 'ImgBB',
      data: {
        directUrl: result.data.url,
        viewUrl: result.data.url_viewer,
        name: file.name,
        size: file.size,
        mime: file.type
      }
    };
  } catch (error: any) {
    return { success: false, error: "IMGBB_FAILURE", message: error.message };
  }
}

export async function getDownloadProtocol(fileId: string, customToken?: string) {
  try {
    const token = (customToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
    if (!token) throw new Error("Credentials missing");

    const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (!data.ok) throw new Error(data.description || "File unreachable");
    return { success: true, url: `/api/telegram-proxy?fileId=${fileId}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

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
    if (!msgData.ok) throw new Error("Chat ID restricted or restricted node access.");

    return { success: true, botName: data.result.first_name, username: data.result.username };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
