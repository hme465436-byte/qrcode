"use client"

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare, 
  ArrowRight, 
  ExternalLink,
  Zap,
  ShieldCheck,
  Search,
  Sparkles,
  Command,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Tool {
  href: string;
  title: string;
  desc: string;
  keywords: string[];
}

const TOOLS: Tool[] = [
  { href: '/single', title: 'Single Studio', desc: 'Branded QR codes with logos and AI backgrounds.', keywords: ['qr', 'qr code', 'barcode', 'logo', 'brand', 'scan'] },
  { href: '/bulk', title: 'Bulk Production', desc: 'Generate hundreds of QR assets in seconds.', keywords: ['bulk', 'batch', 'mass', 'many', 'qr', 'zip'] },
  { href: '/photo-enhance-fix', title: 'Photo Enhance', desc: 'Upscale resolution and sharpen photo clarity.', keywords: ['enhance', 'fix', 'pixel', 'upscale', 'quality', 'photo'] },
  { href: '/passport-photo-maker', title: 'Passport Photo', desc: 'Create official ID photos and printable sheets.', keywords: ['passport', 'id', 'visa', 'print', '35x45', 'photo'] },
  { href: '/csv-to-json', title: 'CSV to JSON', desc: 'Convert CSV lists into optimized JSON matrices.', keywords: ['csv', 'json', 'convert', 'data', 'table'] },
  { href: '/json-to-csv', title: 'JSON to CSV', desc: 'Convert JSON objects into flat CSV files.', keywords: ['json', 'csv', 'convert', 'data', 'flatten'] },
  { href: '/image-url-downloader', title: 'URL Downloader', desc: 'Extract high-res images from any page URL.', keywords: ['image', 'downloader', 'save', 'url', 'extract'] },
  { href: '/mic-tester', title: 'Mic Tester', desc: 'Test hardware input levels and loopback echo.', keywords: ['mic', 'microphone', 'test', 'voice', 'audio'] },
  { href: '/logo-maker', title: 'Logo Maker', desc: 'Generate premium text-based brand identities.', keywords: ['logo', 'text', 'brand', 'avatar', 'identity'] },
  { href: '/pdf-to-word', title: 'PDF to Word', desc: 'Convert PDF files into editable Word documents.', keywords: ['pdf', 'word', 'convert', 'docx', 'text'] },
  { href: '/word-to-pdf', title: 'Word to PDF', desc: 'Convert Word documents into sanitized PDF masters.', keywords: ['word', 'pdf', 'convert', 'docx', 'save'] },
  { href: '/pdf-compressor', title: 'PDF Compressor', desc: 'Shrink PDF file size locally in your browser.', keywords: ['compress', 'smaller', 'pdf', 'shrink', 'size'] },
  { href: '/duplicate-finder', title: 'Duplicate Purge', desc: 'Remove redundant files from project bundles.', keywords: ['duplicate', 'finder', 'purge', 'clean', 'redundant'] },
  { href: '/vocal-separator', title: 'Vocal Remover', desc: 'Isolate or remove vocals from stereo music.', keywords: ['vocal', 'remove', 'karaoke', 'music', 'separate'] },
  { href: '/ocr', title: 'OCR Extraction', desc: 'Identify and extract text from images locally.', keywords: ['ocr', 'text', 'extract', 'read', 'scan', 'image'] },
  { href: '/password-generator', title: 'Password Studio', desc: 'Generate strong secure random passwords.', keywords: ['password', 'secure', 'random', 'key', 'safe'] },
  { href: '/markdown-preview', title: 'Markdown Preview', desc: 'Live Markdown to HTML writing environment.', keywords: ['markdown', 'md', 'html', 'preview', 'editor'] },
  { href: '/image-resizer', title: 'Image Resizer', desc: 'Scale photo pixel dimensions with ratio control.', keywords: ['resize', 'scale', 'dimension', 'width', 'height'] },
];

const HELP_PROTOCOLS: Record<string, string> = {
  '/ocr': 'Upload a document image → Adjust contrast → Click "Extract Matrix" → Copy result.',
  '/single': 'Enter data → Choose style → Upload brand logo → Generate AI BG → Download PNG.',
  '/bulk': 'Paste list (one per line) → Configure style → Click "Generate Bundle" → Download ZIP.',
  '/pdf-merger': 'Import 2+ PDFs → Arrange sequence → Click "Merge Documents" → Save Master.',
  '/vocal-separator': 'Import stereo track → Choose mode → Adjust strength → Preview → Save WAV.',
  '/logo-maker': 'Enter name → Pick font & layout → Randomize or pick colors → Export PNG.',
};

export function StudioBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ type: 'user' | 'bot', content: string, links?: Tool[] }[]>([
    { type: 'bot', content: 'Hello. I am the Studio Assistant. How can I help you navigate the MY KIT matrix today?' }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMsg }]);
    setQuery('');

    // Logic Matrix
    const lowQuery = userMsg.toLowerCase();
    
    // 1. Context Check
    if (lowQuery.includes('how') || lowQuery.includes('help') || lowQuery.includes('use')) {
      const help = HELP_PROTOCOLS[pathname];
      if (help) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Master Protocol for this studio: ${help}` 
        }]);
        return;
      }
    }

    // 2. Registry Search
    const keywords = lowQuery.split(/\s+/).filter(k => k.length > 2);
    const matches = TOOLS.filter(t => {
      const target = `${t.title} ${t.desc} ${t.keywords.join(' ')}`.toLowerCase();
      return keywords.some(k => target.includes(k));
    });

    if (matches.length > 0) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `I identified ${matches.length} relevant production unit(s) in the registry:`,
        links: matches
      }]);
    } else {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'This tool is not on My Kit Tool yet. I only have access to internal studio protocols.' 
      }]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-[100] group"
      >
        <div className="relative">
          <Bot className="w-7 h-7 icon-3d" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-primary rounded-full animate-pulse" />
        </div>
        <div className="absolute right-full mr-4 px-4 py-2 rounded-xl bg-[#0a0a0c] border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl">
          Studio Assistant
        </div>
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 w-[340px] sm:w-[380px] bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] z-[100] flex flex-col overflow-hidden transition-all duration-500",
      isMinimized ? "h-[72px]" : "h-[500px] max-h-[80vh]"
    )}>
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Bot className="w-5 h-5 icon-3d" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Studio Assistant</h4>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Protocol Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-primary transition-all flex items-center justify-center"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => { setIsOpen(false); setIsMinimized(false); }} 
            className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-destructive transition-all flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-checkered">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.type === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-lg",
                  msg.type === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-secondary border border-white/5 text-foreground/70 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                
                {msg.links && (
                  <div className="grid grid-cols-1 gap-2 w-full mt-2">
                    {msg.links.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 group transition-all"
                      >
                         <div className="min-w-0">
                           <p className="text-[10px] font-black uppercase text-foreground truncate">{link.title}</p>
                           <p className="text-[9px] text-foreground/40 truncate">{link.desc}</p>
                         </div>
                         <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <form onSubmit={handleSearch} className="relative group">
               <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask for a tool (e.g. 'I need PDF')"
                className="w-full h-12 pl-4 pr-12 rounded-xl bg-background border border-white/10 text-[11px] font-medium placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 relative z-10"
               />
               <button 
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-20 z-20"
               >
                 <Send className="w-3.5 h-3.5" />
               </button>
            </form>
            <div className="mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-foreground/10 px-1">
               <span>Studio Registry v7.2</span>
               <span className="flex items-center gap-2"><ShieldCheck className="w-2.5 h-2.5" /> Local Only</span>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, rgba(255,255,255,0.01) 25%, transparent 25%), 
                            linear-gradient(-45deg, rgba(255,255,255,0.01) 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.01) 75%), 
                            linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.01) 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
