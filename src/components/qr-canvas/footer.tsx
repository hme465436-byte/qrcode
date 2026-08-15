
"use client"

import React from 'react';
import { CopyrightYear } from './copyright-year';
import { Shield, Lock, Zap, ArrowUpRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const Logo = ({ className = "h-8" }: { className?: string }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-[#2563eb]/20 rounded-xl rotate-3" />
      <div className="absolute inset-0 bg-[#2563eb] rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center overflow-hidden">
        <div className="w-5 h-5 grid grid-cols-2 gap-1 relative z-10">
          <div className="border-[1.5px] border-white/70 rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white rounded-[1px]" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
      </div>
    </div>
    
    <div className="font-headline font-black text-2xl tracking-tighter leading-none flex items-center">
      <span className="text-[#0f172a] dark:text-white uppercase">MY KIT</span>
      <span className="text-[#2563eb] ml-2 italic">TOOL</span>
    </div>
  </div>
);

export function Footer() {
  return (
    <footer className="border-t border-[#2563eb]/10 bg-slate-50/50 dark:bg-slate-900/10 py-20 md:py-32 relative overflow-hidden">
      {/* Decorative gradient elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2563eb]/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 mb-24">
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8">
            <Logo />
            <p className="text-[15px] text-foreground/50 font-medium leading-relaxed max-w-sm">
              The world's premier artistic digital utility studio. Create high-resolution, branded technical assets instantly. 100% private, client-side, and free forever.
            </p>
            
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 inline-flex flex-col gap-2">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Creative Engineer</span>
               <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  Developed by <span className="text-primary">Umar Farooq</span> <Heart className="w-3 h-3 text-red-500 fill-red-500" />
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-2">
              <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-foreground/30">
                <Shield className="w-4 h-4 text-[#2563eb]" /> Secure
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-foreground/30">
                <Lock className="w-4 h-4 text-[#2563eb]" /> Private
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-foreground/30">
                <Zap className="w-4 h-4 text-[#2563eb]" /> Instant
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2563eb]">Production</h4>
              <nav className="flex flex-col gap-5">
                {[
                  { label: 'Single Studio', href: '/single' },
                  { label: 'Bulk Mode', href: '/bulk' },
                  { label: 'Age Studio', href: '/age-calculator' },
                  { label: 'Password Studio', href: '/password-generator' },
                  { label: 'YouTube Studio', href: '/youtube-banner-maker' },
                  { label: 'Collage Maker', href: '/collage-maker' },
                  { label: 'Favicon Studio', href: '/favicon-generator' },
                  { label: 'Privacy Purge', href: '/metadata-remover' },
                  { label: 'Color Picker', href: '/color-picker' },
                  { label: 'RGB Studio', href: '/rgb-picker' },
                  { label: 'Markdown View', href: '/markdown-preview' },
                  { label: 'Format Converter', href: '/image-converter' },
                  { label: 'Resizer', href: '/image-resizer' },
                  { label: 'Compressor', href: '/image-compressor' },
                  { label: 'Image to PDF', href: '/image-to-pdf' },
                  { label: 'Photo Editor', href: '/photo-editor' },
                  { label: 'Vocal Remover', href: '/vocal-separator' },
                  { label: 'Video to MP3', href: '/video-to-audio' },
                  { label: 'Video to GIF', href: '/video-to-gif' },
                  { label: 'Audio Joiner', href: '/audio-joiner' },
                  { label: 'Volume Booster', href: '/audio-booster' },
                  { label: 'Letter Art', href: '/letter-art' },
                  { label: 'OCR Extract', href: '/ocr' },
                  { label: 'Dot Art', href: '/dot-art' },
                  { label: 'Text Repeater', href: '/repeater' },
                  { label: 'Hex Converter', href: '/hex-converter' },
                  { label: 'AOB Converter', href: '/code-converter' },
                ].map((link) => (
                  <a key={link.label} href={link.href} className="group flex items-center gap-2 text-[12px] font-bold text-foreground/50 hover:text-[#2563eb] transition-all uppercase tracking-widest">
                    {link.label} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2563eb]">Knowledge</h4>
              <nav className="flex flex-col gap-5">
                {[
                  { label: 'Help Center', href: '/faq' },
                  { label: 'About Studio', href: '/about' },
                  { label: 'Studio Mission', href: '/about' },
                ].map((link) => (
                  <a key={link.label} href={link.href} className="group flex items-center gap-2 text-[12px] font-bold text-foreground/50 hover:text-[#2563eb] transition-all uppercase tracking-widest">
                    {link.label} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                  </a>
                ))}
              </nav>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2563eb]">Legal</h4>
              <nav className="flex flex-col gap-5">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Use', href: '/terms' },
                  { label: 'Cookie Policy', href: '/cookies' },
                ].map((link) => (
                  <a key={link.label} href={link.href} className="group flex items-center gap-2 text-[12px] font-bold text-foreground/50 hover:text-[#2563eb] transition-all uppercase tracking-widest">
                    {link.label} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-[#2563eb]/10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-wrap justify-center gap-10">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20">SSL SECURE</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20">GDPR READY</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20">PWA NATIVE</span>
          </div>
          
          <div className="text-center md:text-right space-y-3">
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground/40">
              &copy; <CopyrightYear /> MY KIT TOOL. PROFESSIONAL ASSET PRODUCTION.
            </p>
            <p className="text-[10px] font-medium text-foreground/20 uppercase tracking-[0.4em]">
              DIGITAL EXCELLENCE. PRIVACY FIRST.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
