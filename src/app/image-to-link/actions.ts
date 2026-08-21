'use server';

/**
 * @fileOverview Server actions for Image to Link studio to handle ImgBB uploads securely.
 */

export async function uploadToImgBB(base64Image: string, customKey?: string) {
  try {
    // Trim the key to ensure no leading/trailing spaces cause authentication failure
    const apiKey = (customKey || '7dd99fb70a655cd8730f8c5bac31178f').trim();
    
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
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    const result = await response.json();

    if (!response.ok) {
      // Return the exact error message from ImgBB if available
      throw new Error(result.error?.message || `Node Error: ${response.status}`);
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}

/**
 * Validates a custom API key by performing a real multipart upload handshake.
 * Executed server-side to bypass CORS and provide exact error telemetry.
 */
export async function testImgBBKey(key: string) {
  const trimmedKey = key.trim();
  if (!trimmedKey) return { success: false, error: "API Key cannot be empty." };

  try {
    // Tiny 1x1 transparent PNG pixel base64 for validation
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    const formData = new FormData();
    formData.append('image', testImage);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${trimmedKey}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Provide exact error message from ImgBB API
      return { 
        success: false, 
        error: data.error?.message || `Protocol Error ${response.status}: ${response.statusText}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Discovery node connection timeout.' };
  }
}
