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
  Heart,
  MessageSquare,
  Type,
  Braces
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
 * High-Fidelity Vector Panda Character
 */
function KitCharacter({ className }: { className?: string }) {
  return (
    <div className={cn("relative select-none pointer-events-none", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        {/* Ears */}
        <circle cx="25" cy="25" r="12" fill="#1a1a1a" />
        <circle cx="75" cy="25" r="12" fill="#1a1a1a" />
        
        {/* Face Base */}
        <circle cx="50" cy="50" r="40" fill="white" stroke="#f0f0f0" strokeWidth="1" />
        
        {/* Eyes Matrix */}
        <circle cx="35" cy="45" r="8" fill="#1a1a1a" />
        <circle cx="37" cy="42" r="3" fill="white" /> {/* Reflection */}
        
        <circle cx="65" cy="45" r="8" fill="#1a1a1a" />
        <circle cx="67" cy="42" r="3" fill="white" /> {/* Reflection */}
        
        {/* Blush Matrix */}
        <ellipse cx="25" cy="55" rx="6" ry="4" fill="#ffb7ce" opacity="0.6" />
        <ellipse cx="75" cy="55" rx="6" ry="4" fill="#ffb7ce" opacity="0.6" />
        
        {/* Nose and Smile */}
        <circle cx="50" cy="55" r="3" fill="#1a1a1a" />
        <path d="M45 62 Q 50 66 55 62" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/**
 * Kit's Waving Paw Protocol
 */
function KitPaw({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-12 h-12", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <path d="M20 80 Q 20 40 50 40 Q 80 40 80 80 L 80 100 L 20 100 Z" fill="white" />
        <circle cx="35" cy="55" r="5" fill="#f0f0f0" />
        <circle cx="50" cy="55" r="5" fill="#f0f0f0" />
        <circle cx="65" cy="55" r="5" fill="#f0f0f0" />
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

  // KIT MANDATE: Strictly only render on Home (/)
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
      response = `Found some tools for you:`;
    } else {
      response = "I couldn't find that specific tool. Try searching for 'QR', 'PDF', or 'Image'.";
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
    <>
      {/* PEEK STATE: Small paw and head waving from corner */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-0 right-6 z-[100] flex flex-col items-center group animate-kit-sway transition-transform hover:-translate-y-2 active:scale-95"
        >
          <KitCharacter className="w-16 h-16 sm:w-20 sm:h-20 translate-y-8 group-hover:translate-y-6 transition-transform duration-500" />
          <KitPaw className="w-10 h-10 animate-bounce transition-all duration-[3000ms]" />
        </button>
      )}

      {/* OPEN STATE: Full card with Kit sitting on top */}
      {isOpen && (
        <div className="fixed right-6 bottom-6 z-[100] h-[520px] w-[90vw] sm:w-[380px] flex flex-col items-center animate-in slide-in-from-bottom-8 zoom-in-95 duration-500">
          <div className="relative z-10 -mb-8 transition-transform duration-1000 hover:scale-105">
            <KitCharacter className="w-24 h-24 sm:w-28 sm:h-28" />
          </div>

          <Card className="flex-1 w-full border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-[3rem]">
            {/* Header Protocol */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0 pt-10">
              <div className="space-y-0.5">
                <h4 className="text-xl font-headline font-black uppercase tracking-tighter text-foreground">Kit</h4>
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Studio Intel Active
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 rounded-2xl bg-white/5 text-white/20 hover:text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Linguistic Matrix (Chat) */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-primary/[0.02]">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-2xl",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none shadow-primary/20" 
                      : "bg-[#1a1a1e] border border-white/5 text-foreground/80 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>

                  {msg.tools && (
                    <div className="w-full grid grid-cols-1 gap-2 animate-in zoom-in-95 duration-500">
                      {msg.tools.map((tool) => (
                        <button 
                          key={tool.href}
                          onClick={() => { setIsOpen(false); window.location.href = tool.href; }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 transition-transform">
                              <tool.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-foreground/60 group-hover:text-foreground transition-colors">{tool.title}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1e] px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Architecture */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <form onSubmit={handleSubmit} className="relative group/input">
                <div className="absolute -inset-1 bg-primary/10 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-1000" />
                <input 
                  type="text"
                  placeholder="Ask me anything about tools..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="relative w-full h-14 pl-5 pr-14 bg-background border border-white/10 rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-white/10"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xl active:scale-90 disabled:opacity-20 transition-all z-10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Heart className="w-3 h-3 text-primary/20 fill-current" />
                <p className="text-[8px] font-black text-foreground/10 uppercase tracking-[0.4em]">Hardware Handshake Native</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
