
"use client"

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Scan, 
  Sun, 
  Moon,
  Home,
  QrCode,
  Layers,
  Type,
  Coffee,
  X,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QrScannerModal } from './qr-scanner-modal';

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
  { label: 'Logo Maker', href: '/logo-maker', icon: Type },
  { label: 'About', href: '/about', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('mykit_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (mounted) {
      localStorage.setItem('mykit_theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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
            <Link 
              href="/donate"
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-primary relative py-1",
                pathname === '/donate' ? "text-primary" : "text-foreground/40"
              )}
            >
              <Coffee className="w-3 h-3 icon-3d" /> Support
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             {/* About Unit */}
             <Link 
                href="/about"
                title="About My Kit Tool"
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 transition-all group icon-container-3d",
                  pathname === '/about' ? "text-primary border-primary/20" : "text-foreground/40 hover:text-primary"
                )}
             >
               <User className="w-4 h-4 transition-transform group-hover:scale-110 icon-3d" />
             </Link>

             {/* Donate Unit */}
             <Link 
                href="/donate"
                title="Support Studio"
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 transition-all group icon-container-3d",
                  pathname === '/donate' ? "text-primary border-primary/20" : "text-foreground/40 hover:text-primary"
                )}
             >
               <Coffee className="w-4 h-4 transition-transform group-hover:scale-110 icon-3d" />
             </Link>

             {/* Theme Toggle Unit - Static Button Shell */}
             <button 
                onClick={toggleTheme}
                title="Toggle Theme"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 text-foreground/40 hover:text-primary transition-all icon-container-3d"
             >
               {!mounted ? (
                 <div className="w-4 h-4" /> 
               ) : theme === 'light' ? (
                 <Moon className="w-4 h-4 icon-3d animate-in zoom-in duration-300" />
               ) : (
                 <Sun className="w-4 h-4 icon-3d animate-in zoom-in duration-300" />
               )}
             </button>

             {/* Scanner Unit */}
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

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
}
