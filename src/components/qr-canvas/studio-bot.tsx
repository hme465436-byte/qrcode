"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Command, 
  HelpCircle, 
  Minimize2, 
  Maximize2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertTriangle
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
  { href: '/single', title: 'Single Studio', desc: 'Branded QR codes with logos and AI backgrounds.', keywords: ['qr', 'qr code', 'barcode', 'logo', 'brand', 'scan', 'generator'] },
  { href: '/bulk', title: 'Bulk Production', desc: 'Generate hundreds of QR assets in seconds.', keywords: ['bulk', 'batch', 'mass', 'many', 'qr', 'zip', 'production'] },
  { href: '/photo-enhance-fix', title: 'Photo Enhance', desc: 'Upscale resolution and sharpen photo clarity.', keywords: ['enhance', 'fix', 'pixel', 'upscale', 'quality', 'photo', 'restore', 'blur'] },
  { href: '/passport-photo-maker', title: 'Passport Photo', desc: 'Create official ID photos and printable sheets.', keywords: ['passport', 'id', 'visa', 'print', '35x45', 'photo', 'identity', '2x2'] },
  { href: '/csv-to-json', title: 'CSV to JSON', desc: 'Convert CSV lists into optimized JSON matrices.', keywords: ['csv', 'json', 'convert', 'data', 'table', 'parse', 'excel'] },
  { href: '/json-to-csv', title: 'JSON to CSV', desc: 'Convert JSON objects into flat CSV files.', keywords: ['json', 'csv', 'convert', 'data', 'flatten', 'parse'] },
  { href: '/image-url-downloader', title: 'URL Downloader', desc: 'Extract high-res images from any page URL.', keywords: ['image', 'downloader', 'save', 'url', 'extract', 'scrape', 'yt'] },
  { href: '/mic-tester', title: 'Mic Tester', desc: 'Test hardware input levels and loopback echo.', keywords: ['mic', 'microphone', 'test', 'voice', 'audio', 'hardware', 'record'] },
  { href: '/speaker-tester', title: 'Speaker Tester', desc: 'Test stereo channels and frequency response.', keywords: ['speaker', 'audio', 'sound', 'stereo', 'left', 'right', 'test'] },
  { href: '/logo-maker', title: 'Logo Maker', desc: 'Generate premium text-based brand identities.', keywords: ['logo', 'text', 'brand', 'avatar', 'identity', 'design'] },
  { href: '/pdf-to-word', title: 'PDF to Word', desc: 'Convert PDF files into editable Word documents.', keywords: ['pdf', 'word', 'convert', 'docx', 'text', 'extract'] },
  { href: '/word-to-pdf', title: 'Word to PDF', desc: 'Convert Word documents into sanitized PDF masters.', keywords: ['word', 'pdf', 'convert', 'docx', 'save', 'print'] },
  { href: '/pdf-compressor', title: 'PDF Compressor', desc: 'Shrink PDF file size locally in your browser.', keywords: ['compress', 'smaller', 'pdf', 'shrink', 'size', 'optimize'] },
  { href: '/pdf-merger', title: 'PDF Merger', desc: 'Combine multiple PDF files into one.', keywords: ['merge', 'join', 'combine', 'pdf', 'add', 'stack'] },
  { href: '/pdf-splitter', title: 'PDF Splitter', desc: 'Separate PDF pages into individual files.', keywords: ['split', 'cut', 'separate', 'pages', 'extract', 'pdf'] },
  { href: '/duplicate-finder', title: 'Duplicate Purge', desc: 'Remove redundant files from project bundles.', keywords: ['duplicate', 'finder', 'purge', 'clean', 'redundant', 'same'] },
  { href: '/vocal-separator', title: 'Vocal Remover', desc: 'Isolate or remove vocals from stereo music.', keywords: ['vocal', 'remove', 'karaoke', 'music', 'separate', 'instrumental'] },
  { href: '/ocr', title: 'OCR Extraction', desc: 'Identify and extract text from images locally.', keywords: ['ocr', 'text', 'extract', 'read', 'scan', 'image', 'document'] },
  { href: '/password-generator', title: 'Password Studio', desc: 'Generate strong secure random passwords.', keywords: ['password', 'secure', 'random', 'key', 'safe', 'pass'] },
  { href: '/markdown-preview', title: 'Markdown Preview', desc: 'Live Markdown to HTML writing environment.', keywords: ['markdown', 'md', 'html', 'preview', 'editor', 'markup'] },
  { href: '/image-resizer', title: 'Image Resizer', desc: 'Scale photo pixel dimensions with ratio control.', keywords: ['resize', 'scale', 'dimension', 'width', 'height', 'px'] },
  { href: '/image-compressor', title: 'Image Compressor', desc: 'Reduce photo file size with quality control.', keywords: ['compress', 'shrink', 'smaller', 'kb', 'mb', 'image', 'optimize'] },
];

interface HelpProtocol {
  steps: string[];
  mistake: string;
}

const HELP_PROTOCOLS: Record<string, HelpProtocol> = {
  '/ocr': {
    steps: ['Upload a clear document image.', 'Adjust Contrast/Upscale for readability.', 'Click "Extract Matrix" to decode.'],
    mistake: 'Using low-contrast or blurred images reduces accuracy.'
  },
  '/single': {
    steps: ['Enter your target URL or text.', 'Choose a dot and corner style.', 'Add a logo and AI background.'],
    mistake: 'Setting background opacity too high can break scannability.'
  },
  '/bulk': {
    steps: ['Paste your list (one line per URL).', 'Apply your brand colors and styles.', 'Click "Export ZIP" to bundle all.'],
    mistake: 'Empty lines in the list will produce blank QR codes.'
  },
  '/passport-photo-maker': {
    steps: ['Upload a front-facing portrait.', 'Align head/eyes within the oval guide.', 'Select size and download A4 sheet.'],
    mistake: 'Not aligning eyes with the guide line may reject the photo.'
  },
  '/vocal-separator': {
    steps: ['Import a high-quality stereo track.', 'Choose "Vocal Reduce" for karaoke.', 'Adjust strength and save as WAV.'],
    mistake: 'Mono tracks cannot be processed via phase-cancellation.'
  },
  '/logo-maker': {
    steps: ['Enter your brand name/tagline.', 'Select a typographic profile.', 'Randomize or pick a custom palette.'],
    mistake: 'Using similar colors for text and background kills contrast.'
  },
  '/pdf-merger': {
    steps: ['Upload all PDF documents.', 'Drag rows to arrange the sequence.', 'Click "Merge" to unify the master.'],
    mistake: 'Merging encrypted PDFs requires unlocking them first.'
  }
};

const QUICK_CHIPS = ['PDF', 'Image', 'Compress', 'QR', 'Convert', 'Passport'];

export function StudioBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ type: 'user' | 'bot', content: string, links?: Tool[], protocol?: HelpProtocol, id: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize bot on mount
  useEffect(() => {
    const timer = setTimeout(() => setHasPulsed(true), 3000);
    setMessages([{ 
      type: 'bot', 
      content: 'Hello. I am your PRO Studio Assistant. Tell me what job you need to finish.',
      id: 'init' 
    }]);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard protocols
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSearch = (input: string) => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    const nextMsg = { type: 'user' as const, content: userMsg, id: Date.now().toString() };
    
    // Memory protocol: last 5 messages
    setMessages(prev => [...prev, nextMsg].slice(-10));
    setQuery('');

    // Logic Matrix
    const lowQuery = userMsg.toLowerCase();
    
    // 1. Context Check (Help for current page)
    if (lowQuery.includes('how') || lowQuery.includes('help') || lowQuery.includes('guide') || lowQuery.includes('step')) {
      const help = HELP_PROTOCOLS[pathname];
      if (help) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Here is the Master Protocol for this studio:`,
          protocol: help,
          id: `help-${Date.now()}`
        }].slice(-10));
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
      // Rank and limit to top 3
      const ranked = matches.slice(0, 3);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `I identified ${ranked.length} relevant production unit(s):`,
        links: ranked,
        id: `match-${Date.now()}`
      }].slice(-10));
    } else {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'This tool is not on My Kit Tool yet. I only have access to internal studio protocols.',
        id: `none-${Date.now()}` 
      }].slice(-10));
    }
  };

  const clearHistory = () => {
    setMessages([{ type: 'bot', content: 'History purged. How can I help you now?', id: 'reset' }]);
    toast({ title: "Memory Purged", description: "Studio session buffer cleared." });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-[100] group",
          !hasPulsed && "animate-bounce"
        )}
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
      "fixed bottom-0 right-0 lg:bottom-6 lg:right-6 w-full lg:w-[400px] bg-[#0a0a0c] border-t lg:border border-white/10 lg:rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] z-[100] flex flex-col overflow-hidden transition-all duration-500",
      isMinimized ? "h-[72px]" : "h-[600px] max-h-[90vh]"
    )}>
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Bot className="w-5 h-5 icon-3d" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">PRO Assistant</h4>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Protocol Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearHistory} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-destructive transition-all flex items-center justify-center" title="Clear History">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-primary transition-all flex items-center justify-center">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-destructive transition-all flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-checkered">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.type === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-lg",
                  msg.type === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-secondary border border-white/5 text-foreground/70 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                
                {msg.protocol && (
                  <div className="w-full space-y-3 mt-1 animate-in zoom-in duration-500">
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4">
                       <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Production Steps
                       </div>
                       <div className="space-y-3">
                          {msg.protocol.steps.map((step, i) => (
                            <div key={i} className="flex gap-3 text-[11px] text-foreground/60 leading-tight">
                               <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary shrink-0">{i+1}</span>
                               {step}
                            </div>
                          ))}
                       </div>
                       <div className="pt-3 border-t border-primary/10 flex items-start gap-3">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-yellow-600/80 font-bold uppercase italic">{msg.protocol.mistake}</p>
                       </div>
                    </div>
                  </div>
                )}

                {msg.links && (
                  <div className="grid grid-cols-1 gap-2 w-full mt-2">
                    {msg.links.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 group transition-all"
                      >
                         <div className="min-w-0">
                           <p className="text-[11px] font-black uppercase text-foreground truncate">{link.title}</p>
                           <p className="text-[10px] text-foreground/40 truncate">{link.desc}</p>
                         </div>
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all">
                            <ArrowRight className="w-4 h-4 icon-3d" />
                         </div>
                      </Link>
                    ))}
                  </div>
                )}

                {msg.type === 'bot' && msg.id !== 'init' && (
                  <div className="flex items-center gap-4 px-1">
                     <p className="text-[9px] font-black uppercase text-foreground/20">Helpful?</p>
                     <div className="flex gap-2">
                        <button onClick={() => toast({ title: "Feedback Received" })} className="text-foreground/20 hover:text-primary transition-colors"><ThumbsUp className="w-3 h-3" /></button>
                        <button onClick={() => toast({ title: "Feedback Received" })} className="text-foreground/20 hover:text-destructive transition-colors"><ThumbsDown className="w-3 h-3" /></button>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Chips & Input Footer */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02] space-y-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {QUICK_CHIPS.map(chip => (
                 <button 
                  key={chip}
                  onClick={() => { setQuery(chip); handleSearch(chip); }}
                  className="px-4 py-1.5 rounded-full bg-secondary border border-white/5 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary hover:border-primary/20 transition-all whitespace-nowrap"
                 >
                   {chip}
                 </button>
               ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative group">
               <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask for a job (e.g. 'I need PDF')"
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
               <span className="flex items-center gap-2"><ShieldCheck className="w-2.5 h-2.5" /> Local Intelligence Only</span>
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
