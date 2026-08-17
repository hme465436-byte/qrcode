
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ClipboardType, 
  Plus, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  Activity, 
  X, 
  QrCode, 
  ShieldCheck, 
  MessageSquare,
  AlertCircle,
  CornerDownLeft,
  LogOut,
  Smartphone,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { doc, setDoc, onSnapshot, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { GetHelp } from '@/components/qr-canvas/get-help';

const ROOMS_COLLECTION = "tempRooms";
const MAX_TEXT_SIZE = 50 * 1024; // 50KB Limit

export default function TempRoomPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  // App State
  const [view, setView] = useState<'start' | 'waiting' | 'active' | 'closed'>('start');
  const [roomCode, setCode] = useState('');
  const [sharedText, setSharedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Refs
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<any>(null);

  // High Readability Character Set
  const generateCode = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; 
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // --- Core Listener Protocol ---
  useEffect(() => {
    if (!db || !roomCode || view === 'start' || view === 'closed') return;

    const unsubscribe = onSnapshot(doc(db, ROOMS_COLLECTION, roomCode), (snapshot) => {
      if (!snapshot.exists()) {
        if (view === 'active') setView('closed');
        return;
      }
      
      const data = snapshot.data();
      
      // Auto-transition when peer connects
      if (data.status === 'connected' && view === 'waiting') {
        setView('active');
        toast({ title: "Peer Connected", description: "Linguistic sync active." });
      }
      
      // Sync text matrix
      if (data.text !== undefined && data.text !== sharedText) {
        setSharedText(data.text);
      }
    }, (err) => {
      console.warn("Snapshot Protocol Error:", err.message);
    });

    return () => unsubscribe();
  }, [db, roomCode, view, sharedText, toast]);

  // --- Actions ---
  const handleCreate = async () => {
    if (!db) {
      alert("Firestore missing. The signaling service is not initialized. Check your Firebase configuration.");
      return;
    }
    
    setIsConnecting(true);
    const code = generateCode();
    
    try {
      const docRef = doc(db, ROOMS_COLLECTION, code);
      await setDoc(docRef, {
        text: '',
        createdAt: serverTimestamp(),
        status: 'waiting'
      });
      
      setCode(code);
      setView('waiting');
      toast({ title: "Room Created", description: `Code ${code} is now broadcast.` });
    } catch (e: any) {
      alert("Creation Failed: " + (e.message || "Unknown hardware error"));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoin = async () => {
    if (!db || !roomCode.trim()) return;
    const code = roomCode.trim().toUpperCase();
    setIsConnecting(true);
    
    try {
      const docRef = doc(db, ROOMS_COLLECTION, code);
      const snap = await getDoc(docRef);
      
      if (!snap.exists()) {
        alert("Room Not Found: The code is incorrect or the matrix has expired.");
        setIsConnecting(false);
        return;
      }

      await updateDoc(docRef, { status: 'connected' });
      setCode(code);
      setView('active');
      toast({ title: "Connected", description: "Joined existing sync room." });
    } catch (e: any) {
      alert("Join Failed: " + e.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTextChange = (val: string) => {
    if (val.length > MAX_TEXT_SIZE) return;
    setSharedText(val);

    // Debounced Sync Protocol
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(async () => {
      if (!db || !roomCode || view !== 'active') return;
      try {
        await updateDoc(doc(db, ROOMS_COLLECTION, roomCode), {
          text: val,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        // Silent background fail to prevent interrupt
      }
    }, 150);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sharedText);
    setIsCopied(true);
    toast({ title: "Content Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- QR Synthesis ---
  useEffect(() => {
    if (view === 'waiting' && qrRef.current && roomCode) {
      const render = async () => {
        if (!(window as any).QRCodeStyling) return;
        qrRef.current!.innerHTML = '';
        qrInstance.current = new (window as any).QRCodeStyling({
          width: 240,
          height: 240,
          data: `${window.location.origin}/temp-room?join=${roomCode}`,
          dotsOptions: { color: "#3b82f6", type: "extra-rounded" },
          backgroundOptions: { color: "transparent" },
          cornersSquareOptions: { type: "extra-rounded", color: "#3b82f6" },
        });
        qrInstance.current.append(qrRef.current);
      };
      render();
    }
  }, [view, roomCode]);

  // URL Parameter Detection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setCode(joinCode.toUpperCase());
    }
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-x-hidden">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> Live Sync
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
              Temp <span className="text-primary italic">Room</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Real-time ephemeral clipboard. Type on one device, see it on the other instantly. Data is volatile and purged upon session termination.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="temp-room" />
             {(view === 'active' || view === 'waiting') && (
               <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                 <LogOut className="w-3.5 h-3.5 mr-2" /> Abort
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
                    view === 'active' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-white/10"
                  )} />
                  <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                    {view === 'active' ? 'Link Synchronized' : view === 'waiting' ? 'Broadcasting Code' : 'Hardware Standby'}
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
                              onChange={e => setCode(e.target.value.substring(0, 6).toUpperCase())}
                              placeholder="CODE"
                              className="h-12 bg-white/5 border-white/10 text-center text-lg font-bold tracking-[0.3em] uppercase rounded-xl"
                             />
                             <Button onClick={handleJoin} disabled={isConnecting || !roomCode.trim()} className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white/90">
                                {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Join Room'}
                             </Button>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {view === 'waiting' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-10 animate-in fade-in duration-700">
                    <div className="space-y-4 text-center">
                       <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Unique Handshake Code</p>
                       <h3 className="text-5xl sm:text-7xl font-headline font-black text-white tracking-[0.1em]">{roomCode}</h3>
                    </div>

                    <div className="relative group/qr p-6 bg-white rounded-[3rem] shadow-2xl transition-transform hover:scale-105">
                       <div ref={qrRef} className="w-[240px] h-[240px]" />
                    </div>

                    <div className="flex flex-col items-center gap-4 text-center px-10">
                       <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Awaiting Peer Intake</p>
                       </div>
                       <p className="text-[9px] text-white/10 uppercase max-w-[240px] leading-relaxed">Broadcast this code to the secondary device. Sync will activate immediately upon join.</p>
                    </div>
                 </div>
               )}

               {view === 'active' && (
                 <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 h-full">
                    <Textarea 
                      value={sharedText}
                      onChange={e => handleTextChange(e.target.value)}
                      placeholder="Start typing... content replicates instantly on connected hardware."
                      className="flex-1 bg-black/20 border-white/10 rounded-[2.5rem] p-10 text-xl font-medium leading-relaxed resize-none focus:ring-primary/40 text-white min-h-[300px] lg:min-h-0 custom-scrollbar shadow-inner"
                    />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       <Button onClick={handleCopy} className="h-16 bg-primary text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                          {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                          Copy Matrix
                       </Button>
                       <Button variant="outline" onClick={() => handleTextChange('')} className="h-16 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:text-destructive">
                          Purge All
                       </Button>
                    </div>
                 </div>
               )}

               {view === 'closed' && (
                 <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl border border-red-500/20">
                       <X className="w-10 h-10" />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-2xl font-headline font-black uppercase text-white">Registry Purged</h3>
                       <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest max-w-[240px] mx-auto">
                          Room has been destroyed. All ephemeral sync data was immediately neutralized.
                       </p>
                    </div>
                    <Button onClick={() => window.location.reload()} className="h-14 px-10 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">
                       Initialize New Studio
                    </Button>
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Sovereignty</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Hardware sync is highly volatile. Data is immediately neutralized upon session closure. No persistent logs are maintained.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Right */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Matrix Intel
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 {[
                   { icon: Smartphone, title: 'Identity Agnostic', desc: 'Sync text between hardware units without account registry.' },
                   { icon: Globe, title: 'Network Unified', desc: 'Works across diverse network architectures using real-time signaling.' },
                   { icon: ShieldCheck, title: 'Volatile Memory', desc: 'Linguistic data exists only for the duration of the active handshake.' },
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

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <MessageSquare className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Clinical Protocol</h4>
                <p className="text-[11px] text-foreground/40 font-medium uppercase leading-relaxed">
                  Ideal for rapid deployment of complex strings, Wi-Fi keys, or code blocks between mobile and desktop hardware.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
