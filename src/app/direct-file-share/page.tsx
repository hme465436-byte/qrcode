"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Wifi, 
  File,
  Loader2,
  AlertCircle,
  Cloud,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useFirestore, useStorage } from '@/firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  collection, 
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const CHUNK_SIZE = 16384; 

export default function DirectFileSharePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [shareId, setShareId] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'uploading' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('0 MB/s');
  const [isCopied, setIsCopied] = useState(false);

  // WebRTC Refs
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);
  const lastTimeRef = useRef(0);
  const lastBytesRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateShareId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !shareId) return '';
    return `${window.location.origin}/share/${shareId}`;
  }, [shareId]);

  const initPeer = useCallback(() => {
    const servers = {
      iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
      ],
    };
    const pc = new RTCPeerConnection(servers);
    peerRef.current = pc;
    return pc;
  }, []);

  const handleFileUpload = async (selectedFile: File) => {
    if (!firestore) return;
    const id = generateShareId();
    setShareId(id);
    setFile(selectedFile);
    setStatus('sending');

    if (useFallback && storage) {
      startCloudUpload(selectedFile, id);
    } else {
      startP2PSignaling(selectedFile, id);
    }
  };

  const startCloudUpload = (selectedFile: File, id: string) => {
    if (!storage) return;
    setStatus('uploading');
    const storageRef = ref(storage, `shared_files/${id}/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(p);
      }, 
      (err) => {
        setStatus('error');
        toast({ variant: "destructive", title: "Upload Failed" });
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const roomRef = doc(firestore!, 'p2p_signaling', id);
        await setDoc(roomRef, {
          fileMeta: {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type
          },
          storageUrl: downloadURL,
          createdAt: serverTimestamp(),
          isFallback: true
        });
        setStatus('complete');
        toast({ title: "Cloud Backup Ready" });
      }
    );
  };

  const startP2PSignaling = async (selectedFile: File, id: string) => {
    if (!firestore) return;
    const pc = initPeer();
    const dc = pc.createDataChannel('fileTransfer', { ordered: true });
    dataChannelRef.current = dc;

    dc.onopen = () => {
      setStatus('sending');
      sendFile();
    };

    const roomRef = doc(firestore, 'p2p_signaling', id);
    const callerCandidates = collection(roomRef, 'callerCandidates');
    const calleeCandidates = collection(roomRef, 'calleeCandidates');

    pc.onicecandidate = (e) => {
      if (e.candidate) addDoc(callerCandidates, e.candidate.toJSON());
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await setDoc(roomRef, {
      offer: offer.sdp,
      type: offer.type,
      createdAt: serverTimestamp(),
      fileMeta: {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      },
      isFallback: false
    });

    onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.answer }));
      }
    });

    onSnapshot(collection(roomRef, 'calleeCandidates'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      });
    });
  };

  const sendFile = () => {
    if (!file || !dataChannelRef.current) return;
    const dc = dataChannelRef.current;
    const reader = new FileReader();
    fileReaderRef.current = reader;
    let offset = 0;

    const slice = () => {
      if (offset >= file.size) {
        dc.send(JSON.stringify({ type: 'complete' }));
        setStatus('complete');
        return;
      }
      const blob = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(blob);
    };

    reader.onload = (e) => {
      if (!e.target?.result) return;
      dc.send(e.target.result as ArrayBuffer);
      offset += (e.target.result as ArrayBuffer).byteLength;
      
      const p = Math.round((offset / file.size) * 100);
      setProgress(p);
      
      const now = Date.now();
      if (now - lastTimeRef.current > 1000) {
        const bytes = offset - lastBytesRef.current;
        setSpeed(`${(bytes / (1024 * 1024)).toFixed(1)} MB/s`);
        lastTimeRef.current = now;
        lastBytesRef.current = offset;
      }

      if (dc.bufferedAmount > 1024 * 1024) {
        dc.onbufferedamountlow = () => {
          dc.onbufferedamountlow = null;
          slice();
        };
      } else {
        slice();
      }
    };
    slice();
  };

  const stopAll = () => {
    if (peerRef.current) peerRef.current.close();
    if (dataChannelRef.current) dataChannelRef.current.close();
    if (fileReaderRef.current) fileReaderRef.current.abort();
    setFile(null);
    setShareId('');
    setStatus('idle');
    setProgress(0);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'File Share', url: shareUrl });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'sending' || status === 'uploading') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Share2 className="w-3.5 h-3.5" /> Direct Send
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Send <span className="text-primary italic">Files Directly</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Send files to anyone using a link. No cloud storage needed by default. Total privacy.
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
                {!shareId ? (
                  <div className="w-full max-w-lg space-y-8">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all duration-500 shadow-xl border-white/10 hover:border-primary/40 cursor-pointer bg-black/40"
                    >
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10" />
                      </div>
                      <div className="text-center space-y-2">
                        <span className="text-sm font-headline font-black uppercase text-white/40 group-hover:text-white transition-colors">Select file to share</span>
                        <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Memory-to-Memory Transfer</p>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-black/20 border border-white/5 group hover:border-primary/20 transition-all">
                       <div className="flex gap-4">
                          <Cloud className="w-5 h-5 text-primary/40" />
                          <div className="space-y-1">
                             <h4 className="text-[11px] font-black uppercase text-white/60">Cloud Fallback</h4>
                             <p className="text-[9px] text-white/20 font-bold uppercase">Upload if direct link fails</p>
                          </div>
                       </div>
                       <Switch checked={useFallback} onCheckedChange={setUseFallback} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in duration-500">
                     <div className="flex flex-col items-center gap-10">
                        <div className="text-center space-y-4">
                           <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Active Link</h3>
                           <div className="p-6 bg-black/40 rounded-[2.5rem] border border-primary/20 shadow-2xl relative group/url overflow-hidden max-w-full">
                              <p className="text-lg sm:text-xl font-bold text-white break-all">{shareUrl}</p>
                              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/url:opacity-100 transition-opacity" />
                           </div>
                           <div className="flex justify-center gap-4">
                              <Button onClick={handleCopyLink} className="h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl">
                                 {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                                 Copy link
                              </Button>
                              <Button onClick={handleShare} variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-white font-black rounded-2xl">
                                 <Share2 className="w-5 h-5 mr-2" />
                                 Share
                              </Button>
                           </div>
                        </div>

                        <div className="w-full space-y-8">
                           <div className="flex flex-col items-center gap-4">
                              <div className="w-full max-w-sm space-y-3">
                                 <div className="flex justify-between text-[10px] font-black uppercase text-white/40">
                                    <span>{status === 'complete' ? 'Finished' : (useFallback && status === 'uploading' ? 'Uploading' : 'Sending')}</span>
                                    <span>{progress}%</span>
                                 </div>
                                 <Progress value={progress} className="h-1.5" />
                              </div>
                              <span className="text-[10px] font-mono text-primary font-bold">{speed}</span>
                           </div>

                           <div className="flex items-center justify-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/5">
                              <File className="w-8 h-8 text-primary/40" />
                              <div className="text-left overflow-hidden">
                                 <p className="text-sm font-bold text-white truncate">{file?.name}</p>
                                 <p className="text-[9px] text-white/20 font-black uppercase">{(file?.size || 0) / (1024 * 1024) < 1 ? `${((file?.size || 0) / 1024).toFixed(1)} KB` : `${((file?.size || 0) / (1024 * 1024)).toFixed(1)} MB`}</p>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500/60">
                             <AlertCircle className="w-5 h-5 shrink-0" />
                             <p className="text-[10px] font-black uppercase leading-relaxed text-left">Keep this page open or sharing will stop immediately.</p>
                          </div>
                          <Button variant="ghost" onClick={stopAll} className="text-white/20 hover:text-red-500 transition-all text-[9px] font-black uppercase tracking-widest">
                             Stop Sharing
                          </Button>
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
                    <Info className="w-5 h-5 text-primary" /> Steps to share
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    {[
                      { icon: Upload, title: 'Pick your files', desc: 'Select or drop any file up to 2GB.' },
                      { icon: LinkIcon, title: 'Share the link', desc: 'Copy the secret link and send it to your recipient.' },
                      { icon: Activity, title: 'Stay on this page', desc: 'The transfer is direct. If you close this tab, the link dies.' },
                      { icon: Wifi, title: 'Same WiFi hint', desc: 'Best for speed. Keep both devices active and nearby.' },
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
        </div>
      </div>
    </div>
  );
}
