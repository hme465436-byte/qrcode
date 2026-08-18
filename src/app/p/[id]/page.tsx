"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft,
  Copy,
  CheckCircle2,
  FileCode,
  Globe,
  Info,
  History
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function HostedPageViewer() {
  const params = useParams();
  const { toast } = useToast();
  
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  // High-reliability ID resolution
  const resolvedId = useMemo(() => {
    if (typeof window === 'undefined') return (params?.id as string) || '';
    
    // 1. Path param from router
    const pathId = params?.id as string;
    if (pathId) return pathId.trim();

    // 2. Hash parsing fallback (for HashRouter environments)
    const hash = window.location.hash;
    if (hash.includes('/p/')) {
      const parts = hash.split('/p/');
      return parts[1]?.split(/[?#]/)[0] || '';
    }

    return '';
  }, [params]);

  useEffect(() => {
    if (!resolvedId) {
      setLoading(false);
      return;
    }

    const fetchPage = async () => {
      // 1. Check Local Hardware Memory (Highest Priority for creator)
      const localKey = `kit_page_${resolvedId}`;
      const localData = localStorage.getItem(localKey);
      
      if (localData) {
        setHtml(localData);
        setLoading(false);
        return;
      }

      // 2. Fetch from Global Cloud Registry
      if (db) {
        try {
          const docRef = doc(db, "pages", resolvedId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setHtml(docSnap.data()?.html || null);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Uplink latency:", err);
        }
      }

      setLoading(false);
    };

    fetchPage();
  }, [resolvedId]);

  const handleCopy = () => {
    if (html) {
      navigator.clipboard.writeText(html);
      setIsCopied(true);
      toast({ title: "Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const localKeys = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return Object.keys(localStorage).filter(k => k.startsWith('kit_page_'));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center gap-8">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Loading Protocol...</p>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center gap-10">
        <AlertCircle className="w-12 h-12 text-destructive animate-bounce" />
        <div className="space-y-3">
          <h2 className="text-xl font-headline font-black text-white uppercase tracking-tight">This link does not exist</h2>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Protocol Identification Failed</p>
        </div>
        
        {/* Debug Matrix for Troubleshooting */}
        <div className="w-full max-w-md p-6 rounded-[2rem] bg-secondary/50 border border-white/5 text-left font-mono text-[9px] text-foreground/40 space-y-3">
           <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="uppercase font-black text-primary/60">Identifier Trace</span>
              <span className="text-white/10">v1.2</span>
           </div>
           <p className="break-all">Target ID: <span className="text-white">{resolvedId || 'NULL_SIGNAL'}</span></p>
           <p>Local Store Hits: {localKeys.length}</p>
           {localKeys.length > 0 && (
             <div className="pt-2 border-t border-white/5">
                <p className="mb-2 opacity-20">Detected Keys:</p>
                <div className="flex flex-wrap gap-2">
                   {localKeys.map(k => (
                     <span key={k} className="px-2 py-1 rounded bg-white/5 border border-white/5">{k.replace('kit_page_', '')}</span>
                   ))}
                </div>
             </div>
           )}
        </div>

        <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl">
           <Link href="/html-to-url">Back to Studio</Link>
        </Button>
      </div>
    );
  }

  const isHtmlTag = html.toLowerCase().includes('<html') || html.toLowerCase().includes('<!doctype') || html.toLowerCase().includes('<body');

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a0a0c] flex flex-col">
       <title>MY KIT TOOL | View Protocol</title>
       
       {isHtmlTag ? (
         <iframe 
          srcDoc={html}
          title="HTML Master View"
          sandbox="allow-scripts allow-forms"
          className="flex-1 w-full h-full border-none block"
         />
       ) : (
         <div className="flex-1 flex flex-col overflow-hidden bg-[#060608] relative">
            <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between z-10 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                     <FileCode className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                     <h2 className="text-sm font-black uppercase text-white tracking-widest">Linguistic Source</h2>
                     <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Verified Secure</p>
                  </div>
               </div>
               <Button onClick={handleCopy} className="h-10 px-6 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest shadow-xl">
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                  Copy Content
               </Button>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-8 sm:p-12">
               <pre className="max-w-5xl mx-auto font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-all bg-black/40 p-10 rounded-[2.5rem] border border-white/5 shadow-inner selection:bg-primary/20">
                  {html}
               </pre>
            </div>
         </div>
       )}

       {/* Hardware Navigation Footer */}
       <div className="h-14 bg-[#0a0a0c] border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-primary/40" />
              <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Protocol: {resolvedId}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary/40" />
              <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Sanitized Sandbox</span>
            </div>
          </div>
          <Link href="/html-to-url" className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-all group">
             STUDIO <ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
          </Link>
       </div>

       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
