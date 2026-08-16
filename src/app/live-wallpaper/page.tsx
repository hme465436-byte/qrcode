"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MonitorPlay, 
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
  Smartphone,
  Monitor,
  VolumeX,
  Volume2,
  Scissors,
  Clock,
  Timer,
  Zap,
  RotateCcw,
  Layout,
  Film,
  ShieldCheck,
  Layers,
  Maximize,
  FastForward,
  Repeat,
  Tv,
  Tablet,
  Square as SquareIcon,
  Maximize2,
  AlertCircle,
  History,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  { id: 'windows-hd', label: 'Windows (16:9)', width: 1920, height: 1080, icon: Monitor },
  { id: 'ultrawide', label: 'Ultrawide (21:9)', width: 2560, height: 1080, icon: Tv },
  { id: 'iphone', label: 'iPhone (19.5:9)', width: 1179, height: 2556, icon: Smartphone },
  { id: 'phone-std', label: 'Phone (9:16)', width: 1080, height: 1920, icon: Smartphone },
  { id: 'tablet', label: 'Tablet (4:3)', width: 2048, height: 1536, icon: Tablet },
  { id: 'square', label: 'Square (1:1)', width: 1080, height: 1080, icon: SquareIcon },
];

type FitMode = 'cover' | 'contain' | 'blur-fill';
type LoopMode = 'normal' | 'boomerang';
type ExportQuality = 'high' | 'medium' | 'small';

export default function AdvancedLiveWallpaperPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Results
  const [mp4Url, setMp4Url] = useState<string | null>(null);
  const [webmUrl, setWebmUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  // Settings
  const [presetId, setPresetId] = useState('windows-hd');
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [loopMode, setLoopMode] = useState<LoopMode>('normal');
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [quality, setQuality] = useState<ExportQuality>('medium');
  
  // Timeline
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePreset = useMemo(() => DEVICE_PRESETS.find(p => p.id === presetId) || DEVICE_PRESETS[0], [presetId]);

  useEffect(() => {
    return () => {
      [mp4Url, webmUrl, gifUrl].forEach(url => url && URL.revokeObjectURL(url));
    };
  }, [mp4Url, webmUrl, gifUrl]);

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
    if (!ffmpegRef.current) ffmpegRef.current = new FFmpeg();
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => setLogs(prev => [...prev.slice(-4), message]));
    ffmpeg.on('progress', ({ progress: p }) => setProgress(Math.round(p * 100)));
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsLoaded(true);
      return true;
    } catch (err) {
      toast({ variant: "destructive", title: "Engine Failure", description: "FFmpeg load failed." });
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
      setMp4Url(null); setWebmUrl(null); setGifUrl(null);
      toast({ title: "Asset Imported", description: "Studio analyzed media container." });
    }
  };

  const handleClear = () => {
    setFile(null);
    if (mp4Url) URL.revokeObjectURL(mp4Url);
    if (webmUrl) URL.revokeObjectURL(webmUrl);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setMp4Url(null);
    setWebmUrl(null);
    setGifUrl(null);
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
    setIsProcessing(true);
    setLogs([]);
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) { setIsProcessing(false); return; }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_video';
    const w = activePreset.width;
    const h = activePreset.height;

    try {
      setStatus('Writing Payload...');
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Build Filter Chain
      let filter = '';
      if (fitMode === 'cover') {
        filter = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;
      } else if (fitMode === 'contain') {
        filter = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`;
      } else if (fitMode === 'blur-fill') {
        filter = `split[main][back];[back]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},boxblur=40:10[bg];[main]scale=${w}:${h}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
      }

      // Speed Logic
      filter += `,setpts=1/${speed}*PTS`;

      // Boomerang Logic
      if (loopMode === 'boomerang') {
        filter = `[0:v]${filter},split[v1][v2];[v2]reverse[v3];[v1][v3]concat=n=2:v=1:a=0`;
      }

      // Quality Logic
      const crf = quality === 'high' ? '18' : quality === 'medium' ? '23' : '30';
      const duration = endTime - startTime;

      // 1. Export MP4
      setStatus('Synthesizing MP4 Master...');
      const mp4Args = [
        '-ss', startTime.toFixed(2), '-t', duration.toFixed(2),
        '-i', inputName,
        '-vf', filter,
        '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', crf,
        '-pix_fmt', 'yuv420p',
        'output.mp4'
      ];
      if (isMuted) mp4Args.splice(6, 0, '-an');
      await ffmpeg.exec(mp4Args);
      const mp4Data = await ffmpeg.readFile('output.mp4');
      setMp4Url(URL.createObjectURL(new Blob([(mp4Data as any).buffer], { type: 'video/mp4' })));

      // 2. Export WebM
      setStatus('Synthesizing WebM Master...');
      await ffmpeg.exec([
        '-ss', startTime.toFixed(2), '-t', duration.toFixed(2),
        '-i', inputName, '-vf', filter, '-an',
        '-c:v', 'libvpx-vp9', '-crf', '35', '-b:v', '0',
        'output.webm'
      ]);
      const webmData = await ffmpeg.readFile('output.webm');
      setWebmUrl(URL.createObjectURL(new Blob([(webmData as any).buffer], { type: 'video/webm' })));

      // 3. Export GIF (Shortened for memory safety)
      const gifDur = Math.min(duration, 5);
      setStatus('Synthesizing GIF Preview...');
      const gifFilter = `${filter},fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
      await ffmpeg.exec([
        '-ss', startTime.toFixed(2), '-t', gifDur.toFixed(2),
        '-i', inputName, '-vf', gifFilter,
        'output.gif'
      ]);
      const gifData = await ffmpeg.readFile('output.gif');
      setGifUrl(URL.createObjectURL(new Blob([(gifData as any).buffer], { type: 'image/gif' })));

      setStatus('Production Complete');
      toast({ title: "Masters Ready", description: "All formats successfully synthesized." });
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Production Failed", description: "Internal error during re-encoding." });
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
          The ultimate hardware-specific wallpaper synthesis engine. Create perfectly calibrated, looping, high-fidelity background matrices for Windows, macOS, iPhone, and Android.
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
                  {/* Timeline Matrix */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5" /> Timeline Trim
                      </Label>
                      <span className="text-[10px] font-mono font-bold text-primary">{formatTime(startTime)} - {formatTime(endTime)}</span>
                    </div>
                    <Slider value={[startTime, endTime]} min={0} max={totalDuration} step={0.1} minStepsBetweenThumbs={1} onValueChange={(val) => { setStartTime(val[0]); setEndTime(val[1]); }} />
                  </div>

                  {/* Device Protocol */}
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Device Protocol</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {DEVICE_PRESETS.map((dev) => (
                        <button
                          key={dev.id}
                          onClick={() => setPresetId(dev.id)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                            presetId === dev.id ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <dev.icon className="w-4 h-4" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight">{dev.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Production Settings */}
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
                          <SelectItem value="blur-fill" className="text-[10px] font-black uppercase">Blur-Fill Edges</SelectItem>
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
                          <SelectItem value="boomerang" className="text-[10px] font-black uppercase">Boomerang (⇌)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Motion Speed</Label>
                      <Select value={speed.toString()} onValueChange={(v) => setSpeed(parseFloat(v))}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="0.5" className="text-[10px] font-black uppercase">0.5X (Slow)</SelectItem>
                          <SelectItem value="1" className="text-[10px] font-black uppercase">1.0X (Normal)</SelectItem>
                          <SelectItem value="1.25" className="text-[10px] font-black uppercase">1.25X (Fast)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Audio Master</Label>
                      <div className="h-12 flex items-center justify-between px-4 bg-secondary rounded-xl border border-border">
                        <span className="text-[10px] font-black uppercase text-foreground/40">Mute Stream</span>
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
                <Button variant="outline" onClick={handleClear} className="flex-1 h-16 rounded-2xl border-border bg-secondary hover:text-destructive transition-all active:scale-95">
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> Multi-Format Pipeline
                </CardTitle>
                <div className="flex gap-2">
                   <div className="px-3 py-1 rounded-lg bg-background/50 border border-border text-[9px] font-black text-foreground/40 uppercase tracking-widest">Active Render: {activePreset.width}x{activePreset.height}</div>
                </div>
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
                          <span>Synthesizing Device Matrix</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-1.5 rounded-full" />
                    </div>
                    <div className="w-full max-w-sm p-4 rounded-xl bg-black/90 border border-white/5 text-left font-mono text-[9px] text-green-500/60 overflow-hidden shadow-inner">
                      <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2"><Terminal className="w-3 h-3" /><span className="uppercase tracking-widest">FFmpeg Pipeline</span></div>
                      {logs.map((log, i) => (<div key={i} className="truncate whitespace-nowrap opacity-60">&gt; {log}</div>))}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-12 animate-in zoom-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {/* Desktop Preview Frame */}
                       <div className="space-y-6 flex flex-col items-center">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">PC Monitor Matrix</Label>
                          <div className="relative w-full aspect-video bg-zinc-900 rounded-lg p-2 shadow-2xl border-4 border-zinc-800 ring-1 ring-zinc-700">
                             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-6 bg-zinc-800 rounded-b-xl" />
                             <div className="w-full h-full rounded bg-black overflow-hidden">
                                {mp4Url && <video src={mp4Url} className="w-full h-full object-cover" autoPlay loop muted playsInline />}
                             </div>
                          </div>
                       </div>
                       {/* Phone Preview Frame */}
                       <div className="space-y-6 flex flex-col items-center">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Mobile Lock-Screen Matrix</Label>
                          <div className="relative w-40 aspect-[9/19.5] bg-zinc-900 rounded-[2.5rem] p-2 shadow-2xl border-4 border-zinc-800 ring-1 ring-zinc-700 overflow-hidden">
                             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-10" />
                             <div className="w-full h-full rounded-[1.8rem] bg-black overflow-hidden relative">
                                {mp4Url && <video src={mp4Url} className="w-full h-full object-cover" autoPlay loop muted playsInline />}
                                <div className="absolute top-12 left-0 w-full text-center text-white/80 space-y-1">
                                   <p className="text-3xl font-headline font-black">09:41</p>
                                   <p className="text-[8px] font-bold uppercase tracking-widest">Monday, March 10</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Export Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                       {[
                         { label: 'MP4 Master', url: mp4Url, icon: Film, ext: 'mp4' },
                         { label: 'WebM Optimized', url: webmUrl, icon: MonitorPlay, ext: 'webm' },
                         { label: 'GIF Preview', url: gifUrl, icon: ImageIcon, ext: 'gif' }
                       ].map((fmt) => (
                         <div key={fmt.ext} className="p-6 rounded-3xl bg-secondary border border-border space-y-6 group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  <fmt.icon className="w-5 h-5" />
                               </div>
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-black uppercase text-foreground">{fmt.label}</p>
                                  <p className="text-[8px] font-bold text-foreground/30 uppercase">{fmt.ext.toUpperCase()} Buffer</p>
                               </div>
                            </div>
                            <Button asChild className="w-full h-11 bg-primary text-white rounded-xl shadow-lg shadow-primary/10">
                               <a href={fmt.url || '#'} download={`live-wallpaper-${activePreset.id}.${fmt.ext}`}>
                                  <Download className="w-4 h-4 mr-2" /> Download
                               </a>
                            </Button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Sovereign Processing</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All re-encoding and scaling protocols execute strictly in local memory. Your visuals are never transmitted to our infrastructure.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500">
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
