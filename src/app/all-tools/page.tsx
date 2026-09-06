'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  LayoutGrid, 
  List, 
  ArrowRight, 
  BrainCircuit, 
  ImageIcon, 
  FileText, 
  Zap, 
  Activity,
  History,
  CheckCircle2,
  X,
  Filter,
  ChevronRight,
  Monitor,
  Layout,
  Command,
  HelpCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  { href: '/username-forge', title: 'Username Forge', desc: 'Forge unique usernames and check cross-platform availability.', category: 'Other', icon: Zap, keywords: ['username generator'] },
  { href: '/hashtag-engine', title: 'Hashtag Engine', desc: 'Generate strong hashtags for social growth and niche discovery', category: 'Other', icon: Zap, keywords: ['hashtag generator'] },
];

const CATEGORIES: { id: 'all' | ToolCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Command },
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

function AllToolsPageContent() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | ToolCategory>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
      const queryFromUrl = searchParams.get('q');
      if (queryFromUrl) {
        setSearchQuery(queryFromUrl);
      }
    }, [searchParams]);

    const { displayedTools, didYouMean, foundCount } = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        let categoryFilteredTools = TOOLS.filter(tool => activeCategory === 'all' || tool.category === activeCategory);

        if (!lowerCaseQuery) {
            return { displayedTools: categoryFilteredTools, didYouMean: null, foundCount: categoryFilteredTools.length };
        }
        
        const exactMatches = categoryFilteredTools.filter(tool =>
            tool.title.toLowerCase().includes(lowerCaseQuery) ||
            tool.desc.toLowerCase().includes(lowerCaseQuery) ||
            tool.href.toLowerCase().includes(lowerCaseQuery) ||
            (tool.keywords && tool.keywords.some(k => k.toLowerCase().includes(lowerCaseQuery)))
        );

        if (exactMatches.length > 0) {
            return { displayedTools: exactMatches, didYouMean: null, foundCount: exactMatches.length };
        }

        const allToolsWithDistance = categoryFilteredTools.map(tool => ({
            ...tool,
            distance: levenshteinDistance(lowerCaseQuery, tool.title.toLowerCase()),
        })).sort((a, b) => a.distance - b.distance);

        const suggestions = allToolsWithDistance.slice(0, 8);
        const bestMatch = suggestions[0];
        const didYouMeanSuggestion = (bestMatch && bestMatch.distance > 0 && bestMatch.distance <= 3) ? bestMatch.title : null;

        return { 
            displayedTools: suggestions, 
            didYouMean: didYouMeanSuggestion, 
            foundCount: 0
        };

    }, [searchQuery, activeCategory]);

    return (
      <div className="min-h-screen w-full bg-[#02040a] text-foreground/80 selection:bg-primary/20">
        {/* Atmospheric Depth */}
        <div className="fixed inset-0 pointer-events-none opacity-40">
            <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />
        </div>
        
        <main className="container mx-auto px-6 py-20 relative z-20">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-20 animate-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
              <Layout className="w-3.5 h-3.5" /> Studio Registry
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
              The <span className="text-primary italic">ToolBox</span>
            </h1>
            <p className="text-sm md:text-base text-foreground/40 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-medium">
              Explore our complete suite of {TOOLS.length} free, professional utilities engineered for high-fidelity production.
            </p>
          </div>

          {/* Sticky Controller Bar */}
          <div className="sticky top-20 z-[80] mb-12 space-y-6">
            <div className="max-w-4xl mx-auto w-full group/search">
               <div className="absolute -inset-4 bg-primary/10 blur-[40px] rounded-full pointer-events-none opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000" />
               <div className="relative bg-black/60 backdrop-blur-3xl border border-white/5 rounded-3xl h-16 shadow-2xl flex items-center px-6 transition-all group-focus-within/search:border-primary/40">
                  <Search className="w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder={`Search ${TOOLS.length} tools... (e.g. AI, PDF, Image)`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm font-bold placeholder:text-foreground/20 focus-visible:ring-0"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-2 text-foreground/20 hover:text-foreground transition-all">
                       <X className="w-4 h-4" />
                    </button>
                  )}
               </div>
            </div>

            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                <div className="flex bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-2xl p-1.5 shadow-2xl">
                    <div className="flex items-center space-x-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            activeCategory === cat.id ? "bg-primary text-white shadow-xl" : "text-foreground/30 hover:text-foreground/60 hover:bg-white/5"
                          )}
                        >
                          <cat.icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                </div>

                 <div className="flex items-center gap-2 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-2xl p-1.5 shadow-2xl">
                   <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-primary text-white shadow-lg" : "text-foreground/20 hover:text-white")}><LayoutGrid className="w-4 h-4" /></button>
                   <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-primary text-white shadow-lg" : "text-foreground/20 hover:text-white")}><List className="w-4 h-4" /></button>
                </div>
            </div>
          </div>
          
          {/* Status Matrix */}
          <div className="max-w-5xl mx-auto mb-12 px-4 flex flex-col items-center gap-4">
             {didYouMean && (
                <div className="animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                    Did you mean:{" "}
                    <button onClick={() => setSearchQuery(didYouMean)} className="text-primary hover:underline">
                      {didYouMean}
                    </button>
                    ?
                  </p>
                </div>
             )}
             
             {searchQuery && foundCount === 0 && (
                <div className="py-32 text-center opacity-10 flex flex-col items-center gap-8">
                    <AlertCircle className="w-20 h-20 text-primary" />
                    <div className="space-y-2">
                       <p className="font-headline font-black text-3xl uppercase tracking-widest">Zero Matches</p>
                       <p className="text-sm font-bold uppercase">Linguistic signal not found in current matrix.</p>
                    </div>
                </div>
             )}
          </div>

          {/* Results Matrix */}
          <div className={cn(
              "max-w-7xl mx-auto transition-all duration-500 pb-32",
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-2"
          )}>
            {displayedTools.map((tool, i) => (
              <a href={tool.href} key={tool.href} className="block group animate-reveal" style={{ animationDelay: `${i * 10}ms` }}>
                  {viewMode === 'grid' ? (
                      <div className="flex flex-col justify-between h-full p-6 bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[2rem] transition-all duration-500 hover:bg-white/[0.03] hover:border-primary/20 shadow-2xl relative overflow-hidden group-hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10">
                              <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl mb-6 shadow-inner border border-white/5 transition-all group-hover:scale-110",
                                  tool.category === 'AI' ? 'bg-cyan-500/10 text-cyan-400' :
                                  tool.category === 'Image' ? 'bg-purple-500/10 text-purple-400' :
                                  tool.category === 'File' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-blue-500/10 text-blue-400',
                              )}>
                                  <tool.icon size={20} />
                              </div>
                              <h3 className="font-headline font-black text-lg text-foreground uppercase tracking-tight leading-none mb-3 group-hover:text-primary transition-colors">{tool.title}</h3>
                              <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter line-clamp-3">{tool.desc}</p>
                          </div>
                          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                              <span className="text-[8px] font-black text-foreground/20 group-hover:text-primary transition-colors uppercase tracking-[0.3em]">Initialize</span>
                              <ChevronRight size={14} className="text-foreground/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                         </div>
                      </div>
                  ) : (
                      <div className="py-4 px-6 bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-primary/20 transition-all flex justify-between items-center group/row">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                              <div className={cn("flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl shadow-inner border border-white/5",
                                  tool.category === 'AI' ? 'bg-cyan-500/10 text-cyan-400' :
                                  tool.category === 'Image' ? 'bg-purple-500/10 text-purple-400' :
                                  tool.category === 'File' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-blue-500/10 text-blue-400',
                              )}>
                                  <tool.icon size={16} />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-sm text-foreground truncate uppercase group-hover/row:text-primary transition-colors">{tool.title}</h3>
                                <p className="text-[10px] text-foreground/30 font-medium truncate uppercase tracking-tighter">{tool.desc}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-6 shrink-0">
                             <Badge variant="outline" className="hidden sm:inline-flex bg-background/50 border-white/5 text-[7px] font-black uppercase tracking-widest text-foreground/20">{tool.category}</Badge>
                             <ArrowRight className="w-4 h-4 text-foreground/10 group-hover/row:text-primary transition-all group-hover/row:translate-x-1" />
                          </div>
                      </div>
                  )}
              </a>
            ))}
          </div>
        </main>
        
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    );
}

export default function AllToolsPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-[#02040a]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
       </div>
    }>
      <AllToolsPageContent />
    </Suspense>
  );
}
