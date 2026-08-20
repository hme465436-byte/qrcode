"use client"

import React from 'react';
import { CopyrightYear } from './copyright-year';
import { Shield, Lock, Zap, ArrowUpRight, Heart, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const Logo = ({ className = "h-8" }: { className?: string }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden">
        <div className="w-4 h-4 grid grid-cols-2 gap-0.5 relative z-10">
          <div className="border-[1.5px] border-white rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white rounded-[1px]" />
        </div>
      </div>
    </div>
    
    <div className="font-headline font-black text-xl tracking-tighter leading-none flex items-center">
      <span className="text-[#0f172a] dark:text-white uppercase">MY KIT</span>
      <span className="text-primary ml-1.5 uppercase">TOOL</span>
    </div>
  </div>
);

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060608] py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5 space-y-8">
            <Logo />
            <p className="text-[15px] text-foreground/40 font-medium leading-relaxed max-w-sm">
              The professional digital studio for high-fidelity asset production. Powered by client-side intelligence for maximum privacy and performance.
            </p>
            
            <div className="flex wrap items-center gap-8 pt-4">
              <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                <Shield className="w-3.5 h-3.5 text-primary/40" /> Secure
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                <Lock className="w-3.5 h-3.5 text-primary/40" /> Private
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                <Zap className="w-3.5 h-3.5 text-primary/40" /> Instant
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Studio</h4>
              <nav className="flex flex-col gap-4">
                {[
                  { label: 'Single QR', href: '/single' },
                  { label: 'Bulk Mode', href: '/bulk' },
                  { label: 'Logo Maker', href: '/logo-maker' },
                  { label: 'Photo to Text', href: '/ocr' },
                ].map((link) => (
                  <Link key={link.label} href={link.href} className="text-xs font-bold text-foreground/40 hover:text-foreground transition-all uppercase tracking-widest">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Knowledge</h4>
              <nav className="flex flex-col gap-4">
                {[
                  { label: 'Help Center', href: '/faq' },
                  { label: 'Buy me a coffee', href: '/donate' },
                  { label: 'About & My Work', href: '/about' },
                  { label: 'Privacy', href: '/privacy' },
                  { label: 'Terms', href: '/terms' },
                ].map((link) => (
                  <Link key={link.label} href={link.href} className={cn(
                    "text-xs font-bold transition-all uppercase tracking-widest",
                    link.href === '/donate' ? "text-primary hover:text-primary/80" : "text-foreground/40 hover:text-foreground"
                  )}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Developer</h4>
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed tracking-wider">
                  Engineered with ❤️ by <span className="text-foreground">Umar Farooq</span>. Built for precision.
                </p>
                <Link href="/donate" className="flex items-center gap-3 pt-2 group/btn">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                      <Coffee className="w-4 h-4" />
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-primary">Support Dev</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-10">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/10">V7.2 PRODUCTION</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/10">NATIVE PWA</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
              &copy; <CopyrightYear /> MY KIT TOOL. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
