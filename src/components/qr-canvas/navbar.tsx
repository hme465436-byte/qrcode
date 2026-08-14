
"use client"

import React, { useState, useEffect } from 'react';
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
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QrScannerModal } from './qr-scanner-modal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";

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

export function Navbar() {
  const pathname = usePathname();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('mykit_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
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

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Single QR', href: '/single', icon: QrCode },
    { label: 'Bulk Mode', href: '/bulk', icon: Layers },
    { label: 'Photo Editor', href: '/photo-editor', icon: ImageIcon },
    { label: 'Video to MP3', href: '/video-to-audio', icon: Music },
    { label: 'OCR Text', href: '/ocr', icon: FileText },
    { label: 'Dot Art', href: '/dot-art', icon: Grid3X3 },
    { label: 'Repeater', href: '/repeater', icon: Repeat },
    { label: 'Hex Converter', href: '/hex-converter', icon: FileCode },
    { label: 'AOB Converter', href: '/code-converter', icon: Binary },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-[#2563eb]/10 bg-white/80 dark:bg-black/80 backdrop-blur-3xl h-16">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <Logo />
          </a>
          
          <nav className="hidden xl:flex items-center gap-6">
            {navItems.map((item) => (
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
                      {navItems.map((item) => (
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
      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
}
