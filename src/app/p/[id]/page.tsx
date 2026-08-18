
"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft,
  Globe,
  Copy,
  CheckCircle2,
  FileCode,
  Terminal,
  Activity,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function HostedPageViewer() {
  const { id } = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [data, setData] = useState<{ html: string; title: string; language?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [source, setSource] = useState<'cloud' | 'local' | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPage = async () => {
      // 1. Priority: Local Hardware Memory Fallback
      const localKey = "kit_page_" + id;
      const localRaw = localStorage.getItem(localKey);
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw);
          setData(parsed);
          setSource('local');
          setLoading(false);
          // Still try to check cloud in background if needed, but local is sufficient
          return;
        } catch (e) {
          console.warn("Local matrix corrupted, attempting cloud fetch...");
        }
      }

      // 2. Secondary: Global Cloud Matrix
      if (firestore) {
        try {
          const docRef = doc(firestore, "pages", id as string);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setData(docSnap.data() as any);
            setSource('cloud');
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.error("Cloud fetch failed", err);
        }
      }

      setError("Identity Token Not Found. The link may have expired or was definitively purged.");
      setLoading(false);
    };

    fetchPage();
  }, [firestore, id]);

  const handleCopy = () => {
    if (data?.html) {
      navigator.clipboard.writeText(data.html);
      setIsCopied(true);
      toast({ title: "Content Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fetching Identity Matrix...</p>
           <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Negotiating secure handshake</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center gap-10">
        <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-xl">
           <AlertCircle className="w-12 h-12 animate-bounce" />
        </div>
        <div className="space-y-4">
           <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight">Signal Not Found</h2>
           <p className="text-sm text-white/30 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">{error}</p>
        </div>
        <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-[10px]">
           <Link href="/html-to-url"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Studio</Link>
        </Button>
      </div>
    );
  }

  const isHtml = data.language === 'html' || (!data.language && (data.html.includes('<html') || data.html.includes('<!doctype')));

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a0a0c] flex flex-col">
       <title>{data.title} | MY KIT TOOL</title>
       
       {isHtml ? (
         <iframe 
          srcDoc={data.html}
          title={data.title}
          sandbox="allow-scripts allow-forms"
          className="flex-1 w-full h-full border-none block"
         />
       ) : (
         <div className="flex-1 flex flex-col overflow-hidden bg-[#060608] relative">
            <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between z-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                     <FileCode className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                     <h2 className="text-sm font-black uppercase text-white tracking-widest truncate max-w-[200px] sm:max-w-md">{data.title}</h2>
                     <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">{data.language || 'text'} content • {source === 'local' ? 'Local Buffer' : 'Cloud Master'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Button onClick={handleCopy} className="h-10 px-6 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest shadow-xl">
                     {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                     Copy Code
                  </Button>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-8 sm:p-12 relative">
               <pre className="max-w-5xl mx-auto font-mono text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-all select-all selection:bg-primary/20 bg-black/40 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
                  {data.html}
               </pre>
               <div className="absolute bottom-12 right-12 pointer-events-none opacity-[0.03]">
                  <Terminal className="w-96 h-96 text-white" />
               </div>
            </div>
         </div>
       )}

       {/* Floating Identity Status */}
       <div className="h-12 bg-[#0a0a0c] border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">
                  Live Identity: {id}
                </span>
             </div>
             {source === 'local' && (
               <div className="flex items-center gap-2 text-primary/60 border-l border-white/5 pl-6 hidden sm:flex">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Validated via Hardware Memory</span>
               </div>
             )}
          </div>
          <Link href="/html-to-url" className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest hover:text-white transition-all group">
             STUDIO HUB <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
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
