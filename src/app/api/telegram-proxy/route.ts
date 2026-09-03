import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure proxy for Telegram file downloads.
 * Bypasses CORS and hides the bot token from the client.
 */

// Use the same standard fallback as the server actions
const DEFAULT_TOKEN = '7170817006:AAH5Z8W6p_Hj7Z7M-J9q1L6_3_v4X3M5J8E';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const token = (process.env.MYKIT_TG_TOKEN || DEFAULT_TOKEN).trim();

  if (!fileId || !token) {
    return new NextResponse('Protocol Error: Missing Identifiers', { status: 400 });
  }

  try {
    // 1. Get file path from Telegram
    const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const getFileData = await getFileRes.json();

    if (!getFileData.ok) {
      return new NextResponse('Linguistic Error: File unreachable in Telegram matrix', { status: 404 });
    }

    const filePath = getFileData.result.file_path;
    
    // 2. Fetch the actual bitstream from Telegram
    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    
    if (!fileRes.ok) {
      return new NextResponse('Hardware Error: Stream failed', { status: 502 });
    }

    // 3. Return the stream with correct headers
    const filename = filePath.split('/').pop() || 'downloaded_asset';
    
    return new NextResponse(fileRes.body, {
      headers: {
        'Content-Type': fileRes.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new NextResponse('Internal Matrix Error', { status: 500 });
  }
}