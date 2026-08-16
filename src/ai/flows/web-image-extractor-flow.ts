'use server';
/**
 * @fileOverview An AI-powered tool to extract image URLs from a webpage and proxy downloads to bypass CORS.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WebImageExtractorInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage to extract images from.'),
});

const WebImageExtractorOutputSchema = z.object({
  images: z.array(z.object({
    url: z.string(),
    label: z.string(),
  })).describe('List of discovered images.'),
});

export async function extractWebImages(url: string) {
  return webImageExtractorFlow({ url });
}

const webImageExtractorFlow = ai.defineFlow(
  {
    name: 'webImageExtractorFlow',
    inputSchema: WebImageExtractorInputSchema,
    outputSchema: WebImageExtractorOutputSchema,
  },
  async input => {
    try {
      const response = await fetch(input.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
        },
        next: { revalidate: 3600 }
      });
      
      if (!response.ok) throw new Error(`Handshake Failed: HTTP ${response.status}`);
      
      const html = await response.text();
      const baseUrl = new URL(input.url);
      
      // Extraction Matrix (Regex-based discovery)
      const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/gi;
      const images = [];
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        try {
          const src = match[1];
          if (!src.startsWith('data:')) {
            const absoluteUrl = new URL(src, baseUrl.href).href;
            images.push({
              url: absoluteUrl,
              label: absoluteUrl.split('/').pop()?.split('?')[0] || 'Discovered Matrix'
            });
          }
        } catch (e) {}
      }
      
      // De-duplicate identified matrices
      const uniqueImages = Array.from(new Map(images.map(img => [img.url, img])).values());

      return { images: uniqueImages.slice(0, 40) }; 
    } catch (error: any) {
      console.error('Discovery Error:', error);
      throw new Error(`Web Discovery Failure: ${error.message}`);
    }
  }
);

/**
 * Proxy Download Flow - To bypass strict CORS policies on remote assets
 */
const ProxyDownloadInputSchema = z.object({
  url: z.string().url(),
});

export async function proxyDownloadImage(url: string) {
  return proxyDownloadFlow({ url });
}

const proxyDownloadFlow = ai.defineFlow(
  {
    name: 'proxyDownloadFlow',
    inputSchema: ProxyDownloadInputSchema,
    outputSchema: z.string(), // Returns base64 data URI
  },
  async input => {
    try {
      const response = await fetch(input.url);
      if (!response.ok) throw new Error("Remote stream unavailable");
      
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      return `data:${blob.type};base64,${buffer.toString('base64')}`;
    } catch (error: any) {
      throw new Error(`Proxy Protocol Failure: ${error.message}`);
    }
  }
);
