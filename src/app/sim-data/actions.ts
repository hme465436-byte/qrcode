'use server';

/**
 * @fileOverview Server actions for SIM Data Finder to handle external API-Ninjas validation securely.
 */

export async function validatePhoneNumber(number: string) {
  try {
    const apiKey = process.env.API_NINJAS_KEY || ''; // Placeholder for user's key
    const response = await fetch(`https://api.api-ninjas.com/v1/validatephone?number=${encodeURIComponent(number)}`, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      // If key is missing or invalid, return a partial success to allow local fallback
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'API Node Restricted' };
      }
      throw new Error(`Uplink Error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('Validation Error:', error);
    return { success: false, error: error.message };
  }
}
