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
  ArrowUp,
  ArrowDown,
  Settings2,
  X,
  Plus,
  Zap,
  Clock,
  Repeat,
  Layers,
  Maximize,
  Image as ImageIcon,
  Activity,
  ShieldCheck,
  AlertCircle
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
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- GIF Engine Matrix ---
// Note: Using gifshot for main-thread reliable encoding without SharedArrayBuffer requirements.
import gifshot from 'gifshot';

interface FrameItem {
  id: string;
  file: File;
  url: string;
  name: string;
  width: number;
  height: number;
}

export default function ImagesToGifPage() {
  const { toast } = useToast();
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  
  // Settings
  const [delay, setDelay] = useState(300); // ms per frame
  const [loop, setLoop] = useState(true);
  const [width, setWidth] = useState('480');
  
  // Preview Logic
  const [previewIndex, setPreviewIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation Cycle Protocol
  useEffect(() => {
    if (frames.length > 1 && !isProcessing) {
      const timer = setInterval(() => {
        setPreviewIndex((prev) => (prev + 1) % frames.length);
      }, delay);
      return () => clearInterval(timer);
    }
  }, [frames.length, delay, isProcessing]);

  useEffect(() => {
    return () => {
      frames.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, [frames]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (frames.length + selectedFiles.length > 30) {
      toast({ variant: "destructive", title: "Capacity Overload", description: "Studio supports a maximum of 30 frames per animation." });
      return;
    }

    const loaders = selectedFiles.map(file => {
      return new Promise<FrameItem>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              file,
              url,
              name: file.name,
              width: img.width,
              height: img.height
            });
          };
          img.src = url;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders).then(loadedFrames => {
      setFrames(prev => [...prev, ...loadedFrames]);
      toast({ title: "Signal Injected", description: `Added ${loadedFrames.length} frames to the pipeline.` });
    });

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

  const handleDownload = async () => {
    if (frames.length < 2) {
      toast({ variant: "destructive", title: "Sequence Incomplete", description: "Provide at least 2 frames for animation." });
      return;
    }

    setIsProcessing(true);
    setStatus('Synthesizing Matrix...');
    setProgress(0);

    const firstFrame = frames[0];
    const targetWidth = width === 'original' ? firstFrame.width : parseInt(width);
    const targetHeight = width === 'original' ? firstFrame.height : (firstFrame.height / firstFrame.width) * targetWidth;

    try {
      gifshot.createGIF({
        images: frames.map(f => f.url),
        interval: delay / 1000,
        gifWidth: targetWidth,
        gifHeight: targetHeight,
        numFrames: frames.length,
        loop: loop ? 0 : 1,
        sampleInterval: 10,
        progressCallback: (p) => setProgress(Math.round(p * 100))
      }, (obj: any) => {
        if (!obj.error) {
          const link = document.createElement('a');
          link.href = obj.image;
          link.download = `mykit-animation-${Date.now()}.gif`;
          link.click();
          toast({ title: "Master Exported", description: "GIF saved to local storage." });
        } else {
          throw new Error(obj.errorMsg || "Encoding failure");
        }
        setIsProcessing(false);
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Production Failed", description: "Internal matrix error during synthesis." });
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFrames([]);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Film className="w-3.5 h-3.5" /> Animation Studio
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
                   <Activity className="w-3.5 h-3.5" /> LIVE MASTER MONITOR
                </CardTitle>
                {frames.length > 0 && (
                   <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase">
                      {frames.length} Frame Matrix
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                {!frames.length && !isProcessing ? (
                  <div className="flex flex-col items-center justify-center opacity-10 gap-6">
                     <ImageIcon className="w-20 h-20 text-primary" />
                     <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Frame Injection</p>
                  </div>
                ) : (
                  <div className="relative group/master max-w-full h-full flex items-center justify-center">
                    <img 
                      src={frames[previewIndex]?.url} 
                      alt="Animation Preview" 
                      className={cn(
                        "max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10 transition-all duration-300",
                        isProcessing && "blur-md opacity-50"
                      )} 
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-40 bg-black/40 backdrop-blur-sm rounded-xl">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-4 text-center w-full max-w-[200px]">
                           <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                              <span>Encoding...</span>
                              <span>{progress}%</span>
                           </div>
                           <Progress value={progress} className="h-1 rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
             </CardContent>
          </Card>

          {/* Asset Pipeline */}
          {frames.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Sequence Management</Label>
               <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                  {frames.map((f, i) => (
                    <div key={f.id} className={cn(
                      "min-w-[140px] aspect-[4/5] bg-secondary/50 rounded-[2rem] border overflow-hidden relative group/item snap-start shrink-0 transition-all",
                      previewIndex === i ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border"
                    )}>
                       <img src={f.url} alt="Frame" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                          <div className="flex gap-1.5">
                             <button onClick={() => moveFrame(i, 'up')} disabled={i === 0} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-primary transition-all disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
                             <button onClick={() => moveFrame(i, 'down')} disabled={i === frames.length - 1} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-primary transition-all disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
                          </div>
                          <button onClick={() => removeFrame(f.id)} className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"><X className="w-3.5 h-3.5" /></button>
                       </div>
                       <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[8px] font-black uppercase">F.{i + 1}</div>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="min-w-[140px] aspect-[4/5] rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-secondary/20 hover:border-primary/40 transition-all group/add"
                  >
                     <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-foreground/10 group-hover/add:text-primary transition-all border border-border">
                        <Plus className="w-5 h-5" />
                     </div>
                     <span className="text-[8px] font-black uppercase text-foreground/30">Add Frames</span>
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
                 </div>

                 <div className="space-y-10 animate-in zoom-in duration-500">
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                          <Label className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary" /> Frame Delay</Label>
                          <span className="text-primary font-mono">{delay}ms</span>
                       </div>
                       <Slider value={[delay]} min={50} max={2000} step={50} onValueChange={v => setDelay(v[0])} />
                       <div className="grid grid-cols-4 gap-2">
                          {[100, 300, 500, 1000].map(v => (
                            <button key={v} onClick={() => setDelay(v)} className={cn("h-8 rounded-lg border text-[8px] font-black uppercase transition-all", delay === v ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40")}>{v}ms</button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Resolution Protocol</Label>
                       <div className="grid grid-cols-3 gap-2">
                          {['320', '480', 'original'].map(w => (
                            <button
                             key={w}
                             onClick={() => setWidth(w)}
                             className={cn(
                               "h-11 rounded-xl border text-[8px] font-black uppercase transition-all",
                               width === w ? "bg-primary text-white border-primary" : "bg-white/5 border-white/5 text-white/40 hover:text-primary"
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
                             <p className="text-[10px] font-black uppercase text-foreground">Loop Matrix</p>
                             <p className="text-[8px] font-bold text-foreground/30 uppercase">Continuous playback</p>
                          </div>
                       </div>
                       <Switch checked={loop} onCheckedChange={setLoop} />
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                       <Button 
                        onClick={handleDownload} 
                        disabled={frames.length < 2 || isProcessing} 
                        className="h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all"
                       >
                          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                          Download
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Isolation</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our studio utilizes a main-thread encoding protocol for 100% browser-side synthesis. Your photos never leave your device memory, ensuring absolute data privacy.
                  </p>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
