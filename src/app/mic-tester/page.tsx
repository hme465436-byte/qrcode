"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Trash2, 
  RefreshCcw, 
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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MicTesterPage() {
  const { toast } = useToast();
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'standby' | 'active' | 'silent' | 'blocked'>('standby');

  // Refs for Web Audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and Fetch Devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs.filter(d => d.kind === 'audioinput');
        setDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Device discovery failed", err);
      }
    };

    getDevices();
    
    // Listen for device changes (e.g. plugging in a new mic)
    navigator.mediaDevices.ondevicechange = getDevices;

    return () => {
      stopStudio();
      navigator.mediaDevices.ondevicechange = null;
    };
  }, [selectedDeviceId]);

  const startStudio = async () => {
    setError(null);
    setStatus('standby');
    
    try {
      const constraints = {
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      audioContextRef.current = audioCtx;
      analyzerRef.current = analyzer;
      
      setIsActive(true);
      setStatus('active');
      toast({ title: "Hardware Synchronized", description: "Microphone uplink established." });
      
      // Level Meter Loop
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateLevel = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        
        setAudioLevel(normalized);
        
        if (normalized < 2 && isActive) {
          setStatus('silent');
        } else if (isActive) {
          setStatus('active');
        }
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Linguistic Access Denied: Please enable microphone permissions in your browser matrix.");
      } else {
        setError("Hardware Fault: Could not initialize audio input buffer.");
      }
      setStatus('blocked');
    }
  };

  const stopStudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setAudioLevel(0);
    setStatus('standby');
    if (isRecording) stopRecording();
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    setRecordedUrl(null);
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setIsRecording(false);
      toast({ title: "Echo Buffer Ready", description: "Record cycle complete." });
    };

    mediaRecorder.start();
    setIsRecording(true);
    
    // Auto-stop after 5 seconds for Echo Test
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        stopRecording();
      }
    }, 5000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const playEcho = () => {
    if (!recordedUrl) return;
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    stopStudio();
    setRecordedUrl(null);
    setError(null);
    toast({ title: "Studio Reset", description: "Buffers and project memory purged." });
  };

  const formatTime = (seconds: number) => {
    return `00:0${seconds}`;
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Mic className="w-3.5 h-3.5" /> Hardware Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Microphone <span className="text-primary italic">Tester Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional hardware integrity matrix. Test microphone input levels, clarity, and driver fidelity locally in your browser with absolute zero-storage privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Device Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Input Protocol (Source)</Label>
                <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId} disabled={isActive}>
                  <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-foreground font-bold">
                    <SelectValue placeholder="Identify Hardware..." />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {devices.length > 0 ? (
                      devices.map((d) => (
                        <SelectItem key={d.deviceId} value={d.deviceId} className="text-xs font-bold uppercase">{d.label || `Matrix Port ${devices.indexOf(d) + 1}`}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-xs italic uppercase">Searching Hardware...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> Hardware enumeration active
                  </p>
                  <button onClick={() => window.location.reload()} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Refresh Matrix</button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={cn(
                "p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center gap-6",
                isActive ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" : "border-border bg-secondary/30",
                error && "border-destructive bg-destructive/5"
              )}>
                 {!isActive && !error && (
                    <>
                       <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 shadow-xl group-hover:scale-110 transition-transform">
                          <MicOff className="w-8 h-8" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-[11px] font-black uppercase text-foreground tracking-widest">Handshake Standby</h4>
                          <p className="text-[9px] text-foreground/30 font-medium uppercase px-6 leading-relaxed">Requesting linguistic hardware permissions</p>
                       </div>
                       <Button 
                        onClick={startStudio} 
                        className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
                       >
                         Sync Hardware
                       </Button>
                    </>
                 )}

                 {isActive && (
                    <>
                       <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl relative z-10">
                             <Mic className="w-8 h-8" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-[11px] font-black uppercase text-primary tracking-widest">Active Signal Decoding</h4>
                          <p className="text-[9px] text-foreground/30 font-medium uppercase">Input matrix verified operational</p>
                       </div>
                       <Button 
                        onClick={stopStudio} 
                        variant="outline"
                        className="h-12 border-border bg-background text-foreground/40 hover:text-destructive hover:bg-destructive/5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                       >
                         Abort Session
                       </Button>
                    </>
                 )}

                 {error && (
                    <>
                       <AlertCircle className="w-12 h-12 text-destructive animate-bounce" />
                       <div className="space-y-2">
                          <h4 className="text-[11px] font-black uppercase text-destructive tracking-widest">Protocol Failure</h4>
                          <p className="text-[10px] text-foreground/50 font-medium leading-relaxed uppercase px-8">{error}</p>
                       </div>
                       <Button onClick={() => window.location.reload()} className="h-12 bg-secondary border border-border text-foreground font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-secondary/80">Restart Handshake</Button>
                    </>
                 )}
              </div>

              {/* Echo Test Trigger */}
              {isActive && (
                <div className="p-6 rounded-[2.5rem] bg-secondary border border-border space-y-6 animate-in zoom-in duration-500">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">Echo Buffer (5s)</Label>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase">Loopback testing protocol</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center">
                         <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-red-500 animate-pulse" : "bg-primary/20")} />
                      </div>
                   </div>
                   
                   <div className="flex gap-3">
                      <Button 
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isPlaying}
                        className={cn(
                          "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg",
                          isRecording ? "bg-red-600 hover:bg-red-700 text-white" : "bg-primary text-white"
                        )}
                      >
                         {isRecording ? <Square className="w-4 h-4 mr-2 fill-current" /> : <Zap className="w-4 h-4 mr-2" />}
                         {isRecording ? 'Capturing...' : 'Record Test'}
                      </Button>
                      
                      {recordedUrl && !isRecording && (
                        <Button 
                          onClick={playEcho}
                          variant="outline"
                          className="h-14 w-14 rounded-2xl bg-background border-border text-primary shadow-xl"
                        >
                           <Play className="w-5 h-5 fill-current" />
                        </Button>
                      )}
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Audio processing and visualization occur 100% locally. The Echo Buffer is held in volatile memory and is definitively purged upon exit.
              </p>
            </div>
          </div>
        </div>

        {/* Level Meter & Analytics - Right/Bottom */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Signal Intensity Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-10 bg-[#060608]">
              
              {/* The Meter Visualizer */}
              <div className="w-full max-w-sm space-y-12">
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end mb-4 px-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Input Level</p>
                       <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-3xl font-headline font-black transition-colors duration-300",
                            audioLevel > 80 ? "text-red-500" : audioLevel > 5 ? "text-primary" : "text-foreground/10"
                          )}>
                            {audioLevel}%
                          </span>
                       </div>
                    </div>
                    
                    {/* Segmented Meter */}
                    <div className="flex gap-1.5 h-20 items-end">
                       {Array.from({ length: 24 }).map((_, i) => {
                         const isActive = audioLevel >= (i + 1) * (100/24);
                         const isPeak = i > 18;
                         return (
                           <div 
                            key={i} 
                            className={cn(
                              "flex-1 rounded-sm transition-all duration-100",
                              isActive 
                                ? (isPeak ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]") 
                                : "bg-white/5",
                              isActive ? "h-full" : "h-2"
                            )}
                           />
                         );
                       })}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className={cn(
                      "p-8 rounded-[3rem] border-2 transition-all duration-500 text-center space-y-4 relative overflow-hidden",
                      status === 'active' ? "bg-primary/5 border-primary/20 shadow-xl" : "bg-background border-border opacity-20"
                    )}>
                       <div className="w-12 h-12 rounded-2xl mx-auto bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <CheckCircle2 className="w-6 h-6" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">Protocol Active</p>
                       {status === 'active' && <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
                    </div>

                    <div className={cn(
                      "p-8 rounded-[3rem] border-2 transition-all duration-500 text-center space-y-4",
                      status === 'silent' ? "bg-yellow-500/5 border-yellow-500/20 shadow-xl" : "bg-background border-border opacity-20"
                    )}>
                       <div className="w-12 h-12 rounded-2xl mx-auto bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-inner">
                          <Volume2 className="w-6 h-6" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">Silence Detection</p>
                    </div>
                 </div>

                 {recordedUrl && (
                    <div className="animate-in zoom-in duration-500">
                       <div className="p-8 rounded-[2.5rem] bg-secondary border border-border space-y-6 relative overflow-hidden group/audio">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover/audio:opacity-100 transition-opacity" />
                          <div className="flex items-center justify-between relative z-10">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                                   <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[10px] font-black uppercase text-foreground">Loopback Capture</p>
                                   <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">5.0s Linguistic Sample</p>
                                </div>
                             </div>
                             <audio 
                              ref={audioPlaybackRef} 
                              src={recordedUrl} 
                              onEnded={() => setIsPlaying(false)}
                              onPlay={() => setIsPlaying(true)}
                              onPause={() => setIsPlaying(false)}
                              className="hidden" 
                             />
                             <Button onClick={isPlaying ? () => audioPlaybackRef.current?.pause() : playEcho} className="h-10 w-24 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                {isPlaying ? 'Stop' : 'Review'}
                             </Button>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none p-12 text-center space-y-6">
                   <Activity className="w-24 h-24 text-primary" />
                   <p className="text-sm font-black uppercase tracking-[0.3em]">Hardware Handshake Required</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <Monitor className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Amplitude Matrix</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Precision real-time FFT analysis provides clinical volume feedback with peak detection.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Zero Recording</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">All audio synthesis is strictly local. Echo buffers are wiped upon session completion.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

