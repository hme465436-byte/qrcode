'use server';

/**
 * @fileOverview Server actions for URL Shortener with multi-node fallback.
 */

export async function createShortUrl(longUrl: string) {
  const nodes = [
    { url: `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`, name: 'is.gd' },
    { url: `https://v.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`, name: 'v.gd' },
    { url: `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, name: 'tinyurl' }
  ];

  for (const node of nodes) {
    try {
      const response = await fetch(node.url, {
        method: 'GET',
        next: { revalidate: 0 }
      });

      if (response.ok) {
        const shortUrl = await response.text();
        if (shortUrl && shortUrl.startsWith('http')) {
          return { success: true, shortUrl, node: node.name };
        }
      }
    } catch (error) {
      console.warn(`Node ${node.name} restricted. Attempting next protocol...`);
    }
  }

  return { success: false, error: 'Shortener unavailable. Please try again later.' };
}
