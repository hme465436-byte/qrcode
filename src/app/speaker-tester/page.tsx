"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Waves, 
  Activity, 
  Trash2, 
  Sparkles, 
  Info,
  CheckCircle2,
  Zap,
  Play,
  Square,
  ArrowLeftRight,
  Monitor,
  Smartphone,
  ShieldCheck,
  Speaker,
  Settings2,
  ListFilter,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ChannelMode = 'left' | 'right' | 'stereo' | 'mono';

export default function SpeakerTesterPage() {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(0.5);
  const [channel, setChannel] = useState<ChannelMode>('stereo');
  const [isSweeping, setIsSweeping] = useState(false);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
    setIsSweeping(false);
  };

  const playTone = () => {
    stopTone();
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const panner = ctx.createStereoPanner();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Channel Logic
    let panValue = 0;
    if (channel === 'left') panValue = -1;
    if (channel === 'right') panValue = 1;
    panner.pan.setValueAtTime(panValue, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);

    osc.connect(panner);
    panner.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    oscillatorRef.current = osc;
    pannerRef.current = panner;
    gainNodeRef.current = gain;
    setIsPlaying(true);
  };

  const startSweep = () => {
    stopTone();
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    setIsSweeping(true);
    setIsPlaying(true);

    osc.frequency.setValueAtTime(20, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(12000, ctx.currentTime + 5);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 5);
    
    osc.onended = () => {
      setIsPlaying(false);
      setIsSweeping(false);
      toast({ title: "Sweep Complete", description: "Linguistic frequency test finished." });
    };

    oscillatorRef.current = osc;
  };

  // Sync controls while playing
  useEffect(() => {
    if (isPlaying && !isSweeping && oscillatorRef.current && gainNodeRef.current && pannerRef.current) {
      const ctx = audioCtxRef.current!;
      oscillatorRef.current.frequency.setTargetAtTime(frequency, ctx.currentTime, 0.05);
      gainNodeRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
      
      let panValue = 0;
      if (channel === 'left') panValue = -1;
      if (channel === 'right') panValue = 1;
      pannerRef.current.pan.setTargetAtTime(panValue, ctx.currentTime, 0.05);
    }
  }, [frequency, volume, channel, isPlaying, isSweeping]);

  const handleClear = () => {
    stopTone();
    setFrequency(440);
    setVolume(0.5);
    setChannel('stereo');
    toast({ title: "Studio Reset", description: "Signal matrix cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Activity className="w-3.5 h-3.5" /> Hardware Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Speaker <span className="text-primary italic">Tester Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional hardware integrity matrix. Test stereo channel separation, frequency response, and driver fidelity locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6" />
                </div>
                Signal Matrix
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-12">
              {/* Channel Selection */}
              <div className="space-y-6">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Channel Isolation</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'left', label: 'Left Only' },
                    { id: 'right', label: 'Right Only' },
                    { id: 'stereo', label: 'Stereo' },
                    { id: 'mono', label: 'Mono/Center' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setChannel(mode.id as ChannelMode)}
                      className={cn(
                        "h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                        channel === mode.id 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" 
                          : "bg-background border-border text-foreground/40 hover:text-primary hover:border-primary/20"
                      )}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Matrix */}
              <div className="space-y-8">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  <Label className="flex items-center gap-2">Tone Frequency</Label>
                  <span className="text-primary font-mono text-lg">{frequency} Hz</span>
                </div>
                <Slider 
                  value={[frequency]} 
                  min={20} 
                  max={20000} 
                  step={1} 
                  onValueChange={(v) => setFrequency(v[0])} 
                />
                <div className="grid grid-cols-5 gap-2">
                   {[50, 440, 1000, 5000, 10000].map(val => (
                     <button 
                      key={val}
                      onClick={() => setFrequency(val)}
                      className={cn(
                        "h-9 rounded-lg border text-[8px] font-black uppercase tracking-tighter transition-all",
                        frequency === val ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40"
                      )}
                     >
                       {val < 1000 ? `${val}Hz` : `${val/1000}kHz`}
                     </button>
                   ))}
                </div>
              </div>

              {/* Volume & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    <Label className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /> Amplitude</Label>
                    <span className="text-primary font-mono">{(volume * 100).toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={[volume * 100]} 
                    min={0} 
                    max={100} 
                    step={1} 
                    onValueChange={(v) => setVolume(v[0] / 100)} 
                  />
                </div>

                <div className="flex flex-col justify-end gap-3">
                   <div className="flex gap-3">
                      <Button 
                        onClick={isPlaying ? stopTone : playTone}
                        className={cn(
                          "flex-1 h-14 font-black rounded-2xl flex items-center justify-center gap-3 text-sm shadow-xl transition-all active:scale-95",
                          isPlaying ? "bg-destructive text-white" : "bg-primary text-primary-foreground shadow-primary/30"
                        )}
                      >
                        {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        {isPlaying ? 'Stop Signal' : 'Start Tone'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleClear}
                        className="w-14 h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                   </div>
                   <Button 
                    onClick={startSweep}
                    disabled={isSweeping}
                    variant="outline"
                    className="h-12 rounded-xl border-dashed border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-all"
                   >
                     <Sparkles className="w-3.5 h-3.5 mr-2" />
                     {isSweeping ? 'Sweeping Matrix...' : 'Start 20Hz-12kHz Sweep'}
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Acoustic Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                The studio utilizes a 32-bit floating point audio buffer. Sine wave synthesis ensures 0% harmonic distortion during frequency response tests. 
              </p>
            </div>
          </div>
        </div>

        {/* Visualizer & Stats Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hardware Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 flex flex-col items-center justify-center p-8 space-y-12">
              
              {/* Visual Side Indicators */}
              <div className="w-full grid grid-cols-2 gap-8">
                 <div className={cn(
                   "p-8 rounded-[3rem] border-2 transition-all duration-300 text-center space-y-4",
                   (isPlaying && (channel === 'left' || channel === 'stereo' || channel === 'mono' || isSweeping)) 
                     ? "bg-primary/10 border-primary shadow-[0_0_50px_-12px_rgba(37,99,235,0.4)]" 
                     : "bg-secondary border-border opacity-20"
                 )}>
                    <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center", (isPlaying && (channel === 'left' || channel === 'stereo')) ? "animate-pulse" : "")}>
                       <Volume2 className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Left Channel</p>
                 </div>

                 <div className={cn(
                   "p-8 rounded-[3rem] border-2 transition-all duration-300 text-center space-y-4",
                   (isPlaying && (channel === 'right' || channel === 'stereo' || channel === 'mono' || isSweeping)) 
                     ? "bg-primary/10 border-primary shadow-[0_0_50px_-12px_rgba(37,99,235,0.4)]" 
                     : "bg-secondary border-border opacity-20"
                 )}>
                    <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center", (isPlaying && (channel === 'right' || channel === 'stereo')) ? "animate-pulse" : "")}>
                       <Volume2 className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Right Channel</p>
                 </div>
              </div>

              <div className="w-full space-y-6">
                 <div className="p-6 rounded-3xl bg-secondary/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary">
                          <Zap className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-foreground/30">Active Protocol</p>
                          <p className="text-[11px] font-bold text-foreground uppercase">{isSweeping ? 'Dynamic Sweep' : 'Static Sine Tone'}</p>
                       </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase">
                       {isPlaying ? 'Live' : 'Standby'}
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-secondary/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary">
                          <ArrowLeftRight className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-foreground/30">Configuration</p>
                          <p className="text-[11px] font-bold text-foreground uppercase">{channel.toUpperCase()} Mode</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary">{frequency}Hz</span>
                 </div>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-4 w-full">
                 <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                      Hardware handshake and synthesis occur 100% locally. Zero audio tracking protocols are enabled.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <Settings2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Clinical Standard</p>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Engine utilizes the Web Audio API OscillatorNode for hardware-native signal generation.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <Monitor className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Universal Sync</p>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Tested for hardware consistency across headphones, studio monitors, and mobile speakers.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
