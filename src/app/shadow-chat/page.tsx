"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Ghost, 
  Plus, 
  ArrowRight, 
  User, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Activity,
  Loader2,
  AlertCircle,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export default function ShadowChatPortal() {
  const { toast } = useToast();
  const router = useRouter();
  
  // Form State
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('shadow_chat_user');
    if (savedName) setUsername(savedName);
  }, []);

  const generateCode = () => {
    return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  };

  const handleCreate = async () => {
    if (!username.trim()) {
      toast({ variant: "destructive", title: "Identity Required", description: "Enter a username to proceed." });
      return;
    }

    setIsProcessing(true);
    const code = generateCode();
    
    try {
      const roomRef = doc(db!, 'rooms', code);
      await setDoc(roomRef, {
        code,
        createdBy: username.trim(),
        createdAt: serverTimestamp(),
        active: true
      });

      localStorage.setItem('shadow_chat_user', username.trim());
      router.push(`/shadow-chat/${code}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Matrix Error", description: "Could not initialize ephemeral node." });
      setIsProcessing(false);
    }
  };

  const handleJoin = async () => {
    const cleanCode = roomCode.trim().toUpperCase();
    if (!username.trim() || cleanCode.length < 4) {
      toast({ variant: "destructive", title: "Parameters Incomplete" });
      return;
    }

    setIsProcessing(true);
    try {
      const roomRef = doc(db!, 'rooms', cleanCode);
      const snap = await getDoc(roomRef);

      if (!snap.exists()) {
        toast({ variant: "destructive", title: "Node Null", description: "This room code does not exist or has expired." });
        setIsProcessing(false);
        return;
      }

      localStorage.setItem('shadow_chat_user', username.trim());
      router.push(`/shadow-chat/${cleanCode}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Handshake Failed" });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl min-h-screen flex flex-col items-center">
      <div className="mb-16 animate-reveal text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-6">
          <Ghost className="w-3.5 h-3.5" /> Ephemeral Sync
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-none mb-4">
          Shadow <span className="text-primary italic">Room Chat</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
          Premium zero-persistence messaging. Data exists only during active synchronicity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Create Matrix */}
        <Card className="glass-card border-border shadow-2xl p-10 sm:p-14 flex flex-col justify-between group hover:border-primary/40 transition-all rounded-[3rem]">
           <div className="space-y-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner mb-4 group-hover:scale-110 transition-transform">
                 <Plus className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-headline font-black text-white uppercase tracking-tight">Create Node</h3>
                 <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em]">Initialize a new ephemeral chat</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Your Identity</Label>
                    <Input 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      placeholder="Enter handle..."
                      className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold px-6 text-white uppercase focus:ring-primary/20"
                    />
                 </div>
              </div>
           </div>

           <Button onClick={handleCreate} disabled={isProcessing} className="mt-12 h-16 w-full bg-primary text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl shadow-primary/30">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-3" />}
              Launch Private Matrix
           </Button>
        </Card>

        {/* Join Matrix */}
        <Card className="glass-card border-border shadow-2xl p-10 sm:p-14 flex flex-col justify-between group hover:border-primary/40 transition-all rounded-[3rem] bg-black/40">
           <div className="space-y-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner mb-4 group-hover:scale-110 transition-transform">
                 <ArrowRight className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-headline font-black text-white uppercase tracking-tight">Join Node</h3>
                 <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em]">Synchronize with existing room</p>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Handshake Code</Label>
                       <Input 
                        value={roomCode} 
                        onChange={e => setRoomCode(e.target.value.toUpperCase())} 
                        placeholder="6-Char Token"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-mono text-xl font-bold px-6 text-white text-center tracking-[0.3em] focus:ring-primary/20"
                       />
                    </div>
                 </div>
              </div>
           </div>

           <Button onClick={handleJoin} disabled={isProcessing} variant="outline" className="mt-12 h-16 w-full border-white/10 bg-white/5 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5 mr-3" />}
              Sync with Code
           </Button>
        </Card>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          { icon: Activity, title: "Self-Destruct", desc: "Rooms are purged immediately after creator disconnect." },
          { icon: ShieldCheck, title: "Secure Handshake", desc: "PIN protection protocols ensure exclusive access." },
          { icon: Layers, title: "Multi-User", desc: "Collaborate with unlimited participants in a single node." }
        ].map((item, i) => (
          <div key={i} className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
             <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
             </div>
             <div className="space-y-1">
                <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">{item.title}</h4>
                <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">{item.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
