"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
  FileImage,
  RotateCw,
  ShieldAlert,
  Command,
  Unlock,
  Activity,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QrScannerModal } from './qr-scanner-modal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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
      <div className="font-headline font-black text-xl tracking-tighter leading-none flex items-center">
        <span className="text-[#0f172a] dark:text-white uppercase">MY KIT</span>
        <span className="text-[#2563eb] ml-1.5 italic">TOOL</span>
      </div>
    )}
  </div>
);

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home, keywords: ['start', 'dashboard', 'main'] },
  { label: 'Single QR', href: '/single', icon: QrCode, keywords: ['qr', 'generator', 'logo', 'brand', 'barcode'] },
  { label: 'Bulk Mode', href: '/bulk', icon: Layers, keywords: ['batch', 'mass', 'multiple', 'zip', 'production'] },
  { label: 'Image URL', href: '/image-url-downloader', icon: DownloadCloud, keywords: ['image downloader', 'save image', 'url image', 'extract images', 'yt'] },
  { label: 'Speaker Test', href: '/speaker-tester', icon: Activity, keywords: ['speaker tester', 'audio test', 'left right', 'sound test'] },
  { label: 'Mic Tester', href: '/mic-tester', icon: Mic, keywords: ['mic tester', 'microphone test', 'audio input', 'record test'] },
  { label: 'YT Downloader', href: '/youtube-thumbnail-downloader', icon: MonitorPlay, keywords: ['youtube', 'thumbnail', 'downloader', 'yt'] },
  { label: 'Logo Maker', href: '/logo-maker', icon: Type, keywords: ['logo', 'text logo', 'branding', 'avatar', 'name'] },
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
      const targetString = `${item.label}`.toLowerCase();
      return words.every(word => targetString.includes(word));
    });
  }, [searchQuery]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-white/5 bg-background/80 backdrop-blur-xl h-16 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <Logo />
          </Link>
          
          <nav className="hidden xl:flex items-center gap-8">
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

          <div className="flex items-center gap-3 md:gap-4">
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 text-foreground/40 hover:text-primary transition-all group icon-container-3d"
                aria-label="Search Tools"
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
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 icon-container-3d"
             >
              <Scan className="w-4 h-4 icon-3d" />
              <span className="hidden sm:inline">Scanner</span>
             </button>

             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="xl:hidden w-10 h-10 rounded-xl bg-secondary/50 border border-white/5 flex items-center justify-center text-foreground/40 icon-container-3d">
                    <Menu className="w-5 h-5 icon-3d" />
                  </button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-full max-w-[320px] bg-card p-0 overflow-hidden text-foreground border-l border-white/5 top-0 h-full z-[100]"
                >
                  <div className="h-full flex flex-col">
                    <SheetHeader className="p-8 border-b border-white/5 text-left">
                      <SheetTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Navigation Matrix</SheetTitle>
                      <Logo iconOnly={false} className="mt-6" />
                    </SheetHeader>
                    <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                      {NAV_ITEMS.map((item) => (
                        <Link 
                          key={item.label} 
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all p-4 rounded-xl",
                            pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground/40 hover:bg-white/5"
                          )}
                        >
                          <item.icon className="w-4 h-4 icon-3d" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
             </Sheet>
          </div>
        </div>
      </header>

      {/* Global Search Dialog with Premium Glow */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="glass-card max-w-2xl border-white/10 p-0 overflow-hidden outline-none text-foreground top-[10%] translate-y-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/2 relative overflow-hidden">
            <DialogTitle className="sr-only">Search Tools</DialogTitle>
            
            {/* Moving Glow Line Protocol */}
            <div className="moving-border-matrix" />
            
            <div className="relative group/search z-20">
               {/* Inner Atmosphere Glow */}
               <div className="absolute inset-0 bg-primary/5 blur-[25px] rounded-full opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within/search:text-primary transition-colors icon-3d" />
              <Input 
                autoFocus
                placeholder="Query professional studio tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-12 bg-transparent border-none focus-visible:ring-0 rounded-none text-lg font-medium tracking-tight placeholder:text-foreground/10"
              />
              
              {/* Focused Glow Base Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent scale-x-0 group-focus-within/search:scale-x-100 transition-transform duration-700" />
            </div>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {filteredNavItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {filteredNavItems.map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center justify-between p-5 rounded-2xl hover:bg-primary/5 group transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-transparent group-hover:border-primary/20 icon-container-3d">
                        <item.icon className="w-5 h-5 icon-3d" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground">{item.label}</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-primary">Execute</span>
                       <ArrowRight className="w-4 h-4 text-primary icon-3d" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-foreground/5 mx-auto icon-3d" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Zero Identifiers Found</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-secondary/30 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20">
            <span>MY KIT TOOL REGISTRY MATRIX</span>
            <span>ESC TO EXIT</span>
          </div>
        </DialogContent>
      </Dialog>

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
}
