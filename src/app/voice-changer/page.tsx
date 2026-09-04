"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  RotateCcw,
  Globe,
  Waves,
  Download,
  Trash2,
  FastForward,
  Star,
  Save,
  Ear,
  Unplug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type EffectId = 'normal' | 'robot' | 'male' | 'female' | 'child' | 'deep' | 'helium' | 'radio' | 'alien' | 'echo';

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
  { id: 'radio', label: 'Radio', icon: Radio, desc: 'Bandpass distortion' },
  { id: 'alien', label: 'Alien', icon: Ghost, desc: 'Oscillating pulse' },
  { id: 'echo', label: 'Echo', icon: Waves, desc: 'Atmospheric feedback' },
];

export default function VoiceChangerPage() {
  const { toast } = useToast();
  
  // State Matrix
  const [isActive, setIsActive] = useState(false);
  const [activeEffect, setActiveEffect] = useState<EffectId>('normal');
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Advanced DSP State
  const [distortion, setDistortion] = useState(0);
  const [echoDelay, setEchoDelay] = useState(0);
  const [lowPass, setLowPass] = useState(20000); // Off by default
  const [highPass, setHighPass] = useState(20);   // Off by default
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Runtime
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Audio Graph Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const lowPassNodeRef = useRef<BiquadFilterNode | null>(null);
  const highPassNodeRef = useRef<BiquadFilterNode | null>(null);
  const distortionNodeRef = useRef<WaveShaperNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

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
    setIsRecording(false);
  }, []);

  const makeDistortionCurve = (amount: number) => {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  const startStudio = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // 1. Analyzer Node (Telemetry)
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;

      // 2. High Pass Node (Technical)
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = highPass;
      highPassNodeRef.current = hp;

      // 3. Low Pass Node (Technical)
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = lowPass;
      lowPassNodeRef.current = lp;

      // 4. Effect Filter Node (Creative)
      const effectFilter = ctx.createBiquadFilter();
      filterNodeRef.current = effectFilter;

      // 5. Distortion Node
      const dist = ctx.createWaveShaper();
      dist.curve = makeDistortionCurve(distortion);
      dist.oversample = '4x';
      distortionNodeRef.current = dist;

      // 6. Echo Node
      const delay = ctx.createDelay(5.0);
      delay.delayTime.value = echoDelay;
      const feedback = ctx.createGain();
      feedback.gain.value = echoDelay > 0 ? 0.4 : 0;
      delay.connect(feedback);
      feedback.connect(delay);
      delayNodeRef.current = delay;
      delayFeedbackRef.current = feedback;

      // 7. Master Gain Node
      const master = ctx.createGain();
      master.gain.value = isMuted ? 0 : volume;
      masterGainRef.current = master;

      // 8. Recorder Destination
      const dest = ctx.createMediaStreamDestination();
      recorderDestRef.current = dest;

      // Link Initial Chain
      // source -> hp -> lp -> effectFilter -> dist -> master -> analyzer -> speaker
      source.connect(hp);
      hp.connect(lp);
      lp.connect(effectFilter);
      effectFilter.connect(dist);
      dist.connect(master);
      
      // Secondary Echo Path
      dist.connect(delay);
      delay.connect(master);

      master.connect(analyzer);
      master.connect(ctx.destination);
      master.connect(dest);

      setIsActive(true);
      toast({ title: "Hardware Synchronized", description: "Linguistic stream initialized." });

      // Meter Loop
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateMeter = () => {
        if (!analyzerRef.current) return;
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

  // DSP Update Effect
  useEffect(() => {
    if (!isActive || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const filter = filterNodeRef.current!;
    const source = sourceNodeRef.current!;
    const hp = highPassNodeRef.current!;
    const lp = lowPassNodeRef.current!;
    const dist = distortionNodeRef.current!;
    const delay = delayNodeRef.current!;
    const feedback = delayFeedbackRef.current!;

    // Clean ephemeral nodes
    if (oscillatorRef.current) { 
      try { oscillatorRef.current.stop(); } catch(e) {}
      oscillatorRef.current = null; 
    }

    // Apply Sliders
    hp.frequency.setTargetAtTime(highPass, ctx.currentTime, 0.1);
    lp.frequency.setTargetAtTime(lowPass, ctx.currentTime, 0.1);
    dist.curve = makeDistortionCurve(distortion);
    delay.delayTime.setTargetAtTime(echoDelay, ctx.currentTime, 0.1);
    feedback.gain.setTargetAtTime(echoDelay > 0 ? 0.4 : 0, ctx.currentTime, 0.1);

    // Apply Presets
    filter.type = 'allpass';
    filter.frequency.value = 1000;

    switch (activeEffect) {
      case 'robot':
        const osc = ctx.createOscillator();
        const mod = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 50;
        mod.gain.value = 1.0;
        osc.connect(mod.gain);
        // We reconnect source through modulation for robot effect
        source.disconnect();
        source.connect(mod);
        mod.connect(hp);
        osc.start();
        oscillatorRef.current = osc;
        break;
      case 'deep':
        filter.type = 'lowpass';
        filter.frequency.setTargetAtTime(600, ctx.currentTime, 0.1);
        break;
      case 'helium':
        filter.type = 'highpass';
        filter.frequency.setTargetAtTime(2500, ctx.currentTime, 0.1);
        break;
      case 'radio':
        filter.type = 'bandpass';
        filter.frequency.setTargetAtTime(1500, ctx.currentTime, 0.1);
        dist.curve = makeDistortionCurve(100);
        break;
      case 'alien':
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 10;
        const mod2 = ctx.createGain();
        mod2.gain.value = 1000;
        osc2.connect(mod2);
        mod2.connect(filter.frequency);
        osc2.start();
        oscillatorRef.current = osc2;
        break;
      case 'echo':
        delay.delayTime.setTargetAtTime(0.5, ctx.currentTime, 0.1);
        feedback.gain.setTargetAtTime(0.6, ctx.currentTime, 0.1);
        break;
    }

  }, [activeEffect, isActive, distortion, echoDelay, lowPass, highPass]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(isMuted ? 0 : volume, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [volume, isMuted]);

  // --- Recording Logic ---
  const startRecording = () => {
    if (!recorderDestRef.current) return;
    
    const mediaRecorder = new MediaRecorder(recorderDestRef.current.stream);
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setIsRecording(false);
      toast({ title: "Recording Complete", description: "Vocal master archived." });
    };
    
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordedUrl(null);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const downloadRecording = () => {
    if (!recordedUrl) return;
    const link = document.createElement('a');
    link.href = recordedUrl;
    link.download = `voice_mod_${activeEffect}_${Date.now()}.wav`;
    link.click();
  };

  const resetDSP = () => {
    setDistortion(0);
    setEchoDelay(0);
    setLowPass(20000);
    setHighPass(20);
    setActiveEffect('normal');
    toast({ title: "Matrix Reset" });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Ear className="w-3.5 h-3.5" /> Acoustic Engineering
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Voice <span className="text-primary italic">Changer Studio Pro</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced hardware-native acoustic modulation. Transform your vocal signature using high-fidelity DSP filters, spatial feedback, and real-time frequency synthesis.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="voice-changer" />
           {isActive && (
              <Button variant="outline" size="sm" onClick={resetDSP} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Clear FX
              </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> DSP Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
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
                         <div className="flex justify-between items-center px-1">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Effect Protocol</Label>
                            <span className="text-[8px] font-black text-primary uppercase">{activeEffect} Node Active</span>
                         </div>
                         <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {EFFECTS.map(eff => (
                              <button
                                key={eff.id}
                                onClick={() => setActiveEffect(eff.id)}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all group/eff h-20",
                                  activeEffect === eff.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/30 border-border text-foreground/40 hover:text-primary"
                                )}
                              >
                                 <eff.icon className={cn("w-4 h-4 transition-transform group-hover/eff:scale-110", activeEffect === eff.id ? "text-white" : "text-primary/40")} />
                                 <span className="text-[8px] font-black uppercase tracking-tighter">{eff.label}</span>
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-8 pt-4 border-t border-white/5">
                         {[
                           { label: 'Signal Saturation (Distortion)', key: 'dist', icon: Zap, val: distortion, set: setDistortion, min: 0, max: 200 },
                           { label: 'Temporal Feedback (Echo)', key: 'echo', icon: Waves, val: echoDelay, set: setEchoDelay, min: 0, max: 1.0, step: 0.1 },
                           { label: 'Low-Pass Protocol', key: 'lp', icon: ArrowRight, val: lowPass, set: setLowPass, min: 200, max: 20000 },
                           { label: 'High-Pass Protocol', key: 'hp', icon: ArrowRight, val: highPass, set: setHighPass, min: 20, max: 5000 },
                         ].map((ctrl) => (
                           <div key={ctrl.key} className="space-y-4">
                              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                                 <Label className="flex items-center gap-2"><ctrl.icon className="w-3 h-3 text-primary" /> {ctrl.label}</Label>
                                 <span className="text-primary font-mono">{typeof ctrl.val === 'number' ? ctrl.val.toFixed(ctrl.step ? 1 : 0) : ctrl.val}</span>
                              </div>
                              <Slider value={[ctrl.val]} min={ctrl.min} max={ctrl.max} step={ctrl.step || 1} onValueChange={v => ctrl.set(v[0])} />
                           </div>
                         ))}
                      </div>

                      <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex flex-col gap-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <ShieldCheck className="w-8 h-8 text-primary/40" />
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-black uppercase text-foreground">Hardware Pass-through</p>
                                  <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">WASM Processing Active</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <button onClick={() => setIsMuted(!isMuted)} className={cn("p-2 rounded-lg transition-all", isMuted ? "bg-red-500 text-white" : "bg-background text-foreground/20")}>
                                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                               </button>
                            </div>
                         </div>
                      </div>
                      
                      <Button variant="outline" onClick={stopStudio} className="w-full h-12 border-destructive/20 text-destructive bg-destructive/5 font-black uppercase tracking-widest text-[9px] rounded-xl">
                         <Unplug className="w-3.5 h-3.5 mr-2" /> Stop Stream
                      </Button>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Status & Recording - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-black/40">
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
                   <div className="flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
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
                               <h2 className="text-4xl sm:text-7xl font-headline font-black text-foreground leading-none">{audioLevel}%</h2>
                            </div>
                         </div>
                         
                         <div className="text-center space-y-4">
                            <h3 className="text-2xl font-headline font-black uppercase text-foreground tracking-tight">{EFFECTS.find(e => e.id === activeEffect)?.label} Protocol</h3>
                            <div className="flex items-center justify-center gap-3">
                               <Badge variant="outline" className="bg-secondary/50 border-white/10 text-[9px] font-black uppercase tracking-widest px-4">{EFFECTS.find(e => e.id === activeEffect)?.desc}</Badge>
                               <button onClick={() => toggleFavorite(activeEffect)} className={cn("p-2 transition-all", favorites.has(activeEffect) ? "text-yellow-500" : "text-white/10")}>
                                  <Star className={cn("w-5 h-5", favorites.has(activeEffect) && "fill-current")} />
                               </button>
                            </div>
                         </div>
                      </div>

                      {/* Recording Suite */}
                      <div className="p-8 rounded-[3rem] bg-secondary border border-border space-y-8 shadow-2xl relative overflow-hidden group/rec">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/rec:opacity-10 transition-opacity"><Music className="w-16 h-16" /></div>
                         <div className="flex items-center justify-between">
                            <div className="space-y-1">
                               <h4 className="text-[11px] font-black uppercase text-foreground">Acoustic Capturing</h4>
                               <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Record post-modulation stream</p>
                            </div>
                            {isRecording && <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-black uppercase"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Recording</div>}
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button 
                              onClick={isRecording ? stopRecording : startRecording}
                              className={cn(
                                "h-16 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95",
                                isRecording ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20" : "bg-primary text-white shadow-primary/20"
                              )}
                            >
                               {isRecording ? <Square className="w-5 h-5 mr-3 fill-current" /> : <Play className="w-5 h-5 mr-3 fill-current" />}
                               {isRecording ? 'Stop Capture' : 'Start Record'}
                            </Button>

                            {recordedUrl ? (
                              <div className="flex gap-2">
                                 <Button asChild variant="outline" className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] rounded-2xl shadow-xl hover:bg-white/90">
                                    <a href={recordedUrl} download={`vocal_mod_${activeEffect}.wav`}><Download className="w-5 h-5 mr-2" /> WAV</a>
                                 </Button>
                                 <Button variant="outline" onClick={() => { setRecordedUrl(null); setRecordedBlob(null); }} className="h-16 w-16 bg-secondary border-border rounded-2xl hover:text-destructive">
                                    <Trash2 className="w-5 h-5" />
                                 </Button>
                              </div>
                            ) : (
                              <div className="h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-foreground/10 text-[9px] font-black uppercase tracking-widest">
                                 Buffer Empty
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
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
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Monitor className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Hardware Standards</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing the standard Web Audio API with bitstream buffering for 1:1 acoustic fidelity across modern hardware nodes.
                  </p>
                </div>
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
