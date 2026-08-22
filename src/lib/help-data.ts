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
  'temp-mail': {
    title: 'Temp Mail Studio Pro',
    description: 'Professional-grade temporary email synthesis with multi-node support. Protect your primary address by using instant, disposable identities from various global mail servers.',
    steps: [
      'Select a "Server Node" from the protocol matrix (e.g. 1secmail or Mail.tm).',
      'The studio will automatically synthesize a unique identity mailbox for that node.',
      'Incoming linguistic signals are polled every 10 seconds and displayed in the Registry.',
      'Click any identified message to launch the high-fidelity visual decoder.',
      'Switch between server nodes anytime to rotate your digital fingerprint or bypass restricted networks.'
    ],
    tips: [
      'If one server node is blocked by your target website, try switching to a different provider.',
      'The "Mail.tm" node offers superior high-fidelity rendering for complex HTML emails.',
      'The "Auto-Refresh" cycle ensures zero-latency detection of verification codes.'
    ],
    privacy: 'All message decoding and polling occurs strictly within volatile memory via secure server-side proxies. No identity data is stored on studio infrastructure.'
  },
  'file-host': {
    title: 'FILE HOST Studio',
    description: 'Professional distributed archival unit. Securely store and share files of any type via cloud nodes with permanent bitstream preservation.',
    steps: [
      'Inject your binary asset (Image, PDF, Audio, ZIP up to 20MB) into the Inbound Matrix.',
      'Execute the uplink protocol to transmit the bitstream to the cloud node.',
      'Once synthesized, the asset is automatically recorded in your Archival Registry.',
      'To share, expand the registry entry and generate a temporary download portal.',
      'Deploy the link via the one-tap social sharing protocols (WhatsApp/Telegram).'
    ],
    tips: [
      'Favorite important assets to pin them to the top of your registry.',
      'Generated download links are temporary; re-synthesize them if they expire.',
      'Rename registry entries for better organizational control within the studio.'
    ],
    privacy: 'Uplinks occur via secure server-side handshakes. Your local registry data, including favorites and custom labels, is held strictly in hardware memory.'
  },
  'image-to-link': {
    title: 'Image to Link Studio',
    description: 'Professional visual hosting unit. Convert photos and graphics into permanent shareable links via the global Imgur anonymous registry.',
    steps: [
      'Import your image (JPG, PNG, GIF, or WebP up to 10MB) into the intake matrix.',
      'Review the visual preview to verify the asset identity.',
      'Execute the uplink protocol by clicking the "Execute Uplink" button.',
      'Once synthesized, a matrix of 5 shareable link formats will be generated.',
      'Use the dedicated copy protocols to save Direct, Markdown, or HTML identifiers.'
    ],
    tips: [
      'Direct links ending in .jpg or .png are ideal for embedding in third-party applications.',
      'Markdown protocols are hard-coded for GitHub and technical documentation READMEs.',
      'Imgur is an anonymous host; ensure your assets comply with SFW professional standards.'
    ],
    privacy: 'Uplinks are performed via secure server-side tunnels. Your original visual data is transmitted directly to the Imgur registry and is not stored on our studio servers.'
  },
  'wallpapers': {
    title: 'Wallpapers Studio',
    description: 'Professional high-fidelity visual discovery unit for Desktop and Mobile hardware. Isolate high-resolution assets optimized for modern aspect ratios.',
    steps: [
      'Select your target hardware preset: Desktop (16:9) or Mobile (9:16).',
      'Choose a thematic category chip to recalibrate the discovery stream.',
      'Click any thumbnail to launch the High-Resolution Matrix Viewport.',
      'Execute the download protocol to save the master binary locally.',
      'Use the Refresh Batch button to generate a new set of visual identifiers.'
    ],
    tips: [
      'The Space category synchronizes with the NASA APOD node for clinical astronomical data.',
      'Mobile wallpapers are rendered at 1080x1920 for peak high-DPI clarity on smartphones.'
    ],
    privacy: 'All visual discovery lookups are volatile and held strictly in local memory. No search history or visual interest is logged or transmitted.'
  },
  'url-shortener': {
    title: 'URL Shortener Studio',
    description: 'Professional linguistic compression unit for web identifiers. Convert long, complex URLs into high-fidelity short links for efficient social sharing and branding.',
    steps: [
      'Paste your destination URL into the primary input field.',
      'The engine automatically detects the target node and prepares the compression protocol.',
      'Execute the synthesis by clicking the generate button.',
      'Analyze the resulting short identifier in the result matrix.',
      'Use the copy protocol to save the short link to your clipboard.'
    ],
    tips: [
      'Ensure your long URL starts with http:// or https:// for peak accuracy.',
      'Links generated via the TinyURL protocol are permanent and self-sustaining.'
    ],
    privacy: 'URL compression occurs via secure server-side uplinks. No link history or user-specific metadata is stored on our servers.'
  },
  'dns-lookup': {
    title: 'DNS Lookup Studio',
    description: 'Professional-grade DNS discovery and domain auditing unit. Resolve global DNS records including A, AAAA, MX, NS, TXT, and CNAME with clinical precision.',
    steps: [
      'Enter the target domain name in the primary input field (e.g., google.com).',
      'Select the specific record type protocol you wish to isolate.',
      'Execute the lookup to synchronize with the Google DNS discovery nodes.',
      'Review the identified records, including data values and TTL (Time-To-Live) metadata.',
      'Analyze the results in the structuralized data matrix below.'
    ],
    tips: [
      'Use the MX protocol to verify email server routing for any domain.',
      'TTL values indicate how long the record is cached in seconds.',
      'Multiple records of the same type indicate high-availability configurations.'
    ],
    privacy: 'All DNS queries are processed strictly in local browser memory. No domain interest or lookup history is logged or stored.'
  },
  'password-breach-checker': {
    title: 'Breach Checker Studio',
    description: 'Professional-grade password integrity evaluator. Verify if a password has been identified in global data breaches using the secure k-Anonymity protocol.',
    steps: [
      'Enter the password you wish to verify in the Security Matrix input.',
      'Optionally use the eye icon to verify character entry accuracy.',
      'Execute the integrity check to initialize the k-Anonymity handshake.',
      'The engine will hash your password and query the first 5 characters of the prefix.',
      'Review the report to see if the identity is Safe or Compromised.'
    ],
    tips: [
      'For peak security, never check passwords on a shared or public terminal.',
      'Compromised results indicate the password is no longer viable for professional security.'
    ],
    privacy: 'Clinical Security Protocol: Your full password or its full hash never leaves this hardware unit. Only the first 5 characters of a SHA-1 hash are sent to the HaveIBeenPwned node.'
  },
  'website-trust-checker': {
    title: 'Website Trust Studio',
    description: 'Professional domain reputation auditing unit. Evaluate visual and technical security signals via multi-node malware registries and DNS resolution protocols.',
    steps: [
      'Enter the target website URL in the Discovery Node input.',
      'Execute the Trust Audit to initialize the multi-node security handshake.',
      'Review the calculated Risk Level based on malware, SSL, and DNS results.',
      'Analyze the technical data grid for IP, ISP, and blacklist status.',
      'Copy the full audit log for technical reporting or further deep-dives.'
    ],
    tips: [
      'Enter full URLs including https:// for more precise certificate validation.',
      'Blacklisted results are derived from the live URLhaus malware registry.'
    ],
    privacy: 'All security lookups are processed strictly in local browser memory via secure server actions. No data intent is logged.'
  },
  'github-user': {
    title: 'GitHub Identity Studio',
    description: 'Professional developer discovery engine. Isolate public profile metadata, repository density, and social reach locally via the GitHub REST protocol.',
    steps: [
      'Enter a GitHub username in the Discovery Protocol input.',
      'Execute the lookup to synchronize with the GitHub REST nodes.',
      'Review the identified developer profile, bio, and visual identity.',
      'Analyze the metrics matrix for repository and follower telemetry.',
      'Use the copy protocol or launch the official profile link.'
    ],
    tips: [
      'Ensure the username is spelled correctly for 1:1 identity matching.',
      'Public profiles are retrieved in real-time from GitHub hardware.'
    ],
    privacy: 'Identity queries are processed strictly in local hardware memory.'
  },
  'city-explorer': {
    title: 'City Explorer Studio',
    description: 'Professional geographic mapping and address validation unit. Isolate regional nodes and coordinates locally with the OpenStreetMap protocol.',
    steps: [
      'Enter the target city name in the search matrix.',
      'The engine will synchronize with the regional registry node.',
      'Review the identified geographic identifiers and postal data.',
      'Verify the coordinate vectors (Latitude/Longitude) for accuracy.',
      'Execute the map protocol to view the exact node location.'
    ],
    tips: [
      'Enter specific names for more accurate identity isolation.',
      'Coordinate data is derived from 1:1 geographic mapping.'
    ],
    privacy: 'All geographic lookups are volatile and held strictly in local hardware memory.'
  },
  'wikipedia': {
    title: 'Wikipedia Studio',
    description: 'Professional-grade knowledge discovery engine. Isolate high-fidelity summaries and visual identifiers from the global Wikipedia registry.',
    steps: [
      'Enter a search topic (Person, Place, Concept) in the Discovery Protocol input.',
      'Execute the search to synchronize with the Wikipedia REST nodes.',
      'Review the clinical summary and visual identity of the subject.',
      'Use the copy protocol to save the textual matrix or launch the full article.',
      'Reset the studio buffer for a new bibliographic search.'
    ],
    tips: [
      'Enter specific names for more accurate identity isolation.',
      'The "Read More" protocol launches the full article in a secure new tab.'
    ],
    privacy: 'All linguistic lookups are volatile and held strictly in local hardware memory.'
  },
  'coding-resources': {
    title: 'Coding Matrix Studio',
    description: 'Professional-grade technical discovery engine for developers. Isolate high-fidelity learning assets, documentation, and technical protocols.',
    steps: [
      'Enter a keyword or technical topic in the Filter Matrix.',
      'The engine will automatically narrow the resource registry.',
      'Review identified signals including topics, levels, and descriptions.',
      'Click any card to launch the external resource in a secure new tab.',
      'Use the Re-Sync button to re-calibrate with the global source nodes.'
    ],
    tips: [
      'Search for specific technologies like "React", "Python", or "API" for faster mapping.',
      'Hover over cards to see the launch protocol icon.'
    ],
    privacy: 'Linguistic discovery lookups are volatile and held strictly in local hardware memory.'
  },
  'single': {
    title: 'Single Studio QR',
    description: 'Design a professional, branded QR code with integrated logos and AI backgrounds.',
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
  'weather': {
    title: 'Weather Intelligence Studio',
    description: 'Professional environmental diagnostic unit. Access real-time atmospheric data and projections for any global node.',
    steps: [
      'Enter a city name in the search matrix to initialize geocoding.',
      'Select the specific location node from the discovered results.',
      'The engine will synchronize with atmospheric nodes to retrieve current telemetry.',
      'Analyze the current temperature, wind flow, and humidity matrix.',
      'Review the 3-day projected high/low temperature vectors.'
    ],
    tips: [
      'If your city isn\'t identified, try adding the country name for more precise geocoding.',
      'Refresh the matrix to re-calibrate real-time telemetry if you keep the studio open.'
    ],
    privacy: 'Environmental lookups are volatile and held strictly in local memory. The studio does not track or store your location history.'
  },
  'currency-converter': {
    title: 'Currency Converter Studio',
    description: 'Professional exchange rate translation unit. Convert between global currencies using real-time market data.',
    steps: [
      'Enter the numeric amount you wish to convert in the primary input.',
      'Select the "From" currency (source) and "To" currency (target).',
      'Execute the conversion protocol by clicking the primary action button.',
      'Review the calculated total, current exchange rate, and temporal sync data.',
      'Use the swap button to instantly invert the conversion direction.'
    ],
    tips: [
      'The studio utilizes a dual-node API fallback system to ensure maximum uptime.',
      'Rates are updated at various intervals depending on the active node (Cloudflare Edge sync).'
    ],
    privacy: 'Linguistic and financial data is held in volatile memory only. No conversion history is logged to our servers.'
  },
  'ip-finder': {
    title: 'IP Finder Studio',
    description: 'Advanced network identity extraction. Isolate your public IP and ISP node information.',
    steps: [
      'The studio automatically initializes an identity discovery handshake upon load.',
      'Review the "Public Identity Protocol" to see your current public IP address.',
      'Analyze the "Identity Matrix" for your ISP, City, and Sovereign Domain.',
      'Use the "Optical Matrix" to see your coordinates and launch a Map Protocol.',
      'Click "Refresh Matrix" to re-calibrate your signal identifiers.'
    ],
    tips: [
      'If discovery fails, ensure your firewall is not blocking external edge APIs.',
      'Use the copy button next to the IP address for rapid technical documentation.'
    ],
    privacy: 'All discovery lookups are performed via edge APIs. No identity data or IP records are stored on our servers.'
  },
  'wps-sheets': {
    title: 'WPS Sheets Studio',
    description: 'A clinical spreadsheet utility for managing data matrices, inventories, and financial rosters locally.',
    steps: [
      'Choose a production template (Attendance, Inventory, etc.) or start blank.',
      'Click cells to enter your linguistic or numeric payload.',
      'Use the top menu to insert or delete rows and columns as required.',
      'Rename your sheet identifier in the header for file organization.',
      'Download the final matrix as a .csv master for WPS Office or Excel.'
    ],
    tips: [
      'The first row is hard-coded as the header row for CSV exports.',
      'For large datasets, use a desktop hardware for better screen density.'
    ],
    privacy: '100% local synthesis. Spreadsheet data is volatile and held strictly in local memory.'
  },
  'bmi-calculator': {
    title: 'BMI Calculator Studio',
    description: 'Biometric analysis tool for Body Mass Index (BMI) and healthy weight targets.',
    steps: [
      'Select your preferred measurement protocol: Metric (cm/kg) or Imperial (ft/lb).',
      'Input your current stature and mass into the designated fields.',
      'Optionally provide age and gender for a more comprehensive context.',
      'Review your BMI index score and clinical category in real-time.',
      'Analyze the healthy weight range projected for your specific height matrix.'
    ],
    tips: [
      'For athletes, the healthy weight range may vary due to high muscle density.',
      'Use the copy button to save a text-based summary of your biometrics.'
    ],
    privacy: 'All biometric data is volatile and processed strictly in local browser memory. No records are stored.'
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
  'ocr': {
    title: 'Photo to Text Studio',
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
      'For videos, keep the duration short to ensure graphic browser-side synthesis.',
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
