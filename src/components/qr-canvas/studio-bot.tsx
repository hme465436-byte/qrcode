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
 * Premium Mascot Illustration
 * High-fidelity hardware-native matrix
 */
function RobotSVG({ className }: { className?: string }) {
  return (
    <div className={cn("relative pointer-events-none select-none", className)}>
      <svg viewBox="0 0 128 128" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="premium-helmet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4F7FB" />
            <stop offset="100%" stopColor="#6B7C93" />
          </linearGradient>
          
          <filter id="eye-glow-pro" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="smile-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Ground Shadow */}
        <ellipse cx="64" cy="120" rx="38" ry="6" fill="black" opacity="0.2" />

        {/* 2. Neck */}
        <rect x="54" y="94" width="20" height="12" rx="4" fill="#2D3748" />

        {/* 3. Head: Rounded Helmet */}
        <path 
          d="M36,25 L92,25 C112,25 116,38 118,55 L118,80 C118,100 106,108 92,108 L36,108 C22,108 10,100 10,80 L10,55 C10,38 14,25 36,25 Z" 
          fill="url(#premium-helmet)" 
          stroke="#4A5568" 
          strokeWidth="1"
        />
        
        {/* Top-Left Inset Highlight */}
        <path d="M36,28 L92,28 Q106,28 110,40" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />

        {/* 4. Face Plate Inset */}
        <rect x="24" y="42" width="80" height="50" rx="12" fill="#1A202C" opacity="0.1" />

        {/* 5. Visor: Glossy Capsule */}
        <rect x="28" y="48" width="72" height="26" rx="13" fill="#0F172A" />
        <path d="M42,52 L86,52" fill="none" stroke="#00E5FF" strokeWidth="1" opacity="0.2" strokeLinecap="round" />

        {/* 6. Eyes: Glowing Capsules */}
        <g filter="url(#eye-glow-pro)">
          <rect x="40" y="55" width="14" height="12" rx="6" fill="#00E5FF" />
          <circle cx="43" cy="58" r="1.5" fill="white" />
          
          <rect x="74" y="55" width="14" height="12" rx="6" fill="#00E5FF" />
          <circle cx="77" cy="58" r="1.5" fill="white" />
        </g>

        {/* 7. Center Logic LED */}
        <circle cx="64" cy="61" r="1.5" fill="#00E5FF" className="animate-pulse" />

        {/* 8. Cheek Speaker Grills */}
        <g fill="#4A5568" opacity="0.5">
          <circle cx="28" cy="82" r="1" /> <circle cx="32" cy="82" r="1" /> <circle cx="36" cy="82" r="1" />
          <circle cx="28" cy="86" r="1" /> <circle cx="32" cy="86" r="1" /> <circle cx="36" cy="86" r="1" />
          
          <circle cx="92" cy="82" r="1" /> <circle cx="96" cy="82" r="1" /> <circle cx="100" cy="82" r="1" />
          <circle cx="92" cy="86" r="1" /> <circle cx="96" cy="86" r="1" /> <circle cx="100" cy="86" r="1" />
        </g>

        {/* 9. Top Antenna + Pulsing Signal */}
        <line x1="64" y1="25" x2="64" y2="8" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="64" cy="8" r="4" fill="#00E5FF" className="animate-pulse" />

        {/* 10. Side Bolts */}
        <circle cx="18" cy="66" r="4" fill="none" stroke="#4A5568" strokeWidth="1.5" opacity="0.3" />
        <circle cx="110" cy="66" r="4" fill="none" stroke="#4A5568" strokeWidth="1.5" opacity="0.3" />

        {/* 11. Smile: Glowing Cyan Curve */}
        <path d="M54,92 Q64,98 74,92" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" filter="url(#smile-glow)" opacity="0.6" />
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

  // Hook order safety: visibility check performed at end of block
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
          className="pointer-events-auto group w-[72px] h-[72px] bg-transparent border-none flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all active:scale-95 duration-500"
          aria-label="Open Studio Assistant"
        >
          <RobotSVG className="w-full h-full drop-shadow-2xl" />
        </button>
      ) : (
        <div className="pointer-events-auto flex flex-col items-end animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 w-[280px] sm:w-[340px]">
          <Card className="w-full border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-[2.5rem] border">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-secondary/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Assistant</h4>
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
                  placeholder="Need a tool?"
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
