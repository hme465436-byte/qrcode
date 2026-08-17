/**
 * @fileOverview Centralized help registry for MY KIT TOOL.
 * Maps tool IDs to specific clinical documentation.
 */

export interface HelpContent {
  title: string;
  description: string;
  steps: string[];
  tips: string[];
  privacy: string;
}

export const HELP_REGISTRY: Record<string, HelpContent> = {
  'single': {
    title: 'Single Studio QR',
    description: 'Design a professional, branded QR code with integrated logos and AI-generated backgrounds.',
    steps: [
      'Enter your destination URL or text payload in the Data block.',
      'Upload a brand icon (PNG/SVG) to the Logo Manager.',
      'Generate an artistic background using the AI Prompt Studio.',
      'Adjust dot and corner geometry in Technical Styling.',
      'Download your high-res PNG or vector SVG master.'
    ],
    tips: [
      'Use high-contrast colors (dark dots on light background) for peak reliability.',
      'Keep AI background opacity below 30% to ensure scannability.'
    ],
    privacy: 'All rendering occurs on your device. Your URLs and brand logos never leave your browser.'
  },
  'bulk': {
    title: 'Bulk Production',
    description: 'Mass-generate hundreds of high-resolution QR codes in a single production cycle.',
    steps: [
      'Paste your list of URLs or text strings (one per line) into the Payload box.',
      'Configure the global style and branding for the entire batch.',
      'Select your target format (PNG, JPG, or PDF).',
      'Execute the Burst Render protocol.',
      'Download the packaged ZIP archive containing all assets.'
    ],
    tips: [
      'Double-check for leading/trailing spaces in your URL list.',
      'Use PNG format for the highest fidelity in print workflows.'
    ],
    privacy: 'Mass rendering is performed locally via WebAssembly. Your data list is never transmitted.'
  },
  'ocr': {
    title: 'OCR Extraction',
    description: 'Extract raw text from images, documents, and screenshots using Optical Character Recognition.',
    steps: [
      'Import your visual asset (JPG, PNG, or WebP).',
      'Select the primary language of the text in the image.',
      'Adjust contrast if the text is faint or low-quality.',
      'Click Extract Text to initialize the Tesseract engine.',
      'Copy the decoded text matrix to your clipboard.'
    ],
    tips: [
      'High-contrast, well-lit images yield 100% accuracy.',
      'For complex layouts, extract text in sections for better alignment.'
    ],
    privacy: 'Linguistic decoding happens 100% locally. Your private documents are never uploaded.'
  },
  'pdf-merger': {
    title: 'PDF Merger Studio',
    description: 'Unify multiple PDF documents into a single, sanitized master file.',
    steps: [
      'Upload all PDF documents you wish to combine.',
      'Use the sequence manager to drag or reorder pages.',
      'Review the total page count and file size.',
      'Click Merge Documents to synthesize the new master.',
      'Download your unified PDF.'
    ],
    tips: [
      'Ensure documents are not password-protected before merging.',
      'Large files (50MB+) may take several seconds to re-matrix.'
    ],
    privacy: 'PDF synthesis occurs in a secure WASM sandbox. No document data is stored.'
  },
  'hash-generator': {
    title: 'Hash Generator Studio',
    description: 'Generate high-fidelity cryptographic fingerprints and HMAC signatures.',
    steps: [
      'Choose the Text or File input tab.',
      'Select one or more algorithms (MD5, SHA-256, etc.).',
      'Optionally enter an HMAC key for secure authentication.',
      'View the real-time Hex and Base64 output matrix.',
      'Use the Compare tool to verify bit-level identity.'
    ],
    tips: [
      'Use SHA-512 for maximum collision resistance.',
      'Toggle Uppercase mode for standard technical documentation.'
    ],
    privacy: 'All hashing uses the hardware-native Web Crypto API. Payloads never leave your device.'
  },
  'json-formatter': {
    title: 'JSON Formatter PRO',
    description: 'Validate and beautify complex data structures with clinical precision.',
    steps: [
      'Paste your raw JSON string into the editor.',
      'Click Beautify to apply standard 2 or 4 space indentation.',
      'Use the Tree Map tab to visually inspect nested objects.',
      'Check the Error Panel for syntax validation alerts.',
      'Copy or download the sanitized .json file.'
    ],
    tips: [
      'Use the "Sort Keys" feature for easier data comparison.',
      'The "Minify" protocol is perfect for reducing production payload sizes.'
    ],
    privacy: 'Processing is performed via local JSON.parse and stringify cycles.'
  },
  'photo-enhance-fix': {
    title: 'Photo Enhance & Fix',
    description: 'Restore clarity, upscale resolution, and correct chromatic errors.',
    steps: [
      'Import a blurry or low-resolution visual asset.',
      'Select a preset profile (Portrait, Product, or Auto).',
      'Use the 2X or 4X upscale protocol for higher density.',
      'Adjust Sharpness and De-Pixelate sliders for restoration.',
      'Export your high-fidelity PNG master.'
    ],
    tips: [
      'Apply De-Pixelate before Sharpness to avoid artifact amplification.',
      'The Split-View toggle allows for precise A/B comparison.'
    ],
    privacy: 'Visual re-matricing is 100% local. Your photos are never transmitted.'
  },
  'regex-tester': {
    title: 'Regex Tester PRO',
    description: 'Evaluate regular expressions against linguistic payloads with live matching.',
    steps: [
      'Enter your RegExp pattern in the top field.',
      'Toggle required flags (g, i, m, s, u, y).',
      'Paste your test text into the large payload area.',
      'Review identified matches and capture groups in the panel.',
      'Test your replacement strategy in the Replace box.'
    ],
    tips: [
      'Hover over flags to see their technical impact.',
      'Use Named Capturing Groups for complex data extraction.'
    ],
    privacy: 'Pattern matching uses the browser’s native RegExp engine.'
  },
  'lorem-ipsum-generator': {
    title: 'Lorem Ipsum Studio',
    description: 'Synthesize professional placeholder text and dummy identity data.',
    steps: [
      'Select your mode: Paragraphs, Words, or Identity.',
      'Adjust the volume slider for the required count.',
      'Enable HTML mode for rapid markup prototypes.',
      'Optionally apply the Hard Wrap protocol for terminal layouts.',
      'Copy or download the generated matrix.'
    ],
    tips: [
      'Use "Identity Matrix" for realistic dummy names and emails.',
      'HTML mode is ideal for quick CMS content testing.'
    ],
    privacy: 'Linguistic synthesis is 100% local and randomized.'
  }
};
