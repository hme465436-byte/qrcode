'use server';

/**
 * @fileOverview Server actions for Chat Studio.
 * Handles high-fidelity DP uploads to ImgBB.
 */

export async function uploadAvatarAction(base64Image: string) {
  try {
    // Standard Studio Key for ImgBB
    const apiKey = '7dd99fb70a655cd8730f8c5bac31178f';
    
    // 1. Prepare Binary Matrix
    const parts = base64Image.split(',');
    const cleanBase64 = parts.length > 1 ? parts[1] : parts[0];

    const formData = new FormData();
    formData.append('image', cleanBase64);

    // 2. Transmit to ImgBB Node
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || `Node Rejection: ${response.status}`);
    }

    // 3. Return Direct Visual Link
    return { success: true, url: result.data.url };
  } catch (error: any) {
    console.error('Avatar Uplink Error:', error);
    return { success: false, error: error.message || 'Uplink failure.' };
  }
}
