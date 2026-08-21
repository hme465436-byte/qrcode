'use server';

/**
 * @fileOverview Server actions for Image to Link studio to handle Imgur anonymous uploads securely.
 */

export async function uploadToImgur(base64Image: string) {
  try {
    // Imgur Client ID - Utilizing a resilient public endpoint for studio use
    const clientId = process.env.IMGUR_CLIENT_ID || '546c25a59c58ad7'; 
    
    if (!base64Image) {
      throw new Error("Missing visual payload.");
    }

    // Imgur API expects raw base64 without the data URI prefix
    const parts = base64Image.split(',');
    if (parts.length < 2) {
      throw new Error("Malformed binary matrix.");
    }
    const cleanBase64 = parts[1];

    const formData = new FormData();
    formData.append('image', cleanBase64);
    formData.append('type', 'base64');

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
      body: formData,
      cache: 'no-store'
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const statusCode = response.status;
      
      if (statusCode === 403) {
        throw new Error("Uplink Restricted: The remote host rejected the anonymous request (Error 403).");
      }
      if (statusCode === 429) {
        throw new Error("Rate Limit Active: Too many requests to the Imgur node. Please wait.");
      }
      
      throw new Error(errData.data?.error || `Imgur Node Error: ${statusCode}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Imgur Upload Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}
