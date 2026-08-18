
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
  Terminal
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HostedPageViewer() {
  const { id } = useParams();
  const firestore = useFirestore();
  const [data, setData] = useState<{ html: string; title: string; language?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPage = async () => {
      // 1. Try Firestore
      if (firestore) {
        try {
          const docRef = doc(firestore, "pages", id as string);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setData(docSnap.data() as any);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn("Cloud fetch failed, trying local fallback...");
        }
      }

      // 2. Try Local Fallback (for the creator)
      const local = localStorage.getItem(`pages_${id}`);
      if (local) {
        setData({ html: local, title: 'Local Snapshot' });
      } else {
        setError("Link not found in cloud or local storage.");
      }
      setLoading(false);
    };

    fetchPage();
  }, [firestore, id]);

  const handleCopy = () => {
    if (data?.html) {
      navigator.clipboard.writeText(data.html);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center gap-8">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fetching Content...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center gap-10">
        <AlertCircle className="w-20 h-20 text-destructive animate-bounce" />
        <div className="space-y-4">
           <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight">Not Found</h2>
           <p className="text-sm text-white/30 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">{error}</p>
        </div>
        <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white">
           <Link href="/html-to-url"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Studio</Link>
        </Button>
      </div>
    );
  }

  const isHtml = data.language === 'html' || (!data.language && (data.html.includes('<html') || data.html.includes('<!doctype')));

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a0a0c] flex flex-col">
       <title>{data.title}</title>
       
       {isHtml ? (
         <iframe 
          srcDoc={data.html}
          title={data.title}
          sandbox="allow-scripts allow-forms"
          className="flex-1 w-full h-full border-none"
         />
       ) : (
         <div className="flex-1 flex flex-col overflow-hidden bg-[#060608] relative">
            <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <FileCode className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                     <h2 className="text-sm font-black uppercase text-white tracking-widest">{data.title}</h2>
                     <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">{data.language || 'text'} content</p>
                  </div>
               </div>
               <Button onClick={handleCopy} className="h-10 px-6 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest shadow-xl">
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                  Copy Content
               </Button>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-8 sm:p-12">
               <pre className="max-w-5xl mx-auto font-mono text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-all select-all selection:bg-primary/20">
                  {data.html}
               </pre>
            </div>

            <div className="absolute bottom-8 right-8 pointer-events-none opacity-5">
               <Terminal className="w-64 h-64 text-white" />
            </div>
         </div>
       )}

       <div className="h-10 bg-[#0a0a0c] border-t border-white/10 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">
               Live: {data.title}
             </span>
          </div>
          <Link href="/" className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest hover:text-white transition-all">
             via MY KIT TOOL <ArrowLeft className="w-3 h-3 rotate-180" />
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
