"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import { Shield, Lock, Zap, Coffee, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const Logo = ({ className = "h-8" }: { className?: string }) => (
  <div className={cn("flex items-center gap-4", className)}>
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-primary rounded-xl shadow-2xl shadow-blue-600/20 flex items-center justify-center overflow-hidden icon-container-3d">
        <div className="w-5 h-5 grid grid-cols-2 gap-1 relative z-10">
          <div className="border-[2px] border-white rounded-[1.5px]" />
          <div className="bg-white/40 rounded-[1.5px]" />
          <div className="bg-white/40 rounded-[1.5px]" />
          <div className="bg-white rounded-[1.5px]" />
        </div>
      </div>
    </div>
    
    <div className="font-headline font-black text-2xl tracking-tighter leading-none flex items-center">
      <span className="text-white uppercase">MY KIT</span>
      <span className="text-primary ml-1.5 uppercase">TOOL</span>
    </div>
  </div>
);

export function Footer() {
  const pathname = usePathname();

  // Only show footer on the homepage for a clean tool environment
  if (pathname !== '/') return null;

  return (
    <footer className="border-t border-white/5 bg-[#060608] py-32 md:py-48 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          <div className="lg:col-span-5 space-y-10">
            <Logo />
            <p className="text-[15px] text-foreground/60 font-medium leading-relaxed max-w-sm uppercase tracking-tight">
              The professional digital studio for high-fidelity asset production. Engineered with local-first intelligence for maximum privacy and performance.
            </p>
            
            <div className="flex flex-wrap items-center gap-10">
              {[
                { icon: Shield, label: 'Secured' },
                { icon: Lock, label: 'Private' },
                { icon: Zap, label: 'Instant' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  <item.icon className="w-4 h-4 text-primary/40" /> {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Tools</h4>
              <nav className="flex flex-col gap-5">
                {[
                  { label: 'All Tools', href: '/all-tools' },
                  { label: 'Single QR', href: '/single' },
                  { label: 'Bulk Mode', href: '/bulk' },
                  { label: 'Logo Maker', href: '/logo-maker' },
                  { label: 'Photo to Text', href: '/ocr' },
                ].map((link) => (
                  <Link key={link.label} href={link.href} className="text-xs font-bold text-foreground/60 hover:text-foreground transition-all uppercase tracking-widest">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">About</h4>
              <nav className="flex flex-col gap-5">
                {[
                  { label: 'Help Center', href: '/faq' },
                  { label: 'Buy me a coffee', href: '/donate' },
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map((link) => (
                  <Link key={link.label} href={link.href} className={cn(
                    "text-xs font-bold transition-all uppercase tracking-widest",
                    link.href === '/donate' ? "text-primary hover:text-primary/80" : "text-foreground/60 hover:text-foreground"
                  )}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-8 col-span-2 md:col-span-1">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Developer</h4>
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 shadow-2xl">
                <p className="text-[11px] text-foreground/60 font-bold uppercase leading-relaxed tracking-wider">
                  Built for precision and performance by <span className="text-foreground">Umar Farooq</span>.
                </p>
                <Link href="/donate" className="flex items-center gap-4 group/btn">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/btn:bg-primary group-hover/btn:text-white transition-all shadow-lg border border-primary/20">
                      <Coffee className="w-5 h-5" />
                   </div>
                   <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Support Dev</span>
                      <span className="text-[8px] font-bold text-white/40 uppercase block">Fuel the engine</span>
                   </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex gap-12">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/30">V7.2 PRODUCTION</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/30 flex items-center gap-2">
               <Globe className="w-3" /> NATIVE PWA
            </span>
          </div>
          
          <div className="text-center md:text-right space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">
              MY KIT TOOL. ALL RIGHTS RESERVED. © <CopyrightYear />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CopyrightYear() {
  const [year, setYear] = React.useState('2024');
  React.useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  return <>{year}</>;
}