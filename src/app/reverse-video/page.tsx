"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  RotateCcw, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  ShieldCheck,
  FileVideo,
  Settings2,
  Terminal,
  Activity,
  Play,
  Film,
  Zap,
  Volume2,
  VolumeX,
  History,
  AlertCircle,
  Scissors,
  Timer,
  Clock,
  ArrowRight,
  Maximize2,
  ListFilter,
  Check,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Constants ---
const HISTORY_KEY = 'mykit_reverse_history_v1';
const MAX_RECOMMENDED_SIZE = 100 * 1024 * 1024; // 100MB

type ReverseMode = 'both' | 'video-only' | 'audio-only';
type QualityPreset = 'ultrafast' | 'medium' | 'slow';
type OutputFormat = 'mp4' | 'webm';

interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  size: number;
}

export default function ReverseVideoPage() {
  const { toast } = useToast();
  
  // File & Engine State
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'running' | 'complete' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Output State
  const [reversedUrl, setReversedUrl] = useState<string | null>(null);
  const [reversedSize, setReversedSize] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Advanced Settings
  const [mode, setMode] = useState<ReverseMode>('both');
  const [quality, setQuality] = useState<QualityPreset>('medium');
  const [format, setFormat] = useState<OutputFormat>('mp4');
  
  // Trimming
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // --- Initial Handshake ---
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
    
    return () => {
      if (reversedUrl) URL.revokeObjectURL(reversedUrl);
    };
  }, [reversedUrl]);

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setStatus('loading');
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('log', ({ message }) => {
      setLogs(prev => [...prev.slice(-15), message]);
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
      setStatus('ready');
      return true;
    } catch (err) {
      setStatus('error');
      toast({ variant: "destructive", title: "Engine Failure", description: "Failed to initialize WASM node." });
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_RECOMMENDED_SIZE) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Large files may exceed browser memory." });
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setDuration(video.duration);
        setEndTime(video.duration);
        setStartTime(0);
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);

      setFile(selectedFile);
      setReversedUrl(null);
      setProgress(0);
      setStatus('ready');
      setLogs([]);
    }
  };

  const executeReverse = async () => {
    if (!file) return;

    setIsProcessing(true);
    setStatus('running');
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_raw';
    const outputName = `reversed_master.${format}`;

    try {
      // 1. Prepare Virtual FS
      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);

      // 2. Build Complex Filter Command
      const args: string[] = [];
      
      // Seek and Trim Protocol
      args.push('-ss', startTime.toFixed(3));
      args.push('-i', inputName);
      args.push('-t', (endTime - startTime).toFixed(3));

      // Reversal Logic
      if (mode === 'both') {
        args.push('-vf', 'reverse', '-af', 'areverse');
      } else if (mode === 'video-only') {
        args.push('-vf', 'reverse', '-an');
      } else if (mode === 'audio-only') {
        args.push('-af', 'areverse', '-vn');
      }

      // Quality Protocol
      args.push('-preset', quality);
      
      // Container Protocol
      if (format === 'mp4') {
        args.push('-c:v', 'libx264', '-c:a', 'aac', '-movflags', 'faststart');
      } else {
        args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus');
      }

      args.push(outputName);

      // 3. Execution
      await ffmpeg.exec(args);

      // 4. Extraction
      const data = await ffmpeg.readFile(outputName);
      const resBlob = new Blob([(data as any).buffer], { type: `video/${format}` });
      const url = URL.createObjectURL(resBlob);
      
      setReversedUrl(url);
      setReversedSize(resBlob.size);
      setStatus('complete');
      setProgress(100);

      // Save to local history
      const historyEntry: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, "") + "-reversed",
        timestamp: Date.now(),
        size: resBlob.size
      };
      const nextHistory = [historyEntry, ...history].slice(0, 5);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));

      toast({ title: "Master Exported", description: "Temporal inversion successfully applied." });
      
      // 5. Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      toast({ variant: "destructive", title: "Protocol Failure", description: "Memory overflow or restricted codec." });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClear = () => {
    setFile(null);
    setReversedUrl(null);
    setReversedSize(null);
    setStatus('idle');
    setLogs([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <RotateCcw className="w-3.5 h-3.5" /> Media Engineering
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Reverse <span className="text-primary italic">Video Studio Pro</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced hardware-native temporal inversion. Reverse high-fidelity bitstreams with precision trimming, multi-mode synthesis, and local WASM isolation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="reverse-video" />
           {(file || reversedUrl) && (
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Editor Controls */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <div 
                      onClick={() => !isProcessing && fileInputRef.current?.click()}
                      className={cn(
                        "relative h-32 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                        file && "border-solid border-primary/20 bg-background/50"
                      )}
                    >
                      {file ? (
                        <div className="text-center p-4">
                           <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-1" />
                           <p className="text-[9px] font-black uppercase text-foreground/40">{file.name}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                           <Film className="w-8 h-8 text-foreground/10 group-hover/upload:text-primary transition-all" />
                           <span className="text-[9px] font-black uppercase text-foreground/30">Inject Media</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} accept="video/mp4,video/webm,video/quicktime" onChange={handleFileChange} className="hidden" />
                    </div>
                 </div>

                 {file && (
                    <div className="space-y-10 animate-in zoom-in duration-500">
                       {/* Mode Protocol */}
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Inversion Mode</Label>
                          <div className="grid grid-cols-3 gap-2">
                             {[
                               { id: 'both', label: 'Full Sync' },
                               { id: 'video-only', label: 'Visual Only' },
                               { id: 'audio-only', label: 'Acoustic' },
                             ].map(m => (
                               <button 
                                key={m.id} 
                                onClick={() => setMode(m.id as ReverseMode)}
                                className={cn(
                                  "h-11 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all",
                                  mode === m.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/30 hover:text-primary"
                                )}
                               >
                                  {m.label}
                               </button>
                             ))}
                          </div>
                       </div>

                       {/* Trimming Protocol */}
                       <div className="space-y-6">
                          <div className="flex justify-between items-center px-1">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Temporal Trim</Label>
                             <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-primary">
                                <Scissors className="w-3 h-3" />
                                <span>{(endTime - startTime).toFixed(1)}s Range</span>
                             </div>
                          </div>
                          <div className="px-2">
                             <Slider 
                              value={[startTime, endTime]} 
                              max={duration} 
                              step={0.1} 
                              minStepsBetweenThumbs={1}
                              onValueChange={v => { setStartTime(v[0]); setEndTime(v[1]); }} 
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-3 rounded-xl bg-secondary/50 border border-border text-center">
                                <span className="text-[8px] font-black uppercase text-foreground/20 block mb-1">Start</span>
                                <span className="text-xs font-mono font-bold">{formatTime(startTime)}</span>
                             </div>
                             <div className="p-3 rounded-xl bg-secondary/50 border border-border text-center">
                                <span className="text-[8px] font-black uppercase text-foreground/20 block mb-1">End</span>
                                <span className="text-xs font-mono font-bold">{formatTime(endTime)}</span>
                             </div>
                          </div>
                       </div>

                       {/* Quality & Format */}
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black text-foreground/40 uppercase">Quality</Label>
                             <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
                                <SelectTrigger className="h-10 bg-secondary/50 border-border text-[9px] font-black uppercase">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                   <SelectItem value="ultrafast" className="text-[9px] uppercase">Fast (Low Size)</SelectItem>
                                   <SelectItem value="medium" className="text-[9px] uppercase">Balanced</SelectItem>
                                   <SelectItem value="slow" className="text-[9px] uppercase">High Fidelity</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black text-foreground/40 uppercase">Format</Label>
                             <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                                <SelectTrigger className="h-10 bg-secondary/50 border-border text-[9px] font-black uppercase">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                   <SelectItem value="mp4" className="text-[9px] uppercase">MP4 (Universal)</SelectItem>
                                   <SelectItem value="webm" className="text-[9px] uppercase">WEBM (Optimized)</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                       </div>

                       <Button 
                        onClick={executeReverse} 
                        disabled={isProcessing}
                        className="h-16 w-full bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/30 active:scale-95"
                       >
                          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                          Synthesize Inversion
                       </Button>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 100% local processing. Video bitstreams are held in volatile memory and never transmitted to remote servers.
               </p>
             </div>
          </div>
        </div>

        {/* Workspace Monitor */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] lg:min-h-[750px] bg-black">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Master Viewport</CardTitle>
                 </div>
                 {status !== 'idle' && (
                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-3 py-1", status === 'complete' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20")}>
                       {status.toUpperCase()} protocol active
                    </Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 relative overflow-hidden bg-checkered">
                 {!file && (
                    <div className="flex flex-col items-center justify-center opacity-10 gap-6 grayscale">
                       <Film className="w-32 h-32 text-primary" />
                       <p className="text-xl font-black uppercase tracking-[0.4em]">Awaiting Media Inbound</p>
                    </div>
                 )}

                 {isProcessing && (
                   <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500 z-10">
                      <div className="relative w-32 h-32 mx-auto">
                         <div className="w-32 h-32 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <RotateCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary animate-pulse" />
                      </div>
                      <div className="space-y-4 text-center">
                         <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                            <span>Synthesizing...</span>
                            <span>{progress}%</span>
                         </div>
                         <Progress value={progress} className="h-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                         
                         <div className="mt-8 p-4 rounded-2xl bg-black/90 border border-white/10 text-left font-mono text-[9px] text-green-500/60 overflow-hidden shadow-inner h-40 flex flex-col">
                            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2 text-white/20">
                               <Terminal className="w-3 h-3" />
                               <span className="uppercase tracking-widest">WASM Pipeline Logs</span>
                            </div>
                            <div className="flex-1 overflow-auto no-scrollbar">
                               {logs.map((log, i) => <div key={i} className="truncate">&gt; {log}</div>)}
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {file && !isProcessing && (
                   <div className="w-full h-full flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
                      <div className="relative w-full max-w-2xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] border border-white/10 bg-black group/preview">
                         <video 
                          key={reversedUrl || file.name}
                          ref={previewVideoRef}
                          src={reversedUrl || URL.createObjectURL(file)} 
                          controls 
                          className="w-full h-full object-contain" 
                         />
                         <div className="absolute top-6 left-6 flex gap-2">
                            <Badge className="bg-black/60 backdrop-blur-md text-[9px] font-black uppercase px-4 border-white/10">
                               {reversedUrl ? 'Synthesized Master' : 'Source Monitor'}
                            </Badge>
                            {reversedUrl && (
                               <Badge className="bg-emerald-500/90 text-white text-[9px] font-black uppercase px-4">
                                  {formatSize(reversedSize || 0)}
                               </Badge>
                            )}
                         </div>
                      </div>
                      
                      {reversedUrl && (
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-in slide-in-from-bottom-4">
                           <Button asChild className="h-16 flex-1 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-white/10 active:scale-95 transition-all">
                              <a href={reversedUrl} download={`${file.name.replace(/\.[^/.]+$/, "")}-reversed.${format}`}>
                                 <Download className="w-5 h-5 mr-3" /> Save To Device
                              </a>
                           </Button>
                           <Button variant="outline" onClick={() => setReversedUrl(null)} className="h-16 px-10 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] rounded-2xl">
                              New Pass
                           </Button>
                        </div>
                      )}
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* History Module */}
           {history.length > 0 && (
             <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center gap-3 px-2">
                   <History className="w-5 h-5 text-primary" />
                   <h3 className="text-xl font-headline font-black uppercase text-foreground/40 tracking-tight">Recent Archives</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {history.map(item => (
                     <Card key={item.id} className="glass-card p-5 border-white/5 bg-secondary/20 hover:border-primary/20 transition-all flex flex-col gap-4 group/h">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary/40 group-hover/h:text-primary transition-colors">
                              <Film className="w-5 h-5" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-foreground truncate uppercase">{item.name}</p>
                              <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{formatSize(item.size)}</p>
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                           <span className="text-[8px] font-black text-foreground/10 uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                           <button onClick={() => setHistory(h => h.filter(i => i.id !== item.id))} className="text-foreground/10 hover:text-red-500 p-1"><X className="w-3 h-3" /></button>
                        </div>
                     </Card>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
