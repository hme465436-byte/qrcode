
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
  FileCheck,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Tool {
  href: string;
  title: string;
  desc: string;
  useCase: string;
  keywords: string[];
  filesAllowed: string;
  steps: string[];
  tip: string;
  mistake: string;
  output: string;
}

const TOOLS: Tool[] = [
  { 
    href: '/single', 
    title: 'Single Studio', 
    desc: 'Design a premium, branded QR code with custom logos and AI backgrounds.', 
    useCase: 'Branding for business cards, social media, or high-end marketing.',
    keywords: ['qr', 'generator', 'logo', 'brand', 'scan', 'create qr', 'barcode', 'website qr', 'qr code maker'],
    filesAllowed: 'JPG, PNG, WebP (for logo)',
    steps: ['Enter your target URL or Text content.', 'Select a technical style for dots and eyes.', 'Upload your brand logo for the center.', 'Generate an AI background using a text prompt.', 'Adjust opacity for scannability.', 'Preview the real-time matrix.', 'Download as high-res PNG or SVG.'],
    tip: 'Keep the background opacity below 30% for best scan reliability.',
    mistake: 'Dark QR colors on dark backgrounds create unreadable matrices.',
    output: 'PNG, JPG, SVG, PDF'
  },
  { 
    href: '/bulk', 
    title: 'Bulk Production', 
    desc: 'Generate hundreds of high-res QR assets in a single batch.', 
    useCase: 'Inventory labels, mass ticketing, or large-scale retail campaigns.',
    keywords: ['bulk', 'batch', 'mass', 'many', 'zip', 'production', 'multiple qr', 'ek sath qr'],
    filesAllowed: 'Text list (URLs)',
    steps: ['Paste your list of URLs or text strings.', 'Configure a unified brand style.', 'Select your desired export format.', 'Initialize the batch rendering engine.', 'Wait for the progress bar to complete.', 'Download the organized ZIP bundle.'],
    tip: 'Use simple styles for bulk to ensure fast processing of thousands of items.',
    mistake: 'Extra empty lines in the list will produce blank assets.',
    output: 'ZIP bundle containing PNG, JPG, or PDF'
  },
  { 
    href: '/photo-enhance-fix', 
    title: 'Photo Enhance / Pixel Fix', 
    desc: 'Hardware-accelerated restoration and resolution upscaling.', 
    useCase: 'Restoring old photos, sharpening blurry captures, or upscaling small icons.',
    keywords: ['enhance', 'fix', 'pixel', 'upscale', 'quality', 'restore', 'blur', 'saaf', 'clear', 'blurry', 'hq', 'resolution', 'photo fix'],
    filesAllowed: 'JPG, PNG, WebP',
    steps: ['Import your low-resolution visual.', 'Select an upscale level (2x or 4x).', 'Adjust Contrast and Clarity sliders.', 'Use "Denoise" to remove grain.', 'Verify with the Before/After slider.', 'Click Generate to process the matrix.', 'Export the high-fidelity master.'],
    tip: 'Restore edges using "Sharpness" only after applying "Denoise".',
    mistake: 'Over-sharpening low-quality JPGs creates visible digital halos.',
    output: 'High-Res PNG or JPG'
  },
  { 
    href: '/passport-photo-maker', 
    title: 'Passport Photo Maker', 
    desc: 'Official ID photo production with A4 sheet synthesis.', 
    useCase: 'Creating visa, passport, or identity photos for government forms.',
    keywords: ['passport', 'id', 'visa', 'print', '35x45', 'photo', 'identity', '2x2', 'form photo', 'government', 'shakal'],
    filesAllowed: 'Portrait Photo (JPG/PNG)',
    steps: ['Upload a clear front-facing portrait.', 'Align your eyes with the horizontal guide.', 'Fit your head within the provided oval matrix.', 'Select your target country size preset.', 'Adjust brightness for official standards.', 'Select sheet density (e.g., 8-up on A4).', 'Download as individual PNG or printable PDF.'],
    tip: 'Standard white backgrounds are required for almost all official visas.',
    mistake: 'Tilted heads or shadows on the face often lead to document rejection.',
    output: 'Print-ready A4 PDF or PNG'
  },
  { 
    href: '/ocr', 
    title: 'OCR Extraction', 
    desc: 'Optical analysis for converting images into editable text.', 
    useCase: 'Copying notes from photos, extracting info from receipts or signs.',
    keywords: ['ocr', 'text', 'extract', 'read', 'scan', 'image', 'saaf text', 'copy from photo', 'likha hua'],
    filesAllowed: 'Photo of text (JPG/PNG)',
    steps: ['Upload a photo containing legible text.', 'Select the primary language of the text.', 'Increase "Contrast Boost" if the text is faint.', 'Initialize the Tesseract engine.', 'Wait for the linguistic decoding.', 'Review and edit the text in the output box.', 'Copy or download the text matrix.'],
    tip: 'Printed text is nearly 100% accurate; handwriting requires high contrast.',
    mistake: 'Scanning at an angle or in low light reduces identification accuracy.',
    output: 'Plain Text (.txt)'
  },
  { 
    href: '/pdf-merger', 
    title: 'PDF Merger', 
    desc: 'Unify multiple PDF documents into a single master file.', 
    useCase: 'Combining separate reports, invoices, or project documents.',
    keywords: ['merge', 'join', 'combine', 'stack', 'ek sath', 'joren', 'unity', 'pdf join'],
    filesAllowed: 'Multiple PDF files',
    steps: ['Upload all PDF documents you wish to unify.', 'Use the arrow buttons to set the page order.', 'Review the total file size projection.', 'Click "Merge Documents" to start synthesis.', 'Download the combined master PDF.'],
    tip: 'You can merge up to 20 files at once in the browser sandbox.',
    mistake: 'Encrypted or password-protected PDFs cannot be merged directly.',
    output: 'Single Unified PDF'
  },
  { 
    href: '/pdf-compressor', 
    title: 'PDF Compressor', 
    desc: 'Optimize and shrink heavy PDF documents locally.', 
    useCase: 'Meeting upload limits for job applications or email attachments.',
    keywords: ['compress', 'smaller', 'shrink', 'size', 'optimize', 'kb', 'chhota', 'kam', 'pdf size'],
    filesAllowed: 'Large PDF files',
    steps: ['Import your large PDF document.', 'Select compression intensity (Standard/Intensive).', 'Observe the real-time WASM processing.', 'Check the final reduction percentage.', 'Download the optimized smaller version.'],
    tip: 'Standard mode preserves 100% legibility for standard text docs.',
    mistake: 'Intensive compression can slightly blur highly detailed diagrams.',
    output: 'Optimized Small-size PDF'
  },
  {
    href: '/video-to-audio',
    title: 'Video to MP3',
    desc: 'Extract high-fidelity audio tracks from video files.',
    useCase: 'Converting music videos to songs or extracting speech from clips.',
    keywords: ['mp3', 'video to audio', 'song extract', 'audio extract', 'mp4 to mp3', 'video se gaana'],
    filesAllowed: 'MP4, WEBM, MOV',
    steps: ['Import your video container.', 'Select your desired start and end times.', 'Choose target format (MP3/AAC/WAV).', 'Select bitrate (192k standard, 320k high).', 'Execute the binary extraction.', 'Download the sanitized audio master.'],
    tip: 'Use 320k bitrate for the best instrumental quality.',
    mistake: 'Trimming very long segments (>20m) can exceed browser memory.',
    output: 'Audio File (MP3/WAV/AAC)'
  },
  {
    href: '/whatsapp-dp-maker',
    title: 'WhatsApp DP Maker',
    desc: 'Create high-resolution profile pictures without cropping.',
    useCase: 'Making rectangular photos fit perfectly in WhatsApp circles.',
    keywords: ['whatsapp dp', 'profile pic', 'dp maker', 'no crop', 'hd profile', 'dp chhota'],
    filesAllowed: 'JPG, PNG, WebP',
    steps: ['Upload your portrait or landscape photo.', 'Select "Atmospheric Blur" for the background.', 'Position your image using the drag tools.', 'Ensure the focal point is within the circular guide.', 'Export as a 1080px HD master.'],
    tip: 'Blur background looks more professional than solid colors.',
    mistake: 'Leaving the subject outside the circular safe-zone results in a cut-off DP.',
    output: '1080x1080 PNG'
  },
  {
    href: '/csv-to-json',
    title: 'CSV to JSON',
    desc: 'Professional data translation for developers.',
    useCase: 'Converting Excel data for web app integration.',
    keywords: ['csv to json', 'excel to json', 'data convert', 'parse csv'],
    filesAllowed: 'CSV, TXT',
    steps: ['Paste your CSV data or upload a file.', 'System auto-detects the delimiter.', 'Toggle "Has Headers" if Row 1 contains keys.', 'Click Process to generate the JSON array.', 'Copy the sanitized code.'],
    tip: 'Ensure your CSV has consistent columns for a clean JSON array.',
    mistake: 'Mismatched delimiters (commas vs semicolons) will break the matrix.',
    output: 'JSON Array Code'
  }
];

const SUGGESTED_QUESTIONS = [
  "How to compress PDF?",
  "Make passport photo",
  "Convert photo to text",
  "Shrink image size",
  "Join PDF files"
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

  // Auto-detect current tool on mount or page change
  useEffect(() => {
    if (isOpen && messages.length <= 1) {
      const currentTool = TOOLS.find(t => t.href === pathname);
      if (currentTool) {
        setMessages([{ 
          type: 'bot', 
          content: `Welcome to **${currentTool.title}**. Here is the Master Protocol for this studio:`,
          toolInfo: currentTool,
          id: 'context-init' 
        }]);
        setLastTool(currentTool);
      }
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
    setMessages(prev => [...prev, { type: 'user', content: userMsg, id: Date.now().toString() }].slice(-8));
    setQuery('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 400));

    const lowQuery = userMsg.toLowerCase();
    
    // Detailed follow-up detection
    const isDetailReq = lowQuery.match(/(how|step|detail|tarika|more|guide|instruction|steps)/);
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

    // Semantic Intent Discovery
    const queryWords = lowQuery.split(/\s+/).filter(k => k.length > 1);
    const results = TOOLS.map(tool => {
      let score = 0;
      const searchable = `${tool.title} ${tool.desc} ${tool.useCase} ${tool.keywords.join(' ')}`.toLowerCase();
      queryWords.forEach(word => {
        if (searchable.includes(word)) score++;
        if (tool.title.toLowerCase().includes(word)) score += 2;
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
          ? `I identified the **${results[0].title}** in the registry. Review the production protocol:` 
          : `I found these matching tools for your request:`,
        links: results,
        toolInfo: results.length === 1 ? results[0] : undefined,
        id: `match-${Date.now()}`
      }].slice(-8));
    } else {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'This specific tool is not on My Kit Tool yet. I only have access to the internal studio registry.',
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

  const handleClear = () => {
    setMessages([{ type: 'bot', content: 'Studio buffer reset. How can I assist you?', id: 'reset' }]);
    setLastTool(null);
    toast({ title: "Memory Purged", description: "Studio session buffer cleared." });
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
          <button onClick={handleClear} className="w-8 h-8 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-destructive transition-all flex items-center justify-center">
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
                "flex flex-col gap-3 max-w-[95%] animate-in fade-in slide-in-from-bottom-2 duration-300",
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
                       
                       <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">Studio Use Case</p>
                          <p className="text-[11px] text-foreground/60 leading-relaxed font-medium italic">"{msg.toolInfo.useCase}"</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30 flex items-center gap-1.5"><FileUp className="w-2.5 h-2.5" /> Input</p>
                             <p className="text-[10px] font-bold text-foreground/60 leading-tight uppercase">{msg.toolInfo.filesAllowed}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-foreground/30 flex items-center gap-1.5"><FileCheck className="w-2.5 h-2.5" /> Output</p>
                             <p className="text-[10px] font-bold text-foreground/60 leading-tight uppercase">{msg.toolInfo.output}</p>
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
                             <p className="text-[10px] text-foreground/50 font-bold leading-relaxed uppercase">
                               <span className="text-primary font-black">TIP:</span> {msg.toolInfo.tip}
                             </p>
                          </div>
                          <div className="flex items-start gap-3">
                             <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                             <p className="text-[10px] text-yellow-600/70 font-bold leading-relaxed uppercase">
                               <span className="text-yellow-600 font-black">AVOID:</span> {msg.toolInfo.mistake}
                             </p>
                          </div>
                       </div>

                       {pathname !== msg.toolInfo.href && (
                          <Button asChild className="w-full h-12 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30">
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
                        className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 group transition-all text-left shadow-lg"
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

          {/* Input Area */}
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
                placeholder="Job description or 'how to'..."
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
               <span className="flex items-center gap-2"><ShieldCheck className="w-2.5 h-2.5" /> Local Privacy Engine</span>
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
