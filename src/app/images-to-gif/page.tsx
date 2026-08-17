"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Film, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  FileImage,
  ArrowUp,
  ArrowDown,
  Settings2,
  Terminal,
  Activity,
  X,
  Plus,
  Zap,
  Maximize,
  Clock,
  Repeat,
  Layers,
  Scaling,
  Image as ImageIcon,
  Play,
  Monitor,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface FrameItem {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
}

export default function ImagesToGifPage() {
  const { toast } = useToast();
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [delay, setDelay] = useState(500); // ms per frame
  const [loop, setLoop] = useState(true);
  const [width, setWidth] = useState('480');

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      frames.forEach(f => URL.revokeObjectURL(f.url));
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [frames, gifUrl]);

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
        description: "Failed to load FFmpeg. Check your connection or hardware." 
      });
      return false;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (frames.length + selectedFiles.length > 30) {
      toast({ variant: "destructive", title: "Capacity Limit", description: "Studio supports a maximum of 30 frames per animation." });
      return;
    }

    const newFrames: FrameItem[] = selectedFiles.map(file => {
      if (file.size > 8 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: `${file.name} exceeds 8MB limit.` });
      }
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };
    });

    setFrames(prev => [...prev, ...newFrames]);
    setGifUrl(null);
    toast({ title: "Assets Injected", description: `Added ${newFrames.length} frames to the pipeline.` });
    if (e.target) e.target.value = '';
  };

  const removeFrame = (id: string) => {
    setFrames(prev => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const moveFrame = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === frames.length - 1) return;
    const next = [...frames];
    const target = direction === 'up' ? index - 1 : index + 1;
    [next[index], next[target]] = [next[target], next[index]];
    setFrames(next);
  };

  const generateGif = async () => {
    if (frames.length < 2) {
      toast({ variant: "destructive", title: "Sequence Incomplete", description: "Provide at least 2 photos for animation." });
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    
    const ready = await loadFFmpeg();
    if (!ready || !ffmpegRef.current) {
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const outputName = `master_${Date.now()}.gif`;

    try {
      setStatus('Writing Frame Matrix...');
      // Use sequential naming for FFmpeg globbing
      for (let i = 0; i < frames.length; i++) {
        const frameName = `frame_${i.toString().padStart(3, '0')}.jpg`;
        await ffmpeg.writeFile(frameName, await fetchFile(frames[i].file));
      }

      setStatus('Synthesizing Animation...');
      
      // Calculate FPS from delay (ms)
      const fps = (1000 / delay).toFixed(2);
      
      // FFmpeg GIF Recipe: 
      // 1. Input image sequence
      // 2. Scale and create palette
      // 3. Apply palette for best quality
      const scaleFilter = width === 'original' ? '' : `scale=${width}:-1:flags=lanczos,`;
      const filterChain = `${scaleFilter}split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

      await ffmpeg.exec([
        '-framerate', fps,
        '-i', 'frame_%03d.jpg',
        '-vf', filterChain,
        '-loop', loop ? '0' : '-1',
        outputName
      ]);

      setStatus('Finalizing Master...');
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'image/gif' }));
      
      setGifUrl(url);
      setProgress(100);
      setStatus('Production Complete');
      toast({ title: "GIF Ready", description: "High-fidelity animation exported." });

      // Cleanup virtual FS
      for (let i = 0; i < frames.length; i++) {
        await ffmpeg.deleteFile(`frame_${i.toString().padStart(3, '0')}.jpg`);
      }
      await ffmpeg.deleteFile(outputName);
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Synthesis Failed", description: "Matrix error during encoding." });
      setStatus('Aborted');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    frames.forEach(f => URL.revokeObjectURL(f.url));
    setFrames([]);
    setGifUrl(null);
    setProgress(0);
    setStatus('');
    setLogs([]);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Film className="w-3.5 h-3.5" /> Animation Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Images to <span className="text-primary italic">GIF Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade sequence synthesis. Convert photo sets into high-fidelity animated GIFs with precision timing and automated palette optimization.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="images-to-gif" />
              {frames.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Preview Pane */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[650px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" /> Master Monitor
                </CardTitle>
                {frames.length > 0 && (
                   <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase">
                      {frames.length} Frame Matrix
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                {!gifUrl && !isProcessing ? (
                  <div className="flex flex-col items-center justify-center opacity-10 gap-6">
                     <ImageIcon className="w-20 h-20 text-primary" />
                     <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Frame Injection</p>
                  </div>
                ) : isProcessing ? (
                  <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative w-28 h-28 mx-auto">
                       <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 text-center">
                       <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                          <span>Synthesizing Matrix...</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-1.5 rounded-full" />
                       <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest animate-pulse">{status}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative group/master max-w-full h-full flex items-center justify-center">
                    <img 
                      src={gifUrl!} 
                      alt="Animated Output" 
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10" 
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Master Ready</div>
                  </div>
                )}
             </CardContent>
          </Card>

          {/* Asset Pipeline - Horizontal Scroll on Mobile */}
          {frames.length > 0 && (
            <div className="space-y-4">
               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Sequence Management</Label>
               <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                  {frames.map((f, i) => (
                    <div key={f.id} className="min-w-[140px] aspect-[4/5] bg-secondary/50 rounded-[2rem] border border-border overflow-hidden relative group/item snap-start shrink-0">
                       <img src={f.url} alt="Frame" className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                       
                       <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[8px] font-black uppercase">F.{i + 1}</div>
                       
                       <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-y-4 group-hover/item:translate-y-0">
                          <div className="flex gap-1.5">
                             <button onClick={() => moveFrame(i, 'up')} disabled={i === 0} className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-all disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
                             <button onClick={() => moveFrame(i, 'down')} disabled={i === frames.length - 1} className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-all disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
                             <button onClick={() => removeFrame(f.id)} className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                       </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="min-w-[140px] aspect-[4/5] rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-secondary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group/add"
                  >
                     <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground/10 group-hover/add:text-primary transition-all border border-border shadow-lg">
                        <Plus className="w-5 h-5" />
                     </div>
                     <span className="text-[8px] font-black uppercase text-foreground/30 group-hover/add:text-primary">Add Frames</span>
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 <div className="space-y-4">
                    <div 
                      onClick={() => !isProcessing && fileInputRef.current?.click()}
                      className={cn(
                        "relative h-16 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 flex items-center justify-center bg-white/2 transition-all cursor-pointer overflow-hidden",
                        frames.length > 0 && "border-solid border-primary/20"
                      )}
                    >
                      <ImageIcon className="w-4 h-4 text-white/10 mr-3" />
                      <span className="text-[9px] font-black uppercase text-white/30">{frames.length > 0 ? 'Inject More Frames' : 'Import Photo Set'}</span>
                      <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                    </div>
                    {frames.length > 0 && (
                      <p className="text-center text-[8px] font-bold text-foreground/20 uppercase tracking-widest">
                         {frames.length} / 30 cells occupied
                      </p>
                    )}
                 </div>

                 {frames.length > 0 && (
                    <div className="space-y-10 animate-in zoom-in duration-500">
                       <div className="space-y-6">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                             <Label className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary" /> Frame Delay</Label>
                             <span className="text-primary font-mono">{delay}ms</span>
                          </div>
                          <Slider value={[delay]} min={50} max={2000} step={50} onValueChange={v => setDelay(v[0])} />
                       </div>

                       <div className="space-y-4">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Resolution Protocol</Label>
                          <div className="grid grid-cols-3 gap-2">
                             {['480', '720', 'original'].map(w => (
                               <button
                                key={w}
                                onClick={() => setWidth(w)}
                                className={cn(
                                  "h-11 rounded-xl border text-[8px] font-black uppercase transition-all",
                                  width === w ? "bg-primary text-white border-primary shadow-lg" : "bg-white/5 border-white/5 text-white/40 hover:text-primary"
                                )}
                               >
                                 {w === 'original' ? 'Native' : `${w}px`}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="flex items-center justify-between p-6 rounded-[2rem] bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-4">
                             <Repeat className="w-4 h-4 text-primary" />
                             <div>
                                <p className="text-[10px] font-black uppercase text-foreground">Loop Protocol</p>
                                <p className="text-[8px] font-bold text-foreground/30 uppercase">Eternal Playback</p>
                             </div>
                          </div>
                          <Switch checked={loop} onCheckedChange={setLoop} />
                       </div>

                       <div className="pt-4 flex flex-col gap-3">
                          <Button onClick={generateGif} disabled={frames.length < 2 || isProcessing} className="h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">
                             {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                             Download
                          </Button>
                          {gifUrl && (
                             <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 bg-secondary text-foreground font-black uppercase tracking-widest text-[10px] shadow-xl">
                                <a href={gifUrl} download={`animation-master-${Date.now()}.gif`}>
                                   <Download className="w-4 h-4 mr-2" /> Download GIF
                                </a>
                          </Button>
                          )}
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">WASM SANDBOX PRODUCTION</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our studio utilizes hardware-native palette generation for 100% browser-side synthesis. Your photos never touch a remote server, ensuring absolute user data sovereignty.
                  </p>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
