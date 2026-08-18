
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Download, 
  Info,
  CheckCircle2,
  User,
  Users,
  Layers,
  Zap,
  Play,
  Settings2,
  X,
  History,
  Copy,
  UserPlus,
  ClipboardType,
  Maximize,
  ShieldCheck,
  Dices,
  Crown,
  Smartphone,
  Share2,
  AlertCircle,
  Activity,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Types ---
interface Participant {
  id: string;
  name: string;
  token?: string;
}

interface WinnerHistory {
  id: string;
  name: string;
  token?: string;
  timestamp: number;
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
];

export default function LuckyDrawPage() {
  const { toast } = useToast();
  
  // Participant State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState('');
  const [newToken, setNewToken] = useState('');
  const [bulkInput, setBulkData] = useState('');
  
  // Settings
  const [autoRemove, setAutoRemove] = useState(false);
  const [winners, setWinners] = useState<WinnerHistory[]>([]);
  
  // Wheel Animation State
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const spinRequestRef = useRef<number | null>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    const savedNames = localStorage.getItem('mykit_luckydraw_names');
    const savedWinners = localStorage.getItem('mykit_luckydraw_winners');
    if (savedNames) try { setParticipants(JSON.parse(savedNames)); } catch(e) {}
    if (savedWinners) try { setWinners(JSON.parse(savedWinners)); } catch(e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('mykit_luckydraw_names', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('mykit_luckydraw_winners', JSON.stringify(winners));
  }, [winners]);

  // --- Core Rendering Engine ---
  const drawWheel = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    
    ctx.clearRect(0, 0, size, size);

    if (participants.length === 0) {
      // Standby Visual
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      return;
    }

    const sliceAngle = (Math.PI * 2) / participants.length;
    
    participants.forEach((p, i) => {
      const startAngle = rotationRef.current + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw Slice
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw Name Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `black ${Math.max(10, Math.min(24, 400 / participants.length))}px Inter, sans-serif`;
      ctx.fillText(p.name.substring(0, 15), radius - 30, 0);
      ctx.restore();
    });

    // Outer Rim
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 10;
    ctx.setLineDash([]);
    ctx.stroke();

    // Center Hub
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0c';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [participants, rotationRef.current]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // --- Logic Matrix ---
  const addParticipant = () => {
    if (!newName.trim()) return;
    const newItem = { id: Math.random().toString(36).substr(2, 9), name: newName.trim(), token: newToken.trim() };
    setParticipants(prev => [...prev, newItem]);
    setNewName('');
    setNewToken('');
    toast({ title: "Signal Added", description: `"${newItem.name}" registered.` });
  };

  const addBulk = () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;
    const newItems = lines.map(line => {
      const parts = line.split(',');
      return { 
        id: Math.random().toString(36).substr(2, 9), 
        name: parts[0].trim(), 
        token: parts[1]?.trim() 
      };
    });
    setParticipants(prev => [...prev, ...newItems]);
    setBulkData('');
    toast({ title: "Bulk Matrix Injected", description: `Added ${newItems.length} participants.` });
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const spin = () => {
    if (isSpinning || participants.length < 2) return;
    
    setIsSpinning(true);
    setCurrentWinner(null);
    setShowWinnerPopup(false);

    const spinDuration = 3000 + Math.random() * 2000;
    const startRotation = rotationRef.current;
    const extraSpins = 5 + Math.random() * 5;
    const targetRotation = startRotation + (extraSpins * Math.PI * 2) + Math.random() * Math.PI * 2;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Quartic Ease Out
      const ease = 1 - Math.pow(1 - progress, 4);
      rotationRef.current = startRotation + (targetRotation - startRotation) * ease;
      
      drawWheel();

      if (progress < 1) {
        spinRequestRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        finalizeWinner();
      }
    };

    spinRequestRef.current = requestAnimationFrame(animate);
  };

  const finalizeWinner = () => {
    const sliceAngle = (Math.PI * 2) / participants.length;
    // Normalized rotation (0 to 2PI)
    let finalRotation = rotationRef.current % (Math.PI * 2);
    if (finalRotation < 0) finalRotation += Math.PI * 2;

    // The pointer is at 0 rad (right side). 
    // We need to calculate which slice is passing 0.
    const normalizedAngle = (Math.PI * 2 - finalRotation) % (Math.PI * 2);
    const winnerIndex = Math.floor(normalizedAngle / sliceAngle);
    
    const winner = participants[winnerIndex];
    setCurrentWinner(winner);
    setShowWinnerPopup(true);

    const historyEntry: WinnerHistory = {
      id: Math.random().toString(36).substr(2, 9),
      name: winner.name,
      token: winner.token,
      timestamp: Date.now()
    };
    setWinners(prev => [historyEntry, ...prev].slice(0, 10));

    if (autoRemove) {
      setParticipants(prev => prev.filter(p => p.id !== winner.id));
    }
    
    toast({ title: "Winner Identified", description: `Congratulations, ${winner.name}!` });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Identity Copied" });
  };

  const clearHistory = () => {
    setWinners([]);
    localStorage.removeItem('mykit_luckydraw_winners');
  };

  const handleClear = () => {
    setParticipants([]);
    toast({ title: "Purged", description: "Participant matrix cleared." });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Dices className="w-3.5 h-3.5" /> Randomization Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Lucky Draw <span className="text-primary italic">& Spin Wheel</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Professional random selection studio. Execute fair drawings locally with high-fidelity visual feedback and clinical history logging.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="lucky-draw" />
              {participants.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge Matrix
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <UserPlus className="w-5 h-5 text-primary" /> Participant Intake
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Identity (Name)</Label>
                          <Input 
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addParticipant()}
                            placeholder="Enter name..."
                            className="h-14 bg-secondary border-border rounded-2xl font-bold"
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Token (Optional)</Label>
                          <Input 
                            value={newToken}
                            onChange={e => setNewToken(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addParticipant()}
                            placeholder="ID / Ticket"
                            className="h-14 bg-secondary border-border rounded-2xl font-mono text-xs"
                          />
                       </div>
                    </div>
                    <Button onClick={addParticipant} disabled={!newName.trim()} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl">
                       Register Participant
                    </Button>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Bulk Protocol (One per line)</Label>
                    <Textarea 
                      value={bulkInput}
                      onChange={e => setBulkData(e.target.value)}
                      placeholder="Name, Token&#10;Name 2&#10;Name 3, #554"
                      className="h-32 bg-secondary/50 border-border rounded-2xl text-xs font-medium resize-none focus:ring-primary/40 p-4"
                    />
                    <Button onClick={addBulk} variant="outline" className="w-full h-12 rounded-xl border-border bg-white/5 text-[9px] font-black uppercase tracking-widest">
                       <Layers className="w-4 h-4 mr-2" /> Inject Bulk Matrix
                    </Button>
                 </div>
              </CardContent>
           </Card>

           {/* Active List */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Registered Population</CardTitle>
                 </div>
                 <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase">
                    {participants.length} Active
                 </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {participants.length === 0 ? (
                    <div className="py-16 text-center opacity-10 space-y-4">
                       <User className="w-10 h-10 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Zero Registry Hits</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {participants.map((p) => (
                         <div key={p.id} className="p-4 flex items-center justify-between group/item hover:bg-secondary/30 transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                               <div className="w-8 h-8 rounded-lg bg-secondary border border-white/5 flex items-center justify-center text-foreground/40 group-hover/item:text-primary transition-colors shrink-0">
                                  <User className="w-4 h-4" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-foreground truncate uppercase">{p.name}</p>
                                  {p.token && <p className="text-[8px] font-mono text-foreground/20 uppercase tracking-tighter">Token: {p.token}</p>}
                               </div>
                            </div>
                            <button onClick={() => removeParticipant(p.id)} className="text-foreground/10 hover:text-destructive transition-colors px-2">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Wheel Column */}
        <div className="lg:col-span-7 xl:col-span-4 space-y-8">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/60 group/wheel">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" /> LIVE ROTATION MONITOR
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                 {/* The Spinner Pointer */}
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <div className="w-8 h-10 bg-primary shadow-xl shadow-primary/20 relative" style={{ clipPath: 'polygon(100% 50%, 0 0, 0 100%)' }}>
                       <div className="absolute inset-1 bg-white opacity-20" style={{ clipPath: 'inherit' }} />
                    </div>
                 </div>

                 <div className={cn(
                   "relative w-full max-w-[320px] aspect-square rounded-full transition-transform duration-100",
                   isSpinning ? "cursor-wait" : "cursor-default"
                 )}>
                    <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full opacity-20 animate-pulse" />
                    <canvas 
                      ref={canvasRef} 
                      width={800} 
                      height={800} 
                      className="w-full h-full drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                    />
                 </div>

                 <div className="mt-12 w-full max-w-xs space-y-6">
                    <Button 
                      onClick={spin}
                      disabled={isSpinning || participants.length < 2}
                      className="h-20 w-full bg-primary text-white font-black text-2xl uppercase tracking-widest rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group/btn"
                    >
                       {isSpinning ? <Loader2 className="w-10 h-10 animate-spin" /> : <RefreshCcw className="w-10 h-10 group-hover/btn:rotate-180 transition-transform duration-700" />}
                    </Button>
                    {participants.length < 2 && (
                       <p className="text-[10px] font-black uppercase text-center text-foreground/20 tracking-widest flex items-center justify-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5" /> Need 2+ Participants
                       </p>
                    )}
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware-Native Fairness</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Randomization occurs via the cryptographically-secure Web Crypto API seed. Results are generated locally with zero cloud bias.
               </p>
             </div>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Control Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 <div className="flex items-center justify-between p-6 rounded-[2rem] bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                    <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase text-foreground/60 tracking-widest">Auto-Purge Protocol</p>
                       <p className="text-[9px] text-foreground/20 font-bold uppercase">Remove winner from next spin</p>
                    </div>
                    <Switch checked={autoRemove} onCheckedChange={setAutoRemove} />
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-2xl flex flex-col min-h-[400px]">
              <CardHeader className="py-6 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Winner Archive</CardTitle>
                 </div>
                 <button onClick={clearHistory} className="text-[8px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors">Purge History</button>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden flex-1">
                 <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {winners.length === 0 ? (
                      <div className="py-32 text-center opacity-10 space-y-4">
                         <Crown className="w-12 h-12 mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No Masters Identified</p>
                      </div>
                    ) : (
                      winners.map((w) => (
                        <div key={w.id} className="p-6 flex items-center justify-between group/win hover:bg-primary/5 transition-all">
                           <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                                 <Trophy className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-xs font-black text-foreground uppercase truncate pr-4">{w.name}</p>
                                 <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{new Date(w.timestamp).toLocaleTimeString()}</p>
                              </div>
                           </div>
                           <button onClick={() => handleCopy(w.name)} className="text-foreground/10 hover:text-primary transition-colors">
                              <Copy className="w-4 h-4" />
                           </button>
                        </div>
                      ))
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Winner Overlay Modal */}
      {showWinnerPopup && currentWinner && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="w-full max-w-lg space-y-12 text-center animate-in zoom-in-95 duration-500 delay-200">
              <div className="relative inline-block">
                 <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                 <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[3rem] bg-primary flex items-center justify-center text-white shadow-[0_0_80px_-10px_rgba(59,130,246,0.6)] border-4 border-white/10 mx-auto">
                    <Trophy className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-2xl" />
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase text-primary tracking-[0.6em] animate-reveal">Identified Winner</p>
                 <h2 className="text-5xl sm:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-none break-all px-4">
                   {currentWinner.name}
                 </h2>
                 {currentWinner.token && (
                    <div className="inline-flex px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono text-lg font-bold tracking-widest">
                       {currentWinner.token}
                    </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                 <Button onClick={() => handleCopy(currentWinner.name)} className="h-16 px-10 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl">
                    Copy Identity
                 </Button>
                 <Button variant="outline" onClick={() => setShowWinnerPopup(false)} className="h-16 px-10 border-white/10 bg-white/5 text-white font-black rounded-2xl text-xs uppercase tracking-widest">
                    Continue Studio
                 </Button>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
