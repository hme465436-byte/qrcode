"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  Scan, 
  Sun, 
  Moon,
  Home,
  QrCode,
  Layers,
  Info,
  HelpCircle,
  Repeat,
  Binary,
  Grid3X3,
  FileText,
  ImageIcon,
  FileCode,
  Music,
  Search,
  ArrowRight,
  X,
  Maximize,
  FileStack,
  CaseSensitive,
  RefreshCcw,
  Pipette,
  Palette,
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
  FileImage
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QrScannerModal } from './qr-scanner-modal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const Logo = ({ className = "h-8", iconOnly = false }: { className?: string, iconOnly?: boolean }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-[#2563eb]/20 rounded-xl rotate-3" />
      <div className="absolute inset-0 bg-[#2563eb] rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center overflow-hidden">
        <div className="w-5 h-5 grid grid-cols-2 gap-1 relative z-10">
          <div className="border-[2.2px] border-white/80 rounded-[1.5px]" />
          <div className="bg-white/40 rounded-[1.5px]" />
          <div className="bg-white/40 rounded-[1.5px]" />
          <div className="bg-white rounded-[1.5px]" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
      </div>
    </div>
    
    {!iconOnly && (
      <div className="font-headline font-black text-2xl tracking-tighter leading-none flex items-center">
        <span className="text-[#0f172a] dark:text-white">MY KIT</span>
        <span className="text-[#2563eb] ml-2 italic">TOOL</span>
      </div>
    )}
  </div>
);

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home, keywords: ['start', 'dashboard', 'main'] },
  { label: 'Single QR', href: '/single', icon: QrCode, keywords: ['qr', 'generator', 'logo', 'brand', 'barcode'] },
  { label: 'Bulk Mode', href: '/bulk', icon: Layers, keywords: ['batch', 'mass', 'multiple', 'zip', 'production'] },
  { label: 'Logo Maker', href: '/logo-maker', icon: Type, keywords: ['logo', 'text logo', 'branding', 'avatar', 'name'] },
  { label: 'PDF to Word', href: '/pdf-to-word', icon: FileEdit, keywords: ['pdf to word', 'docx', 'convert', 'editable'] },
  { label: 'Word to PDF', href: '/word-to-pdf', icon: FileText, keywords: ['word to pdf', 'docx to pdf', 'convert word', 'word converter', 'doc to pdf'] },
  { label: 'PDF to Image', href: '/pdf-to-image', icon: FileImage, keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'convert pdf', 'extract images from pdf'] },
  { label: 'PDF Splitter', href: '/pdf-splitter', icon: Split, keywords: ['pdf split', 'extract pages', 'separate pdf', 'pdf chunks', 'split document'] },
  { label: 'PDF Compress', href: '/pdf-compressor', icon: FileArchive, keywords: ['pdf compress', 'shrink pdf', 'smaller pdf', 'optimize document'] },
  { label: 'Duplicates', href: '/duplicate-finder', icon: Files, keywords: ['duplicate', 'finder', 'cleaner', 'redundancy', 'files'] },
  { label: 'Line Purge', href: '/duplicate-line-remover', icon: ListFilter, keywords: ['duplicate lines', 'line remover', 'unique lines', 'remove repeated', 'list cleaner', 'text purge'] },
  { label: 'WhatsApp DP', href: '/whatsapp-dp-maker', icon: User, keywords: ['whatsapp dp maker', 'profile picture', 'uncut dp', 'whatsapp quality', 'whatsquality', 'hd dp', 'profile maker'] },
  { label: 'PDF Merger', href: '/pdf-merger', icon: FileStack, keywords: ['pdf merge', 'combine pdf', 'join pdf', 'multiple pdfs', 'document joiner'] },
  { label: 'Image to File', href: '/image-to-file', icon: ArrowRightLeft, keywords: ['image to file', 'image converter', 'jpg to pdf', 'webp converter', 'png to webp', 'photo to pdf'] },
  { label: 'File Compressor', href: '/file-compressor', icon: FileArchive, keywords: ['compress', 'reduce size', 'optimize', 'shrink', 'smaller', 'pdf', 'image'] },
  { label: 'Thumbnails', href: '/youtube-thumbnail-maker', icon: MonitorPlay, keywords: ['youtube', 'thumbnail', '1280x720', 'yt'] },
  { label: 'Age Studio', href: '/age-calculator', icon: Clock, keywords: ['age', 'birthday', 'how old am i', 'dob'] },
  { label: 'Passwords', href: '/password-generator', icon: Lock, keywords: ['password', 'generator', 'safe', 'secure', 'entropy'] },
  { label: 'YouTube Banner', href: '/youtube-banner-maker', icon: Youtube, keywords: ['youtube', 'banner', 'channel art', 'yt cover'] },
  { label: 'Collage', href: '/collage-maker', icon: Grid2X2, keywords: ['collage maker', 'photo grid', 'merge photos', '2x2 collage', 'photo collage'] },
  { label: 'Favicons', href: '/favicon-generator', icon: LayoutGrid, keywords: ['favicon', 'icon', 'apple touch', 'site icon', 'web'] },
  { label: 'Privacy Purge', href: '/metadata-remover', icon: EyeOff, keywords: ['exif', 'metadata', 'gps', 'privacy', 'strip'] },
  { label: 'Word Counter', href: '/word-counter', icon: AlignLeft, keywords: ['word counter', 'character count', 'reading time', 'word count tool', 'text counter'] },
  { label: 'Color Picker', href: '/color-picker', icon: Pipette, keywords: ['hex', 'rgb', 'hsl', 'design', 'palette', 'picker'] },
  { label: 'RGB Studio', href: '/rgb-picker', icon: Palette, keywords: ['rgb', 'hex', 'color', 'cmyk', 'converter'] },
  { label: 'Markdown', href: '/markdown-preview', icon: FileEdit, keywords: ['markdown', 'md', 'html', 'preview', 'markup', 'editor'] },
  { label: 'Converter', href: '/image-converter', icon: RefreshCcw, keywords: ['png to jpg', 'jpg to png', 'format', 'convert'] },
  { label: 'Resizer', href: '/image-resizer', icon: Maximize, keywords: ['resize', 'image', 'dimensions', 'scale', 'px'] },
  { label: 'Compressor', href: '/image-compressor', icon: Maximize, keywords: ['compress', 'image', 'reduce', 'optimize', 'shrink'] },
  { label: 'Image to PDF', href: '/image-to-pdf', icon: FileStack, keywords: ['pdf', 'convert', 'jpg to pdf', 'images', 'bundle'] },
  { label: 'Photo Editor', href: '/photo-editor', icon: ImageIcon, keywords: ['image', 'edit', 'crop', 'filter', 'manipulate'] },
  { label: 'Vocal Remover', href: '/vocal-separator', icon: MicOff, keywords: ['vocal remover', 'karaoke', 'remove vocals', 'instrumental', 'music separator'] },
  { label: 'Video to MP3', href: '/video-to-audio', icon: Music, keywords: ['audio', 'extract', 'mp4', 'sound', 'convert'] },
  { label: 'Video to GIF', href: '/video-to-gif', icon: Film, keywords: ['gif', 'video to gif', 'animation', 'clip'] },
  { label: 'Audio Joiner', href: '/audio-joiner', icon: ListMusic, keywords: ['merge', 'combine', 'mp3', 'audio', 'join'] },
  { label: 'Volume Booster', href: '/audio-booster', icon: Volume2, keywords: ['loud', 'gain', 'amplify', 'boost', 'audio', 'volume'] },
  { label: 'Letter Art', href: '/letter-art', icon: CaseSensitive, keywords: ['ascii', 'text art', 'alphabet', 'letters', 'image to text'] },
  { label: 'OCR Text', href: '/ocr', icon: FileText, keywords: ['ocr', 'extract', 'recognize', 'scan', 'read'] },
  { label: 'Dot Art', href: '/dot-art', icon: Grid3X3, keywords: ['dots', 'braille', 'creative', 'art', 'matrix'] },
  { label: 'Repeater', href: '/repeater', icon: Repeat, keywords: ['repeat', 'text', 'emoji', 'spam', 'cloner'] },
  { label: 'Hex Converter', href: '/hex-converter', icon: FileCode, keywords: ['binary', 'hexadecimal', 'bytes', 'dump'] },
  { label: 'AOB Converter', href: '/code-converter', icon: Binary, keywords: ['aob', 'pattern', 'trainer', 'hex', 'convert'] },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('mykit_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      // Respect user OS preference if no local storage found
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mykit_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return NAV_ITEMS;
    const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    return NAV_ITEMS.filter(item => {
      const targetString = `${item.label} ${item.keywords.join(' ')}`.toLowerCase();
      return words.every(word => targetString.includes(word));
    });
  }, [searchQuery]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-[#2563eb]/10 bg-white/80 dark:bg-black/80 backdrop-blur-3xl h-16">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <Logo />
          </a>
          
          <nav className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.slice(0, 9).map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-[#2563eb] relative py-1",
                  pathname === item.href ? "text-[#2563eb] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#2563eb] after:rounded-full" : "text-foreground/40"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-[#2563eb] transition-all group"
                aria-label="Search Tools"
             >
               <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
               <span className="sr-only">Search</span>
             </button>

             <button 
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-[#2563eb] transition-all"
                aria-label="Toggle Theme"
             >
               {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
             </button>

             <button 
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all shadow-xl shadow-blue-600/30"
             >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
             </button>

             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="xl:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[280px] glass-card p-0 overflow-hidden text-foreground border-l border-white/20 top-16 h-[calc(100vh-64px)] z-[40]"
                >
                  <div className="h-full flex flex-col">
                    <SheetHeader className="p-6 border-b border-white/10 text-left bg-primary/5">
                      <div className="space-y-1">
                        <SheetTitle className="text-[10px] font-black uppercase tracking-widest text-[#2563eb]">Studio Suite</SheetTitle>
                        <Logo iconOnly={true} className="mt-2" />
                      </div>
                    </SheetHeader>
                    <SheetDescription className="sr-only">Studio navigation menu</SheetDescription>
                    <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                      {NAV_ITEMS.map((item) => (
                        <a 
                          key={item.label} 
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all p-4 rounded-2xl",
                            pathname === item.href ? "bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20" : "text-foreground/40 hover:bg-secondary/50"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </a>
                      ))}
                      <div className="my-4 border-t border-white/5" />
                      <a href="/faq" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] p-4 text-foreground/30 hover:text-primary transition-all">
                        <HelpCircle className="w-4 h-4" /> FAQ
                      </a>
                      <a href="/about" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] p-4 text-foreground/30 hover:text-primary transition-all">
                        <Info className="w-4 h-4" /> About
                      </a>
                    </nav>
                  </div>
                </SheetContent>
             </Sheet>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="glass-card max-w-2xl border-white/20 p-0 overflow-hidden outline-none text-foreground top-[15%] translate-y-0">
          <DialogHeader className="p-6 border-b border-white/10 bg-white/5">
            <DialogTitle className="sr-only">Search Tools</DialogTitle>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
              <Input 
                autoFocus
                placeholder="Search studio tools... (CMD+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 bg-secondary/50 border-white/10 rounded-2xl text-lg font-medium"
              />
            </div>
            <DialogDescription className="sr-only">Global studio search</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {filteredNavItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {filteredNavItems.map((item) => (
                  <a 
                    key={item.label}
                    href={item.href}
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/10 group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/40 group-hover:text-primary group-hover:bg-primary/20 transition-all">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary">{item.label}</p>
                        <p className="text-[9px] text-foreground/40 font-medium uppercase tracking-tight">{item.keywords.join(', ')}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <Search className="w-12 h-12 text-foreground/10 mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest text-foreground/30">No matching studio tools found</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-secondary/30 border-t border-white/10 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-foreground/20">
            <span>MY KIT TOOL REGISTRY</span>
            <span>ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
}