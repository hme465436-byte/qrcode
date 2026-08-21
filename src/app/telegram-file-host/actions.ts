
'use server';

/**
 * @fileOverview Server actions for File Host.
 * Handles secure communication with Bot API using environment secrets or user-provided tokens.
 * Integrated with FFmpeg for multi-format audio synthesis.
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import os from 'os';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

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
    console.error('Uplink Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}

/**
 * Advanced Audio Synthesis Action.
 * Downloads the source from Telegram, converts to target format, and re-uploads.
 */
export async function convertAndUploadAudioVariant(
  sourceFileId: string,
  targetFormat: string,
  customToken?: string,
  customChatId?: string
) {
  try {
    const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) throw new Error("Credentials restricted.");

    // 1. Resolve source path
    const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${sourceFileId}`);
    const getFileData = await getFileRes.json();
    if (!getFileData.ok) throw new Error("Source identity unreachable.");
    const filePath = getFileData.result.file_path;

    // 2. Fetch bitstream
    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    const tmpIn = path.join(os.tmpdir(), `in_${sourceFileId}`);
    const tmpOut = path.join(os.tmpdir(), `out_${sourceFileId}.${targetFormat}`);

    fs.writeFileSync(tmpIn, buffer);

    // 3. Spawning FFmpeg Synthesis
    await new Promise((resolve, reject) => {
      ffmpeg(tmpIn)
        .toFormat(targetFormat)
        .on('end', resolve)
        .on('error', (err) => {
          console.error(`FFmpeg Error [${targetFormat}]:`, err);
          reject(err);
        })
        .save(tmpOut);
    });

    // 4. Re-uploading synthesized variant
    const stats = fs.statSync(tmpOut);
    const telegramForm = new FormData();
    telegramForm.append('chat_id', chatId);
    
    const outBuffer = fs.readFileSync(tmpOut);
    const blob = new Blob([outBuffer], { type: `audio/${targetFormat}` });
    telegramForm.append('document', blob, `master_synthesis.${targetFormat}`);
    telegramForm.append('caption', `💠 Format Matrix: ${targetFormat.toUpperCase()}\n⚖️ Volume: ${(stats.size/1024).toFixed(1)} KB`);

    const uploadRes = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: telegramForm,
    });

    const uploadData = await uploadRes.json();
    
    // Immediate Hardware Buffer Purge
    try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch(e) {}

    if (!uploadData.ok) throw new Error(uploadData.description || "Variant upload failed");

    const doc = uploadData.result.document;
    return {
      success: true,
      data: {
        fileId: doc.file_id,
        size: doc.file_size,
        format: targetFormat
      }
    };
  } catch (error: any) {
    console.error('Synthesis Action Failed:', error);
    return { success: false, error: error.message };
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

    // Attempt to verify Chat ID by sending a dummy message (silent)
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
      throw new Error("Invalid Chat ID or restricted bot access.");
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
