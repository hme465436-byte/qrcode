'use server';

/**
 * @fileOverview Server actions for Background Remove studio.
 * Handles high-fidelity subject isolation via remove.bg nodes.
 */

export async function removeBackground(base64Image: string, customKey?: string) {
  try {
    const apiKey = (customKey || process.env.REMOVE_BG_KEY || '').trim();
    
    if (!apiKey) {
      throw new Error("Node Error: API key not identified. Connect a personal HOST node to proceed.");
    }

    if (!base64Image) {
      throw new Error("Missing visual payload.");
    }

    const parts = base64Image.split(',');
    const cleanBase64 = parts.length > 1 ? parts[1] : parts[0];

    const formData = new FormData();
    formData.append('image_base64', cleanBase64);
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.errors?.[0]?.title || `Uplink Error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resultBase64 = `data:image/png;base64,${buffer.toString('base64')}`;

    return { success: true, data: resultBase64 };
  } catch (error: any) {
    console.error('Extraction Failure:', error);
    return { success: false, error: error.message || 'Linguistic matrix failure during extraction.' };
  }
}

/**
 * Validates a remove.bg API key via the account status node.
 */
export async function testRemoveBgKey(key: string) {
  const trimmedKey = key.trim();
  if (!trimmedKey) return { success: false, error: "Key cannot be empty." };

  try {
    const response = await fetch('https://api.remove.bg/v1.0/account', {
      method: 'GET',
      headers: {
        'X-Api-Key': trimmedKey,
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.errors?.[0]?.title || 'Invalid credentials or restricted node.' 
      };
    }

    return { 
      success: true, 
      credits: data.data.attributes.credits.total 
    };
  } catch (error: any) {
    return { success: false, error: 'Discovery node unreachable.' };
  }
}
