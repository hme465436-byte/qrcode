export interface HelpContent {
  title: string;
  description: string;
  steps: string[];
  tips: string[];
  privacy: string;
}

export const HELP_REGISTRY: Record<string, HelpContent> = {
  'single': {
    title: 'Single QR Studio',
    description: 'Design premium, branded QR codes with custom logos and AI-generated backgrounds.',
    steps: [
      'Enter your data payload (URL, Text, WiFi, etc.) in the input field.',
      'Apply a style preset or manually adjust the dot and corner geometry.',
      'Upload a brand logo or generate an artistic background using the AI prompt.',
      'Monitor the scannability score to ensure the asset is functional.',
      'Export the final master as PNG, JPG, PDF, or SVG.'
    ],
    tips: [
      'Use high contrast between the foreground and background for best results.',
      'AI-generated backgrounds are automatically optimized for scannability.',
      'Logo size should not exceed 30% of the QR area for reliable scanning.'
    ],
    privacy: 'Generation occurs entirely on your device. Only AI prompts are sent to secure cloud nodes for processing.'
  },
  'ai-chatbot': {
    title: 'AI Chatbot Studio',
    description: 'A professional linguistic synthesis environment for real-time AI collaboration.',
    steps: [
      'Initialize a session by typing a prompt in the command input.',
      'Wait for the AI to synchronize with the Groq or OpenRouter matrix.',
      'Isolate the generated response for your documentation or workflow.',
      'Manage multiple threads or purge the session as needed.',
      'Login to maintain a permanent archival record of your discovery signals.'
    ],
    tips: [
      'Be specific in your prompts to isolate the highest fidelity results.',
      'Use the Copy button to quickly extract response matrices.',
      'The studio uses a context window of the last 10 messages for peak efficiency.'
    ],
    privacy: 'Chat history is stored locally (anonymous) or in Firestore (authenticated). No biometric data is logged.'
  },
  'bulk': {
    title: 'Bulk Production Engine',
    description: 'Generate large batches of high-resolution QR assets from a list of data strings.',
    steps: [
      'Paste your list of URLs or text, one per line, into the bulk input area.',
      'Configure the global branding (colors, logo, background) for the entire batch.',
      'Select your preferred export format (PNG, JPG, or PDF).',
      'Click "Export Bundle ZIP" to synthesize all assets.',
      'Download and extract the resulting archive.'
    ],
    tips: [
      'Each line in the input is treated as a separate QR code identity.',
      'Filenames are automatically generated based on the input data.',
      'Batch processing up to 100 items is recommended for browser stability.'
    ],
    privacy: 'All rendering and ZIP creation happen locally in your browser memory.'
  },
  'all-units-converter': {
    title: 'All Units Converter Studio',
    description: 'Professional universal measurement matrix. Translate values across 12 distinct scientific and common measurement categories.',
    steps: [
      'Select a "Dimension Matrix" category chip (e.g., Length, Weight, Energy).',
      'Choose the "From" (source) and "To" (target) unit protocols.',
      'Enter the numeric value in the Input box for real-time translation.',
      'Review the high-precision output in the Result Matrix.',
      'Adjust the decimal precision (2, 4, or 6) as required by your protocol.'
    ],
    tips: [
      'Use the "Quick Access Matrix" for one-tap common conversions like CM to Inch.',
      'The "Swap Protocol" button instantly inverts the translation direction.',
      'Temperature conversions (Celsius, Fahrenheit, Kelvin) use non-linear scientific formulas.'
    ],
    privacy: 'All measurement logic operates 100% locally in your browser memory. No numeric data or conversion intent is logged or transmitted.'
  },
  'temp-mail': {
    title: 'Temp Mail Studio Pro',
    description: 'Advanced disposable email synthesis. Generate temporary identities to receive verification codes and protect your primary accounts.',
    steps: [
      'Select a server node from the provider list.',
      'Optionally enter a custom handle or use the randomized identifier.',
      'Click "Copy" to save your temporary email to the clipboard.',
      'Wait for incoming signals in the "Linguistic Registry" (Inbox).',
      'Tap any message to expand and view the full content or extract codes.'
    ],
    tips: [
      'Keep the tab open to continue receiving polling updates every 10 seconds.',
      'Use "Re-humanize" to cycle your identity if a node becomes restricted.',
      'Emails are volatile and will be purged once you clear the studio or refresh.'
    ],
    privacy: 'Emails are retrieved via anonymous proxies. No permanent record of your activity is kept.'
  },
  'ocr': {
    title: 'Photo to Text Studio',
    description: 'Professional-grade Optical Character Recognition (OCR) for document extraction.',
    steps: [
      'Import an image containing text (JPG, PNG, or WebP).',
      'Select the linguistic protocol (Language) matching the document.',
      'Execute the extraction to isolate the text matrix.',
      'Review the decoded content in the result pane.',
      'Copy the text or reset the workspace for a new asset.'
    ],
    tips: [
      'High-contrast images with clear lighting yield the highest accuracy.',
      'The engine automatically falls back to local WASM processing if cloud nodes are busy.',
      'Supports up to 10MB visual payloads.'
    ],
    privacy: 'Processing utilizes a dual-path hybrid model (Cloud/Local). Visual data is purged after each session.'
  },
  'logo-maker': {
    title: 'Logo Text Studio',
    description: 'Premium typographic branding architecture for logos, avatars, and social icons.',
    steps: [
      'Enter your brand name and optional tagline.',
      'Select an "Architecture" (Layout) such as Stacked or Badge.',
      'Choose a typography matrix from 20+ professional font profiles.',
      'Configure chromatic values (Colors) and geometric scales.',
      'Download a high-resolution PNG master (up to 2048px).'
    ],
    tips: [
      'Enable "Alpha Background" for transparent exports ready for overlays.',
      'Use the "Safe Zone" toggle to ensure the design is centered for profile grids.',
      'The "Randomize" button is excellent for discovering unique identity combinations.'
    ],
    privacy: 'All design synthesis occurs 100% locally in your browser memory.'
  }
};
