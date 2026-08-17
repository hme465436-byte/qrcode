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

export function StudioBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hi! I'm Kit. I can help you find tools or answer questions about the studio. What are we making today?"
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
      response = `I found ${foundTools.length} tools for that! Click one to start:`;
    } else if (lowQuery.includes('hello') || lowQuery.includes('hi')) {
      response = "Hello! I'm Kit. Need help with QR codes, PDFs, or image tools?";
    } else {
      response = "I'm not sure about that one. I can help with QR, PDF, images, or data tools on this site.";
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

  const KitHead = () => (
    <div className="relative w-14 h-12 bg-white rounded-full border-2 border-[#1a1a1a] flex flex-col items-center justify-center pt-1 shadow-inner">
      <div className="flex gap-2 mb-1">
        <div className="w-2.5 h-3 bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-1 h-1 bg-white rounded-full mt-[-2px] animate-kit-blink" />
        </div>
        <div className="w-2.5 h-3 bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-1 h-1 bg-white rounded-full mt-[-2px] animate-kit-blink" />
        </div>
      </div>
      <div className="w-1 h-1 bg-[#1a1a1a] rounded-full mb-1" />
    </div>
  );

  const PawPeek = () => (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-0 right-10 z-[100] w-14 h-10 bg-white rounded-t-full border-2 border-b-0 border-[#1a1a1a] flex flex-col items-center justify-start pt-2 shadow-2xl transition-all hover:h-12 active:scale-95 group animate-kit-sway"
    >
      <div className="flex gap-1">
        <div className="w-1.5 h-2 bg-[#1a1a1a] rounded-full" />
        <div className="w-1.5 h-2 bg-[#1a1a1a] rounded-full" />
        <div className="w-1.5 h-2 bg-[#1a1a1a] rounded-full" />
      </div>
      <div className="w-5 h-3 bg-[#1a1a1a]/5 rounded-full mt-1" />
    </button>
  );

  if (!isOpen) return <PawPeek />;

  return (
    <div className="fixed right-6 bottom-6 z-[100] h-[500px] w-[90vw] sm:w-[350px] animate-in slide-in-from-bottom-4 duration-300">
      <Card className="h-full border-white/10 shadow-2xl overflow-hidden flex flex-col bg-[#0a0a0c]/95 backdrop-blur-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -top-3 left-0 w-4 h-4 bg-[#1a1a1a] rounded-full animate-kit-ear-twitch" />
              <div className="absolute -top-3 right-0 w-4 h-4 bg-[#1a1a1a] rounded-full animate-kit-ear-twitch" />
              <KitHead />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Kit Assistant</h4>
              <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" /> Online
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg text-white/20 hover:text-destructive transition-all flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-secondary border border-white/5 text-foreground/80 rounded-tl-none"
              )}>
                {msg.content}
              </div>

              {msg.tools && (
                <div className="w-full space-y-1.5">
                  {msg.tools.map((tool) => (
                    <button 
                      key={tool.href}
                      onClick={() => { setIsOpen(false); window.location.href = tool.href; }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-primary border border-white/5">
                          <tool.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-foreground/60">{tool.title}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-white/10" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-secondary/30 border-t border-white/5">
          <form onSubmit={handleSubmit} className="relative">
            <input 
              type="text"
              placeholder="Ask Kit..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full h-11 pl-4 pr-10 bg-background border border-white/10 rounded-xl text-[11px] focus:ring-1 focus:ring-primary/40 outline-none"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Heart className="w-2.5 h-2.5 text-primary/10 fill-current" />
            <p className="text-[7px] font-black text-foreground/10 uppercase tracking-[0.4em]">Home Assistant Active</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
