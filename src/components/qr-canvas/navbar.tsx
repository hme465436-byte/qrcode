"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Scan, 
  Sun, 
  Moon,
  Home,
  QrCode,
  Layers,
  FileText,
  Search,
  ArrowRight,
  X,
  RotateCw,
  Unlock,
  Activity,
  Mic,
  Table,
  FileJson,
  Wand2,
  SquareUser,
  FileSignature,
  Type,
  MonitorPlay,
  DownloadCloud,
  Split,
  FileArchive,
  Files,
  ListFilter,
  User,
  FileStack,
  ArrowRightLeft,
  Clock,
  Youtube,
  Lock,
  LayoutGrid,
  Grid2X2,
  EyeOff,
  AlignLeft,
  Palette,
  Pipette,
  FileEdit,
  ImageIcon,
  FileImage,
  MicOff,
  Film,
  Volume2,
  ListMusic,
  CaseSensitive,
  Grid3X3,
  Repeat,
  FileCode,
  Binary,
  Info,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Monitor,
  Terminal,
  ShieldAlert,
  Maximize,
  RefreshCcw,
  Music,
  Braces,
  Fingerprint,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QrScannerModal } from './qr-scanner-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Full Studio Tool Registry
const SEARCHABLE_TOOLS = [
  { href: '/single', title: 'Single Studio', icon: QrCode, label: 'QR', keywords: ['qr', 'generator', 'logo', 'brand'] },
  { href: '/bulk', title: 'Bulk Production', icon: Layers, label: 'BATCH', keywords: ['bulk', 'batch', 'mass', 'zip'] },
  { href: '/hash-generator', title: 'Hash Generator', icon: Fingerprint, label: 'SECURITY', keywords: ['hash', 'md5', 'sha256', 'crypto'] },
  { href: '/json-formatter', title: 'JSON Formatter', icon: Braces, label: 'DATA', keywords: ['json', 'format', 'pretty', 'minify'] },
  { href: '/regex-tester', title: 'Regex Tester', icon: Search, label: 'INTEL', keywords: ['regex', 'test', 'pattern', 'eval'] },
  { href: '/photo-enhance-fix', title: 'Photo Enhance', icon: Wand2, label: 'IMAGE', keywords: ['upscale', 'sharpen', 'clarity', 'fix'] },
  { href: '/passport-photo-maker', title: 'Passport Photo', icon: SquareUser, label: 'IDENTITY', keywords: ['visa', 'id', 'print', 'sheet'] },
  { href: '/live-wallpaper', title: 'Live Wallpaper', icon: MonitorPlay, label: 'MEDIA', keywords: ['video', 'loop', 'pc', 'phone'] },
  { href: '/rename-file', title: 'Rename File', icon: FileSignature, label: 'UTIL', keywords: ['change name', 'extension', 'relabel'] },
  { href: '/csv-to-json', title: 'CSV to JSON', icon: Table, label: 'DATA', keywords: ['convert', 'excel', 'parse'] },
  { href: '/json-to-csv', title: 'JSON to CSV', icon: FileJson, label: 'DATA', keywords: ['convert', 'flatten', 'excel'] },
  { href: '/image-url-downloader', title: 'URL Downloader', icon: DownloadCloud, label: 'MEDIA', keywords: ['extract', 'save image', 'scrape'] },
  { href: '/speaker-tester', title: 'Speaker Tester', icon: Activity, label: 'HARDWARE', keywords: ['audio', 'left right', 'frequency'] },
  { href: '/mic-tester', title: 'Mic Tester', icon: Mic, label: 'HARDWARE', keywords: ['microphone', 'record', 'input'] },
  { href: '/youtube-thumbnail-downloader', title: 'YT Downloader', icon: MonitorPlay, label: 'MEDIA', keywords: ['youtube', 'thumbnail', 'extract'] },
  { href: '/logo-maker', title: 'Logo Maker', icon: Type, label: 'BRANDING', keywords: ['logo', 'text logo', 'avatar'] },
  { href: '/pdf-unlock', title: 'PDF Unlock', icon: Unlock, label: 'SECURITY', keywords: ['password', 'decrypt', 'remove lock'] },
  { href: '/pdf-password-protect', title: 'PDF Password', icon: ShieldAlert, label: 'SECURITY', keywords: ['encrypt', 'lock', 'secure'] },
  { href: '/text-to-pdf', title: 'Text to PDF', icon: FileText, label: 'DOCUMENT', keywords: ['convert', 'txt', 'write'] },
  { href: '/pdf-rotator', title: 'PDF Rotator', icon: RotateCw, label: 'DOCUMENT', keywords: ['orientation', 'fix', 'pages'] },
  { href: '/word-to-pdf', title: 'Word to PDF', icon: FileText, label: 'DOCUMENT', keywords: ['docx', 'convert', 'doc'] },
  { href: '/pdf-to-image', title: 'PDF to Image', icon: FileImage, label: 'CONVERT', keywords: ['png', 'jpg', 'extract'] },
  { href: '/pdf-splitter', title: 'PDF Splitter', icon: Split, label: 'DOCUMENT', keywords: ['extract', 'pages', 'divide'] },
  { href: '/pdf-compressor', title: 'PDF Compressor', icon: FileArchive, label: 'OPTIMIZE', keywords: ['shrink', 'smaller', 'kb'] },
  { href: '/duplicate-finder', title: 'Duplicate Purge', icon: Files, label: 'STUDIO', keywords: ['clean', 'redundant', 'zip'] },
  { href: '/duplicate-line-remover', title: 'Line Purge', icon: ListFilter, label: 'TEXT', keywords: ['unique', 'lines', 'clean list'] },
  { href: '/whatsapp-dp-maker', title: 'WhatsApp DP', icon: User, label: 'IDENTITY', keywords: ['profile', 'hd', 'no crop'] },
  { href: '/pdf-merger', title: 'PDF Merger', icon: FileStack, label: 'DOCUMENT', keywords: ['combine', 'join', 'unity'] },
  { href: '/image-to-file', title: 'Image to File', icon: ArrowRightLeft, label: 'CONVERT', keywords: ['converter', 'pdf', 'webp'] },
  { href: '/file-compressor', title: 'File Compressor', icon: FileArchive, label: 'OPTIMIZE', keywords: ['shrink', 'size', 'reduce'] },
  { href: '/youtube-thumbnail-maker', title: 'YT Thumbnail', icon: MonitorPlay, label: 'YOUTUBE', keywords: ['size', '1280x720', 'maker'] },
  { href: '/age-calculator', title: 'Age Calculator', icon: Clock, label: 'STATS', keywords: ['date', 'birth', 'birthday'] },
  { href: '/password-generator', title: 'Password Studio', icon: Lock, label: 'SECURITY', keywords: ['random', 'strong', 'key'] },
  { href: '/youtube-banner-maker', title: 'YouTube Banner', icon: Youtube, label: 'YOUTUBE', keywords: ['cover', 'art', 'safe area'] },
  { href: '/collage-maker', title: 'Collage Studio', icon: Grid2X2, label: 'GRID', keywords: ['grid', 'combine', 'merge'] },
  { href: '/favicon-generator', title: 'Favicon Studio', icon: LayoutGrid, label: 'WEB', keywords: ['ico', 'manifest', 'icon'] },
  { href: '/metadata-remover', title: 'Privacy Purge', icon: EyeOff, label: 'SECURE', keywords: ['exif', 'gps', 'clean'] },
  { href: '/word-counter', title: 'Word Counter', icon: AlignLeft, label: 'TEXT', keywords: ['count', 'stats', 'chars'] },
  { href: '/color-picker', title: 'Color Picker', icon: Pipette, label: 'DESIGN', keywords: ['hex', 'pick', 'eye dropper'] },
  { href: '/rgb-picker', title: 'RGB Studio', icon: Palette, label: 'ENGINE', keywords: ['convert', 'cmyk', 'hsl'] },
  { href: '/markdown-preview', title: 'Markdown Preview', icon: FileEdit, label: 'MARKUP', keywords: ['md', 'markdown', 'html'] },
  { href: '/image-converter', title: 'Image Converter', icon: RefreshCcw, label: 'FORMAT', keywords: ['png to jpg', 'convert'] },
  { href: '/image-resizer', title: 'Image Resizer', icon: Maximize, label: 'SCALE', keywords: ['dimension', 'size', 'resize'] },
  { href: '/image-compressor', title: 'Image Compressor', icon: Maximize, label: 'OPTIMIZE', keywords: ['shrink', 'kb', 'smaller'] },
  { href: '/image-to-pdf', title: 'Image to PDF', icon: FileStack, label: 'DOCUMENT', keywords: ['convert', 'photo to pdf'] },
  { href: '/photo-editor', title: 'Photo Studio', icon: ImageIcon, label: 'EDITOR', keywords: ['edit', 'crop', 'filter'] },
  { href: '/vocal-separator', title: 'Vocal Remover', icon: MicOff, label: 'KARAOKE', keywords: ['vocal', 'karaoke', 'music'] },
  { href: '/video-to-audio', title: 'Video to MP3', icon: Music, label: 'MEDIA', keywords: ['extract', 'audio', 'mp4'] },
  { href: '/video-to-gif', title: 'Video to GIF', icon: Film, label: 'ANIMATION', keywords: ['make gif', 'mp4 to gif'] },
  { href: '/audio-joiner', title: 'Audio Joiner', icon: ListMusic, label: 'PRODUCTION', keywords: ['merge', 'combine', 'mp3'] },
  { href: '/audio-booster', title: 'Volume Booster', icon: Volume2, label: 'BOOST', keywords: ['louder', 'gain', 'amplify'] },
  { href: '/letter-art', title: 'Letter Art Studio', icon: CaseSensitive, label: 'ASCII', keywords: ['text art', 'ascii', 'letters'] },
  { href: '/ocr', title: 'OCR Extraction', icon: FileText, label: 'INTEL', keywords: ['extract', 'scan', 'read'] },
  { href: '/dot-art', title: 'Dot Art Studio', icon: Grid3X3, label: 'CREATIVE', keywords: ['braille', 'dots', 'matrix'] },
  { href: '/repeater', title: 'Text Repeater', icon: Repeat, label: 'UTIL', keywords: ['multiply', 'spam', 'copy'] },
  { href: '/hex-converter', title: 'Hex Converter', icon: FileCode, label: 'BINARY', keywords: ['bytes', 'dump', 'hex'] },
  { href: '/code-converter', title: 'AOB Converter', icon: Binary, label: 'DEV', keywords: ['pattern', 'hex', 'trainer'] },
  { href: '/dictionary', title: 'Dictionary', icon: Info, label: 'LANG', keywords: ['meaning', 'word', 'english'] },
];

const Logo = ({ className = "h-8", iconOnly = false }: { className?: string, iconOnly?: boolean }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-[#2563eb] rounded-lg shadow-lg shadow-blue-600/20 flex items-center justify-center overflow-hidden icon-container-3d">
        <div className="w-4 h-4 grid grid-cols-2 gap-0.5 relative z-10">
          <div className="border-[1.5px] border-white rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white rounded-[1px]" />
        </div>
      </div>
    </div>
    {!iconOnly && (
      <div className="font-headline font-black text-xl tracking-tighter leading-none flex items-center min-w-0">
        <span className="text-[#0f172a] dark:text-white uppercase truncate">MY KIT</span>
        <span className="text-[#2563eb] ml-1.5 shrink-0 uppercase">TOOL</span>
      </div>
    )}
  </div>
);

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Single QR', href: '/single', icon: QrCode },
  { label: 'Bulk Mode', href: '/bulk', icon: Layers },
  { label: 'CSV to JSON', href: '/csv-to-json', icon: Table },
  { label: 'JSON to CSV', href: '/json-to-csv', icon: FileJson },
  { label: 'Logo Maker', href: '/logo-maker', icon: Type },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Placeholder Animation State
  const [placeholder, setPlaceholder] = useState('');
  const [toolIndex, setToolIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);
  const [isFocused, setIsFocused] = useState(false);

  const phrases = useMemo(() => {
    return SEARCHABLE_TOOLS.map(t => t.title).sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (!isSearchOpen || isFocused || searchQuery) {
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
        const nextLen = Math.max(0, placeholder.length - 1);
        setPlaceholder(currentPhrase.slice(0, nextLen));
        setTypingSpeed(35);
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setToolIndex((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(500);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, toolIndex, phrases, typingSpeed, isFocused, searchQuery, isSearchOpen]);

  const dynamicPlaceholder = useMemo(() => {
    if (isFocused || searchQuery) return 'Search tools...';
    return `${placeholder}|`;
  }, [placeholder, isFocused, searchQuery]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('mykit_theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mykit_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return SEARCHABLE_TOOLS.slice(0, 6);
    }
    const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    return SEARCHABLE_TOOLS.filter(tool => {
      const targetString = `${tool.title} ${tool.keywords.join(' ')}`.toLowerCase();
      return words.every(word => targetString.includes(word));
    }).slice(0, 10);
  }, [searchQuery]);

  const handleToolClick = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-white/5 bg-background/80 backdrop-blur-xl h-16 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95 min-w-0">
            <Logo />
          </Link>
          
          <nav className="hidden xl:flex items-center gap-8 shrink-0">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-primary relative py-1",
                  pathname === item.href ? "text-primary" : "text-foreground/40"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 text-foreground/40 hover:text-primary transition-all group icon-container-3d"
             >
               <Search className="w-4 h-4 transition-transform group-hover:scale-110 icon-3d" />
             </button>

             <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 text-foreground/40 hover:text-primary transition-all icon-container-3d"
             >
               {theme === 'light' ? <Moon className="w-4 h-4 icon-3d" /> : <Sun className="w-4 h-4 icon-3d" />}
             </button>

             <button 
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-4 md:px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 icon-container-3d"
             >
              <Scan className="w-4 h-4 icon-3d" />
              <span className="hidden sm:inline">Scanner</span>
             </button>
          </div>
        </div>
      </header>

      <Dialog open={isSearchOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="glass-card max-w-2xl border-white/10 p-0 overflow-hidden outline-none text-foreground flex flex-col">
          <DialogHeader className="p-6 border-b border-white/10 bg-white/2 relative overflow-visible shrink-0">
            <DialogTitle className="sr-only">Search Tools</DialogTitle>
            <div className="relative group/search z-20">
               <div className="absolute -inset-10 bg-primary/10 blur-[40px] rounded-full opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000 pointer-events-none" />
               <div className="moving-border-matrix" />
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within/search:text-primary transition-colors icon-3d z-20" />
               <Input 
                autoFocus
                placeholder={dynamicPlaceholder}
                aria-label="Search tools"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-12 bg-transparent border-none focus-visible:ring-0 rounded-none text-lg font-medium tracking-tight placeholder:text-foreground/10 relative z-10"
              />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent scale-x-0 group-focus-within/search:scale-x-100 transition-transform duration-700" />
            </div>
          </DialogHeader>
          <div className="flex-1 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {filteredTools.map((tool) => (
                  <button 
                    key={tool.href}
                    onClick={() => handleToolClick(tool.href)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-primary/5 group transition-all duration-300 text-left min-w-0"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-transparent group-hover:border-primary/20 icon-container-3d shrink-0">
                        <tool.icon className="w-5 h-5 icon-3d" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest truncate">{tool.label}</p>
                        <p className="text-sm font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground truncate">{tool.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 shrink-0">
                       <span className="text-[9px] font-black uppercase tracking-widest text-primary hidden sm:inline">Open</span>
                       <ArrowRight className="w-4 h-4 text-primary icon-3d" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 px-6">
                <Search className="w-12 h-12 text-foreground/5 mx-auto icon-3d" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Zero Identifiers Found</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-secondary/30 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 shrink-0">
            <span>{searchQuery ? 'SEARCH RESULTS' : 'POPULAR TOOLS'}</span>
            <span>ESC TO EXIT</span>
          </div>
        </DialogContent>
      </Dialog>

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
}
