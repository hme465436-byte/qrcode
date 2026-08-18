
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
  'tax-calculator': {
    title: 'Tax Calculator Studio',
    description: 'Professional fiscal utility for calculating GST, VAT, and sales taxes with dual-mode reverse logic.',
    steps: [
      'Choose your protocol: "Add Tax" for standard calculations or "Tax Included" for reverse-lookup.',
      'Enter the base or gross amount in the numeric input.',
      'Select a common tax rate from the quick-chips or enter a custom percentage.',
      'Review the real-time breakdown of Tax, Net, and Gross values.',
      'Copy specific values or log the calculation to your local history.'
    ],
    tips: [
      'Use "Tax Included" mode to find the actual value of an item after 15% GST is already applied.',
      'History is limited to 10 entries and is cleared if you reset your browser cache.'
    ],
    privacy: 'All calculations are performed locally via client-side JavaScript. No financial data is logged or transmitted.'
  },
  'temp-room': {
    title: 'Temp Room Studio',
    description: 'Establish an ephemeral P2P text synchronization tunnel between two hardware devices.',
    steps: [
      'Click "Create Room" on your primary device to generate a 6-character identity code.',
      'Enter the code or scan the generated QR on your secondary device to join.',
      'Once the status displays "Connected", any text typed in the shared box will sync instantly.',
      'Use "Copy All" to save the textual matrix to your local clipboard.',
      'Close the tab or refresh to definitively destroy the room and purge all ephemeral data.'
    ],
    tips: [
      'Ensure both browser tabs remain active during the sync cycle.',
      'The 6-character code is case-insensitive for rapid manual entry.',
      'Ideal for transferring long URLs, code blocks, or notes between mobile and desktop.'
    ],
    privacy: 'Text data streams via WebRTC DataChannels directly between devices. No textual payloads are ever stored in the cloud.'
  },
  'hide-message-photo': {
    title: 'Hide Message in Photo Pro',
    description: 'Advanced steganography tool to embed private text data or small files within image pixels.',
    steps: [
      'Upload a photo (PNG is highly recommended).',
      'Choose "Text" or "Small File" mode for your secret payload.',
      'Optionally set a password to encrypt the bitstream.',
      'Toggle "Strong" mode for bit-redundancy (better for low-quality carriers).',
      'Use the Compare Slider to verify that the pixels remain visually identical.',
      'To retrieve, switch to "Reveal" mode, upload the PNG, and enter the password.'
    ],
    tips: [
      'Avoid sharing via WhatsApp/Facebook as they compress images and destroy the hidden bits.',
      'The "Strong" mode is slower but more robust against accidental pixel noise.',
      "Visible 'Decoy Captions' can be used to misdirect observers."
    ],
    privacy: 'All processing occurs 100% locally in your browser memory. Your secrets and photos are never uploaded or logged.'
  },
  'wifi-qr-decoder': {
    title: 'WiFi QR Finder',
    description: 'Recover and decode credentials from WiFi-configured QR codes.',
    steps: [
      'Import an image of a WiFi QR code (screenshot or photo).',
      'The engine will automatically deconstruct the matrix.',
      'View the decrypted SSID, password, and security type.',
      'Use the reveal eye to verify the password string.',
      'Copy specific fields or the entire network configuration.'
    ],
    tips: [
      'Works with standard Android/iOS "Share WiFi" QR patterns.',
      'If the password field is empty, the network is likely Open (No Security).'
    ],
    privacy: 'Linguistic parsing occurs 100% locally. Your network passwords never leave your hardware.'
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
  'image-to-webp': {
    title: 'Image to WebP',
    description: 'Save space by converting your photos to a more efficient format. Professional-grade size reduction.',
    steps: [
      'Upload one or more photos (JPG, PNG, GIF, BMP) to your list.',
      'Adjust the Quality setting (10-100) to balance size and look.',
      'Optionally set a maximum width to resize large photos.',
      'Click Download to save individual photos or the whole list as a bundle.',
      'See your size saving for each converted photo.'
    ],
    tips: [
      'Quality settings between 75-85 yield the best balance for web use.',
      'Use the bundle download when processing many photos for efficiency.'
    ],
    privacy: 'Processing happens on your device. No photos are ever sent to any server.'
  },
  'images-to-gif': {
    title: 'Images to GIF Studio',
    description: 'Synthesize professional animated GIFs from a sequence of static images.',
    steps: [
      'Import 2 to 30 photos (JPG, PNG, or WebP) into the asset pipeline.',
      'Use the sequence management tools to reorder or remove specific frames.',
      'Configure the temporal delay (speed) and loop protocol.',
      'Select your resolution protocol (480px, 720px, or Native).',
      'Execute the synthesis protocol and download your master GIF.'
    ],
    tips: [
      'Ensure all images have consistent aspect ratios for the smoothest animation.',
      'Use delay settings around 200-500ms for standard "stop-motion" effects.'
    ],
    privacy: 'GIF synthesis is performed 100% locally using FFmpeg WASM. Your photos never leave your device memory.'
  },
  'barcode-reader': {
    title: 'Barcode & QR Reader',
    description: 'Advanced optical decoding for industrial and commercial matrix patterns.',
    steps: [
      'Select your preferred input protocol: Live Camera or Asset Upload.',
      'Point your lens at the barcode or upload a high-contrast image (JPG/PNG).',
      'The system will automatically isolate the matrix and decode the payload.',
      'Copy the result to your clipboard or launch the URL protocol if identified.',
      'Review your last 10 successful identifications in the Log Matrix.'
    ],
    tips: [
      'For small codes, use the manual zoom or move your hardware closer to the target.',
      'Ensure the barcode is oriented horizontally within the viewfinder guides.'
    ],
    privacy: 'Decoding occurs strictly in browser memory. No visual data or decoded strings are ever transmitted to external servers.'
  },
  'blur-face-plate': {
    title: 'Blur Face & Plate',
    description: 'Privacy preservation tool to hide sensitive information in photos.',
    steps: [
      'Upload your photo (max 10MB).',
      'Select "Box" to draw rectangles or "Brush" for freehand blurring.',
      'Drag or paint on the areas you wish to hide.',
      'Adjust the Blur Intensity slider to control the level of redaction.',
      'Download your sanitized photo.'
    ],
    tips: [
      'Use the Box tool for number plates and the Brush tool for faces.',
      'High blur intensity (80%+) is recommended for definitive anonymity.'
    ],
    privacy: 'Redaction occurs 100% locally in your browser memory. Your un-redacted photo never leaves your device.'
  },
  'donate': {
    title: 'Donation Protocol',
    description: 'Support the continued operation and development of MY KIT TOOL through manual contributions.',
    steps: [
      'Select your preferred transfer region (Pakistan or International).',
      'Copy the required account number, IBAN, or USDT address.',
      'Open your respective banking or exchange application.',
      'Perform a manual transfer using the copied details.',
      'The studio will automatically receive the "fuel" via standard banking/blockchain protocols.'
    ],
    tips: [
      'There is no minimum amount; every contribution fuels server costs.',
      'Verify the USDT network is TRC20 before confirming crypto transfers.'
    ],
    privacy: 'Financial transactions are handled entirely by your own banking software. The studio never sees your banking credentials.'
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
      'Use "Sort Keys" feature for easier data comparison.',
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
  },
  'nickname-generator': {
    title: 'Nickname Studio PRO',
    description: 'Advanced identity synthesis for gaming and branding. Generate stylized, unique nicknames and gamertags with clinical font mapping and artistic symbol matrixing.',
    steps: [
      'Enter your base identifier in the input field.',
      'Select a typographic font style from the Fonts tab (Bold, Fraktur, Monospace, etc.).',
      'Navigate to Prefix/Suffix tabs to select from 1,000+ categorized artistic symbols.',
      'Use the search box in each tab to find specific fonts or symbols instantly.',
      'Review your styled name in the Live Preview matrix and generate a batch of 20 unique variations.'
    ],
    tips: [
      'Use "Load More" at the bottom of the symbol lists to explore the full library without slowing down the page.',
      'The "Small-Caps" and "Fullwidth" fonts are highly recommended for professional gaming aliases.',
      'Frame your name with "Weapons" or "Fire" symbols for high-impact competitive profiles.'
    ],
    privacy: 'All generation occurs locally using random sampling. No identifiers are logged or stored.'
  },
  'image-border-frame': {
    title: 'Image Border & Frame Pro',
    description: 'Advanced cinematic framing engine. Add professional borders, archival polaroid frames, and custom captions to any visual asset.',
    steps: [
      'Import your photo (JPG, PNG, or WebP up to 10MB).',
      'Select a platform preset (Instagram, Story, 16:9) to auto-calibrate the aspect ratio.',
      'Apply a stylistic profile: Polaroid, Neon Glow, Film, or Vintage Gold.',
      'Refine the geometry using width, corner radius, and inner padding sliders.',
      'Choose a background color and apply procedural patterns like Dots or Checker.',
      'Download your framed master as a high-fidelity PNG (supports transparency) or JPG.'
    ],
    tips: [
      'The Polaroid and Film styles support typographic captions on the bottom border.',
      'Use high "Corner Radius" values to create rounded avatars or unique social media badges.',
      'Adjust "Optical Zoom" to center your subject precisely within the new frame matrix.'
    ],
    privacy: 'All visual re-matricing occurs locally in your browser memory. No data is logged or transmitted.'
  },
  'watermark': {
    title: 'Custom Watermark Studio',
    description: 'Professional visual protection for photos and videos. Add custom text or brand logos with precision positioning and tiling support.',
    steps: [
      'Import your image (max 10MB) or video (max 50MB) asset.',
      'Select "Text" to type a custom label or "Logo" to upload a transparent PNG icon.',
      'Choose a snap-position from the 9-point grid or drag the watermark directly on the preview.',
      'Configure stylistic parameters: Opacity, Scale, Color, and Rotation.',
      'For batch protection, enable "Tiled Pattern" to repeat the watermark across the entire frame.',
      'Download the final protected master as a PNG or WebM (video) file.'
    ],
    tips: [
      'Use a 45° rotation on tiled text for high-security asset protection.',
      'For videos, keep the duration short to ensure rapid browser-side synthesis.',
      'Draggable positioning works best on a desktop mouse, but touch snapping is optimized for mobile.'
    ],
    privacy: 'Hardware-native synthesis ensures your assets and brand logos never leave your hardware. No data is logged.'
  },
  'direct-file-share': {
    title: 'Direct File Share',
    description: 'High-speed Peer-to-Peer file sharing directly between devices.',
    steps: [
      'Select your file (max 100MB).',
      'Wait for the studio to generate your unique P2P link.',
      'Send the link to the recipient.',
      'Keep the sender page open while the recipient downloads.',
      'The file streams directly between devices—nothing is stored in the cloud.'
    ],
    tips: [
      'For best results, both devices should be on a stable network.',
      'Large files may take a moment to assemble in the recipient\'s browser memory.'
    ],
    privacy: 'This tool uses WebRTC for direct device-to-device streaming. Your files are never uploaded to any server or cloud storage.'
  },
  'sim-data': {
    title: 'Sim Data Finder',
    description: 'Professional mobile identity matrix for Pakistani phone numbers.',
    steps: [
      'Enter a 10 or 11 digit mobile number (e.g. 03001234567).',
      'Execute the search protocol to initialize carrier discovery.',
      'The engine will map the prefix to its respective network provider.',
      'View the structured identity matrix including Owner, CNIC, and Regional data.',
      'Use the purge button to clear the search buffer and maintain privacy.'
    ],
    tips: [
      'MNP (Ported numbers) may display the original network provider.',
      'Format the number without dashes or spaces for 100% accuracy.'
    ],
    privacy: 'Search payloads are volatile and processed locally. No identity data is transmitted or stored on our servers.'
  },
  'html-to-url': {
    title: 'HTML to URL Studio',
    description: 'Convert raw HTML code into a shareable web link hosted on our platform.',
    steps: [
      'Paste your HTML code (including CSS/JS) into the workspace.',
      'Optionally provide a title for the identity matrix.',
      'Execute the "Make Link" protocol.',
      'Copy the generated URL or open it in a new tab to see your live page.'
    ],
    tips: [
      'Keep the payload under 150KB for optimal performance.',
      'Ensure all CSS and JS are embedded directly within the HTML file.',
      'Ideal for quick demos, landing page previews, or code sharing.'
    ],
    privacy: 'Code is stored securely in our Firestore matrix. It is publicly accessible to anyone with the link.'
  }
};
