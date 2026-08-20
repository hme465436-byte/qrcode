'use server';

/**
 * @fileOverview Server actions for Image to Link studio to handle Imgur anonymous uploads securely.
 */

export async function uploadToImgur(base64Image: string) {
  try {
    // Imgur Client ID - Users should replace this with their own ID in .env
    const clientId = process.env.IMGUR_CLIENT_ID || '546c25a59c58ad7'; 
    
    // Imgur API expects raw base64 without the data URI prefix
    const cleanBase64 = base64Image.split(',')[1];

    const formData = new FormData();
    formData.append('image', cleanBase64);
    formData.append('type', 'base64');

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.data?.error || `Imgur Node Error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Imgur Upload Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}
