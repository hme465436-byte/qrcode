'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Loader2, AlertCircle, ArrowLeft, Copy, CheckCircle2, Globe, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface KitPublicPageProps {
  id: string;
}

export function KitPublicPage({ id }: KitPublicPageProps) {
  const { toast } = useToast();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      // 1. Check Local Hardware Memory
      try {
        const pagesMap = JSON.parse(localStorage.getItem("kit_pages") || "{}");
        if (pagesMap[id]) {
          setHtml(pagesMap[id]);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // 2. Fetch from Cloud Registry
      if (db) {
        try {
          const docRef = doc(db, "pages", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setHtml(docSnap.data()?.html || null);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Network latency:", err);
        }
      }

      setLoading(false);
    };

    fetchPage();
  }, [id]);

  const handleCopy = () => {
    if (html) {
      navigator.clipboard.writeText(html);
      setIsCopied(true);
      toast({ title: "Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isHtmlTag = html?.toLowerCase().includes('<html') || html?.toLowerCase().includes('<!doctype') || html?.toLowerCase().includes('<body');

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] z-[9999] flex flex-col items-center justify-center gap-8">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Loading Content...</p>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] z-[9999] flex flex-col items-center justify-center p-6 text-center gap-10">
        <AlertCircle className="w-12 h-12 text-destructive animate-bounce" />
        <div className="space-y-3">
          <h2 className="text-xl font-headline font-black text-white uppercase tracking-tight">This link does not exist</h2>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Verify the URL and try again</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/'} className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl">
           Back to Studio
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a0a0c] z-[9999] flex flex-col">
       {isHtmlTag ? (
         <iframe 
          srcDoc={html}
          title="HTML View"
          sandbox="allow-scripts allow-forms"
          className="flex-1 w-full h-full border-none block"
         />
       ) : (
         <div className="flex-1 flex flex-col overflow-hidden bg-[#060608] relative">
            <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between z-10 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-white/20">
                     <FileCode className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                     <h2 className="text-sm font-black uppercase text-white tracking-widest">Source Code</h2>
                     <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Verified Secure</p>
                  </div>
               </div>
               <Button onClick={handleCopy} className="h-10 px-6 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest shadow-xl">
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                  Copy Content
               </Button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar p-8 sm:p-12">
               <pre className="max-w-5xl mx-auto font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-all bg-black/40 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
                  {html}
               </pre>
            </div>
         </div>
       )}

       <div className="h-14 bg-[#0a0a0c] border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-4">
            <Globe className="w-3.5 h-3.5 text-primary/40" />
            <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Studio ID: {id}</span>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-all group"
          >
             EXIT VIEW <ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
          </button>
       </div>
    </div>
  );
}
