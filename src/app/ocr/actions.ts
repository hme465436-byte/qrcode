'use server';

/**
 * @fileOverview Server actions for OCR.space API to bypass CORS and manage keys.
 */

export async function recognizeTextOcrSpace(base64Image: string, language: string = 'eng') {
  try {
    const formData = new FormData();
    // OCR.space expects base64Image to be a data URI or just base64
    formData.append('base64Image', base64Image);
    formData.append('language', language);
    formData.append('apikey', 'helloworld'); // Using default free key; users can replace with theirs
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'JPG');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloud node error: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || 'Processing failure');
    }

    // Extract text from the first result
    const text = data.ParsedResults?.[0]?.ParsedText || '';
    return { success: true, text };
  } catch (error: any) {
    console.error('OCR.space Error:', error);
    return { success: false, error: error.message };
  }
}
