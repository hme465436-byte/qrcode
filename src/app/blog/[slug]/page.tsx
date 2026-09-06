
"use client"

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Eraser,
  Layers,
  Archive,
  FileText,
  User,
  Clock,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BlogPost {
  title: string;
  subtitle: string;
  icon: any;
  toolUrl: string;
  toolLabel: string;
  category: 'PDF' | 'Image' | 'AI';
  steps: string[];
  tips: string[];
}

const POSTS: Record<string, BlogPost> = {
  'remove-background-free': {
    title: 'Remove Background from Image Free',
    subtitle: 'High-fidelity subject isolation via neural extraction nodes.',
    category: 'Image',
    icon: Eraser,
    toolUrl: '/background-remove',
    toolLabel: 'Launch Background Remover',
    steps: [
      'Select or drop your visual asset into the "Inbound Matrix" viewport.',
      'Initialize a session (Auth required) to maintain registry privacy.',
      'Click "Execute Extraction" to trigger the neural isolation node.',
      'Review the sanitized master in the A/B comparison visualization.',
      'Download the final master as a high-fidelity transparent PNG.'
    ],
    tips: [
      'High-contrast lighting yields the most accurate extraction.',
      'Standard limit for visuals is 10MB per handshake.',
      'Identity syncs to your profile history automatically.'
    ]
  },
  'merge-pdf-online': {
    title: 'Merge PDF Files Online',
    subtitle: 'Clinical document unification with zero-latency P2P logic.',
    category: 'PDF',
    icon: Layers,
    toolUrl: '/pdf-merger',
    toolLabel: 'Launch PDF Merger',
    steps: [
      'Drop your PDF documents into the "Sequence Manager" buffer.',
      'Rearrange the page matrix using the Up/Down arrow protocols.',
      'Click "Merge Documents" to begin the binary unification cycle.',
      'Monitor the progress bar as WASM synthesizes the master file.',
      'Save the unified document master directly to your local storage.'
    ],
    tips: [
      'The engine preserves original resolution and metadata.',
      'Merge up to 100MB of documents per session.',
      'Processing occurs 100% locally on your browser hardware.'
    ]
  },
  'compress-pdf-online': {
    title: 'Compress PDF Files Locally',
    subtitle: 'Optimize document volume through structural dictionary minification.',
    category: 'PDF',
    icon: Archive,
    toolUrl: '/pdf-compressor',
    toolLabel: 'Launch PDF Compressor',
    steps: [
      'Inject your PDF payload into the "Production Pipeline" zone.',
      'Select your compression protocol (Eco, Standard, or Intensive).',
      'Execute the "Purge" command to start structural optimization.',
      'Review the "Reduction Analytics" for final volume savings.',
      'Download the sanitized and optimized PDF master.'
    ],
    tips: [
      'Intensive mode removes unreferenced objects for max savings.',
      'A4 documents typically see 40-70% size reduction.',
      'Zero server-side transmission ensures total privacy.'
    ]
  },
  'image-to-pdf': {
    title: 'Convert Images to PDF Master',
    subtitle: 'Professional visual-to-document wrap with 1:1 pixel mapping.',
    category: 'PDF',
    icon: FileText,
    toolUrl: '/image-to-pdf',
    toolLabel: 'Launch Image to PDF',
    steps: [
      'Drop JPG, PNG, or WebP files into the "Visual Payload" area.',
      'Set your "Page Architecture" (Dynamic Fit or ISO A4).',
      'Organize the image stack in the queue pipeline.',
      'Click "Synthesize PDF" to render the document matrix.',
      'Save the final multi-page PDF master.'
    ],
    tips: [
      'Use 300 DPI settings for high-resolution print compatibility.',
      'Automatic orientation detection handles mixed P/L layouts.',
      'Binary re-synthesis purges original photo metadata.'
    ]
  },
  'ai-resume-free': {
    title: 'Make a Resume with AI',
    subtitle: 'Forging professional identities via high-entropy linguistic synthesis.',
    category: 'AI',
    icon: User,
    toolUrl: '/ai-resume-builder',
    toolLabel: 'Launch Resume Builder',
    steps: [
      'Populate the "Identity Matrix" with your skills and work history.',
      'Select a "Linguistic Tone" (Professional, Simple, or Strong).',
      'Execute the synthesis to generate the draft content.',
      'Review and refine the text in the "Executive Editor" viewport.',
      'Export the finalized resume as a print-ready PDF master.'
    ],
    tips: [
      'Achievement-based metrics improve hiring node scores.',
      'The "Strong" tone uses higher-frequency action verbs.',
      'Save drafts to your profile for future identity updates.'
    ]
  }
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const post = POSTS[slug as string];

  const relatedGuides = useMemo(() => {
    if (!post) return [];
    return Object.entries(POSTS)
      .filter(([key, p]) => key !== slug && p.category === post.category)
      .slice(0, 3);
  }, [slug, post]);

  if (!post) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-black text-foreground/40 uppercase">Node Not Found</h1>
        <Button asChild className="mt-8 h-12 px-8 rounded-xl bg-primary text-white">
           <Link href="/blog">Back to Registry</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 md:py-24 max-w-5xl">
      {/* Back Protocol */}
      <div className="mb-16 animate-reveal">
        <button 
          onClick={() => router.push('/blog')} 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all mb-10 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Guides
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
           <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shrink-0">
              <post.icon className="w-10 h-10" />
           </div>
           <div className="space-y-2 min-w-0">
              <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none truncate">{post.title}</h1>
              <div className="flex items-center gap-4">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">{post.category} PROTOCOL</p>
                 <span className="text-white/10">•</span>
                 <p className="text-sm text-foreground/40 font-medium uppercase tracking-widest">{post.subtitle}</p>
              </div>
           </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-32">
           <div className="md:col-span-8 space-y-12">
              <div className="space-y-8">
                 <h3 className="text-lg font-black text-foreground uppercase tracking-widest flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> How to use
                 </h3>
                 <div className="space-y-6">
                    {post.steps.map((step, i) => (
                      <div key={i} className="flex gap-6 group">
                         <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-[10px] font-black text-foreground/30 shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-all">
                            {i + 1}
                         </div>
                         <p className="text-[15px] sm:text-lg text-foreground/60 leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="pt-10">
                 <Button asChild className="h-20 w-full bg-primary text-white font-black text-lg uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <Link href={post.toolUrl}>
                       {post.toolLabel} <ArrowRight className="ml-4 w-6 h-6" />
                    </Link>
                 </Button>
              </div>
           </div>

           <aside className="md:col-span-4 space-y-8">
              <Card className="glass-card p-8 border-border rounded-[2.5rem] bg-black/20">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5" /> Quick Tips
                    </h4>
                    <ul className="space-y-4">
                       {post.tips.map((tip, i) => (
                         <li key={i} className="flex items-start gap-3">
                            <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                            <span className="text-[10px] font-bold text-foreground/40 leading-relaxed uppercase tracking-tighter">{tip}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-secondary/50 border border-border flex flex-col gap-6">
                 <div className="flex items-center gap-4">
                    <ShieldCheck className="w-10 h-10 text-primary/40 shrink-0" />
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-black uppercase text-foreground leading-none">Privacy First</p>
                       <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">100% Local Production</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <Clock className="w-10 h-10 text-primary/40 shrink-0" />
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-black uppercase text-foreground leading-none">Fast & Easy</p>
                       <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">No waiting in line</p>
                    </div>
                 </div>
              </div>
           </aside>
        </div>

        {/* Related Section */}
        {relatedGuides.length > 0 && (
          <section className="pt-20 border-t border-white/5 space-y-12 animate-in fade-in duration-1000">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                   <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">You might also like</h3>
                   <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em]">Related Protocols</p>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedGuides.map(([rSlug, rPost]) => (
                  <Link key={rSlug} href={`/blog/${rSlug}`} className="group block">
                    <Card className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border-white/5 hover:border-primary/30 transition-all flex flex-col h-full gap-6">
                       <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                             <rPost.icon className="w-6 h-6" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-primary transition-all" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-lg font-headline font-black text-foreground uppercase leading-tight group-hover:text-primary transition-colors">{rPost.title}</h4>
                          <p className="text-[10px] text-foreground/30 font-medium uppercase tracking-widest line-clamp-2">{rPost.subtitle}</p>
                       </div>
                    </Card>
                  </Link>
                ))}
             </div>
          </section>
        )}
      </div>
    </div>
  );
}
