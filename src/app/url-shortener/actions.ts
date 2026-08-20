'use server';

/**
 * @fileOverview Server actions for URL Shortener to handle TinyURL API securely.
 */

export async function createShortUrl(longUrl: string) {
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, {
      method: 'GET',
      next: { revalidate: 0 } // Ensure fresh response
    });

    if (!response.ok) {
      throw new Error(`Uplink Error: ${response.status}`);
    }

    const shortUrl = await response.text();
    
    if (!shortUrl || !shortUrl.startsWith('http')) {
      throw new Error("Malformed signal response from discovery node.");
    }

    return { success: true, shortUrl };
  } catch (error: any) {
    console.error('Shortener Node Error:', error);
    return { success: false, error: error.message };
  }
}
