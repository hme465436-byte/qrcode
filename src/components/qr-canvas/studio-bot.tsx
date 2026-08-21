"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  X, 
  Send, 
  ArrowRight, 
  Loader2,
  QrCode,
  Layers,
  Wand2,
  SquareUser,
  Table,
  FileJson,
  FileText,
  FileStack,
  FileArchive,
  Music,
  User,
  Search,
  Zap,
  Braces,
  Bot,
  RotateCw,
  RefreshCcw,
  Maximize,
  Lock,
  Pipette,
  Palette,
  FileEdit,
  MicOff,
  ListMusic,
  CaseSensitive,
  Grid3X3,
  Repeat,
  FileCode,
  Binary,
  Info,
  Type,
  Split,
  MonitorPlay,
  DownloadCloud,
  Mic,
  Activity,
  Target,
  ShieldCheck,
  Smartphone,
  Monitor,
  Terminal,
  ShieldAlert,
  Save,
  ImageIcon,
  FileImage,
  Film,
  Volume2,
  LayoutGrid,
  Grid2X2,
  Youtube,
  KeyRound,
  Compass,
  Languages,
  BadgeCheck,
  CheckCircle2,
  RotateCcw,
  Clock,
  History,
  TrendingUp,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Tool {
  href: string;
  title: string;
  keywords: string[];
  icon: any;
  desc?: string;
}

const TOOLS: Tool[] = [
  { href: '/single', title: 'Single Studio', icon: QrCode, keywords: ['qr', 'generator', 'code', 'brand'], desc: 'Branded QR codes.' },
  { href: '/bulk', title: 'Bulk Mode', icon: Layers, keywords: ['bulk', 'batch', 'many'], desc: 'Mass QR production.' },
  { href: '/url-shortener', title: 'URL Shortener', icon: LinkIcon, keywords: ['url', 'short', 'tiny', 'link'], desc: 'Compress long URLs.' },
  { href: '/json-formatter', title: 'JSON Formatter', icon: Braces, keywords: ['json', 'format', 'pretty'], desc: 'Clean JSON data.' },
  { href: '/regex-tester', title: 'Regex Test', icon: Search, keywords: ['regex', 'test', 'pattern'], desc: 'Regex evaluator.' },
  { href: '/photo-enhance-fix', title: 'Photo Enhance', icon: Wand2, keywords: ['upscale', 'fix', 'quality'], desc: 'Fix blurry photos.' },
  { href: '/passport-photo-maker', title: 'Passport Photo', icon: SquareUser, keywords: ['passport', 'visa', 'id'], desc: 'Official ID photos.' },
  { href: '/ocr', title: 'Photo to Text', icon: FileText, keywords: ['ocr', 'text', 'read', 'photo to text'], desc: 'Image to text.' },
  { href: '/pdf-merger', title: 'PDF Merger', icon: FileStack, keywords: ['merge', 'pdf', 'combine'], desc: 'Join PDF files.' },
  { href: '/pdf-compressor', title: 'PDF Compressor', icon: FileArchive, keywords: ['compress', 'pdf', 'small'], desc: 'Shrink PDF size.' },
  { href: '/video-to-audio', title: 'Video to MP3', icon: Music, keywords: ['mp3', 'extract', 'audio'], desc: 'Video sound ripper.' },
  { href: '/whatsapp-dp-maker', title: 'WhatsApp DP', icon: User, keywords: ['dp', 'whatsapp', 'profile'], desc: 'Profile pic creator.' },
  { href: '/csv-to-json', title: 'CSV to JSON', icon: Table, keywords: ['csv', 'excel', 'convert'], desc: 'Data translation.' },
  { href: '/json-to-csv', title: 'JSON to CSV', icon: FileJson, keywords: ['json', 'csv', 'convert'], desc: 'Data deconstruction.' },
  { href: '/logo-maker', title: 'Logo Maker', icon: Type, keywords: ['logo', 'text', 'brand'], desc: 'Typography logos.' },
  { href: '/pdf-rotator', title: 'PDF Rotator', icon: RotateCw, keywords: ['rotate', 'pdf', 'fix'], desc: 'Fix PDF orientation.' },
  { href: '/word-to-pdf', title: 'Word to PDF', icon: FileText, keywords: ['word', 'docx', 'pdf'], desc: 'Docx to PDF.' },
  { href: '/pdf-splitter', title: 'PDF Splitter', icon: Split, keywords: ['split', 'pdf', 'pages'], desc: 'Separate PDF pages.' },
  { href: '/file-compressor', title: 'File Compressor', icon: FileArchive, keywords: ['file', 'compress', 'zip'], desc: 'Reduce file size.' },
  { href: '/password-generator', title: 'Password Gen', icon: Lock, keywords: ['password', 'secure', 'random'], desc: 'Strong passwords.' },
  { href: '/color-picker', title: 'Color Picker', icon: Pipette, keywords: ['color', 'pick', 'hex'], desc: 'Image color sampler.' },
  { href: '/rgb-picker', title: 'RGB Studio', icon: Palette, keywords: ['rgb', 'hex', 'cmyk'], desc: 'Color space tool.' },
  { href: '/markdown-preview', title: 'Markdown', icon: FileEdit, keywords: ['md', 'markdown', 'html'], desc: 'Live MD editor.' },
  { href: '/image-converter', title: 'Img Converter', icon: RefreshCcw, keywords: ['jpg', 'png', 'convert'], desc: 'Format switcher.' },
  { href: '/image-resizer', title: 'Img Resizer', icon: Maximize, keywords: ['resize', 'size', 'px'], desc: 'Change dimensions.' },
  { href: '/vocal-separator', title: 'Vocal Remover', icon: MicOff, keywords: ['vocal', 'karaoke', 'music'], desc: 'Isolate or remove voice.' },
  { href: '/audio-joiner', title: 'Audio Joiner', icon: ListMusic, keywords: ['audio', 'merge', 'join'], desc: 'Combine MP3 tracks.' },
  { href: '/audio-booster', title: 'Volume Booster', icon: Volume2, keywords: ['louder', 'gain', 'amplify'], desc: 'Boost audio volume.' },
  { href: '/letter-art', title: 'Letter Art', icon: CaseSensitive, keywords: ['ascii', 'text art', 'letter'], desc: 'Img to text art.' },
  { href: '/dot-art', title: 'Dot Art', icon: Grid3X3, keywords: ['braille', 'dots', 'art'], desc: 'Img to dots.' },
  { href: '/repeater', title: 'Text Repeater', icon: Repeat, keywords: ['repeat', 'multiply', 'spam'], desc: 'Multiply text.' },
  { href: '/hex-converter', title: 'Hex Converter', icon: FileCode, keywords: ['hex', 'binary', 'dump'], desc: 'Binary to hex.' },
  { href: '/code-converter', title: 'AOB Converter', icon: Binary, keywords: ['aob', 'code', 'pattern'], desc: 'AOB conversion.' },
  { href: '/dictionary', title: 'Dictionary', icon: Info, keywords: ['meaning', 'word', 'dict'], desc: 'English word search.' },
  { href: '/image-url-downloader', title: 'URL Downloader', icon: DownloadCloud, keywords: ['extract', 'save image', 'scrape'], desc: 'URL image ripper.' },
  { href: '/speaker-tester', title: 'Speaker Tester', icon: Activity, keywords: ['audio', 'left right', 'frequency'], desc: 'Audio hardware test.' },
  { href: '/mic-tester', title: 'Mic Tester', icon: Mic, keywords: ['microphone', 'record', 'input'], desc: 'Mic hardware test.' },
  { href: '/live-wallpaper', title: 'Live Wallpaper', icon: MonitorPlay, keywords: ['video', 'loop', 'pc', 'phone'], desc: 'Create live loops.' },
  { href: '/image-to-link', title: 'Image to Link', icon: LinkIcon, keywords: ['host', 'imgur', 'share', 'upload'], desc: 'Image link maker.' },
  { href: '/telegram-file-host', title: 'FILE HOST', icon: MessageCircle, keywords: ['host', 'upload', 'cloud', 'archive'], desc: 'Cloud file archival.' },
];

const QUICK_CHIPS = ["PDF tools", "Image tools", "How to use"];

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  toolHrefs?: string[];
}

const STORAGE_KEY = 'mykit_chat_history_v3';

function RobotSVG({ className }: { className?: string }) {
  return (
    <div className={cn("relative pointer-events-none select-none drop-shadow-xl", className)}>
      <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
        {/* Shadow */}
        <ellipse cx="32" cy="55" rx="12" ry="3" fill="black" opacity="0.1" />
        
        {/* Head Box */}
        <rect x="14" y="16" width="36" height="32" rx="10" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.2" />
        
        {/* Ears/Side Bolts */}
        <rect x="9" y="26" width="5" height="12" rx="1.5" fill="#9CA3AF" />
        <rect x="50" y="26" width="5" height="12" rx="1.5" fill="#9CA3AF" />
        
        {/* Visor Circle */}
        <circle cx="32" cy="32" r="13" fill="#1F2937" />
        <path d="M22 28 Q32 24 42 28" stroke="white" strokeWidth="1" opacity="0.1" fill="none" strokeLinecap="round" />
        
        {/* Cheeks */}
        <circle cx="25" cy="38" r="1.5" fill="#FDA4AF" opacity="0.6" />
        <circle cx="39" cy="38" r="1.5" fill="#FDA4AF" opacity="0.6" />
        
        {/* Eyes */}
        <g>
          <circle cx="28" cy="32" r="3.5" fill="#22D3EE" />
          <circle cx="29" cy="30.5" r="0.8" fill="white" opacity="0.8" />
          <circle cx="36" cy="32" r="3.5" fill="#22D3EE" />
          <circle cx="37" cy="30.5" r="0.8" fill="white" opacity="0.8" />
        </g>
        
        {/* Smile */}
        <path d="M29 39 Q32 41 35 39" stroke="#22D3EE" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8" />
        
        {/* Antenna */}
        <line x1="32" y1="16" x2="32" y2="8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="8" r="2.5" fill="#22D3EE" opacity="0.2" className="animate-pulse" />
        <circle cx="32" cy="8" r="1.5" fill="#22D3EE" className="animate-pulse" />
      </svg>
    </div>
  );
}

export function StudioBot() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([{ id: 'init', role: 'assistant', content: "Hi, I’m Kit. Which tool do you need?" }]);
      }
    } else {
      setMessages([{ id: 'init', role: 'assistant', content: "Hi, I’m Kit. Which tool do you need?" }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-10)));
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Mandatory: Check pathname in the return statement to ensure hook consistency
  const isHome = pathname === '/';

  const processQuery = async (query: string) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1200));

    const lowQuery = query.toLowerCase();
    let response = "";
    let foundHrefs: string[] = [];

    if (lowQuery.includes('pdf')) {
      response = "I have several PDF tools: Merge, Split, Compressor, Unlock, and Protect. Which do you need?";
      foundHrefs = TOOLS.filter(t => t.href.includes('pdf')).map(t => t.href);
    } else if (lowQuery.includes('image') || lowQuery.includes('photo')) {
      response = "For images, I can Enhance, Resize, Compress, or Convert formats. Check these out:";
      foundHrefs = TOOLS.filter(t => t.href.includes('image') || t.href.includes('photo') || t.keywords.includes('image')).map(t => t.href);
    } else if (lowQuery.includes('how to') || lowQuery.includes('use')) {
      response = "Click any tool card on the Home page to open its studio. Everything works locally in your browser.";
    } else {
      const match = TOOLS.filter(t => 
        t.keywords.some(k => lowQuery.includes(k)) || 
        t.title.toLowerCase().includes(lowQuery)
      );

      if (match.length > 0) {
        response = `I found ${match.length} tool${match.length > 1 ? 's' : ''} for you:`;
        foundHrefs = match.map(t => t.href);
      } else {
        response = "I only help with tools on this website. Try searching for 'QR', 'PDF', or 'Image'.";
      }
    }

    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: response,
      toolHrefs: foundHrefs.length > 0 ? foundHrefs : undefined,
    }]);
    setIsTyping(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), role: 'user', content: userMsg }]);
    processQuery(userMsg);
  };

  const handleChipClick = (chip: string) => {
    if (isTyping) return;
    setMessages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), role: 'user', content: chip }]);
    processQuery(chip);
  };

  if (!isHome) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group w-14 h-14 bg-transparent border-none flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all active:scale-95 duration-500"
          aria-label="Open Studio Assistant"
        >
          <RobotSVG className="w-full h-full" />
        </button>
      ) : (
        <div ref={chatRef} className="pointer-events-auto flex flex-col items-end animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 w-[320px]">
          <Card className="w-full border-[rgba(107,155,209,0.35)] dark:border-white/5 shadow-[0_12px_40px_rgba(43,75,120,0.18)] overflow-hidden flex flex-col bg-[rgba(255,249,240,0.92)] dark:bg-card/90 backdrop-blur-2xl rounded-[18px] border">
            {/* Header */}
            <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-white/2 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <RobotSVG className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white">Kit</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-lg text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="h-[320px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-transparent">
              {messages.map((msg, idx) => (
                <div key={msg.id} className={cn(
                  "flex flex-col gap-2 animate-in slide-in-from-bottom-1 duration-200",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "max-w-[90%] px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-[#6B9BD1] dark:bg-primary text-white rounded-tr-none" 
                      : "bg-white dark:bg-white/5 text-[#0f172a] dark:text-white rounded-tl-none border border-black/5 dark:border-white/5"
                  )}>
                    {msg.content}
                  </div>

                  {idx === 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {QUICK_CHIPS.map(chip => (
                        <button 
                          key={chip}
                          onClick={() => handleChipClick(chip)}
                          className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-[9px] font-black uppercase text-[#6B9BD1] dark:text-primary hover:border-[#6B9BD1]/40 dark:hover:border-primary/40 transition-all shadow-sm active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.toolHrefs && (
                    <div className="w-full flex flex-col gap-2 mt-1 animate-in zoom-in-95 duration-300">
                      {msg.toolHrefs.map((href) => {
                        const tool = TOOLS.find(t => t.href === href);
                        if (!tool) return null;
                        const ToolIcon = tool.icon;
                        
                        return (
                          <button 
                            key={tool.href}
                            onClick={() => { setIsOpen(false); router.push(tool.href); }}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[#6B9BD1]/40 dark:hover:border-primary/40 transition-all group shadow-sm text-left"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-secondary dark:bg-white/5 flex items-center justify-center text-[#6B9BD1] dark:text-primary shrink-0">
                                <ToolIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[10px] font-black uppercase text-black/60 dark:text-white/60 group-hover:text-[#6B9BD1] dark:group-hover:text-primary transition-colors truncate">{tool.title}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#6B9BD1]/40 dark:text-primary/40 group-hover:text-[#6B9BD1] dark:group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none border border-black/5 dark:border-white/5 flex gap-1 items-center shadow-sm">
                    <div className="w-1.5 h-1.5 bg-[#6B9BD1]/40 dark:bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#6B9BD1]/40 dark:bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[#6B9BD1]/40 dark:bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/40 dark:bg-white/2 border-t border-black/5 dark:border-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Which tool?"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 h-9 px-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[11px] font-medium focus:ring-1 focus:ring-[#6B9BD1] dark:focus:ring-primary outline-none transition-all placeholder:text-black/20 dark:placeholder:text-white/20 text-black dark:text-white"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-[#6B9BD1] dark:bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-30 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
