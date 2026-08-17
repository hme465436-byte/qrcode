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
  Braces
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
 * Kit the Panda - High Fidelity SVG Character
 */
function KitSVG({ className, isPeeking = false }: { className?: string; isPeeking?: boolean }) {
  return (
    <div className={cn("relative pointer-events-none select-none", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
        {/* Ears */}
        <ellipse cx="28" cy="22" rx="10" ry="11" fill="#1A1A1A" />
        <ellipse cx="72" cy="22" rx="10" ry="11" fill="#1A1A1A" />
        
        {/* Bamboo Leaf */}
        <path d="M78 15 Q 85 5 95 12 Q 88 18 80 16" fill="#7CB342" stroke="#2B2B2B" strokeWidth="0.5" />
        
        {/* Head */}
        <circle cx="50" cy="50" r="42" fill="#F7F4EE" stroke="#2B2B2B" strokeWidth="2.5" />
        
        {/* Eye Patches */}
        <ellipse cx="36" cy="48" rx="11" ry="13" fill="#1A1A1A" transform="rotate(-15, 36, 48)" />
        <ellipse cx="64" cy="48" rx="11" ry="13" fill="#1A1A1A" transform="rotate(15, 64, 48)" />
        
        {/* Eyes */}
        <circle cx="36" cy="46" r="4.5" fill="white" />
        <circle cx="37" cy="45.5" r="2.5" fill="black" />
        <circle cx="38" cy="44.5" r="1" fill="white" /> {/* Sparkle */}
        
        <circle cx="64" cy="46" r="4.5" fill="white" />
        <circle cx="63" cy="45.5" r="2.5" fill="black" />
        <circle cx="62" cy="44.5" r="1" fill="white" /> {/* Sparkle */}
        
        {/* Cheeks */}
        <ellipse cx="22" cy="62" rx="7" ry="4" fill="#FFB6C8" opacity="0.7" />
        <ellipse cx="78" cy="62" rx="7" ry="4" fill="#FFB6C8" opacity="0.7" />
        
        {/* Nose & Mouth */}
        <circle cx="50" cy="56" r="3.5" fill="#1A1A1A" />
        <path d="M44 64 Q 50 69 56 64 M50 64 L 50 60" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />

        {/* Waving Paw (visible in peek or open) */}
        <g className={cn("transition-transform duration-700", isPeeking ? "translate-y-0" : "translate-y-20 translate-x-20")}>
           <circle cx="85" cy="85" r="12" fill="#F7F4EE" stroke="#2B2B2B" strokeWidth="1.5" />
           <circle cx="85" cy="82" r="4" fill="#1A1A1A" opacity="0.8" />
           <circle cx="77" cy="85" r="2" fill="#1A1A1A" opacity="0.6" />
           <circle cx="81" cy="90" r="2" fill="#1A1A1A" opacity="0.6" />
           <circle cx="89" cy="90" r="2" fill="#1A1A1A" opacity="0.6" />
           <circle cx="93" cy="85" r="2" fill="#1A1A1A" opacity="0.6" />
        </g>
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

  // KIT RULE: ONLY ON HOME (/)
  if (pathname !== '/') return null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const processQuery = async (query: string) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1000));

    const lowQuery = query.toLowerCase();
    const foundTools = TOOLS.filter(t => 
      t.keywords.some(k => lowQuery.includes(k)) || 
      t.title.toLowerCase().includes(lowQuery)
    );

    let response = "";
    if (foundTools.length > 0) {
      response = `I found these tools for you:`;
    } else {
      response = "I couldn't identify that tool. Try 'QR', 'PDF', or 'Image' for a list of available studios.";
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
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group relative flex items-end justify-end w-26 h-26 overflow-hidden outline-none"
          aria-label="Open Kit"
        >
          {/* Peeking animation - sits in the bottom corner */}
          <div className="absolute -bottom-5 -right-5 w-22 h-22 transform transition-transform duration-300 group-hover:scale-105 animate-kit-bounce">
            <KitSVG isPeeking={true} />
          </div>
        </button>
      ) : (
        <div className="pointer-events-auto flex flex-col items-center animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 w-[280px] sm:w-[320px]">
          {/* Sitting Panda */}
          <div className="relative z-10 -mb-5 animate-kit-wave">
             <KitSVG className="w-18 h-18 sm:w-22 sm:h-22" />
          </div>

          <Card className="w-full border-none shadow-[0_12px_40px_rgba(43,75,120,0.18)] overflow-hidden flex flex-col bg-[#FFF9F0]/92 backdrop-blur-xl rounded-[20px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#6B9BD1]/35 flex items-center justify-between bg-white/40 shrink-0 pt-6">
              <div className="space-y-0.5">
                <h4 className="text-sm font-black uppercase tracking-widest text-[#2B2B2B]">Kit</h4>
                <p className="text-[8px] font-black text-[#6B9BD1] uppercase tracking-[0.2em]">Ask about tools</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-xl bg-white/20 text-[#2B2B2B]/40 hover:text-destructive transition-all flex items-center justify-center border border-[#6B9BD1]/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="h-[300px] overflow-y-auto p-4 space-y-4 custom-scrollbar-hidden bg-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "max-w-[90%] px-4 py-3 rounded-2xl text-[12px] font-medium leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-[#6B9BD1] text-white rounded-tr-none" 
                      : "bg-white text-[#2B2B2B] rounded-tl-none border border-[#6B9BD1]/10"
                  )}>
                    {msg.content}
                  </div>

                  {msg.tools && (
                    <div className="w-full flex flex-col gap-1.5 animate-in zoom-in-95 duration-500">
                      {msg.tools.map((tool) => (
                        <button 
                          key={tool.href}
                          onClick={() => { setIsOpen(false); window.location.href = tool.href; }}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/60 border border-[#6B9BD1]/20 hover:bg-[#6B9BD1]/10 transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#6B9BD1] border border-[#6B9BD1]/10 group-hover:scale-105 transition-transform">
                              <tool.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-[#2B2B2B]/70 group-hover:text-[#6B9BD1] transition-colors">{tool.title}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-[#6B9BD1]/40 group-hover:text-[#6B9BD1] transition-all group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none border border-[#6B9BD1]/10 flex gap-1 items-center">
                    <div className="w-1 h-1 bg-[#6B9BD1]/40 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-[#6B9BD1]/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-[#6B9BD1]/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/40 border-t border-[#6B9BD1]/20">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Which tool?"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 h-9 px-4 bg-white/80 border border-[#6B9BD1]/30 rounded-xl text-[11px] font-medium focus:ring-1 focus:ring-[#6B9BD1] outline-none transition-all placeholder:text-[#2B2B2B]/20"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-[#6B9BD1] text-white flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-30 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes kit-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes kit-wave {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(-3deg); }
        }
        .animate-kit-bounce { animation: kit-bounce 2.4s ease-in-out infinite; }
        .animate-kit-wave { animation: kit-wave 3s ease-in-out infinite; }
        .custom-scrollbar-hidden::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
