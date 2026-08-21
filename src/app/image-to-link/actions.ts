'use server';

/**
 * @fileOverview Server actions for Image to Link studio to handle ImgBB uploads securely.
 */

export async function uploadToImgBB(base64Image: string) {
  try {
    const apiKey = '7dd99fb70a655cd8730f8c5bac31178f';
    
    if (!base64Image) {
      throw new Error("Missing visual payload.");
    }

    // ImgBB API expects base64 data without the data URI prefix
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
      const errData = await response.json().catch(() => ({}));
      const statusCode = response.status;
      throw new Error(errData.error?.message || `ImgBB Node Error: ${statusCode}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}
