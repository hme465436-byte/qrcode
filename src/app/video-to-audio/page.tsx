"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Video, 
  Music, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileVideo,
  Settings2,
  Terminal,
  Activity,
  Layers,
  Scissors,
  Clock,
  Timer,
  FastForward,
  AlertCircle,
  FileAudio,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const AUDIO_FORMATS = [
  { id: 'mp3', label: 'MP3 (Standard)', codec: 'libmp3lame', ext: 'mp3', supportsBitrate: true },
  { id: 'aac', label: 'AAC (High Fidelity)', codec: 'aac', ext: 'aac', supportsBitrate: true },
  { id: 'm4a', label: 'M4A (Apple Standard)', codec: 'aac', ext: 'm4a', supportsBitrate: true },
  { id: 'wav', label: 'WAV (Uncompressed)', codec: 'pcm_s16le', ext: 'wav', supportsBitrate: false },
  { id: 'flac', label: 'FLAC (Lossless)', codec: 'flac', ext: 'flac', supportsBitrate: false },
  { id: 'ogg', label: 'OGG (Vorbis)', codec: 'libvorbis', ext: 'ogg', supportsBitrate: true },
];

export default function VideoToAudioPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [bitrate, setBitrate] = useState('192k');
  const [targetFormat, setTargetFormat] = useState('mp3');

  // Trimming State
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const selectedFormat = useMemo(() => 
    AUDIO_FORMATS.find(f => f.id === targetFormat) || AUDIO_FORMATS[0], 
  [targetFormat]);

  const formatSecondsToMMSS = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parseMMSSToSeconds = (value: string) => {
    const parts = value.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return parseInt(value) || 0;
  };

  const selectedLength = useMemo(() => {
    const len = Math.max(0, endTime - startTime);
    return formatSecondsToMMSS(len);
  }, [startTime, endTime]);

  const isValidRange = useMemo(() => {
    return startTime < endTime && startTime >= 0 && endTime <= totalDuration;
  }, [startTime, endTime, totalDuration]);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const loadFFmpeg = async (force = false) => {
    if (!force && isLoaded && ffmpegRef.current) return true;
    
    setStatus('Initializing Engine...');
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    if (!ffmpegRef.current || force) {
      ffmpegRef.current = new FFmpeg();
    }
    
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('log', ({ message }) => {
      setLogs(prev => [...prev.slice(-4), message]);
    });

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsLoaded(true);
      return true;
    } catch (err) {
      console.error('FFmpeg Load Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Engine Failure", 
        description: "Failed to load FFmpeg. Browser-side processing requires SharedArrayBuffer support." 
      });
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isAudioOnly = selectedFile.type.startsWith('audio/');
      
      const media = isAudioOnly ? document.createElement('audio') : document.createElement('video');
      media.preload = 'metadata';
      media.onloadedmetadata = () => {
        setTotalDuration(media.duration);
        setEndTime(media.duration);
        setStartTime(0);
        window.URL.revokeObjectURL(media.src);
      };
      media.src = URL.createObjectURL(selectedFile);

      setFile(selectedFile);
      setAudioUrl(null);
      setProgress(0);
      setStatus('');
      setLogs([]);
      toast({ title: "Asset Imported", description: `Analyzed ${isAudioOnly ? 'audio' : 'video'} metadata.` });
    }
  };

  const convertToAudio = async () => {
    if (!file || !isValidRange) return;

    setIsProcessing(true);
    setLogs([]);
    
    // Ensure FFmpeg is ready
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_media';
    const outputName = `output_master.${selectedFormat.ext}`;

    try {
      setStatus('Preparing Buffers...');
      
      // Strict memory cleanup before run
      try { await ffmpeg.deleteFile(inputName); } catch(e) {}
      try { await ffmpeg.deleteFile(outputName); } catch(e) {}

      // Direct Uint8Array handling for optimized WASM memory injection
      const fileData = new Uint8Array(await file.arrayBuffer());
      await ffmpeg.writeFile(inputName, fileData);

      setStatus(`Encoding ${selectedFormat.label}...`);
      
      const args = [
        '-ss', startTime.toFixed(2),
        '-i', inputName,
        '-to', (endTime - startTime).toFixed(2),
        '-vn',
        '-acodec', selectedFormat.codec
      ];

      if (selectedFormat.supportsBitrate) {
        args.push('-b:a', bitrate);
      }

      args.push(outputName);
      
      await ffmpeg.exec(args);

      setStatus('Extracting Master...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: `audio/${selectedFormat.ext}` }));
      
      setAudioUrl(url);
      setProgress(100);
      setStatus(`Production Complete`);
      toast({ title: "Master Exported", description: `Track successfully synthesized as ${selectedFormat.id.toUpperCase()}.` });
      
      // Cleanup
      try { await ffmpeg.deleteFile(inputName); } catch(e) {}
      try { await ffmpeg.deleteFile(outputName); } catch(e) {}
    } catch (err: any) {
      console.error('Conversion Error:', err);
      
      if (err.message?.includes('memory access out of bounds')) {
        toast({ 
          variant: "destructive", 
          title: "Memory Limit Exceeded", 
          description: "This asset is too large for the current WASM sandbox. Please try a shorter duration or smaller file." 
        });
        // Force a reload of FFmpeg on next attempt
        setIsLoaded(false);
      } else {
        toast({ 
          variant: "destructive", 
          title: "Production Failed", 
          description: "An unexpected error occurred during audio synthesis." 
        });
      }
      setStatus('Process Aborted');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    setTotalDuration(0);
    setStartTime(0);
    setEndTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "All buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Music className="w-3.5 h-3.5" /> Media Studio
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Universal <span className="text-primary italic">Audio Converter</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional-grade audio synthesis. Convert video or audio assets into high-fidelity masters with precision trimming and multi-format encoding protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Input Card */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                Source Payload
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Media Container</Label>
                  {file && (
                    <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB Detected
                    </div>
                  )}
                </div>
                
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/40",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {file ? (
                    <div className="text-center p-6 space-y-2">
                       {file.type.startsWith('audio/') ? <FileAudio className="w-10 h-10 text-primary mx-auto mb-2" /> : <FileVideo className="w-10 h-10 text-primary mx-auto mb-2" />}
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Tap to swap source</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center leading-relaxed">
                        Drop Media Payload<br/><span className="text-[8px] opacity-60">MP4, WEBM, MOV, MP3, WAV</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="video/*,audio/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {file && totalDuration > 0 && (
                <div className="space-y-10 pt-6 border-t border-border animate-in fade-in zoom-in duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Scissors className="w-3 h-3 text-primary" /> Visual Timeline Matrix
                      </Label>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-lg">Length: {selectedLength}</span>
                      </div>
                    </div>

                    <div className="px-2 pt-2">
                      <Slider 
                        value={[startTime, endTime]} 
                        min={0} 
                        max={totalDuration} 
                        step={0.1} 
                        minStepsBetweenThumbs={1}
                        onValueChange={(val) => {
                          setStartTime(val[0]);
                          setEndTime(val[1]);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-foreground/40">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Start</span>
                        </div>
                        <Input 
                          placeholder="00:00"
                          value={formatSecondsToMMSS(startTime)} 
                          onChange={(e) => {
                            const val = parseMMSSToSeconds(e.target.value);
                            if (val >= 0 && val < endTime) setStartTime(val);
                          }}
                          className="h-14 bg-secondary border-border rounded-2xl text-lg font-mono font-bold text-center"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-foreground/40">
                          <span className="flex items-center gap-1.5"><Timer className="w-3 h-3" /> End</span>
                        </div>
                        <Input 
                          placeholder="00:00"
                          value={formatSecondsToMMSS(endTime)} 
                          onChange={(e) => {
                            const val = parseMMSSToSeconds(e.target.value);
                            if (val > startTime && val <= totalDuration) setEndTime(val);
                          }}
                          className="h-14 bg-secondary border-border rounded-2xl text-lg font-mono font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conversion Profile */}
              <div className="space-y-8 pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Layers className="w-3 h-3 text-primary" /> Format Matrix
                    </Label>
                    <Select value={targetFormat} onValueChange={setTargetFormat}>
                      <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-foreground font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card max-h-[300px]">
                        {AUDIO_FORMATS.map((fmt) => (
                          <SelectItem key={fmt.id} value={fmt.id} className="text-xs font-bold uppercase">{fmt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedFormat.supportsBitrate && (
                    <div className="space-y-4 animate-in fade-in">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FastForward className="w-3 h-3 text-primary" /> Bitrate Quality
                      </Label>
                      <RadioGroup 
                        defaultValue="192k" 
                        value={bitrate} 
                        onValueChange={setBitrate}
                        className="grid grid-cols-2 gap-2"
                        disabled={isProcessing}
                      >
                        {[
                          { val: '128k', label: 'Eco' },
                          { val: '192k', label: 'STD' },
                          { val: '256k', label: 'HQ' },
                          { val: '320k', label: 'Max' },
                        ].map((mode) => (
                          <div key={mode.val} className="relative">
                            <RadioGroupItem value={mode.val} id={`b-${mode.val}`} className="peer sr-only" />
                            <Label
                              htmlFor={`b-${mode.val}`}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl border border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary",
                                bitrate === mode.val && "border-primary bg-primary/5"
                              )}
                            >
                              <span className="text-[10px] font-black uppercase">{mode.val}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={convertToAudio}
                  disabled={!file || isProcessing || !isValidRange}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Generate Master
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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="relative group/output min-h-[300px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!audioUrl && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity space-y-4">
                    <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full space-y-8 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {status}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="mt-4 p-4 rounded-xl bg-black/90 border border-white/5 text-left font-mono text-[9px] text-green-500/80 overflow-hidden shadow-inner">
                      {logs.map((log, i) => (
                        <div key={i} className="truncate whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {audioUrl && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl ring-4 ring-primary/5">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Audio Master Encoded</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Format: {selectedFormat.id.toUpperCase()} | Profile: {selectedFormat.label}</p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-2xl border border-border w-full shadow-inner">
                      <audio controls src={audioUrl} className="w-full h-10" />
                    </div>
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={audioUrl} download={`${file?.name.split('.')[0] || 'master'}_optimized.${selectedFormat.ext}`}>
                        <Download className="w-6 h-6" />
                        Download {selectedFormat.ext.toUpperCase()}
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">WASM Architecture</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                    Conversions are strictly local. The 2GB WASM memory limit applies; if the process fails with a memory error, try trimming a smaller segment of the source media.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Master Protocol</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Automatic re-encoding with optimized bitstream alignment.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
