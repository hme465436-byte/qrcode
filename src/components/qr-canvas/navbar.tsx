"use client"

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  User,
  X,
  LogIn,
  LogOut,
  UserPlus,
  ChevronDown,
  ShieldCheck,
  Settings,
  Info,
  Heart,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QrScannerModal } from './qr-scanner-modal';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

/**
 * Static Logo Component
 */
const Logo = ({ className = "h-8", iconOnly = false }: { className?: string, iconOnly?: boolean }) => (
  <div className={cn("flex items-center gap-1.5 sm:gap-3", className)}>
    <div className="relative w-7 h-7 sm:w-8 h-8 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-[#2563eb] rounded-lg shadow-lg shadow-blue-600/20 flex items-center justify-center overflow-hidden icon-container-3d">
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 grid grid-cols-2 gap-0.5 relative z-10">
          <div className="border-[1.5px] border-white rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white rounded-[1px]" />
        </div>
      </div>
    </div>
    {!iconOnly && (
      <div className="font-headline font-black text-base sm:text-2xl tracking-tighter leading-none flex items-center min-w-0">
        <span className="text-[#0f172a] dark:text-white uppercase truncate">MY KIT</span>
        <span className="text-[#2563eb] ml-0.5 sm:ml-1 shrink-0 uppercase">TOOL</span>
      </div>
    )}
  </div>
);

/**
 * STATIC NAV ITEMS REGISTRY
 */
const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Single QR', href: '/single', icon: QrCode },
  { label: 'Bulk Mode', href: '/bulk', icon: Layers },
  { label: 'Logo Maker', href: '/logo-maker', icon: Type },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
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

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full max-w-full overflow-hidden border-b border-white/5 bg-background/80 backdrop-blur-xl h-16 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 h-full flex items-center justify-between gap-1 sm:gap-4 max-w-full box-border">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group transition-transform active:scale-95 min-w-0">
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

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
             {/* Secondary Utilities */}
             <Link 
              href="/about" 
              className={cn(
                "flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-xl bg-secondary/50 border border-white/5 transition-all hover:text-primary",
                pathname === '/about' ? "text-primary border-primary/20" : "text-foreground/40"
              )}
              title="About Studio"
             >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-3d" />
             </Link>

             <Link 
              href="/donate" 
              className={cn(
                "flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-xl bg-secondary/50 border border-white/5 transition-all hover:text-primary",
                pathname === '/donate' ? "text-primary border-primary/20" : "text-foreground/40"
              )}
              title="Support Developer"
             >
                <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-3d" />
             </Link>

             {/* IDENTITY UNIT / AUTH SECTION */}
             {!authLoading && (
               <>
                 {user ? (
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 h-8 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary transition-all hover:bg-primary/20 icon-container-3d">
                           <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-3d" />
                           <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">Account</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 glass-card mt-2 p-2 border-white/10 shadow-2xl animate-in slide-in-from-top-2">
                        <DropdownMenuLabel className="px-3 py-2 space-y-1">
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">My Account</p>
                           <p className="text-[11px] font-bold text-foreground/60 truncate">{user.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem asChild>
                           <Link href="/account" className="flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors cursor-pointer rounded-lg">
                              <Fingerprint className="w-3.5 h-3.5" /> Profile
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer rounded-lg">
                           <LogOut className="w-3.5 h-3.5" /> Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                 ) : (
                   <Link 
                    href="/login"
                    className="flex items-center gap-2 px-2 sm:px-5 h-8 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-foreground/40 hover:text-primary hover:bg-white/10 transition-all shadow-xl icon-container-3d"
                   >
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Account</span>
                   </Link>
                 )}
               </>
             )}

             {/* THEME TOGGLE */}
             <button 
                onClick={toggleTheme}
                title="Theme"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 text-foreground/40 hover:text-primary transition-all icon-container-3d"
             >
               {!mounted ? (
                 <div className="w-3.5 h-3.5" /> 
               ) : theme === 'light' ? (
                 <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-3d animate-in zoom-in duration-300" />
               ) : (
                 <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-3d animate-in zoom-in duration-300" />
               )}
             </button>

             {/* SCANNER */}
             <button 
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center justify-center sm:gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] w-8 h-8 sm:w-auto sm:px-5 sm:py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 icon-container-3d"
             >
              <Scan className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-3d" />
              <span className="hidden sm:inline">Scanner</span>
             </button>
          </div>
        </div>
      </header>

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
}
