"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Share2, 
  Upload, 
  Download, 
  X, 
  QrCode, 
  ShieldCheck, 
  Info, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Copy, 
  Wifi, 
  ArrowRight,
  File,
  Loader2,
  Lock,
  Trash2,
  Smartphone,
  MoveHorizontal,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useFirestore } from '@/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  addDoc, 
  collection, 
  deleteDoc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

const CHUNK_SIZE = 16384; // 16KB standard for data channel stability

export default function DirectFileSharePage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  // Mode State
  const [mode, setMode] = useState<'idle' | 'send' | 'receive'>('idle');
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  
  // File State
  const [file, setFile] = useState<File | null>(null);
  const [receivedBlob, setReceivedBlob] = useState<Blob | null>(null);
  const [fileMeta, setFileMeta] = useState<{name: string, size: number, type: string} | null>(null);
  
  // Connection State
  const [status, setStatus] = useState<'standby' | 'searching' | 'connecting' | 'transferring' | 'complete' | 'error'>('standby');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('0 MB/s');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // WebRTC Refs
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const bytesReceivedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastBytesRef = useRef(0);
  const qrRef = useRef<HTMLDivElement>(null);

  // --- Logic Matrix: Room Generation ---
  const generateRoomId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // --- Logic Matrix: Peer Setup ---
  const initPeer = useCallback(() => {
    const servers = {
      iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
      ],
      iceCandidatePoolSize: 10,
    };
    const pc = new RTCPeerConnection(servers);
    peerRef.current = pc;
    return pc;
  }, []);

  // --- Sender Logic ---
  const startSending = async (selectedFile: File) => {
    if (!firestore) return;
    setMode('send');
    setFile(selectedFile);
    setStatus('searching');
    
    const code = generateRoomId();
    setRoomId(code);
    
    const pc = initPeer();
    const dc = pc.createDataChannel('fileTransfer', { ordered: true });
    dataChannelRef.current = dc;

    dc.onopen = () => {
      setStatus('transferring');
      sendFile();
    };

    // Signaling
    const roomRef = doc(firestore, 'p2p_signaling', code);
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
      }
    });

    // Listen for answer
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answer = new RTCSessionDescription({
          type: 'answer',
          sdp: data.answer
        });
        pc.setRemoteDescription(answer);
      }
    });

    // Listen for callee candidates
    onSnapshot(calleeCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });

    return () => {
      unsubscribe();
      stopAll();
    };
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
      
      // Speed check
      const now = Date.now();
      if (now - lastTimeRef.current > 1000) {
        const bytes = offset - lastBytesRef.current;
        setSpeed(`${(bytes / (1024 * 1024)).toFixed(1)} MB/s`);
        lastTimeRef.current = now;
        lastBytesRef.current = offset;
      }

      if (dc.bufferedAmount > 1024 * 1024) {
        // Slow down if buffer is full
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

  // --- Receiver Logic ---
  const startReceiving = async () => {
    if (!firestore || !inputRoomId.trim()) return;
    const code = inputRoomId.trim().toUpperCase();
    setMode('receive');
    setStatus('connecting');
    setRoomId(code);

    try {
      const roomRef = doc(firestore, 'p2p_signaling', code);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        throw new Error("Room not found. Check the code.");
      }

      const roomData = roomSnap.data();
      setFileMeta(roomData.fileMeta);
      
      const pc = initPeer();
      
      pc.ondatachannel = (e) => {
        const dc = e.channel;
        dataChannelRef.current = dc;
        dc.onmessage = handleReceivedMessage;
        setStatus('transferring');
      };

      const callerCandidates = collection(roomRef, 'callerCandidates');
      const calleeCandidates = collection(roomRef, 'calleeCandidates');

      pc.onicecandidate = (e) => {
        if (e.candidate) addDoc(calleeCandidates, e.candidate.toJSON());
      };

      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: roomData.offer
      }));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await updateDoc(roomRef, {
        answer: answer.sdp
      });

      // Listen for caller candidates
      onSnapshot(callerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
          }
        });
      });

    } catch (err: any) {
      setErrorMessage(err.message || "Connection failed.");
      setStatus('error');
    }
  };

  const handleReceivedMessage = (e: MessageEvent) => {
    if (typeof e.data === 'string') {
      const msg = JSON.parse(e.data);
      if (msg.type === 'complete') {
        const blob = new Blob(receivedChunksRef.current);
        setReceivedBlob(blob);
        setStatus('complete');
        cleanupRoom();
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

  const cleanupRoom = async () => {
    if (firestore && roomId) {
      try {
        await deleteDoc(doc(firestore, 'p2p_signaling', roomId));
      } catch (e) {}
    }
  };

  const stopAll = () => {
    if (peerRef.current) peerRef.current.close();
    if (dataChannelRef.current) dataChannelRef.current.close();
    if (fileReaderRef.current) fileReaderRef.current.abort();
    setMode('idle');
    setStatus('standby');
    setFile(null);
    setReceivedBlob(null);
    receivedChunksRef.current = [];
    bytesReceivedRef.current = 0;
    setProgress(0);
    cleanupRoom();
  };

  // --- Interaction Protocols ---
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    toast({ title: "Code Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!receivedBlob || !fileMeta) return;
    const url = URL.createObjectURL(receivedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileMeta.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prevent closing tab during transfer
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'transferring' || status === 'connecting') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  // QR Code Synthesis
  useEffect(() => {
    if (roomId && (window as any).QRCodeStyling && qrRef.current) {
      const qr = new (window as any).QRCodeStyling({
        width: 300,
        height: 300,
        data: `${window.location.origin}${window.location.pathname}?join=${roomId}`,
        dotsOptions: { color: "#2563eb", type: "extra-rounded" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: "rounded", color: "#2563eb" },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 }
      });
      qrRef.current.innerHTML = '';
      qr.append(qrRef.current);
    }
  }, [roomId, showQr]);

  // Handle direct join from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && mode === 'idle') {
      setInputRoomId(joinCode);
      // Auto-trigger join logic after brief mount delay
      setTimeout(() => {
        const btn = document.getElementById('join-btn-trigger');
        btn?.click();
      }, 500);
    }
  }, [mode]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Share2 className="w-3.5 h-3.5" /> High-Speed Share
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Direct <span className="text-primary italic">File Share</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Device-to-device file transfer without cloud storage. Secure, fast, and 100% private.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="direct-file-share" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace Pane */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-secondary/10">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             
             <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
                {mode === 'idle' ? (
                  <div className="w-full max-w-lg space-y-12">
                    {/* Send Block */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group/send relative h-56 rounded-[2.5rem] border-2 border-dashed border-white/10 hover:border-primary/40 flex flex-col items-center justify-center gap-6 cursor-pointer bg-black/40 transition-all duration-500 shadow-xl"
                    >
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover/send:text-primary group-hover/send:scale-110 transition-all">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="text-sm font-headline font-black uppercase text-white/40 group-hover/send:text-white transition-colors">Send a file</span>
                        <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Direct tunnel sharing</p>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && startSending(e.target.files[0])} className="hidden" />
                    </div>

                    <div className="relative flex items-center justify-center">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                       <span className="relative px-4 bg-transparent text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">OR</span>
                    </div>

                    {/* Receive Block */}
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Receive Protocol</Label>
                      <div className="flex gap-2">
                         <Input 
                          value={inputRoomId} 
                          onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                          placeholder="ENTER 6-DIGIT CODE" 
                          className="h-14 bg-black/40 border-white/10 rounded-2xl text-center text-lg font-black tracking-widest placeholder:text-white/5" 
                         />
                         <Button id="join-btn-trigger" onClick={startReceiving} className="h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20">
                            Join
                         </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in duration-500">
                     {/* Transfer Status Matrix */}
                     <div className="flex flex-col items-center gap-8">
                        <div className="relative w-40 h-40">
                           <svg className="w-full h-full transform -rotate-90">
                              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (progress / 100) * 440} className="text-primary transition-all duration-500 ease-out" />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              {status === 'complete' ? (
                                <CheckCircle2 className="w-12 h-12 text-primary animate-in zoom-in" />
                              ) : (
                                <>
                                  <span className="text-3xl font-headline font-black text-white">{progress}%</span>
                                  <span className="text-[9px] font-black uppercase text-white/40">{speed}</span>
                                </>
                              )}
                           </div>
                        </div>

                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-headline font-black uppercase text-white tracking-tight">
                              {status === 'searching' ? 'Waiting for peer...' : 
                               status === 'connecting' ? 'Establishing link...' :
                               status === 'transferring' ? (mode === 'send' ? 'Sending Data...' : 'Receiving Data...') :
                               status === 'complete' ? 'Transfer Finished' : 'Protocol Error'}
                           </h3>
                           <div className="flex items-center justify-center gap-3">
                              <File className="w-4 h-4 text-primary/40" />
                              <span className="text-xs font-bold text-white/40 uppercase tracking-widest truncate max-w-[240px]">
                                 {file?.name || fileMeta?.name || 'Unknown asset'}
                              </span>
                              <span className="text-[10px] font-mono text-white/20">
                                 {file ? (file.size / (1024 * 1024)).toFixed(1) : (fileMeta?.size || 0) / (1024 * 1024).toFixed(1)} MB
                              </span>
                           </div>
                        </div>

                        {status === 'searching' && (
                           <div className="flex flex-col items-center gap-6 w-full animate-in slide-in-from-bottom-4">
                              <div className="bg-primary text-white text-3xl font-black tracking-[0.5em] px-10 py-5 rounded-3xl shadow-2xl ring-4 ring-primary/10">
                                 {roomId}
                              </div>
                              <div className="flex gap-3">
                                 <Button onClick={handleCopyCode} variant="outline" className="h-10 px-6 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest">
                                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                                    Copy Code
                                 </Button>
                                 <Button onClick={() => setShowQr(!showQr)} variant="outline" className="h-10 px-6 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest">
                                    <QrCode className="w-3.5 h-3.5 mr-2" />
                                    {showQr ? 'Hide QR' : 'Show QR'}
                                 </Button>
                              </div>
                              {showQr && (
                                <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-500 mt-4">
                                   <div ref={qrRef} className="w-[200px] h-[200px]" />
                                </div>
                              )}
                           </div>
                        )}

                        {status === 'complete' && mode === 'receive' && (
                          <Button onClick={handleDownload} className="h-16 px-12 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-lg uppercase tracking-widest animate-bounce">
                             <Download className="w-6 h-6 mr-3" /> Save to Device
                          </Button>
                        )}

                        {status === 'error' && (
                           <div className="flex flex-col items-center gap-4 text-center animate-in shake duration-500">
                              <WifiOff className="w-12 h-12 text-red-500" />
                              <p className="text-xs font-bold text-red-400 uppercase max-w-sm">{errorMessage}</p>
                              <p className="text-[10px] text-white/20 uppercase">Keep both pages open on same WiFi and try again.</p>
                           </div>
                        )}

                        <Button variant="ghost" onClick={stopAll} className="text-white/20 hover:text-red-500 transition-all text-[9px] font-black uppercase tracking-widest">
                           Cancel Protocol
                        </Button>
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-white/5 flex items-start gap-6 group hover:bg-secondary transition-all">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-white uppercase tracking-widest">Zero Cloud storage</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed font-medium uppercase">
                    Your file is never uploaded. It streams directly through a secure data channel between devices.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-white/5 flex items-start gap-6 group hover:bg-secondary transition-all">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-white uppercase tracking-widest">Unlimited potential</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed font-medium uppercase">
                    Transfer files as large as your device can handle. The only limit is your browser's local memory.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
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
                      { icon: Smartphone, title: 'Keep page open', desc: 'The sender must stay on this page until the transfer hits 100%.' },
                      { icon: Wifi, title: 'Better on WiFi', desc: 'Transfers are fastest and most stable when both devices are on the same network.' },
                      { icon: Lock, title: 'Handshake Only', desc: 'We only use our server to help the devices find each other. The data is private.' },
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

                 <div className="p-6 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-yellow-600/70 font-black uppercase leading-relaxed">
                      If the connection stalls, try refreshing both pages and ensuring both devices are active.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .scanner-line {
          animation: scan 2.5s ease-in-out infinite;
        }
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}

