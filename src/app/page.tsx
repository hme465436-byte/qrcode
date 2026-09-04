"use client"

import React, { useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
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
  Receipt,
  Trophy,
  Dices,
  Scale,
  UserCircle,
  Maximize2,
  Keyboard,
  ChevronDown,
  Gauge,
  MapPin,
  Banknote,
  Cloud,
  Moon,
  BookOpen,
  MessageCircle,
  Sparkles,
  Footprints,
  Laugh,
  Lightbulb,
  Gamepad2,
  Calendar,
  Quote,
  Languages,
  Joystick,
  Github,
  Shield,
  Network,
  Mail,
  MailQuestion,
  Link as LinkIcon,
  Heart,
  Hammer,
  Hash as HashIcon,
  History,
  Edit3,
  MessageSquare,
  Database,
  CloudUpload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button as ShadButton } from '@/components/ui/button';
import { SpaceBackground } from '@/components/qr-canvas/space-background';
import { Card, CardContent } from '@/components/ui/card';

const VIEW_MODE_KEY = 'mykit_view_mode';
const SCROLL_POS_KEY = 'mykit_home_scroll_v1';

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
    href: '/temp-upload', 
    icon: CloudUpload, 
    title: 'Temp Upload', 
    desc: 'Connect ImgBB, GoFile, Pixeldrain or Cloudflare R2 and upload files with expiry reminders.', 
    label: 'STORAGE', 
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'bg-indigo-500/10',
    keywords: ['temp upload', 'cloudflare r2', 'imgbb', 'gofile', 'pixeldrain', 'storage', 'file host', 'reminders'],
    category: 'utilities'
  },
  { 
    href: '/whatsapp-link-generator', 
    icon: MessageSquare, 
    title: 'WhatsApp Link', 
    desc: 'Generate instant chat links with custom messages.', 
    label: 'PRO TOOL', 
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
    glowClass: 'bg-green-500/10',
    keywords: ['whatsapp link', 'wa.me', 'chat link', 'whatsapp generator', 'send message', 'whatsapp me'],
    category: 'generators'
  },
  { 
    href: '/all-units-converter', 
    icon: ArrowRightLeft, 
    title: 'All Units Converter', 
    desc: 'Professional universal measurement matrix. Convert Length, Weight, Temp, and more.', 
    label: 'FISCAL', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['unit converter', 'length', 'weight', 'temperature', 'area', 'volume', 'speed', 'time', 'data', 'pressure', 'energy', 'power', 'angle'],
    category: 'utilities'
  },
  { 
    href: '/fake-data', 
    icon: Database, 
    title: 'Fake Data Generator', 
    desc: 'Generate realistic fake names, emails, addresses, phone numbers and more for testing.', 
    label: 'GENERATORS', 
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'bg-indigo-500/10',
    keywords: ['fake data', 'dummy data', 'test data', 'names generator', 'identity maker', 'mock data'],
    category: 'generators'
  },
  { 
    href: '/site-backup-cloner', 
    icon: FileArchive, 
    title: 'Site Backup Cloner', 
    desc: 'Isolate and download public frontend assets into a local ZIP backup.', 
    label: 'MAINTENANCE', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['backup', 'clone', 'download site', 'save page', 'html backup', 'zip assets'],
    category: 'utilities'
  },
  { 
    href: '/username-checker', 
    icon: Search, 
    title: 'Username Checker', 
    desc: 'Check username availability across 20+ major platforms.', 
    label: 'OSINT', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['username', 'checker', 'osint', 'find user', 'social search', 'taken', 'available'],
    category: 'utilities'
  },
  { 
    href: '/domain-whois', 
    icon: Globe, 
    title: 'Domain Whois', 
    desc: 'Isolate domain birth-dates, registrar metadata, and security status.', 
    label: 'INTEL', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['domain', 'whois', 'age', 'registrar', 'expiration', 'nameserver'],
    category: 'utilities'
  },
  { 
    href: '/temp-mail', 
    icon: Mail, 
    title: 'Temp Mail Pro', 
    desc: 'Advanced multi-node temporary email synthesis.', 
    label: 'ANONYMOUS', 
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['temp mail', 'disposable email', 'anonymous mail', 'fake email', 'temp inbox', '1secmail'],
    category: 'utilities'
  },
  { 
    href: '/gmail-alias', 
    icon: Mail, 
    title: 'Gmail Alias Generator', 
    desc: 'Create unlimited Gmail aliases using Dot Trick & Plus Addressing. All emails go to your real inbox.', 
    label: 'LINGUISTIC', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['gmail alias', 'dot trick', 'plus addressing', 'email aliases', 'gmail generator'],
    category: 'generators'
  },
  { 
    href: '/link-safety-checker', 
    icon: ShieldCheck, 
    title: 'Link Safety', 
    desc: 'Expand short links and identify potential phishing threats.', 
    label: 'SECURITY', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['link safety', 'unshorten', 'expand url', 'phishing check', 'security', 'malware', 'check link'],
    category: 'utilities'
  },
  { 
    href: '/background-remove', 
    icon: Eraser, 
    title: 'Background Remove', 
    desc: 'Isolate subjects from photos and export high-fidelity transparent PNGs.', 
    label: 'IMAGE PRO', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['background remove', 'transparent image', 'png maker', 'subject isolate', 'cutout', 'remove.bg'],
    category: 'image'
  },
  { 
    href: '/telegram-file-host', 
    icon: MessageCircle, 
    title: 'FILE HOST', 
    desc: 'Archive and share any file via the Cloud Host Protocol.', 
    label: 'HOSTING', 
    color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    glowClass: 'bg-sky-400/10',
    keywords: ['file host', 'file sharing', 'send file', 'cloud upload', 'archive', 'cloud share'],
    category: 'utilities'
  },
  { 
    href: '/image-to-link', 
    icon: LinkIcon, 
    title: 'Image to Link', 
    desc: 'Upload visual assets and generate shareable link matrices via Imgur.', 
    label: 'HOSTING', 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
    keywords: ['image to link', 'hosting', 'imgur', 'share image', 'upload photo', 'link maker', 'direct link'],
    category: 'image'
  },
  { 
    href: '/dns-lookup', 
    icon: Globe, 
    title: 'DNS Lookup', 
    desc: 'Professional DNS record discovery and auditing.', 
    label: 'NETWORK', 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    glowClass: 'bg-blue-400/10',
    keywords: ['dns', 'lookup', 'records', 'mx', 'txt', 'domain', 'ip'],
    category: 'utilities'
  },
  { 
    href: '/password-breach-checker', 
    icon: ShieldAlert, 
    title: 'Breach Checker', 
    desc: 'Verify if passwords have been exposed using secure k-Anonymity.', 
    label: 'SECURITY', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['password breach', 'pwned', 'security check', 'hack check', 'breach checker', 'password safety'],
    category: 'utilities'
  },
  { 
    href: '/website-trust-checker', 
    icon: ShieldCheck, 
    title: 'Trust Checker', 
    desc: 'Professional multi-node security diagnostics and domain auditing.', 
    label: 'SECURITY', 
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    glowClass: 'bg-red-500/10',
    keywords: ['trust', 'security', 'malware', 'dns', 'ip', 'safe', 'website check', 'phishing'],
    category: 'utilities'
  },
  { 
    href: '/github-user', 
    icon: Github, 
    title: 'GitHub Finder', 
    desc: 'Isolate developer profile metadata, repository density, and social reach.', 
    label: 'DEV INTEL', 
    color: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    glowClass: 'bg-slate-400/10',
    keywords: ['github', 'user', 'developer', 'profile', 'repos', 'git', 'finder'],
    category: 'utilities'
  },
  { 
    href: '/coding-resources', 
    icon: FileCode, 
    title: 'Coding Matrix', 
    desc: 'Isolate high-fidelity learning assets and technical documentation.', 
    label: 'LIBRARY', 
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    glowClass: 'bg-cyan-400/10',
    keywords: ['coding', 'learning', 'resources', 'documentation', 'programming', 'tutorial'],
    category: 'generators'
  },
  { 
    href: '/free-games', 
    icon: Gamepad2, 
    title: 'Free Games', 
    desc: 'Isolate high-fidelity free titles for PC and Browser.', 
    label: 'DISCOVERY', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['games', 'free games', 'pc games', 'browser games', 'freetogame', 'entertainment'],
    category: 'generators'
  },
  { 
    href: '/translate', 
    icon: Languages, 
    title: 'Translate Studio', 
    desc: 'Professional English to Urdu translation with real-time sync.', 
    label: 'LINGUISTIC', 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    glowClass: 'bg-blue-400/10',
    keywords: ['translate', 'translation', 'english to urdu', 'urdu to english', 'language', 'converter'],
    category: 'utilities'
  },
  { 
    href: '/image-gallery', 
    icon: ImageIcon, 
    title: 'Image Gallery', 
    desc: 'Professional multi-source discovery. Extract high-res visuals from global scientific and art registries.', 
    label: 'DISCOVERY', 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
    keywords: ['image', 'stock', 'nasa', 'art', 'openverse', 'gallery', 'photos', 'download'],
    category: 'image'
  },
  { 
    href: '/holidays', 
    icon: Calendar, 
    title: 'Holiday Studio', 
    desc: 'Isolate global public holidays and verified Pakistan 2026 matrix.', 
    label: 'TEMPORAL', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['holiday', 'calendar', 'pakistan holidays', 'public holidays', 'namaz', 'date'],
    category: 'utilities'
  },
  { 
    href: '/pokemon', 
    icon: Gamepad2, 
    title: 'Pokemon Studio', 
    desc: 'Isolate high-fidelity unit data, base stats, and visual identifiers.', 
    label: 'DISCOVERY', 
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['pokemon', 'pokedex', 'stats', 'sprite', 'discovery', 'lookup', 'game'],
    category: 'generators'
  },
  { 
    href: '/facts', 
    icon: Lightbulb, 
    title: 'Fact Studio', 
    desc: 'Synthesize high-fidelity useless facts and randomized knowledge instantly.', 
    label: 'KNOWLEDGE', 
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    glowClass: 'bg-yellow-400/10',
    keywords: ['fact', 'knowledge', 'random fact', 'info', 'useless facts'],
    category: 'generators'
  },
  { 
    href: '/pets', 
    icon: Footprints, 
    title: 'Pet Studio', 
    desc: 'Professional random pet discovery. Isolate canine and feline visual identities.', 
    label: 'MEDIA', 
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    glowClass: 'bg-orange-400/10',
    keywords: ['dog', 'cat', 'pets', 'random photo', 'canine', 'feline', 'animal'],
    category: 'generators'
  },
  { 
    href: '/country', 
    icon: Globe, 
    title: 'Country Info', 
    desc: 'Isolate clinical profiles, flags, and geographic matrices of global identities.', 
    label: 'INTEL', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['country', 'info', 'flag', 'population', 'capital', 'maps', 'geography', 'world'],
    category: 'utilities'
  },
  { 
    href: '/crypto-prices', 
    icon: Coins, 
    title: 'Crypto Prices', 
    desc: 'Real-time market telemetry for BTC, ETH, and more in USD/PKR.', 
    label: 'FISCAL', 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'bg-orange-500/10',
    keywords: ['crypto', 'bitcoin', 'btc', 'price', 'ethereum', 'solana', 'market'],
    category: 'utilities'
  },
  { 
    href: '/quran-ayah', 
    icon: BookOpen, 
    title: 'Quran Ayah', 
    desc: 'Explore verses through random synthesis or clinical reference lookup.', 
    label: 'LINGUISTIC', 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
    keywords: ['quran', 'ayah', 'verse', 'islamic', 'arabic', 'translation', 'random'],
    category: 'generators'
  },
  { 
    href: '/namaz-times', 
    icon: Moon, 
    title: 'Namaz Times', 
    desc: 'Clinical prayer timings with Hijri calendar and countdown.', 
    label: 'TEMPORAL', 
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    glowClass: 'bg-indigo-400/10',
    keywords: ['namaz', 'prayer times', 'salat', 'islamic', 'hijri', 'fajr', 'maghrib', 'karachi'],
    category: 'utilities'
  },
  { 
    href: '/weather', 
    icon: Cloud, 
    title: 'Weather Intel', 
    desc: 'Real-time global forecast with 3-day projection matrix.', 
    label: 'ENV', 
    color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    glowClass: 'bg-sky-400/10',
    keywords: ['weather', 'forecast', 'temperature', 'rain', 'humidity', 'cloud', 'env'],
    category: 'utilities'
  },
  { 
    href: '/speed-test', 
    icon: Gauge, 
    title: 'Speed Test', 
    desc: 'Professional network telemetry. Test download, upload, and ping.', 
    label: 'TELEMETRY', 
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['speed test', 'internet speed', 'mbps', 'ping', 'download speed', 'upload speed', 'wifi test'],
    category: 'utilities'
  },
  { 
    href: '/currency-converter', 
    icon: Banknote, 
    title: 'Currency Converter', 
    desc: 'Real-time global exchange rates with local-only processing.', 
    label: 'FISCAL', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['currency', 'exchange rate', 'usd to pkr', 'money converter', 'forex', 'finance'],
    category: 'utilities'
  },
  { 
    href: '/ip-finder', 
    icon: MapPin, 
    title: 'IP Finder', 
    desc: 'Isolate network identity, ISP, and geographic coordinates.', 
    label: 'INTEL', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['ip finder', 'my ip', 'what is my ip', 'isp finder', 'location from ip', 'public ip'],
    category: 'utilities'
  },
  { 
    href: '/keyboard-test', 
    icon: Keyboard, 
    title: 'Keyboard Test', 
    desc: 'Professional hardware integrity matrix. Test every key for response.', 
    label: 'HARDWARE', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['keyboard test', 'key test', 'button test', 'typing test', 'hardware check', 'keyboard ghosting'],
    category: 'utilities'
  },
  { 
    href: '/image-size-increaser', 
    icon: Maximize2, 
    title: 'Size Increaser', 
    desc: 'Enlarge images and inflate file size for specific requirements.', 
    label: 'SCALE', 
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'bg-indigo-500/10',
    keywords: ['enlarge', 'upscale', 'kb increaser', 'increase size', 'high quality scale', 'px'],
    category: 'image'
  },
  { 
    href: '/wps-sheets', 
    icon: Table, 
    title: 'WPS Sheets', 
    desc: 'Create and edit spreadsheets for WPS and Excel locally.', 
    label: 'FISCAL', 
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'bg-emerald-500/10',
    keywords: ['wps', 'excel', 'spreadsheet', 'table', 'csv', 'inventory', 'income', 'sheets'],
    category: 'utilities'
  },
  { 
    href: '/bio-maker', 
    icon: UserCircle, 
    title: 'Bio Maker Studio', 
    desc: 'Generate aesthetic, unique bios for IG, TikTok, WA, and FB.', 
    label: 'IDENTITY', 
    color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    glowClass: 'bg-pink-500/10',
    keywords: ['bio maker', 'instagram bio', 'tiktok bio', 'aesthetic bio', 'cool bio', 'profile bio', 'social media bio'],
    category: 'generators'
  },
  { 
    href: '/bmi-calculator', 
    icon: Scale, 
    title: 'BMI Calculator', 
    desc: 'Calculate body mass index and healthy weight ranges.', 
    label: 'HEALTH', 
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    glowClass: 'bg-rose-500/10',
    keywords: ['bmi', 'weight calculator', 'health', 'body mass', 'overweight', 'obesity', 'fitness'],
    category: 'utilities'
  },
  { 
    href: '/lucky-draw', 
    icon: Trophy, 
    title: 'Lucky Draw', 
    desc: 'Fair random selection wheel for giveaways and prizes.', 
    label: 'CHANCE', 
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    glowClass: 'bg-amber-400/10',
    keywords: ['lucky draw', 'spin wheel', 'random winner', 'giveaway', 'prize wheel', 'raffle'],
    category: 'generators'
  },
  { 
    href: '/tax-calculator', 
    icon: Coins, 
    title: 'Tax Calculator', 
    desc: 'Calculate extra % or reverse-lookup original prices instantly.', 
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
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
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
    keywords: ['bulk', 'batch', 'many', 'qr', 'barcodes', 'production', 'zip'],
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
    title: 'Photo Enhance', 
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
    keywords: ['rotate pdf', 'fix orientation', 'sideways pdf', 'upsside down', 'pdf fixer'],
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
    title: 'Markdown', 
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
    glowClass: 'bg-target-color/10',
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
    glowClass: 'bg-blue-500/10',
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
    glowClass: 'bg-blue-500/10',
    keywords: ['volume booster', 'louder audio', 'boost mp3', 'increase volume', 'audio gain', 'loud', 'mp3', 'wav'],
    category: 'utilities'
  },
  { 
    href: '/letter-art', 
    icon: CaseSensitive, 
    title: 'Letter Art', 
    desc: 'Image to text conversion using custom alphabets.', 
    label: 'ASCII', 
    color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    glowClass: 'bg-slate-500/10',
    keywords: ['image to text', 'ascii art', 'letters art', 'custom characters', 'image to alphabet', 'text art', 'alphabet art'],
    category: 'image'
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
    color: 'text-pink-600 bg-pink-500/10 border-pink-500/20',
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
    glowClass: 'bg-indigo-100/10',
    keywords: ['hex', 'hexadecimal', 'binary', 'file', 'matrix', 'bytes', 'dump', 'offset'],
    category: 'utilities'
  },
  { 
    href: '/code-converter', 
    icon: Binary, 
    title: 'AOB Converter', 
    desc: 'Professional AOB pattern conversion utility.', 
    label: 'DEV', 
    color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'bg-cyan-500/10',
    keywords: ['aob', 'code', 'binary', 'convert', 'pattern', 'trainer', 'hex', 'c#', 'c++', 'python', 'array of bytes'],
    category: 'utilities'
  },
  { 
    href: '/dictionary', 
    icon: Book, 
    title: 'Dictionary', 
    desc: 'Professional English word search and definitions.', 
    label: 'LANG', 
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['dictionary', 'word meaning', 'definition', 'linguistic', 'english'],
    category: 'utilities'
  },
  { 
    href: '/png-finder', 
    icon: FileImage, 
    title: 'PNG Finder Studio', 
    desc: 'Search and download PNG images for editing', 
    label: 'IMAGE', 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    glowClass: 'bg-emerald-400/10',
    keywords: ['png finder', 'transparent image', 'png download', 'search images'],
    category: 'image'
  },
  { 
    href: '/icon-studio', 
    icon: Shapes, 
    title: 'Icon Studio', 
    desc: 'Search social icons, recolor, download SVG PNG ICO', 
    label: 'DESIGN', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['icons', 'social icons', 'svg', 'png', 'ico', 'recolor', 'logo', 'design'],
    category: 'image'
  },
  { 
    href: '/username-forge', 
    icon: Hammer, 
    title: 'Username Forge', 
    desc: 'Forge unique usernames and check cross-platform availability.', 
    label: 'IDENTITY', 
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    glowClass: 'bg-amber-500/10',
    keywords: ['username', 'forge', 'generator', 'checker', 'social handle', 'gamertag', 'available'],
    category: 'generators'
  },
  { 
    href: '/hashtag-engine', 
    icon: HashIcon, 
    title: 'Hashtag Engine', 
    desc: 'Generate strong hashtags for social growth and niche discovery', 
    label: 'GROWTH', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['hashtag', 'instagram tags', 'tiktok tags', 'growth', 'social media', 'tags generator'],
    category: 'generators'
  },
  { 
    href: '/html-site-rescue', 
    icon: History, 
    title: 'HTML Site Rescue', 
    desc: 'Recover local index.html + libs into hosting ZIP', 
    label: 'MAINTENANCE', 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    glowClass: 'bg-blue-500/10',
    keywords: ['html', 'rescue', 'index', 'host', 'zip', 'package', 'fix links'],
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

const PHRASES = [
  'Merge PDF', 'Compress Image', 'QR Generator', 'WhatsApp DP', 
  'Word to PDF', 'Photo Enhance', 'Age Calculator', 'Photo to Text', 
  'Logo Maker', 'Bulk Production', 'Password Studio', 'Color Picker',
  'Video to MP3', 'Image to PDF', 'AOB Converter', 'Nickname Studio',
  'Letter Art', 'Favicon Studio', 'JSON Formatter', 'Regex Tester', 'Hash Generator',
  'UUID Generator', 'Lorem Ipsum', 'Image Border', 'Custom Watermark',
  'Image to WebP', 'Blur Face', 'WiFi QR', 'P2P Share', 'Send File', 'Toffee',
  'Hide text in image', 'Secret photo', 'Stenography', 'Temp Room', 'Clipboard share', 
  'Join code', 'Sim Data', 'HTML to URL', 'Paste HTML link', 'Tax Calculator', 'GST Calculator', 'Lucky Draw', 'Spin Wheel',
  'BMI Calculator', 'Body Mass Index', 'Healthy weight', 'Bio Maker', 'Instagram Bio', 'WPS Sheets', 'Inventory Table',
  'Enlarge image', 'KB size increaser', 'Speed Test', 'Internet speed', 'IP Finder', 'What is my IP', 'Currency Converter',
  'Exchange rate', 'USD to PKR', 'SAR conversion', 'Weather forecast', 'Current temperature', 'Rain projection',
  'Namaz Times', 'Prayer timings', 'Salat schedule', 'Karachi Namaz', 'Quran Ayah', 'Islamic verse', 'Random ayah',
  'Crypto Prices', 'Bitcoin BTC', 'ETH current price', 'Solana SOL', 'Country Info', 'Country details', 'World map',
  'English Dictionary', 'Word Meaning', 'Definition', 'Thesaurus', 'Advice Studio', 'Daily Wisdom',
  'Pet Studio', 'Dog photos', 'Cat pictures', 'Random Facts', 'Useless Facts',
  'Pokemon Studio', 'Pokedex', 'Pokemon stats', 'Book Studio', 'Find Books', 'Open Library', 'Holiday Studio', 'Pakistan Holidays',
  'Quote Studio', 'Motivation', 'Zen Quotes', 'Image Gallery', 'Search NASA', 'Art History', 'Translate', 'Free Games', 'Coding Matrix',
  'Wikipedia Studio', 'Summarize', 'Search Wikipedia', 'GitHub Finder', 'Developer profile',
  'Password Breach', 'Pwned Check', 'Hack Search', 'Website Trust', 'Domain Safety', 'DNS Lookup', 'MX Records', 'URL Shortener', 'Tiny Link',
  'Image to Link', 'Direct URL', 'Hosting', 'FILE HOST', 'Upload Studio',
  'Background Remove', 'Transparent Image', 'Remove.bg', 'Temp Mail', 'Anonymous Email', 'Disposable Mail', 'Link Safety', 'Phishing Check', 'Expand URL', 'Username Checker',
  'Icon Studio', 'Social Icons', 'SVG PNG ICO', 'Username Forge', 'Identity generator', 'Hashtag Engine', 'Tags generator', 'HTML Site Rescue', 'Fix broken site',
  'All Units Converter', 'Length converter', 'Weight converter', 'Temp converter', 'WhatsApp Link', 'Send message link', 'WA.me', 'Gmail Alias Generator', 'Gmail dot trick',
  'Fake Data Generator', 'Dummy data', 'Identity maker', 'Mock data', 'Temp Upload', 'Cloudflare R2', 'ImgBB upload', 'GoFile share', 'Pixeldrain'
];

const ToolItem = React.memo(({ item, mode, onNavigate }: { item: Tool, mode: 'grid' | 'list', onNavigate: () => void }) => {
  const isGrid = mode === 'grid';

  return (
    <Link 
      href={item.href} 
      onClick={onNavigate}
      className={cn(
        "group relative flex transition-all duration-300 min-w-0",
        isGrid ? "h-full w-full" : "w-full"
      )}
    >
      <Card className={cn(
        "relative flex-1 flex rounded-[2rem] sm:rounded-[2.5rem] bg-secondary/30 border border-white/5 bg-white/40 dark:bg-card/40 backdrop-blur-2xl hover:border-primary/20 hover:bg-secondary/50 transition-all duration-500 shadow-2xl group-hover:shadow-primary/5 overflow-hidden",
        isGrid ? "flex-col p-5 sm:p-6 hover:-translate-y-2 text-left" : "flex-row items-center p-3 sm:p-6 hover:-translate-x-1 gap-4 sm:gap-6"
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

  // --- Scroll Restoration Matrix ---
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 1. Disable browser's automatic jumpy restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Immediate restoration from local session matrix
    const saved = sessionStorage.getItem(SCROLL_POS_KEY);
    if (saved) {
      window.scrollTo(0, parseInt(saved));
    }

    // 3. Throttled Position Capture
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem(SCROLL_POS_KEY, window.scrollY.toString());
      }, 150); // Balanced for performance
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  const handleToolNavigation = useCallback(() => {
    sessionStorage.setItem(SCROLL_POS_KEY, window.scrollY.toString());
  }, []);

  useEffect(() => {
    if (isFocused || searchQuery) {
      setPlaceholder('');
      return;
    }

    const timeout = setTimeout(() => {
      const currentPhrase = PHRASES[toolIndex];
      
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
          setToolIndex((prev) => (prev + 1) % PHRASES.length);
          setTypingSpeed(500);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, toolIndex, typingSpeed, isFocused, searchQuery]);

  const dynamicPlaceholder = useMemo(() => {
    if (isFocused || searchQuery) return 'Search tools...';
    return `${placeholder}|`;
  }, [placeholder, isFocused, searchQuery]);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY) as 'grid' | 'list' | null;
    if (saved) setViewMode(saved);
  }, []);

  const toggleViewMode = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

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

  const handleVisibleCount = useCallback(() => {
    setVisibleCount(prev => prev + 6);
  }, []);

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
              <Command className="w-2.5 h-2.5 sm:w-3 sm:h-3 icon-3d" /> Digital Studio v7.2 Pro
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-[8px] sm:text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
              Verified {TOOLS.length} Units
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[8px] sm:text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(59,130,246,0.1)] shadow-primary/20">
              <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current animate-fade-pulse" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }} /> Dev UMAR FAROOQ
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
             <div className="w-full max-w-2xl mx-auto group/search relative">
                {/* 1. Always-on outer glow */}
                <div className="search-container-glow" />
                
                {/* 2. Container for moving border */}
                <div className="relative h-14 sm:h-16 w-full rounded-2xl p-[1px] bg-white/10 overflow-hidden shadow-2xl transition-all duration-500 group-hover/search:bg-primary/20 group-focus-within/search:bg-primary/40">
                  {/* Moving line */}
                  <div className="search-moving-border" />
                  
                  {/* 3. Inner content with inner glow */}
                  <div className="relative flex items-center w-full h-full bg-card rounded-[calc(1rem-1px)] overflow-hidden border border-white/10 search-inner-glow z-10 box-border">
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
                        ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/30 scale-105" 
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
                  <ToolItem key={item.href} item={item} mode={viewMode} onNavigate={handleToolNavigation} />
                ))
              ) : (
                <EmptyState onReset={() => { setSearchQuery(''); setSelectedCategory('all'); setVisibleCount(9); }} />
              )}
            </div>

            {visibleCount < filteredTools.length && (
              <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
                 <ShadButton 
                   onClick={handleVisibleCount}
                   variant="outline"
                   className="h-14 sm:h-16 px-10 sm:px-12 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px] sm:xs backdrop-blur-xl hover:bg-primary/10 shadow-xl shadow-primary/5 active:scale-95 transition-all hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] group/see"
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
          
          <div className="text-center opacity-100 flex flex-col items-center gap-4">
             <Heart className="w-8 h-8 text-primary fill-current drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse" />
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground bg-gradient-to-r from-blue-400 via-primary to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                Developed by <span className="text-white">Umar Farooq</span> — Studio Master v7.2 Pro
             </p>
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
