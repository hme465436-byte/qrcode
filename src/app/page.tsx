'use client';

import React, { useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight,
  Zap, 
  Smartphone, 
  Heart,
  QrCode, Layers, ShieldCheck, Download, Repeat, Binary, Grid3X3, FileText, ImageIcon, FileCode, Music, X, Maximize, FileStack, CaseSensitive, RefreshCcw, Pipette, Palette, ShieldAlert, EyeOff, ListMusic, Film, Volume2, LayoutGrid, Grid2X2, MicOff, FileEdit, AlignLeft, Youtube, Lock, Clock, MonitorPlay, Type, FileArchive, ArrowRightLeft, User, DownloadCloud, Files, ListFilter, Split, FileImage, RotateCw, Activity, Mic, Command, Play, Table, FileJson, SquareUser, Wand2, List, RotateCcw, Unlock, Book, Shapes, FileSignature, Monitor, Braces, Fingerprint, Hash, WholeWord, Frame, Stamp, Scan, TrendingDown, Eraser, Ghost, Wifi, Share2, MoveHorizontal, Eye, ClipboardType, Globe, Coins, Receipt, Trophy, Dices, Scale, UserCircle, Maximize2, Keyboard, ChevronDown, Gauge, MapPin, Banknote, Cloud, Moon, BookOpen, MessageSquare, Sparkles, Footprints, Laugh, Lightbulb, Gamepad2, Calendar, Quote, Languages, Joystick, Github, Shield, Network, Mail, MailQuestion, Link as LinkIcon, Hammer, Hash as HashIcon, History, Edit3, MessageSquare as MessageIcon, Database, CloudUpload, MousePointer2, Mic2, Contact2, Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SpaceBackground } from '@/components/mykittool/space-background';
import { Card, CardContent } from '@/components/ui/card';

const VIEW_MODE_KEY = 'mykit_view_mode';
const SCROLL_POS_KEY = 'mykit_home_scroll_v1';

type ToolCategory = 'all' | 'pdf' | 'image' | 'generators' | 'utilities';

interface Tool {
  href: string;
  icon: any;
  title: string;
  desc: string;
  label: string;
  color: string;
  glowClass: string;
  keywords: string[];
  category: ToolCategory;
}

const TOOLS: Tool[] = [
  { href: '/single', icon: QrCode, title: 'Single Studio', desc: 'Branded QR codes with logos and AI backgrounds.', label: 'PRO MODE', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', glowClass: 'bg-blue-500/10', keywords: ['qr', 'qr code', 'barcode', 'logo qr', 'brand qr', 'single', 'generator', 'scan'], category: 'generators' },
  { href: '/ai-chatbot', icon: MessageIcon, title: 'AI Chatbot', desc: 'Chat with a fast AI assistant.', label: 'AI STUDIO', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', glowClass: 'bg-indigo-400/10', keywords: ['ai', 'chat', 'bot', 'assistant'], category: 'generators' },
  { href: '/ai-resume-builder', icon: Contact2, title: 'AI Resume Builder', desc: 'Create a clean professional resume in minutes.', label: 'AI STUDIO', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', glowClass: 'bg-emerald-400/10', keywords: ['resume', 'cv', 'builder', 'jobs', 'professional', 'career', 'ai resume'], category: 'generators' },
  { href: '/ai-email-writer', icon: Mail, title: 'AI Email Writer', desc: 'Write a clean email in seconds.', label: 'AI STUDIO', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', glowClass: 'bg-blue-400/10', keywords: ['email', 'writer', 'ai email', 'professional email', 'llama'], category: 'generators' },
  { href: '/ai-code-generator', icon: Code2, title: 'AI Code Generator', desc: 'Create code from a simple request.', label: 'AI STUDIO', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', glowClass: 'bg-cyan-400/10', keywords: ['code', 'generator', 'ai code', 'javascript', 'python', 'react', 'llama'], category: 'generators' },
  { href: '/ai-image-generator', icon: Sparkles, title: 'AI Image Generator', desc: 'Create images from text for free.', label: 'CREATIVE', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', glowClass: 'bg-rose-400/10', keywords: ['ai image', 'text to image', 'generator', 'pollinations', 'free ai', 'stable diffusion'], category: 'generators' },
  { href: '/reverse-video', icon: RotateCcw, title: 'Reverse Video', desc: 'Reverse any video in your browser with FFmpeg.wasm.', label: 'MEDIA', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', glowClass: 'bg-purple-500/10', keywords: ['reverse video', 'rewind', 'video editor', 'ffmpeg', 'backwards'], category: 'utilities' },
  { href: '/speech-to-text', icon: Mic, title: 'Speech to Text', desc: 'Convert your voice into text instantly in the browser.', label: 'MEDIA', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', glowClass: 'bg-orange-500/10', keywords: ['speech to text', 'voice typing', 'transcribe', 'dictation', 'microphone'], category: 'utilities' },
  { href: '/text-to-speech', icon: Volume2, title: 'Text to Speech', desc: 'Convert any text into speech instantly in your browser.', label: 'MEDIA', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', glowClass: 'bg-blue-500/10', keywords: ['text to speech', 'voice', 'read aloud', 'audio', 'voiceover', 'speech synthesis'], category: 'utilities' },
  { href: '/voice-changer', icon: Mic2, title: 'Voice Changer', desc: 'Change your voice live with robot, deep, helium and more effects.', label: 'MEDIA', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', glowClass: 'bg-rose-500/10', keywords: ['voice changer', 'voice effect', 'robot voice', 'helium voice', 'deep voice', 'microphone', 'audio effect'], category: 'utilities' },
  { href: '/temp-upload', icon: CloudUpload, title: 'Temp Upload', desc: 'Connect ImgBB, GoFile, Pixeldrain or Cloudflare R2 and upload files with expiry reminders.', label: 'STORAGE', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', glowClass: 'bg-indigo-500/10', keywords: ['temp upload', 'cloudflare r2', 'imgbb', 'gofile', 'pixeldrain', 'storage', 'file host', 'reminders'], category: 'utilities' },
];

const ToolItem = React.memo(({ item, onNavigate }: { item: Tool, onNavigate: () => void }) => {
  return (
    <Link 
      href={item.href} 
      onClick={onNavigate}
      className="group relative flex transition-all duration-300 h-full w-full"
    >
      <Card className="relative flex-1 flex flex-col p-5 sm:p-6 rounded-3xl bg-secondary/30 border border-white/5 bg-white/40 dark:bg-card/40 backdrop-blur-2xl hover:border-primary/20 hover:bg-secondary/50 transition-all duration-500 shadow-2xl group-hover:shadow-primary/5 overflow-hidden text-left hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={cn("rounded-2xl flex items-center justify-center border transition-all duration-500 icon-container-3d relative z-10 shrink-0 w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6", item.color)}>
          <item.icon className="icon-3d w-5 h-5 sm:w-6 sm:h-6" />
          <div className={cn("absolute inset-0 blur-xl opacity-20 transition-opacity group-hover:opacity-40", item.glowClass)} />
        </div>

        <div className="relative z-10 space-y-1 sm:space-y-3 flex-1 min-w-0">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[7px] sm:text-[9px] font-black text-primary/60 uppercase tracking-[0.2em]">{item.label}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
            </div>
            <h3 className="font-headline font-black text-foreground uppercase tracking-tight leading-none group-hover:text-primary transition-colors truncate text-base sm:text-lg">
              {item.title}
            </h3>
          </div>
          <p className="text-[9px] sm:text-xs text-foreground/40 leading-relaxed font-medium line-clamp-2 overflow-wrap-anywhere">
            {item.desc}
          </p>
          <div className="mt-auto pt-4 sm:pt-6 flex items-center gap-2 sm:gap-2.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-primary translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            Open <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:translate-x-1 transition-transform duration-500 icon-3d" />
          </div>
        </div>
      </Card>
    </Link>
  );
});

ToolItem.displayName = 'ToolItem';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-tools?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const saved = sessionStorage.getItem(SCROLL_POS_KEY);
    if (saved) {
      window.scrollTo(0, parseInt(saved));
    }
  }, []);

  const handleToolNavigation = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SCROLL_POS_KEY, window.scrollY.toString());
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-hidden">
      <div className="w-full min-h-screen flex flex-col items-center justify-center relative text-center px-4">
        <SpaceBackground />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            My Kit Tool
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-300 font-light max-w-2xl">
            A complete suite of powerful, free, and easy-to-use online tools.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a tool..."
                className="w-full h-14 pl-12 pr-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white focus:ring-primary"
              />
            </form>
          </div>
          <div className="mt-8 flex items-center gap-4">
              <Button asChild className="h-12 px-8 rounded-full bg-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
                <Link href="/all-tools">See All Tools</Link>
              </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Heart className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-bold text-lg text-white">100% Free</h3>
              <p className="text-gray-400">No hidden costs. Ever.</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-bold text-lg text-white">Fast & Secure</h3>
              <p className="text-gray-400">Browser-based & private.</p>
            </div>
            <div className="flex flex-col items-center">
              <Smartphone className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-bold text-lg text-white">Works on Mobile</h3>
              <p className="text-gray-400">Use on any device, anytime.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Featured Tools</h2>
            <p className="mt-2 text-lg text-gray-400">A few of our most popular tools</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TOOLS.slice(0, 12).map((item) => (
            <ToolItem key={item.href} item={item} onNavigate={handleToolNavigation} />
          ))}
        </div>
      </main>
    </div>
  );
}
