"use client"

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowLeft, 
  ChevronRight, 
  FileText, 
  Eraser, 
  Layers, 
  Archive, 
  User,
  Search,
  Sparkles,
  Zap,
  LayoutGrid,
  Mail,
  Activity,
  Code2,
  Mic,
  Volume2,
  Wand2,
  Music,
  QrCode,
  Globe,
  Database,
  SearchCode,
  Lock,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostMetadata {
  slug: string;
  title: string;
  desc: string;
  shortText: string;
  category: 'PDF' | 'Image' | 'AI';
  icon: any;
  color: string;
}

const POSTS: PostMetadata[] = [
  { 
    slug: 'remove-background-free', 
    title: 'Remove Image Background', 
    desc: 'Isolate subjects with 1:1 pixel fidelity using our neural extraction node.',
    shortText: 'Create high-quality transparent PNGs in seconds.',
    category: 'Image',
    icon: Eraser,
    color: 'text-emerald-500'
  },
  { 
    slug: 'merge-pdf-online', 
    title: 'Merge PDF Files Online', 
    desc: 'Unify multiple document matrices into a single professional PDF master.',
    shortText: 'Combine many documents into one clean file.',
    category: 'PDF',
    icon: Layers,
    color: 'text-primary'
  },
  { 
    slug: 'compress-pdf-online', 
    title: 'Compress PDF Files Locally', 
    desc: 'Reduce document overhead and bitstream volume without losing clarity.',
    shortText: 'Make large PDF files smaller for easier sharing.',
    category: 'PDF',
    icon: Archive,
    color: 'text-amber-500'
  },
  { 
    slug: 'image-to-pdf', 
    title: 'Convert Images to PDF Master', 
    desc: 'Transform visual assets into sanitized, high-resolution document wraps.',
    shortText: 'Turn your photos into a professional PDF document.',
    category: 'PDF',
    icon: FileText,
    color: 'text-rose-500'
  },
  { 
    slug: 'ai-resume-free', 
    title: 'Make a Resume with AI', 
    desc: 'Synthesize a professional career identity using high-entropy linguistic protocols.',
    shortText: 'Create a job-ready resume using our advanced AI tool.',
    category: 'AI',
    icon: User,
    color: 'text-cyan-500'
  },
  { 
    slug: 'ai-email-writer-guide', 
    title: 'Write Emails with AI', 
    desc: 'Draft professional executive communications with precision tone control.',
    shortText: 'Compose perfect emails for work or personal use instantly.',
    category: 'AI',
    icon: Mail,
    color: 'text-indigo-500'
  }
];

const ALL_TOOLS = [
  { name: 'AI Chatbot', href: '/ai-chatbot', howTo: 'Type any request to get instant high-fidelity AI responses.' },
  { name: 'AI Resume Builder', href: '/ai-resume-builder', howTo: 'Enter your history to synthesize a professional PDF resume.' },
  { name: 'AI Email Writer', href: '/ai-email-writer', howTo: 'Set a purpose and tone to draft perfect emails instantly.' },
  { name: 'AI Code Generator', href: '/ai-code-generator', howTo: 'Describe a logic task to generate clean source code.' },
  { name: 'AI Image Generator', href: '/ai-image-generator', howTo: 'Turn text descriptions into high-quality visual assets.' },
  { name: 'Speech to Text', href: '/speech-to-text', howTo: 'Speak into your mic to transcribe audio into a text matrix.' },
  { name: 'Text to Speech', href: '/text-to-speech', howTo: 'Enter text to generate natural-sounding voice audio.' },
  { name: 'Photo Enhance', href: '/photo-enhance-fix', howTo: 'Upload blurry photos to sharpen and upscale resolution.' },
  { name: 'Single QR Studio', href: '/single', howTo: 'Create custom QR codes with logos and AI backgrounds.' },
  { name: 'Background Remove', href: '/background-remove', howTo: 'Isolate any subject and save as a transparent PNG.' },
  { name: 'Image to Link', href: '/image-to-link', howTo: 'Upload any image to get a shareable direct web link.' },
  { name: 'PDF Merger', href: '/pdf-merger', howTo: 'Combine multiple PDF files into one master document.' },
  { name: 'PDF Splitter', href: '/pdf-splitter', howTo: 'Extract specific pages or ranges from a PDF file.' },
  { name: 'PDF Compressor', href: '/pdf-compressor', howTo: 'Reduce the file size of your PDFs locally and securely.' },
  { name: 'Word to PDF', href: '/word-to-pdf', howTo: 'Convert .docx files into professional PDF documents.' },
  { name: 'Image to PDF', href: '/image-to-pdf', howTo: 'Wrap your images into a high-resolution PDF bundle.' },
  { name: 'Units Converter', href: '/all-units-converter', howTo: 'Translate measurements across 12 different categories.' },
  { name: 'Speed Test', href: '/speed-test', howTo: 'Measure your internet download, upload, and ping rate.' },
  { name: 'IP Finder', href: '/ip-finder', howTo: 'Identify any IP address location and ISP data.' },
  { name: 'Fake Data Gen', href: '/fake-data', howTo: 'Forge test datasets for software development and staging.' },
  { name: 'Password Gen', href: '/password-generator', howTo: 'Synthesize secure random passwords for your accounts.' },
  { name: 'Breach Checker', href: '/password-breach-checker', howTo: 'Verify if your passwords have been leaked online.' },
  { name: 'Trust Checker', href: '/website-trust-checker', howTo: 'Audit any website for security and reputation risk.' },
  { name: 'Site Cloner', href: '/site-backup-cloner', howTo: 'Save a backup of any public website frontend as a ZIP.' },
  { name: 'Whois Lookup', href: '/domain-whois', howTo: 'Find the age and registration details of any domain.' },
  { name: 'DNS Lookup', href: '/dns-lookup', howTo: 'Isolate technical A, MX, and TXT records for a domain.' },
  { name: 'GitHub Finder', href: '/github-user', howTo: 'Find public profile data and repos for any GitHub user.' },
  { name: 'Temp Mail', href: '/temp-mail', howTo: 'Generate a disposable email to receive codes and messages.' },
  { name: 'Gmail Alias', href: '/gmail-alias', howTo: 'Create thousands of variations of your Gmail address.' },
  { name: 'Translate Studio', href: '/translate', howTo: 'Translate text between English and Urdu with 1:1 fidelity.' },
  { name: 'Weather Intel', href: '/weather', howTo: 'Get real-time global weather and 7-day projections.' },
  { name: 'Namaz Times', href: '/namaz-times', howTo: 'Get local prayer timings with Hijri date sync.' },
  { name: 'Quran Ayah', href: '/quran-ayah', howTo: 'Discover Quranic verses with Arabic, English, and Urdu text.' },
  { name: 'WPS Sheets', href: '/wps-sheets', howTo: 'Edit Excel and CSV files locally in your browser.' },
  { name: 'Bio Maker', href: '/bio-maker', howTo: 'Create unique social media bios with special fonts.' },
  { name: 'Nickname Gen', href: '/nickname-generator', howTo: 'Design cool gamertags with stylized symbols.' },
  { name: 'Word Counter', href: '/word-counter', howTo: 'Count words, characters, and estimate reading time.' },
  { name: 'JSON Formatter', href: '/json-formatter', howTo: 'Validate and beautify messy JSON code instantly.' },
  { name: 'Text Repeater', href: '/repeater', howTo: 'Multiply any text or emoji up to 5,000 times.' },
  { name: 'Dot Art Studio', href: '/dot-art', howTo: 'Convert any photo into Braille character art.' },
  { name: 'Letter Art', href: '/letter-art', howTo: 'Turn images into text art using your custom letters.' },
  { name: 'Logo Maker', href: '/logo-maker', howTo: 'Design a high-res text logo for your brand or app.' },
  { name: 'Photo Editor', href: '/photo-editor', howTo: 'Adjust colors, draw, and add text to your photos.' },
  { name: 'Image Resizer', href: '/image-resizer', howTo: 'Change the pixel width and height of any image.' },
  { name: 'Image Compressor', href: '/image-compressor', howTo: 'Make image files smaller while keeping quality high.' },
  { name: 'Vocal Remover', href: '/vocal-separator', howTo: 'Remove voices from any song to make a karaoke track.' },
  { name: 'Video to MP3', href: '/video-to-audio', howTo: 'Extract the audio track from any video file.' },
  { name: 'Video to GIF', href: '/video-to-gif', howTo: 'Turn any video clip into an animated GIF.' },
  { name: 'Reverse Video', href: '/reverse-video', howTo: 'Play any video backwards using local WASM logic.' },
  { name: 'Audio Joiner', href: '/audio-joiner', howTo: 'Merge multiple audio tracks into one single file.' },
  { name: 'Volume Booster', href: '/audio-booster', howTo: 'Increase the volume of quiet audio files safely.' },
  { name: 'HTML to URL', href: '/html-to-url', howTo: 'Convert your HTML code into a direct shareable link.' },
  { name: 'Site Rescue', href: '/html-site-rescue', howTo: 'Recover messy frontend code into a clean ZIP bundle.' },
  { name: 'Temp Room', href: '/temp-room', howTo: 'Share a live notepad and chat with another device P2P.' },
  { name: 'Hide in Photo', href: '/hide-message-photo', howTo: 'Hide secret messages inside any image file.' },
  { name: 'Direct File Share', href: '/direct-file-share', howTo: 'Send large files directly to a friend via P2P link.' },
  { name: 'WiFi QR Decoder', href: '/wifi-qr-decoder', howTo: 'Scan a WiFi QR to reveal the hidden password.' },
  { name: 'PNG Finder', href: '/png-finder', howTo: 'Search and download transparent images for design.' },
  { name: 'Icon Studio', href: '/icon-studio', howTo: 'Search and recolor 100k+ vector icons locally.' },
  { name: 'Mouse Cursor Maker', href: '/mouse-cursor-maker', howTo: 'Convert any image into a Windows .cur mouse file.' },
  { name: 'Metadata Remover', href: '/metadata-remover', howTo: 'Purge GPS and EXIF data from photos for privacy.' },
  { name: 'EXIF Viewer', href: '/exif-viewer', howTo: 'See the hidden technical data inside any photo.' },
  { name: 'Age Calculator', href: '/age-calculator', howTo: 'Calculate exact age down to the day with precision.' },
  { name: 'BMI Calculator', href: '/bmi-calculator', howTo: 'Check your health index using height and weight.' },
  { name: 'Tax Calculator', href: '/tax-calculator', howTo: 'Calculate sales tax or reverse prices easily.' },
  { name: 'Hash Generator', href: '/hash-generator', howTo: 'Create secure MD5 or SHA fingerprints for data.' },
  { name: 'UUID Generator', href: '/uuid-generator', howTo: 'Generate unique IDs for coding and databases.' },
  { name: 'Regex Tester', href: '/regex-tester', howTo: 'Test your regular expressions against real text.' },
  { name: 'Code Converter', href: '/code-converter', howTo: 'Convert code patterns for technical debugging.' },
  { name: 'Markdown Preview', href: '/markdown-preview', howTo: 'Write and preview Markdown documentation live.' },
  { name: 'Code Preview Lab', href: '/code-preview', howTo: 'Test your HTML/CSS projects in a secure sandbox.' },
  { name: 'Media Downloader', href: '/media-downloader', howTo: 'Download video and audio from direct URLs.' },
  { name: 'Image URL Downloader', href: '/image-url-downloader', howTo: 'Extract and save images from any website link.' },
];

export default function BlogLandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'PDF' | 'Image' | 'AI'>('all');

  const filteredPosts = useMemo(() => {
    return POSTS.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.howTo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const featuredPost = POSTS[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-5xl bg-[#02040a] min-h-screen">
      {/* Header Matrix */}
      <div className="mb-8 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 hover:text-primary transition-all mb-6 group">
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
               <BookOpen className="w-3 h-3" /> Knowledge Matrix
             </div>
             <h1 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tight leading-none">
               Studio <span className="text-primary italic">Guides</span>
             </h1>
             <p className="text-[10px] md:text-[12px] text-white/40 font-medium max-w-lg uppercase tracking-widest leading-relaxed">
               Simple how-to for My Kit Tool. Master your professional workflow.
             </p>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-72">
            <div className="relative group/search">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
               <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search protocols..."
                className="h-10 pl-10 bg-secondary/50 border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest"
               />
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
               {['all', 'PDF', 'Image', 'AI'].map((c) => (
                 <button
                  key={c}
                  onClick={() => setActiveCategory(c as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeCategory === c ? "bg-primary text-white border-primary shadow-md" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                  )}
                 >
                   {c}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="mb-10 animate-reveal">
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <Card className="glass-card border-primary/20 bg-primary/[0.02] p-6 rounded-[2rem] relative overflow-hidden flex flex-col lg:flex-row items-center gap-6">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
               <div className="w-16 h-16 rounded-[1.5rem] bg-background border-4 border-primary/20 flex items-center justify-center shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-700">
                  <featuredPost.icon className="w-8 h-8 text-primary" />
               </div>
               <div className="flex-1 space-y-3 text-center lg:text-left min-w-0">
                  <div className="space-y-1.5">
                     <Badge className="bg-primary text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5">Featured Protocol</Badge>
                     <h2 className="text-xl sm:text-3xl font-headline font-black text-white uppercase tracking-tight leading-tight">{featuredPost.title}</h2>
                     <p className="text-[12px] text-white/40 font-medium leading-relaxed max-w-xl">{featuredPost.desc}</p>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                     <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Read Full Guide</span>
                     <ChevronRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </Card>
          </Link>
        </section>
      )}

      {/* Trending Detailed Guides */}
      <div className="space-y-4 mb-16">
        <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-2">Trending Protocols</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post, i) => {
            if (!searchQuery && activeCategory === 'all' && post.slug === featuredPost.slug) return null;
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block animate-reveal" style={{ animationDelay: `${i * 30}ms` }}>
                <Card className="glass-card border-white/5 bg-secondary/10 hover:border-primary/30 hover:bg-secondary/20 transition-all duration-500 p-5 rounded-2xl relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="flex items-start justify-between mb-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-background border border-white/5 flex items-center justify-center shadow-lg transition-all duration-700 group-hover:scale-110",
                        post.color
                      )}>
                          <post.icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="bg-background/50 border-white/5 text-[6px] font-black uppercase tracking-widest text-white/20">{post.category}</Badge>
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                      <div className="space-y-1">
                        <h2 className="text-base font-headline font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-1">
                            {post.title}
                        </h2>
                        <p className="text-[10px] text-white/30 font-medium leading-relaxed uppercase tracking-tighter line-clamp-2">
                            {post.shortText}
                        </p>
                      </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                      <span className="text-[7px] font-black uppercase text-white/10 group-hover:text-primary tracking-[0.3em] transition-colors">Read</span>
                      <ChevronRight size={12} className="text-white/10 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ALL TOOLS COMPACT GUIDES */}
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-3 px-2">
           <LayoutGrid className="w-4 h-4 text-primary/40" />
           <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Complete Registry</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
           {filteredTools.map((tool, i) => (
             <Card key={i} className="glass-card p-4 rounded-xl border-white/5 bg-white/[0.01] hover:border-primary/20 transition-all group">
                <div className="space-y-2.5">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[150px] group-hover:text-primary transition-colors">{tool.name}</h4>
                   </div>
                   <p className="text-[9px] text-white/30 font-medium leading-relaxed uppercase tracking-tighter line-clamp-2 min-h-[26px]">
                      {tool.howTo}
                   </p>
                   <div className="pt-2.5 border-t border-white/5">
                      <Button asChild variant="ghost" className="h-8 w-full rounded-lg bg-primary/5 text-primary text-[7px] font-black uppercase hover:bg-primary hover:text-white transition-all">
                         <Link href={tool.href}>Initialize <ArrowRight className="w-2.5 h-2.5 ml-1.5" /></Link>
                      </Button>
                   </div>
                </div>
             </Card>
           ))}

           {filteredTools.length === 0 && (
             <div className="col-span-full py-12 text-center opacity-10">
                <Search className="w-10 h-10 mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">Zero Matches identified</p>
             </div>
           )}
        </div>
      </div>
      
      {/* Footer Signal */}
      <div className="pt-10 border-t border-white/5 text-center">
         <p className="text-[7px] font-black text-white/5 uppercase tracking-[0.5em]">Linguistic Knowledge Matrix v7.3</p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/10 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
