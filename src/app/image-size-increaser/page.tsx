
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Maximize2, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileImage,
  Settings2,
  Zap,
  Activity,
  ArrowRight,
  TrendingUp,
  Maximize,
  ShieldCheck,
  Scale,
  Ratio,
  Lock,
  Unlock,
  AlertCircle,
  Undo2,
  RefreshCcw,
  Plus,
  X,
  FileArchive,
  Monitor,
  Smartphone,
  LayoutGrid,
  Image as ImageIcon,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  MonitorPlay,
  Save,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import JSZip from 'jszip';

// --- Types ---
type FitMode = 'original' | 'cover' | 'contain' | 'stretch' | 'blur-fill';
type ExportFormat = 'image/png' | 'image/jpeg';

interface ImageAsset {
  id: string;
  file: File;
  originalUrl: string;
  originalW: number;
  originalH: number;
  originalSize: number;
  processedUrl: string | null;
  processedSize: number | null;
  status: 'idle' | 'processing' | 'completed' | 'error';
}

interface StudioState {
  targetW: number;
  targetH: number;
  lockRatio: boolean;
  quality: number;
  targetKb: number;
  fitMode: FitMode;
  format: ExportFormat;
  bgColor: string;
}

const INITIAL_STUDIO: StudioState = {
  targetW: 1080,
  targetH: 1080,
  lockRatio: true,
  quality: 92,
  targetKb: 0,
  fitMode: 'original',
  format: 'image/jpeg',
  bgColor: '#000000'
};

export default function ImageSizeIncreaserPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, setState] = useState<StudioState>(INITIAL_STUDIO);
  const [history, setHistory] = useState<StudioState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const activeAsset = useMemo(() => assets.find(a => a.id === activeId), [assets, activeId]);

  // --- Handlers ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const loaders = files.map(file => {
      return new Promise<ImageAsset>((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            file,
            originalUrl: url,
            originalW: img.width,
            originalH: img.height,
            originalSize: file.size,
            processedUrl: null,
            processedSize: null,
            status: 'idle'
          });
        };
        img.src = url;
      });
    });

    Promise.all(loaders).then(newAssets => {
      setAssets(prev => [...prev, ...newAssets]);
      if (!activeId && newAssets.length > 0) {
        setActiveId(newAssets[0].id);
        setState(s => ({ ...s, targetW: newAssets[0].originalW, targetH: newAssets[0].originalH }));
      }
      toast({ title: "Batch Added", description: `Injected ${newAssets.length} assets into the pipeline.` });
    });
    if (e.target) e.target.value = '';
  };

  const updateParam = (updates: Partial<StudioState>, commit = true) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      if (commit) setHistory(h => [...h.slice(-19), prev]);
      
      // Aspect Lock Logic
      if (updates.targetW && next.lockRatio && activeAsset) {
        const ratio = activeAsset.originalW / activeAsset.originalH;
        next.targetH = Math.round(updates.targetW / ratio);
      } else if (updates.targetH && next.lockRatio && activeAsset) {
        const ratio = activeAsset.originalW / activeAsset.originalH;
        next.targetW = Math.round(updates.targetH * ratio);
      }
      return next;
    });
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setState(prev);
  };

  const applyPreset = (type: string) => {
    if (!activeAsset) return;
    switch(type) {
      case '2x': updateParam({ targetW: activeAsset.originalW * 2, targetH: activeAsset.originalH * 2 }); break;
      case '4x': updateParam({ targetW: activeAsset.originalW * 4, targetH: activeAsset.originalH * 4 }); break;
      case '1080p': updateParam({ targetH: 1080, lockRatio: true }); break;
      case '4k': updateParam({ targetH: 2160, lockRatio: true }); break;
      case 'wa': updateParam({ targetW: 640, targetH: 640, lockRatio: false, fitMode: 'blur-fill' }); break;
      case 'ig': updateParam({ targetW: 1080, targetH: 1080, lockRatio: false, fitMode: 'blur-fill' }); break;
    }
    toast({ title: "Preset Applied" });
  };

  // --- Synthesis Engine ---
  const processAsset = async (asset: ImageAsset, config: StudioState): Promise<ImageAsset> => {
    const canvas = document.createElement('canvas');
    canvas.width = config.targetW;
    canvas.height = config.targetH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { ...asset, status: 'error' };

    const img = await new Promise<HTMLImageElement>((resolve) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.src = asset.originalUrl;
    });

    // 1. Background Pass
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (config.fitMode === 'blur-fill') {
      ctx.save();
      ctx.filter = 'blur(40px) brightness(0.6)';
      const bgScale = Math.max(canvas.width / img.width, canvas.height / img.height);
      ctx.drawImage(img, (canvas.width - img.width * bgScale)/2, (canvas.height - img.height * bgScale)/2, img.width * bgScale, img.height * bgScale);
      ctx.restore();
    }

    // 2. Main Image Pass
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let dx = 0, dy = 0, dw = canvas.width, dh = canvas.height;

    if (config.fitMode === 'contain' || config.fitMode === 'blur-fill' || config.fitMode === 'original') {
      const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
      dw = img.width * ratio;
      dh = img.height * ratio;
      dx = (canvas.width - dw) / 2;
      dy = (canvas.height - dh) / 2;
    } else if (config.fitMode === 'cover') {
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      dw = img.width * ratio;
      dh = img.height * ratio;
      dx = (canvas.width - dw) / 2;
      dy = (canvas.height - dh) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);

    // 3. Iterative Inflation / Quality Match
    const targetBytes = config.targetKb * 1024;
    let finalBlob: Blob | null = null;

    const getBlob = (q: number): Promise<Blob | null> => {
      return new Promise(resolve => canvas.toBlob(b => resolve(b), config.format, q));
    };

    if (config.targetKb > 0 && config.format === 'image/jpeg') {
      // Binary search for target KB
      let low = 0.5, high = 1.0;
      for (let i = 0; i < 6; i++) {
        const mid = (low + high) / 2;
        const b = await getBlob(mid);
        if (b && b.size < targetBytes) low = mid;
        else high = mid;
      }
      finalBlob = await getBlob(high);
    } else {
      finalBlob = await getBlob(config.quality / 100);
    }

    if (!finalBlob) return { ...asset, status: 'error' };

    return {
      ...asset,
      status: 'completed',
      processedUrl: URL.createObjectURL(finalBlob),
      processedSize: finalBlob.size,
      processedBlob: finalBlob
    } as any;
  };

  const runProduction = async () => {
    if (assets.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const updatedAssets = [...assets];
    for (let i = 0; i < updatedAssets.length; i++) {
      if (updatedAssets[i].status === 'completed') continue;
      
      updatedAssets[i].status = 'processing';
      setAssets([...updatedAssets]);
      
      const result = await processAsset(updatedAssets[i], state);
      updatedAssets[i] = result;
      
      setProgress(Math.round(((i + 1) / assets.length) * 100));
      setAssets([...updatedAssets]);
    }

    setIsProcessing(false);
    toast({ title: "Production Complete", description: "All assets synthesized locally." });
  };

  const handleDownload = async () => {
    const ready = assets.filter(a => a.processedBlob);
    if (ready.length === 0) return;

    if (ready.length === 1) {
      const a = document.createElement('a');
      a.href = ready[0].processedUrl!;
      a.download = `optimized_${ready[0].file.name}`;
      a.click();
    } else {
      const zip = new JSZip();
      ready.forEach(asset => {
        zip.file(asset.file.name, asset.processedBlob!);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bundle_${Date.now()}.zip`;
      a.click();
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-x-hidden">
      <div className="mb-10 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Maximize2 className="w-3.5 h-3.5" /> High-Fidelity Studio
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-[0.95] overflow-wrap-anywhere">
            Image Size <span className="text-primary italic">Increaser Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="image-size-increaser" />
           <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest transition-all">
              <Undo2 className="w-3.5 h-3.5 mr-2" /> Undo
           </Button>
           <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Settings Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 {/* Asset Intake */}
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Asset Intake</Label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative h-32 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                        assets.length > 0 && "border-solid border-primary/20"
                      )}
                    >
                      {assets.length > 0 ? (
                        <div className="text-center p-4">
                           <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-1" />
                           <p className="text-[10px] font-black uppercase text-foreground/40">{assets.length} Visuals in Pipeline</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                           <ImageIcon className="w-8 h-8 text-foreground/10 group-hover/upload:text-primary transition-all" />
                           <span className="text-[9px] font-black uppercase text-foreground/30">Inject Photos</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </div>
                 </div>

                 {/* Dimensions Matrix */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Target Geometry (px)</Label>
                       <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full border border-border">
                          {state.lockRatio ? <Lock className="w-3 h-3 text-primary" /> : <Unlock className="w-3 h-3 text-foreground/20" />}
                          <span className="text-[8px] font-black uppercase text-foreground/40">Lock Ratio</span>
                          <Switch checked={state.lockRatio} onCheckedChange={v => updateParam({ lockRatio: v })} className="scale-75 h-4" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[8px] font-black text-foreground/20 uppercase ml-1">Width</Label>
                          <Input type="number" value={state.targetW || ''} onChange={e => updateParam({ targetW: parseInt(e.target.value) || 0 })} className="h-12 bg-secondary/50 border-border rounded-xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[8px] font-black text-foreground/20 uppercase ml-1">Height</Label>
                          <Input type="number" value={state.targetH || ''} onChange={e => updateParam({ targetH: parseInt(e.target.value) || 0 })} className="h-12 bg-secondary/50 border-border rounded-xl font-bold" />
                       </div>
                    </div>
                    
                    {/* Presets Grid */}
                    <div className="grid grid-cols-3 gap-2">
                       {['2x', '4x', '1080p', '4k', 'wa', 'ig'].map(p => (
                         <button key={p} onClick={() => applyScale(p)} disabled={!activeAsset} className="h-10 rounded-xl border border-border bg-background text-[8px] font-black uppercase text-foreground/40 hover:text-primary hover:border-primary transition-all disabled:opacity-10">
                            {p.replace('wa', 'WA DP').replace('ig', 'Insta')}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Fit & Visuals */}
                 <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Fit Architecture</Label>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                             { id: 'original', label: 'Original' },
                             { id: 'blur-fill', label: 'Blur-Fill' },
                             { id: 'cover', label: 'Cover' },
                             { id: 'contain', label: 'Contain' },
                          ].map(f => (
                             <button key={f.id} onClick={() => updateParam({ fitMode: f.id as any })} className={cn("h-10 rounded-xl border text-[8px] font-black uppercase transition-all", state.fitMode === f.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40")}>
                                {f.label}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Target Volume (KB)</Label>
                          <Input type="number" value={state.targetKb || ''} onChange={e => updateParam({ targetKb: parseInt(e.target.value) || 0 })} placeholder="Inflate to..." className="h-12 bg-secondary border-border rounded-xl text-[11px] font-bold" />
                       </div>
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Protocol (Format)</Label>
                          <div className="grid grid-cols-2 bg-secondary p-1 rounded-xl border border-border h-12">
                             <button onClick={() => updateParam({ format: 'image/jpeg' })} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", state.format === 'image/jpeg' ? "bg-primary text-white" : "text-foreground/40")}>JPG</button>
                             <button onClick={() => updateParam({ format: 'image/png' })} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", state.format === 'image/png' ? "bg-primary text-white" : "text-foreground/40")}>PNG</button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                          <Label>JPG Buffer Quality</Label>
                          <span className="text-primary font-mono">{state.quality}%</span>
                       </div>
                       <Slider value={[state.quality]} min={10} max={100} step={1} onValueChange={v => updateParam({ quality: v[0] })} />
                    </div>
                 </div>

                 <Button 
                  onClick={runProduction}
                  disabled={!assets.length || isProcessing}
                  className="h-16 w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    Synthesize {assets.length > 1 ? 'Batch' : 'Master'}
                 </Button>
              </CardContent>
           </Card>

           {/* Batch Pipeline View */}
           {assets.length > 1 && (
             <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Batch Pipeline</Label>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {assets.map(a => (
                     <div key={a.id} onClick={() => setActiveId(a.id)} className={cn(
                       "p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group",
                       activeId === a.id ? "bg-primary/10 border-primary" : "bg-secondary/30 border-white/5 hover:border-primary/20"
                     )}>
                        <div className="flex items-center gap-4 min-w-0">
                           <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center overflow-hidden border border-border shrink-0">
                              <img src={a.originalUrl} className="w-full h-full object-cover" />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[10px] font-bold text-foreground truncate uppercase">{a.file.name}</p>
                              <p className="text-[8px] font-black text-foreground/20 uppercase">{a.status}</p>
                           </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeAsset(a.id); }} className="text-foreground/10 group-hover:text-red-500 transition-colors p-2"><X className="w-4 h-4" /></button>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Right: Master Viewport */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] lg:min-h-[800px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <MonitorPlay className="w-4 h-4" /> Studio Master Monitor
                </CardTitle>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Compare A/B</span>
                      <Switch checked={showOriginal} onCheckedChange={setShowOriginal} className="scale-50 h-4 w-8" />
                   </div>
                </div>
             </CardHeader>

             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!activeAsset ? (
                   <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                      <Activity className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                   </div>
                ) : (
                   <div className="relative w-full h-full flex flex-col items-center justify-center gap-10">
                      <div className="relative group/canvas max-w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-checkered">
                         <img 
                           src={showOriginal ? activeAsset.originalUrl : (activeAsset.processedUrl || activeAsset.originalUrl)} 
                           alt="Preview" 
                           className={cn(
                             "max-w-full max-h-[600px] object-contain transition-all duration-500",
                             isProcessing && "opacity-50 blur-sm"
                           )} 
                         />
                         <div className="absolute top-4 left-4 flex gap-2">
                            <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[8px] font-black uppercase text-white/40 tracking-widest border border-white/10">
                               {showOriginal ? 'Source Matrix' : 'Synthesized Master'}
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                         <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                               <Maximize className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">Geometry Density</p>
                               <p className="text-sm font-bold text-foreground truncate uppercase">{activeAsset.originalW}x{activeAsset.originalH} <ArrowRight className="w-3 h-3 inline mx-1" /> {state.targetW}x{state.targetH}</p>
                            </div>
                         </div>
                         <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                               <TrendingDown className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">Byte Stream Volume</p>
                               <p className="text-sm font-bold text-foreground truncate uppercase">{formatSize(activeAsset.originalSize)} <ArrowRight className="w-3 h-3 inline mx-1" /> {activeAsset.processedSize ? formatSize(activeAsset.processedSize) : '---'}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                )}
             </CardContent>

             {activeAsset && (
               <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Active Format</p>
                        <p className="text-xs font-bold text-primary uppercase">{state.format.split('/')[1]}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Target Quality</p>
                        <p className="text-xs font-bold text-primary uppercase">{state.targetKb > 0 ? 'Dynamic Inflation' : `${state.quality}% Balanced`}</p>
                     </div>
                  </div>
                  <Button 
                    onClick={handleDownload} 
                    disabled={!assets.some(a => a.processedUrl)} 
                    className="h-16 px-12 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-xl active:scale-95 transition-all"
                  >
                     <Download className="w-6 h-6" />
                     {assets.filter(a => a.status === 'completed').length > 1 ? 'Download Bundle ZIP' : 'Save Master'}
                  </Button>
               </div>
             )}
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our studio utilizes iterative inflation protocols entirely in your browser. Visual bitstreams are recalculated and held in volatile local memory only.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Master Integrity</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Scale pixels without bilinear artifacts. We use hardware-accelerated interpolation to ensure crisp edges at any density target.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />

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

  function removeAsset(id: string) {
    setAssets(prev => {
      const item = prev.find(a => a.id === id);
      if (item) {
        URL.revokeObjectURL(item.originalUrl);
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
      }
      const next = prev.filter(a => a.id !== id);
      if (activeId === id) setActiveId(next[0]?.id || null);
      return next;
    });
  }
}

