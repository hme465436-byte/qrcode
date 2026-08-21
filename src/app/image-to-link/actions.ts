'use server';

/**
 * @fileOverview Server actions for Image to Link studio to handle ImgBB uploads securely.
 */

export async function uploadToImgBB(base64Image: string, customKey?: string) {
  try {
    const apiKey = customKey || '7dd99fb70a655cd8730f8c5bac31178f';
    
    if (!base64Image) {
      throw new Error("Missing visual payload.");
    }

    const parts = base64Image.split(',');
    if (parts.length < 2) {
      throw new Error("Malformed binary matrix.");
    }
    const cleanBase64 = parts[1];

    const formData = new FormData();
    formData.append('image', cleanBase64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error("API key not valid or blocked. Create a new key from ImgBB API page.");
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Node Error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}

/**
 * Validates a custom API key by performing a minimal handshake.
 */
export async function testImgBBKey(key: string) {
  try {
    // Tiny 1x1 transparent PNG pixel base64 for validation
    const testImage = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const formData = new FormData();
    formData.append('image', testImage);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return { success: false, error: "API key not valid or blocked. Create a new key from ImgBB API page." };
      }
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error?.message || 'Invalid API Key' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
