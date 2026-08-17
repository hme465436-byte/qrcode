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
 * Premium Box-Bot Mascot
 */
function RobotSVG({ className }: { className?: string }) {
  return (
    <div className={cn("relative pointer-events-none select-none drop-shadow-xl", className)}>
      <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
        {/* Ground Shadow */}
        <ellipse cx="32" cy="55" rx="16" ry="4" fill="black" opacity="0.1" />

        {/* Antenna - Short & Glowing */}
        <line x1="32" y1="16" x2="32" y2="8" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="8" r="4.5" fill="#22D3EE" opacity="0.2" className="animate-pulse" />
        <circle cx="32" cy="8" r="2.5" fill="#22D3EE" className="animate-pulse" />

        {/* Side Hardware (Ears) */}
        <rect x="7" y="28" width="5" height="10" rx="1.5" fill="#9CA3AF" />
        <rect x="52" y="28" width="5" height="10" rx="1.5" fill="#9CA3AF" />

        {/* Box Head - Premium Rounded */}
        <rect x="12" y="16" width="40" height="38" rx="10" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.2" />

        {/* Circle Visor - Deep Matrix */}
        <circle cx="32" cy="34" r="14.5" fill="#1F2937" />
        
        {/* Visor Specular Reflection */}
        <path d="M22 28 Q32 20 42 28" stroke="white" strokeWidth="1.5" opacity="0.15" fill="none" strokeLinecap="round" />

        {/* Cheeks - Soft Pink */}
        <circle cx="23" cy="41" r="2" fill="#FDA4AF" opacity="0.7" />
        <circle cx="41" cy="41" r="2" fill="#FDA4AF" opacity="0.7" />

        {/* Optics - Large & Glowing */}
        <g>
          {/* Left Eye */}
          <circle cx="26.5" cy="33" r="3.5" fill="#22D3EE" />
          <circle cx="28" cy="31.5" r="1" fill="white" opacity="0.9" />
          
          {/* Right Eye */}
          <circle cx="37.5" cy="33" r="3.5" fill="#22D3EE" />
          <circle cx="39" cy="31.5" r="1" fill="white" opacity="0.9" />
        </g>

        {/* Linguistic Interface (Smile) */}
        <path d="M28 42 Q32 45 36 42" stroke="#22D3EE" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9" />
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
      content: "Studio Assistant online. Need help finding a tool?"
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

  // Protocol Check: Assistant is only available on the Home page.
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
      response = `I've found these tools in the registry:`;
    } else {
      response = "I couldn't find a specific tool for that. Try searching for 'QR', 'PDF', or 'Image'.";
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
          className="pointer-events-auto group w-14 h-14 bg-transparent border-none flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all active:scale-95 duration-500"
          aria-label="Open Studio Assistant"
        >
          <RobotSVG className="w-full h-full" />
        </button>
      ) : (
        <div className="pointer-events-auto flex flex-col items-end animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 w-[280px] sm:w-[340px]">
          <Card className="w-full border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-[2rem] border">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-secondary/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Assistant</h4>
                  <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-lg text-foreground/20 hover:text-foreground hover:bg-white/5 transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="h-[280px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col gap-2 animate-in slide-in-from-bottom-1 duration-200",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-[10px] font-medium leading-relaxed shadow-lg",
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
                            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                              <tool.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-foreground/60 group-hover:text-primary transition-colors">{tool.title}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-primary/40 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                    <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-secondary/30 border-t border-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Need a tool?"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 h-10 px-4 bg-background border border-white/10 rounded-xl text-[10px] font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/10"
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
