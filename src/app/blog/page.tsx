
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
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    title: 'Remove Background from Image Free', 
    desc: 'Isolate subjects with 1:1 pixel fidelity using our neural extraction node.',
    shortText: 'Learn how to create high-quality transparent PNGs in seconds.',
    category: 'Image',
    icon: Eraser,
    color: 'text-emerald-500'
  },
  { 
    slug: 'merge-pdf-online', 
    title: 'Merge PDF Files Online', 
    desc: 'Unify multiple document matrices into a single professional PDF master.',
    shortText: 'Combine many documents into one clean file without losing quality.',
    category: 'PDF',
    icon: Layers,
    color: 'text-primary'
  },
  { 
    slug: 'compress-pdf-online', 
    title: 'Compress PDF Files Locally', 
    desc: 'Reduce document overhead and bitstream volume without losing clarity.',
    shortText: 'Make large PDF files smaller so they are easier to share.',
    category: 'PDF',
    icon: Archive,
    color: 'text-amber-500'
  },
  { 
    slug: 'image-to-pdf', 
    title: 'Convert Images to PDF Master', 
    desc: 'Transform visual assets into sanitized, high-resolution document wraps.',
    shortText: 'Turn your photos into a professional-looking PDF document.',
    category: 'PDF',
    icon: FileText,
    color: 'text-rose-500'
  },
  { 
    slug: 'ai-resume-free', 
    title: 'Make a Resume with AI', 
    desc: 'Synthesize a professional career identity using high-entropy linguistic protocols.',
    shortText: 'Create a job-ready resume using our advanced AI writing tool.',
    category: 'AI',
    icon: User,
    color: 'text-cyan-500'
  }
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

  const featuredPost = POSTS[0];

  return (
    <div className="container mx-auto px-6 py-10 md:py-16 max-w-6xl">
      {/* Header Matrix */}
      <div className="mb-12 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-all mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-1">
               <BookOpen className="w-3.5 h-3.5" /> Intelligence Matrix
             </div>
             <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
               Studio <span className="text-primary italic">Guides</span>
             </h1>
             <p className="text-[11px] md:text-sm text-foreground/40 font-medium max-w-xl uppercase tracking-widest leading-relaxed">
               Simple how-to for My Kit Tool. Master your professional workflow with high-fidelity instructional protocols.
             </p>
          </div>

          <div className="flex flex-col gap-4 w-full lg:w-80">
            <div className="relative group/search">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
               <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides..."
                className="h-11 pl-12 bg-secondary/50 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest"
               />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {['all', 'PDF', 'Image', 'AI'].map((c) => (
                 <button
                  key={c}
                  onClick={() => setActiveCategory(c as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeCategory === c ? "bg-primary text-white border-primary shadow-lg" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
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
        <section className="mb-12 animate-reveal stagger-1">
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <Card className="glass-card border-primary/20 bg-primary/[0.03] p-6 sm:p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col lg:flex-row items-center gap-8">
               <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
               <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] bg-background border-4 border-primary/20 flex items-center justify-center shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-700">
                  <featuredPost.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
               </div>
               <div className="flex-1 space-y-4 text-center lg:text-left min-w-0">
                  <div className="space-y-2">
                     <Badge className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-3 py-0.5">Featured Protocol</Badge>
                     <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight leading-tight">{featuredPost.title}</h2>
                     <p className="text-base text-foreground/40 font-medium leading-relaxed max-w-2xl">{featuredPost.desc}</p>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                     <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Read Full Guide</span>
                     <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1.5 transition-transform" />
                  </div>
               </div>
            </Card>
          </Link>
        </section>
      )}

      {/* Grid Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredPosts.map((post, i) => {
          if (!searchQuery && activeCategory === 'all' && post.slug === featuredPost.slug) return null;
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block animate-reveal" style={{ animationDelay: `${i * 50}ms` }}>
              <Card className="glass-card border-white/5 bg-secondary/10 hover:border-primary/30 hover:bg-secondary/20 transition-all duration-500 p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col h-full">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 
                 <div className="flex items-start justify-between mb-8">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl bg-background border border-white/5 flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3",
                      post.color
                    )}>
                        <post.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="bg-background/50 border-white/5 text-[7px] font-black uppercase tracking-widest text-foreground/20">{post.category}</Badge>
                 </div>

                 <div className="flex-1 space-y-3 min-w-0">
                    <div className="space-y-1.5">
                       <h2 className="text-lg sm:text-xl font-headline font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-2">
                          {post.title}
                       </h2>
                       <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase tracking-widest line-clamp-2">
                          {post.shortText}
                       </p>
                    </div>
                 </div>

                 <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                    <span className="text-[9px] font-black uppercase text-foreground/20 group-hover:text-primary tracking-[0.3em] transition-colors">Read Protocol</span>
                    <ChevronRight size={16} className="text-foreground/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                 </div>
              </Card>
            </Link>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-10 flex flex-col items-center gap-6">
             <LayoutGrid className="w-16 h-16 text-primary" />
             <div className="space-y-1">
                <p className="font-headline font-black text-2xl uppercase tracking-widest">Zero Matches</p>
                <p className="text-xs font-bold uppercase">Linguistic signal not identified in current guides.</p>
             </div>
          </div>
        )}
      </div>
      
      {/* Footer Signal */}
      <div className="pt-16 border-t border-white/5 text-center">
         <p className="text-[8px] font-black text-foreground/10 uppercase tracking-[0.5em]">Linguistic Knowledge Matrix v7.3</p>
      </div>
    </div>
  );
}
