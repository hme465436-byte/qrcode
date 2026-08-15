"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  MicOff, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileAudio,
  Settings2,
  Activity,
  Play,
  Volume2,
  Mic,
  Waves,
  AlertCircle,
  Pause,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function VocalSeparatorPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Settings
  const [mode, setMode] = useState<'vocal-reduce' | 'vocal-focus'>('vocal-reduce');
  const [strength, setStrength] = useState(0.85); // Better default for stereo tracks
  const [enableFilter, setEnableFilter] = useState(true);

  // Refs for Web Audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainMidRef = useRef<GainNode | null>(null);
  const gainSideRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    stopPlayback();
    setFile(selectedFile);
    setIsDecoding(true);
    setAudioBuffer(null);

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      if (decodedBuffer.numberOfChannels < 2) {
        toast({ 
          variant: "destructive", 
          title: "Mono Detected", 
          description: "This tool requires a stereo field to perform phase-cancellation." 
        });
      } else {
        setAudioBuffer(decodedBuffer);
        setDuration(decodedBuffer.duration);
        toast({ title: "Asset Imported", description: `Stereo matrix decoded (${formatTime(decodedBuffer.duration)}).` });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Decode Error", description: "Failed to read audio data." });
    } finally {
      setIsDecoding(false);
    }
  };

  const setupNodes = (ctx: BaseAudioContext, buffer: AudioBuffer, isOffline = false) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // 1. Mid/Side Splitter
    const splitter = ctx.createChannelSplitter(2);
    source.connect(splitter);

    // 2. Sum (Mid) and Difference (Side)
    // Mid = (L + R) * 0.5
    // Side = (L - R) * 0.5
    const midSum = ctx.createGain();
    const sideSum = ctx.createGain();
    const inverter = ctx.createGain();
    midSum.gain.value = 0.5;
    sideSum.gain.value = 0.5;
    inverter.gain.value = -1;

    // Mid Path: L + R
    splitter.connect(midSum, 0);
    splitter.connect(midSum, 1);

    // Side Path: L - R
    splitter.connect(sideSum, 0);
    splitter.connect(inverter, 1);
    inverter.connect(sideSum);

    // 3. Frequency Filtering (Target Vocal Range: 300Hz - 3.5kHz)
    const midFilter = ctx.createBiquadFilter();
    if (mode === 'vocal-reduce') {
      midFilter.type = 'peaking';
      midFilter.frequency.value = 1000;
      midFilter.Q.value = 0.5;
      midFilter.gain.value = enableFilter ? -15 * strength : 0;
    } else {
      midFilter.type = 'bandpass';
      midFilter.frequency.value = 1000;
      midFilter.Q.value = 0.8;
    }

    // 4. Final Gain Stage
    const midFinal = ctx.createGain();
    const sideFinal = ctx.createGain();
    
    if (mode === 'vocal-reduce') {
      midFinal.gain.value = 1.0 - (strength * 0.95); // Avoid total silence for better blend
      sideFinal.gain.value = 1.0;
    } else {
      midFinal.gain.value = 1.0;
      sideFinal.gain.value = 1.0 - (strength * 0.95);
    }

    midSum.connect(midFilter);
    midFilter.connect(midFinal);
    sideSum.connect(sideFinal);

    // 5. Rematrix to Stereo
    // L = Mid + Side
    // R = Mid - Side
    const merger = ctx.createChannelMerger(2);
    const sideInverter = ctx.createGain();
    sideInverter.gain.value = -1;

    midFinal.connect(merger, 0, 0);
    sideFinal.connect(merger, 0, 0);
    
    midFinal.connect(merger, 0, 1);
    sideFinal.connect(sideInverter);
    sideInverter.connect(merger, 0, 1);

    // 6. Master Volume Adjust
    const master = ctx.createGain();
    master.gain.value = 1.2; // Compensate for phase loss
    merger.connect(master);
    master.connect(ctx.destination);
    
    if (!isOffline) {
      gainMidRef.current = midFinal;
      gainSideRef.current = sideFinal;
      filterNodeRef.current = midFilter;
      sourceNodeRef.current = source;
    }

    return source;
  };

  const togglePlayback = () => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  };

  const startPlayback = () => {
    if (!audioBuffer) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const source = setupNodes(ctx, audioBuffer);
    source.start(0, pauseOffsetRef.current);
    startTimeRef.current = ctx.currentTime - pauseOffsetRef.current;
    setIsPlaying(true);

    timerRef.current = setInterval(() => {
      setCurrentTime(ctx.currentTime - startTimeRef.current);
    }, 100);
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    pauseOffsetRef.current = currentTime;
    setIsPlaying(false);
  };

  useEffect(() => {
    if (gainMidRef.current && gainSideRef.current && filterNodeRef.current) {
      const ctx = getAudioContext();
      if (mode === 'vocal-reduce') {
        gainMidRef.current.gain.setTargetAtTime(1.0 - (strength * 0.95), ctx.currentTime, 0.05);
        gainSideRef.current.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
        if (filterNodeRef.current.type === 'peaking') {
          filterNodeRef.current.gain.setTargetAtTime(enableFilter ? -15 * strength : 0, ctx.currentTime, 0.05);
        }
      } else {
        gainMidRef.current.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
        gainSideRef.current.gain.setTargetAtTime(1.0 - (strength * 0.95), ctx.currentTime, 0.05);
      }
    }
  }, [strength, mode, enableFilter]);

  const exportWav = async () => {
    if (!audioBuffer) return;
    setIsExporting(true);
    
    try {
      const offlineCtx = new OfflineAudioContext(2, audioBuffer.length, audioBuffer.sampleRate);
      const source = setupNodes(offlineCtx, audioBuffer, true);
      source.start();
      
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcanvas-${mode}-${Math.round(strength * 100)}p.wav`;
      link.click();
      toast({ title: "Master Exported", description: "Studio quality separation saved as WAV." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Export Failed", description: "Internal audio rendering failed." });
    } finally {
      setIsExporting(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const length = buffer.length * numChannels * bytesPerSample;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        let sample = buffer.getChannelData(channel)[i];
        sample = Math.max(-1, Math.min(1, sample));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
    }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const handleClear = () => {
    stopPlayback();
    setFile(null);
    setAudioBuffer(null);
    setCurrentTime(0);
    pauseOffsetRef.current = 0;
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers and memory purged." });
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MicOff className="w-3.5 h-3.5" /> Media Intelligence
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Vocal <span className="text-primary italic">Separator Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional-grade stereo phase-cancellation. Isolate center-panned audio or reduce vocals for high-quality karaoke masters locally.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Card */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6" />
                </div>
                Production Matrix
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div 
                  onClick={() => !isDecoding && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/40",
                    isDecoding && "cursor-not-allowed opacity-80"
                  )}
                >
                  {isDecoding ? (
                    <div className="text-center p-6 space-y-4">
                       <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
                       <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Analyzing Spectral Fields...</p>
                    </div>
                  ) : file ? (
                    <div className="text-center p-6 space-y-2">
                       <FileAudio className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{formatTime(duration)} Stereo Matrix</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6 leading-relaxed">
                        Import Stereo Track<br/><span className="text-[8px] opacity-60">MP3, WAV, M4A up to 20MB</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="audio/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {audioBuffer && (
                <div className="space-y-12 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Extraction Mode</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <button
                        onClick={() => setMode('vocal-reduce')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all",
                          mode === 'vocal-reduce' ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105" : "bg-background border-border text-foreground/40 hover:text-primary"
                        )}
                       >
                         <MicOff className="w-6 h-6 mb-1" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Vocal Reduce</span>
                         <span className="text-[8px] opacity-60 uppercase font-bold">(Karaoke Engine)</span>
                       </button>
                       <button
                        onClick={() => setMode('vocal-focus')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all",
                          mode === 'vocal-focus' ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105" : "bg-background border-border text-foreground/40 hover:text-primary"
                        )}
                       >
                         <Mic className="w-6 h-6 mb-1" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Vocal Focus</span>
                         <span className="text-[8px] opacity-60 uppercase font-bold">(Isolate Center)</span>
                       </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                       <div className="space-y-1">
                        <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Separation Strength</Label>
                        <p className="text-[9px] text-foreground/30 font-bold uppercase">Matrix Depth Intensity</p>
                       </div>
                       <span className="text-lg font-headline font-black text-primary uppercase">{(strength * 100).toFixed(0)}%</span>
                    </div>
                    <Slider 
                      value={[strength * 100]} 
                      min={0} 
                      max={100} 
                      step={1} 
                      onValueChange={(v) => setStrength(v[0] / 100)} 
                      className="py-4"
                    />
                  </div>

                  <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Frequency Masking</p>
                        <p className="text-[10px] text-foreground/40 font-medium">Target 300Hz–3.5kHz vocal range</p>
                     </div>
                     <Switch checked={enableFilter} onCheckedChange={setEnableFilter} />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={togglePlayback}
                  disabled={!audioBuffer}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  {isPlaying ? 'Pause Preview' : 'Play Processed'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output min-h-[200px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!audioBuffer && !isDecoding && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isDecoding && (
                  <div className="w-full space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Volume2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black uppercase text-primary tracking-widest">Decoding Bitstream...</p>
                  </div>
                )}

                {audioBuffer && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    
                    <div className="space-y-4 w-full">
                       <div className="flex justify-between text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                          <span>Progress</span>
                          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                       </div>
                       <Progress value={(currentTime / duration) * 100} className="h-1.5" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Separation Ready</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Logic: {mode.replace('-', ' ')} Matrix</p>
                    </div>

                    <Button 
                      onClick={exportWav}
                      disabled={isExporting}
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                      Download Master WAV
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-[2rem] bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-5">
                <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-yellow-700 uppercase tracking-widest">Production Note</h4>
                  <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">
                    This tool works best on high-quality stereo tracks where vocals are center-panned. This is a local matrix utility, not an AI multi-stem split.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Hardware Synthesis</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Sampled at {audioBuffer?.sampleRate || 44100}Hz with 16-bit PCM precision.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
