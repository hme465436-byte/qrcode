"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { 
  X, 
  Send, 
  ArrowRight, 
  Command,
  Minimize2, 
  Maximize2,
  Trash2,
  CheckCircle2,
  Loader2,
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
  Braces,
  Search,
  Zap,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Tool {
  href: string;
  title: string;
  desc: string;
  keywords: string[];
  icon: any;
}

const TOOLS: Tool[] = [
  { href: '/single', title: 'Single Studio', icon: QrCode, desc: 'Branded QR codes.', keywords: ['qr', 'generator'] },
  { href: '/bulk', title: 'Bulk Production', icon: Layers, desc: 'Mass generation.', keywords: ['bulk', 'batch'] },
  { href: '/json-formatter', title: 'JSON Formatter', icon: Braces, desc: 'Clean JSON data.', keywords: ['json', 'format'] },
  { href: '/regex-tester', title: 'Regex Tester', icon: Search, desc: 'Test patterns.', keywords: ['regex', 'test'] },
  { href: '/photo-enhance-fix', title: 'Photo Enhance', icon: Wand2, desc: 'Restore pixels.', keywords: ['upscale', 'fix'] },
  { href: '/passport-photo-maker', title: 'Passport Photo', icon: SquareUser, desc: 'ID photos.', keywords: ['passport', 'visa'] },
  { href: '/ocr', title: 'OCR Extraction', icon: FileText, desc: 'Image to text.', keywords: ['ocr', 'read'] },
  { href: '/pdf-merger', title: 'PDF Merger', icon: FileStack, desc: 'Join documents.', keywords: ['merge', 'join'] },
  { href: '/pdf-compressor', title: 'PDF Compressor', icon: FileArchive, desc: 'Shrink PDFs.', keywords: ['compress', 'shrink'] },
  { href: '/video-to-audio', title: 'Video to MP3', icon: Music, desc: 'Extract sound.', keywords: ['mp3', 'video'] },
  { href: '/whatsapp-dp-maker', title: 'WhatsApp DP', icon: User, desc: 'No-crop profile pics.', keywords: ['dp', 'whatsapp'] },
  { href: '/csv-to-json', title: 'CSV to JSON', icon: Table, desc: 'Translate data.', keywords: ['csv', 'excel'] },
];

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  tools?: Tool[];
}

export function StudioBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Handshake Complete. I am Kit, your Studio Assistant. How can I assist your production workflow today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // KIT MANDATE: Only render on Home (/)
  if (pathname !== '/') return null;

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
    } else {
      response = "Query unclear. I can assist with QR generation, PDF manipulation, photo enhancement, or technical data conversion.";
    }

    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: response,
      tools: foundTools.length > 0 ? foundTools : undefined,
    }]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), role: 'user', content: userMsg }]);
    processQuery(userMsg);
  };

  const KitVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Ears */}
      <div className="absolute top-0 left-2 w-5 h-5 bg-[#1a1a1a] rounded-full animate-kit-ear-twitch" />
      <div className="absolute top-0 right-2 w-5 h-5 bg-[#1a1a1a] rounded-full animate-kit-ear-twitch" />
      {/* Head */}
      <div className="absolute bottom-0 w-14 h-12 bg-white rounded-full border-2 border-[#1a1a1a] flex flex-col items-center justify-center pt-1 shadow-inner">
        {/* Eyes */}
        <div className="flex gap-2 mb-1">
          <div className="w-3 h-4 bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <div className="w-1 h-1.5 bg-white rounded-full animate-kit-blink" />
          </div>
          <div className="w-3 h-4 bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <div className="w-1 h-1.5 bg-white rounded-full animate-kit-blink" />
          </div>
        </div>
        {/* Nose */}
        <div className="w-1.5 h-1 bg-[#1a1a1a] rounded-full mb-1" />
      </div>
      {/* Paws (Peek State) */}
      <div className="absolute -bottom-1 -left-1 w-5 h-4 bg-white border border-[#1a1a1a] rounded-full rotate-[-20deg]" />
      <div className="absolute -bottom-1 -right-1 w-5 h-4 bg-white border border-[#1a1a1a] rounded-full rotate-[20deg]" />
    </div>
  );

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-0 right-8 z-[100] w-16 h-14 transition-all hover:-translate-y-2 active:scale-95 group animate-kit-sway"
      >
        <KitVisual />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed right-6 z-[100] flex flex-col transition-all duration-500 ease-out",
      isMinimized ? "bottom-6 h-16 w-64" : "bottom-6 h-[550px] w-[90vw] sm:w-[380px]"
    )}>
      <Card className="h-full border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col bg-[#0a0a0c]/95 backdrop-blur-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-white/10 shadow-lg overflow-hidden">
               <KitVisual />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Kit Assistant</h4>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter">System Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 text-white/20 hover:text-white rounded-lg">
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
             </Button>
             <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white/20 hover:text-destructive rounded-lg">
                <X className="w-3.5 h-3.5" />
             </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
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
                      <div className="w-full space-y-2 pt-1">
                        {msg.tools.map((tool) => (
                          <button 
                            key={tool.href}
                            onClick={() => { setIsOpen(false); window.location.href = tool.href; }}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-primary/10 transition-all text-left group"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary">
                                   <tool.icon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-foreground/60">{tool.title}</span>
                             </div>
                             <ArrowRight className="w-3.5 h-3.5 text-foreground/20 group-hover:text-primary transition-all" />
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

            <div className="p-4 bg-secondary/30 border-t border-white/5 shrink-0">
               <form onSubmit={handleSubmit} className="relative">
                  <input 
                    type="text"
                    placeholder="Ask about tools..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full h-12 pl-5 pr-12 bg-background border border-white/10 rounded-xl text-xs font-medium focus:ring-primary/40"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </form>
               <div className="mt-3 flex items-center justify-center gap-2">
                  <Heart className="w-2.5 h-2.5 text-primary/20 fill-current" />
                  <p className="text-[7px] font-black text-foreground/10 uppercase tracking-[0.4em]">Home Logic Verified</p>
               </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
