
"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ClipboardType, 
  Plus, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  X, 
  LogOut,
  Smartphone,
  Globe,
  ShieldCheck,
  Activity,
  CornerDownLeft,
  AlertCircle,
  Info,
  MessageSquare,
  FileText,
  FileUp,
  Download,
  QrCode,
  Lock,
  Unlock,
  KeyRound,
  Clock,
  User,
  Send,
  MoreVertical,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Types & Constants ---
type RoomStatus = 'idle' | 'waiting' | 'verifying' | 'connected' | 'closed';
type ActiveTab = 'notepad' | 'chat' | 'files';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: number;
  isMe: boolean;
}

interface IncomingFile {
  name: string;
  size: number;
  mime: string;
  progress: number;
  blob?: Blob;
  url?: string;
}

const CHUNK_SIZE = 16384; // 16KB

export default function TempRoomPage() {
  const { toast } = useToast();
  
  // Peer/Connection State
  const [peer, setPeer] = useState<any>(null);
  const [conn, setConn] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');
  const [peerIdInput, setPeerIdInput] = useState('');
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [activeTab, setActiveTab] = useState<ActiveTab>('notepad');
  
  // Identity
  const [myName, setMyName] = useState('');
  const [peerName, setPeerName] = useState('Remote Peer');
  const [isHost, setIsHost] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [connDuration, setConnDuration] = useState('00:00');

  // Security
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [enteredPin, setEnteredPin] = useState('');

  // Content
  const [sharedText, setSharedText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // File Transfer
  const [outboundFile, setOutboundFile] = useState<File | null>(null);
  const [outboundProgress, setOutboundProgress] = useState(0);
  const [inboundFile, setInboundFile] = useState<IncomingFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);

  // UI
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- Logic Matrix ---

  // Random Name Generator
  useEffect(() => {
    const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Nova', 'Zion', 'Apex', 'Matrix', 'Vector'];
    setMyName(names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(Math.random() * 999));
  }, []);

  // Duration Timer
  useEffect(() => {
    if (status === 'connected' && startTime) {
      const interval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setConnDuration(`${m}:${s}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  // Chat Auto-scroll
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const initPeer = async (): Promise<any> => {
    const { default: Peer } = await import('peerjs');
    const p = new Peer();
    
    return new Promise((resolve, reject) => {
      p.on('open', (id) => {
        setPeer(p);
        resolve(p);
      });
      p.on('error', (err) => {
        toast({ variant: "destructive", title: "Peer Error", description: err.message });
        setIsConnecting(false);
        reject(err);
      });
      p.on('disconnected', () => setStatus('closed'));
      p.on('close', () => setStatus('closed'));
    });
  };

  const setupDataListeners = (connection: any) => {
    setConn(connection);
    
    connection.on('open', () => {
      // Handshake identity
      connection.send({ type: 'name-sync', value: myName });
      
      if (isHost && pin.trim()) {
        setStatus('verifying');
        setIsUnlocked(false);
        connection.send({ type: 'pin-req' });
      } else {
        setStatus('connected');
        setStartTime(Date.now());
      }
    });

    connection.on('data', (data: any) => {
      switch (data.type) {
        case 'name-sync':
          setPeerName(data.value);
          toast({ title: "Peer Joined", description: `${data.value} is now connected.` });
          break;
        case 'text':
          setSharedText(data.value);
          break;
        case 'chat':
          setChatMessages(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            sender: data.sender,
            text: data.value,
            time: Date.now(),
            isMe: false
          }]);
          break;
        case 'typing':
          setIsPeerTyping(data.value);
          break;
        case 'pin-req':
          setStatus('verifying');
          setIsUnlocked(false);
          break;
        case 'pin-auth':
          if (data.value === pin.trim()) {
            connection.send({ type: 'pin-ok' });
            setStatus('connected');
            setIsUnlocked(true);
            setStartTime(Date.now());
          } else {
            connection.send({ type: 'pin-fail' });
          }
          break;
        case 'pin-ok':
          setStatus('connected');
          setIsUnlocked(true);
          setStartTime(Date.now());
          toast({ title: "Authorized", description: "Protocol unlocked." });
          break;
        case 'pin-fail':
          toast({ variant: "destructive", title: "Access Denied", description: "Incorrect room PIN." });
          break;
        case 'file-meta':
          setInboundFile({ name: data.name, size: data.size, mime: data.mime, progress: 0 });
          receivedChunksRef.current = [];
          setActiveTab('files');
          break;
        case 'file-chunk':
          receivedChunksRef.current.push(data.data);
          setInboundFile(prev => prev ? { 
            ...prev, 
            progress: Math.round((receivedChunksRef.current.length * CHUNK_SIZE / prev.size) * 100) 
          } : null);
          break;
        case 'file-end':
          const blob = new Blob(receivedChunksRef.current, { type: inboundFile?.mime });
          setInboundFile(prev => prev ? { ...prev, progress: 100, blob, url: URL.createObjectURL(blob) } : null);
          toast({ title: "File Received", description: "Asset ready for download." });
          break;
      }
    });

    connection.on('close', () => setStatus('closed'));
  };

  const handleCreate = async () => {
    setIsConnecting(true);
    setIsHost(true);
    try {
      const p = await initPeer();
      setRoomCode(p.id);
      setStatus('waiting');
      p.on('connection', (incoming) => {
        setupDataListeners(incoming);
      });
    } catch (e) {} finally {
      setIsConnecting(false);
    }
  };

  const handleJoin = async () => {
    if (!peerIdInput.trim()) return;
    setIsConnecting(true);
    setIsHost(false);
    try {
      const p = await initPeer();
      const connection = p.connect(peerIdInput.trim());
      setupDataListeners(connection);
    } catch (e) {} finally {
      setIsConnecting(false);
    }
  };

  const handleVerifyPin = () => {
    if (conn && conn.open) {
      conn.send({ type: 'pin-auth', value: enteredPin.trim() });
    }
  };

  // Content Actions
  const handleTextChange = (val: string) => {
    setSharedText(val);
    if (conn?.open) conn.send({ type: 'text', value: val });
  };

  const sendChatMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !conn?.open) return;
    const msg = chatInput.trim();
    conn.send({ type: 'chat', value: msg, sender: myName });
    setChatMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender: myName,
      text: msg,
      time: Date.now(),
      isMe: true
    }]);
    setChatInput('');
    sendTypingIndicator(false);
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (conn?.open) conn.send({ type: 'typing', value: isTyping });
  };

  const handleChatInputChange = (val: string) => {
    setChatInput(val);
    sendTypingIndicator(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendTypingIndicator(false), 2000);
  };

  // File Transfer Logic
  const sendFile = async () => {
    if (!outboundFile || !conn?.open) return;
    if (outboundFile.size > 10 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Heavy Payload", description: "Max file size is 10MB for P2P sync." });
      return;
    }

    setOutboundProgress(0);
    conn.send({ type: 'file-meta', name: outboundFile.name, size: outboundFile.size, mime: outboundFile.type });

    const reader = new FileReader();
    let offset = 0;
    
    reader.onload = (e: any) => {
      conn.send({ type: 'file-chunk', data: e.target.result });
      offset += e.target.result.byteLength;
      setOutboundProgress(Math.round((offset / outboundFile.size) * 100));
      if (offset < outboundFile.size) {
        readNext();
      } else {
        conn.send({ type: 'file-end' });
        toast({ title: "Sent", description: "File successfully transmitted." });
        setOutboundFile(null);
        setOutboundProgress(0);
      }
    };

    const readNext = () => {
      const slice = outboundFile.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    readNext();
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Identity Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([sharedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shared_notepad.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // QR Generation
  useEffect(() => {
    if (showQr && qrRef.current && roomCode) {
      const render = async () => {
        if (!(window as any).QRCodeStyling) return;
        qrRef.current!.innerHTML = '';
        new (window as any).QRCodeStyling({
          width: 250,
          height: 250,
          data: roomCode,
          dotsOptions: { color: "#3b82f6", type: "extra-rounded" },
          backgroundOptions: { color: "transparent" },
          cornersSquareOptions: { type: "extra-rounded", color: "#3b82f6" }
        }).append(qrRef.current);
      };
      render();
    }
  }, [showQr, roomCode]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> Direct P2P Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Temp <span className="text-primary italic">Room PRO</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Advanced live clipboard and secure data tunnel. Collaborate in real-time with encrypted P2P messaging and zero-storage file sharing.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="temp-room" />
             {status !== 'idle' && (
               <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                 <LogOut className="w-3.5 h-3.5 mr-2" /> Leave Session
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-secondary/10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <CardHeader className="py-4 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-500",
                    status === 'connected' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-white/10"
                  )} />
                  <div className="space-y-0.5">
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                      {status === 'connected' ? 'Session Sync Active' : status === 'verifying' ? 'Security Handshake' : status === 'waiting' ? 'Establishing Tunnel' : 'System Standby'}
                    </CardTitle>
                    {status === 'connected' && (
                      <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">Linked: {peerName} • {connDuration}</p>
                    )}
                  </div>
               </div>

               {status === 'connected' && (
                 <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                    <button onClick={() => setActiveTab('notepad')} className={cn("px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeTab === 'notepad' ? "bg-primary text-white" : "text-white/20 hover:text-white")}>Notepad</button>
                    <button onClick={() => setActiveTab('chat')} className={cn("px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all relative", activeTab === 'chat' ? "bg-primary text-white" : "text-white/20 hover:text-white")}>
                      Chat {isPeerTyping && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />}
                    </button>
                    <button onClick={() => setActiveTab('files')} className={cn("px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeTab === 'files' ? "bg-primary text-white" : "text-white/20 hover:text-white")}>Files</button>
                 </div>
               )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6 sm:p-10 relative overflow-hidden">
               {/* 1. START VIEW */}
               {status === 'idle' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in fade-in zoom-in duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
                       <button 
                        onClick={handleCreate}
                        disabled={isConnecting}
                        className="group flex flex-col items-center gap-6 p-10 rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                       >
                          <div className="w-20 h-20 rounded-[2.5rem] bg-white/20 flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
                             {isConnecting ? <Loader2 className="w-10 h-10 animate-spin" /> : <Plus className="w-10 h-10" />}
                          </div>
                          <div className="text-center space-y-2">
                             <span className="text-sm font-headline font-black uppercase tracking-widest">Create Private Room</span>
                             <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">Initialize P2P Signaling</p>
                          </div>
                       </button>
                       
                       <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5 flex flex-col items-center gap-8 group/join relative">
                          <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/5 group-hover/join:border-primary/40 transition-colors">
                             <CornerDownLeft className="w-10 h-10 text-white/20 group-hover/join:text-primary transition-colors" />
                          </div>
                          <div className="w-full space-y-4">
                             <Input 
                              value={peerIdInput}
                              onChange={e => setPeerIdInput(e.target.value)}
                              placeholder="PASTE 6-CHAR CODE"
                              className="h-14 bg-white/5 border-white/10 text-center text-xs font-bold tracking-[0.2em] uppercase rounded-2xl"
                             />
                             <Button onClick={handleJoin} disabled={isConnecting || !peerIdInput.trim()} className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/90 shadow-xl">
                                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Access Room Protocol'}
                             </Button>
                          </div>
                       </div>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-center gap-4 group/name">
                       <Label className="text-[10px] font-black uppercase text-foreground/30 ml-2">Your Device ID:</Label>
                       <Input 
                        value={myName}
                        onChange={e => setMyName(e.target.value)}
                        className="w-40 h-10 bg-background border-border text-[10px] font-black uppercase text-center rounded-xl focus:ring-primary/20"
                       />
                       <User className="w-4 h-4 text-primary opacity-20 group-hover/name:opacity-100 transition-opacity" />
                    </div>
                 </div>
               )}

               {/* 2. WAITING VIEW */}
               {status === 'waiting' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in fade-in duration-700 text-center">
                    <div className="space-y-6 w-full max-w-lg">
                       <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">Identity Token (Room Code)</p>
                       <div className="relative group/code">
                          <div className="absolute -inset-4 bg-primary/10 blur-3xl opacity-0 group-hover/code:opacity-100 transition-opacity" />
                          <div className="relative p-8 bg-black/40 rounded-[3rem] border-2 border-primary/20 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-2xl">
                             <h3 className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-[0.1em] select-all">{roomCode}</h3>
                             <div className="flex gap-2">
                                <Button onClick={() => handleCopy(roomCode, 'code')} variant="outline" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 text-white">
                                   {isCopied === 'code' ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                </Button>
                                <Button onClick={() => setShowQr(true)} variant="outline" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 text-white">
                                   <QrCode className="w-6 h-6" />
                                </Button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex items-center justify-center gap-4">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Awaiting Peer Hardware...</p>
                       </div>
                       <div className="max-w-sm mx-auto p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-[10px] text-white/20 font-bold uppercase leading-relaxed text-left">Keep this page open. Share the code above with your partner to initialize sync.</p>
                       </div>
                    </div>

                    {/* Optional Host PIN Setup */}
                    {isHost && (
                      <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border space-y-4 animate-in slide-in-from-bottom-4">
                         <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-primary" />
                            <Label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Secure Lock (PIN)</Label>
                         </div>
                         <Input 
                          value={pin}
                          onChange={e => setPin(e.target.value.substring(0, 4).replace(/[^0-9]/g, ''))}
                          placeholder="Optional 4-Digit PIN"
                          className="h-14 bg-background border-border text-center text-xl font-bold tracking-[1em] rounded-2xl"
                         />
                         <p className="text-[9px] text-foreground/20 font-bold uppercase">If set, peer must enter this PIN to unlock data.</p>
                      </div>
                    )}
                 </div>
               )}

               {/* 3. VERIFYING VIEW */}
               {status === 'verifying' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-10 animate-in zoom-in-95">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                       <Lock className="w-10 h-10" />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-xl font-headline font-black text-foreground uppercase">Access Restricted</h3>
                       <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Enter the security PIN provided by the host</p>
                    </div>
                    <div className="w-full max-w-xs space-y-4">
                       <Input 
                        value={enteredPin}
                        onChange={e => setEnteredPin(e.target.value.substring(0, 4))}
                        placeholder="••••"
                        className="h-16 bg-white/5 border-border text-center text-3xl font-bold tracking-[0.5em] rounded-2xl"
                       />
                       <Button onClick={handleVerifyPin} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl">
                          Unlock Session
                       </Button>
                    </div>
                 </div>
               )}

               {/* 4. CONNECTED VIEWS */}
               {status === 'connected' && (
                 <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500">
                    {/* Notepad Tab */}
                    {activeTab === 'notepad' && (
                       <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-bottom-2">
                          <Textarea 
                            value={sharedText}
                            onChange={e => handleTextChange(e.target.value)}
                            placeholder="Draft clinical data here..."
                            className="flex-1 min-h-[40vh] bg-black/20 border-white/10 rounded-[2.5rem] p-10 text-lg font-medium leading-relaxed resize-none focus:ring-primary/40 text-white custom-scrollbar shadow-inner"
                          />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                             <Button onClick={() => handleCopy(sharedText, 'notepad')} className="h-14 bg-primary text-white font-black uppercase text-[9px] tracking-widest rounded-2xl shadow-xl">
                                {isCopied === 'notepad' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy All
                             </Button>
                             <Button variant="outline" onClick={async () => { try { const t = await navigator.clipboard.readText(); handleTextChange(t); } catch(e){} }} className="h-14 bg-white/5 border-white/10 text-white/60 font-black uppercase text-[9px] rounded-2xl">
                                Paste Data
                             </Button>
                             <Button variant="outline" onClick={downloadText} className="h-14 bg-white/5 border-white/10 text-white/60 font-black uppercase text-[9px] rounded-2xl">
                                Export .TXT
                             </Button>
                             <Button variant="outline" onClick={() => handleTextChange('')} className="h-14 bg-white/5 border-white/10 text-white/60 font-black uppercase text-[9px] rounded-2xl hover:text-destructive">
                                Clear
                             </Button>
                          </div>
                       </div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                       <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-bottom-2 h-full max-h-[500px]">
                          <div ref={chatScrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-4 rounded-3xl bg-black/20 border border-white/5">
                             {chatMessages.length === 0 ? (
                               <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                                  <MessageSquare className="w-12 h-12 text-primary" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">Protocol Buffer Empty</p>
                               </div>
                             ) : chatMessages.map(msg => (
                               <div key={msg.id} className={cn("flex flex-col gap-1.5", msg.isMe ? "items-end" : "items-start")}>
                                  <div className="flex items-center gap-2 px-1">
                                     <span className="text-[8px] font-black text-foreground/40 uppercase">{msg.sender}</span>
                                     <span className="text-[7px] font-bold text-foreground/20">{new Date(msg.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <div className={cn(
                                    "max-w-[85%] px-5 py-3 rounded-2xl text-xs font-medium shadow-lg",
                                    msg.isMe ? "bg-primary text-white rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none"
                                  )}>
                                     {msg.text}
                                  </div>
                               </div>
                             ))}
                             {isPeerTyping && (
                               <div className="flex items-start gap-3 animate-in slide-in-from-bottom-1">
                                  <div className="bg-secondary/40 px-4 py-2 rounded-2xl flex gap-1 items-center">
                                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                     <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                  </div>
                               </div>
                             )}
                          </div>
                          
                          <form onSubmit={sendChatMessage} className="flex gap-3">
                             <Input 
                              value={chatInput}
                              onChange={e => handleChatInputChange(e.target.value)}
                              placeholder="Type a message..."
                              className="h-14 flex-1 bg-secondary/50 border-border rounded-2xl text-sm font-medium focus:ring-primary/20"
                             />
                             <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/30">
                                <Send className="w-5 h-5 icon-3d" />
                             </Button>
                          </form>
                       </div>
                    )}

                    {/* Files Tab */}
                    {activeTab === 'files' && (
                       <div className="flex-1 flex flex-col gap-8 animate-in slide-in-from-bottom-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                             {/* Outbound */}
                             <div className="p-8 rounded-[3rem] bg-black/20 border border-white/5 flex flex-col gap-6 items-center text-center">
                                <div className="space-y-1">
                                   <h4 className="text-[11px] font-black uppercase text-foreground">Outbound Tunnel</h4>
                                   <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">Max 10MB per asset</p>
                                </div>
                                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/20 flex flex-col items-center justify-center bg-background/20 cursor-pointer group/file">
                                   {outboundFile ? (
                                      <div className="space-y-2">
                                         <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                                         <p className="text-[10px] font-bold text-white truncate max-w-[200px]">{outboundFile.name}</p>
                                      </div>
                                   ) : (
                                      <>
                                         <FileUp className="w-8 h-8 text-white/10 group-hover/file:text-primary transition-colors mb-2" />
                                         <span className="text-[9px] font-black uppercase text-white/20">Select Asset</span>
                                      </>
                                   )}
                                   <input type="file" ref={fileInputRef} onChange={e => setOutboundFile(e.target.files?.[0] || null)} className="hidden" />
                                </div>
                                {outboundProgress > 0 && (
                                   <div className="w-full space-y-2">
                                      <div className="flex justify-between text-[8px] font-black uppercase text-primary">
                                         <span>Streaming...</span>
                                         <span>{outboundProgress}%</span>
                                      </div>
                                      <Progress value={outboundProgress} className="h-1" />
                                   </div>
                                )}
                                <Button onClick={sendFile} disabled={!outboundFile || isProcessing} className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg">
                                   Send Stream
                                </Button>
                             </div>

                             {/* Inbound */}
                             <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/20 flex flex-col gap-6 items-center text-center relative overflow-hidden">
                                <div className="space-y-1 relative z-10">
                                   <h4 className="text-[11px] font-black uppercase text-primary">Inbound Feed</h4>
                                   <p className="text-[9px] text-primary/40 font-bold uppercase tracking-widest">Incoming assets</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                                   {inboundFile ? (
                                     <div className="w-full space-y-6 animate-in zoom-in">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                                           <FileText className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2">
                                           <p className="text-[11px] font-bold text-foreground truncate uppercase">{inboundFile.name}</p>
                                           <p className="text-[9px] font-black text-foreground/30 uppercase">{(inboundFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                        </div>
                                        {inboundFile.progress < 100 ? (
                                          <div className="space-y-2">
                                            <Progress value={inboundFile.progress} className="h-1" />
                                            <span className="text-[8px] font-black text-primary uppercase">{inboundFile.progress}% Received</span>
                                          </div>
                                        ) : (
                                          <Button asChild className="w-full h-12 bg-white text-black font-black uppercase text-[9px] rounded-xl shadow-xl">
                                             <a href={inboundFile.url} download={inboundFile.name}>
                                                <Download className="w-4 h-4 mr-2" /> Save to Device
                                             </a>
                                          </Button>
                                        )}
                                     </div>
                                   ) : (
                                     <div className="opacity-10 text-center space-y-4">
                                        <ArrowRightLeft className="w-12 h-12 mx-auto" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Signal</p>
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
               )}

               {status === 'closed' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-10 animate-in zoom-in duration-500 text-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl border border-red-500/20">
                       <X className="w-12 h-12" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-3xl font-headline font-black uppercase text-foreground">Room Definitively Closed</h3>
                       <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                          The P2P tunnel has been destroyed. All shared data was held in volatile memory and is now definitively purged.
                       </p>
                    </div>
                    <Button onClick={() => window.location.reload()} className="h-16 px-12 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-2xl shadow-primary/30">
                       Initialize New Studio
                    </Button>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           {/* Connection Matrix */}
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Matrix Connectivity
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Smartphone className="w-4 h-4" />
                             </div>
                             <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Local Client</span>
                          </div>
                          <span className="text-[10px] font-bold text-primary truncate max-w-[120px]">{myName}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground/40">
                                <Globe className="w-4 h-4" />
                             </div>
                             <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Peer Status</span>
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase",
                            status === 'connected' ? "text-green-500" : "text-foreground/20"
                          )}>
                            {status === 'connected' ? `Linked to ${peerName}` : 'Standby'}
                          </span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/20 flex flex-col items-center justify-center text-center gap-2">
                          <Clock className="w-5 h-5 text-primary/40" />
                          <span className="text-[9px] font-black uppercase text-foreground/40">Duration</span>
                          <span className="text-sm font-mono font-bold text-foreground">{connDuration}</span>
                       </div>
                       <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/20 flex flex-col items-center justify-center text-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-primary/40" />
                          <span className="text-[9px] font-black uppercase text-foreground/40">Protocol</span>
                          <span className="text-[10px] font-bold text-foreground uppercase">WASM_P2P</span>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Security Hub */}
           <Card className="glass-card border-border shadow-xl">
              <CardContent className="p-8 space-y-6">
                 {[
                   { icon: ShieldCheck, title: 'Zero Cloud', desc: 'No messages are stored in any database or cloud infrastructure.' },
                   { icon: Lock, title: 'Identity Locked', desc: 'Optional PIN protocol ensures only authorized peers can sync content.' },
                   { icon: Activity, title: 'Direct Tunnel', desc: 'Encrypted memory-to-memory streaming via WebRTC DataChannels.' },
                 ].map((tip, i) => (
                   <div key={i} className="flex gap-5 group">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-border group-hover:scale-110 transition-transform shadow-sm">
                         <tip.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 min-w-0">
                         <h4 className="text-[11px] font-black uppercase text-foreground">{tip.title}</h4>
                         <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">{tip.desc}</p>
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>
           
           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-4">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed">
                Both browser tabs must remain open to maintain the P2P connection. If either person leaves, the room is definitively destroyed and all volatile data is purged.
              </p>
           </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="w-full max-w-lg space-y-10 text-center">
              <div className="space-y-4">
                 <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">Scan to <span className="text-primary italic">Sync</span></h2>
                 <p className="text-white/20 text-xs font-black uppercase tracking-widest">Hold your camera to the token matrix</p>
              </div>

              <div className="relative group/qr mx-auto w-fit">
                 <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-50 animate-pulse" />
                 <div className="relative p-6 bg-white rounded-[3.5rem] shadow-2xl transition-transform duration-700 group-hover/qr:scale-105 border-4 border-primary/20">
                    <div ref={qrRef} className="w-[250px] h-[250px] bg-white rounded-3xl" />
                 </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                 <p className="text-xl font-mono font-bold text-white tracking-[0.2em]">{roomCode}</p>
                 <Button onClick={() => setShowQr(false)} className="h-16 px-12 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-primary/30">
                    Exit Preview
                 </Button>
              </div>
           </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
