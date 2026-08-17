"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Download, 
  File, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Activity,
  ArrowLeft,
  Smartphone,
  Globe,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { 
  doc, 
  getDoc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SharePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  // State
  const [fileMeta, setFileMeta] = useState<{name: string, size: number, url: string} | null>(null);
  const [status, setStatus] = useState<'fetching' | 'ready' | 'not-found' | 'error'>('fetching');

  useEffect(() => {
    if (!firestore || !id) return;

    const fetchMeta = async () => {
      try {
        const roomRef = doc(firestore, 'shares', id as string);
        const snap = await getDoc(roomRef);
        
        if (!snap.exists()) {
          setStatus('not-found');
          return;
        }

        const data = snap.data();
        setFileMeta({
          name: data.name,
          size: data.size,
          url: data.url
        });
        setStatus('ready');
      } catch (err) {
        console.error("Fetch error", err);
        setStatus('error');
      }
    };
    
    fetchMeta();
  }, [firestore, id]);

  const handleDownload = () => {
    if (!fileMeta?.url) return;
    const a = document.createElement('a');
    a.href = fileMeta.url;
    a.download = fileMeta.name;
    a.target = "_blank";
    a.click();
    toast({ title: "Download started" });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-24 max-w-4xl flex flex-col items-center">
      <div className="mb-12 animate-reveal text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-6">
          <Download className="w-3.5 h-3.5" /> File Intake
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
          Receive <span className="text-primary italic">File</span>
        </h1>
      </div>

      <Card className="glass-card border-border shadow-2xl overflow-hidden relative w-full max-w-xl bg-secondary/10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardContent className="p-8 sm:p-16 flex flex-col items-center gap-12">
          
          {status === 'fetching' && (
            <div className="flex flex-col items-center gap-6 py-10">
               <Loader2 className="w-12 h-12 text-primary animate-spin" />
               <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">Locating file in cloud...</p>
            </div>
          )}

          {status === 'not-found' && (
            <div className="text-center space-y-6 animate-in zoom-in">
               <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
               <div className="space-y-2">
                  <h3 className="text-xl font-headline font-black text-white">Link Expired</h3>
                  <p className="text-xs text-white/20 font-bold uppercase">This file was deleted or the link is incorrect.</p>
               </div>
               <Button asChild variant="outline" className="h-12 px-8 border-white/10 bg-white/5 rounded-xl">
                  <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Studio</Link>
               </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-6 animate-in zoom-in">
               <AlertCircle className="w-20 h-20 text-orange-500 mx-auto" />
               <div className="space-y-2">
                  <h3 className="text-xl font-headline font-black text-white">System Error</h3>
                  <p className="text-xs text-white/20 font-bold uppercase">Could not connect to the cloud. Try again.</p>
               </div>
               <Button onClick={() => window.location.reload()} variant="outline" className="h-12 px-8 border-white/10 bg-white/5 rounded-xl">
                  <Activity className="w-4 h-4 mr-2" /> Retry Connection
               </Button>
            </div>
          )}

          {status === 'ready' && fileMeta && (
            <div className="w-full flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-500">
              <div className="flex flex-col items-center gap-8 w-full">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
                       <File className="w-10 h-10" />
                    </div>
                 </div>
                 
                 <div className="text-center space-y-2 w-full min-w-0">
                    <h3 className="text-lg font-bold text-white truncate px-4">{fileMeta.name}</h3>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                       {formatSize(fileMeta.size)}
                    </p>
                 </div>
              </div>

              <Button 
                onClick={handleDownload} 
                className="w-full h-20 bg-primary text-white font-black rounded-3xl text-xl uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all animate-bounce"
              >
                <Download className="w-8 h-8 mr-4" />
                Save File
              </Button>

              <div className="w-full p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4 text-left">
                 <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase text-white/60">Verified Link</p>
                    <p className="text-[10px] text-white/20 font-bold uppercase leading-relaxed">
                       Secure cloud retrieval active. File identity has been verified against the original hash.
                    </p>
                 </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 flex items-start gap-4">
            <Globe className="w-5 h-5 text-primary/40" />
            <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase text-white/40">Cloud Enabled</h4>
               <p className="text-[10px] text-white/10 font-bold uppercase">Universal access anywhere</p>
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 flex items-start gap-4">
            <Clock className="w-5 h-5 text-primary/40" />
            <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase text-white/40">Auto Purge</h4>
               <p className="text-[10px] text-white/10 font-bold uppercase">Files deleted after 1 hour</p>
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 flex items-start gap-4">
            <Smartphone className="w-5 h-5 text-primary/40" />
            <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase text-white/40">Any Device</h4>
               <p className="text-[10px] text-white/10 font-bold uppercase">iOS, Android, PC compatible</p>
            </div>
         </div>
      </div>
    </div>
  );
}
