"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  Download, 
  File, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  Activity,
  ArrowLeft,
  Lock,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFirestore } from '@/firebase';
import { 
  doc, 
  getDoc, 
  onSnapshot, 
  addDoc, 
  collection, 
  updateDoc 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SharePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  // State
  const [fileMeta, setFileMeta] = useState<{name: string, size: number, type: string} | null>(null);
  const [status, setStatus] = useState<'connecting' | 'transferring' | 'complete' | 'error' | 'not-found'>('connecting');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('0 MB/s');
  const [receivedBlob, setReceivedBlob] = useState<Blob | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [storageUrl, setStorageUrl] = useState('');

  // Refs
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const bytesReceivedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastBytesRef = useRef(0);

  const initPeer = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }]
    });
    peerRef.current = pc;
    return pc;
  }, []);

  const handleReceivedMessage = (e: MessageEvent) => {
    if (typeof e.data === 'string') {
      const msg = JSON.parse(e.data);
      if (msg.type === 'complete') {
        setReceivedBlob(new Blob(receivedChunksRef.current));
        setStatus('complete');
      }
      return;
    }

    const chunk = e.data as ArrayBuffer;
    receivedChunksRef.current.push(chunk);
    bytesReceivedRef.current += chunk.byteLength;

    if (fileMeta) {
      const p = Math.round((bytesReceivedRef.current / fileMeta.size) * 100);
      setProgress(p);
      const now = Date.now();
      if (now - lastTimeRef.current > 1000) {
        const bytes = bytesReceivedRef.current - lastBytesRef.current;
        setSpeed(`${(bytes / (1024 * 1024)).toFixed(1)} MB/s`);
        lastTimeRef.current = now;
        lastBytesRef.current = bytesReceivedRef.current;
      }
    }
  };

  const startP2P = async (roomData: any) => {
    const pc = initPeer();
    pc.ondatachannel = (e) => {
      e.channel.onmessage = handleReceivedMessage;
      setStatus('transferring');
    };

    const roomRef = doc(firestore!, 'p2p_signaling', id as string);
    pc.onicecandidate = (e) => {
      if (e.candidate) addDoc(collection(roomRef, 'calleeCandidates'), e.candidate.toJSON());
    };

    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: roomData.offer }));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await updateDoc(roomRef, { answer: answer.sdp });

    onSnapshot(collection(roomRef, 'callerCandidates'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      });
    });
  };

  useEffect(() => {
    if (!firestore || !id) return;

    const fetchMeta = async () => {
      const roomRef = doc(firestore, 'p2p_signaling', id as string);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        setStatus('not-found');
        return;
      }
      const data = snap.data();
      setFileMeta(data.fileMeta);
      setIsFallback(data.isFallback);
      if (data.isFallback) {
        setStorageUrl(data.storageUrl);
        setStatus('complete');
      } else {
        startP2P(data);
      }
    };
    fetchMeta();
  }, [firestore, id]);

  const handleDownload = () => {
    if (isFallback && storageUrl) {
      window.open(storageUrl, '_blank');
      return;
    }
    if (!receivedBlob || !fileMeta) return;
    const url = URL.createObjectURL(receivedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileMeta.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-24 max-w-4xl flex flex-col items-center">
      <div className="mb-12 animate-reveal text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-6">
          <Download className="w-3.5 h-3.5" /> Direct Receive
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
          Receive <span className="text-primary italic">Your File</span>
        </h1>
      </div>

      <Card className="glass-card border-border shadow-2xl overflow-hidden relative w-full max-w-2xl bg-secondary/10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardContent className="p-8 sm:p-16 flex flex-col items-center gap-12">
          
          {status === 'not-found' ? (
            <div className="text-center space-y-6 animate-in zoom-in">
               <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
               <div className="space-y-2">
                  <h3 className="text-xl font-headline font-black text-white">File Not Found</h3>
                  <p className="text-xs text-white/20 font-bold uppercase">Link is expired or sender closed the page.</p>
               </div>
               <Button asChild variant="outline" className="h-12 px-8 border-white/10 bg-white/5 rounded-xl">
                  <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Link>
               </Button>
            </div>
          ) : (
            <>
              <div className="w-full flex flex-col items-center gap-8">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="w-20 h-20 rounded-[1.5rem] bg-background border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
                       <File className="w-10 h-10" />
                    </div>
                 </div>
                 
                 <div className="text-center space-y-2 max-w-sm">
                    <h3 className="text-lg font-bold text-white truncate px-4">{fileMeta?.name || 'Incoming File...'}</h3>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                       {fileMeta ? `${(fileMeta.size / (1024 * 1024)).toFixed(1)} MB` : 'Calculating...'}
                    </p>
                 </div>
              </div>

              {status === 'transferring' && (
                <div className="w-full max-w-sm space-y-4">
                   <div className="flex justify-between text-[10px] font-black uppercase text-white/40">
                      <span>Receiving Data</span>
                      <span>{progress}%</span>
                   </div>
                   <Progress value={progress} className="h-1.5" />
                   <p className="text-center text-[10px] font-mono text-primary font-bold">{speed}</p>
                </div>
              )}

              {status === 'connecting' && (
                <div className="flex flex-col items-center gap-4">
                   <Loader2 className="w-8 h-8 text-primary animate-spin" />
                   <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">Negotiating Direct Link...</p>
                </div>
              )}

              {status === 'complete' && (
                <Button 
                  onClick={handleDownload} 
                  className="h-20 px-12 bg-primary text-white font-black rounded-[2rem] text-xl uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all animate-bounce"
                >
                  <Download className="w-8 h-8 mr-4" />
                  Save File
                </Button>
              )}

              <div className="w-full p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4 text-left">
                 <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase text-white/60">Secure Transfer</p>
                    <p className="text-[10px] text-white/20 font-bold uppercase leading-relaxed">
                       {isFallback ? 'Cloud Fallback active. File is stored temporarily for 1 hour.' : 'Direct Device-to-Device transfer active. Data is never stored on our servers.'}
                    </p>
                 </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 flex items-start gap-4">
            <Wifi className="w-5 h-5 text-primary/40" />
            <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase text-white/40">WiFi Optimized</h4>
               <p className="text-[10px] text-white/10 font-bold uppercase">Best speeds on same network</p>
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 flex items-start gap-4">
            <Lock className="w-5 h-5 text-primary/40" />
            <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase text-white/40">E2E Encrypted</h4>
               <p className="text-[10px] text-white/10 font-bold uppercase">Secure channel negotiation</p>
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-secondary/30 border border-white/5 flex items-start gap-4">
            <Smartphone className="w-5 h-5 text-primary/40" />
            <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase text-white/40">Multi-Device</h4>
               <p className="text-[10px] text-white/10 font-bold uppercase">iOS, Android, PC compatible</p>
            </div>
         </div>
      </div>
    </div>
  );
}
