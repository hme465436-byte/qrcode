
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

  useEffect(() => {
    if (!id) return;

    const fetchPage = async () => {
      // 1. Check Global Registry
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
          console.warn("Firestore fetch error", err);
        }
      }

      // 2. Local Hardware Fallback
      const localKey = "kit_page_" + id;
      const localRaw = localStorage.getItem(localKey);
      if (localRaw) {
        try {
          setData(JSON.parse(localRaw));
          setLoading(false);
          return;
        } catch (e) {}
      }

      setError("This link does not exist");
      setLoading(false);
    };

    fetchPage();
  }, [firestore, id]);

  const handleCopy = () => {
    if (data?.html) {
      navigator.clipboard.writeText(data.html);
      setIsCopied(true);
      toast({ title: "Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center gap-8">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fetching Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center gap-10">
        <AlertCircle className="w-12 h-12 text-destructive animate-bounce" />
        <div className="space-y-2">
           <h2 className="text-xl font-headline font-black text-white uppercase">{error}</h2>
        </div>
        <Button asChild variant="outline" className="h-12 px-8 rounded-xl border-white/10 bg-white/5 text-white font-black uppercase text-[10px]">
           <Link href="/html-to-url">Back to Studio</Link>
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
                     <h2 className="text-sm font-black uppercase text-white tracking-widest truncate max-w-[200px]">{data.title}</h2>
                     <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Verified Secure</p>
                  </div>
               </div>
               <Button onClick={handleCopy} className="h-10 px-6 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest">
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                  Copy Code
               </Button>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-8 sm:p-12">
               <pre className="max-w-5xl mx-auto font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-all bg-black/40 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
                  {data.html}
               </pre>
            </div>
         </div>
       )}

       <div className="h-10 bg-[#0a0a0c] border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-50">
          <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">ID: {id}</span>
          <Link href="/html-to-url" className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest hover:text-white transition-all">
             STUDIO <ArrowLeft className="w-3 h-3 rotate-180" />
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
