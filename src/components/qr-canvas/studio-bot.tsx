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
  CheckCircle2,
  AlertTriangle,
  Loader2,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Tool {
  href: string;
  title: string;
  desc: string;
  keywords: string[];
  steps: string[];
  tip: string;
  mistake: string;
}

/**
 * COMPREHENSIVE TOOL & PROTOCOL REGISTRY
 * Maps identity, search keywords, and educational steps for all tools.
 */
const TOOLS: Tool[] = [
  { 
    href: '/single', 
    title: 'Single Studio', 
    desc: 'Branded QR codes with logos and AI backgrounds.', 
    keywords: ['qr', 'generator', 'logo', 'brand', 'scan', 'create qr', 'barcode', 'website qr'],
    steps: ['Enter your target URL or Text content.', 'Select a technical style for dots and corners.', 'Upload your brand logo for the center.', 'Generate an AI background using a prompt.', 'Export as high-res PNG or SVG.'],
    tip: 'Keep the background opacity below 30% for best scan reliability.',
    mistake: 'Using a dark QR color on a dark background makes it unreadable.'
  },
  { 
    href: '/bulk', 
    title: 'Bulk Production', 
    desc: 'Generate hundreds of QR assets in seconds.', 
    keywords: ['bulk', 'batch', 'mass', 'many', 'zip', 'production', 'multiple qr'],
    steps: ['Paste your list of URLs (one per line).', 'Select your unified brand style.', 'Choose your export format (PNG/PDF).', 'Click "Export ZIP Bundle".'],
    tip: 'Great for inventory labels or mass marketing campaigns.',
    mistake: 'Empty lines in your list will generate blank placeholder QR codes.'
  },
  { 
    href: '/photo-enhance-fix', 
    title: 'Photo Enhance / Pixel Fix', 
    desc: 'Upscale resolution and sharpen photo clarity.', 
    keywords: ['enhance', 'fix', 'pixel', 'upscale', 'quality', 'restore', 'blur', 'saaf', 'clear', 'blurry', 'hq'],
    steps: ['Import your low-res or blurry photo.', 'Select an Upscale level (2x or 4x).', 'Adjust Contrast and Sharpness sliders.', 'Use the Before/After slider to verify results.', 'Download the restored master.'],
    tip: 'Use "Denoise" first to smooth grains before sharpening edges.',
    mistake: 'Over-sharpening can introduce digital "halo" artifacts around objects.'
  },
  { 
    href: '/passport-photo-maker', 
    title: 'Passport Photo', 
    desc: 'Create official ID photos and printable sheets.', 
    keywords: ['passport', 'id', 'visa', 'print', '35x45', 'photo', 'identity', '2x2', 'form photo'],
    steps: ['Upload a front-facing portrait.', 'Align your eyes with the horizontal guide line.', 'Ensure the head fits inside the oval matrix.', 'Select your target country size (e.g. PK/UK/US).', 'Download as a single PNG or A4 Print Sheet.'],
    tip: 'A white or light blue background is required for most official visas.',
    mistake: 'Tilting your head or looking away from the camera will cause rejection.'
  },
  { 
    href: '/ocr', 
    title: 'OCR Extraction', 
    desc: 'Identify and extract text from images.', 
    keywords: ['ocr', 'text', 'extract', 'read', 'scan', 'image', 'saaf text'],
    steps: ['Upload an image of a document or sign.', 'Select the primary language.', 'Boost contrast if the text is faint.', 'Click "Extract Matrix".', 'Copy the decoded text from the output box.'],
    tip: 'Clean, printed text has nearly 100% accuracy; handwriting is limited.',
    mistake: 'Low light or blurry captures significantly reduce character recognition.'
  },
  { 
    href: '/pdf-merger', 
    title: 'PDF Merger', 
    desc: 'Combine multiple PDF files into one.', 
    keywords: ['merge', 'join', 'combine', 'stack', 'ek sath', 'joren'],
    steps: ['Upload all the PDF files you want to join.', 'Drag and drop rows to set the page sequence.', 'Click "Merge Documents".', 'Download the unified PDF master.'],
    tip: 'You can merge up to 20 documents in a single production cycle.',
    mistake: 'Trying to merge password-protected PDFs without unlocking them first.'
  },
  { 
    href: '/pdf-compressor', 
    title: 'PDF Compressor', 
    desc: 'Shrink PDF file size locally in your browser.', 
    keywords: ['compress', 'smaller', 'shrink', 'size', 'optimize', 'kb', 'chhota', 'kam', 'pdf size'],
    steps: ['Import your heavy PDF document.', 'Select a compression level (Eco/Standard/Intensive).', 'Wait for the WASM engine to re-matrix the file.', 'Check the reduction percentage.', 'Download the optimized version.'],
    tip: 'The "Standard" mode offers the best balance of size and legibility.',
    mistake: 'Intensive compression may slightly blur small technical diagrams.'
  },
  { 
    href: '/image-compressor', 
    title: 'Image Compressor', 
    desc: 'Reduce photo file size locally.', 
    keywords: ['compress', 'shrink', 'smaller', 'kb', 'image', 'photo size', 'kb kam'],
    steps: ['Import your high-res JPG or PNG.', 'Adjust the Quality slider (70-80% is recommended).', 'Set a Max Width if you need to downscale.', 'Compare original vs. optimized size.', 'Download the compressed asset.'],
    tip: 'Converting PNG to JPG during compression yields the most significant size reduction.',
    mistake: 'Dropping quality below 40% will cause visible pixel artifacts.'
  },
  { 
    href: '/logo-maker', 
    title: 'Logo Text Studio', 
    desc: 'Generate premium text-based brand identities.', 
    keywords: ['logo', 'text', 'brand', 'avatar', 'identity', 'design', 'name'],
    steps: ['Enter your brand name and tagline.', 'Browse and select a typographic profile.', 'Adjust letter spacing and font size.', 'Add a geometric symbol or badge container.', 'Export as a high-res 1024px PNG.'],
    tip: 'Use the "Randomize" button to discover unique design combinations.',
    mistake: 'Choosing similar colors for text and background kills brand visibility.'
  }
];

export function StudioBot() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [query, setQuery] = useState('');
  const [lastMatchedTool, setLastMatchedTool] = useState<Tool | null>(null);
  const [messages, setMessages] = useState<{ type: 'user' | 'bot', content: string, links?: Tool[], toolInfo?: Tool, id: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-pulse on first load
  useEffect(() => {
    const timer = setTimeout(() => setHasPulsed(true), 3000);
    setMessages([{ 
      type: 'bot', 
      content: 'Hello. I am your PRO Studio Assistant. Tell me what job you need to finish or ask "how to use" a tool.',
      id: 'init' 
    }]);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard support: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSearch = (input: string) => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    const nextMsg = { type: 'user' as const, content: userMsg, id: Date.now().toString() };
    setMessages(prev => [...prev, nextMsg].slice(-10));
    setQuery('');

    const lowQuery = userMsg.toLowerCase();
    
    // 1. "How to" / Help Logic
    const isHelpQuery = lowQuery.match(/(how|help|guide|step|kese|tarika|detail)/);
    
    if (isHelpQuery) {
      // Check if we are on a tool page
      const currentTool = TOOLS.find(t => t.href === pathname);
      const targetTool = currentTool || lastMatchedTool;

      if (targetTool) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Here is the Master Protocol for the **${targetTool.title}**:`,
          toolInfo: targetTool,
          id: `help-${Date.now()}`
        }].slice(-10));
        return;
      } else if (lowQuery.length < 10) {
         setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Which tool do you need help with? You can say "how to use QR" or "steps for PDF".',
          id: `ask-${Date.now()}`
        }].slice(-10));
        return;
      }
    }

    // 2. Semantic Search Matrix
    const queryWords = lowQuery.split(/\s+/).filter(k => k.length > 1);
    
    const results = TOOLS.map(tool => {
      let score = 0;
      const toolText = `${tool.title} ${tool.desc} ${tool.keywords.join(' ')}`.toLowerCase();
      
      queryWords.forEach(word => {
        if (toolText.includes(word)) score++;
        if (tool.title.toLowerCase().includes(word)) score += 2;
        // Urdu specific boost
        if ((word === 'chhota' || word === 'kam') && tool.keywords.includes('kam')) score += 1;
        if ((word === 'saaf') && tool.keywords.includes('saaf')) score += 1;
      });
      
      return { tool, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.tool);

    if (results.length > 0) {
      setLastMatchedTool(results[0]);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `I identified these tools for your job. Select one to see the **How-to Protocol**:`,
        links: results,
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
    setMessages([{ type: 'bot', content: 'Session purged. How can I assist you now?', id: 'reset' }]);
    toast({ title: "Memory Purged", description: "Studio session buffer cleared." });
  };

  const QUICK_CHIPS = ['PDF', 'Image', 'QR', 'Passport', 'Logo', 'OCR'];

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
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-0 right-0 lg:bottom-6 lg:right-6 w-full lg:w-[420px] bg-[#0a0a0c] border-t lg:border border-white/10 lg:rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] z-[100] flex flex-col overflow-hidden transition-all duration-500",
      isMinimized ? "h-[72px]" : "h-[650px] max-h-[90vh]"
    )}>
      {/* Bot Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
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
          <button onClick={clearHistory} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-destructive transition-all flex items-center justify-center" title="Purge Session">
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
          {/* Chat Window */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-checkered">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex flex-col gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.type === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                {/* Content Bubble */}
                <div className={cn(
                  "p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-lg",
                  msg.type === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-secondary border border-white/5 text-foreground/70 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                
                {/* Protocol Guide Card */}
                {msg.toolInfo && (
                  <div className="w-full space-y-4 mt-2 animate-in zoom-in duration-500">
                    <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 space-y-6">
                       <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                          <div className="flex items-center gap-3">
                             <CheckCircle2 className="w-4 h-4 text-primary" />
                             <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">{msg.toolInfo.title} Protocol</h4>
                          </div>
                          {pathname !== msg.toolInfo.href && (
                            <Link href={msg.toolInfo.href} className="text-[9px] font-black text-primary uppercase hover:underline">Open Studio</Link>
                          )}
                       </div>
                       
                       <div className="space-y-4">
                          {msg.toolInfo.steps.map((step, i) => (
                            <div key={i} className="flex gap-4 text-[11px] text-foreground/70 leading-snug">
                               <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary shrink-0 border border-primary/20">{i+1}</span>
                               {step}
                            </div>
                          ))}
                       </div>

                       <div className="pt-4 border-t border-primary/10 grid grid-cols-1 gap-4">
                          <div className="flex items-start gap-3">
                             <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                             <p className="text-[10px] text-foreground/50 font-bold uppercase italic"><span className="text-primary not-italic">PRO TIP:</span> {msg.toolInfo.tip}</p>
                          </div>
                          <div className="flex items-start gap-3">
                             <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                             <p className="text-[10px] text-yellow-600/70 font-bold uppercase italic"><span className="text-yellow-600 not-italic">AVOID:</span> {msg.toolInfo.mistake}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {/* Tool Search Results */}
                {msg.links && (
                  <div className="grid grid-cols-1 gap-2 w-full mt-2">
                    {msg.links.map((link) => (
                      <button 
                        key={link.href}
                        onClick={() => {
                          setMessages(prev => [...prev, { 
                            type: 'bot', 
                            content: `Loading ${link.title} guide:`, 
                            toolInfo: link, 
                            id: `guide-${Date.now()}` 
                          }]);
                        }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 group transition-all text-left"
                      >
                         <div className="min-w-0">
                           <p className="text-[11px] font-black uppercase text-foreground truncate">{link.title}</p>
                           <p className="text-[10px] text-foreground/40 truncate">{link.desc}</p>
                         </div>
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all">
                            <List className="w-4 h-4" />
                         </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-white/5 bg-white/[0.02] space-y-4 shrink-0">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {QUICK_CHIPS.map(chip => (
                 <button 
                  key={chip}
                  onClick={() => handleSearch(chip)}
                  className="px-4 py-2 rounded-xl bg-secondary border border-white/5 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary hover:border-primary/20 transition-all whitespace-nowrap"
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
                placeholder="Ask for a job or 'how to'..."
                className="w-full h-14 pl-5 pr-14 rounded-2xl bg-background border border-white/10 text-xs font-medium placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 relative z-10"
               />
               <button 
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-20 z-20"
               >
                 <Send className="w-4 h-4" />
               </button>
            </form>
            
            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-foreground/10 px-1">
               <span className="flex items-center gap-2"><ShieldCheck className="w-2.5 h-2.5" /> Local Intelligence Mode</span>
               <span>ESC TO EXIT</span>
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
