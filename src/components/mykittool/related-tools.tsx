"use client"

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  User, 
  LayoutGrid, 
  FileText, 
  Eraser, 
  Volume2, 
  Mic, 
  Code2, 
  QrCode, 
  Layers, 
  Zap, 
  Clock, 
  Globe, 
  Scissors, 
  Archive, 
  FileDown, 
  Mic2, 
  Activity, 
  Smartphone, 
  Network, 
  Lock, 
  ShieldAlert, 
  Fingerprint, 
  Hash, 
  FileArchive, 
  FileEdit, 
  Monitor,
  Music,
  Maximize,
  Minimize2,
  FileImage,
  Palette,
  BookOpen,
  Calendar,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RELATED_MAP: Record<string, string[]> = {
  '/pdf-merger': ['/pdf-splitter', '/pdf-compressor', '/image-to-pdf'],
  '/pdf-splitter': ['/pdf-merger', '/pdf-compressor', '/pdf-to-image'],
  '/pdf-compressor': ['/pdf-merger', '/file-compressor', '/image-compressor'],
  '/ai-resume-builder': ['/ai-chatbot', '/ai-email-writer', '/ai-code-generator'],
  '/ai-chatbot': ['/ai-resume-builder', '/ai-email-writer', '/ai-image-generator'],
  '/ai-image-generator': ['/background-remove', '/logo-maker', '/image-to-link'],
  '/speech-to-text': ['/text-to-speech', '/voice-changer', '/vocal-separator'],
  '/text-to-speech': ['/speech-to-text', '/voice-changer', '/audio-booster'],
  '/image-converter': ['/image-resizer', '/image-compressor', '/image-to-webp'],
  '/background-remove': ['/ai-image-generator', '/photo-editor', '/image-to-link'],
  '/single': ['/bulk', '/logo-maker', '/all-tools'],
  '/bulk': ['/single', '/logo-maker', '/all-tools'],
  '/namaz-times': ['/quran-ayah', '/holidays', '/all-tools'],
  '/weather': ['/ip-finder', '/namaz-times', '/all-tools'],
  '/speed-test': ['/ip-finder', '/dns-lookup', '/website-trust-checker'],
  '/ip-finder': ['/speed-test', '/domain-whois', '/dns-lookup'],
  '/password-generator': ['/password-breach-checker', '/hash-generator', '/uuid-generator'],
  '/link-safety-checker': ['/website-trust-checker', '/domain-whois', '/ip-finder']
};

const TOOL_DETAILS: Record<string, { title: string, desc: string, icon: any }> = {
  '/pdf-splitter': { title: 'PDF Splitter', desc: 'Extract pages from documents.', icon: Scissors },
  '/pdf-compressor': { title: 'PDF Compressor', desc: 'Reduce PDF file size locally.', icon: Archive },
  '/image-to-pdf': { title: 'Image to PDF', desc: 'Convert photos into a PDF master.', icon: FileDown },
  '/pdf-merger': { title: 'PDF Merger', desc: 'Combine multiple PDF files.', icon: Layers },
  '/pdf-to-image': { title: 'PDF to Image', desc: 'Convert PDF pages to images.', icon: FileText },
  '/ai-chatbot': { title: 'AI Chatbot', desc: 'Fast linguistic synthesis assistant.', icon: MessageSquare },
  '/ai-email-writer': { title: 'AI Email Writer', desc: 'Draft professional emails instantly.', icon: Sparkles },
  '/ai-code-generator': { title: 'AI Code Gen', desc: 'Synthesize code from requests.', icon: Code2 },
  '/ai-resume-builder': { title: 'AI Resume', desc: 'Create high-fidelity resumes.', icon: User },
  '/ai-image-generator': { title: 'AI Image Gen', desc: 'Create visuals from text.', icon: Sparkles },
  '/background-remove': { title: 'BG Remove', desc: 'Isolate subjects from photos.', icon: Eraser },
  '/logo-maker': { title: 'Logo Maker', desc: 'Design premium text-based logos.', icon: Type },
  '/image-to-link': { title: 'Image to Link', desc: 'Anonymous high-res hosting.', icon: Globe },
  '/text-to-speech': { title: 'Text to Speech', desc: 'Convert text to natural audio.', icon: Volume2 },
  '/speech-to-text': { title: 'Speech to Text', desc: 'Real-time voice transcription.', icon: Mic },
  '/voice-changer': { title: 'Voice Changer', desc: 'Live acoustic modulation.', icon: Mic2 },
  '/vocal-separator': { title: 'Vocal Remover', desc: 'Reduce vocals from tracks.', icon: Music },
  '/audio-booster': { title: 'Volume Booster', desc: 'Amplify audio levels safely.', icon: Volume2 },
  '/image-resizer': { title: 'Image Resizer', desc: 'Scale pixel dimensions.', icon: Maximize },
  '/image-compressor': { title: 'Image Compressor', desc: 'Optimize imagery locally.', icon: Minimize2 },
  '/image-to-webp': { title: 'Image to WebP', desc: 'Convert to next-gen formats.', icon: FileImage },
  '/photo-editor': { title: 'Photo Studio', desc: 'Professional local editing.', icon: Palette },
  '/bulk': { title: 'Bulk QR', desc: 'Batch production engine.', icon: Layers },
  '/single': { title: 'Single Studio', desc: 'Branded QR protocols.', icon: QrCode },
  '/all-tools': { title: 'The ToolBox', desc: 'Complete studio registry.', icon: LayoutGrid },
  '/quran-ayah': { title: 'Quran Ayah', desc: 'Explore the Quranic matrix.', icon: BookOpen },
  '/holidays': { title: 'Holidays', desc: 'Global public holiday matrix.', icon: Calendar },
  '/ip-finder': { title: 'IP Finder', desc: 'Isolate network identities.', icon: Smartphone },
  '/dns-lookup': { title: 'DNS Lookup', desc: 'Clinical DNS auditing.', icon: Globe },
  '/website-trust-checker': { title: 'Trust Checker', desc: 'Domain security diagnostics.', icon: ShieldCheck },
  '/speed-test': { title: 'Speed Test', desc: 'Network pulse telemetry.', icon: Zap },
  '/password-generator': { title: 'Password Gen', desc: 'Secure entropy generation.', icon: Lock },
  '/password-breach-checker': { title: 'Breach Checker', desc: 'Verify identity exposure.', icon: ShieldAlert },
  '/hash-generator': { title: 'Hash Generator', desc: 'Binary fingerprinting.', icon: Fingerprint },
  '/uuid-generator': { title: 'UUID Generator', desc: 'Generate unique identifiers.', icon: Hash },
  '/file-compressor': { title: 'File Compressor', desc: 'Browser-side size reduction.', icon: FileArchive },
  '/markdown-preview': { title: 'MD Preview', desc: 'Real-time markup synthesis.', icon: FileEdit },
  '/code-preview': { title: 'Code Preview', desc: 'Sandboxed dev environment.', icon: Monitor },
  '/audio-booster': { title: 'Audio Booster', desc: 'Amplify signal intensity.', icon: Volume2 }
};

const FALLBACK_TOOLS = ['/ai-chatbot', '/ai-resume-builder', '/all-tools'];

export function RelatedTools() {
  const pathname = usePathname();

  const isToolPage = useMemo(() => {
    const nonToolPages = ['/', '/all-tools', '/about', '/account', '/login', '/terms', '/privacy', '/cookies', '/faq', '/donate'];
    if (nonToolPages.includes(pathname)) return false;
    if (pathname.startsWith('/share/') || pathname.startsWith('/p/')) return false;
    return true;
  }, [pathname]);

  const relatedTools = useMemo(() => {
    const paths = RELATED_MAP[pathname] || FALLBACK_TOOLS;
    return paths
      .filter(p => p !== pathname) // Don't suggest the current tool
      .map(p => ({ href: p, ...TOOL_DETAILS[p] }))
      .filter(t => t.title)
      .slice(0, 4);
  }, [pathname]);

  if (!isToolPage) return null;

  return (
    <section className="w-full py-24 border-t border-white/5 bg-black/20 mt-32 animate-in fade-in duration-1000">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-2xl md:text-4xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            You might also <span className="text-primary italic">like these tools</span>
          </h2>
          <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Extended Studio Capabilities</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group block">
              <div className="h-full p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 transition-all duration-500 hover:bg-white/[0.03] hover:border-primary/20 hover:-translate-y-1 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                    {tool.icon && <tool.icon className="w-6 h-6" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-headline font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">{tool.title}</h3>
                    <p className="text-[11px] text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter line-clamp-2">{tool.desc}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                   <span className="text-[8px] font-black text-foreground/10 group-hover:text-primary/40 uppercase tracking-[0.3em] transition-colors">Initialize</span>
                   <ArrowRight className="w-3.5 h-3.5 text-foreground/10 group-hover:text-primary/40 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
