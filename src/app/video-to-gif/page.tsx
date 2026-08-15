"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Video, 
  Image as ImageIcon, 
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
  Scissors,
  Clock,
  Timer,
  AlertTriangle,
  Film,
  Layers,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoToGifPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [fps, setFps] = useState('10');
  const [width, setWidth] = useState('480');
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [gifUrl]);

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadFFmpeg = async () => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setStatus('Initializing FFmpeg Engine...');
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
        description: "Failed to load FFmpeg. Ensure your browser supports SharedArrayBuffer." 
      });
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Videos over 50MB may slow down the browser." });
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setTotalDuration(video.duration);
        setEndTime(Math.min(video.duration, 10)); // Default to first 10s for stability
        setStartTime(0);
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);

      setFile(selectedFile);
      setGifUrl(null);
      setProgress(0);
      setStatus('');
      setLogs([]);
      toast({ title: "Asset Imported", description: "Studio analyzed media container." });
    }
  };

  const convertToGif = async () => {
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
    const outputName = 'output.gif';

    try {
      setStatus('Writing Payload to Memory...');
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus('Synthesizing GIF Matrix...');
      
      // Professional GIF generation: 
      // 1. Generate a palette based on the video content
      // 2. Use the palette to generate the GIF (best quality)
      const duration = endTime - startTime;
      const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

      await ffmpeg.exec([
        '-ss', startTime.toFixed(2),
        '-t', duration.toFixed(2),
        '-i', inputName,
        '-vf', filter,
        outputName
      ]);

      setStatus('Finalizing Production...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'image/gif' }));
      
      setGifUrl(url);
      setProgress(100);
      setStatus('Production Complete');
      toast({ title: "GIF Master Exported", description: "Asset synthesized successfully." });
    } catch (err: any) {
      console.error('GIF Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "An error occurred during GIF synthesis. The range may be too long." 
      });
      setStatus('Synthesis Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    setTotalDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory purged and fields cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Film className="w-3.5 h-3.5" /> Animation Studio
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Video to <span className="text-primary italic">GIF Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional-grade GIF synthesis. Convert MP4 or WebM clips into optimized, high-fidelity animated GIFs entirely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Card */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                Media Configuration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/40",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {file ? (
                    <div className="text-center p-6 space-y-2">
                       <FileVideo className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(1)} MB Detected</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center">Import Video Asset<br /><span className="text-[8px] opacity-60">MP4, WEBM</span></p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="video/mp4,video/webm" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {file && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Scissors className="w-3 h-3 text-primary" /> Trim Range Matrix
                      </Label>
                      <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-lg">Selected: {(endTime - startTime).toFixed(1)}s</span>
                    </div>

                    <div className="px-2">
                       <Slider 
                        value={[startTime, endTime]} 
                        min={0} 
                        max={totalDuration} 
                        step={0.1} 
                        onValueChange={(val) => {
                          setStartTime(val[0]);
                          setEndTime(val[1]);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-foreground/30 ml-1">Start Mark</p>
                          <div className="h-12 bg-secondary rounded-xl border border-border flex items-center px-4 font-mono text-xs font-bold">
                             {formatSeconds(startTime)}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-foreground/30 ml-1">End Mark</p>
                          <div className="h-12 bg-secondary rounded-xl border border-border flex items-center px-4 font-mono text-xs font-bold">
                             {formatSeconds(endTime)}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary" /> Frame Rate (FPS)
                      </Label>
                      <Select value={fps} onValueChange={setFps}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="8" className="text-xs font-bold uppercase">8 FPS (Eco)</SelectItem>
                          <SelectItem value="10" className="text-xs font-bold uppercase">10 FPS (Standard)</SelectItem>
                          <SelectItem value="12" className="text-xs font-bold uppercase">12 FPS (Smooth)</SelectItem>
                          <SelectItem value="15" className="text-xs font-bold uppercase">15 FPS (Master)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Maximize className="w-3 h-3 text-primary" /> Width Protocol
                      </Label>
                      <Select value={width} onValueChange={setWidth}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="320" className="text-xs font-bold uppercase">320px (Mobile)</SelectItem>
                          <SelectItem value="480" className="text-xs font-bold uppercase">480px (Standard)</SelectItem>
                          <SelectItem value="640" className="text-xs font-bold uppercase">640px (Desktop)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-4">
                     <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                     <p className="text-[9px] text-yellow-600/70 font-bold uppercase leading-relaxed tracking-wider">
                       Warning: Long durations (&gt;10s) or high widths will significantly increase synthesis time and file size.
                     </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={convertToGif}
                  disabled={!file || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Generate GIF
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

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Production Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our studio utilizes a two-pass palette generation algorithm to ensure the highest visual fidelity with 256 optimized colors. Processing occurs 100% locally.
              </p>
            </div>
          </div>
        </div>

        {/* Output Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Studio Preview
                </CardTitle>
                {gifUrl && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">Master Ready</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="relative group/output min-h-[300px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!gifUrl && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {status}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="mt-4 p-4 rounded-xl bg-black/90 border border-white/10 text-left font-mono text-[9px] text-green-500/80 overflow-hidden shadow-inner">
                      <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2 text-white/40">
                        <Terminal className="w-3 h-3" />
                        <span className="uppercase tracking-widest">FFmpeg Output</span>
                      </div>
                      {logs.map((log, i) => (
                        <div key={i} className="truncate whitespace-nowrap opacity-70">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gifUrl && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-white/5 p-4">
                      <img src={gifUrl} alt="Synthesized GIF" className="w-full h-auto mx-auto rounded-lg" />
                    </div>
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={gifUrl} download={`master-clip-${Date.now()}.gif`}>
                        <Download className="w-6 h-6" />
                        Download GIF
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                <Layers className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Bitstream Quality</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Automatic Lanczos filtering applied for superior edge definition.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
