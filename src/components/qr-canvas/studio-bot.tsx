"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  Send, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  ChevronRight,
  Info,
  FileUp,
  FileCheck,
  Heart,
  MicOff,
  Smile,
  Circle,
  Command,
  Monitor,
  QrCode,
  Layers,
  Wand2,
  SquareUser,
  MonitorPlay,
  FileSignature,
  Table,
  FileJson,
  DownloadCloud,
  Activity,
  Mic,
  Unlock,
  ShieldAlert,
  FileText,
  RotateCw,
  FileImage,
  Split,
  FileArchive,
  Files,
  ListFilter,
  User,
  FileStack,
  ArrowRightLeft,
  Clock,
  Lock,
  Youtube,
  Grid2X2,
  LayoutGrid,
  EyeOff,
  AlignLeft,
  Palette,
  Pipette,
  FileEdit,
  ImageIcon,
  Music,
  Film,
  ListMusic,
  Volume2,
  CaseSensitive,
  Grid3X3,
  Repeat,
  FileCode,
  Binary,
  Book,
  Shapes,
  Maximize,
  RefreshCcw,
  Type,
  Braces
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  icon?: any;
}

const TOOLS: Tool[] = [
  { 
    href: '/single', 
    icon: QrCode,
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
    icon: Layers,
    title: 'Bulk Production', 
    desc: 'Generate hundreds of high-res assets in a single batch.', 
    useCase: 'Inventory labels, mass ticketing, or large-scale retail campaigns.',
    keywords: ['bulk', 'batch', 'mass', 'many', 'zip', 'production', 'multiple qr', 'ek sath qr'],
    filesAllowed: 'Text list (URLs)',
    steps: ['Paste your list of URLs or text strings.', 'Configure a unified brand style.', 'Select your desired export format.', 'Initialize the batch rendering engine.', 'Wait for the progress bar to complete.', 'Download the organized ZIP bundle.'],
    tip: 'Use simple styles for bulk to ensure fast processing of thousands of items.',
    mistake: 'Extra empty lines in the list will produce blank assets.',
    output: 'ZIP bundle containing PNG, JPG, or PDF'
  },
  { 
    href: '/json-formatter', 
    icon: Braces,
    title: 'JSON Formatter', 
    desc: 'Pretty-print, minify, and validate JSON data structures.', 
    useCase: 'Beautifying messy JSON code for readability or minifying for production.',
    keywords: ['json', 'format', 'pretty', 'minify', 'clean json', 'validate json'],
    filesAllowed: 'JSON string',
    steps: ['Paste your raw JSON code.', 'Toggle between Pretty and Minify mode.', 'Review the syntax validation.', 'Copy or download the sanitized result.'],
    tip: 'Pretty mode adds a 2-space indentation matrix for maximum technical clarity.',
    mistake: 'Trailing commas or missing brackets will trigger a matrix alignment error.',
    output: '.json file'
  },
  { 
    href: '/regex-tester', 
    icon: Search,
    title: 'Regex Tester', 
    desc: 'Evaluate regular expressions with real-time match identification.', 
    useCase: 'Testing patterns for form validation or data scraping.',
    keywords: ['regex', 'test', 'pattern', 'match', 'eval'],
    filesAllowed: 'Regex pattern string',
    steps: ['Enter your RegExp pattern.', 'Configure flags like Global or Case-Insensitive.', 'Input your test linguistic payload.', 'Review identified matches in the matrix sidebar.'],
    tip: 'The "g" flag is required to identify all occurrences in a multi-line payload.',
    mistake: 'Unescaped special characters in the pattern often lead to unexpected matches.',
    output: 'Match List'
  },
  { 
    href: '/photo-enhance-fix', 
    icon: Wand2, 
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
    icon: SquareUser,
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
    icon: FileText,
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
    icon: FileStack,
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
    icon: FileArchive,
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
    icon: Music,
    title: 'Video to MP3',
    desc: 'Extract high-quality audio tracks from video files.',
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
    icon: User,
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
    icon: Table,
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

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  tools?: Tool[];
  timestamp: number;
}

export function StudioBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimzed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Handshake Complete. I am your Studio Assistant. How can I assist your production workflow today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const processQuery = async (query: string) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 800));

    const lowQuery = query.toLowerCase();
    const foundTools = TOOLS.filter(t => 
      t.keywords.some(k => lowQuery.includes(k)) || 
      t.title.toLowerCase().includes(lowQuery)
    );

    let response = "";
    if (foundTools.length > 0) {
      response = `I have identified ${foundTools.length} clinical tools matching your request. Select a matrix below to initialize production.`;
    } else if (lowQuery.includes('hello') || lowQuery.includes('hi')) {
      response = "Greetings. Studio systems are operational. How can I help you synthesize or convert assets today?";
    } else if (lowQuery.includes('how') && (lowQuery.includes('use') || lowQuery.includes('work'))) {
      response = "Simply select a production unit from the dashboard, import your source payload (file or text), and execute the synthesis protocol. All processing occurs locally for 100% privacy.";
    } else {
      response = "Query unclear. I can assist with QR generation, PDF manipulation, photo enhancement, or technical data conversion. Please specify your target matrix.";
    }

    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: response,
      tools: foundTools.length > 0 ? foundTools : undefined,
      timestamp: Date.now()
    }]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: userMsg,
      timestamp: Date.now()
    }]);

    processQuery(userMsg);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-[2rem] bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Command className="w-7 h-7 icon-3d group-hover:rotate-12 transition-transform" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed right-6 z-[100] flex flex-col transition-all duration-500 ease-out",
      isMinimized ? "bottom-6 h-16 w-64" : "bottom-6 h-[600px] w-[90vw] sm:w-[400px]"
    )}>
      <Card className="h-full border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col bg-[#0a0a0c]/95 backdrop-blur-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
              <Command className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Studio Assistant</h4>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter">System Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={() => setIsMinimzed(!isMinimized)} className="h-8 w-8 text-white/20 hover:text-white rounded-lg">
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
             </Button>
             <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white/20 hover:text-destructive rounded-lg">
                <X className="w-3.5 h-3.5" />
             </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
               {messages.map((msg) => (
                 <div key={msg.id} className={cn(
                   "flex flex-col gap-3 animate-in slide-in-from-bottom-2 duration-300",
                   msg.role === 'user' ? "items-end" : "items-start"
                 )}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-[12px] font-medium leading-relaxed shadow-lg",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-secondary border border-white/5 text-foreground/70 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>

                    {msg.tools && (
                      <div className="w-full space-y-3 pt-2">
                        {msg.tools.map((tool) => (
                          <button 
                            key={tool.href}
                            onClick={() => { setIsOpen(false); window.location.href = tool.href; }}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all text-left group"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                   {tool.icon ? <tool.icon className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                </div>
                                <span className="text-[10px] font-black uppercase text-foreground/60 group-hover:text-foreground">{tool.title}</span>
                             </div>
                             <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    )}
                 </div>
               ))}
               {isTyping && (
                 <div className="flex justify-start">
                    <div className="bg-secondary p-4 rounded-2xl rounded-tl-none flex gap-1">
                       <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                 </div>
               )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-secondary/30 border-t border-white/5 shrink-0">
               <form onSubmit={handleSubmit} className="relative">
                  <input 
                    type="text"
                    placeholder="Ask about tools..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full h-12 pl-5 pr-12 bg-background border border-white/10 rounded-xl text-xs font-medium focus:ring-primary/40 focus:border-primary/50 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </form>
               <div className="mt-4 flex items-center justify-center gap-4">
                  <p className="text-[8px] font-black text-foreground/10 uppercase tracking-[0.3em]">Hardware Encrypted Loop</p>
               </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}