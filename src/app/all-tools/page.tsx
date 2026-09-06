'use client';

import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, ArrowRight, BrainCircuit, ImageIcon, FileText, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Add a style tag to hide the scrollbar
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

type ToolCategory = 'AI' | 'Image' | 'File' | 'Other';

interface Tool {
  href: string;
  title: string;
  desc: string;
  category: ToolCategory;
  icon: React.ElementType;
  keywords?: string[];
}

const TOOLS: Tool[] = [
  // AI Tools
  { href: '/ai-chatbot', title: 'AI Chatbot', desc: 'Chat with a fast AI assistant.', category: 'AI', icon: BrainCircuit, keywords: ['artificial intelligence', 'conversation', 'bot', 'chat'] },
  { href: '/ai-resume-builder', title: 'AI Resume Builder', desc: 'Create a clean professional resume in minutes.', category: 'AI', icon: BrainCircuit, keywords: ['cv', 'job application', 'career', 'resume'] },
  { href: '/ai-email-writer', title: 'AI Email Writer', desc: 'Write a clean email in seconds.', category: 'AI', icon: BrainCircuit, keywords: ['compose', 'mail', 'message', 'email'] },
  { href: '/ai-code-generator', title: 'AI Code Generator', desc: 'Create code from a simple request.', category: 'AI', icon: BrainCircuit, keywords: ['programming', 'scripting', 'develop', 'code'] },
  { href: '/ai-image-generator', title: 'AI Image Generator', desc: 'Create images from text for free.', category: 'AI', icon: BrainCircuit, keywords: ['art', 'drawing', 'dalle', 'image', 'img', 'photo'] },
  { href: '/speech-to-text', title: 'Speech to Text', desc: 'Convert your voice into text instantly in the browser.', category: 'AI', icon: BrainCircuit, keywords: ['transcribe', 'voice typing'] },
  { href: '/text-to-speech', title: 'Text to Speech', desc: 'Convert any text into speech instantly in your browser.', category: 'AI', icon: BrainCircuit, keywords: ['read aloud', 'voiceover'] },
  { href: '/photo-enhance-fix', title: 'Photo Enhance', desc: 'Upscale resolution, sharpen edges, and restore clarity.', category: 'AI', icon: BrainCircuit, keywords: ['upscale', 'fix', 'restore', 'image', 'photo', 'jpg', 'png'] },
  { href: '/vocal-separator', title: 'Vocal Remover', desc: 'Simple stereo matrix for vocal or music reduction.', category: 'AI', icon: BrainCircuit, keywords: ['music', 'acapella', 'karaoke', 'audio'] },

  // Image Tools
  { href: '/single', title: 'Single Studio', desc: 'Branded QR codes with logos and AI backgrounds.', category: 'Image', icon: ImageIcon, keywords: ['qr code', 'branding'] },
  { href: '/background-remove', title: 'Background Remove', desc: 'Isolate subjects from photos and export high-fidelity transparent PNGs.', category: 'Image', icon: ImageIcon, keywords: ['remove bg', 'transparent', 'png', 'image', 'photo'] },
  { href: '/image-to-link', title: 'Image to Link', desc: 'Upload visual assets and generate shareable link matrices via Imgur.', category: 'Image', icon: ImageIcon, keywords: ['hosting', 'share', 'imgur', 'image', 'photo'] },
  { href: '/blur-face-plate', title: 'Blur Face / Plate', desc: 'Quickly hide faces and number plates in your photos locally.', category: 'Image', icon: ImageIcon, keywords: ['censor', 'privacy', 'redact', 'image', 'photo'] },
  { href: '/image-to-webp', title: 'Image to WebP', desc: 'Convert imagery into next-gen optimized WebP masters locally.', category: 'Image', icon: ImageIcon, keywords: ['converter', 'webp', 'image', 'photo'] },
  { href: '/images-to-gif', title: 'Images to GIF', desc: 'Synthesize high-fidelity animated GIFs from multiple photos locally.', category: 'Image', icon: ImageIcon, keywords: ['gif maker', 'animation', 'image', 'photo'] },
  { href: '/custom-watermark', title: 'Custom Watermark', desc: 'Protect photos and videos with custom text or logos locally.', category: 'Image', icon: ImageIcon, keywords: ['logo', 'copyright', 'image', 'photo'] },
  { href: '/image-border-frame', title: 'Image Border & Frame', desc: 'Add professional borders and artistic frames to your photos.', category: 'Image', icon: ImageIcon, keywords: ['photo frame', 'border', 'image'] },
  { href: '/passport-photo-maker', title: 'Passport Photo', desc: 'Create official ID photos and printable A4 sheets.', category: 'Image', icon: ImageIcon, keywords: ['id photo', 'visa', 'image'] },
  { href: '/whatsapp-dp-maker', title: 'WhatsApp DP', desc: 'Make full-size WhatsApp profile pics without quality loss.', category: 'Image', icon: ImageIcon, keywords: ['profile picture', 'image', 'photo'] },
  { href: '/youtube-thumbnail-maker', title: 'YT Thumbnail', desc: 'Resize and frame images for 1280x720 thumbnails.', category: 'Image', icon: ImageIcon, keywords: ['youtube', 'thumbnail', 'image', 'photo'] },
  { href: '/youtube-banner-maker', title: 'YouTube Banner', desc: 'Create 2560x1440 channel art with safe-zone guides.', category: 'Image', icon: ImageIcon, keywords: ['youtube', 'banner', 'image', 'photo'] },
  { href: '/collage-maker', title: 'Collage Studio', desc: 'Combine multiple images into professional grid layouts.', category: 'Image', icon: ImageIcon, keywords: ['photo collage', 'grid', 'image'] },
  { href: '/favicon-generator', title: 'Favicon Studio', desc: 'Generate web icon sets from any image instantly.', category: 'Image', icon: ImageIcon, keywords: ['website icon', 'image', 'photo'] },
  { href: '/metadata-remover', title: 'Privacy Purge', desc: 'Strip GPS and EXIF metadata from any photo.', category: 'Image', icon: ImageIcon, keywords: ['exif', 'gps', 'privacy', 'image', 'photo'] },
  { href: '/color-picker', title: 'Color Picker', desc: 'Extract HEX, RGB, and HSL from any image.', category: 'Image', icon: ImageIcon, keywords: ['hex', 'rgb', 'image', 'photo'] },
  { href: '/image-converter', title: 'Image Converter', desc: 'Seamlessly switch between PNG and JPG formats.', category: 'Image', icon: ImageIcon, keywords: ['jpg', 'png', 'jpeg', 'webp', 'image', 'photo'] },
  { href: '/image-resizer', title: 'Image Resizer', desc: 'Scale pixel dimensions with aspect ratio control.', category: 'Image', icon: ImageIcon, keywords: ['resize', 'scale', 'image', 'photo'] },
  { href: '/image-compressor', title: 'Image Compressor', desc: 'Shrink file size locally with quality control.', category: 'Image', icon: ImageIcon, keywords: ['compress', 'shrink', 'image', 'photo', 'jpg', 'png'] },
  { href: '/photo-editor', title: 'Photo Studio', desc: 'Professional filters and local image editing.', category: 'Image', icon: ImageIcon, keywords: ['edit', 'filters', 'image', 'photo'] },
  { href: '/letter-art', title: 'Letter Art', desc: 'Image to text conversion using custom alphabets.', category: 'Image', icon: ImageIcon, keywords: ['ascii art', 'text art', 'image'] },
  { href: '/dot-art', title: 'Dot Art Studio', desc: 'Convert images to intricate Braille character art.', category: 'Image', icon: ImageIcon, keywords: ['braille', 'art', 'image'] },
  { href: '/png-finder', title: 'PNG Finder Studio', desc: 'Search and download PNG images for editing', category: 'Image', icon: ImageIcon, keywords: ['transparent', 'image', 'png'] },
  { href: '/icon-studio', title: 'Icon Studio', desc: 'Search social icons, recolor, download SVG PNG ICO', category: 'Image', icon: ImageIcon, keywords: ['svg', 'ico', 'png', 'image'] },
  { href: '/mouse-cursor-maker', title: 'Mouse Cursor Maker', desc: 'Convert any image into a real Windows .cur mouse cursor.', category: 'Image', icon: ImageIcon, keywords: ['cursor', '.cur', 'image'] },
  { href: '/image-gallery', title: 'Image Gallery', desc: 'Extract high-res visuals from global scientific and art registries.', category: 'Image', icon: ImageIcon, keywords: ['gallery', 'photo', 'image'] },

  // File Tools
  { href: '/reverse-video', title: 'Reverse Video', desc: 'Reverse any video in your browser with FFmpeg.wasm.', category: 'File', icon: FileText, keywords: ['video', 'reverse'] },
  { href: '/temp-upload', title: 'Temp Upload', desc: 'Upload files with expiry reminders.', category: 'File', icon: FileText, keywords: ['temporary storage', 'file sharing'] },
  { href: '/site-backup-cloner', title: 'Site Backup Cloner', desc: 'Download public frontend assets into a local ZIP backup.', category: 'File', icon: FileText, keywords: ['website backup', 'clone'] },
  { href: '/telegram-file-host', title: 'FILE HOST', desc: 'Archive and share any file via the Cloud Host Protocol.', category: 'File', icon: FileText, keywords: ['telegram', 'file hosting'] },
  { href: '/html-to-url', title: 'HTML to URL', desc: 'Convert raw HTML code into a hosted shareable link.', category: 'File', icon: FileText, keywords: ['html', 'hosting'] },
  { href: '/direct-file-share', title: 'Direct File Share', desc: 'Send large files directly to any device via secret link.', category: 'File', icon: FileText, keywords: ['peer to peer', 'p2p'] },
  { href: '/rename-file', title: 'Rename File', desc: 'Rename any file and download with the new name.', category: 'File', icon: FileText, keywords: ['file rename'] },
  { href: '/csv-to-json', title: 'CSV to JSON', desc: 'Professional data translation with header mapping.', category: 'File', icon: FileText, keywords: ['csv', 'json', 'converter'] },
  { href: '/json-to-csv', title: 'JSON to CSV', desc: 'Deep object flattening and matrix translation.', category: 'File', icon: FileText, keywords: ['json', 'csv', 'converter'] },
  { href: '/pdf-unlock', title: 'PDF Unlock', desc: 'Remove security passwords from protected PDF masters.', category: 'File', icon: FileText, keywords: ['pdf password remover', 'unlock pdf', 'pdf'] },
  { href: '/pdf-password-protect', title: 'PDF Password', desc: 'Encrypt PDF documents with passwords and permissions.', category: 'File', icon: FileText, keywords: ['protect pdf', 'lock pdf', 'pdf'] },
  { href: '/text-to-pdf', title: 'Text to PDF', desc: 'Convert raw text or .txt files into professional PDF masters.', category: 'File', icon: FileText, keywords: ['txt to pdf', 'document', 'pdf'] },
  { href: '/word-to-pdf', title: 'Word to PDF', desc: 'Convert Word .docx documents into PDF masters locally.', category: 'File', icon: FileText, keywords: ['docx to pdf', 'word', 'pdf'] },
  { href: '/pdf-to-image', title: 'PDF to Image', desc: 'Convert PDF pages into high-resolution PNG or JPG assets.', category: 'File', icon: FileText, keywords: ['pdf to png', 'pdf to jpg', 'pdf', 'image'] },
  { href: '/pdf-splitter', title: 'PDF Splitter', desc: 'Extract pages, custom ranges, or chunks from documents.', category: 'File', icon: FileText, keywords: ['split pdf', 'pdf'] },
  { href: '/pdf-compressor', title: 'PDF Compressor', desc: 'Optimize and shrink PDF document size locally.', category: 'File', icon: FileText, keywords: ['compress pdf', 'shrink pdf', 'pdf'] },
  { href: '/pdf-merger', title: 'PDF Merger', desc: 'Combine multiple PDF documents into a single master file.', category: 'File', icon: FileText, keywords: ['merge pdf', 'combine pdf', 'pdf'] },
  { href: '/image-to-file', title: 'Image to File', desc: 'Convert imagery to PNG, JPG, WebP, or single-page PDF.', category: 'File', icon: FileText, keywords: ['image', 'pdf', 'png', 'jpg'] },
  { href: '/file-compressor', title: 'File Compressor', desc: 'Browser-side size reduction for visual and digital assets.', category: 'File', icon: FileText, keywords: ['zip', 'compress'] },
  { href: '/image-to-pdf', title: 'Image to PDF', desc: 'Convert multiple images into a professional PDF.', category: 'File', icon: FileText, keywords: ['jpg to pdf', 'png to pdf', 'images to pdf', 'pdf'] },
  { href: '/video-to-audio', title: 'Video to MP3', desc: 'Extract high-quality audio tracks from videos.', category: 'File', icon: FileText, keywords: ['video to mp3', 'extract audio'] },
  { href: '/video-to-gif', title: 'Video to GIF', desc: 'Synthesize high-quality animated GIFs from clips.', category: 'File', icon: FileText, keywords: ['gif maker', 'animation'] },
  { href: '/audio-joiner', title: 'Audio Joiner', desc: 'Merge multiple audio files into a single master track.', category: 'File', icon: FileText, keywords: ['merge audio', 'combine audio'] },
  { href: '/audio-booster', title: 'Volume Booster', desc: 'Amplify audio levels safely entirely in your browser.', category: 'File', icon: FileText, keywords: ['increase volume', 'amplify'] },
  { href: '/html-site-rescue', title: 'HTML Site Rescue', desc: 'Recover local index.html + libs into hosting ZIP', category: 'File', icon: FileText, keywords: ['website recovery', 'html'] },
  
  // Other Tools
  { href: '/voice-changer', title: 'Voice Changer', desc: 'Change your voice live with robot, deep, helium and more effects.', category: 'Other', icon: Zap, keywords: ['voice effects', 'audio'] },
  { href: '/whatsapp-link-generator', title: 'WhatsApp Link', desc: 'Generate instant chat links with custom messages.', category: 'Other', icon: Zap, keywords: ['whatsapp', 'link generator'] },
  { href: '/all-units-converter', title: 'All Units Converter', desc: 'Convert Length, Weight, Temp, and more.', category: 'Other', icon: Zap, keywords: ['unit converter', 'measurement'] },
  { href: '/fake-data', title: 'Fake Data Generator', desc: 'Generate realistic fake data for testing.', category: 'Other', icon: Zap, keywords: ['test data', 'dummy data'] },
  { href: '/username-checker', title: 'Username Checker', desc: 'Check username availability across 20+ major platforms.', category: 'Other', icon: Zap, keywords: ['social media', 'username'] },
  { href: '/domain-whois', title: 'Domain Whois', desc: 'Isolate domain birth-dates, registrar metadata, and security status.', category: 'Other', icon: Zap, keywords: ['whois', 'domain lookup'] },
  { href: '/temp-mail', title: 'Temp Mail Pro', desc: 'Advanced multi-node temporary email synthesis.', category: 'Other', icon: Zap, keywords: ['disposable email', 'temp email'] },
  { href: '/gmail-alias', title: 'Gmail Alias Generator', desc: 'Create unlimited Gmail aliases using Dot Trick & Plus Addressing.', category: 'Other', icon: Zap, keywords: ['gmail', 'alias'] },
  { href: '/link-safety-checker', title: 'Link Safety', desc: 'Expand short links and identify potential phishing threats.', category: 'Other', icon: Zap, keywords: ['phishing', 'link checker'] },
  { href: '/dns-lookup', title: 'DNS Lookup', desc: 'Professional DNS record discovery and auditing.', category: 'Other', icon: Zap, keywords: ['dns', 'lookup'] },
  { href: '/password-breach-checker', title: 'Breach Checker', desc: 'Verify if passwords have been exposed using secure k-Anonymity.', category: 'Other', icon: Zap, keywords: ['password checker', 'security'] },
  { href: '/website-trust-checker', title: 'Trust Checker', desc: 'Professional multi-node security diagnostics and domain auditing.', category: 'Other', icon: Zap, keywords: ['website security', 'trust'] },
  { href: '/github-user', title: 'GitHub Finder', desc: 'Isolate developer profile metadata, repository density, and social reach.', category: 'Other', icon: Zap, keywords: ['github', 'developer'] },
  { href: '/coding-resources', title: 'Coding Matrix', desc: 'Isolate high-fidelity learning assets and technical documentation.', category: 'Other', icon: Zap, keywords: ['programming', 'learn to code'] },
  { href: '/free-games', title: 'Free Games', desc: 'Isolate high-fidelity free titles for PC and Browser.', category: 'Other', icon: Zap, keywords: ['games', 'gaming'] },
  { href: '/translate', title: 'Translate Studio', desc: 'Professional English to Urdu translation with real-time sync.', category: 'Other', icon: Zap, keywords: ['translation', 'urdu'] },
  { href: '/holidays', title: 'Holiday Studio', desc: 'Isolate global public holidays and verified Pakistan 2026 matrix.', category: 'Other', icon: Zap, keywords: ['holidays', 'pakistan'] },
  { href: '/pokemon', title: 'Pokemon Studio', desc: 'Isolate high-fidelity unit data, base stats, and visual identifiers.', category: 'Other', icon: Zap, keywords: ['pokemon', 'pokedex'] },
  { href: '/facts', title: 'Fact Studio', desc: 'Synthesize high-fidelity useless facts and randomized knowledge instantly.', category: 'Other', icon: Zap, keywords: ['random facts', 'knowledge'] },
  { href: '/pets', title: 'Pet Studio', desc: 'Professional random pet discovery. Isolate canine and feline visual identities.', category: 'Other', icon: Zap, keywords: ['pets', 'cats', 'dogs'] },
  { href: '/country', title: 'Country Info', desc: 'Isolate clinical profiles, flags, and geographic matrices of global identities.', category: 'Other', icon: Zap, keywords: ['country data', 'geography'] },
  { href: '/crypto-prices', title: 'Crypto Prices', desc: 'Real-time market telemetry for BTC, ETH, and more in USD/PKR.', category: 'Other', icon: Zap, keywords: ['cryptocurrency', 'bitcoin', 'ethereum'] },
  { href: '/quran-ayah', title: 'Quran Ayah', desc: 'Explore verses through random synthesis or clinical reference lookup.', category: 'Other', icon: Zap, keywords: ['quran', 'islam'] },
  { href: '/namaz-times', title: 'Namaz Times', desc: 'Clinical prayer timings with Hijri calendar and countdown.', category: 'Other', icon: Zap, keywords: ['prayer times', 'islam'] },
  { href: '/weather', title: 'Weather Intel', desc: 'Real-time global forecast with 3-day projection matrix.', category: 'Other', icon: Zap, keywords: ['weather forecast'] },
  { href: '/speed-test', title: 'Speed Test', desc: 'Professional network telemetry. Test download, upload, and ping.', category: 'Other', icon: Zap, keywords: ['internet speed'] },
  { href: '/currency-converter', title: 'Currency Converter', desc: 'Real-time global exchange rates with local-only processing.', category: 'Other', icon: Zap, keywords: ['exchange rates'] },
  { href: '/ip-finder', title: 'IP Finder', desc: 'Isolate network identity, ISP, and geographic coordinates.', category: 'Other', icon: Zap, keywords: ['ip address', 'geolocation'] },
  { href: '/keyboard-test', title: 'Keyboard Test', desc: 'Professional hardware integrity matrix. Test every key for response.', category: 'Other', icon: Zap, keywords: ['keyboard checker'] },
  { href: '/image-size-increaser', title: 'Size Increaser', desc: 'Enlarge images and inflate file size for specific requirements.', category: 'Other', icon: Zap, keywords: ['image enlarger', 'photo', 'image'] },
  { href: '/wps-sheets', title: 'WPS Sheets', desc: 'Create and edit spreadsheets for WPS and Excel locally.', category: 'Other', icon: Zap, keywords: ['spreadsheet', 'excel'] },
  { href: '/bio-maker', title: 'Bio Maker Studio', desc: 'Generate aesthetic, unique bios for IG, TikTok, WA, and FB.', category: 'Other', icon: Zap, keywords: ['instagram bio', 'tiktok bio'] },
  { href: '/bmi-calculator', title: 'BMI Calculator', desc: 'Calculate body mass index and healthy weight ranges.', category: 'Other', icon: Zap, keywords: ['body mass index'] },
  { href: '/lucky-draw', title: 'Lucky Draw', desc: 'Fair random selection wheel for giveaways and prizes.', category: 'Other', icon: Zap, keywords: ['random wheel', 'giveaway'] },
  { href: '/tax-calculator', title: 'Tax Calculator', desc: 'Calculate extra % or reverse-lookup original prices instantly.', category: 'Other', icon: Zap, keywords: ['sales tax', 'vat'] },
  { href: '/sim-data', title: 'Sim Data Finder', desc: 'Identify carrier and regional data for Pakistani numbers.', category: 'Other', icon: Zap, keywords: ['sim card', 'pakistan'] },
  { href: '/temp-room', title: 'Temp Room', desc: 'Shared live clipboard. Instant text sync between devices.', category: 'Other', icon: Zap, keywords: ['clipboard sharing'] },
  { href: '/hide-message-photo', title: 'Hide in Photo', desc: 'Embed secret messages inside images using steganography.', category: 'Other', icon: Zap, keywords: ['steganography', 'secret message', 'image', 'photo'] },
  { href: '/wifi-qr-decoder', title: 'WiFi QR Finder', desc: 'Extract hidden network passwords from any WiFi QR code.', category: 'Other', icon: Zap, keywords: ['wifi password', 'qr code'] },
  { href: '/bulk', title: 'Bulk Production', desc: 'Generate hundreds of high-res assets in seconds.', category: 'Other', icon: Zap, keywords: ['bulk generation'] },
  { href: '/nickname-generator', title: 'Nickname Studio', desc: 'Synthesize stylized nicknames and gamertags with artistic matrixing.', category: 'Other', icon: Zap, keywords: ['gamertag', 'username'] },
  { href: '/lorem-ipsum-generator', title: 'Lorem Ipsum', desc: 'Synthesize professional placeholder text for design prototypes.', category: 'Other', icon: Zap, keywords: ['placeholder text'] },
  { href: '/hash-generator', title: 'Hash Generator', desc: 'Generate MD5, SHA-1, SHA-256 and SHA-512 hashes locally.', category: 'Other', icon: Zap, keywords: ['md5', 'sha1', 'sha256', 'sha512'] },
  { href: '/uuid-generator', title: 'UUID Generator Studio', desc: 'Generate cryptographically-secure UUID v4 identifiers.', category: 'Other', icon: Zap, keywords: ['uuid', 'guid'] },
  { href: '/json-formatter', title: 'JSON Formatter PRO', desc: 'Pretty-print, minify, and validate JSON data structures.', category: 'Other', icon: Zap, keywords: ['json beautifier', 'json validator'] },
  { href: '/regex-tester', title: 'Regex Tester PRO', desc: 'Test and evaluate regular expressions with live matches.', category: 'Other', icon: Zap, keywords: ['regular expression'] },
  { href: '/logo-maker', title: 'Logo Text Studio', desc: 'Generate premium text-based logos and avatars.', category: 'Other', icon: Zap, keywords: ['logo generator'] },
  { href: '/duplicate-finder', title: 'Duplicate Purge', desc: 'Find and remove redundant files from projects or ZIPs.', category: 'Other', icon: Zap, keywords: ['duplicate file finder'] },
  { href: '/duplicate-line-remover', title: 'Line Purge', desc: 'Remove duplicate lines from text or lists instantly.', category: 'Other', icon: Zap, keywords: ['remove duplicate lines'] },
  { href: '/password-generator', title: 'Password Studio', desc: 'Generate cryptographically-secure strong passwords.', category: 'Other', icon: Zap, keywords: ['strong password'] },
  { href: '/word-counter', title: 'Word Counter', desc: 'Live text analysis and reading time estimation.', category: 'Other', icon: Zap, keywords: ['character count'] },
  { href: '/rgb-picker', title: 'RGB Studio', desc: 'Precision color picking and space conversion.', category: 'Other', icon: Zap, keywords: ['color picker', 'hex'] },
  { href: '/markdown-preview', title: 'Markdown', desc: 'Live Markdown to HTML synthesis with visual preview.', category: 'Other', icon: Zap, keywords: ['markdown editor'] },
  { href: '/repeater', title: 'Text Repeater', desc: 'Professional emoji and text multiplication.', category: 'Other', icon: Zap, keywords: ['text multiplier'] },
  { href: '/hex-converter', title: 'Hex Converter', desc: 'Convert binary files to hexadecimal matrix.', category: 'Other', icon: Zap, keywords: ['binary to hex'] },
  { href: '/code-converter', title: 'AOB Converter', desc: 'Professional AOB pattern conversion utility.', category: 'Other', icon: Zap, keywords: ['array of bytes'] },
  { href: '/dictionary', title: 'Dictionary', desc: 'Professional English word search and definitions.', category: 'Other', icon: Zap, keywords: ['word definition'] },
  { href: '/username-forge', title: 'Username Forge', desc: 'Forge unique usernames and check cross-platform availability.', category: 'Other', icon: Zap, keywords: ['username generator'] },
  { href: '/hashtag-engine', title: 'Hashtag Engine', desc: 'Generate strong hashtags for social growth and niche discovery', category: 'Other', icon: Zap, keywords: ['hashtag generator'] },
];

const CATEGORIES: { id: 'all' | ToolCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Zap },
    { id: 'AI', label: 'AI', icon: BrainCircuit },
    { id: 'Image', label: 'Image', icon: ImageIcon },
    { id: 'File', label: 'File', icon: FileText },
    { id: 'Other', label: 'Other', icon: Zap },
];

const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator,
      );
    }
  }
  return matrix[b.length][a.length];
};

export default function AllToolsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | ToolCategory>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const aiToolsCount = useMemo(() => TOOLS.filter(t => t.category === 'AI').length, []);
    const fileToolsCount = useMemo(() => TOOLS.filter(t => t.category === 'File').length, []);

    const { displayedTools, didYouMean, showSuggestionsHeader, showEmptyState } = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        const categoryFilteredTools = TOOLS.filter(tool => activeCategory === 'all' || tool.category === activeCategory);

        if (!lowerCaseQuery) {
            return { displayedTools: categoryFilteredTools, didYouMean: null, showSuggestionsHeader: false, showEmptyState: false };
        }
        
        if (!/[a-z]/.test(lowerCaseQuery)) {
             return { displayedTools: [], didYouMean: null, showSuggestionsHeader: false, showEmptyState: true };
        }

        const exactMatches = categoryFilteredTools.filter(tool =>
            tool.title.toLowerCase().includes(lowerCaseQuery) ||
            tool.desc.toLowerCase().includes(lowerCaseQuery) ||
            tool.href.toLowerCase().includes(lowerCaseQuery) ||
            (tool.keywords && tool.keywords.some(k => k.toLowerCase().includes(lowerCaseQuery)))
        );

        if (exactMatches.length > 0) {
            return { displayedTools: exactMatches, didYouMean: null, showSuggestionsHeader: false, showEmptyState: false };
        }

        const allToolsWithDistance = categoryFilteredTools.map(tool => ({
            ...tool,
            distance: levenshteinDistance(lowerCaseQuery, tool.title.toLowerCase()),
        })).sort((a, b) => a.distance - b.distance);

        const suggestions = allToolsWithDistance.slice(0, 6);
        const bestMatch = suggestions[0];

        const didYouMeanSuggestion = (bestMatch && bestMatch.distance > 0 && bestMatch.distance <= 3) ? bestMatch.title : null;

        return { 
            displayedTools: suggestions, 
            didYouMean: didYouMeanSuggestion, 
            showSuggestionsHeader: true, 
            showEmptyState: suggestions.length === 0
        };

    }, [searchQuery, activeCategory]);

    return (
      <div className="min-h-screen w-full bg-black text-gray-300 relative overflow-hidden font-sans">
        <style>{scrollbarHideStyle}</style>
        <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute inset-0 bg-radial-gradient-purple"></div>
            <div className="absolute inset-0 bg-radial-gradient-blue"></div>
        </div>
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          
          <div className="pt-20 pb-10 text-center">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              All Tools
            </h1>
            <p className="mt-3 text-base sm:text-lg max-w-2xl mx-auto text-gray-400">
              A complete suite of {TOOLS.length} powerful, free, and easy-to-use tools to streamline your tasks.
            </p>
            <div className="mt-6 flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
              <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs sm:text-sm font-medium">
                {TOOLS.length} Free Tools
              </span>
              <span className="bg-cyan-400/10 border border-cyan-400/20 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-cyan-300">
                {aiToolsCount} AI Tools
              </span>
              <span className="bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-yellow-300">
                {fileToolsCount} File Tools
              </span>
            </div>
          </div>

          <div className="sticky top-5 z-30 mb-12 space-y-4">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 w-full max-w-4xl mx-auto shadow-2xl shadow-primary/10">
              <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <Input
                    type="text"
                    placeholder={`Search over ${TOOLS.length} tools...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 bg-transparent border-none rounded-full pl-12 pr-4 text-white placeholder-gray-500 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
              </div>
            </div>

            <div className="relative flex justify-center items-center w-full max-w-4xl mx-auto">
                <div className="w-full sm:w-auto bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl shadow-primary/10 overflow-hidden">
                    <div className="flex items-center sm:justify-center space-x-1 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                            activeCategory === cat.id ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <cat.icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                </div>

                 <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full flex items-center bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl shadow-primary/10">
                   <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-full transition-colors duration-300", viewMode === 'grid' ? "bg-primary text-white" : "text-gray-500 hover:text-white")}><LayoutGrid className="w-5 h-5" /></button>
                   <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-full transition-colors duration-300", viewMode === 'list' ? "bg-primary text-white" : "text-gray-500 hover:text-white")}><List className="w-5 h-5" /></button>
                </div>
            </div>
          </div>
          
          {searchQuery && !showEmptyState && (
            <div className="text-center mb-8">
              {didYouMean && (
                <p className="text-gray-400">
                  Did you mean:{" "}
                  <button onClick={() => setSearchQuery(didYouMean)} className="text-primary font-semibold hover:underline">
                    {didYouMean}
                  </button>
                  ?
                </p>
              )}
              {showSuggestionsHeader && (
                <h2 className="text-xl font-bold text-white mt-4">Did you mean these tools?</h2>
              )}
            </div>
          )}

          <div className={cn(
              "transition-all duration-300",
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
          )}>
            {displayedTools.map(tool => (
                <a href={tool.href} key={tool.href} className="block group">
                    {viewMode === 'grid' ? (
                        <div className="group relative flex flex-col justify-between h-full p-6 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transform hover:-translate-y-1">
                            <div className="flex-1">
                                <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg mb-4 transition-transform duration-300 group-hover:scale-110",
                                    tool.category === 'AI' && 'bg-cyan-400/10 text-cyan-300 shadow-inner shadow-cyan-500/10',
                                    tool.category === 'Image' && 'bg-pink-400/10 text-pink-300 shadow-inner shadow-pink-500/10',
                                    tool.category === 'File' && 'bg-yellow-400/10 text-yellow-300 shadow-inner shadow-yellow-500/10',
                                    tool.category === 'Other' && 'bg-green-400/10 text-green-300 shadow-inner shadow-green-500/10',
                                )}>
                                    <tool.icon size={22} />
                                </div>
                                <h3 className="font-semibold text-base text-white">{tool.title}</h3>
                                <p className="mt-2 text-gray-400 text-sm line-clamp-2">{tool.desc}</p>
                            </div>
                            <div className="mt-4">
                                <span className="text-sm font-medium text-primary/80 group-hover:text-primary transition-colors duration-300 flex items-center gap-1">
                                    Open <ArrowRight size={14} />
                                </span>
                           </div>
                        </div>
                    ) : (
                        <div className="py-4 px-5 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-gray-800/70 hover:border-primary/40 transition-all duration-300 ease-in-out flex justify-between items-center">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg",
                                    tool.category === 'AI' && 'bg-cyan-400/10 text-cyan-300',
                                    tool.category === 'Image' && 'bg-pink-400/10 text-pink-300',
                                    tool.category === 'File' && 'bg-yellow-400/10 text-yellow-300',
                                    tool.category === 'Other' && 'bg-green-400/10 text-green-300',
                                )}>
                                    <tool.icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-base text-white truncate">{tool.title}</h3>
                                  <p className="text-sm text-gray-500 line-clamp-1 truncate">{tool.desc}</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors ml-6" />
                        </div>
                    )}
                </a>
            ))}
          </div>

            {showEmptyState && (
                <div className="text-center py-24">
                    <p className="font-bold text-2xl text-gray-500">No tools found.</p>
                    <p className="text-base text-gray-600 mt-2">Try another search.</p>
                </div>
            )}
        </main>
      </div>
  );
}
