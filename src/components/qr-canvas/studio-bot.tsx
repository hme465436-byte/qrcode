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
 * Clinical Robot Assistant - High Fidelity Vector Face
 */
function RobotSVG({ className }: { className?: string }) {
  return (
    <div className={cn("relative pointer-events-none select-none", className)}>
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-2xl overflow-visible">
        {/* Antenna */}
        <line x1="32" y1="14" x2="32" y2="4" stroke="#9AA4B2" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="4" r="2.5" fill="#22D3EE" className="animate-pulse" />
        
        {/* Square/Round Metallic Head */}
        <rect x="12" y="14" width="40" height="38" rx="8" fill="#9AA4B2" stroke="#4B5563" strokeWidth="1" />
        
        {/* Dark Visor Layer */}
        <rect x="18" y="22" width="28" height="14" rx="4" fill="#1E293B" />
        
        {/* Glowing Cyan Optical Sensors */}
        <circle cx="26" cy="29" r="2.5" fill="#22D3EE" className="animate-pulse" />
        <circle cx="38" cy="29" r="2.5" fill="#22D3EE" className="animate-pulse" />
        
        {/* Tiny Line Mouth */}
        <line x1="28" y1="44" x2="36" y2="44" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Hardware Detail Bolts */}
        <circle cx="17" cy="46" r="1.2" fill="#4B5563" />
        <circle cx="47" cy="46" r="1.2" fill="#4B5563" />
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
      content: "Need a tool? Ask me."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ROBOT RULE: ONLY ON HOME (/)
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
      response = `I found these production units:`;
    } else {
      response = "I couldn't locate that studio. Try searching for 'QR', 'PDF', or 'Image'.";
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
          className="pointer-events-auto group w-14 h-14 bg-transparent border-none flex items-center justify-center hover:scale-105 transition-all active:scale-95"
          aria-label="Open Assistant"
        >
          <RobotSVG className="w-14 h-14" />
        </button>
      ) : (
        <div className="pointer-events-auto flex flex-col items-end animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 w-[280px] sm:w-[320px]">
          <Card className="w-full border-white/10 shadow-2xl overflow-hidden flex flex-col bg-background/95 backdrop-blur-2xl rounded-[1.5rem] border">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Robot Assistant</h4>
                  <p className="text-[7px] font-bold text-primary uppercase tracking-[0.2em]">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-lg text-foreground/20 hover:text-foreground transition-all flex items-center justify-center"
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
                    "max-w-[85%] px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-secondary text-foreground rounded-tl-none border border-border"
                  )}>
                    {msg.content}
                  </div>

                  {msg.tools && (
                    <div className="w-full flex flex-col gap-1.5 mt-1 animate-in zoom-in-95 duration-300">
                      {msg.tools.map((tool) => (
                        <button 
                          key={tool.href}
                          onClick={() => { setIsOpen(false); window.location.href = tool.href; }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
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
                  <div className="bg-secondary px-3 py-2 rounded-2xl rounded-tl-none border border-border flex gap-1 items-center">
                    <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-secondary/30 border-t border-border">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Need a tool?"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 h-9 px-4 bg-background border border-border rounded-xl text-[11px] font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-30 transition-all shrink-0"
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
