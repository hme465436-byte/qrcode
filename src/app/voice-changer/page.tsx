"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Settings2, 
  Info,
  CheckCircle2,
  AlertCircle,
  Activity,
  Volume2,
  ShieldCheck,
  Zap,
  Smartphone,
  Monitor,
  Video,
  Pause,
  ArrowRight,
  Loader2,
  Ghost,
  Radio,
  Play,
  Square,
  VolumeX,
  User,
  Music,
  UserCircle,
  Skull,
  Bot,
  Smile,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type EffectId = 'normal' | 'robot' | 'male' | 'female' | 'child' | 'deep' | 'helium';

interface Effect {
  id: EffectId;
  label: string;
  icon: any;
  desc: string;
}

const EFFECTS: Effect[] = [
  { id: 'normal', label: 'Normal', icon: User, desc: 'Original signal bypassed' },
  { id: 'robot', label: 'Robot', icon: Bot, desc: 'Metallic ring modulation' },
  { id: 'deep', label: 'Deep', icon: Activity, desc: 'Low-frequency shift' },
  { id: 'helium', label: 'Helium', icon: Zap, desc: 'High-frequency shift' },
  { id: 'male', label: 'Male', icon: UserCircle, desc: 'Masculine formant shift' },
  { id: 'female', label: 'Female', icon: User, desc: 'Feminine formant shift' },
  { id: 'child', label: 'Child', icon: Smile, desc: 'Vocal tract reduction' },
];

export default function VoiceChangerPage() {
  const { toast } = useToast();
  
  // State Matrix
  const [isActive, setIsActive] = useState(false);
  const [activeEffect, setActiveEffect] = useState<EffectId>('normal');
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio Graph Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const modGainRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Clean Audio Graph
  const stopStudio = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsActive(false);
    setAudioLevel(0);
  }, []);

  const startStudio = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // 1. Analyzer Node
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;

      // 2. Gain Node (Volume)
      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainNodeRef.current = gain;

      // 3. Filter Node
      const filter = ctx.createBiquadFilter();
      filterNodeRef.current = filter;

      // Connect standard chain
      source.connect(filter);
      filter.connect(gain);
      gain.connect(analyzer);
      gain.connect(ctx.destination);

      setIsActive(true);
      toast({ title: "Hardware Synchronized", description: "Linguistic stream initialized." });

      // Meter Loop
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateMeter = () => {
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for(let i=0; i<bufferLength; i++) sum += dataArray[i];
        setAudioLevel(Math.min(100, Math.round((sum / bufferLength / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

    } catch (err: any) {
      setError("Mic Access Denied: Please enable microphone permissions in your hardware protocol.");
      toast({ variant: "destructive", title: "Handshake Failed" });
    }
  };

  // Update DSP Chain based on Effect
  useEffect(() => {
    if (!isActive || !audioCtxRef.current || !filterNodeRef.current || !sourceNodeRef.current) return;
    
    const ctx = audioCtxRef.current;
    const filter = filterNodeRef.current;
    const source = sourceNodeRef.current;
    const gain = gainNodeRef.current!;

    // Reset components
    if (oscillatorRef.current) { oscillatorRef.current.stop(); oscillatorRef.current = null; }
    if (modGainRef.current) { modGainRef.current.disconnect(); modGainRef.current = null; }
    filter.type = 'allpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;
    source.disconnect();
    source.connect(filter);

    switch (activeEffect) {
      case 'robot':
        // Ring Modulation Protocol
        const osc = ctx.createOscillator();
        const mGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 50;
        mGain.gain.value = 1.0;
        
        source.disconnect();
        const robotGain = ctx.createGain();
        source.connect(robotGain);
        osc.connect(mGain.gain);
        robotGain.connect(filter);
        
        osc.start();
        oscillatorRef.current = osc;
        modGainRef.current = mGain;
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        break;

      case 'deep':
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        break;

      case 'helium':
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        break;
      
      case 'child':
        filter.type = 'peaking';
        filter.frequency.value = 3000;
        filter.gain.value = 10;
        break;

      case 'male':
        filter.type = 'peaking';
        filter.frequency.value = 500;
        filter.gain.value = 10;
        break;

      case 'female':
        filter.type = 'peaking';
        filter.frequency.value = 4000;
        filter.gain.value = 10;
        break;
    }

  }, [activeEffect, isActive]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopStudio();
  }, [stopStudio]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Activity className="w-3.5 h-3.5" /> Hardware Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Voice <span className="text-primary italic">Changer Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Advanced live acoustic modulation. Transform your vocal signature using high-fidelity DSP filters and real-time frequency synthesis.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="voice-changer" />
              {isActive && (
                <Button variant="outline" size="sm" onClick={stopStudio} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <RotateCcw className="w-3.5 h-3.5 mr-2" /> Abort
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Settings2 className="w-5 h-5 text-primary" /> Modulation Matrix
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
               {!isActive ? (
                 <div className="py-20 text-center flex flex-col items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-center text-foreground/10 shadow-inner group-hover:scale-110 transition-transform">
                       <MicOff className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-lg font-headline font-black text-foreground uppercase tracking-tight">Identity Offline</h3>
                       <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Initialize a secure hardware handshake to start live modulation.</p>
                    </div>
                    <Button onClick={startStudio} className="h-16 w-full max-w-sm bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                       Initialize Handshake
                    </Button>
                 </div>
               ) : (
                 <div className="space-y-10 animate-in zoom-in duration-500">
                    <div className="space-y-6">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Effect Protocol</Label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {EFFECTS.map(eff => (
                            <button
                              key={eff.id}
                              onClick={() => setActiveEffect(eff.id)}
                              className={cn(
                                "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all group/eff",
                                activeEffect === eff.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/30 border-border text-foreground/40 hover:text-primary hover:border-primary/20"
                              )}
                            >
                               <eff.icon className={cn("w-5 h-5 group-hover/eff:scale-110 transition-transform", activeEffect === eff.id ? "text-white" : "text-primary/40")} />
                               <span className="text-[9px] font-black uppercase tracking-widest">{eff.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-8 pt-4 border-t border-white/5">
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-foreground/30 tracking-widest">
                             <Label className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /> Output Gain</Label>
                             <span className="text-primary font-mono">{(volume * 100).toFixed(0)}%</span>
                          </div>
                          <Slider value={[volume * 100]} min={0} max={100} step={1} onValueChange={v => setVolume(v[0] / 100)} />
                       </div>
                    </div>

                    <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex flex-col gap-6">
                       <div className="flex items-center gap-4">
                          <ShieldCheck className="w-10 h-10 text-primary/40 shrink-0" />
                          <div className="space-y-1">
                             <p className="text-[11px] font-black uppercase text-foreground leading-none">Acoustic Advisory</p>
                             <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Use headphones to prevent feedback loop noise</p>
                          </div>
                       </div>
                    </div>
                    
                    <Button variant="outline" onClick={stopStudio} className="w-full h-12 border-destructive/20 text-destructive bg-destructive/5 font-black uppercase tracking-widest text-[9px] rounded-xl">
                       Stop Stream
                    </Button>
                 </div>
               )}

               {error && (
                 <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-widest leading-relaxed">{error}</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Status - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Signal</CardTitle>
                 </div>
                 {isActive && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 animate-pulse">STREAM ACTIVE</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-10 sm:p-20 flex flex-col items-center justify-center relative overflow-hidden">
                 {!isActive ? (
                   <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                      <Radio className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Acoustic Handshake</p>
                   </div>
                 ) : (
                   <div className="w-full space-y-16 animate-in zoom-in-95 duration-500">
                      {/* Visualizer Matrix */}
                      <div className="flex flex-col items-center gap-12">
                         <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
                            <svg className="w-full h-full transform -rotate-90">
                               <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                               <circle 
                                cx="50%" cy="50%" r="45%" 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="8" 
                                strokeDasharray="283" 
                                strokeDashoffset={283 - (283 * audioLevel) / 100}
                                className="text-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-75" 
                               />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                               <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Signal Intensity</span>
                               <h2 className="text-4xl sm:text-6xl font-headline font-black text-foreground leading-none">{audioLevel}%</h2>
                            </div>
                         </div>
                         
                         <div className="text-center space-y-4">
                            <h3 className="text-2xl font-headline font-black uppercase text-foreground tracking-tight">{EFFECTS.find(e => e.id === activeEffect)?.label} Protocol</h3>
                            <p className="text-[10px] sm:text-xs font-bold text-foreground/30 uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                              {EFFECTS.find(e => e.id === activeEffect)?.desc}
                            </p>
                         </div>
                      </div>

                      {/* Technical Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                               <Smartphone className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">Buffer Mode</p>
                               <p className="text-[11px] font-bold text-foreground truncate uppercase">Hardware Real-Time</p>
                            </div>
                         </div>
                         <div className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                               <Globe className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">Node Location</p>
                               <p className="text-[11px] font-bold text-foreground truncate uppercase">Client Sandbox</p>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Absolute</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Acoustic synthesis occurs 100% in local memory. No audio waveforms or biometric voice data are ever transmitted or stored on remote studio servers.
               </p>
             </div>
          </div>
        </div>
      </div>
      
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
