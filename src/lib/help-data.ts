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
    title: 'Temp Mail Studio',
    description: 'Professional-grade temporary email synthesis. Protect your primary address by using instant, disposable identities for signups and testing.',
    steps: [
      'The studio automatically generates a unique identity matrix (email address) upon initialization.',
      'Copy the identity string to your clipboard for use in external registrations.',
      'Incoming signals are automatically synchronized with the Digital Inbox every 10 seconds.',
      'Click any identified message to launch the high-fidelity visual decoder.',
      'Execute the "New Identity" protocol to rotate your digital fingerprint and purge current buffers.'
    ],
    tips: [
      'The auto-refresh timer indicates when the next synchronization cycle will occur.',
      'HTML-based emails are automatically sanitized to ensure security while preserving visual integrity.',
      'Identities are ephemeral; ensure you finish your tasks before refreshing the page or generating a new mail.'
    ],
    privacy: 'Linguistic decoding and inbox management occur strictly within your hardware memory. No email payloads or identities are logged to our servers.'
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
      'Reset the studio buffer to purge the current discovery signal.'
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
  'translate': {
    title: 'Translate Studio',
    description: 'Professional bilingual translation unit. Seamlessly translate between English and Urdu with real-time signal processing.',
    steps: [
      'Type or paste your text into the primary linguistic input box.',
      'The engine will automatically set the source language based on the current mode.',
      'Click "Execute Translation" to synchronize with the global translation nodes.',
      'Review the result in the secondary matrix box.',
      'Use the swap button to invert the translation direction instantly.'
    ],
    tips: [
      'Short, clear sentences yield the highest translation fidelity.',
      'Use the copy button to save results directly to your local clipboard.'
    ],
    privacy: 'Linguistic data is processed in real-time. No text payloads are ever logged or stored on our servers.'
  },
  'image-gallery': {
    title: 'Image Gallery Studio',
    description: 'Professional high-fidelity visual discovery unit. Aggregate and isolate assets from NASA, Openverse, and the Art Institute of Chicago.',
    steps: [
      'Enter a visual keyword or select a category profile to initialize discovery.',
      'The engine will synchronize with multiple global registries to isolate matching identifiers.',
      'Review the results in the interactive masonry grid.',
      'Click any asset to launch the High-Resolution Matrix Viewport.',
      'Execute the download protocol to save the master binary locally.'
    ],
    tips: [
      'The studio utilizes parallel fetch protocols to ensure 100% signal availability.',
      'Source badges indicate the origin registry (e.g., NASA, Art Institute).'
    ],
    privacy: 'All discovery signals are processed strictly in local memory. Your visual search history is never transmitted or stored.'
  },
  'quotes': {
    title: 'Quote Studio',
    description: 'Professional high-fidelity inspiration synthesis. Extract unique randomized quotes from the global wisdom matrix with real-time calibration.',
    steps: [
      'Click "New Quote" to initialize the inspiration discovery protocol.',
      'The engine will synchronize with global wisdom nodes to retrieve a unique linguistic matrix.',
      'Review the quote and author identity in the primary glass-morphic viewport.',
      'Use the copy protocol to save the quote to your local clipboard.',
      'Optionally use the share button to instantly deploy the wisdom across social platforms.'
    ],
    tips: [
      'Each query includes a unique timestamp to ensure hardware-native randomization.',
      'The studio utilizes a dual-node fallback system (ZenQuotes/DummyJSON) to ensure maximum uptime.'
    ],
    privacy: 'Inspiration discovery lookups are volatile and held strictly in local memory. No data is logged or transmitted.'
  },
  'holidays': {
    title: 'Holiday Studio Pro',
    description: 'Professional public holiday discovery and projection unit. Access verified calendar matrices for over 100 global nations.',
    steps: [
      'Select a country from the global registry dropdown.',
      'Calibrate the temporal cycle (Year) for your target search.',
      'Execute the sync protocol to retrieve the public holiday matrix.',
      'Analyze dates and local event names in the primary glass viewport.',
      'Copy the full schedule for external planning or production use.'
    ],
    tips: [
      'Pakistan 2026 is a local high-fidelity matrix and does not require external node sync.',
      'The "Today" highlight is synchronized with your device hardware clock.'
    ],
    privacy: 'Temporal queries are processed strictly in local memory. No search history or calendar interest is logged.'
  },
  'books': {
    title: 'Book Studio Pro',
    description: 'Professional linguistic discovery engine for global literature. Access 1:1 verified book metadata, author profiles, and high-fidelity cover imagery.',
    steps: [
      'Enter a book title or author name in the search matrix to initialize discovery.',
      'The engine will synchronize with the Open Library registry to isolate matching signals.',
      'Review the top 10 relevant book identities including publication years and author rosters.',
      'Analyze visual assets (covers) and click "View Logic" for deep metadata lookup.',
      'Reset the studio buffer for a new bibliographic search.'
    ],
    tips: [
      'Use specific titles for more precise identity isolation.',
      'Cover imagery is served directly from library hardware for maximum fidelity.'
    ],
    privacy: 'All textual queries are processed strictly in local memory. No search history or bibliographic interest is logged.'
  },
  'pokemon': {
    title: 'Pokemon Finder Studio',
    description: 'Professional linguistic discovery engine for Pokémon data. Access 1:1 verified stats, sprites, and identity profiles.',
    steps: [
      'Enter a name or numeric ID in the search matrix to initialize discovery.',
      'The engine will synchronize with the PokeAPI registry to isolate the target unit.',
      'Analyze the base stat telemetry grid (HP, Attack, Defense).',
      'Review the biometric data and ability protocol modules.',
      'Use the copy protocol to save the identity data or reset for a new search.'
    ],
    tips: [
      'Enter numeric IDs (e.g., 25) for direct astronomical identification.',
      'The "official artwork" sprite is prioritized for peak visual fidelity.'
    ],
    privacy: 'All textual queries are processed strictly in local memory. No search history or identity interest is logged.'
  },
  'facts': {
    title: 'Fact Studio',
    description: 'Professional knowledge synthesis unit. Retrieve randomized high-fidelity facts with 1:1 linguistic precision.',
    steps: [
      'Click "New Fact" to initialize the knowledge discovery protocol.',
      'The engine will synchronize with the Useless Facts registry to retrieve a unique knowledge matrix.',
      'Review the fact text in the primary glass-morphic display area.',
      'Use the copy protocol to save the fact to your local clipboard.',
      'Optionally click the source link to verify the fact on the external host.'
    ],
    tips: [
      'Each query includes a unique timestamp to ensure hardware-native randomization.',
      'Use the share button to instantly deploy knowledge across social platforms.'
    ],
    privacy: 'All knowledge lookups are volatile and held strictly in local memory. No reading history is logged or transmitted.'
  },
  'jokes': {
    title: 'Joke Studio',
    description: 'Professional humor synthesis unit. Retrieve and reveal randomized jokes with linguistic precision.',
    steps: [
      'Click "New Joke" to initialize the humor discovery protocol.',
      'The "Setup" of the joke will be isolated in the primary matrix.',
      'Click "Reveal Punchline" to execute the final humor synthesis.',
      'Analyze the punchline and linguistic type of the identified slip.',
      'Use the copy protocol to save the humor matrix for external deployment.'
    ],
    tips: [
      'The punchline is hidden by default to preserve the discovery experience.',
      'A unique timestamp is added to each query to bypass browser cache.'
    ],
    privacy: 'All humor lookups are volatile and held strictly in local memory. No reading history is logged or transmitted.'
  },
  'country-info': {
    title: 'Country Info Studio',
    description: 'Professional geographic discovery engine. Isolate flags, demographics, and fiscal protocols of global nations.',
    steps: [
      'Enter a country name in the search matrix to initialize discovery.',
      'Select a specific nation from the 5-row live suggestion dropdown.',
      'The engine will synchronize with the REST Countries registry to retrieve current data.',
      'Review the demographic, political, and fiscal modules in the result matrix.',
      'Click "Launch Map Protocol" to see the coordinates on Google Maps.'
    ],
    tips: [
      'Enter partial names (e.g. "Pak") to see rapid identity matches.',
      'Population and Area values are synchronized with standard geographic databases.'
    ],
    privacy: 'All geographic queries are volatile and processed locally. No data intent is logged.'
  },
  'quran-ayah': {
    title: 'Quran Ayah Studio',
    description: 'Professional linguistic discovery engine for Quranic verses with original script and English translations.',
    steps: [
      'Click "New Ayah" to shuffle the randomization matrix and discover a new verse.',
      'To find a specific verse, enter the "Surah:Ayah" reference in the search box (e.g., 2:255).',
      'The engine will synchronize with the global registry to retrieve both Uthmani script and Asad translation.',
      'Analyze the Surah identity and Ayah index metadata displayed in the result cards.',
      'Use the copy protocol to save the textual matrix to your clipboard.'
    ],
    tips: [
      'Enter 2:255 for Ayat-ul-Kursi or 1:1 for the opening verse.',
      'The Arabic script uses the professional Uthmani font for peak readability.'
    ],
    privacy: 'All textual queries are processed strictly in local memory. No reading history is logged or transmitted.'
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
];

const CATEGORIES: { id: ToolCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'generators', label: 'Generators', icon: Shapes },
  { id: 'utilities', label: 'Utilities', icon: Zap },
];

const ToolItem = React.memo(({ item, mode }: { item: Tool, mode: 'grid' | 'list' }) => {
  const isGrid = mode === 'grid';

  return (
    <Link 
      href={item.href} 
      className={cn(
        "group relative flex transition-all duration-300 min-w-0",
        isGrid ? "h-full w-full" : "w-full !max-w-full !min-w-0"
      )}
    >
      <Card className={cn(
        "relative flex-1 flex rounded-[2rem] sm:rounded-[2.5rem] bg-secondary/30 border border-white/5 bg-white/40 dark:bg-card/40 backdrop-blur-2xl hover:border-primary/20 hover:bg-secondary/50 transition-all duration-500 shadow-2xl group-hover:shadow-primary/5 overflow-hidden",
        isGrid ? "flex-col p-5 sm:p-6 hover:-translate-y-2 text-left" : "flex-row items-center p-3 sm:p-6 hover:-translate-x-1 gap-4 sm:gap-6 !w-full !max-w-full !min-w-0"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={cn(
          "rounded-2xl flex items-center justify-center border transition-all duration-500 icon-container-3d relative z-10 shrink-0",
          isGrid ? "w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6" : "w-8 h-8 sm:w-12 sm:h-12",
          item.color
        )}>
          <item.icon className={cn("icon-3d", isGrid ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-6 sm:h-6")} />
          <div className={cn("absolute inset-0 blur-xl opacity-20 transition-opacity group-hover:opacity-40", item.glowClass)} />
        </div>

        <div className="relative z-10 space-y-1 sm:space-y-3 flex-1 min-w-0">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[7px] sm:text-[9px] font-black text-primary/60 uppercase tracking-[0.2em]">{item.label}</span>
              {isGrid && <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />}
            </div>
            <h3 className={cn(
              "font-headline font-black text-foreground uppercase tracking-tight leading-none group-hover:text-primary transition-colors truncate",
              isGrid ? "text-base sm:text-lg" : "text-sm sm:text-lg"
            )}>
              {item.title}
            </h3>
          </div>
          <p className={cn(
            "text-[9px] sm:text-xs text-foreground/40 leading-relaxed font-medium overflow-wrap-anywhere",
            isGrid ? "line-clamp-2" : "truncate"
          )}>
            {item.desc}
          </p>
          {isGrid && (
            <div className="mt-auto pt-4 sm:pt-6 flex items-center gap-2 sm:gap-2.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-primary translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              Open <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:translate-x-1 transition-transform duration-500 icon-3d" />
            </div>
          )}
        </div>

        {!isGrid && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-10 ml-auto">
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-primary/0 group-hover:text-primary transition-all translate-x-2 group-hover:translate-x-0 hidden md:inline-block">Open Studio</span>
            <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 text-primary/20 group-hover:text-primary transition-all group-hover:translate-x-1 icon-3d" />
          </div>
        )}
      </Card>
    </Link>
  );
});

ToolItem.displayName = 'ToolItem';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(9);
  
  // Search Placeholder Typing Animation Matrix
  const [placeholder, setPlaceholder] = useState('');
  const [toolIndex, setToolIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);
  const [isFocused, setIsFocused] = useState(false);

  const phrases = useMemo(() => {
    const list = [
      'Merge PDF', 'Compress Image', 'QR Generator', 'WhatsApp DP', 
      'Word to PDF', 'Photo Enhance', 'Age Calculator', 'Photo to Text', 
      'Logo Maker', 'Bulk Production', 'Password Studio', 'Color Picker',
      'Video to MP3', 'Image to PDF', 'AOB Converter', 'Nickname Studio',
      'Letter Art', 'Favicon Studio', 'JSON Formatter', 'Regex Tester', 'Hash Generator',
      'UUID Generator', 'Lorem Ipsum', 'Image Border', 'Custom Watermark', 'Barcode Reader',
      'Images to GIF', 'Image to WebP', 'Blur Face', 'WiFi QR', 'P2P Share', 'Send File', 'Toffee',
      'Hide text in image', 'Secret photo', 'Stenography', 'Temp Room', 'Clipboard share', 
      'Join code', 'Sim Data', 'HTML to URL', 'Paste HTML link', 'Tax Calculator', 'GST Calculator', 'Lucky Draw', 'Spin Wheel',
      'BMI Calculator', 'Body Mass Index', 'Healthy weight', 'Bio Maker', 'Instagram Bio', 'WPS Sheets', 'Inventory Table',
      'Enlarge image', 'KB size increaser', 'Speed Test', 'Internet speed', 'IP Finder', 'What is my IP', 'Currency Converter',
      'Exchange rate', 'USD to PKR', 'SAR conversion', 'Weather forecast', 'Current temperature', 'Rain projection',
      'Namaz Times', 'Prayer timings', 'Salat schedule', 'Karachi Namaz', 'Quran Ayah', 'Islamic verse', 'Random ayah',
      'Crypto Prices', 'Bitcoin BTC', 'ETH current price', 'Solana SOL', 'Country Info', 'Country details', 'World map',
      'English Dictionary', 'Word Meaning', 'Definition', 'Thesaurus', 'Advice Studio', 'Daily Wisdom', 'Advice Slip',
      'Pet Studio', 'Dog photos', 'Cat pictures', 'Jokes Studio', 'Random Joke', 'Punchline', 'Random Facts', 'Useless Facts',
      'Pokemon Studio', 'Pokedex', 'Pokemon stats', 'Book Studio', 'Find Books', 'Open Library', 'Holiday Studio', 'Pakistan Holidays',
      'Quote Studio', 'Motivation', 'Zen Quotes', 'Image Gallery', 'Search NASA', 'Art History', 'Translate', 'Free Games', 'Coding Matrix',
      'Wikipedia Studio', 'Summarize', 'Search Wikipedia', 'City Explorer', 'Pakistan Cities', 'Address Lookup', 'GitHub Finder', 'Developer profile',
      'Password Breach', 'Pwned Check', 'Hack Search', 'Website Trust', 'Domain Safety', 'DNS Lookup', 'MX Records', 'URL Shortener', 'Tiny Link',
      'Wallpapers Studio', 'PC backgrounds', 'Mobile wallpapers', 'NASA APOD', '4K backgrounds', 'Image to Link', 'Direct URL', 'Hosting', 'FILE HOST', 'Upload Studio',
      'Background Remove', 'Transparent Image', 'Remove.bg', 'Temp Mail', 'Anonymous Email', 'Disposable Mail'
    ];
    return [...list].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (isFocused || searchQuery) {
      setPlaceholder('');
      return;
    }

    const timeout = setTimeout(() => {
      const currentPhrase = phrases[toolIndex];
      
      if (!isDeleting) {
        setPlaceholder(currentPhrase.substring(0, placeholder.length + 1));
        if (placeholder.length === currentPhrase.length) {
          setTypingSpeed(1400); 
          setIsDeleting(true);
        } else {
          setTypingSpeed(70);
        }
      } else {
        const nextLength = Math.max(0, placeholder.length - 1);
        setPlaceholder(currentPhrase.slice(0, nextLength));
        setTypingSpeed(35);
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setToolIndex((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(500);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, toolIndex, phrases, typingSpeed, isFocused, searchQuery]);

  const dynamicPlaceholder = useMemo(() => {
    if (isFocused || searchQuery) return 'Search tools...';
    return `${placeholder}|`;
  }, [placeholder, isFocused, searchQuery]);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY) as 'grid' | 'list' | null;
    if (saved) setViewMode(saved);
  }, []);

  const toggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const filteredTools = useMemo(() => {
    let result = TOOLS;
    
    if (selectedCategory !== 'all') {
      result = result.filter(tool => tool.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      result = result.filter(tool => {
        const targetString = `${tool.title} ${tool.desc} ${tool.keywords.join(' ')}`.toLowerCase();
        return words.every(word => targetString.includes(word));
      });
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const visibleTools = useMemo(() => {
    return filteredTools.slice(0, visibleCount);
  }, [filteredTools, visibleCount]);

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MY KIT TOOL",
            "url": "https://mykittool.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://mykittool.app/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* HERO SECTION */}
      <section className="w-full pt-16 pb-6 md:pt-24 md:pb-8 min-h-0 text-center relative overflow-hidden flex flex-col justify-center max-w-full px-4 sm:px-6">
        <SpaceBackground />
        
        <div className="w-full max-w-5xl mx-auto animate-reveal relative z-10 px-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <Command className="w-2.5 h-2.5 sm:w-3 sm:h-3 icon-3d" /> Digital Studio v7.2
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-[8px] sm:text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
              Verified {TOOLS.length} Units
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-headline font-black mb-4 leading-[1.1] sm:leading-[1.1] tracking-tighter text-foreground uppercase max-w-4xl mx-auto overflow-wrap-anywhere px-2">
            The World’s Most <span className="text-primary">Advanced</span> Tool Studio
          </h1>
          <p className="text-xs sm:text-lg text-foreground/40 max-w-2xl mx-auto leading-relaxed font-medium mb-8 px-4 overflow-wrap-anywhere">
            Professional high-fidelity asset generation and technical data translation. Engineered for high-performance workflows with 100% hardware-native privacy.
          </p>

          {/* Search & Category Bar */}
          <div className="w-full max-w-4xl mx-auto space-y-6">
             {/* Search Input */}
             <div className="w-full max-w-2xl mx-auto group relative">
                <div className="absolute -inset-10 bg-primary/10 blur-[60px] rounded-full opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                <div className="absolute -inset-[3px] rounded-[1.4rem] bg-primary/30 opacity-0 group-hover:opacity-60 group-focus-within/search:opacity-0 transition-opacity duration-500 animate-search-glow blur-[2px] pointer-events-none" />

                <div className="relative h-14 sm:h-16 w-full rounded-2xl p-[1px] bg-gradient-to-b from-white/20 to-transparent shadow-2xl duration-500 group-hover:from-primary/30 group-focus-within/search:from-primary/60 group-focus-within/search:to-primary/30">
                  <div className="moving-border-matrix" />
                  <div className="relative flex items-center w-full h-full bg-card rounded-[calc(1rem-1px)] overflow-hidden border border-white/10 group-focus-within/search:border-primary/50 group-focus-within/search:shadow-[0_0_60px_-5px_rgba(59,130,246,0.6)] transition-all duration-300 z-10 box-border">
                    <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-none">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/20 group-focus-within/search:text-primary transition-colors icon-3d" />
                    </div>
                    <Input 
                      type="text"
                      placeholder={dynamicPlaceholder}
                      aria-label="Search tools"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-full w-full pl-10 sm:pl-14 pr-10 sm:pr-12 bg-transparent border-none focus-visible:ring-0 rounded-none text-sm sm:text-base font-medium placeholder:text-foreground/20"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-4 sm:right-5 flex items-center text-foreground/20 hover:text-primary transition-colors"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 icon-3d" />
                      </button>
                    )}
                  </div>
                </div>
             </div>

             {/* Category Pills */}
             <div className="z-20 flex flex-wrap items-center justify-center gap-2 p-2 rounded-[1.5rem] sm:rounded-[2rem] bg-secondary/50 border border-white/5 backdrop-blur-xl shadow-2xl w-full sm:w-fit mx-auto overflow-hidden">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setVisibleCount(9);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                      selectedCategory === cat.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105" 
                        : "bg-white/5 border-white/5 text-foreground/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5"
                    )}
                  >
                    <cat.icon className={cn("w-3 sm:w-3.5 h-3 sm:h-3.5", selectedCategory === cat.id ? "icon-3d" : "")} />
                    <span>{cat.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mt-6 mb-10">
            <div className="inline-flex p-1 rounded-2xl bg-secondary/50 border border-white/5 backdrop-blur-xl relative group/toggle shadow-2xl">
               <div 
                  className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-xl transition-all duration-300 shadow-lg shadow-primary/20",
                    viewMode === 'grid' ? "left-1" : "left-[calc(50%+1px)]"
                  )}
               />
               <button 
                onClick={() => toggleViewMode('grid')}
                className={cn(
                  "relative z-10 flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl transition-all text-[8px] sm:text-[9px] font-black uppercase tracking-widest",
                  viewMode === 'grid' ? "text-primary-foreground" : "text-foreground/40 hover:text-primary"
                )}
               >
                 <LayoutGrid className="w-3.5 h-3.5 icon-3d" /> Grid
               </button>
               <button 
                onClick={() => toggleViewMode('list')}
                className={cn(
                  "relative z-10 flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl transition-all text-[8px] sm:text-[9px] font-black uppercase tracking-widest",
                  viewMode === 'list' ? "text-primary-foreground" : "text-foreground/40 hover:text-primary"
                )}
               >
                 <List className="w-3.5 h-3.5 icon-3d" /> List
               </button>
            </div>
          </div>

          <div className="space-y-12 w-full max-w-full">
            <div className={cn(
              "w-full transition-all duration-300 max-w-full",
              viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" : "flex flex-col gap-3 sm:gap-4 max-w-full mx-auto"
            )}>
              {visibleTools.length > 0 ? (
                visibleTools.map((item) => (
                  <ToolItem key={item.href} item={item} mode={viewMode} />
                ))
              ) : (
                <EmptyState onReset={() => { setSearchQuery(''); setSelectedCategory('all'); setVisibleCount(9); }} />
              )}
            </div>

            {visibleCount < filteredTools.length && (
              <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <ShadButton 
                   onClick={() => setVisibleCount(prev => prev + 6)}
                   variant="outline"
                   className="h-14 sm:h-16 px-10 sm:px-12 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs backdrop-blur-xl hover:bg-primary/10 shadow-xl shadow-primary/5 active:scale-95 transition-all hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] group/see"
                 >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover/see:translate-y-1 transition-transform" />
                    See More Tools
                 </ShadButton>
                 <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">
                    Displaying {visibleCount} of {filteredTools.length} units
                 </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full py-16 sm:py-24 glass-card rounded-[2.5rem] sm:rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center gap-6 sm:gap-8 px-6">
      <Search className="w-10 h-10 sm:w-12 sm:h-12 text-foreground/5 animate-pulse icon-3d" />
      <div className="space-y-2 text-center">
        <h3 className="text-xl sm:text-2xl font-headline font-black text-foreground uppercase tracking-tight">No Units Found</h3>
        <p className="text-[10px] sm:sm text-foreground/30 font-medium uppercase tracking-widest">Adjust query parameters for wider discovery</p>
      </div>
      <ShadButton 
        onClick={onReset}
        variant="outline"
        className="h-12 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest border-white/10 w-full sm:w-auto"
      >
        <RotateCcw className="w-4 h-4 mr-2 icon-3d" />
        Reset Filters
      </ShadButton>
    </div>
  );
}
