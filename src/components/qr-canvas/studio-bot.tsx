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
  AlertCircle,
  Loader2,
  List,
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
  FileUp,
  FileCheck
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
  input: string;
  output: string;
}

const TOOLS: Tool[] = [
  { 
    href: '/single', 
    title: 'Single Studio', 
    desc: 'Branded QR codes with logos and AI backgrounds.', 
    keywords: ['qr', 'generator', 'logo', 'brand', 'scan', 'create qr', 'barcode', 'website qr'],
    steps: ['Enter your target URL or Text content.', 'Select a technical style for dots and corners.', 'Upload your brand logo for the center.', 'Generate an AI background using a prompt.', 'Export as high-res PNG or SVG.'],
    tip: 'Keep the background opacity below 30% for best scan reliability.',
    mistake: 'Using a dark QR color on a dark background makes it unreadable.',
    input: 'URL link or Plain Text',
    output: 'High-res PNG, JPG, SVG, or PDF'
  },
  { 
    href: '/bulk', 
    title: 'Bulk Production', 
    desc: 'Generate hundreds of QR assets in seconds.', 
    keywords: ['bulk', 'batch', 'mass', 'many', 'zip', 'production', 'multiple qr'],
    steps: ['Paste your list of URLs (one per line).', 'Select your unified brand style.', 'Choose your export format (PNG/PDF).', 'Click "Export ZIP Bundle".'],
    tip: 'Great for inventory labels or mass marketing campaigns.',
    mistake: 'Empty lines in your list will generate blank placeholder QR codes.',
    input: 'Text list (one item per line)',
    output: 'Organized ZIP archive of assets'
  },
  { 
    href: '/photo-enhance-fix', 
    title: 'Photo Enhance / Pixel Fix', 
    desc: 'Upscale resolution and sharpen photo clarity.', 
    keywords: ['enhance', 'fix', 'pixel', 'upscale', 'quality', 'restore', 'blur', 'saaf', 'clear', 'blurry', 'hq', 'resolution'],
    steps: ['Import your low-res or blurry photo.', 'Select an Upscale level (2x or 4x).', 'Adjust Contrast and Sharpness sliders.', 'Use the Before/After slider to verify results.', 'Download the restored master.'],
    tip: 'Use "Denoise" first to smooth grains before sharpening edges.',
    mistake: 'Over-sharpening can introduce digital "halo" artifacts around objects.',
    input: 'Low-res or blurry JPG/PNG',
    output: 'Upscaled High-Fidelity Master'
  },
  { 
    href: '/passport-photo-maker', 
    title: 'Passport Photo', 
    desc: 'Create official ID photos and printable sheets.', 
    keywords: ['passport', 'id', 'visa', 'print', '35x45', 'photo', 'identity', '2x2', 'form photo', 'government'],
    steps: ['Upload a front-facing portrait.', 'Align your eyes with the horizontal guide line.', 'Ensure the head fits inside the oval matrix.', 'Select your target country size (e.g. PK/UK/US).', 'Download as a single PNG or A4 Print Sheet.'],
    tip: 'A white or light blue background is required for most official visas.',
    mistake: 'Tilting your head or looking away from the camera will cause rejection.',
    input: 'Front-facing portrait photo',
    output: 'Print-ready A4 PDF or individual PNG'
  },
  { 
    href: '/ocr', 
    title: 'OCR Extraction', 
    desc: 'Identify and extract text from images.', 
    keywords: ['ocr', 'text', 'extract', 'read', 'scan', 'image', 'saaf text', 'copy from photo'],
    steps: ['Upload an image of a document or sign.', 'Select the primary language.', 'Boost contrast if the text is faint.', 'Click "Extract Matrix".', 'Copy the decoded text from the output box.'],
    tip: 'Clean, printed text has nearly 100% accuracy; handwriting is limited.',
    mistake: 'Low light or blurry captures significantly reduce character recognition.',
    input: 'Photo of document or screen',
    output: 'Editable Plain Text'
  },
  { 
    href: '/pdf-merger', 
    title: 'PDF Merger', 
    keywords: ['merge', 'join', 'combine', 'stack', 'ek sath', 'joren', 'unity'],
    desc: 'Combine multiple PDF files into one.', 
    steps: ['Upload all the PDF files you want to join.', 'Drag and drop rows to set the page sequence.', 'Click "Merge Documents".', 'Download the unified PDF master.'],
    tip: 'You can merge up to 20 documents in a single production cycle.',
    mistake: 'Trying to merge password-protected PDFs without unlocking them first.',
    input: 'Multiple PDF documents',
    output: 'Single Unified PDF Master'
  },
  { 
    href: '/pdf-compressor', 
    title: 'PDF Compressor', 
    desc: 'Shrink PDF file size locally in your browser.', 
    keywords: ['compress', 'smaller', 'shrink', 'size', 'optimize', 'kb', 'chhota', 'kam', 'pdf size'],
    steps: ['Import your heavy PDF document.', 'Select a compression level (Eco/Standard/Intensive).', 'Wait for the WASM engine to re-matrix the file.', 'Check the reduction percentage.', 'Download the optimized version.'],
    tip: 'The "Standard" mode offers the best balance of size and legibility.',
    mistake: 'Intensive compression may slightly blur small technical diagrams.',
    input: 'Large PDF document',
    output: 'Optimized Small-size PDF'
  },
  { 
    href: '/logo-maker', 
    title: 'Logo Text Studio', 
    desc: 'Generate premium text-based brand identities.', 
    keywords: ['logo', 'text', 'brand', 'avatar', 'identity', 'design', 'name', 'business name'],
    steps: ['Enter your brand name and tagline.', 'Browse and select a typographic profile.', 'Adjust letter spacing and font size.', 'Add a geometric symbol or badge container.', 'Export as a high-res 1024px PNG.'],
    tip: 'Use the "Randomize" button to discover unique design combinations.',
    mistake: 'Choosing similar colors for text and background kills brand visibility.',
    input: 'Brand Name and Tagline',
    output: '1024px Transparent/Solid PNG'
  },
  {
    href: '/image-compressor',
    title: 'Image Compressor',
    desc: 'Reduce photo file size locally.',
    keywords: ['kb kam', 'compress image', 'smaller photo', 'photo size', 'low size'],
    steps: ['Import your high-res JPG or PNG.', 'Adjust Quality (70-80% is recommended).', 'Set Max Width for extra reduction.', 'Download the optimized asset.'],
    tip: 'JPG format usually compresses better than PNG for photos.',
    mistake: 'Going below 30% quality will cause significant pixel artifacts.',
    input: 'High-res JPG/PNG/WebP',
    output: 'Optimized Low-size Image'
  },
  {
    href: '/video-to-audio',
    title: 'Video to MP3',
    desc: 'Extract audio tracks from video files.',
    keywords: ['mp3', 'video to audio', 'song extract', 'audio extract', 'mp4 to mp3'],
    steps: ['Import your video file (MP4/WebM).', 'Select target format (MP3/AAC/WAV).', 'Choose bitrate (192k is standard).', 'Download the audio master.'],
    tip: 'Use 320k bitrate for the highest fidelity audio extraction.',
    mistake: 'Trimming very long videos may hit browser memory limits.',
    input: 'Video file (MP4/WebM)',
    output: 'High-quality Audio file'
  }
];

const SUGGESTED_QUESTIONS = [
  "How do I use this tool?",
  "I need to compress a PDF",
  "How to make a logo?",
  "Convert photo to text",
  "Make passport photo"
];

export function StudioBot() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [query, setQuery] = useState('');
  const [lastTool, setLastTool] = useState<Tool | null>(null);
  const [messages, setMessages] = useState<{ 
    type: 'user' | 'bot', 
    content: string, 
    links?: Tool[], 
    toolInfo?: Tool, 
    id: string 
  }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-detect current page context
  useEffect(() => {
    const currentTool = TOOLS.find(t => t.href === pathname);
    if (currentTool && isOpen && messages.length <= 1) {
      setMessages([{ 
        type: 'bot', 
        content: `I see you are in the **${currentTool.title}**. Here is the Master Protocol for this studio:`,
        toolInfo: currentTool,
        id: 'context-init' 
      }]);
      setLastTool(currentTool);
    }
  }, [pathname, isOpen]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        type: 'bot', 
        content: 'I am your PRO Studio Assistant. Tell me what job you need to finish or ask "how to use" a tool.',
        id: 'init' 
      }]);
    }
  }, []);

  // Keyboard Protocol
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
  }, [messages, isTyping]);

  const handleSearch = async (input: string) => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const nextMsg = { type: 'user' as const, content: userMsg, id: Date.now().toString() };
    setMessages(prev => [...prev, nextMsg].slice(-8));
    setQuery('');
    setIsTyping(true);

    // Typing Simulation Protocol
    await new Promise(r => setTimeout(r, 300));

    const lowQuery = userMsg.toLowerCase();
    
    // Follow-up Logic: "how", "steps", "detail"
    const isDetailReq = lowQuery.match(/(how|step|detail|kese|tarika|more)/);
    if (isDetailReq && lastTool) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Loading full **Master Protocol** for ${lastTool.title}:`,
        toolInfo: lastTool,
        id: `detail-${Date.now()}`
      }].slice(-8));
      setIsTyping(false);
      return;
    }

    // Semantic Intent Matrix
    const queryWords = lowQuery.split(/\s+/).filter(k => k.length > 1);
    const results = TOOLS.map(tool => {
      let score = 0;
      const toolText = `${tool.title} ${tool.desc} ${tool.keywords.join(' ')}`.toLowerCase();
      queryWords.forEach(word => {
        if (toolText.includes(word)) score++;
        if (tool.title.toLowerCase().includes(word)) score += 2;
        // Intent mappings
        if ((word === 'chhota' || word === 'kam' || word === 'size') && tool.keywords.includes('kam')) score += 1;
        if ((word === 'saaf' || word === 'clear' || word === 'blur') && tool.keywords.includes('saaf')) score += 1;
      });
      return { tool, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.tool);

    if (results.length > 0) {
      setLastTool(results[0]);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: results.length === 1 
          ? `I identified the **${results[0].title}** for your job. Review the protocol:` 
          : `I identified these tools in the registry. Which one matches your requirement?`,
        links: results,
        toolInfo: results.length === 1 ? results[0] : undefined,
        id: `match-${Date.now()}`
      }].slice(-8));
    } else {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'This tool is not on My Kit Tool yet. I only have access to internal studio protocols.',
        id: `none-${Date.now()}` 
      }].slice(-8));
    }
    
    setIsTyping(false);
  };

  const copySteps = (tool: Tool) => {
    const text = `PRO Protocol: ${tool.title}\n\nSteps:\n${tool.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\nTip: ${tool.tip}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Protocol Copied", description: "Instructions saved to clipboard." });
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
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-0 right-0 lg:bottom-6 lg:right-6 w-full lg:w-[420px] bg-[#0a0a0c] border-t lg:border border-white/10 lg:rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] z-[100] flex flex-col overflow-hidden transition-all duration-500",
      isMinimized ? "h-[76px]" : "h-[680px] max-h-[90vh]"
    )}>
      {/* Bot Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Bot className="w-5 h-5 icon-3d" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Assistant PRO</h4>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Protocol Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setMessages([]); handleClear(); }} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-destructive transition-all flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-primary transition-all flex items-center justify-center">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-destructive transition-all flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-checkered">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex flex-col gap-3 max-w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-300",
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
                    <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 space-y-6 shadow-xl">
                       <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                          <div className="flex items-center gap-3">
                             <CheckCircle2 className="w-4 h-4 text-primary" />
                             <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">{msg.toolInfo.title}</h4>
                          </div>
                          <button onClick={() => copySteps(msg.toolInfo!)} className="text-foreground/20 hover:text-primary transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30 flex items-center gap-1.5"><FileUp className="w-2.5 h-2.5" /> Input</p>
                             <p className="text-[10px] font-bold text-foreground/60 leading-tight">{msg.toolInfo.input}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30 flex items-center gap-1.5"><FileCheck className="w-2.5 h-2.5" /> Output</p>
                             <p className="text-[10px] font-bold text-foreground/60 leading-tight">{msg.toolInfo.output}</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest">Master Workflow</p>
                          {msg.toolInfo.steps.map((step, i) => (
                            <div key={i} className="flex gap-4 text-[11px] text-foreground/70 leading-snug group/step">
                               <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary shrink-0 border border-primary/20 group-hover/step:scale-110 transition-transform">{i+1}</span>
                               {step}
                            </div>
                          ))}
                       </div>

                       <div className="pt-4 border-t border-primary/10 space-y-4">
                          <div className="flex items-start gap-3">
                             <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                             <p className="text-[10px] text-foreground/50 font-bold leading-relaxed uppercase italic">
                               <span className="text-primary not-italic font-black">TIP:</span> {msg.toolInfo.tip}
                             </p>
                          </div>
                          <div className="flex items-start gap-3">
                             <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                             <p className="text-[10px] text-yellow-600/70 font-bold leading-relaxed uppercase italic">
                               <span className="text-yellow-600 not-italic font-black">AVOID:</span> {msg.toolInfo.mistake}
                             </p>
                          </div>
                       </div>

                       {pathname !== msg.toolInfo.href && (
                          <Button asChild className="w-full h-12 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                             <Link href={msg.toolInfo.href}>Initialize Studio <ArrowRight className="w-3.5 h-3.5 ml-2" /></Link>
                          </Button>
                       )}
                    </div>
                  </div>
                )}

                {/* Multiple Options List */}
                {msg.links && !msg.toolInfo && (
                  <div className="grid grid-cols-1 gap-2 w-full mt-2">
                    {msg.links.map((link) => (
                      <button 
                        key={link.href}
                        onClick={() => {
                          setMessages(prev => [...prev, { 
                            type: 'bot', 
                            content: `Opening ${link.title} Master Protocol:`, 
                            toolInfo: link, 
                            id: `guide-${Date.now()}` 
                          }]);
                          setLastTool(link);
                        }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 group transition-all text-left"
                      >
                         <div className="min-w-0">
                           <p className="text-[11px] font-black uppercase text-foreground truncate">{link.title}</p>
                           <p className="text-[10px] text-foreground/40 truncate">{link.desc}</p>
                         </div>
                         <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 p-4 bg-secondary rounded-2xl rounded-tl-none w-20 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              </div>
            )}
          </div>

          {/* Input Interface */}
          <div className="p-5 border-t border-white/5 bg-white/[0.02] space-y-4 shrink-0">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {SUGGESTED_QUESTIONS.map(q => (
                 <button 
                  key={q}
                  onClick={() => handleSearch(q)}
                  className="px-4 py-2 rounded-xl bg-secondary border border-white/5 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary hover:border-primary/20 transition-all whitespace-nowrap"
                 >
                   {q}
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
                disabled={!query.trim() || isTyping}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-20 z-20"
               >
                 <Send className="w-4 h-4 icon-3d" />
               </button>
            </form>
            
            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-foreground/10 px-1">
               <span className="flex items-center gap-2"><ShieldCheck className="w-2.5 h-2.5" /> Local Intelligence Engine</span>
               <span>ESC TO EXIT</span>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, rgba(255,255,255,0.005) 25%, transparent 25%), 
                            linear-gradient(-45deg, rgba(255,255,255,0.005) 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.005) 75%), 
                            linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.005) 75%);
          background-size: 20px 20px;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const handleClear = () => {
  // Logic handled in component to preserve state
};
