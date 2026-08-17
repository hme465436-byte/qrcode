
"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Share2, 
  Upload, 
  X, 
  ShieldCheck, 
  Info, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Copy, 
  File,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Download,
  Smartphone,
  Globe,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const CHUNK_SIZE = 16384; // 16KB for P2P stability

export default function DirectFileSharePage() {
  const { toast } = useToast();
  
  // State
  const [file, setFile] = useState<File | null>(null);
  const [peerId, setPeerId] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'sending' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = status === 'sending' || status === 'connecting';

  // 1. Initialize Peer on Mount
  useEffect(() => {
    let p: any;
    
    const init = async () => {
      const { default: Peer } = await import('peerjs');
      p = new Peer();
      peerRef.current = p;

      p.on('open', (id: string) => {
        setPeerId(id);
      });

      p.on('connection', (conn: any) => {
        connRef.current = conn;
        setStatus('connecting');

        conn.on('open', () => {
          setStatus('sending');
          toast({ title: "Connection established", description: "Sharing started." });
          
          if (file) {
            // First send metadata
            conn.send({ 
              type: 'meta', 
              name: file.name, 
              size: file.size, 
              mime: file.type 
            });

            // Start chunked transfer
            sendBuffer(conn, file);
          }
        });

        conn.on('close', () => {
          if (status !== 'complete') {
            setStatus('error');
            setErrorMessage("Connection lost. Receiver closed the page.");
          }
        });

        conn.on('error', (err: any) => {
          setStatus('error');
          setErrorMessage("Peer connection error.");
        });
      });

      p.on('error', (err: any) => {
        console.error("PeerJS error:", err);
        if (err.type === 'peer-unavailable') {
          // This usually happens on receiver side, handled there
        }
      });
    };

    init();

    return () => {
      if (p) p.destroy();
    };
  }, [file]); // Re-init if file changes to reset connection state

  const sendBuffer = (conn: any, fileToRotate: File) => {
    const reader = new FileReader();
    let offset = 0;

    reader.onload = (e: any) => {
      if (e.target.result) {
        conn.send({ type: 'chunk', data: e.target.result });
        offset += e.target.result.byteLength;
        const p = Math.round((offset / fileToRotate.size) * 100);
        setProgress(p);

        if (offset < fileToRotate.size) {
          readNext();
        } else {
          conn.send({ type: 'end' });
          setStatus('complete');
          toast({ title: "Transfer complete" });
        }
      }
    };

    const readNext = () => {
      const slice = fileToRotate.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    readNext();
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !peerId) return '';
    return `${window.location.origin}/share/${peerId}`;
  }, [peerId]);

  const handleFileUpload = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage('');
    setStatus('idle');
    setProgress(0);
    
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "P2P max limit is 100MB for stability." });
      setFile(null);
      return;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Share2 className="w-3.5 h-3.5" /> P2P File Share
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Send <span className="text-primary italic">File</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Direct device-to-device transfer. No cloud storage, no logs. High-speed encrypted tunnel.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="direct-file-share" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-secondary/10">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
                {!file ? (
                  <div className="w-full max-w-lg space-y-8">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all duration-500 shadow-xl border-white/10 hover:border-primary/40 cursor-pointer bg-black/40"
                    >
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10" />
                      </div>
                      <div className="text-center space-y-2">
                        <span className="text-sm font-headline font-black uppercase text-white/40 group-hover:text-white transition-colors">Select a file to send</span>
                        <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Supports all formats up to 100MB</p>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in duration-500">
                     <div className="flex flex-col items-center gap-10">
                        
                        <div className="w-full space-y-8">
                           <div className="flex items-center justify-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/5">
                              <File className="w-8 h-8 text-primary/40" />
                              <div className="text-left overflow-hidden">
                                 <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                 <p className="text-[9px] text-white/20 font-black uppercase">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                              </div>
                           </div>

                           {status === 'idle' && peerId && (
                             <div className="text-center space-y-6 animate-in fade-in duration-500">
                                <div className="space-y-4">
                                  <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Share this link</h3>
                                  <div className="p-6 bg-black/40 rounded-[2.5rem] border border-primary/20 shadow-2xl relative group/url overflow-hidden max-w-full">
                                     <p className="text-lg sm:text-xl font-bold text-white break-all leading-tight">{shareUrl}</p>
                                  </div>
                                  <div className="flex justify-center gap-4">
                                     <Button onClick={handleCopyLink} className="h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl">
                                        {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                                        Copy link
                                     </Button>
                                     <Button onClick={reset} variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-white font-black rounded-2xl">
                                        Cancel
                                     </Button>
                                  </div>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3 text-left">
                                   <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                                   <p className="text-[10px] font-bold uppercase leading-relaxed">Keep this page open until the recipient finishes downloading.</p>
                                </div>
                             </div>
                           )}

                           {(status === 'connecting' || status === 'sending') && (
                             <div className="w-full max-w-sm mx-auto space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase text-white/40">
                                   <span>{status === 'connecting' ? 'Connecting to peer' : 'Streaming file'}</span>
                                   <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                                <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-widest animate-pulse">Stay on this page...</p>
                             </div>
                           )}

                           {status === 'complete' && (
                             <div className="text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                                   <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <div className="space-y-1">
                                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Finished</h3>
                                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Recieved by peer</p>
                                </div>
                                <Button onClick={reset} variant="outline" className="h-12 px-8 border-white/10 bg-white/5 text-white font-black rounded-xl">Send Another</Button>
                             </div>
                           )}

                           {status === 'error' && (
                             <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-4">
                                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                                <p className="text-xs font-bold text-red-400 uppercase leading-relaxed">{errorMessage}</p>
                                <Button onClick={reset} variant="outline" className="h-10 border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase">Try again</Button>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Info className="w-5 h-5 text-primary" /> How it works
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    {[
                      { icon: Smartphone, title: 'Direct Link', desc: 'A secure unique URL is created for your specific file.' },
                      { icon: Zap, title: 'No Servers', desc: 'Files stream directly between browsers. Data is never stored.' },
                      { icon: ShieldCheck, title: 'Zero Logs', desc: 'Only you and the recipient have access to the transfer.' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-5">
                         <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                            <step.icon className="w-5 h-5" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[11px] font-black uppercase text-foreground">{step.title}</h4>
                            <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">{step.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Globe className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Global P2P Network</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Connect across different networks seamlessly. Best speeds are achieved when both devices are on the same local network (WiFi).
                  </p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
