"use client"

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Palette, 
  Download,
  ArrowRight,
  Smartphone,
  Repeat,
  Binary,
  Grid3X3,
  FileText,
  ImageIcon,
  FileCode,
  Music,
  Heart,
  Search,
  X,
  Maximize,
  FileStack,
  CaseSensitive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button as ShadButton } from '@/components/ui/button';

const TOOLS = [
  { 
    href: '/single', 
    icon: QrCode, 
    title: 'Single Studio', 
    desc: 'Branded QR codes with logos and AI backgrounds.', 
    label: 'PRO MODE', 
    color: 'bg-primary/50',
    keywords: ['qr', 'qr code', 'barcode', 'logo qr', 'brand qr', 'single', 'generator', 'scan']
  },
  { 
    href: '/bulk', 
    icon: Layers, 
    title: 'Bulk Production', 
    desc: 'Generate hundreds of high-res assets in seconds.', 
    label: 'BATCH', 
    color: 'bg-primary/50',
    keywords: ['bulk', 'batch', 'mass', 'multi', 'qr', 'barcodes', 'production', 'zip', 'many']
  },
  { 
    href: '/image-compressor', 
    icon: Maximize, 
    title: 'Image Compressor', 
    desc: 'Reduce file size locally with quality control.', 
    label: 'OPTIMIZE', 
    color: 'bg-primary/50',
    keywords: ['compress', 'image compressor', 'reduce size', 'jpg', 'photo size', 'optimize', 'shrink', 'smaller']
  },
  { 
    href: '/image-to-pdf', 
    icon: FileStack, 
    title: 'Image to PDF', 
    desc: 'Convert multiple images into a professional PDF.', 
    label: 'DOCUMENT', 
    color: 'bg-primary/50',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photo pdf', 'convert pdf', 'bundle', 'pdf']
  },
  { 
    href: '/photo-editor', 
    icon: ImageIcon, 
    title: 'Photo Studio', 
    desc: 'Professional filters and local image editing.', 
    label: 'EDITOR', 
    color: 'bg-primary/50',
    keywords: ['photo', 'image', 'edit', 'crop', 'filter', 'editor', 'picture', 'manipulate', 'brightness', 'contrast']
  },
  { 
    href: '/video-to-audio', 
    icon: Music, 
    title: 'Video to MP3', 
    desc: 'Extract high-quality audio tracks from videos.', 
    label: 'MEDIA', 
    color: 'bg-primary/50',
    keywords: ['mp4', 'mp3', 'video', 'audio', 'convert', 'music', 'extract', 'sound', 'ffmpeg']
  },
  { 
    href: '/letter-art', 
    icon: CaseSensitive, 
    title: 'Letter Art Studio', 
    desc: 'Image to text conversion using custom alphabets.', 
    label: 'ASCII', 
    color: 'bg-primary/40',
    keywords: ['image to text', 'ascii art', 'letters art', 'custom characters', 'image to alphabet', 'text art', 'alphabet art']
  },
  { 
    href: '/ocr', 
    icon: FileText, 
    title: 'OCR Extraction', 
    desc: 'Extract text from images locally and securely.', 
    label: 'INTEL', 
    color: 'bg-primary/40',
    keywords: ['text', 'extract', 'ocr', 'image to text', 'recognize', 'scan', 'tesseract', 'read']
  },
  { 
    href: '/hex-converter', 
    icon: FileCode, 
    title: 'Hex Converter', 
    desc: 'Convert binary files to hexadecimal matrix.', 
    label: 'BINARY', 
    color: 'bg-primary/40',
    keywords: ['hex', 'hexadecimal', 'binary', 'file', 'matrix', 'bytes', 'dump', 'offset']
  },
  { 
    href: '/dot-art', 
    icon: Grid3X3, 
    title: 'Dot Art Studio', 
    desc: 'Intricate Braille Unicode artistic generation.', 
    label: 'ART', 
    color: 'bg-primary/40',
    keywords: ['braille', 'dots', 'ascii art', 'image to dots', 'matrix', 'creative', 'text art']
  },
  { 
    href: '/repeater', 
    icon: Repeat, 
    title: 'Text Repeater', 
    desc: 'Professional emoji and text multiplication.', 
    label: 'UTIL', 
    color: 'bg-primary/30',
    keywords: ['repeat', 'text repeat', 'emoji', 'multiply', 'spam', 'util', 'repeater', 'cloner']
  },
  { 
    href: '/code-converter', 
    icon: Binary, 
    title: 'AOB Converter', 
    desc: 'Professional AOB pattern conversion utility.', 
    label: 'DEV', 
    color: 'bg-primary/30',
    keywords: ['aob', 'code', 'binary', 'convert', 'pattern', 'trainer', 'hex', 'c#', 'c++', 'python', 'array of bytes']
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    return TOOLS.filter(tool => {
      const targetString = `${tool.title} ${tool.desc} ${tool.keywords.join(' ')}`.toLowerCase();
      return words.every(word => targetString.includes(word));
    });
  }, [searchQuery]);

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="w-full px-4 sm:px-6 pt-12 pb-20 md:pt-24 md:pb-40 text-center relative overflow-hidden">
        {/* Animated Rotating Aura behind Search */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] pointer-events-none">
          <div className="w-full h-full bg-gradient-to-tr from-primary/30 via-transparent to-primary/20 rounded-full blur-[100px] animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-primary/30 rounded-full blur-[100px] animate-[spin_8s_linear_infinite_reverse]" />
        </div>
        
        <div className="max-w-4xl mx-auto animate-reveal relative z-10">
          <h1 className="text-3xl sm:text-7xl lg:text-8xl font-headline font-black mb-6 sm:mb-8 leading-[1.1] tracking-tighter text-foreground uppercase overflow-wrap-anywhere">
            Digital <span className="text-primary italic">Excellence</span> <br />
            <span className="text-foreground/80">MY KIT TOOL</span>
          </h1>
          <p className="text-sm sm:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed font-medium mb-12 sm:mb-16 px-2">
            The world&apos;s most advanced professional utility studio. Generate high-resolution, branded assets and technical patterns for global workflows with AI-powered precision.
          </p>

          {/* Search Bar Implementation with Rotating Aura */}
          <div className="max-w-xl mx-auto mb-16 px-4 group relative">
            {/* Glowing Ring Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-400 to-primary rounded-[2.2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-1000 animate-[spin_6s_linear_infinite]" />
            
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
              </div>
              <Input 
                type="text"
                placeholder="Search tools... (e.g. compress, qr, hex)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-14 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-border hover:border-primary/40 focus:border-primary/60 rounded-3xl text-lg font-medium shadow-2xl transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-5 flex items-center text-foreground/20 hover:text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary/60">
                Found {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'} matching your search
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {filteredTools.length > 0 ? (
              filteredTools.map((item, i) => (
                <Link key={i} href={item.href} className="group h-full w-full animate-in fade-in zoom-in duration-500">
                  <div className="glass-card p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border-border hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 text-left relative overflow-hidden h-full shadow-2xl hover:shadow-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-primary/30 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20 group-hover:bg-primary/40 transition-all blur-3xl" />
                    <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.8rem] flex items-center justify-center text-primary mb-6 sm:mb-8 border border-primary/60 shadow-inner group-hover:scale-110 transition-transform duration-500", item.color)}>
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-headline font-black text-foreground uppercase tracking-tight">{item.title}</h3>
                        <span className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-widest shrink-0">{item.label}</span>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-foreground/40 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 pt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                        Open Studio <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform duration-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 glass-card rounded-[3rem] border-dashed border-border flex flex-col items-center justify-center gap-6">
                <Search className="w-16 h-16 text-foreground/10" />
                <div className="space-y-2">
                  <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">No tools found</h3>
                  <p className="text-sm text-foreground/40 font-medium">Try searching for broader terms like &quot;compress&quot; or &quot;qr&quot;</p>
                </div>
                <ShadButton 
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/20 text-primary"
                >
                  Clear Search
                </ShadButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="w-full bg-secondary/20 py-20 sm:py-32 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-24 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-5xl font-headline font-black uppercase tracking-tight mb-4 sm:mb-6">Built for <span className="text-primary italic">Reliability</span></h2>
            <p className="text-sm sm:text-base text-foreground/40 font-medium leading-relaxed">High-performance technical assets with a focus on privacy and professional scannability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-16 max-w-6xl mx-auto">
            {[
              { icon: Palette, title: 'Artistic Branding', desc: 'Custom dot patterns, corner geometries, and integrated business logos for consistent brand identity.' },
              { icon: Download, title: 'Vector Exports', desc: 'Download in PNG, JPG, or professional SVG formats suitable for large-format billboards and print.' },
              { icon: Smartphone, title: 'PWA Native', desc: 'Install as a high-performance native app on your mobile device for offline studio access anytime.' },
              { icon: Zap, title: 'Instant Engine', desc: 'Real-time studio preview with advanced error correction level adjustment and technical scores.' },
              { icon: ShieldCheck, title: 'Privacy Absolute', desc: 'Zero data storage. All generation, OCR, and editing happens locally in your secure browser session.' },
              { icon: Binary, title: 'Technical Tools', desc: 'Code converters, AOB pattern processors, and developer-centric utilities for modern workflows.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 sm:gap-8 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.8rem] bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-xl group-hover:border-primary/40 transition-all duration-500">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-[12px] sm:text-[13px] text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full px-4 sm:px-6 py-20 sm:py-32 text-center overflow-hidden">
        <div className="glass-card p-10 sm:p-24 rounded-[3rem] sm:rounded-[4rem] max-w-5xl mx-auto border-border relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24 sm:-mr-32 sm:-mt-32" />
           <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-24 -mb-24 sm:-ml-32 -mb-32" />
           
           <h2 className="text-2xl sm:text-6xl font-headline font-black uppercase tracking-tight mb-6 sm:mb-8 relative z-10">Start Your <span className="text-primary italic">Production</span></h2>
           <p className="text-sm sm:text-lg text-foreground/40 font-medium mb-10 sm:mb-12 max-w-2xl mx-auto relative z-10">
             Join thousands of professionals using MY KIT TOOL for premium branded assets and technical utilities. No signup, just performance.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
             <Link href="/single" className="w-full sm:w-auto px-10 py-5 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
               Open Studio
             </Link>
             <Link href="/faq" className="w-full sm:w-auto px-10 py-5 bg-secondary border border-border text-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-secondary/80 transition-all">
               View Documentation
             </Link>
           </div>
        </div>
        
        {/* Attribution Section */}
        <div className="mt-16 sm:mt-20 animate-reveal stagger-4">
           <div className="inline-flex flex-col items-center gap-2 p-5 sm:p-6 rounded-3xl bg-secondary/30 border border-border">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-foreground/30">Crafted with Excellence</span>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Developed by <span className="text-primary">Umar Farooq</span> <Heart className="inline w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500 ml-1" />
              </p>
           </div>
        </div>
      </section>
    </div>
  );
}
