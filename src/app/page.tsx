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
  Heart,
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
  Copy,
  ListFilter,
  Split,
  FileImage,
  RotateCw,
  Command,
  Unlock,
  Activity,
  Mic
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
    color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
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
      <section className="w-full px-4 sm:px-6 pt-12 pb-20 md:pt-24 md:pb-40 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto animate-reveal relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
              <Command className="w-3.5 h-3.5" /> Studio Protocol v6.0
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-foreground/5 border border-foreground/10 text-[9px] font-black text-foreground/40 uppercase tracking-widest">
              Registry · {TOOLS.length} Tools
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-headline font-black mb-6 sm:mb-8 leading-[1.1] tracking-tighter text-foreground uppercase overflow-wrap-anywhere">
            Digital <span className="text-primary italic">Excellence</span> <br />
            <span className="text-foreground/80">MY KIT TOOL</span>
          </h1>
          <p className="text-sm sm:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed font-medium mb-12 sm:mb-16 px-2">
            The world's most advanced professional utility studio. Generate high-resolution, branded assets and technical patterns for global workflows with precision engine processing.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-16 px-4 group relative">
            <div className="relative h-16 w-full rounded-3xl p-[3.5px] overflow-hidden transition-all duration-500 shadow-[0_0_50px_-5px_rgba(37,99,235,0.25),0_10px_20px_-5px_rgba(37,99,235,0.2)] group-focus-within:shadow-[0_0_80px_-5px_rgba(37,99,235,0.5),0_20px_30px_-10px_rgba(37,99,235,0.4)] group-focus-within:ring-[12px] group-focus-within:ring-primary/5">
              <div 
                className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] opacity-90 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity blur-[25px]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0, transparent 45%, #2563eb 50%, transparent 55%, transparent 100%)'
                }}
              />
              <div className="relative flex items-center w-full h-full bg-white dark:bg-black backdrop-blur-3xl rounded-[calc(1.5rem-3.5px)] overflow-hidden">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  type="text"
                  placeholder="Search tools... (e.g. video, pdf, password)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full w-full pl-14 pr-14 bg-transparent border-none focus-visible:ring-0 rounded-3xl text-lg font-medium shadow-none placeholder:text-foreground/30"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-5 flex items-center text-foreground/20 hover:text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {filteredTools.length > 0 ? (
              filteredTools.map((item, i) => (
                <Link key={i} href={item.href} className="group h-full w-full animate-in fade-in zoom-in duration-500 relative flex flex-col">
                  <div className={cn(
                    "absolute -inset-4 rounded-[3.5rem] blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-700 pointer-events-none",
                    item.glowClass
                  )} />
                  
                  <div className="glass-card p-8 sm:p-10 rounded-[3rem] border-border hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 text-left relative overflow-hidden flex-1 flex flex-col shadow-2xl group-hover:shadow-xl z-10">
                    <div className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 rounded-[1.8rem] flex items-center justify-center mb-8 border shadow-inner group-hover:scale-110 transition-transform duration-500",
                      item.color
                    )}>
                      <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl sm:text-2xl font-headline font-black text-foreground uppercase tracking-tight leading-tight">{item.title}</h3>
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-foreground/5 text-foreground/40 uppercase tracking-widest shrink-0">{item.label}</span>
                      </div>
                      <p className="text-[13px] text-foreground/40 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                      <div className="mt-auto pt-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                        Open Studio <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 glass-card rounded-[4rem] border-dashed border-border flex flex-col items-center justify-center gap-6">
                <Search className="w-16 h-16 text-foreground/10" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight">No tools found</h3>
                  <p className="text-sm text-foreground/40 font-medium">Try searching for broader terms like &quot;video&quot; or &quot;pdf&quot;</p>
                </div>
                <ShadButton 
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest border-primary/20 text-primary hover:bg-primary/5 transition-all"
                >
                  Clear Search Matrix
                </ShadButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="w-full bg-secondary/20 py-20 sm:py-32 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-24 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-headline font-black uppercase tracking-tight mb-4 sm:mb-6 leading-tight">Built for <span className="text-primary italic">Professional</span> Efficiency</h2>
            <p className="text-sm sm:base text-foreground/40 font-medium leading-relaxed">High-performance technical assets with a focus on privacy and hardware acceleration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-16 max-w-6xl mx-auto">
            {[
              { icon: Palette, title: 'Artistic Branding', desc: 'Custom dot patterns, corner geometries, and integrated business logos for consistent brand identity.' },
              { icon: Download, title: 'Vector Exports', desc: 'Download in PNG, JPG, or professional SVG formats suitable for large-format billboards and print.' },
              { icon: Smartphone, title: 'PWA Native', desc: 'Install as a high-performance native app on your mobile device for offline studio access anytime.' },
              { icon: Zap, title: 'Instant Engine', desc: 'Real-time studio preview with advanced error correction level adjustment and technical scores.' },
              { icon: ShieldCheck, title: 'Privacy Absolute', desc: 'Zero data storage. All generation, OCR, and editing happens locally in your secure browser session.' },
              { icon: Binary, title: 'Technical Tools', desc: 'Code converters, AOB pattern processors, and developer-centric utilities for modern workflows.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 sm:gap-8 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.8rem] bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-xl group-hover:border-primary/40 transition-all duration-500">
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-[13px] text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full px-4 sm:px-6 py-20 sm:py-32 text-center overflow-hidden">
        <div className="glass-card p-12 sm:p-24 rounded-[4rem] max-w-5xl mx-auto border-border relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32 -mb-32" />
           
           <h2 className="text-3xl sm:text-6xl font-headline font-black uppercase tracking-tight mb-6 sm:mb-8 relative z-10 leading-tight">Start Your <span className="text-primary italic">Production</span> Cycle</h2>
           <p className="text-sm sm:text-lg text-foreground/40 font-medium mb-10 sm:mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
             Join thousands of professionals using MY KIT TOOL for premium branded assets and technical utilities. No registration, just hardware performance.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
             <Link href="/single" className="w-full sm:w-auto px-12 py-5 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-center">
               Open Studio
             </Link>
             <Link href="/faq" className="w-full sm:w-auto px-12 py-5 bg-secondary border border-border text-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-secondary/80 transition-all text-center">
               Documentation
             </Link>
           </div>
        </div>
        
        <div className="mt-20 animate-reveal stagger-4">
           <div className="inline-flex flex-col items-center gap-3 p-6 rounded-[2.5rem] bg-secondary/30 border border-border">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Engineered with Precision</span>
              <p className="text-sm font-bold text-foreground">
                Developed by <span className="text-primary">Umar Farooq</span> <Heart className="inline w-4 h-4 text-red-500 fill-red-500 ml-1.5" />
              </p>
           </div>
        </div>
      </section>
    </div>
  );
}
