
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
  Loader2,
  Filter,
  Undo2,
  Target,
  FileDown,
  FileUp,
  Volume2,
  VolumeX,
  FastForward,
  Timer,
  ChevronRight,
  ChevronLeft,
  Search,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Types ---
interface Participant {
  id: string;
  name: string;
  token?: string;
  weight: number;
  group?: string;
}

interface WinnerHistory {
  id: string;
  name: string;
  token?: string;
  group?: string;
  timestamp: number;
}

type DrawMode = 'wheel' | 'slot' | 'shuffle';
type SpinSpeed = 'slow' | 'normal' | 'fast';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
];

export default function LuckyDrawPage() {
  const { toast } = useToast();
  
  // Roster State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState('');
  const [newToken, setNewToken] = useState('');
  const [newWeight, setNewWeight] = useState(1);
  const [newGroup, setNewGroup] = useState('');
  const [bulkInput, setBulkData] = useState('');
  
  // Settings
  const [mode, setMode] = useState<DrawMode>('wheel');
  const [speed, setSpeed] = useState<SpinSpeed>('normal');
  const [winnersCount, setWinnersCount] = useState(1);
  const [autoRemove, setAutoRemove] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterGroup, setFilterGroup] = useState('all');
  
  // Runtime State
  const [winners, setWinners] = useState<WinnerHistory[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinnersBatch, setCurrentWinnersBatch] = useState<Participant[]>([]);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [slotIndex, setSlotIndex] = useState(0);
  const [shuffleView, setShuffleView] = useState<Participant[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const spinRequestRef = useRef<number | null>(null);

  // --- Filtered List ---
  const activeParticipants = useMemo(() => {
    if (filterGroup === 'all') return participants;
    return participants.filter(p => p.group === filterGroup);
  }, [participants, filterGroup]);

  const totalWeight = useMemo(() => {
    return activeParticipants.reduce((acc, p) => acc + p.weight, 0);
  }, [activeParticipants]);

  const availableGroups = useMemo(() => {
    const groups = new Set(participants.map(p => p.group).filter(Boolean));
    return Array.from(groups) as string[];
  }, [participants]);

  // --- Persistence Matrix ---
  useEffect(() => {
    const savedNames = localStorage.getItem('mykit_luckydraw_roster_v2');
    const savedWinners = localStorage.getItem('mykit_luckydraw_archive_v2');
    if (savedNames) try { setParticipants(JSON.parse(savedNames)); } catch(e) {}
    if (savedWinners) try { setWinners(JSON.parse(savedWinners)); } catch(e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('mykit_luckydraw_roster_v2', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('mykit_luckydraw_archive_v2', JSON.stringify(winners));
  }, [winners]);

  // --- Audio Synthesis ---
  const playSound = (type: 'tick' | 'win') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.5); // C5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      }
      
      osc.start();
      osc.stop(ctx.currentTime + (type === 'tick' ? 0.1 : 0.5));
    } catch(e) {}
  };

  // --- Core Rendering Engine ---
  const drawWheel = useCallback(() => {
    if (!canvasRef.current || mode !== 'wheel') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    
    ctx.clearRect(0, 0, size, size);

    if (activeParticipants.length === 0) {
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      return;
    }

    let startAngle = rotationRef.current;
    
    activeParticipants.forEach((p, i) => {
      const sliceAngle = (p.weight / (totalWeight || 1)) * (Math.PI * 2);
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

      // Draw Name Text - Adaptive Scaling
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      
      const numEntries = activeParticipants.length;
      let baseSize = 750 / numEntries; 
      if (numEntries < 8) baseSize = 48; 
      const fontSize = Math.max(12, Math.min(baseSize, 56));
      
      ctx.font = `black ${fontSize}px Inter, sans-serif`;
      
      // High Contrast Text Protocol
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      
      // Truncation Matrix to prevent overlap
      const charLimit = numEntries < 10 ? 20 : 16;
      const displayName = p.name.length > charLimit ? p.name.substring(0, charLimit - 2) + '...' : p.name;
      
      ctx.fillText(displayName.toUpperCase(), radius - 60, fontSize / 3);
      ctx.restore();

      startAngle = endAngle;
    });

    // Hub
    ctx.beginPath();
    ctx.arc(center, center, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0c';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.stroke();
  }, [activeParticipants, totalWeight, mode]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // --- Draw Execution Matrix ---

  const selectWeightedWinner = (pool: Participant[]) => {
    const poolWeight = pool.reduce((acc, p) => acc + p.weight, 0);
    let random = Math.random() * poolWeight;
    for (const p of pool) {
      if (random < p.weight) return p;
      random -= p.weight;
    }
    return pool[pool.length - 1];
  };

  const startDraw = () => {
    if (isSpinning || activeParticipants.length < 2) return;
    
    setIsSpinning(true);
    setCurrentWinnersBatch([]);
    setShowWinnerPopup(false);

    if (mode === 'wheel') {
      executeWheelSpin();
    } else if (mode === 'slot') {
      executeSlotSpin();
    } else {
      executeShuffle();
    }
  };

  const executeWheelSpin = () => {
    const durationMap = { slow: 6000, normal: 4000, fast: 2500 };
    const spinDuration = durationMap[speed];
    const startRotation = rotationRef.current;
    const extraSpins = 8 + Math.random() * 5;
    const targetRotation = startRotation + (extraSpins * Math.PI * 2) + Math.random() * Math.PI * 2;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      rotationRef.current = startRotation + (targetRotation - startRotation) * ease;
      drawWheel();
      if (progress < 1) {
        spinRequestRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        finalizeWinners();
      }
    };
    spinRequestRef.current = requestAnimationFrame(animate);
  };

  const executeSlotSpin = () => {
    const spinDuration = 3000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      setSlotIndex(Math.floor(Math.random() * activeParticipants.length));
      if (progress < 1) {
        spinRequestRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        finalizeWinners();
      }
    };
    spinRequestRef.current = requestAnimationFrame(animate);
  };

  const executeShuffle = () => {
    const duration = 2000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < duration) {
        setShuffleView([...activeParticipants].sort(() => Math.random() - 0.5));
        spinRequestRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        finalizeWinners();
      }
    };
    spinRequestRef.current = requestAnimationFrame(animate);
  };

  const finalizeWinners = () => {
    let pool = [...activeParticipants];
    const count = Math.min(winnersCount, pool.length);
    const selected: Participant[] = [];

    for (let i = 0; i < count; i++) {
      const winner = selectWeightedWinner(pool);
      selected.push(winner);
      pool = pool.filter(p => p.id !== winner.id);
    }

    setCurrentWinnersBatch(selected);
    setShowWinnerPopup(true);
    playSound('win');

    const historyEntries: WinnerHistory[] = selected.map(w => ({
      id: Math.random().toString(36).substr(2, 9),
      name: w.name,
      token: w.token,
      group: w.group,
      timestamp: Date.now()
    }));

    setWinners(prev => [...historyEntries, ...prev].slice(0, 50));

    if (autoRemove) {
      setParticipants(prev => prev.filter(p => !selected.some(w => w.id === p.id)));
    }
  };

  // --- Management Actions ---

  const addParticipant = () => {
    if (!newName.trim()) return;
    const newItem: Participant = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: newName.trim(), 
      token: newToken.trim(),
      weight: newWeight,
      group: newGroup.trim() || undefined
    };
    setParticipants(prev => [...prev, newItem]);
    setNewName(''); setNewToken(''); setNewWeight(1);
    toast({ title: "Signal Added", description: `"${newItem.name}" registered.` });
  };

  const addBulk = () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newItems: Participant[] = lines.map(line => {
      const parts = line.split(',');
      return { 
        id: Math.random().toString(36).substr(2, 9), 
        name: parts[0].trim(), 
        token: parts[1]?.trim(),
        weight: parseInt(parts[2]) || 1,
        group: parts[3]?.trim()
      };
    });
    setParticipants(prev => [...prev, ...newItems]);
    setBulkData('');
    toast({ title: "Batch Injected", description: `Added ${newItems.length} participants.` });
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    toast({ title: "Identity Purged" });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied", description: "Identity saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const exportRoster = () => {
    const content = participants.map(p => `${p.name},${p.token || ''},${p.weight},${p.group || ''}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster_${Date.now()}.txt`;
    a.click();
  };

  const undoLastWinner = () => {
    if (winners.length === 0) return;
    const last = winners[0];
    const restored: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name: last.name,
      token: last.token,
      group: last.group,
      weight: 1
    };
    setParticipants(prev => [...prev, restored]);
    setWinners(prev => prev.slice(1));
    toast({ title: "Winner Restored", description: "Identity returned to pool." });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Trophy className="w-3.5 h-3.5" /> Randomization Matrix v2.0
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Lucky Draw <span className="text-primary italic">Pro Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional high-fidelity selection engine. Execute fair weighted drawings, manage clinical rosters, and archive winners locally with zero cloud persistence.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="lucky-draw" />
           <Button variant="outline" onClick={() => setParticipants([])} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge Roster
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Management */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden">
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <UserPlus className="w-5 h-5 text-primary" /> Identity Intake
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase">Name</Label>
                          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Entry Name" className="h-12 bg-secondary/50 border-border rounded-xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase">Token</Label>
                          <Input value={newToken} onChange={e => setNewToken(e.target.value)} placeholder="ID/Ticket" className="h-12 bg-secondary/50 border-border rounded-xl font-mono text-xs" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase">Weight</Label>
                          <Select value={newWeight.toString()} onValueChange={v => setNewWeight(parseInt(v))}>
                             <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="glass-card">
                                {[1, 2, 3, 5, 10].map(w => (
                                  <SelectItem key={w} value={w.toString()} className="text-xs font-black uppercase">{w}X Chance</SelectItem>
                                ))}
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase">Group</Label>
                          <Input value={newGroup} onChange={e => setNewGroup(e.target.value)} placeholder="e.g. A" className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-xs" />
                       </div>
                    </div>
                    <Button onClick={addParticipant} disabled={!newName.trim()} className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg">
                       Add to Pool
                    </Button>
                 </div>

                 <div className="pt-8 border-t border-white/5 space-y-4">
                    <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Bulk Protocol</Label>
                    <Textarea 
                      value={bulkInput} onChange={e => setBulkData(e.target.value)} 
                      placeholder="Name,Token,Weight,Group..."
                      className="h-32 bg-secondary/30 border-border rounded-2xl text-[10px] font-medium resize-none focus:ring-primary/20 p-4"
                    />
                    <div className="grid grid-cols-2 gap-3">
                       <Button onClick={addBulk} variant="outline" className="h-11 bg-white/5 border-white/5 text-[9px] font-black uppercase rounded-xl">
                          <Layers className="w-4 h-4 mr-2" /> Inject Bulk
                       </Button>
                       <Button onClick={exportRoster} variant="outline" className="h-11 bg-white/5 border-white/5 text-[9px] font-black uppercase rounded-xl">
                          <Download className="w-4 h-4 mr-2" /> Export
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[500px]">
              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Registry Pool</CardTitle>
                 </div>
                 {availableGroups.length > 0 && (
                   <Select value={filterGroup} onValueChange={setFilterGroup}>
                      <SelectTrigger className="h-8 w-24 bg-background/50 border-border text-[8px] font-black uppercase rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                         <SelectItem value="all" className="text-[8px] font-black uppercase">All Groups</SelectItem>
                         {availableGroups.map(g => (
                           <SelectItem key={g} value={g} className="text-[8px] font-black uppercase">Group {g}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {activeParticipants.length === 0 ? (
                   <div className="py-20 text-center opacity-10 space-y-4">
                      <Target className="w-10 h-10 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix Entries</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-white/5">
                      {activeParticipants.map(p => {
                        const winPct = ((p.weight / (totalWeight || 1)) * 100).toFixed(1);
                        return (
                          <div key={p.id} className="p-4 flex items-center justify-between group/row hover:bg-white/5 transition-all">
                             <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-secondary border border-white/5 flex items-center justify-center text-foreground/20 group-hover/row:text-primary transition-colors shrink-0">
                                   <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[11px] font-bold text-foreground truncate uppercase">{p.name}</p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      {p.group && <span className="text-[7px] font-black uppercase bg-primary/10 text-primary px-1 rounded-sm leading-none py-0.5">Grp: {p.group}</span>}
                                      <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter">Prob: {winPct}%</span>
                                   </div>
                                </div>
                             </div>
                             <button onClick={() => removeParticipant(p.id)} className="text-foreground/10 hover:text-red-500 transition-colors px-2">
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        );
                      })}
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Studio Column */}
        <div className="lg:col-span-8 xl:col-span-5 space-y-8">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-[#060608]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-4 border-b border-white/5 bg-white/2 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Studio Master Monitor</CardTitle>
                 </div>
                 <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                    {(['wheel', 'slot', 'shuffle'] as const).map(m => (
                      <button key={m} onClick={() => setMode(m)} className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", mode === m ? "bg-primary text-white" : "text-white/20 hover:text-white")}>{m}</button>
                    ))}
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                 {/* Visual Matrix Container */}
                 <div className="w-full max-w-[400px] aspect-square relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                    
                    {mode === 'wheel' && (
                      <div className="relative w-full h-full flex items-center justify-center group/wheel">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none translate-x-4">
                            <div className="w-8 h-10 bg-primary shadow-xl relative" style={{ clipPath: 'polygon(100% 50%, 0 0, 0 100%)' }}>
                               <div className="absolute inset-1 bg-white opacity-20" style={{ clipPath: 'inherit' }} />
                            </div>
                         </div>
                         <canvas ref={canvasRef} width={1000} height={1000} className="w-full h-full drop-shadow-[0_0_60px_rgba(0,0,0,0.8)]" />
                      </div>
                    )}

                    {mode === 'slot' && (
                      <div className="w-full h-64 bg-black/40 rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden flex items-center justify-center relative group/slot">
                         <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-20 pointer-events-none" />
                         <div className="absolute inset-y-0 left-0 w-[1px] bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-30" />
                         <div className="absolute inset-y-0 right-0 w-[1px] bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-30" />
                         
                         <div className="text-center space-y-2 animate-in zoom-in duration-300 relative z-10 px-8">
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Linguistic Slot</p>
                            <h3 className={cn(
                              "text-4xl sm:text-5xl font-headline font-black text-white uppercase tracking-tighter truncate max-w-full",
                              isSpinning && "blur-sm animate-pulse"
                            )}>
                               {activeParticipants[slotIndex]?.name || '---'}
                            </h3>
                         </div>
                      </div>
                    )}

                    {mode === 'shuffle' && (
                       <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                          <div className={cn("grid grid-cols-2 gap-4 w-full p-4 transition-all duration-300", isSpinning ? "blur-md scale-95 opacity-50" : "opacity-100")}>
                             {(isSpinning ? shuffleView : activeParticipants).slice(0, 4).map((p, i) => (
                               <div key={p.id} className="aspect-[4/3] bg-secondary/50 rounded-2xl border border-white/5 flex items-center justify-center p-4">
                                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center truncate">{p.name}</span>
                               </div>
                             ))}
                          </div>
                          {isSpinning && (
                            <div className="absolute inset-0 flex items-center justify-center">
                               <RefreshCcw className="w-20 h-20 text-primary animate-spin opacity-40" />
                            </div>
                          )}
                       </div>
                    )}
                 </div>

                 {/* Execution Cluster */}
                 <div className="mt-12 w-full max-w-sm space-y-6">
                    <Button 
                      onClick={startDraw}
                      disabled={isSpinning || activeParticipants.length < 2}
                      className="h-20 w-full bg-primary text-white font-black text-3xl uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-primary/40 active:scale-95 transition-all group/btn"
                    >
                       {isSpinning ? <Loader2 className="w-12 h-12 animate-spin" /> : <Play className="w-12 h-12 fill-current group-hover/btn:scale-110 transition-transform" />}
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col justify-center gap-1 group hover:border-primary/20 transition-all">
                          <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Active Entropy</span>
                          <span className="text-[10px] font-black text-primary uppercase">Fidelity: 100%</span>
                       </div>
                       <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col justify-center gap-1 group hover:border-primary/20 transition-all">
                          <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Weighting</span>
                          <span className="text-[10px] font-black text-white uppercase">{totalWeight} Bit Sum</span>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Zero server logic. Roster data and drawing sessions are volatile and held strictly in local device memory.
                  </p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                   <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Hardware Timing</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Animation frame-rates are synchronized to your hardware refresh rate for jitter-free visual performance.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: History & Settings */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Global Config
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                 <div className="space-y-4">
                    <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">Batch Winners</Label>
                    <div className="grid grid-cols-4 gap-2">
                       {[1, 3, 5, 10].map(c => (
                         <button key={c} onClick={() => setWinnersCount(c)} className={cn("h-10 rounded-xl border text-[9px] font-black transition-all", winnersCount === c ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>{c}</button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">Tempo Velocity</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['slow', 'normal', 'fast'] as const).map(s => (
                         <button key={s} onClick={() => setSpeed(s)} className={cn("h-10 rounded-xl border text-[8px] font-black uppercase transition-all", speed === s ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>{s}</button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4 space-y-4 border-t border-white/5">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                       <span className="text-[9px] font-black uppercase text-foreground/40">Auto Purge</span>
                       <Switch checked={autoRemove} onCheckedChange={setAutoRemove} className="scale-75" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-3">
                          {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-foreground/20" />}
                          <span className="text-[9px] font-black uppercase text-foreground/40">Sound FX</span>
                       </div>
                       <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} className="scale-75" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-2xl flex flex-col min-h-[400px]">
              <CardHeader className="py-6 border-b border-white/5 bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive Log</CardTitle>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={undoLastWinner} className="p-2 text-foreground/20 hover:text-primary transition-colors"><Undo2 className="w-4 h-4" /></button>
                    <button onClick={() => setWinners([])} className="p-2 text-foreground/20 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                 </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {winners.length === 0 ? (
                    <div className="py-32 text-center opacity-10 space-y-4">
                       <Crown className="w-12 h-12 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Masters Recorded</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {winners.map(w => (
                         <div key={w.id} className="p-5 flex items-center justify-between group/win hover:bg-primary/5 transition-all">
                            <div className="flex items-center gap-4 min-w-0">
                               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                                  <Trophy className="w-5 h-5" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-foreground truncate uppercase">{w.name}</p>
                                  <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{new Date(w.timestamp).toLocaleTimeString()}</p>
                               </div>
                            </div>
                            <button onClick={() => handleCopy(w.name, w.id)} className="text-foreground/10 hover:text-primary transition-colors px-2">
                               <Copy className="w-3.5 h-3.5" />
                            </button>
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Winner Overlay Modal */}
      {showWinnerPopup && currentWinnersBatch.length > 0 && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="w-full max-w-2xl space-y-12 text-center animate-in zoom-in-95 duration-500">
              <div className="relative inline-block">
                 <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                 <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[3rem] bg-primary flex items-center justify-center text-white shadow-[0_0_80px_-10px_rgba(59,130,246,0.6)] border-4 border-white/10 mx-auto">
                    <Trophy className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-2xl" />
                 </div>
              </div>

              <div className="space-y-10">
                 <p className="text-[11px] font-black uppercase text-primary tracking-[0.6em] animate-reveal">Signal Identified: Winner Matrix</p>
                 
                 <div className="flex flex-wrap justify-center gap-6">
                    {currentWinnersBatch.map(w => (
                      <div key={w.id} className="p-8 sm:p-12 rounded-[3.5rem] bg-white dark:bg-white/5 border border-primary/20 shadow-2xl animate-in slide-in-from-bottom-6 min-w-[280px]">
                         <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none break-all">
                           {w.name}
                         </h2>
                         {w.token && (
                            <div className="mt-6 inline-flex px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-lg font-bold tracking-widest uppercase">
                               {w.token}
                            </div>
                         )}
                         {w.group && <p className="mt-4 text-[9px] font-black text-foreground/20 uppercase tracking-widest">Registry Group {w.group}</p>}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-10">
                 <Button onClick={() => setShowWinnerPopup(false)} className="h-16 px-12 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    Dismiss Protocol
                 </Button>
                 <Button variant="outline" onClick={() => { handleCopy(currentWinnersBatch.map(w => w.name).join(', '), 'batch'); }} className="h-16 px-12 border-white/10 bg-white/5 text-white font-black rounded-2xl text-xs uppercase tracking-widest">
                    Copy Results
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
