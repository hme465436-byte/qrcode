
"use client"

import React, { useMemo, useEffect } from 'react';
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
  BookOpen,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BlogPost {
  seoTitle: string;
  h1: string;
  subtitle: string;
  intro: string;
  icon: any;
  toolUrl: string;
  toolLabel: string;
  category: 'PDF' | 'Image' | 'AI';
  steps: string[];
  tips: string[];
}

const POSTS: Record<string, BlogPost> = {
  'remove-background-free': {
    seoTitle: 'How to remove background from an image for free | My Kit Tool',
    h1: 'Remove Image Background for Free',
    subtitle: 'Isolate subjects instantly with high-fidelity neural extraction.',
    intro: 'Removing backgrounds is essential for creating professional product photos, transparent logos, and creative composites. Our studio uses advanced local processing to ensure your images are sanitized without losing quality.',
    category: 'Image',
    icon: Eraser,
    toolUrl: '/background-remove',
    toolLabel: 'Initialize Background Remover',
    steps: [
      'Import or drop your visual asset into the "Inbound Matrix" viewport.',
      'Initialize your session to maintain local registry privacy.',
      'Execute the neural isolation protocol to strip the background.',
      'Download your final master as a high-fidelity transparent PNG.'
    ],
    tips: [
      'High-contrast lighting yields the most accurate extraction.',
      'Standard limit for visuals is 10MB per handshake.',
      'Identity syncs to your profile history automatically.'
    ]
  },
  'merge-pdf-online': {
    seoTitle: 'How to merge PDF files online | My Kit Tool',
    h1: 'Merge PDF Files Online',
    subtitle: 'Combine multiple documents into one professional PDF master.',
    intro: 'Unified documentation is key for professional reporting and archival. Our merger utility allows you to organize multiple PDF files into a single, cohesive document with zero-latency local logic.',
    category: 'PDF',
    icon: Layers,
    toolUrl: '/pdf-merger',
    toolLabel: 'Initialize PDF Merger',
    steps: [
      'Drop your PDF documents into the "Sequence Manager" buffer.',
      'Arrange the document matrix using the reordering controls.',
      'Execute the merge protocol to unify the binary data.',
      'Save the final unified PDF master directly to your device.'
    ],
    tips: [
      'The engine preserves original resolution and metadata.',
      'Merge up to 100MB of documents per session.',
      'Processing occurs 100% locally on your browser hardware.'
    ]
  },
  'compress-pdf-online': {
    seoTitle: 'How to compress a PDF file | My Kit Tool',
    h1: 'Compress PDF Files Online',
    subtitle: 'Reduce document size via structural dictionary minification.',
    intro: 'Large PDF files can be difficult to share or upload. Our compression studio optimizes your document volume by cleaning internal metadata and compacting the file structure locally.',
    category: 'PDF',
    icon: Archive,
    toolUrl: '/pdf-compressor',
    toolLabel: 'Initialize PDF Compressor',
    steps: [
      'Inject your PDF payload into the "Production Pipeline" zone.',
      'Select a compression protocol (Eco, Standard, or Intensive).',
      'Execute the purge command to start structural optimization.',
      'Download the optimized PDF master with reduced file size.'
    ],
    tips: [
      'Intensive mode removes unreferenced objects for max savings.',
      'A4 documents typically see 40-70% size reduction.',
      'Zero server-side transmission ensures total privacy.'
    ]
  },
  'image-to-pdf': {
    seoTitle: 'How to convert images to PDF | My Kit Tool',
    h1: 'Convert Images to PDF Master',
    subtitle: 'Professional visual-to-document wrap with 1:1 pixel mapping.',
    intro: 'Transforming photos into a document format is perfect for portfolios, reports, and digital books. This tool wraps your images into a high-resolution PDF while maintaining original visual fidelity.',
    category: 'PDF',
    icon: FileText,
    toolUrl: '/image-to-pdf',
    toolLabel: 'Initialize Image to PDF',
    steps: [
      'Drop JPG, PNG, or WebP files into the "Visual Payload" area.',
      'Configure your page architecture as Dynamic Fit or ISO A4.',
      'Synthesize the PDF to render the document matrix.',
      'Export and save the final multi-page PDF master.'
    ],
    tips: [
      'Use 300 DPI settings for high-resolution print compatibility.',
      'Automatic orientation detection handles mixed P/L layouts.',
      'Binary re-synthesis purges original photo metadata.'
    ]
  },
  'ai-resume-free': {
    seoTitle: 'How to make a resume with AI | My Kit Tool',
    h1: 'Create a Professional Resume with AI',
    subtitle: 'Forging career identities via high-entropy linguistic synthesis.',
    intro: 'A well-structured resume is the foundation of professional growth. Our AI-driven builder uses impactful action verbs and achieves consistent formatting to pass automated screening nodes.',
    category: 'AI',
    icon: User,
    toolUrl: '/ai-resume-builder',
    toolLabel: 'Initialize Resume Builder',
    steps: [
      'Populate the identity matrix with your skills and work history.',
      'Select your preferred tone (Professional, Simple, or Strong).',
      'Execute the AI synthesis to generate your draft content.',
      'Export the finalized resume as a print-ready PDF master.'
    ],
    tips: [
      'Achievement-based metrics improve hiring node scores.',
      'The "Strong" tone uses higher-frequency action verbs.',
      'Save drafts to your profile for future identity updates.'
    ]
  },
  'ai-email-writer-guide': {
    seoTitle: 'How to write an email with AI | My Kit Tool',
    h1: 'Write Professional Emails with AI',
    subtitle: 'Compose executive communications via high-fidelity synthesis.',
    intro: 'Writing clear, concise emails can take time. Our AI email studio drafts professional messages for any purpose, from job applications to client follow-ups, with precision tone control.',
    category: 'AI',
    icon: Mail,
    toolUrl: '/ai-email-writer',
    toolLabel: 'Initialize Email Writer',
    steps: [
      'Specify the email purpose and the intended recipient.',
      'Select a linguistic tone that matches your communication style.',
      'Synthesize the subject and body via the AI engine.',
      'Copy the final result to your clipboard for instant use.'
    ],
    tips: [
      'Using the "Short" length protocol is best for mobile recipients.',
      'The "Professional" tone is optimized for corporate networking.',
      'Always verify placeholders like [Your Name] before sending.'
    ]
  }
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const post = POSTS[slug as string];

  useEffect(() => {
    if (post) {
      document.title = post.seoTitle;
    }
  }, [post]);

  const relatedGuides = useMemo(() => {
    if (!post) return [];
    return Object.entries(POSTS)
      .filter(([key, p]) => key !== slug && p.category === post.category)
      .slice(0, 3);
  }, [slug, post]);

  if (!post) {
    return (
      <div className="container mx-auto px-6 py-32 text-center bg-[#0a0a0c] min-h-screen">
        <h1 className="text-2xl font-black text-white/40 uppercase">Protocol Not Found</h1>
        <Button asChild className="mt-8 h-12 px-8 rounded-xl bg-primary text-white">
           <Link href="/blog">Back to Registry</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0c] min-h-screen selection:bg-primary/20">
      <div className="container mx-auto px-6 py-12 md:py-24 max-w-5xl">
        {/* Back Protocol */}
        <div className="mb-16 animate-reveal">
          <button 
            onClick={() => router.push('/blog')} 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all mb-10 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Guides
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shrink-0">
                <post.icon className="w-10 h-10" />
            </div>
            <div className="space-y-2 min-w-0">
                <h1 className="text-4xl md:text-6xl font-headline font-black text-white uppercase tracking-tight leading-none truncate">
                  {post.h1}
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{post.category} PROTOCOL</p>
                  <span className="text-white/10">•</span>
                  <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Guide</p>
                </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-32">
            <div className="md:col-span-8 space-y-12">
                <div className="space-y-6">
                   <p className="text-lg text-white/60 leading-relaxed font-medium">
                     {post.intro}
                   </p>
                </div>

                <div className="space-y-8">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> Execution Protocol
                  </h3>
                  <div className="space-y-6">
                      {post.steps.map((step, i) => (
                        <div key={i} className="flex gap-6 group">
                          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30 shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-all">
                              {i + 1}
                          </div>
                          <p className="text-[15px] sm:text-lg text-white/60 leading-relaxed pt-1">{step}</p>
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
                <Card className="glass-card p-8 border-white/10 rounded-[2.5rem] bg-black/20">
                  <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Studio Tips
                      </h4>
                      <ul className="space-y-4">
                        {post.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-3">
                              <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                              <span className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-tighter">{tip}</span>
                          </li>
                        ))}
                      </ul>
                  </div>
                </Card>

                <div className="p-8 rounded-[2.5rem] bg-secondary/50 border border-white/5 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                      <ShieldCheck className="w-10 h-10 text-primary/40 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase text-white leading-none">Privacy Safe</p>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">100% Local Logic</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <Clock className="w-10 h-10 text-primary/40 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase text-white leading-none">Fast & Easy</p>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Zero latency sync</p>
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
                    <h3 className="text-xl font-headline font-black text-white uppercase tracking-tight">You might also like</h3>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Related Guides</p>
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
                            <h4 className="text-lg font-headline font-black text-white uppercase leading-tight group-hover:text-primary transition-colors">{rPost.h1}</h4>
                            <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest line-clamp-2">{rPost.subtitle}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
