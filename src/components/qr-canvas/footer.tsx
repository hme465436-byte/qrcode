
"use client"

import React from 'react';
import { CopyrightYear } from './copyright-year';
import { Shield, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const Logo = ({ className = "h-8" }: { className?: string }) => (
  <div className={cn("flex items-center gap-3", className)}>
    {/* Left Unit: Blue Geometric Icon */}
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-[#2563eb]/20 rounded-xl rotate-3" />
      <div className="absolute inset-0 bg-[#2563eb] rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center overflow-hidden">
        {/* Geometric QR Grid Icon */}
        <div className="w-5 h-5 grid grid-cols-2 gap-1 relative z-10">
          <div className="border-[1.2px] border-white/60 rounded-[0.5px]" />
          <div className="bg-white/30 rounded-[0.5px]" />
          <div className="bg-white/30 rounded-[0.5px]" />
          <div className="bg-white rounded-[0.5px]" />
        </div>
        {/* Glass Effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
      </div>
    </div>
    
    {/* Right Unit: Brand Wordmark with split colors */}
    <div className="font-headline font-black text-2xl tracking-tighter leading-none flex items-center">
      <span className="text-[#0f172a] dark:text-white">QR</span>
      <span className="text-[#2563eb] ml-2">Canvas</span>
    </div>
  </div>
);

export function Footer() {
  return (
    <footer className="border-t border-[#2563eb]/10 bg-slate-50/50 dark:bg-slate-900/20 py-16 md:py-24 mt-20 relative overflow-hidden">
      {/* Decorative gradient elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#2563eb]/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-6">
            <Logo />
            <p className="text-sm text-foreground/50 font-medium leading-relaxed max-w-sm">
              Free Online QR Code Generator - Create beautiful, professional-grade QR codes instantly for personal and business use. 100% private and permanent assets.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                <Shield className="w-3.5 h-3.5 text-[#2563eb]" /> Secure
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                <Lock className="w-3.5 h-3.5 text-[#2563eb]" /> Private
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                <Zap className="w-3.5 h-3.5 text-[#2563eb]" /> Instant
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563eb]">Studio</h4>
              <nav className="flex flex-col gap-4">
                <a href="/single" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Single QR</a>
                <a href="/bulk" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Bulk Mode</a>
                <a href="/photo-editor" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Photo Editor</a>
                <a href="/ocr" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">OCR Extraction</a>
                <a href="/dot-art" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Dot Art Studio</a>
                <a href="/repeater" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Text Repeater</a>
                <a href="/code-converter" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Code Converter</a>
              </nav>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563eb]">Resources</h4>
              <nav className="flex flex-col gap-4">
                <a href="/faq" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Knowledge Base</a>
                <a href="/about" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">About Studio</a>
                <a href="/about" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Mission</a>
              </nav>
            </div>

            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563eb]">Legal</h4>
              <nav className="flex flex-col gap-4">
                <a href="/privacy" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Privacy Policy</a>
                <a href="/terms" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Terms of Service</a>
                <a href="/cookies" className="text-[11px] font-bold text-foreground/50 hover:text-[#2563eb] transition-colors uppercase tracking-widest">Cookie Policy</a>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-[#2563eb]/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap justify-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">SSL SECURE</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">GDPR COMPLIANT</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">PWA READY</span>
          </div>
          
          <div className="text-center md:text-right space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40">
              &copy; <CopyrightYear /> QR CANVAS. PROFESSIONAL BRANDING STUDIO.
            </p>
            <p className="text-[9px] font-medium text-foreground/20 uppercase tracking-widest">
              Digital excellence for global marketing teams.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
