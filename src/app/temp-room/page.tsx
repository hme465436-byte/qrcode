
"use client"

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function TempRoomPage() {
  const { toast } = useToast();
  
  // Peer State
  const [peer, setPeer] = useState<any>(null);
  const [conn, setConn] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');
  
  // UI State
  const [view, setView] = useState<'start' | 'room' | 'closed'>('start');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');
  const [inputText, setInputText] = useState('');
  const [sharedText, setSharedText] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Core P2P Logic ---

  const initPeer = async (): Promise<any> => {
    const { default: Peer } = await import('peerjs');
    const p = new Peer();
    
    return new Promise((resolve, reject) => {
      p.on('open', (id) => {
        setPeer(p);
        resolve(p);
      });
      p.on('error', (err) => {
        setError(err.message);
        setIsConnecting(false);
        reject(err);
      });
      p.on('disconnected', () => setView('closed'));
      p.on('close', () => setView('closed'));
    });
  };

  const setupConnection = (connection: any) => {
    setConn(connection);
    setStatus('connected');
    setView('room');
    toast({ title: "Connected", description: "Live text sync active." });

    connection.on('data', (data: any) => {
      if (data.type === 'text') {
        setSharedText(data.value);
      }
    });

    connection.on('close', () => setView('closed'));
    connection.on('error', () => setView('closed'));
  };

  const handleCreate = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const p = await initPeer();
      setRoomCode(p.id);
      setStatus('waiting');
      setView('room');
      
      p.on('connection', (incomingConn: any) => {
        setupConnection(incomingConn);
      });
      
      toast({ title: "Room Created" });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setIsConnecting(true);
    setError(null);
    try {
      const p = await initPeer();
      const connection = p.connect(roomCode.trim());
      
      connection.on('open', () => {
        setupConnection(connection);
      });
    } catch (e: any) {
      setError(e.message);
      setIsConnecting(false);
    }
  };

  const handleTextChange = (val: string) => {
    setSharedText(val);
    if (conn && conn.open) {
      conn.send({ type: 'text', value: val });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sharedText);
    setIsCopied(true);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLeave = () => {
    if (peer) peer.destroy();
    window.location.reload();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peer) peer.destroy();
    };
  }, [peer]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-x-hidden">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> Direct P2P
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Temp <span className="text-primary italic">Room</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Shared live clipboard. Send text directly between devices using a secure P2P tunnel. No cloud storage used.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="temp-room" />
             {view !== 'start' && (
               <Button variant="outline" size="sm" onClick={handleLeave} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                 <LogOut className="w-3.5 h-3.5 mr-2" /> Leave
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-secondary/10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <CardHeader className="py-4 border-b border-white/5 bg-black/20 flex flex-row items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-500",
                    status === 'connected' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-white/10"
                  )} />
                  <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                    {status === 'connected' ? 'P2P Tunnel Active' : status === 'waiting' ? 'Waiting for peer' : 'Ready'}
                  </CardTitle>
               </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6 sm:p-10 relative overflow-hidden">
               {view === 'start' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in fade-in zoom-in duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
                       <button 
                        onClick={handleCreate}
                        disabled={isConnecting}
                        className="group flex flex-col items-center gap-6 p-10 rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                       >
                          <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center border border-white/20">
                             {isConnecting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
                          </div>
                          <span className="text-sm font-headline font-black uppercase tracking-widest">Create Room</span>
                       </button>
                       
                       <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5 flex flex-col items-center gap-6 group/join">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/5 group-hover/join:border-primary/40 transition-colors">
                             <CornerDownLeft className="w-8 h-8 text-white/20 group-hover/join:text-primary transition-colors" />
                          </div>
                          <div className="w-full space-y-4">
                             <Input 
                              value={roomCode}
                              onChange={e => setRoomCode(e.target.value)}
                              placeholder="Enter Code"
                              className="h-12 bg-white/5 border-white/10 text-center text-xs font-bold uppercase rounded-xl"
                             />
                             <Button onClick={handleJoin} disabled={isConnecting || !roomCode.trim()} className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white/90">
                                {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Join Room'}
                             </Button>
                          </div>
                       </div>
                    </div>
                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                         <AlertCircle className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase">{error}</span>
                      </div>
                    )}
                 </div>
               )}

               {view === 'room' && status === 'waiting' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-10 animate-in fade-in duration-700">
                    <div className="space-y-4 text-center w-full px-6">
                       <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Room Code</p>
                       <div className="p-6 bg-black/40 rounded-[2.5rem] border border-primary/20 flex items-center justify-center gap-4 group/code">
                          <h3 className="text-2xl sm:text-4xl font-mono font-bold text-white tracking-widest truncate">{roomCode}</h3>
                          <button onClick={() => handleCopy(roomCode, 'Code')} className="p-3 rounded-xl bg-white/5 hover:bg-primary transition-all text-white/40 hover:text-white">
                             <Copy className="w-5 h-5" />
                          </button>
                       </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 text-center px-10">
                       <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Waiting for other device...</p>
                       </div>
                       <p className="text-[9px] text-white/10 uppercase max-w-[240px] leading-relaxed">Share this code with the recipient. Keep this page open.</p>
                    </div>
                 </div>
               )}

               {view === 'room' && status === 'connected' && (
                 <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 h-full">
                    <Textarea 
                      value={sharedText}
                      onChange={e => handleTextChange(e.target.value)}
                      placeholder="Type here..."
                      className="flex-1 bg-black/20 border-white/10 rounded-[2.5rem] p-10 text-xl font-medium leading-relaxed resize-none focus:ring-primary/40 text-white min-h-[300px] lg:min-h-0 custom-scrollbar shadow-inner"
                    />
                    
                    <div className="flex gap-4">
                       <Button onClick={handleCopy} className="h-16 flex-1 bg-primary text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                          {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                          Copy Text
                       </Button>
                       <Button variant="outline" onClick={() => handleTextChange('')} className="h-16 px-8 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:text-destructive">
                          Clear
                       </Button>
                    </div>
                 </div>
               )}

               {view === 'closed' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in zoom-in duration-500 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl border border-red-500/20">
                       <X className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-headline font-black uppercase text-white">Room Closed</h3>
                       <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest max-w-[240px] mx-auto">
                          The session has ended. All data has been purged.
                       </p>
                    </div>
                    <Button onClick={() => window.location.reload()} className="h-14 px-10 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">
                       New Studio
                    </Button>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Matrix Info
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 {[
                   { icon: Smartphone, title: 'No Account', desc: 'Sync text between devices without logging in.' },
                   { icon: Globe, title: 'Peer-to-Peer', desc: 'Direct browser-to-browser tunnel via WebRTC.' },
                   { icon: ShieldCheck, title: 'Private', desc: 'Text is never stored on any server or database.' },
                 ].map((tip, i) => (
                   <div key={i} className="flex gap-5 group">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-border group-hover:scale-110 transition-transform">
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
                Both browser tabs must remain open to maintain the P2P connection. If either person leaves, the room is destroyed.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

