"use client"

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Palette, 
  Download,
  ArrowRight,
  Smartphone,
  Repeat,
  Binary,
  Grid3X3,
  FileText,
  ImageIcon,
  FileCode,
  Music,
  Search,
  X,
  Maximize,
  FileStack,
  CaseSensitive,
  RefreshCcw,
  Pipette,
  ShieldAlert,
  EyeOff,
  ListMusic,
  Film,
  Volume2,
  LayoutGrid,
  Grid2X2,
  MicOff,
  FileEdit,
  AlignLeft,
  Youtube,
  Lock,
  Clock,
  MonitorPlay,
  Type,
  FileArchive,
  ArrowRightLeft,
  User,
  DownloadCloud,
  Files,
  ListFilter,
  Split,
  FileImage,
  RotateCw,
  Unlock,
  Activity,
  Mic,
  Command,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button as ShadButton } from '@/components/ui/button';

const TOOLS = [
  { 
    href: '/single', 
    icon: QrCode, 
    title: 'Single Studio', 
    desc: 'Branded QR codes with logos and AI backgrounds.', 
    label: 'PRO MODE', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['qr', 'qr code', 'barcode', 'logo qr', 'brand qr', 'single', 'generator', 'scan']
  },
  { 
    href: '/bulk', 
    icon: Layers, 
    title: 'Bulk Production', 
    desc: 'Generate hundreds of high-res assets in seconds.', 
    label: 'BATCH', 
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'bg-indigo-500/10',
    keywords: ['bulk', 'batch', 'mass', 'multi', 'qr', 'barcodes', 'production', 'zip', 'many']
  },
  { 
    href: '/image-url-downloader', 
    icon: DownloadCloud, 
    title: 'URL Image Downloader', 
    desc: 'Extract images and YouTube thumbnails from any URL.', 
    label: 'MEDIA', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['image downloader', 'save image', 'url image', 'extract images', 'yt thumbnail', 'downloader']
  },
  { 
    href: '/speaker-tester', 
    icon: Activity, 
    title: 'Speaker Tester', 
    desc: 'Test Left/Right channels and frequency response.', 
    label: 'HARDWARE', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['speaker tester', 'audio test', 'left right', 'frequency sweep', 'sound test', 'headphones']
  },
  { 
    href: '/mic-tester', 
    icon: Mic, 
    title: 'Mic Tester Studio', 
    desc: 'Test hardware input levels and loopback echo.', 
    label: 'HARDWARE', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['mic tester', 'microphone test', 'audio input', 'record test', 'voice test', 'hardware check']
  },
  { 
    href: '/youtube-thumbnail-downloader', 
    icon: MonitorPlay, 
    title: 'YT Downloader', 
    desc: 'Extract and save thumbnails in all available qualities.', 
    label: 'MEDIA', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['youtube thumbnail downloader', 'save youtube image', 'yt thumbnail', 'extract thumbnail']
  },
  { 
    href: '/logo-maker', 
    icon: Type, 
    title: 'Logo Text Studio', 
    desc: 'Generate premium text-based logos and avatars.', 
    label: 'BRANDING', 
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    glowClass: 'bg-violet-500/10',
    keywords: ['logo text maker', 'text logo generator', 'brand name logo', 'avatar creator', 'business logo']
  },
  { 
    href: '/pdf-unlock', 
    icon: Unlock, 
    title: 'PDF Unlock', 
    desc: 'Remove security passwords from protected PDF masters.', 
    label: 'SECURITY', 
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
    glowClass: 'bg-green-500/10',
    keywords: ['unlock pdf', 'remove password', 'decrypt pdf', 'pdf remover', 'open protected pdf']
  },
  { 
    href: '/pdf-password-protect', 
    icon: ShieldAlert, 
    title: 'PDF Password', 
    desc: 'Encrypt PDF documents with passwords and permissions.', 
    label: 'SECURITY', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['pdf password', 'encrypt pdf', 'lock pdf', 'protect document', 'secure pdf']
  },
  { 
    href: '/text-to-pdf', 
    icon: FileText, 
    title: 'Text to PDF', 
    desc: 'Convert raw text or .txt files into professional PDF masters.', 
    label: 'DOCUMENT', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['text to pdf', 'convert text', 'txt to pdf', 'make pdf from text', 'type to pdf']
  },
  { 
    href: '/pdf-rotator', 
    icon: RotateCw, 
    title: 'PDF Rotator', 
    desc: 'Correct orientation of PDF pages with live visual preview.', 
    label: 'DOCUMENT', 
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    glowClass: 'bg-blue-600/10',
    keywords: ['rotate pdf', 'fix orientation', 'sideways pdf', 'upside down', 'pdf fixer']
  },
  { 
    href: '/pdf-to-word', 
    icon: FileEdit, 
    title: 'PDF to Word', 
    desc: 'Convert PDF documents into editable Word (.docx) masters.', 
    label: 'DOCUMENT', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['pdf to word', 'convert pdf', 'editable word', 'pdf to docx', 'extract text']
  },
  { 
    href: '/word-to-pdf', 
    icon: FileText, 
    title: 'Word to PDF', 
    desc: 'Convert Word .docx documents into PDF masters locally.', 
    label: 'DOCUMENT', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['word to pdf', 'docx to pdf', 'convert word', 'word converter', 'doc to pdf']
  },
  { 
    href: '/pdf-to-image', 
    icon: FileImage, 
    title: 'PDF to Image', 
    desc: 'Convert PDF pages into high-resolution PNG or JPG assets.', 
    label: 'CONVERT', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'convert pdf', 'extract images from pdf']
  },
  { 
    href: '/pdf-splitter', 
    icon: Split, 
    title: 'PDF Splitter', 
    desc: 'Extract pages, custom ranges, or chunks from documents.', 
    label: 'DOCUMENT', 
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    glowClass: 'bg-blue-600/10',
    keywords: ['pdf split', 'extract pages', 'separate pdf', 'pdf chunks', 'split document']
  },
  { 
    href: '/pdf-compressor', 
    icon: FileArchive, 
    title: 'PDF Compressor', 
    desc: 'Optimize and shrink PDF document size locally.', 
    label: 'OPTIMIZE', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['pdf compress', 'shrink pdf', 'smaller pdf', 'optimize document']
  },
  { 
    href: '/duplicate-finder', 
    icon: Files, 
    title: 'Duplicate Purge', 
    desc: 'Find and remove redundant files from projects or ZIPs.', 
    label: 'STUDIO', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['duplicate finder', 'clean files', 'remove duplicate', 'zip cleaner', 'project optimization', 'duplicates']
  },
  { 
    href: '/duplicate-line-remover', 
    icon: ListFilter, 
    title: 'Line Purge', 
    desc: 'Remove duplicate lines from text or lists instantly.', 
    label: 'TEXT', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['duplicate lines', 'line remover', 'unique lines', 'remove repeated', 'list cleaner', 'text purge']
  },
  { 
    href: '/whatsapp-dp-maker', 
    icon: User, 
    title: 'WhatsApp DP', 
    desc: 'Make full-size WhatsApp profile pics without quality loss.', 
    label: 'IDENTITY', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['whatsapp dp maker', 'profile picture', 'uncut dp', 'whatsapp quality', 'whatsquality', 'hd dp', 'profile maker']
  },
  { 
    href: '/pdf-merger', 
    icon: FileStack, 
    title: 'PDF Merger', 
    desc: 'Combine multiple PDF documents into a single master file.', 
    label: 'DOCUMENT', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['pdf merge', 'combine pdf', 'join pdf', 'multiple pdfs', 'document joiner']
  },
  { 
    href: '/image-to-file', 
    icon: ArrowRightLeft, 
    title: 'Image to File', 
    desc: 'Convert imagery to PNG, JPG, WebP, or single-page PDF.', 
    label: 'CONVERT', 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    glowClass: 'bg-blue-400/10',
    keywords: ['image to file', 'image converter', 'jpg to pdf', 'webp converter', 'png to webp', 'photo to pdf']
  },
  { 
    href: '/file-compressor', 
    icon: FileArchive, 
    title: 'File Compressor', 
    desc: 'Professional size reduction for visual and digital assets.', 
    label: 'OPTIMIZE', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['compress file', 'reduce size', 'optimize', 'shrink', 'smaller', 'pdf compress', 'image compress']
  },
  { 
    href: '/youtube-thumbnail-maker', 
    icon: MonitorPlay, 
    title: 'YT Thumbnail', 
    desc: 'Resize and frame images for 1280x720 thumbnails.', 
    label: 'YOUTUBE', 
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['youtube thumbnail size', '1280x720', 'yt thumbnail maker', 'thumbnail resizer', 'youtube thumbnail resizer']
  },
  { 
    href: '/age-calculator', 
    icon: Clock, 
    title: 'Age Calculator', 
    desc: 'Calculate exact age and birthday countdowns.', 
    label: 'STATS', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['age calculator', 'date of birth', 'how old am i', 'birthday', 'chronos', 'time lived']
  },
  { 
    href: '/password-generator', 
    icon: Lock, 
    title: 'Password Studio', 
    desc: 'Generate cryptographically-secure strong passwords.', 
    label: 'SECURITY', 
    color: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    glowClass: 'bg-slate-400/10',
    keywords: ['password generator', 'random password', 'strong password', 'security', 'safe', 'key']
  },
  { 
    href: '/youtube-banner-maker', 
    icon: Youtube, 
    title: 'YouTube Banner', 
    desc: 'Create 2560x1440 channel art with safe-zone guides.', 
    label: 'YOUTUBE', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['youtube banner maker', 'youtube banner size', 'channel art', 'youtube cover maker', 'yt banner', 'safe area']
  },
  { 
    href: '/collage-maker', 
    icon: Grid2X2, 
    title: 'Collage Studio', 
    desc: 'Combine multiple images into professional grid layouts.', 
    label: 'GRID', 
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    glowClass: 'bg-teal-500/10',
    keywords: ['collage maker', 'photo grid', 'merge photos', '2x2 collage', 'photo collage', 'combine images']
  },
  { 
    href: '/favicon-generator', 
    icon: LayoutGrid, 
    title: 'Favicon Studio', 
    desc: 'Generate web icon sets from any image instantly.', 
    label: 'WEB', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['favicon generator', 'favicon from image', 'site icon', 'ico maker', 'favicon png', 'apple touch icon']
  },
  { 
    href: '/metadata-remover', 
    icon: EyeOff, 
    title: 'Privacy Purge', 
    desc: 'Strip GPS and EXIF metadata from any photo.', 
    label: 'SECURE', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['remove exif', 'metadata remover', 'strip gps', 'privacy photo', 'remove location from image', 'exif']
  },
  { 
    href: '/word-counter', 
    icon: AlignLeft, 
    title: 'Word Counter', 
    desc: 'Live text analysis and reading time estimation.', 
    label: 'TEXT', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['word counter', 'character count', 'reading time', 'word count tool', 'text counter', 'speaking time']
  },
  { 
    href: '/color-picker', 
    icon: Pipette, 
    title: 'Color Picker', 
    desc: 'Extract HEX, RGB, and HSL from any image.', 
    label: 'DESIGN', 
    color: 'text-pink-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-pink-500/10',
    keywords: ['color picker', 'pick color from image', 'hex', 'rgb', 'eye dropper', 'color from photo', 'palette']
  },
  { 
    href: '/rgb-picker', 
    icon: Palette, 
    title: 'RGB Studio', 
    desc: 'Precision color picking and space conversion.', 
    label: 'ENGINE', 
    color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20',
    glowClass: 'bg-fuchsia-500/10',
    keywords: ['rgb picker', 'hex color', 'hsl', 'color converter', 'color picker', 'cmyk', 'hsv']
  },
  { 
    href: '/markdown-preview', 
    icon: FileEdit, 
    title: 'Markdown Preview', 
    desc: 'Live Markdown to HTML synthesis with visual preview.', 
    label: 'MARKUP', 
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    glowClass: 'bg-sky-500/10',
    keywords: ['markdown preview', 'md to html', 'markdown editor', 'markdown to html', 'live markdown', 'markup']
  },
  { 
    href: '/image-converter', 
    icon: RefreshCcw, 
    title: 'Image Converter', 
    desc: 'Seamlessly switch between PNG and JPG formats.', 
    label: 'FORMAT', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['png to jpg', 'jpg to png', 'convert image', 'png jpg converter', 'jpeg', 'image format']
  },
  { 
    href: '/image-resizer', 
    icon: Maximize, 
    title: 'Image Resizer', 
    desc: 'Scale pixel dimensions with aspect ratio control.', 
    label: 'SCALE', 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
    keywords: ['resize', 'resizer', 'image resizer', 'resize photo', 'change size', 'width height', 'px', 'scale image', 'dimension']
  },
  { 
    href: '/image-compressor', 
    icon: Maximize, 
    title: 'Image Compressor', 
    desc: 'Reduce file size locally with quality control.', 
    label: 'OPTIMIZE', 
    color: 'text-lime-500 bg-lime-500/10 border-lime-500/20',
    glowClass: 'bg-lime-500/10',
    keywords: ['compress', 'image compressor', 'reduce size', 'jpg', 'photo size', 'optimize', 'shrink', 'smaller']
  },
  { 
    href: '/image-to-pdf', 
    icon: FileStack, 
    title: 'Image to PDF', 
    desc: 'Convert multiple images into a professional PDF.', 
    label: 'DOCUMENT', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photo pdf', 'convert pdf', 'bundle', 'pdf']
  },
  { 
    href: '/photo-editor', 
    icon: ImageIcon, 
    title: 'Photo Studio', 
    desc: 'Professional filters and local image editing.', 
    label: 'EDITOR', 
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    glowClass: 'bg-violet-500/10',
    keywords: ['photo', 'image', 'edit', 'crop', 'filter', 'editor', 'picture', 'manipulate', 'brightness', 'contrast']
  },
  { 
    href: '/vocal-separator', 
    icon: MicOff, 
    title: 'Vocal Remover', 
    desc: 'Simple stereo matrix for vocal or music reduction.', 
    label: 'KARAOKE', 
    color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['vocal remover', 'karaoke', 'remove vocals', 'instrumental', 'music separator', 'audio separator']
  },
  { 
    href: '/video-to-audio', 
    icon: Music, 
    title: 'Video to MP3', 
    desc: 'Extract high-quality audio tracks from videos.', 
    label: 'MEDIA', 
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['mp4', 'mp3', 'video', 'audio', 'convert', 'music', 'extract', 'sound', 'ffmpeg']
  },
  { 
    href: '/video-to-gif', 
    icon: Film, 
    title: 'Video to GIF', 
    desc: 'Synthesize high-quality animated GIFs from clips.', 
    label: 'ANIMATION', 
    color: 'text-orange-600 bg-orange-500/10 border-orange-600/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['video to gif', 'mp4 to gif', 'make gif', 'convert gif', 'animated', 'clip']
  },
  { 
    href: '/audio-joiner', 
    icon: ListMusic, 
    title: 'Audio Joiner', 
    desc: 'Merge multiple audio files into a single master track.', 
    label: 'PRODUCTION', 
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    glowClass: 'bg-blue-600/10',
    keywords: ['audio joiner', 'merge mp3', 'combine audio', 'mp3 join', 'merge songs', 'wav', 'sound']
  },
  { 
    href: '/audio-booster', 
    icon: Volume2, 
    title: 'Volume Booster', 
    desc: 'Amplify audio levels safely entirely in your browser.', 
    label: 'BOOST', 
    color: 'text-teal-600 bg-teal-500/10 border-teal-600/20',
    glowClass: 'bg-teal-500/10',
    keywords: ['volume booster', 'louder audio', 'boost mp3', 'increase volume', 'audio gain', 'loud', 'mp3', 'wav']
  },
  { 
    href: '/letter-art', 
    icon: CaseSensitive, 
    title: 'Letter Art Studio', 
    desc: 'Image to text conversion using custom alphabets.', 
    label: 'ASCII', 
    color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    glowClass: 'bg-slate-500/10',
    keywords: ['image to text', 'ascii art', 'letters art', 'custom characters', 'image to alphabet', 'text art', 'alphabet art']
  },
  { 
    href: '/ocr', 
    icon: FileText, 
    title: 'OCR Extraction', 
    desc: 'Extract text from images locally and securely.', 
    label: 'INTEL', 
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-600/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['text', 'extract', 'ocr', 'image to text', 'recognize', 'scan', 'read']
  },
  { 
    href: '/dot-art', 
    icon: Grid3X3, 
    title: 'Dot Art Studio', 
    desc: 'Convert images to intricate Braille character art.', 
    label: 'CREATIVE', 
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'bg-indigo-500/10',
    keywords: ['dots', 'braille', 'art', 'image to text', 'ascii']
  },
  { 
    href: '/repeater', 
    icon: Repeat, 
    title: 'Text Repeater', 
    desc: 'Professional emoji and text multiplication.', 
    label: 'UTIL', 
    color: 'text-pink-600 bg-pink-500/10 border-pink-500/20',
    glowClass: 'bg-pink-500/10',
    keywords: ['repeat', 'text repeat', 'emoji', 'multiply', 'spam', 'util', 'repeater', 'cloner']
  },
  { 
    href: '/hex-converter', 
    icon: FileCode, 
    title: 'Hex Converter', 
    desc: 'Convert binary files to hexadecimal matrix.', 
    label: 'BINARY', 
    color: 'text-indigo-600 bg-indigo-600/10 border-indigo-600/20',
    glowClass: 'bg-indigo-600/10',
    keywords: ['hex', 'hexadecimal', 'binary', 'file', 'matrix', 'bytes', 'dump', 'offset']
  },
  { 
    href: '/code-converter', 
    icon: Binary, 
    title: 'AOB Converter', 
    desc: 'Professional AOB pattern conversion utility.', 
    label: 'DEV', 
    color: 'text-cyan-600 bg-cyan-500/10 border-cyan-600/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['aob', 'code', 'binary', 'convert', 'pattern', 'trainer', 'hex', 'c#', 'c++', 'python', 'array of bytes']
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    return TOOLS.filter(tool => {
      const targetString = `${tool.title} ${tool.desc} ${tool.keywords.join(' ')}`.toLowerCase();
      return words.every(word => targetString.includes(word));
    });
  }, [searchQuery]);

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="w-full px-4 sm:px-6 pt-16 pb-24 md:pt-28 md:pb-48 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto animate-reveal relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <Command className="w-3.5 h-3.5" /> Studio v6.5 Pro
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-foreground/5 border border-foreground/10 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
              Registry · {TOOLS.length} Units
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-headline font-black mb-8 leading-[0.95] tracking-tighter text-foreground uppercase">
            Production <br /><span className="text-primary italic">Matrix</span>
          </h1>
          <p className="text-base sm:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed font-medium mb-16 sm:mb-24 px-4">
            The world's most advanced professional utility environment. Generate high-fidelity assets and technical patterns for global workflows with localized engine processing.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-20 px-4 group relative">
            <div className="relative h-20 w-full rounded-[2.5rem] p-[4px] overflow-hidden transition-all duration-700 shadow-[0_0_80px_-10px_rgba(37,99,235,0.15)] group-focus-within:shadow-[0_0_100px_-5px_rgba(37,99,235,0.4)] group-focus-within:ring-[15px] group-focus-within:ring-primary/5">
              <div 
                className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] opacity-40 group-focus-within:opacity-100 group-hover:opacity-80 transition-opacity blur-[40px]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0, transparent 40%, #2563eb 50%, transparent 60%, transparent 100%)'
                }}
              />
              <div className="relative flex items-center w-full h-full bg-white dark:bg-[#0a0a0c] backdrop-blur-3xl rounded-[calc(2.5rem-4px)] overflow-hidden">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search className="w-6 h-6 text-foreground/20 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  type="text"
                  placeholder="Query technical units... (e.g. video, ocr, pdf)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full w-full pl-16 pr-16 bg-transparent border-none focus-visible:ring-0 rounded-none text-xl font-bold placeholder:text-foreground/20 placeholder:uppercase placeholder:tracking-widest tracking-tight"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-6 flex items-center text-foreground/20 hover:text-primary transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 w-full">
            {filteredTools.length > 0 ? (
              filteredTools.map((item, i) => (
                <Link key={i} href={item.href} className="group h-full w-full animate-in fade-in zoom-in duration-700 relative flex flex-col">
                  <div className={cn(
                    "absolute -inset-6 rounded-[4rem] blur-[60px] opacity-0 group-hover:opacity-30 transition-all duration-1000 pointer-events-none",
                    item.glowClass
                  )} />
                  
                  <div className="glass-card p-10 sm:p-12 rounded-[3.5rem] border-border hover:border-primary/40 transition-all duration-700 hover:-translate-y-3 text-left relative overflow-hidden flex-1 flex flex-col shadow-2xl group-hover:shadow-primary/10 z-10">
                    <div className={cn(
                      "w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] flex items-center justify-center mb-10 border shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700",
                      item.color
                    )}>
                      <item.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight leading-[1.1]">{item.title}</h3>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-foreground/5 text-foreground/40 uppercase tracking-[0.2em] shrink-0 border border-foreground/10">{item.label}</span>
                      </div>
                      <p className="text-sm text-foreground/40 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                      <div className="mt-auto pt-10 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-primary opacity-40 group-hover:opacity-100 transition-all">
                        Initialize <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-700" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-32 glass-card rounded-[4rem] border-dashed border-border flex flex-col items-center justify-center gap-10">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-foreground/10 animate-pulse">
                  <Search className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-headline font-black text-foreground uppercase tracking-tight">Zero Matches</h3>
                  <p className="text-base text-foreground/30 font-medium uppercase tracking-widest">Adjust query parameters for wider discovery</p>
                </div>
                <ShadButton 
                  onClick={() => setSearchQuery('')}
                  className="h-14 px-12 rounded-2xl font-black uppercase text-xs tracking-[0.3em] bg-primary text-white shadow-2xl shadow-primary/20"
                >
                  Reset Studio Matrix
                </ShadButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section className="w-full bg-secondary/30 py-24 sm:py-40 border-y border-border relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20 sm:mb-32 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-headline font-black uppercase tracking-tight mb-8 leading-[1.1]">Hardened <span className="text-primary italic">Clinical</span> Standards</h2>
            <p className="text-lg text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">Maximum fidelity asset production with zero-storage security mandates.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 sm:gap-24 max-w-7xl mx-auto">
            {[
              { icon: Palette, title: 'Branding Matrix', desc: 'Custom dot patterns, corner geometries, and integrated business logos for high-impact visual identification.' },
              { icon: Download, title: 'Production Ready', desc: 'Download in PNG, JPG, or professional vector SVG formats calibrated for retina displays and large-format print.' },
              { icon: Smartphone, title: 'PWA Architecture', desc: 'Install as a high-performance native application for low-latency offline studio access on any mobile hardware.' },
              { icon: Zap, title: 'Instant Execution', desc: 'Hardware-accelerated rendering with real-time technical scores and 1:1 pixel mapping for peak scannability.' },
              { icon: ShieldCheck, title: 'Privacy Absolute', desc: 'Zero data logs. All generation, OCR, and editing happens strictly within your secure local browser sandbox.' },
              { icon: Binary, title: 'Technical Units', desc: 'Array of Bytes (AOB) converters, binary hex processors, and developer-centric utilities for modern engineering.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2.2rem] bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-2xl group-hover:border-primary/40 transition-all duration-700 ring-1 ring-white/5">
                  <item.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-[0.2em] text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-sm text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="w-full px-6 py-32 sm:py-48 text-center overflow-hidden">
        <div className="glass-card p-16 sm:p-32 rounded-[5rem] max-w-6xl mx-auto border-border relative overflow-hidden group/cta">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover/cta:bg-primary/20 transition-all duration-1000" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -ml-48 -mb-48 group-hover/cta:bg-primary/10 transition-all duration-1000" />
           
           <h2 className="text-4xl sm:text-8xl font-headline font-black uppercase tracking-tight mb-10 relative z-10 leading-[0.95]">Ignite Your <br /><span className="text-primary italic">Workflow</span></h2>
           <p className="text-base sm:text-xl text-foreground/40 font-medium mb-16 sm:mb-20 max-w-2xl mx-auto relative z-10 leading-relaxed uppercase tracking-tighter">
             Join the global standard for professional digital production. No registration required. Hardware performance guaranteed.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 relative z-10">
             <Link href="/single" className="w-full sm:w-auto px-16 py-6 bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-center">
               Launch Studio
             </Link>
             <Link href="/faq" className="w-full sm:w-auto px-16 py-6 bg-secondary border border-border text-foreground font-black text-sm uppercase tracking-[0.3em] rounded-[2rem] hover:bg-secondary/80 transition-all text-center">
               Documentation
             </Link>
           </div>
        </div>
        
        <div className="mt-32 animate-reveal stagger-4">
           <div className="inline-flex flex-col items-center gap-4 p-8 rounded-[3.5rem] bg-secondary/30 border border-border">
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground/20">Precision Engineered By</span>
              <p className="text-base font-bold text-foreground">
                <span className="text-primary font-black uppercase tracking-widest">Umar Farooq</span> <Heart className="inline w-5 h-5 text-red-500 fill-red-500 ml-2 animate-pulse" />
              </p>
           </div>
        </div>
      </section>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}