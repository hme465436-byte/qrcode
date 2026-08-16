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
  Film
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

type TargetDevice = 'pc' | 'phone-portrait' | 'phone-landscape';
type FitMode = 'cover' | 'contain';

export default function LiveWallpaperPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [targetDevice, setTargetDevice] = useState<TargetDevice>('pc');
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [isMuted, setIsMuted] = useState(true);
  const [durationLimit, setDurationLimit] = useState<'full' | '5' | '10' | '15'>('full');
  
  // Media Meta
  const [totalDuration, setTotalDuration] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (wallpaperUrl) URL.revokeObjectURL(wallpaperUrl);
    };
  }, [wallpaperUrl]);

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
        description: "Failed to load FFmpeg. Ensure SharedArrayBuffer is enabled in your browser." 
      });
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Videos over 50MB may impact performance." });
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setTotalDuration(video.duration);
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);

      setFile(selectedFile);
      setWallpaperUrl(null);
      setProgress(0);
      setStatus('');
      setLogs([]);
      toast({ title: "Asset Imported", description: "Studio analyzed media container." });
    }
  };

  const processWallpaper = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const inputName = 'input_video';
    const outputName = `wallpaper-${targetDevice}.mp4`;

    try {
      setStatus('Writing Payload...');
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus('Synthesizing Matrix...');
      
      // Target Dimensions
      let w = 1920;
      let h = 1080;
      if (targetDevice === 'phone-portrait') {
        w = 1080; h = 1920;
      } else if (targetDevice === 'phone-landscape') {
        w = 1920; h = 1080;
      }

      // Filter Logic
      let filter = '';
      if (fitMode === 'cover') {
        filter = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;
      } else {
        filter = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`;
      }

      const args = [
        '-i', inputName,
        '-vf', filter,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-profile:v', 'main',
        '-level', '3.1',
        '-pix_fmt', 'yuv420p'
      ];

      if (isMuted) args.push('-an');
      
      if (durationLimit !== 'full') {
        args.push('-t', durationLimit);
      }

      args.push(outputName);
      
      await ffmpeg.exec(args);

      setStatus('Finalizing Master...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'video/mp4' }));
      
      setWallpaperUrl(url);
      setProgress(100);
      setStatus('Production Complete');
      toast({ title: "Wallpaper Ready", description: "Looping master successfully synthesized." });
    } catch (err: any) {
      console.error('FFmpeg Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "Internal error during re-encoding. Try a shorter duration." 
      });
      setStatus('Process Aborted');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (wallpaperUrl) URL.revokeObjectURL(wallpaperUrl);
    setWallpaperUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    setTotalDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers and project memory purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MonitorPlay className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Live <span className="text-primary italic">Wallpaper Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional browser-side wallpaper synthesis. Transform any video into a perfectly calibrated looping background for your PC or Mobile device with zero server transmission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Asset Intake</Label>
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
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(1)} MB | {totalDuration.toFixed(1)}s</p>
                       </div>
                    </div>
                  ) : (
                    <>
                       <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover/upload:text-primary transition-all mb-4 shadow-xl">
                          <Upload className="w-8 h-8" />
                       </div>
                       <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest group-hover/upload:text-primary transition-colors">Import Video Payload</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileChange} className="hidden" />
              </div>

              {file && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Target Device Protocol</Label>
                    <div className="grid grid-cols-1 gap-3">
                       {[
                         { id: 'pc', label: 'PC Desktop (16:9)', icon: Monitor, res: '1920 × 1080' },
                         { id: 'phone-portrait', label: 'Phone Portrait (9:16)', icon: Smartphone, res: '1080 × 1920' },
                         { id: 'phone-landscape', label: 'Phone Landscape (16:9)', icon: Smartphone, res: '1920 × 1080' },
                       ].map((dev) => (
                         <button
                           key={dev.id}
                           onClick={() => setTargetDevice(dev.id as TargetDevice)}
                           className={cn(
                             "flex items-center justify-between p-5 rounded-2xl border transition-all",
                             targetDevice === dev.id ? "bg-primary text-white border-primary shadow-xl scale-[1.02]" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                           )}
                         >
                            <div className="flex items-center gap-4">
                               <dev.icon className="w-5 h-5" />
                               <div className="text-left">
                                  <p className="text-[10px] font-black uppercase tracking-widest">{dev.label}</p>
                                  <p className={cn("text-[9px] font-bold uppercase mt-0.5", targetDevice === dev.id ? "text-white/60" : "text-foreground/20")}>{dev.res} HD</p>
                               </div>
                            </div>
                            {targetDevice === dev.id && <CheckCircle2 className="w-4 h-4" />}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Scaling Logic</Label>
                      <Select value={fitMode} onValueChange={(v: any) => setFitMode(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="cover" className="text-[10px] font-black uppercase">Cover (Fill)</SelectItem>
                          <SelectItem value="contain" className="text-[10px] font-black uppercase">Contain (Fit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Max Duration</Label>
                      <Select value={durationLimit} onValueChange={(v: any) => setDurationLimit(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="full" className="text-[10px] font-black uppercase">Full Original</SelectItem>
                          <SelectItem value="5" className="text-[10px] font-black uppercase">First 5 Seconds</SelectItem>
                          <SelectItem value="10" className="text-[10px] font-black uppercase">First 10 Seconds</SelectItem>
                          <SelectItem value="15" className="text-[10px] font-black uppercase">First 15 Seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary">
                           {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[10px] font-black uppercase text-foreground/60">Audio Suppression</p>
                           <p className="text-[8px] font-bold text-foreground/20 uppercase">Recommended for wallpapers</p>
                        </div>
                     </div>
                     <Switch checked={isMuted} onCheckedChange={setIsMuted} />
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
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Section - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Production pipeline
                </CardTitle>
                {wallpaperUrl && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">Master Ready</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-8 sm:p-12">
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
                          <span>Rendering Device Matrix</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-1.5 rounded-full" />
                    </div>
                    
                    <div className="w-full max-w-sm p-4 rounded-xl bg-black/90 border border-white/5 text-left font-mono text-[9px] text-green-500/60 overflow-hidden shadow-inner">
                      <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                        <Terminal className="w-3 h-3" />
                        <span className="uppercase tracking-widest">FFmpeg Pipeline</span>
                      </div>
                      {logs.map((log, i) => (
                        <div key={i} className="truncate whitespace-nowrap opacity-60">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                 </div>
               ) : wallpaperUrl ? (
                 <div className="space-y-10 animate-in zoom-in duration-700 w-full flex flex-col items-center">
                    <div className={cn(
                      "relative rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black/20 group/preview",
                      targetDevice === 'phone-portrait' ? "w-64 aspect-[9/16]" : "w-full max-w-lg aspect-video"
                    )}>
                       <video 
                        src={wallpaperUrl} 
                        className="w-full h-full object-contain" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                       />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <Maximize className="w-10 h-10 text-white/40" />
                       </div>
                    </div>

                    <div className="w-full max-w-lg space-y-6">
                       <Button 
                        asChild
                        className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-3xl flex items-center justify-center gap-6 text-xl shadow-2xl shadow-primary/30 transition-all active:scale-95 group/dl"
                      >
                        <a href={wallpaperUrl} download={`wallpaper-${targetDevice}-${Date.now()}.mp4`}>
                          <Download className="w-8 h-8 group-hover:translate-y-1 transition-transform" />
                          Export {targetDevice.toUpperCase()} Master
                        </a>
                      </Button>

                      <div className="p-8 rounded-[2.5rem] bg-secondary border border-border space-y-6">
                         <div className="flex items-center gap-4 text-primary">
                            <Info className="w-5 h-5" />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Implementation Protocol</h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] text-foreground/40 font-medium leading-relaxed uppercase">
                            <div>
                               <span className="text-foreground font-black block mb-1">Windows OS</span>
                               Use <span className="text-primary font-bold">Lively Wallpaper</span> or Wallpaper Engine to set this MP4 as your background.
                            </div>
                            <div>
                               <span className="text-foreground font-black block mb-1">Mobile OS</span>
                               Set directly via Gallery or use a <span className="text-primary font-bold">Live Wallpaper</span> app from your respective store.
                            </div>
                         </div>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                    <MonitorPlay className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Media Payload</p>
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
