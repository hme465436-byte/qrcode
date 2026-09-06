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
  User 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
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
      {/* Header Matrix */}
      <div className="mb-20 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-all mb-12 group">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>
        
        <div className="space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-2">
             <BookOpen className="w-3.5 h-3.5" /> Intelligence Matrix
           </div>
           <h1 className="text-5xl md:text-8xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
             Studio <span className="text-primary italic">Guides</span>
           </h1>
           <p className="text-sm md:text-base text-foreground/40 font-medium max-w-xl uppercase tracking-widest leading-relaxed">
             Simple how-to for My Kit Tool. Master your professional workflow with high-fidelity instructional protocols.
           </p>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-20">
        {POSTS.map((post, i) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <Card className="glass-card border-white/5 bg-secondary/10 hover:border-primary/30 hover:bg-secondary/20 transition-all duration-500 p-8 sm:p-12 rounded-[3rem] relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-10">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               
               {/* Icon Node */}
               <div className={cn(
                 "w-20 h-20 rounded-[2.2rem] bg-background border border-white/5 flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 group-hover:border-primary/20 shrink-0",
                 post.color
               )}>
                  <post.icon className="w-10 h-10" />
               </div>

               {/* Content Matrix */}
               <div className="flex-1 space-y-4 min-w-0">
                  <div className="space-y-1">
                     <h2 className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                        {post.title}
                     </h2>
                     <p className="text-xs sm:text-sm text-foreground/40 font-medium leading-relaxed uppercase tracking-widest">
                        {post.desc}
                     </p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-2">
                     <div className="h-px w-8 bg-white/10 group-hover:w-12 group-hover:bg-primary/40 transition-all" />
                     <span className="text-[10px] font-black uppercase text-foreground/20 group-hover:text-primary tracking-[0.3em] transition-colors">Read Protocol</span>
                  </div>
               </div>

               {/* Forward Signal */}
               <div className="hidden lg:flex w-12 h-12 rounded-full bg-white/5 items-center justify-center text-foreground/10 group-hover:text-primary group-hover:bg-primary/10 transition-all group-hover:translate-x-2">
                  <ChevronRight className="w-6 h-6" />
               </div>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Footer Signal */}
      <div className="mt-20 pt-20 border-t border-white/5 text-center">
         <p className="text-[9px] font-black text-foreground/10 uppercase tracking-[0.5em]">Linguistic Knowledge Matrix v7.2</p>
      </div>
    </div>
  );
}
