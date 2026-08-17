
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Share2, 
  Upload, 
  X, 
  ShieldCheck, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Copy, 
  File as FileIcon,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Download,
  Smartphone,
  Globe,
  Clock,
  QrCode,
  Lock,
  MessageCircle,
  Trash2,
  FileArchive,
  ArrowRight,
  TrendingUp,
  Plus,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import JSZip from 'jszip';

const CHUNK_SIZE = 16384; // 16KB for P2P stability

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface PeerStats {
  id: string;
  progress: number;
  speed: string;
  status: 'connecting' | 'verifying' | 'sending' | 'done';
}

export default function DirectFileSharePage() {
  const { toast } = useToast();
  
  // File State
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [shouldZip, setShouldZip] = useState(false);
  const [pin, setPin] = useState('');
  
  // Connection State
  const [peerId, setPeerId] = useState('');
  const [peer, setPeer] = useState<any>(null);
  const [connections, setConnections] = useState<Record<string, PeerStats>>({});
  const [showQr, setShowQr] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<any>(null);

  // 1. Initialize Peer
  useEffect(() => {
    let p: any;
    const init = async () => {
      const { default: Peer } = await import('peerjs');
      p = new Peer();
      setPeer(p);

      p.on('open', (id: string) => setPeerId(id));
      
      p.on('connection', (conn: any) => {
        const connId = conn.peer;
        
        // Notification
        toast({ title: "Peer Connected", description: "Someone is preparing to receive your files." });
        
        setConnections(prev => ({
          ...prev,
          [connId]: { id: connId, progress: 0, speed: '0 KB/s', status: 'connecting' }
        }));

        conn.on('open', () => {
          if (pin.trim()) {
            conn.send({ type: 'auth-required' });
            setConnections(prev => ({ ...prev, [connId]: { ...prev[connId], status: 'verifying' } }));
          } else {
            startTransfer(conn);
          }
        });

        conn.on('data', (data: any) => {
          if (data.type === 'auth-verify') {
            if (data.pin === pin.trim()) {
              conn.send({ type: 'auth-ok' });
              startTransfer(conn);
            } else {
              conn.send({ type: 'auth-fail' });
            }
          }
        });

        conn.on('close', () => {
          setConnections(prev => {
            const next = { ...prev };
            delete next[connId];
            return next;
          });
        });
      });
    };

    init();
    return () => { if (p) p.destroy(); };
  }, [pin]);

  // 2. Transfer Logic
  const startTransfer = async (conn: any) => {
    const connId = conn.peer;
    setConnections(prev => ({ ...prev, [connId]: { ...prev[connId], status: 'sending' } }));

    let payload: Blob;
    let fileName: string;
    let fileType: string;

    if (shouldZip && files.length > 0) {
      const zip = new JSZip();
      files.forEach(f => zip.file(f.name, f.file));
      payload = await zip.generateAsync({ type: 'blob' });
      fileName = `bundle_${Date.now()}.zip`;
      fileType = 'application/zip';
    } else {
      // For multiple files without zip, we send the first one in this MVP
      // A more complex loop could handle the rest
      const f = files[0];
      payload = f.file;
      fileName = f.name;
      fileType = f.type;
    }

    conn.send({ 
      type: 'meta', 
      name: fileName, 
      size: payload.size, 
      mime: fileType,
      count: files.length
    });

    const reader = new FileReader();
    let offset = 0;
    let lastTime = Date.now();
    let lastOffset = 0;

    reader.onload = (e: any) => {
      if (e.target.result) {
        conn.send({ type: 'chunk', data: e.target.result });
        offset += e.target.result.byteLength;
        
        // Performance Stats
        const now = Date.now();
        if (now - lastTime > 1000) {
          const bytesPerSec = (offset - lastOffset) / ((now - lastTime) / 1000);
          const speedStr = bytesPerSec > 1024 * 1024 
            ? `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
            : `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
          
          setConnections(prev => ({ 
            ...prev, 
            [connId]: { ...prev[connId], progress: Math.round((offset / payload.size) * 100), speed: speedStr } 
          }));
          
          lastTime = now;
          lastOffset = offset;
        }

        if (offset < payload.size) {
          readNext();
        } else {
          conn.send({ type: 'end' });
          setConnections(prev => ({ ...prev, [connId]: { ...prev[connId], status: 'done', progress: 100, speed: '0 KB/s' } }));
        }
      }
    };

    const readNext = () => {
      const slice = payload.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    readNext();
  };

  // 3. File Handling
  const handleFiles = (incoming: FileList | File[]) => {
    const newItems: QueuedFile[] = Array.from(incoming).map(file => {
      const item: QueuedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type
      };
      if (file.type.startsWith('image/')) {
        item.preview = URL.createObjectURL(file);
      }
      return item;
    });
    setFiles(prev => [...prev, ...newItems]);
    toast({ title: "Files added" });
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  // 4. QR Synthesis
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !peerId) return '';
    return `${window.location.origin}/share/${peerId}`;
  }, [peerId]);

  useEffect(() => {
    if (showQr && qrRef.current && shareUrl) {
      const render = async () => {
        if (!(window as any).QRCodeStyling) return;
        qrRef.current!.innerHTML = '';
        qrInstance.current = new (window as any).QRCodeStyling({
          width: 300,
          height: 300,
          data: shareUrl,
          dotsOptions: { color: "#3b82f6", type: "extra-rounded" },
          backgroundOptions: { color: "transparent" },
          cornersSquareOptions: { type: "extra-rounded", color: "#3b82f6" },
          imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10 }
        });
        qrInstance.current.append(qrRef.current);
      };
      render();
    }
  }, [showQr, shareUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Share2 className="w-3.5 h-3.5" /> Direct File Share
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Send <span className="text-primary italic">Files</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Stream files directly to any device. No upload, no cloud storage, zero friction.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="direct-file-share" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Main Workspace */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-secondary/10">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             
             {/* Header Bar */}
             <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                      <FileIcon className="w-5 h-5" />
                   </div>
                   <div className="space-y-0.5">
                      <h4 className="text-[10px] font-black uppercase text-foreground">File Queue</h4>
                      <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">{files.length} items ready</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Zip All</span>
                      <Switch checked={shouldZip} onCheckedChange={setShouldZip} className="scale-75 h-4" />
                   </div>
                   <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl bg-primary text-white shadow-lg hover:scale-105 active:scale-95 transition-all">
                      <Plus className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <CardContent className="flex-1 flex flex-col p-6 sm:p-10">
                {files.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
                    className="flex-1 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-primary/40 transition-all bg-black/20 group"
                  >
                     <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <span className="text-sm font-headline font-black uppercase text-white/40 group-hover:text-white transition-colors">Select files to send</span>
                        <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Max 100MB Recommended</p>
                     </div>
                     <input type="file" ref={fileInputRef} multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-500">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {files.map(f => (
                          <div key={f.id} className="p-4 rounded-3xl bg-black/40 border border-white/5 flex items-center gap-4 group/item">
                             <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden shrink-0 border border-border">
                                {f.preview ? <img src={f.preview} className="w-full h-full object-cover" /> : <FileIcon className="w-5 h-5 text-primary/40" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-white truncate uppercase">{f.name}</p>
                                <p className="text-[9px] text-white/20 font-black">{(f.size / (1024 * 1024)).toFixed(1)} MB</p>
                             </div>
                             <button onClick={() => removeFile(f.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                        ))}
                     </div>

                     {peerId ? (
                       <div className="pt-8 border-t border-white/5 space-y-10">
                          <div className="flex flex-col items-center text-center gap-6">
                             <div className="space-y-4 w-full">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Copy this link to share</Label>
                                <div className="p-6 bg-black/40 rounded-[2.5rem] border border-primary/20 shadow-2xl relative group/url overflow-hidden max-w-full">
                                   <p className="text-lg sm:text-xl font-bold text-white break-all leading-tight">{shareUrl}</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4">
                                   <Button onClick={handleCopyLink} className="h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl">
                                      {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                                      Copy link
                                   </Button>
                                   <Button onClick={() => setShowQr(true)} variant="outline" className="h-14 px-6 border-white/10 bg-white/5 text-white font-black rounded-2xl">
                                      <QrCode className="w-5 h-5" />
                                   </Button>
                                   <Button asChild variant="outline" className="h-14 px-6 border-white/10 bg-white/5 text-white font-black rounded-2xl">
                                      <a href={`https://wa.me/?text=${encodeURIComponent('I sent you some files: ' + shareUrl)}`} target="_blank">
                                         <MessageCircle className="w-5 h-5" />
                                      </a>
                                   </Button>
                                </div>
                             </div>
                          </div>

                          {/* Active Transfers */}
                          {Object.values(connections).length > 0 && (
                            <div className="space-y-4 pt-4 animate-in slide-in-from-bottom-2">
                               <div className="flex items-center justify-between px-2">
                                  <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Active Transfers</h4>
                                  <span className="text-[9px] font-bold text-green-500">{Object.values(connections).length} Receiver(s)</span>
                               </div>
                               <div className="space-y-3">
                                  {Object.values(connections).map(c => (
                                    <div key={c.id} className="p-5 rounded-3xl bg-primary/10 border border-primary/20 space-y-4">
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <Activity className="w-4 h-4" />
                                             </div>
                                             <span className="text-[10px] font-black text-white uppercase">{c.status}</span>
                                          </div>
                                          <span className="text-[10px] font-mono text-primary font-bold">{c.speed}</span>
                                       </div>
                                       <div className="space-y-2">
                                          <div className="flex justify-between text-[8px] font-black uppercase text-white/40">
                                             <span>Progress</span>
                                             <span>{c.progress}%</span>
                                          </div>
                                          <Progress value={c.progress} className="h-1" />
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}

                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3">
                             <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                             <p className="text-[10px] font-bold uppercase leading-relaxed">Keep this page open. If you close this tab, all transfers will fail.</p>
                          </div>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center gap-4 py-10 opacity-30">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white">Generating secret link...</p>
                       </div>
                     )}
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           {/* Protection Settings */}
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Lock className="w-5 h-5 text-primary" /> Security Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Access PIN (Optional)</Label>
                    <div className="relative group/pin">
                       <Input 
                        value={pin}
                        onChange={e => setPin(e.target.value.substring(0, 8))}
                        placeholder="Set a 4-8 digit PIN..."
                        className="h-14 bg-secondary/50 border-border rounded-2xl text-center text-xl font-bold tracking-[0.5em] focus:ring-primary/40"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/pin:opacity-100 transition-opacity">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                       </div>
                    </div>
                    <p className="text-[9px] text-foreground/20 font-bold uppercase text-center">Recipients must enter this PIN to download.</p>
                 </div>
              </CardContent>
           </Card>

           {/* Performance Tips */}
           <Card className="glass-card border-border shadow-xl">
              <CardContent className="p-8 space-y-6">
                 {[
                   { icon: Zap, title: 'WiFi Best', desc: 'Sharing between devices on the same network is 10x faster.' },
                   { icon: Smartphone, title: 'No Sleep', desc: 'Ensure your phone doesn\'t auto-lock during large transfers.' },
                   { icon: ShieldCheck, title: 'Peer-to-Peer', desc: 'Files flow directly. Nothing is stored in the cloud.' },
                 ].map((tip, i) => (
                   <div key={i} className="flex gap-5">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                         <tip.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-[11px] font-black uppercase text-foreground">{tip.title}</h4>
                         <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">{tip.desc}</p>
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* QR Modal Overlay */}
      {showQr && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="w-full max-w-lg space-y-10 text-center">
              <div className="space-y-4">
                 <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">Scan to <span className="text-primary italic">Receive</span></h2>
                 <p className="text-white/20 text-xs font-black uppercase tracking-widest">Hold your camera to the screen</p>
              </div>

              <div className="relative group/qr mx-auto w-fit">
                 <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-50" />
                 <div className="relative p-6 bg-white rounded-[3rem] shadow-2xl transition-transform duration-700 group-hover/qr:scale-105">
                    <div ref={qrRef} className="w-[300px] h-[300px] bg-white rounded-2xl" />
                 </div>
              </div>

              <div className="flex justify-center gap-4">
                 <Button onClick={() => setShowQr(false)} className="h-16 px-10 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-primary/30">
                    Done
                 </Button>
              </div>
           </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
