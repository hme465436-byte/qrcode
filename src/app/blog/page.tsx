"use client"

import React from 'react';
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
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const POSTS = [
  { 
    slug: 'remove-background-free', 
    title: 'Remove Background from Image Free', 
    desc: 'Isolate subjects with 1:1 pixel fidelity using our neural extraction node.',
    icon: Eraser,
    color: 'text-emerald-500'
  },
  { 
    slug: 'merge-pdf-online', 
    title: 'Merge PDF Files Online', 
    desc: 'Unify multiple document matrices into a single professional PDF master.',
    icon: Layers,
    color: 'text-primary'
  },
  { 
    slug: 'compress-pdf-online', 
    title: 'Compress PDF Files Locally', 
    desc: 'Reduce document overhead and bitstream volume without losing clarity.',
    icon: Archive,
    color: 'text-amber-500'
  },
  { 
    slug: 'image-to-pdf', 
    title: 'Convert Images to PDF Master', 
    desc: 'Transform visual assets into sanitized, high-resolution document wraps.',
    icon: FileText,
    color: 'text-rose-500'
  },
  { 
    slug: 'ai-resume-free', 
    title: 'Make a Resume with AI', 
    desc: 'Synthesize a professional career identity using high-entropy linguistic protocols.',
    icon: User,
    color: 'text-cyan-500'
  }
];

export default function BlogLandingPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:py-24 max-w-5xl">
      <div className="mb-16 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <BookOpen className="w-3.5 h-3.5" /> Knowledge Base
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-none mb-6">
          Studio <span className="text-primary italic">Guides</span>
        </h1>
        <p className="text-lg text-foreground/40 font-medium leading-relaxed max-w-2xl uppercase tracking-tighter">
          Master your professional workflow with high-fidelity instructional matrices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {POSTS.map((post, i) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <Card className="glass-card border-white/5 bg-secondary/10 hover:border-primary/20 hover:bg-secondary/20 transition-all duration-500 p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex flex-col sm:flex-row sm:items-center gap-8 relative z-10">
                  <div className={cn("w-16 h-16 rounded-2xl bg-background border border-white/5 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110", post.color)}>
                     <post.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 space-y-2">
                     <h2 className="text-xl sm:text-2xl font-headline font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{post.title}</h2>
                     <p className="text-xs sm:text-sm text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter">{post.desc}</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-foreground/10 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                     <ChevronRight className="w-5 h-5" />
                  </div>
               </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
