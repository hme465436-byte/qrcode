'use server';

/**
 * @fileOverview Server actions for Site Backup Cloner.
 * Handles initial HTML extraction to bypass CORS for discovery.
 */

export async function fetchHtmlAction(url: string) {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Uplink Error: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return { success: true, html, finalUrl: response.url };
  } catch (error: any) {
    console.error('HTML Extraction Failure:', error);
    return { success: false, error: error.message || 'Uplink restricted by remote host.' };
  }
}
