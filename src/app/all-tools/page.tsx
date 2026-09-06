'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Tool {
  href: string;
  title: string;
  desc: string;
}

// The full, unmodified list of 120+ tools.
const TOOLS: Tool[] = [
  { href: '/single', title: 'Single Studio', desc: 'Branded QR codes with logos and AI backgrounds.' },
  { href: '/ai-chatbot', title: 'AI Chatbot', desc: 'Chat with a fast AI assistant.' },
  { href: '/ai-resume-builder', title: 'AI Resume Builder', desc: 'Create a clean professional resume in minutes.' },
  { href: '/ai-email-writer', title: 'AI Email Writer', desc: 'Write a clean email in seconds.' },
  { href: '/ai-code-generator', title: 'AI Code Generator', desc: 'Create code from a simple request.' },
  { href: '/ai-image-generator', title: 'AI Image Generator', desc: 'Create images from text for free.' },
  { href: '/reverse-video', title: 'Reverse Video', desc: 'Reverse any video in your browser with FFmpeg.wasm.' },
  { href: '/speech-to-text', title: 'Speech to Text', desc: 'Convert your voice into text instantly in the browser.' },
  { href: '/text-to-speech', title: 'Text to Speech', desc: 'Convert any text into speech instantly in your browser.' },
  { href: '/voice-changer', title: 'Voice Changer', desc: 'Change your voice live with robot, deep, helium and more effects.' },
  { href: '/temp-upload', title: 'Temp Upload', desc: 'Connect ImgBB, GoFile, Pixeldrain or Cloudflare R2 and upload files with expiry reminders.' },
  { href: '/whatsapp-link-generator', title: 'WhatsApp Link', desc: 'Generate instant chat links with custom messages.' },
  { href: '/all-units-converter', title: 'All Units Converter', desc: 'Professional universal measurement matrix. Convert Length, Weight, Temp, and more.' },
  { href: '/fake-data', title: 'Fake Data Generator', desc: 'Generate realistic fake names, emails, addresses, phone numbers and more for testing.' },
  { href: '/site-backup-cloner', title: 'Site Backup Cloner', desc: 'Isolate and download public frontend assets into a local ZIP backup.' },
  { href: '/username-checker', title: 'Username Checker', desc: 'Check username availability across 20+ major platforms.' },
  { href: '/domain-whois', title: 'Domain Whois', desc: 'Isolate domain birth-dates, registrar metadata, and security status.' },
  { href: '/temp-mail', title: 'Temp Mail Pro', desc: 'Advanced multi-node temporary email synthesis.' },
  { href: '/gmail-alias', title: 'Gmail Alias Generator', desc: 'Create unlimited Gmail aliases using Dot Trick & Plus Addressing. All emails go to your real inbox.' },
  { href: '/link-safety-checker', title: 'Link Safety', desc: 'Expand short links and identify potential phishing threats.' },
  { href: '/background-remove', title: 'Background Remove', desc: 'Isolate subjects from photos and export high-fidelity transparent PNGs.' },
  { href: '/telegram-file-host', title: 'FILE HOST', desc: 'Archive and share any file via the Cloud Host Protocol.' },
  { href: '/image-to-link', title: 'Image to Link', desc: 'Upload visual assets and generate shareable link matrices via Imgur.' },
  { href: '/dns-lookup', title: 'DNS Lookup', desc: 'Professional DNS record discovery and auditing.' },
  { href: '/password-breach-checker', title: 'Breach Checker', desc: 'Verify if passwords have been exposed using secure k-Anonymity.' },
  { href: '/website-trust-checker', title: 'Trust Checker', desc: 'Professional multi-node security diagnostics and domain auditing.' },
  { href: '/github-user', title: 'GitHub Finder', desc: 'Isolate developer profile metadata, repository density, and social reach.' },
  { href: '/coding-resources', title: 'Coding Matrix', desc: 'Isolate high-fidelity learning assets and technical documentation.' },
  { href: '/free-games', title: 'Free Games', desc: 'Isolate high-fidelity free titles for PC and Browser.' },
  { href: '/translate', title: 'Translate Studio', desc: 'Professional English to Urdu translation with real-time sync.' },
  { href: '/image-gallery', title: 'Image Gallery', desc: 'Professional multi-source discovery. Extract high-res visuals from global scientific and art registries.' },
  { href: '/holidays', title: 'Holiday Studio', desc: 'Isolate global public holidays and verified Pakistan 2026 matrix.' },
  { href: '/pokemon', title: 'Pokemon Studio', desc: 'Isolate high-fidelity unit data, base stats, and visual identifiers.' },
  { href: '/facts', title: 'Fact Studio', desc: 'Synthesize high-fidelity useless facts and randomized knowledge instantly.' },
  { href: '/pets', title: 'Pet Studio', desc: 'Professional random pet discovery. Isolate canine and feline visual identities.' },
  { href: '/country', title: 'Country Info', desc: 'Isolate clinical profiles, flags, and geographic matrices of global identities.' },
  { href: '/crypto-prices', title: 'Crypto Prices', desc: 'Real-time market telemetry for BTC, ETH, and more in USD/PKR.' },
  { href: '/quran-ayah', title: 'Quran Ayah', desc: 'Explore verses through random synthesis or clinical reference lookup.' },
  { href: '/namaz-times', title: 'Namaz Times', desc: 'Clinical prayer timings with Hijri calendar and countdown.' },
  { href: '/weather', title: 'Weather Intel', desc: 'Real-time global forecast with 3-day projection matrix.' },
  { href: '/speed-test', title: 'Speed Test', desc: 'Professional network telemetry. Test download, upload, and ping.' },
  { href: '/currency-converter', title: 'Currency Converter', desc: 'Real-time global exchange rates with local-only processing.' },
  { href: '/ip-finder', title: 'IP Finder', desc: 'Isolate network identity, ISP, and geographic coordinates.' },
  { href: '/keyboard-test', title: 'Keyboard Test', desc: 'Professional hardware integrity matrix. Test every key for response.' },
  { href: '/image-size-increaser', title: 'Size Increaser', desc: 'Enlarge images and inflate file size for specific requirements.' },
  { href: '/wps-sheets', title: 'WPS Sheets', desc: 'Create and edit spreadsheets for WPS and Excel locally.' },
  { href: '/bio-maker', title: 'Bio Maker Studio', desc: 'Generate aesthetic, unique bios for IG, TikTok, WA, and FB.' },
  { href: '/bmi-calculator', title: 'BMI Calculator', desc: 'Calculate body mass index and healthy weight ranges.' },
  { href: '/lucky-draw', title: 'Lucky Draw', desc: 'Fair random selection wheel for giveaways and prizes.' },
  { href: '/tax-calculator', title: 'Tax Calculator', desc: 'Calculate extra % or reverse-lookup original prices instantly.' },
  { href: '/html-to-url', title: 'HTML to URL', desc: 'Convert raw HTML code into a hosted shareable link.' },
  { href: '/sim-data', title: 'Sim Data Finder', desc: 'Identify carrier and regional data for Pakistani numbers.' },
  { href: '/temp-room', title: 'Temp Room', desc: 'Shared live clipboard. Instant text sync between devices.' },
  { href: '/hide-message-photo', title: 'Hide in Photo', desc: 'Embed secret messages inside images using steganography.' },
  { href: '/direct-file-share', title: 'Direct File Share', desc: 'Send large files directly to any device via secret link.' },
  { href: '/wifi-qr-decoder', title: 'WiFi QR Finder', desc: 'Extract hidden network passwords from any WiFi QR code.' },
  { href: '/bulk', title: 'Bulk Production', desc: 'Generate hundreds of high-res assets in seconds.' },
  { href: '/blur-face-plate', title: 'Blur Face / Plate', desc: 'Quickly hide faces and number plates in your photos locally.' },
  { href: '/image-to-webp', title: 'Image to WebP', desc: 'Convert imagery into next-gen optimized WebP masters locally.' },
  { href: '/images-to-gif', title: 'Images to GIF', desc: 'Synthesize high-fidelity animated GIFs from multiple photos locally.' },
  { href: '/custom-watermark', title: 'Custom Watermark', desc: 'Protect photos and videos with custom text or logos locally.' },
  { href: '/image-border-frame', title: 'Image Border & Frame', desc: 'Add professional borders and artistic frames to your photos.' },
  { href: '/nickname-generator', title: 'Nickname Studio', desc: 'Synthesize stylized nicknames and gamertags with artistic matrixing.' },
  { href: '/lorem-ipsum-generator', title: 'Lorem Ipsum', desc: 'Synthesize professional placeholder text for design prototypes.' },
  { href: '/hash-generator', title: 'Hash Generator', desc: 'Generate MD5, SHA-1, SHA-256 and SHA-512 hashes locally.' },
  { href: '/uuid-generator', title: 'UUID Generator Studio', desc: 'Generate cryptographically-secure UUID v4 identifiers.' },
  { href: '/json-formatter', title: 'JSON Formatter PRO', desc: 'Pretty-print, minify, and validate JSON data structures.' },
  { href: '/regex-tester', title: 'Regex Tester PRO', desc: 'Test and evaluate regular expressions with live matches.' },
  { href: '/photo-enhance-fix', title: 'Photo Enhance', desc: 'Upscale resolution, sharpen edges, and restore clarity.' },
  { href: '/passport-photo-maker', title: 'Passport Photo', desc: 'Create official ID photos and printable A4 sheets.' },
  { href: '/rename-file', title: 'Rename File', desc: 'Rename any file, image, or ZIP and download with the new name.' },
  { href: '/csv-to-json', title: 'CSV to JSON', desc: 'Professional data translation with header mapping.' },
  { href: '/json-to-csv', title: 'JSON to CSV', desc: 'Deep object flattening and matrix translation.' },
  { href: '/logo-maker', title: 'Logo Text Studio', desc: 'Generate premium text-based logos and avatars.' },
  { href: '/pdf-unlock', title: 'PDF Unlock', desc: 'Remove security passwords from protected PDF masters.' },
  { href: '/pdf-password-protect', title: 'PDF Password', desc: 'Encrypt PDF documents with passwords and permissions.' },
  { href: '/text-to-pdf', title: 'Text to PDF', desc: 'Convert raw text or .txt files into professional PDF masters.' },
  { href: '/pdf-rotator', title: 'PDF Rotator', desc: 'Correct orientation of PDF pages with live visual preview.' },
  { href: '/word-to-pdf', title: 'Word to PDF', desc: 'Convert Word .docx documents into PDF masters locally.' },
  { href: '/pdf-to-image', title: 'PDF to Image', desc: 'Convert PDF pages into high-resolution PNG or JPG assets.' },
  { href: '/pdf-splitter', title: 'PDF Splitter', desc: 'Extract pages, custom ranges, or chunks from documents.' },
  { href: '/pdf-compressor', title: 'PDF Compressor', desc: 'Optimize and shrink PDF document size locally.' },
  { href: '/duplicate-finder', title: 'Duplicate Purge', desc: 'Find and remove redundant files from projects or ZIPs.' },
  { href: '/duplicate-line-remover', title: 'Line Purge', desc: 'Remove duplicate lines from text or lists instantly.' },
  { href: '/whatsapp-dp-maker', title: 'WhatsApp DP', desc: 'Make full-size WhatsApp profile pics without quality loss.' },
  { href: '/pdf-merger', title: 'PDF Merger', desc: 'Combine multiple PDF documents into a single master file.' },
  { href: '/image-to-file', title: 'Image to File', desc: 'Convert imagery to PNG, JPG, WebP, or single-page PDF.' },
  { href: '/file-compressor', title: 'File Compressor', desc: 'Professional browser-side size reduction for visual and digital assets.' },
  { href: '/youtube-thumbnail-maker', title: 'YT Thumbnail', desc: 'Resize and frame images for 1280x720 thumbnails.' },
  { href: '/password-generator', title: 'Password Studio', desc: 'Generate cryptographically-secure strong passwords.' },
  { href: '/youtube-banner-maker', title: 'YouTube Banner', desc: 'Create 2560x1440 channel art with safe-zone guides.' },
  { href: '/collage-maker', title: 'Collage Studio', desc: 'Combine multiple images into professional grid layouts.' },
  { href: '/favicon-generator', title: 'Favicon Studio', desc: 'Generate web icon sets from any image instantly.' },
  { href: '/metadata-remover', title: 'Privacy Purge', desc: 'Strip GPS and EXIF metadata from any photo.' },
  { href: '/word-counter', title: 'Word Counter', desc: 'Live text analysis and reading time estimation.' },
  { href: '/color-picker', title: 'Color Picker', desc: 'Extract HEX, RGB, and HSL from any image.' },
  { href: '/rgb-picker', title: 'RGB Studio', desc: 'Precision color picking and space conversion.' },
  { href: '/markdown-preview', title: 'Markdown', desc: 'Live Markdown to HTML synthesis with visual preview.' },
  { href: '/image-converter', title: 'Image Converter', desc: 'Seamlessly switch between PNG and JPG formats.' },
  { href: '/image-resizer', title: 'Image Resizer', desc: 'Scale pixel dimensions with aspect ratio control.' },
  { href: '/image-compressor', title: 'Image Compressor', desc: 'Shrink file size locally with quality control.' },
  { href: '/image-to-pdf', title: 'Image to PDF', desc: 'Convert multiple images into a professional PDF.' },
  { href: '/photo-editor', title: 'Photo Studio', desc: 'Professional filters and local image editing.' },
  { href: '/vocal-separator', title: 'Vocal Remover', desc: 'Simple stereo matrix for vocal or music reduction.' },
  { href: '/video-to-audio', title: 'Video to MP3', desc: 'Extract high-quality audio tracks from videos.' },
  { href: '/video-to-gif', title: 'Video to GIF', desc: 'Synthesize high-quality animated GIFs from clips.' },
  { href: '/audio-joiner', title: 'Audio Joiner', desc: 'Merge multiple audio files into a single master track.' },
  { href: '/audio-booster', title: 'Volume Booster', desc: 'Amplify audio levels safely entirely in your browser.' },
  { href: '/letter-art', title: 'Letter Art', desc: 'Image to text conversion using custom alphabets.' },
  { href: '/dot-art', title: 'Dot Art Studio', desc: 'Convert images to intricate Braille character art.' },
  { href: '/repeater', title: 'Text Repeater', desc: 'Professional emoji and text multiplication.' },
  { href: '/hex-converter', title: 'Hex Converter', desc: 'Convert binary files to hexadecimal matrix.' },
  { href: '/code-converter', title: 'AOB Converter', desc: 'Professional AOB pattern conversion utility.' },
  { href: '/dictionary', title: 'Dictionary', desc: 'Professional English word search and definitions.' },
  { href: '/png-finder', title: 'PNG Finder Studio', desc: 'Search and download PNG images for editing' },
  { href: '/icon-studio', title: 'Icon Studio', desc: 'Search social icons, recolor, download SVG PNG ICO' },
  { href: '/username-forge', title: 'Username Forge', desc: 'Forge unique usernames and check cross-platform availability.' },
  { href: '/hashtag-engine', title: 'Hashtag Engine', desc: 'Generate strong hashtags for social growth and niche discovery' },
  { href: '/html-site-rescue', title: 'HTML Site Rescue', desc: 'Recover local index.html + libs into hosting ZIP' },
  { href: '/mouse-cursor-maker', title: 'Mouse Cursor Maker', desc: 'Convert any image into a real Windows .cur mouse cursor.' }
];

export default function AllToolsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredTools = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        if (!lowerCaseQuery) return TOOLS;
        return TOOLS.filter(tool => 
            tool.title.toLowerCase().includes(lowerCaseQuery) ||
            tool.desc.toLowerCase().includes(lowerCaseQuery)
        );
    }, [searchQuery]);

    const isEmpty = filteredTools.length === 0;

    return (
      <div className="min-h-screen w-full bg-black text-gray-300 relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute inset-0 bg-radial-gradient-purple"></div>
            <div className="absolute inset-0 bg-radial-gradient-blue"></div>
        </div>
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-20">
          <div className="text-center mb-16 md:mb-20">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              All Tools
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 font-light">
              Free tools on My Kit Tool.
            </p>
          </div>

          <div className="sticky top-5 z-30 mb-20">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 max-w-lg mx-auto shadow-2xl shadow-primary/10 flex items-center gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <Input
                    type="text"
                    placeholder={`Search ${TOOLS.length}+ tools...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 bg-transparent border-none rounded-full pl-12 pr-4 text-white placeholder-gray-500 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                 <div className="flex items-center p-1 rounded-full bg-black/30 border border-white/10">
                   <button onClick={() => setViewMode('grid')} className={cn("p-2.5 rounded-full transition-colors duration-300", viewMode === 'grid' ? "bg-primary text-white" : "text-gray-400 hover:text-white")}><LayoutGrid className="w-5 h-5" /></button>
                   <button onClick={() => setViewMode('list')} className={cn("p-2.5 rounded-full transition-colors duration-300", viewMode === 'list' ? "bg-primary text-white" : "text-gray-400 hover:text-white")}><List className="w-5 h-5" /></button>
                </div>
            </div>
          </div>
          
          <div className={cn(
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"
          )}>
            {filteredTools.map(tool => (
                <a href={tool.href} key={tool.href} className="block group">
                    {viewMode === 'grid' ? (
                        <div className="relative h-full p-8 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-2 transition-all duration-300 ease-in-out">
                            <div className="absolute top-5 right-5 text-gray-600 group-hover:text-primary transition-colors duration-300">
                                <ArrowRight size={20} />
                            </div>
                            <h3 className="font-bold text-xl text-white">{tool.title}</h3>
                            <p className="mt-3 text-gray-400 text-base leading-relaxed line-clamp-3">{tool.desc}</p>
                        </div>
                    ) : (
                        <div className="py-5 px-6 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-gray-900/80 hover:border-primary/40 transition-all duration-300 ease-in-out flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-white truncate">{tool.title}</h3>
                              <p className="text-base text-gray-500 line-clamp-1 truncate">{tool.desc}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors ml-6" />
                        </div>
                    )}
                </a>
            ))}
          </div>

            {isEmpty && (
                <div className="text-center py-24">
                    <p className="font-bold text-2xl text-gray-500">No Tools Found</p>
                    <p className="text-base text-gray-600 mt-2">Try a different search query.</p>
                </div>
            )}
        </main>
      </div>
  );
}
