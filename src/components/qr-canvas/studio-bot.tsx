"use client"

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
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
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Tool {
  href: string;
  title: string;
  keywords: string[];
  icon: any;
}

const TOOLS: Tool[] = [
  { href: '/single', title: 'Single QR', icon: QrCode, keywords: ['qr', 'generator'] },
  { href: '/bulk', title: 'Bulk Mode', icon: Layers, keywords: ['bulk', 'batch'] },
  { href: '/json-formatter', title: 'JSON Format', icon: Braces, keywords: ['json', 'format'] },
  { href: '/regex-tester', title: 'Regex Test', icon: Search, keywords: ['regex', 'pattern'] },
  { href: '/photo-enhance-fix', title: 'Enhance', icon: Wand2, keywords: ['upscale', 'fix'] },
  { href: '/passport-photo-maker', title: 'Passport', icon: SquareUser, keywords: ['passport', 'visa'] },
  { href: '/ocr', title: 'OCR', icon: FileText, keywords: ['ocr', 'read'] },
  { href: '/pdf-merger', title: 'Merge PDF', icon: FileStack, keywords: ['merge', 'join'] },
  { href: '/pdf-compressor', title: 'Compress PDF', icon: FileArchive, keywords: ['compress', 'smaller'] },
  { href: '/video-to-audio', title: 'Video 2 MP3', icon: Music, keywords: ['mp3', 'extract'] },
  { href: '/whatsapp-dp-maker', title: 'WA DP', icon: User, keywords: ['dp', 'whatsapp'] },
  { href: '/csv-to-json', title: 'CSV to JSON', icon: Table, keywords: ['csv', 'excel'] },
];

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  tools?: Tool[];
}

/**
 * Premium High-Fidelity Robot Illustration
 * Inline SVG with clinical detail and depth protocols
 */
function RobotSVG({ className }: { className?: string }) {
  return (
    <div className={cn("relative pointer-events-none select-none", className)}>
      <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
        <defs>
          {/* Metal Casing Gradient */}
          <linearGradient id="metal-helmet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8EEF4" />
            <stop offset="100%" stopColor="#8A96A8" />
          </linearGradient>
          
          {/* Eye Glow Filter */}
          <filter id="optics-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Depth Shadow */}
          <filter id="hardware-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Antenna Infrastructure */}
        <line x1="32" y1="14" x2="32" y2="4" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="4" r="3" fill="#22D3EE" className="animate-pulse" />
        
        {/* Helmet Shaped Head */}
        <rect 
          x="10" y="14" 
          width="44" height="42" 
          rx="12" 
          fill="url(#metal-helmet)" 
          stroke="#525B6A" 
          strokeWidth="1.5" 
          filter="url(#hardware-shadow)"
        />

        {/* Side Ear Vents (Left) */}
        <g stroke="#525B6A" strokeWidth="1" strokeLinecap="round" opacity="0.6">
          <line x1="10" y1="30" x2="6" y2="30" />
          <line x1="10" y1="34" x2="6" y2="34" />
          <line x1="10" y1="38" x2="6" y2="38" />
        </g>

        {/* Side Ear Vents (Right) */}
        <g stroke="#525B6A" strokeWidth="1" strokeLinecap="round" opacity="0.6">
          <line x1="54" y1="30" x2="58" y2="30" />
          <line x1="54" y1="34" x2="58" y2="34" />
          <line x1="54" y1="38" x2="58" y2="38" />
        </g>

        {/* Obsidian Visor Bar */}
        <rect x="14" y="24" width="36" height="14" rx="5" fill="#0F172A" />

        {/* Cyan Optical Sensors */}
        <g filter="url(#optics-glow)">
          {/* Left Eye */}
          <ellipse cx="23" cy="31" rx="3.5" ry="5" fill="#22D3EE" className="animate-pulse" />
          <circle cx="21.5" cy="29" r="1" fill="#FFFFFF" opacity="0.8" />
          
          {/* Right Eye */}
          <ellipse cx="41" cy="31" rx="3.5" ry="5" fill="#22D3EE" className="animate-pulse" />
          <circle cx="39.5" cy="29" r="1" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Center Sensor / Camera Unit */}
        <circle cx="32" cy="31" r="1.5" fill="#4B5563" />
        
        {/* Chin Plate & Speaker Matrix */}
        <path d="M18 46 Q32 50 46 46" stroke="#525B6A" strokeWidth="1.5" fill="none" opacity="0.5" />
        <g fill="#4B5563" opacity="0.4">
          <circle cx="28" cy="50" r="0.8" />
          <circle cx="32" cy="50" r="0.8" />
          <circle cx="36" cy="50" r="0.8" />
        </g>

        {/* Mouth Slit */}
        <rect x="27" y="42" width="10" height="1" rx="0.5" fill="#1E293B" opacity="0.6" />
      </svg>
    </div>
  );
}

export function StudioBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Studio Assistant online. How can I help with your digital production?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (pathname !== '/') return null;

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
      response = `I've identified these relevant production units:`;
    } else {
      response = "I couldn't locate a specific tool for that request. Try keywords like 'QR', 'PDF', or 'Image'.";
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

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group w-16 h-16 bg-transparent border-none flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all active:scale-95 duration-500"
          aria-label="Open Studio Assistant"
        >
          <RobotSVG className="w-16 h-16 drop-shadow-2xl" />
        </button>
      ) : (
        <div className="pointer-events-auto flex flex-col items-end animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 w-[280px] sm:w-[340px]">
          <Card className="w-full border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-[2rem] border">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-secondary/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Robot Assistant</h4>
                  <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Matrix Mode</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-9 h-9 rounded-xl text-foreground/20 hover:text-foreground hover:bg-white/5 transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="h-[300px] overflow-y-auto p-5 space-y-4 custom-scrollbar bg-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col gap-2 animate-in slide-in-from-bottom-1 duration-200",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-lg",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-white/5 text-foreground/80 rounded-tl-none border border-white/5"
                  )}>
                    {msg.content}
                  </div>

                  {msg.tools && (
                    <div className="w-full flex flex-col gap-2 mt-1 animate-in zoom-in-95 duration-300">
                      {msg.tools.map((tool) => (
                        <button 
                          key={tool.href}
                          onClick={() => { setIsOpen(false); window.location.href = tool.href; }}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all group shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                              <tool.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-foreground/60 group-hover:text-primary transition-colors">{tool.title}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-secondary/30 border-t border-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ask about a studio tool..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 h-10 px-4 bg-background border border-white/10 rounded-xl text-[11px] font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/10"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xl active:scale-90 disabled:opacity-30 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
