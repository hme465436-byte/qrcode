
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  Layers, 
  Zap, 
  ShieldCheck, 
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
  Palette,
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
  Activity,
  Mic,
  Command,
  Play,
  Table,
  FileJson,
  SquareUser,
  Wand2,
  List,
  RotateCcw,
  Unlock,
  Book,
  Shapes,
  FileSignature,
  Monitor,
  Braces,
  Fingerprint,
  Hash,
  WholeWord,
  Frame,
  Stamp,
  Scan,
  TrendingDown,
  Eraser,
  Ghost,
  Wifi,
  Share2,
  MoveHorizontal,
  Eye,
  ClipboardType,
  Globe,
  Coins,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button as ShadButton } from '@/components/ui/button';
import { SpaceBackground } from '@/components/qr-canvas/space-background';

const VIEW_MODE_KEY = 'mykit_view_mode';

type ToolCategory = 'all' | 'pdf' | 'image' | 'generators' | 'utilities';

interface Tool {
  href: string;
  icon: any;
  title: string;
  desc: string;
  label: string;
  color: string;
  glowClass: string;
  keywords: string[];
  category: ToolCategory;
}

const TOOLS: Tool[] = [
  { 
    href: '/single', 
    icon: QrCode, 
    title: 'Single Studio', 
    desc: 'Branded QR codes with logos and AI backgrounds.', 
    label: 'PRO MODE', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['qr', 'qr code', 'barcode', 'logo qr', 'brand qr', 'single', 'generator', 'scan'],
    category: 'generators'
  },
  { 
    href: '/tax-calculator', 
    icon: Coins, 
    title: 'Tax Calculator', 
    desc: 'Calculate GST, VAT, and sales taxes with reverse logic.', 
    label: 'FISCAL', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['tax calculator', 'gst calculator', 'vat', 'sales tax', 'reverse tax', 'pkr tax', 'finance'],
    category: 'utilities'
  },
  { 
    href: '/html-to-url', 
    icon: Globe, 
    title: 'HTML to URL', 
    desc: 'Convert raw HTML code into a hosted shareable link.', 
    label: 'WEB', 
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    glowClass: 'bg-sky-500/10',
    keywords: ['html to url', 'host html', 'share html', 'paste html link', 'web host'],
    category: 'generators'
  },
  { 
    href: '/sim-data', 
    icon: Smartphone, 
    title: 'Sim Data Finder', 
    desc: 'Identify carrier and regional data for Pakistani numbers.', 
    label: 'INTEL', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['sim data', 'sim owner', 'number details', 'pakistan numbers', 'cnic details', 'carrier finder'],
    category: 'utilities'
  },
  { 
    href: '/temp-room', 
    icon: ClipboardType, 
    title: 'Temp Room', 
    desc: 'Shared live clipboard. Instant text sync between devices.', 
    label: 'LIVE SYNC', 
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    glowClass: 'bg-orange-400/10',
    keywords: ['temp room', 'clipboard share', 'join code', 'live paste', 'text sync', 'copy paste share'],
    category: 'utilities'
  },
  { 
    href: '/hide-message-photo', 
    icon: Lock, 
    title: 'Hide in Photo', 
    desc: 'Embed secret messages inside images using steganography.', 
    label: 'SECRET', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['hide text in image', 'secret photo', 'steganography', 'private message', 'hidden text', 'reveal'],
    category: 'image'
  },
  { 
    href: '/direct-file-share', 
    icon: Share2, 
    title: 'Direct File Share', 
    desc: 'Send large files directly to any device via secret link.', 
    label: 'LINK SHARE', 
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['share file', 'send file', 'toffee', 'p2p', 'direct share', 'transfer', 'file send', 'no upload'],
    category: 'utilities'
  },
  { 
    href: '/wifi-qr-decoder', 
    icon: Wifi, 
    title: 'WiFi QR Finder', 
    desc: 'Extract hidden network passwords from any WiFi QR code.', 
    label: 'SECURITY', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['wifi qr', 'qr password', 'wifi finder', 'wifi decoder', 'network password', 'scan wifi', 'recover wifi'],
    category: 'utilities'
  },
  { 
    href: '/bulk', 
    icon: Layers, 
    title: 'Bulk Production', 
    desc: 'Generate hundreds of high-res assets in seconds.', 
    label: 'BATCH', 
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'bg-indigo-500/10',
    keywords: ['bulk', 'batch', 'mass', 'multi', 'qr', 'barcodes', 'production', 'zip', 'many'],
    category: 'generators'
  },
  { 
    href: '/blur-face-plate', 
    icon: Eraser, 
    title: 'Blur Face / Plate', 
    desc: 'Quickly hide faces and number plates in your photos locally.', 
    label: 'PRIVACY', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['blur face', 'blur plate', 'hide number', 'redact', 'censor', 'anonymous'],
    category: 'image'
  },
  { 
    href: '/image-to-webp', 
    icon: TrendingDown, 
    title: 'Image to WebP', 
    desc: 'Convert imagery into next-gen optimized WebP masters locally.', 
    label: 'OPTIMIZE', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['webp', 'convert webp', 'jpg to webp', 'png to webp', 'next-gen image', 'smaller images'],
    category: 'image'
  },
  { 
    href: '/images-to-gif', 
    icon: Film, 
    title: 'Images to GIF', 
    desc: 'Synthesize high-fidelity animated GIFs from multiple photos locally.', 
    label: 'ANIMATE', 
    color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    glowClass: 'bg-pink-500/10',
    keywords: ['image to gif', 'photos to gif', 'animate', 'make gif', 'slideshow', 'gif maker'],
    category: 'generators'
  },
  { 
    href: '/barcode-reader', 
    icon: Scan, 
    title: 'Barcode Reader', 
    desc: 'Scan industrial barcodes and QR patterns via camera or image.', 
    label: 'HARDWARE', 
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['barcode', 'scanner', 'ean', 'upc', 'read barcode', 'scan qr', 'decoder'],
    category: 'utilities'
  },
  { 
    href: '/custom-watermark', 
    icon: Stamp, 
    title: 'Custom Watermark', 
    desc: 'Protect photos and videos with custom text or logos locally.', 
    label: 'IP PROTECT', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['watermark', 'logo on photo', 'logo on video', 'protect image', 'copyright', 'text on video'],
    category: 'image'
  },
  { 
    href: '/image-border-frame', 
    icon: Frame, 
    title: 'Image Border & Frame', 
    desc: 'Add professional borders and artistic frames to your photos.', 
    label: 'GEOMETRY', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['border', 'frame', 'photo frame', 'edge', 'outline', 'polaroid', 'canvas', 'branding'],
    category: 'image'
  },
  { 
    href: '/nickname-generator', 
    icon: Wand2, 
    title: 'Nickname Studio', 
    desc: 'Synthesize stylized nicknames and gamertags with artistic matrixing.', 
    label: 'IDENTITY', 
    color: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    glowClass: 'bg-violet-400/10',
    keywords: ['nickname', 'gamertag', 'alias', 'brand name', 'generator', 'gaming id'],
    category: 'generators'
  },
  { 
    href: '/lorem-ipsum-generator', 
    icon: AlignLeft, 
    title: 'Lorem Ipsum', 
    desc: 'Synthesize professional placeholder text for design prototypes.', 
    label: 'TYPOGRAPHY', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'filler text', 'generator', 'text maker'],
    category: 'generators'
  },
  { 
    href: '/hash-generator', 
    icon: Fingerprint, 
    title: 'Hash Generator', 
    desc: 'Generate MD5, SHA-1, SHA-256 and SHA-512 hashes locally.', 
    label: 'SECURITY', 
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    glowClass: 'bg-cyan-400/10',
    keywords: ['hash', 'md5', 'sha256', 'sha512', 'checksum', 'fingerprint', 'encryption', 'security'],
    category: 'utilities'
  },
  { 
    href: '/uuid-generator', 
    icon: Fingerprint, 
    title: 'UUID Generator Studio', 
    desc: 'Generate cryptographically-secure UUID v4 identifiers.', 
    label: 'IDENTITY', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['uuid', 'guid', 'unique id', 'id generator', 'v4 uuid', 'random id'],
    category: 'utilities'
  },
  { 
    href: '/json-formatter', 
    icon: Braces, 
    title: 'JSON Formatter PRO', 
    desc: 'Pretty-print, minify, and validate JSON data structures.', 
    label: 'DATA', 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
    keywords: ['json formatter', 'pretty print', 'minify json', 'validate json', 'json cleaner', 'data tool'],
    category: 'utilities'
  },
  { 
    href: '/regex-tester', 
    icon: Search, 
    title: 'Regex Tester PRO', 
    desc: 'Test and evaluate regular expressions with live matches.', 
    label: 'INTEL', 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    glowClass: 'bg-blue-400/10',
    keywords: ['regex', 'regular expression', 'regex test', 'pattern match', 'tester', 'intel'],
    category: 'utilities'
  },
  { 
    href: '/photo-enhance-fix', 
    icon: Wand2, 
    title: 'Photo Enhance / Pixel Fix', 
    desc: 'Upscale resolution, sharpen edges, and restore clarity.', 
    label: 'IMAGE', 
    color: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    glowClass: 'bg-violet-400/10',
    keywords: ['photo enhance', 'pixel fix', 'upscale', 'sharpen', 'clarity', 'quality', 'unblur', 'resolution'],
    category: 'image'
  },
  { 
    href: '/passport-photo-maker', 
    icon: SquareUser, 
    title: 'Passport Photo', 
    desc: 'Create official ID photos and printable A4 sheets.', 
    label: 'IDENTITY', 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    glowClass: 'bg-blue-400/10',
    keywords: ['passport photo', 'id photo', 'visa photo', 'print photos', '35x45mm', '2x2 inch', 'photo maker'],
    category: 'image'
  },
  { 
    href: '/live-wallpaper', 
    icon: MonitorPlay, 
    title: 'Live Wallpaper', 
    desc: 'Turn any video into a looping live wallpaper for PC or phone.', 
    label: 'MEDIA', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['live wallpaper', 'video wallpaper', 'loop', 'pc', 'phone', 'lively', 'wallpaper engine'],
    category: 'utilities'
  },
  { 
    href: '/rename-file', 
    icon: FileSignature, 
    title: 'Rename File', 
    desc: 'Rename any file, image, or ZIP and download with the new name.', 
    label: 'UTIL', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['rename', 'file name', 'change name', 'image rename', 'zip rename', 'utility'],
    category: 'utilities'
  },
  { 
    href: '/csv-to-json', 
    icon: Table, 
    title: 'CSV to JSON', 
    desc: 'Professional data translation with header mapping.', 
    label: 'DATA', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['csv to json', 'convert csv', 'excel to json', 'data converter', 'json maker', 'parse csv'],
    category: 'utilities'
  },
  { 
    href: '/json-to-csv', 
    icon: FileJson, 
    title: 'JSON to CSV', 
    desc: 'Deep object flattening and matrix translation.', 
    label: 'DATA', 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    glowClass: 'bg-blue-400/10',
    keywords: ['json to csv', 'convert json', 'flatten json', 'data converter', 'csv maker', 'parse json'],
    category: 'utilities'
  },
  { 
    href: '/image-url-downloader', 
    icon: DownloadCloud, 
    title: 'URL Image Downloader', 
    desc: 'Extract images and YouTube thumbnails from any URL.', 
    label: 'MEDIA', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['image downloader', 'save image', 'url image', 'extract images', 'yt thumbnail', 'downloader'],
    category: 'image'
  },
  { 
    href: '/speaker-tester', 
    icon: Activity, 
    title: 'Speaker Tester', 
    desc: 'Test Left/Right channels and frequency response.', 
    label: 'HARDWARE', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['speaker tester', 'audio test', 'left right', 'frequency sweep', 'sound test', 'headphones'],
    category: 'utilities'
  },
  { 
    href: '/mic-tester', 
    icon: Mic, 
    title: 'Mic Tester Studio', 
    desc: 'Test hardware input levels and loopback echo.', 
    label: 'HARDWARE', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['mic tester', 'microphone test', 'audio input', 'record test', 'voice test', 'hardware check'],
    category: 'utilities'
  },
  { 
    href: '/youtube-thumbnail-downloader', 
    icon: MonitorPlay, 
    title: 'YT Downloader', 
    desc: 'Extract and save thumbnails in all available qualities.', 
    label: 'MEDIA', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['youtube thumbnail downloader', 'save youtube image', 'yt thumbnail', 'extract thumbnail'],
    category: 'image'
  },
  { 
    href: '/logo-maker', 
    icon: Type, 
    title: 'Logo Text Studio', 
    desc: 'Generate premium text-based logos and avatars.', 
    label: 'BRANDING', 
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    glowClass: 'bg-violet-500/10',
    keywords: ['logo text maker', 'text logo generator', 'brand name logo', 'avatar creator', 'business logo'],
    category: 'generators'
  },
  { 
    href: '/pdf-unlock', 
    icon: Unlock, 
    title: 'PDF Unlock', 
    desc: 'Remove security passwords from protected PDF masters.', 
    label: 'SECURITY', 
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
    glowClass: 'bg-green-500/10',
    keywords: ['unlock pdf', 'remove password', 'decrypt pdf', 'pdf remover', 'open protected pdf'],
    category: 'pdf'
  },
  { 
    href: '/pdf-password-protect', 
    icon: ShieldAlert, 
    title: 'PDF Password', 
    desc: 'Encrypt PDF documents with passwords and permissions.', 
    label: 'SECURITY', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['pdf password', 'encrypt pdf', 'lock pdf', 'protect document', 'secure pdf'],
    category: 'pdf'
  },
  { 
    href: '/text-to-pdf', 
    icon: FileText, 
    title: 'Text to PDF', 
    desc: 'Convert raw text or .txt files into professional PDF masters.', 
    label: 'DOCUMENT', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['text to pdf', 'convert text', 'txt to pdf', 'make pdf from text', 'type to pdf'],
    category: 'pdf'
  },
  { 
    href: '/pdf-rotator', 
    icon: RotateCw, 
    title: 'PDF Rotator', 
    desc: 'Correct orientation of PDF pages with live visual preview.', 
    label: 'DOCUMENT', 
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    glowClass: 'bg-blue-600/10',
    keywords: ['rotate pdf', 'fix orientation', 'sideways pdf', 'upside down', 'pdf fixer'],
    category: 'pdf'
  },
  { 
    href: '/word-to-pdf', 
    icon: FileText, 
    title: 'Word to PDF', 
    desc: 'Convert Word .docx documents into PDF masters locally.', 
    label: 'DOCUMENT', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['word to pdf', 'docx to pdf', 'convert word', 'word converter', 'doc to pdf'],
    category: 'pdf'
  },
  { 
    href: '/pdf-to-image', 
    icon: FileImage, 
    title: 'PDF to Image', 
    desc: 'Convert PDF pages into high-resolution PNG or JPG assets.', 
    label: 'CONVERT', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'convert pdf', 'extract images from pdf'],
    category: 'pdf'
  },
  { 
    href: '/pdf-splitter', 
    icon: Split, 
    title: 'PDF Splitter', 
    desc: 'Extract pages, custom ranges, or chunks from documents.', 
    label: 'DOCUMENT', 
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    glowClass: 'bg-blue-600/10',
    keywords: ['pdf split', 'extract pages', 'separate pdf', 'pdf chunks', 'split document'],
    category: 'pdf'
  },
  { 
    href: '/pdf-compressor', 
    icon: FileArchive, 
    title: 'PDF Compressor', 
    desc: 'Optimize and shrink PDF document size locally.', 
    label: 'OPTIMIZE', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['pdf compress', 'shrink pdf', 'smaller pdf', 'optimize document'],
    category: 'pdf'
  },
  { 
    href: '/duplicate-finder', 
    icon: Files, 
    title: 'Duplicate Purge', 
    desc: 'Find and remove redundant files from projects or ZIPs.', 
    label: 'STUDIO', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['duplicate finder', 'clean files', 'remove duplicate', 'zip cleaner', 'project optimization', 'duplicates'],
    category: 'utilities'
  },
  { 
    href: '/duplicate-line-remover', 
    icon: ListFilter, 
    title: 'Line Purge', 
    desc: 'Remove duplicate lines from text or lists instantly.', 
    label: 'TEXT', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['duplicate lines', 'line remover', 'unique lines', 'remove repeated', 'list cleaner', 'text purge'],
    category: 'utilities'
  },
  { 
    href: '/whatsapp-dp-maker', 
    icon: User, 
    title: 'WhatsApp DP', 
    desc: 'Make full-size WhatsApp profile pics without quality loss.', 
    label: 'IDENTITY', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['whatsapp dp maker', 'profile picture', 'uncut dp', 'whatsapp quality', 'whatsquality', 'hd dp', 'profile maker'],
    category: 'generators'
  },
  { 
    href: '/pdf-merger', 
    icon: FileStack, 
    title: 'PDF Merger', 
    desc: 'Combine multiple PDF documents into a single master file.', 
    label: 'DOCUMENT', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['pdf merge', 'combine pdf', 'join pdf', 'multiple pdfs', 'document joiner'],
    category: 'pdf'
  },
  { 
    href: '/image-to-file', 
    icon: ArrowRightLeft, 
    title: 'Image to File', 
    desc: 'Convert imagery to PNG, JPG, WebP, or single-page PDF.', 
    label: 'CONVERT', 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    glowClass: 'bg-blue-400/10',
    keywords: ['image to file', 'image converter', 'jpg to pdf', 'webp converter', 'png to webp', 'photo to pdf'],
    category: 'image'
  },
  { 
    href: '/file-compressor', 
    icon: FileArchive, 
    title: 'File Compressor', 
    desc: 'Professional browser-side size reduction for visual and digital assets.', 
    label: 'OPTIMIZE', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['compress file', 'reduce size', 'optimize', 'shrink', 'smaller', 'pdf compress', 'image compress'],
    category: 'utilities'
  },
  { 
    href: '/youtube-thumbnail-maker', 
    icon: MonitorPlay, 
    title: 'YT Thumbnail', 
    desc: 'Resize and frame images for 1280x720 thumbnails.', 
    label: 'YOUTUBE', 
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['youtube thumbnail size', '1280x720', 'yt thumbnail maker', 'thumbnail resizer', 'youtube thumbnail resizer'],
    category: 'generators'
  },
  { 
    href: '/age-calculator', 
    icon: Clock, 
    title: 'Age Calculator', 
    desc: 'Calculate exact age and birthday countdowns.', 
    label: 'STATS', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['age calculator', 'date of birth', 'how old am i', 'birthday', 'chronos', 'time lived'],
    category: 'utilities'
  },
  { 
    href: '/password-generator', 
    icon: Lock, 
    title: 'Password Studio', 
    desc: 'Generate cryptographically-secure strong passwords.', 
    label: 'SECURITY', 
    color: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    glowClass: 'bg-slate-400/10',
    keywords: ['password generator', 'random password', 'strong password', 'security', 'safe', 'key'],
    category: 'generators'
  },
  { 
    href: '/youtube-banner-maker', 
    icon: Youtube, 
    title: 'YouTube Banner', 
    desc: 'Create 2560x1440 channel art with safe-zone guides.', 
    label: 'YOUTUBE', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['youtube banner maker', 'youtube banner size', 'channel art', 'youtube cover maker', 'yt banner', 'safe area'],
    category: 'generators'
  },
  { 
    href: '/collage-maker', 
    icon: Grid2X2, 
    title: 'Collage Studio', 
    desc: 'Combine multiple images into professional grid layouts.', 
    label: 'GRID', 
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    glowClass: 'bg-teal-500/10',
    keywords: ['collage maker', 'photo grid', 'merge photos', '2x2 collage', 'photo collage', 'combine images'],
    category: 'image'
  },
  { 
    href: '/favicon-generator', 
    icon: LayoutGrid, 
    title: 'Favicon Studio', 
    desc: 'Generate web icon sets from any image instantly.', 
    label: 'WEB', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['favicon generator', 'favicon from image', 'site icon', 'ico maker', 'favicon png', 'apple touch icon'],
    category: 'image'
  },
  { 
    href: '/metadata-remover', 
    icon: EyeOff, 
    title: 'Privacy Purge', 
    desc: 'Strip GPS and EXIF metadata from any photo.', 
    label: 'SECURE', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['remove exif', 'metadata remover', 'strip gps', 'privacy photo', 'remove location from image', 'exif'],
    category: 'image'
  },
  { 
    href: '/word-counter', 
    icon: AlignLeft, 
    title: 'Word Counter', 
    desc: 'Live text analysis and reading time estimation.', 
    label: 'TEXT', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['word counter', 'character count', 'reading time', 'word count tool', 'text counter', 'speaking time'],
    category: 'utilities'
  },
  { 
    href: '/color-picker', 
    icon: Pipette, 
    title: 'Color Picker', 
    desc: 'Extract HEX, RGB, and HSL from any image.', 
    label: 'DESIGN', 
    color: 'text-pink-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-pink-500/10',
    keywords: ['color picker', 'pick color from image', 'hex', 'rgb', 'eye dropper', 'color from photo', 'palette'],
    category: 'image'
  },
  { 
    href: '/rgb-picker', 
    icon: Palette, 
    title: 'RGB Studio', 
    desc: 'Precision color picking and space conversion.', 
    label: 'ENGINE', 
    color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20',
    glowClass: 'bg-fuchsia-500/10',
    keywords: ['rgb picker', 'hex color', 'hsl', 'color converter', 'color picker', 'cmyk', 'hsv'],
    category: 'image'
  },
  { 
    href: '/markdown-preview', 
    icon: FileEdit, 
    title: 'Markdown Preview', 
    desc: 'Live Markdown to HTML synthesis with visual preview.', 
    label: 'MARKUP', 
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    glowClass: 'bg-sky-500/10',
    keywords: ['markdown preview', 'md to html', 'markdown editor', 'markdown to html', 'live markdown', 'markup'],
    category: 'utilities'
  },
  { 
    href: '/image-converter', 
    icon: RefreshCcw, 
    title: 'Image Converter', 
    desc: 'Seamlessly switch between PNG and JPG formats.', 
    label: 'FORMAT', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['png to jpg', 'jpg to png', 'convert image', 'png jpg converter', 'jpeg', 'image format'],
    category: 'image'
  },
  { 
    href: '/image-resizer', 
    icon: Maximize, 
    title: 'Image Resizer', 
    desc: 'Scale pixel dimensions with aspect ratio control.', 
    label: 'SCALE', 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
    keywords: ['resize', 'resizer', 'image resizer', 'resize photo', 'change size', 'width height', 'px', 'scale image', 'dimension'],
    category: 'image'
  },
  { 
    href: '/image-compressor', 
    icon: Maximize, 
    title: 'Image Compressor', 
    desc: 'Shrink file size locally with quality control.', 
    label: 'OPTIMIZE', 
    color: 'text-lime-500 bg-lime-500/10 border-lime-500/20',
    glowClass: 'bg-lime-500/10',
    keywords: ['compress', 'image compressor', 'reduce size', 'jpg', 'photo size', 'optimize', 'shrink', 'smaller'],
    category: 'image'
  },
  { 
    href: '/image-to-pdf', 
    icon: FileStack, 
    title: 'Image to PDF', 
    desc: 'Convert multiple images into a professional PDF.', 
    label: 'DOCUMENT', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photo pdf', 'convert pdf', 'bundle', 'pdf'],
    category: 'image'
  },
  { 
    href: '/photo-editor', 
    icon: ImageIcon, 
    title: 'Photo Studio', 
    desc: 'Professional filters and local image editing.', 
    label: 'EDITOR', 
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    glowClass: 'bg-violet-500/10',
    keywords: ['photo', 'image', 'edit', 'crop', 'filter', 'editor', 'picture', 'manipulate', 'brightness', 'contrast'],
    category: 'image'
  },
  { 
    href: '/vocal-separator', 
    icon: MicOff, 
    title: 'Vocal Remover', 
    desc: 'Simple stereo matrix for vocal or music reduction.', 
    label: 'KARAOKE', 
    color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['vocal remover', 'karaoke', 'remove vocals', 'instrumental', 'music separator', 'audio separator'],
    category: 'utilities'
  },
  { 
    href: '/video-to-audio', 
    icon: Music, 
    title: 'Video to MP3', 
    desc: 'Extract high-quality audio tracks from videos.', 
    label: 'MEDIA', 
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['mp4', 'mp3', 'video', 'audio', 'convert', 'music', 'extract', 'sound', 'ffmpeg'],
    category: 'utilities'
  },
  { 
    href: '/video-to-gif', 
    icon: Film, 
    title: 'Video to GIF', 
    desc: 'Synthesize high-quality animated GIFs from clips.', 
    label: 'ANIMATION', 
    color: 'text-orange-600 bg-orange-600/10 border-orange-600/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['video to gif', 'mp4 to gif', 'make gif', 'convert gif', 'animated', 'clip'],
    category: 'utilities'
  },
  { 
    href: '/audio-joiner', 
    icon: ListMusic, 
    title: 'Audio Joiner', 
    desc: 'Merge multiple audio files into a single master track.', 
    label: 'PRODUCTION', 
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    glowClass: 'bg-blue-600/10',
    keywords: ['audio joiner', 'merge mp3', 'combine audio', 'mp3 join', 'merge songs', 'wav', 'sound'],
    category: 'utilities'
  },
  { 
    href: '/audio-booster', 
    icon: Volume2, 
    title: 'Volume Booster', 
    desc: 'Amplify audio levels safely entirely in your browser.', 
    label: 'BOOST', 
    color: 'text-teal-600 bg-teal-500/10 border-teal-500/20',
    glowClass: 'bg-teal-500/10',
    keywords: ['volume booster', 'louder audio', 'boost mp3', 'increase volume', 'audio gain', 'loud', 'mp3', 'wav'],
    category: 'utilities'
  },
  { 
    href: '/letter-art', 
    icon: CaseSensitive, 
    title: 'Letter Art Studio', 
    desc: 'Image to text conversion using custom alphabets.', 
    label: 'ASCII', 
    color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    glowClass: 'bg-slate-500/10',
    keywords: ['image to text', 'ascii art', 'letters art', 'custom characters', 'image to alphabet', 'text art', 'alphabet art'],
    category: 'image'
  },
  { 
    href: '/ocr', 
    icon: FileText, 
    title: 'OCR Extraction', 
    desc: 'Extract text from images locally and securely.', 
    label: 'INTEL', 
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['text', 'extract', 'ocr', 'image to text', 'recognize', 'scan', 'read'],
    category: 'utilities'
  },
  { 
    href: '/dot-art', 
    icon: Grid3X3, 
    title: 'Dot Art Studio', 
    desc: 'Convert images to intricate Braille character art.', 
    label: 'CREATIVE', 
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'bg-indigo-500/10',
    keywords: ['dots', 'braille', ' art', 'image to text', 'ascii'],
    category: 'image'
  },
  { 
    href: '/repeater', 
    icon: Repeat, 
    title: 'Text Repeater', 
    desc: 'Professional emoji and text multiplication.', 
    label: 'UTIL', 
    color: 'text-pink-600 bg-pink-500/10 border-pink-600/20',
    glowClass: 'bg-pink-500/10',
    keywords: ['repeat', 'text repeat', 'emoji', 'multiply', 'spam', 'util', 'repeater', 'cloner'],
    category: 'generators'
  },
  { 
    href: '/hex-converter', 
    icon: FileCode, 
    title: 'Hex Converter', 
    desc: 'Convert binary files to hexadecimal matrix.', 
    label: 'BINARY', 
    color: 'text-indigo-600 bg-indigo-600/10 border-indigo-600/20',
    glowClass: 'bg-indigo-600/10',
    keywords: ['hex', 'hexadecimal', 'binary', 'file', 'matrix', 'bytes', 'dump', 'offset'],
    category: 'utilities'
  },
  { 
    href: '/code-converter', 
    icon: Binary, 
    title: 'AOB Converter', 
    desc: 'Professional AOB pattern conversion utility.', 
    label: 'DEV', 
    color: 'text-cyan-600 bg-cyan-500/10 border-cyan-600/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['aob', 'code', 'binary', 'convert', 'pattern', 'trainer', 'hex', 'c#', 'c++', 'python', 'array of bytes'],
    category: 'utilities'
  },
  { 
    href: '/dictionary', 
    icon: Book, 
    title: 'English Dictionary', 
    desc: 'Professional linguistic analysis and definitions.', 
    label: 'LANG', 
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['dictionary', 'word meaning', 'definition', 'linguistic', 'english'],
    category: 'utilities'
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
        isGrid ? "flex-col h-full" : "w-full"
      )}
    >
      <div className={cn(
        "relative flex-1 flex rounded-[2.5rem] bg-secondary/30 border border-white/5 hover:border-primary/20 hover:bg-secondary/50 transition-all duration-500 shadow-2xl group-hover:shadow-primary/5 overflow-hidden",
        isGrid ? "flex-col p-8 hover:-translate-y-2 text-left" : "flex-row items-center p-6 hover:-translate-x-1 gap-6"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={cn(
          "rounded-2xl flex items-center justify-center border transition-all duration-500 icon-container-3d relative z-10 shrink-0",
          isGrid ? "w-14 h-14 mb-10" : "w-12 h-12",
          item.color
        )}>
          <item.icon className={cn("icon-3d", isGrid ? "w-7 h-7" : "w-6 h-6")} />
          <div className={cn("absolute inset-0 blur-xl opacity-20 transition-opacity group-hover:opacity-40", item.glowClass)} />
        </div>

        <div className="relative z-10 space-y-4 flex-1 min-w-0">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">{item.label}</span>
              {isGrid && <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />}
            </div>
            <h3 className={cn(
              "font-headline font-black text-foreground uppercase tracking-tight leading-none group-hover:text-primary transition-colors truncate",
              isGrid ? "text-xl" : "text-lg"
            )}>
              {item.title}
            </h3>
          </div>
          <p className={cn(
            "text-sm text-foreground/40 leading-relaxed font-medium overflow-wrap-anywhere",
            isGrid ? "line-clamp-2" : "truncate"
          )}>
            {item.desc}
          </p>
          {isGrid && (
            <div className="mt-auto pt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              Open <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500 icon-3d" />
            </div>
          )}
        </div>

        {!isGrid && (
          <div className="flex items-center gap-3 shrink-0 relative z-10 ml-auto">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/0 group-hover:text-primary transition-all translate-x-2 group-hover:translate-x-0 hidden sm:inline-block">Open Studio</span>
            <ArrowRight className="w-5 h-5 text-primary/20 group-hover:text-primary transition-all group-hover:translate-x-1 icon-3d" />
          </div>
        )}
      </div>
    </Link>
  );
});

ToolItem.displayName = 'ToolItem';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Search Placeholder Typing Animation Matrix
  const [placeholder, setPlaceholder] = useState('');
  const [toolIndex, setToolIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);
  const [isFocused, setIsFocused] = useState(false);

  const phrases = useMemo(() => {
    const list = [
      'Merge PDF', 'Compress Image', 'QR Generator', 'WhatsApp DP', 
      'Word to PDF', 'Photo Enhance', 'Age Calculator', 'OCR Extraction', 
      'Logo Maker', 'Bulk Production', 'Password Studio', 'Color Picker',
      'Video to MP3', 'Image to PDF', 'AOB Converter', 'Nickname Studio',
      'Letter Art', 'Favicon Studio', 'JSON Formatter', 'Regex Tester', 'Hash Generator',
      'UUID Generator', 'Lorem Ipsum', 'Image Border', 'Custom Watermark', 'Barcode Reader',
      'Images to GIF', 'Image to WebP', 'Blur Face', 'WiFi QR', 'P2P Share', 'Send File', 'Toffee',
      'Hide text in image', 'Secret photo', 'Steganography', 'Temp Room', 'Clipboard share', 
      'Join code', 'Sim Data', 'HTML to URL', 'Paste HTML link', 'Tax Calculator', 'GST Calculator'
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

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden pb-32">
      {/* JSON-LD for Organization & ItemList */}
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

      {/* HERO SECTION - RECALIBRATED COSMIC PROTOCOL */}
      <section className="w-full px-4 sm:px-6 pt-20 pb-12 md:pt-24 md:pb-16 min-h-0 text-center relative overflow-visible flex flex-col justify-center">
        <SpaceBackground />
        
        <div className="max-w-5xl mx-auto animate-reveal relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <Command className="w-3 h-3 icon-3d" /> Digital Studio v7.2
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
              Verified {TOOLS.length} Production Units
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-headline font-black mb-4 leading-[0.9] tracking-tighter text-foreground uppercase max-w-4xl mx-auto overflow-wrap-anywhere">
            The World’s Most <span className="text-primary">Advanced</span> Tool Studio
          </h1>
          <p className="text-base sm:text-lg text-foreground/40 max-w-2xl mx-auto leading-relaxed font-medium mb-8 px-4 overflow-wrap-anywhere">
            Professional high-fidelity asset generation and technical data translation. Engineered for high-performance workflows with 100% hardware-native privacy.
          </p>

          {/* Search & Category Bar */}
          <div className="max-w-4xl mx-auto space-y-6 px-4">
             {/* Search Input */}
             <div className="max-w-2xl mx-auto group relative">
                <div className="absolute -inset-10 bg-primary/10 blur-[60px] rounded-full opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                <div className="absolute -inset-[3px] rounded-[1.4rem] bg-primary/30 opacity-0 group-hover:opacity-60 group-focus-within/search:opacity-0 transition-opacity duration-500 animate-search-glow blur-[2px] pointer-events-none" />

                <div className="relative h-16 w-full rounded-2xl p-[1px] bg-gradient-to-b from-white/20 to-transparent shadow-2xl duration-500 group-hover:from-primary/30 group-focus-within/search:from-primary/60 group-focus-within/search:to-primary/30">
                  <div className="moving-border-matrix" />
                  <div className="relative flex items-center w-full h-full bg-card rounded-[calc(1rem-1px)] overflow-hidden border border-white/10 group-focus-within/search:border-primary/50 group-focus-within/search:shadow-[0_0_60px_-5px_rgba(59,130,246,0.6)] transition-all duration-300 z-10">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-none">
                      <Search className="w-5 h-5 text-foreground/20 group-focus-within/search:text-primary transition-colors icon-3d" />
                    </div>
                    <Input 
                      type="text"
                      placeholder={dynamicPlaceholder}
                      aria-label="Search tools"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-full w-full pl-14 pr-12 bg-transparent border-none focus-visible:ring-0 rounded-none text-base font-medium placeholder:text-foreground/20"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-5 flex items-center text-foreground/20 hover:text-primary transition-colors"
                      >
                        <X className="w-5 h-5 icon-3d" />
                      </button>
                    )}
                  </div>
                </div>
             </div>

             {/* Category Pills - Sticky Row */}
             <div className="sticky top-20 z-20 flex flex-wrap items-center justify-center gap-2 p-2 rounded-[2rem] bg-secondary/50 border border-white/5 backdrop-blur-xl shadow-2xl w-fit mx-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                      selectedCategory === cat.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105" 
                        : "bg-white/5 border-white/5 text-foreground/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5"
                    )}
                  >
                    <cat.icon className={cn("w-3.5 h-3.5", selectedCategory === cat.id ? "icon-3d" : "")} />
                    {cat.label}
                  </button>
                ))}
             </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mt-6 mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-secondary/50 border border-white/5 backdrop-blur-xl relative group/toggle shadow-2xl">
               <div 
                  className={cn(
                    "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl transition-all duration-300 shadow-lg shadow-primary/20",
                    viewMode === 'grid' ? "left-1.5" : "left-[calc(50%+1.5px)]"
                  )}
               />
               <button 
                onClick={() => toggleViewMode('grid')}
                className={cn(
                  "relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest",
                  viewMode === 'grid' ? "text-primary-foreground" : "text-foreground/40 hover:text-primary"
                )}
               >
                 <LayoutGrid className="w-3.5 h-3.5 icon-3d" /> Grid
               </button>
               <button 
                onClick={() => toggleViewMode('list')}
                className={cn(
                  "relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest",
                  viewMode === 'list' ? "text-primary-foreground" : "text-foreground/40 hover:text-primary"
                )}
               >
                 <List className="w-3.5 h-3.5 icon-3d" /> List
               </button>
            </div>
          </div>

          {/* Unified Tool Matrix Container */}
          <div className={cn(
            "w-full transition-all duration-300",
            viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4 max-w-4xl mx-auto"
          )}>
            {filteredTools.length > 0 ? (
              filteredTools.map((item) => (
                <ToolItem key={item.href} item={item} mode={viewMode} />
              ))
            ) : (
              <EmptyState onReset={() => { setSearchQuery(''); setSelectedCategory('all'); }} />
            )}
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="w-full py-32 border-t border-white/5 relative bg-[#060608]/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                Privacy Sovereign
              </div>
              <h2 className="text-4xl sm:text-6xl font-headline font-black uppercase tracking-tight leading-[0.95] overflow-wrap-anywhere">Definitive <span className="text-primary italic">Security</span> Mandate</h2>
              <p className="text-lg text-foreground/40 font-medium leading-relaxed overflow-wrap-anywhere">
                Our studio operates entirely within your browser's memory sandbox. We have eliminated server-side storage to ensure your branding and technical data remain strictly private and permanent.
              </p>
              <div className="grid grid-cols-1 gap-6 pt-4">
                {[
                  { title: 'WASM Processing', desc: 'Hardware-accelerated performance via WebAssembly.', icon: Zap },
                  { title: 'Zero Data Leakage', desc: 'No logs, no cookies, no third-party tracking.', icon: ShieldCheck },
                  { title: 'Fidelity Control', desc: '1:1 pixel mapping for precision production.', icon: Maximize }
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 items-start group/feat">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1 icon-container-3d group-hover/feat:scale-110 transition-transform">
                      <f.icon className="w-4 h-4 icon-3d" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-black uppercase tracking-widest text-foreground truncate">{f.title}</h4>
                      <p className="text-xs text-foreground/40 font-medium overflow-wrap-anywhere">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 relative">
               <div className="glass-card p-4 rounded-[2.5rem] border-white/10 shadow-2xl relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center group">
                     <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mykit-ui/1200/800')] bg-cover bg-center opacity-30 grayscale transition-all duration-1000 group-hover:scale-110" />
                     <div className="relative z-10 w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-current ml-1 icon-3d" />
                     </div>
                  </div>
               </div>
               <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
               <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            </div>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="w-full px-6 py-40 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
           <h2 className="text-5xl sm:text-8xl font-headline font-black uppercase tracking-tight leading-none overflow-wrap-anywhere">Ready for <span className="text-primary italic">Production?</span></h2>
           <p className="text-lg text-foreground/40 font-medium max-w-xl mx-auto uppercase tracking-tighter overflow-wrap-anywhere">
             Join thousands of designers and engineers using the world's premier local utility matrix.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/single" className="w-full sm:w-auto px-12 py-5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
               Open Studio
             </Link>
             <Link href="/about" className="w-full sm:w-auto px-12 py-5 bg-white/5 border border-white/10 text-foreground/40 font-black text-xs uppercase tracking-[0.3em] rounded-xl hover:bg-white/10 transition-all">
               Documentation
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full py-24 glass-card rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center gap-8 px-6">
      <Search className="w-12 h-12 text-foreground/5 animate-pulse icon-3d" />
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight">Coming Soon</h3>
        <p className="text-sm text-foreground/30 font-medium uppercase tracking-widest">Adjust query parameters for wider discovery</p>
      </div>
      <ShadButton 
        onClick={onReset}
        variant="outline"
        className="h-12 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest border-white/10 w-full sm:w-auto"
      >
        <RotateCcw className="w-4 h-4 mr-2 icon-3d" />
        Reset
      </ShadButton>
    </div>
  );
}
