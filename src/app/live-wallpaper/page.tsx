"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MonitorPlay, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  FileVideo,
  Settings2,
  Terminal,
  Activity,
  Smartphone,
  Monitor,
  VolumeX,
  Scissors,
  Clock,
  Timer,
  Zap,
  Film,
  ShieldCheck,
  Layers,
  Maximize,
  Tv,
  Tablet,
  Square as SquareIcon,
  Maximize2,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type DevicePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  icon: any;
};

const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'windows-hd', label: 'Windows (16:9)', width: 1280, height: 720, icon: Monitor },
  { id: 'ultrawide', label: 'Ultrawide (21:9)', width: 1280, height: 540, icon: Tv },
  { id: 'iphone', label: 'iPhone (19.5:9)', width: 720, height: 1560, icon: Smartphone },
  { id: 'phone-std', label: 'Phone (9:16)', width: 720, height: 1280, icon: Smartphone },
  { id: 'tablet', label: 'Tablet (4:3)', width: 1024, height: 768, icon: Tablet },
  { id: 'square', label: 'Square (1:1)', width: 720, height: 720, icon: SquareIcon },
];

type FitMode = 'cover' | 'contain' | 'blur-fill';
type LoopMode = 'normal' | 'boomerang';
type TargetFormat = 'mp4' | 'gif';

export default function AdvancedLiveWallpaperPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Results
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Settings
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('mp4');
  const [presetId, setPresetId] = useState('windows-hd');
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [loopMode, setLoopMode] = useState<LoopMode>('normal');
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  
  // Timeline
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePreset = useMemo(() => DEVICE_PRESETS.find(p => p.id === presetId) || DEVICE_PRESETS[0], [presetId]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setStatus('Initializing Engine...');
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    if (!ffmpegRef.current) {
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
        description: "Failed to load FFmpeg. SharedArrayBuffer may be restricted." 
      });
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setTotalDuration(video.duration);
        setEndTime(Math.min(video.duration, 15));
        setStartTime(0);
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setResultUrl(null);
      toast({ title: "Asset Imported", description: "Studio analyzed media container." });
    }
  };

  const handleClear = () => {
    setFile(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    setTotalDuration(0);
    setStartTime(0);
    setEndTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "All buffers cleared." });
  };

  const processWallpaper = async () => {
    if (!file) return;

    // Strict validation
    if (endTime - startTime > 15) {
      toast({ variant: "destructive", title: "Duration Overload", description: "Maximum 15 seconds allowed for stability." });
      return;
    }

    setIsProcessing(true);
    setResultUrl(null);
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_payload';
    const outputName = `output_master.${targetFormat === 'mp4' ? 'mp4' : 'gif'}`;
    const w = activePreset.width;
    const h = activePreset.height;

    try {
      setStatus('Writing Payload...');
      const fileData = new Uint8Array(await file.arrayBuffer());
      await ffmpeg.writeFile(inputName, fileData);

      let duration = endTime - startTime;
      
      // Build Filter Chain
      let filter = '';
      if (fitMode === 'cover') {
        filter = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;
      } else if (fitMode === 'contain') {
        filter = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`;
      } else if (fitMode === 'blur-fill') {
        filter = `split[main][back];[back]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},boxblur=40:10[bg];[main]scale=${w}:${h}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
      }

      filter += `,setpts=1/${speed}*PTS`;

      if (loopMode === 'boomerang') {
        filter = `[0:v]${filter},split[v1][v2];[v2]reverse[v3];[v1][v3]concat=n=2:v=1:a=0`;
      }

      if (targetFormat === 'mp4') {
        setStatus('Synthesizing MP4 Master...');
        const args = [
          '-ss', startTime.toFixed(2), '-t', duration.toFixed(2),
          '-i', inputName,
          '-vf', filter,
          '-r', '24',
          '-c:v', 'libx264', '-crf', '28', '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          outputName
        ];
        if (isMuted) args.splice(6, 0, '-an');
        await ffmpeg.exec(args);
      } else {
        // GIF Specific Caps
        const gifDur = Math.min(duration, 5);
        const gifFilter = `${filter},fps=8,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
        setStatus('Synthesizing GIF Matrix...');
        await ffmpeg.exec([
          '-ss', startTime.toFixed(2), '-t', gifDur.toFixed(2),
          '-i', inputName,
          '-vf', gifFilter,
          outputName
        ]);
      }

      setStatus('Extracting Master...');
      const data = await ffmpeg.readFile(outputName);
      setResultUrl(URL.createObjectURL(new Blob([(data as any).buffer], { type: targetFormat === 'mp4' ? 'video/mp4' : 'image/gif' })));
      
      // Aggressive Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      setStatus('Production Complete');
      toast({ title: "Master Ready", description: `${targetFormat.toUpperCase()} successfully synthesized.` });
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('memory access out of bounds')) {
        toast({ 
          variant: "destructive", 
          title: "Memory Overload", 
          description: "Video too large. Use a shorter clip (under 15s) or lower complexity." 
        });
        setIsLoaded(false); // Force reload next time
      } else {
        toast({ variant: "destructive", title: "Production Failed", description: "Internal error during re-encoding." });
      }
      setStatus('Process Aborted');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MonitorPlay className="w-3.5 h-3.5" /> Media Suite Pro
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight">
          Live <span className="text-primary italic">Wallpaper Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-3xl leading-relaxed">
          Create perfectly calibrated, looping, high-fidelity background matrices. enforce a 15-second cap for 100% stable local production.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Editor Controls */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Production Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Asset Intake</Label>
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-48 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                    file && "border-solid border-primary/20",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {file ? (
                    <div className="text-center p-8 space-y-3">
                       <Film className="w-12 h-12 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(1)} MB | {totalDuration.toFixed(1)}s</p>
                    </div>
                  ) : (
                    <>
                       <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover/upload:text-primary transition-all mb-4 shadow-xl">
                          <Upload className="w-8 h-8" />
                       </div>
                       <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Import Video Payload</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileChange} className="hidden" />
              </div>

              {file && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Export Mode</Label>
                    <div className="grid grid-cols-2 gap-3">
                       <button
                        onClick={() => setTargetFormat('mp4')}
                        className={cn("h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", targetFormat === 'mp4' ? "bg-primary text-white" : "bg-background border-border text-foreground/40")}
                       >
                         <Film className="w-3.5 h-3.5" /> MP4 Master
                       </button>
                       <button
                        onClick={() => setTargetFormat('gif')}
                        className={cn("h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", targetFormat === 'gif' ? "bg-primary text-white" : "bg-background border-border text-foreground/40")}
                       >
                         <ImageIcon className="w-3.5 h-3.5" /> GIF Clip
                       </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5" /> Timeline Trim (Max 15s)
                      </Label>
                      <span className="text-[10px] font-mono font-bold text-primary">{formatTime(startTime)} - {formatTime(endTime)}</span>
                    </div>
                    <Slider value={[startTime, endTime]} min={0} max={totalDuration} step={0.1} onValueChange={(val) => { setStartTime(val[0]); setEndTime(val[1]); }} />
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Device Protocol</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {DEVICE_PRESETS.map((dev) => (
                        <button
                          key={dev.id}
                          onClick={() => setPresetId(dev.id)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                            presetId === dev.id ? "bg-primary text-white border-primary shadow-xl" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <dev.icon className="w-4 h-4" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight">{dev.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Fit Mode</Label>
                      <Select value={fitMode} onValueChange={(v: any) => setFitMode(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="cover" className="text-[10px] font-black uppercase">Cover (Fill)</SelectItem>
                          <SelectItem value="contain" className="text-[10px] font-black uppercase">Contain (Fit)</SelectItem>
                          <SelectItem value="blur-fill" className="text-[10px] font-black uppercase">Blur-Fill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Loop Mode</Label>
                      <Select value={loopMode} onValueChange={(v: any) => setLoopMode(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="normal" className="text-[10px] font-black uppercase">Normal Loop</SelectItem>
                          <SelectItem value="boomerang" className="text-[10px] font-black uppercase">Boomerang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Speed</Label>
                      <Select value={speed.toString()} onValueChange={(v) => setSpeed(parseFloat(v))}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="0.5" className="text-[10px] font-black uppercase">0.5X</SelectItem>
                          <SelectItem value="1" className="text-[10px] font-black uppercase">1.0X</SelectItem>
                          <SelectItem value="1.25" className="text-[10px] font-black uppercase">1.25X</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Audio</Label>
                      <div className="h-12 flex items-center justify-between px-4 bg-secondary rounded-xl border border-border">
                        <VolumeX className="w-4 h-4 text-foreground/40" />
                        <Switch checked={isMuted} onCheckedChange={setIsMuted} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <Button 
                  onClick={processWallpaper}
                  disabled={!file || isProcessing}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Synthesize Master
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={isProcessing} className="flex-1 h-16 rounded-2xl border-border bg-secondary hover:text-destructive transition-all active:scale-95">
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Previews & Downloads */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stability Pipeline
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-background/50 border border-border text-[9px] font-black text-foreground/40 uppercase tracking-widest">Target: {targetFormat.toUpperCase()} ({activePreset.width}x{activePreset.height})</div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6 sm:p-12 bg-[#060608]">
               {!file && !isProcessing ? (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                    <Activity className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                 </div>
               ) : isProcessing ? (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                    <div className="relative">
                       <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 w-full max-w-sm">
                       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                          <span>Synthesizing Matrix...</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-1.5 rounded-full" />
                    </div>
                    <div className="w-full max-w-sm p-4 rounded-xl bg-black/90 border border-white/5 text-left font-mono text-[9px] text-green-500/60 overflow-hidden shadow-inner">
                      <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2"><Terminal className="w-3 h-3" /><span className="uppercase tracking-widest">WASM Logs</span></div>
                      {logs.map((log, i) => (<div key={i} className="truncate whitespace-nowrap opacity-60">&gt; {log}</div>))}
                    </div>
                 </div>
               ) : resultUrl ? (
                 <div className="space-y-12 animate-in zoom-in duration-700">
                    <div className="flex flex-col items-center">
                       <div className="relative w-full max-w-lg aspect-video bg-zinc-900 rounded-3xl p-4 shadow-2xl border-4 border-zinc-800 ring-1 ring-zinc-700 overflow-hidden">
                          <div className="w-full h-full rounded-2xl bg-black overflow-hidden relative">
                             {targetFormat === 'mp4' ? (
                               <video src={resultUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                             ) : (
                               <img src={resultUrl} alt="GIF Result" className="w-full h-full object-cover" />
                             )}
                          </div>
                       </div>
                       
                       <div className="mt-12 w-full max-w-lg space-y-6">
                          <Button asChild className="w-full h-16 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
                             <a href={resultUrl} download={`wallpaper-${activePreset.id}.${targetFormat}`}>
                                <Download className="w-6 h-6 mr-3" /> Download {targetFormat.toUpperCase()} Master
                             </a>
                          </Button>
                          <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-4">
                             <Info className="w-5 h-5 text-primary mt-1 shrink-0" />
                             <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                               To use: Import this file into Windows (Lively / Wallpaper Engine) or use as a Live Wallpaper on mobile devices.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                    <Maximize className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Configure Sequence</p>
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Memory Guard</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our studio implements clinical memory release cycles. Bitstreams are definitively purged from the WASM heap immediately after extraction.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware-Native Master</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Optimized for H.264 Main Profile ensuring hardware acceleration compatibility across modern GPUs and mobile chipsets.
                  </p>
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
        .dark .bg-checkered {
           background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

