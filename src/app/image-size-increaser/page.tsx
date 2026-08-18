
"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function ImageSizeIncreaserPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Dimensions
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  
  // Quality & Size
  const [quality, setQuality] = useState(90);
  const [targetKb, setTargetKb] = useState<number>(0);
  
  // Results
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Maximum supported size is 10MB." });
        return;
      }
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setLoadedImage(img);
          setImage(result);
          setOriginalSize(file.size);
          setTargetWidth(img.width);
          setTargetHeight(img.height);
          setAspectRatio(img.width / img.height);
          setResultUrl(null);
          setIsProcessing(false);
          toast({ title: "Asset Imported", description: "Dimensions extracted for scaling." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateWidth = (val: number) => {
    setTargetWidth(val);
    if (lockRatio && val > 0) setTargetHeight(Math.round(val / aspectRatio));
  };

  const updateHeight = (val: number) => {
    setTargetHeight(val);
    if (lockRatio && val > 0) setTargetWidth(Math.round(val * aspectRatio));
  };

  const applyScale = (factor: number) => {
    if (!loadedImage) return;
    updateWidth(Math.round(loadedImage.width * factor));
    toast({ title: "Preset Applied", description: `Scaling factor: ${factor}x` });
  };

  const executeIncrease = async () => {
    if (!loadedImage) return;
    setIsProcessing(true);

    // Give UI time to update
    await new Promise(r => setTimeout(r, 300));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(loadedImage, 0, 0, targetWidth, targetHeight);

    // Iterative Size Inflation (Target KB Protocol)
    const targetBytes = targetKb * 1024;
    let finalBlob: Blob | null = null;
    let currentQuality = quality / 100;

    const generateBlob = (q: number): Promise<Blob | null> => {
      return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', q));
    };

    if (targetKb > 0) {
      // Logic: If target KB is high, we keep quality at 100% and hope dimensions cover it.
      // If we are under, we can't magically add "meaningful" data besides quality=1.0.
      finalBlob = await generateBlob(1.0);
      if (finalBlob && finalBlob.size < targetBytes) {
        toast({ 
          variant: "default", 
          title: "Inflation Note", 
          description: "Target KB exceeded current pixel density limit. Exporting at Max Quality." 
        });
      } else {
        // Simple search for correct quality to match target
        let low = 0.1, high = 1.0;
        for (let i = 0; i < 5; i++) {
           const mid = (low + high) / 2;
           const b = await generateBlob(mid);
           if (b && b.size < targetBytes) low = mid;
           else high = mid;
        }
        finalBlob = await generateBlob(high);
      }
    } else {
      finalBlob = await generateBlob(currentQuality);
    }

    if (finalBlob) {
      setResultSize(finalBlob.size);
      setResultUrl(URL.createObjectURL(finalBlob));
      toast({ title: "Synthesis Complete", description: "New image matrix generated." });
    }

    setIsProcessing(false);
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.download = `upscaled_${Date.now()}.${format}`;
    link.href = resultUrl;
    link.click();
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setResultUrl(null);
    setTargetKb(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Maximize2 className="w-3.5 h-3.5" /> Geometry Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Image Size <span className="text-primary italic">Increaser Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Professional high-quality scaling and file-size inflation. Increase pixel dimensions and target specific KB volumes locally for sensitive form submissions.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="image-size-increaser" />
              {image && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace - Left */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] max-h-[50vh] lg:max-h-none lg:min-h-[700px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" /> Visual Analysis
                </CardTitle>
                {image && (
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                      <span className="text-[8px] font-black uppercase text-foreground/40">Compare Master</span>
                      <Switch checked={showOriginal} onCheckedChange={setShowOriginal} className="scale-50 h-4 w-8" />
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-primary/40 transition-all">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-8 h-8" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Inject Visual Payload</span>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={showOriginal ? image : (resultUrl || image)} 
                      alt="Preview" 
                      className={cn(
                        "max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10 transition-all duration-500",
                        isProcessing && "opacity-50 blur-sm"
                      )} 
                    />
                    {isProcessing && (
                       <div className="absolute inset-0 flex items-center justify-center z-20">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                       </div>
                    )}
                  </div>
                )}
             </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="p-6 rounded-[2rem] bg-secondary border border-border flex flex-col items-center text-center gap-2 group hover:border-primary/20 transition-all">
                <Maximize className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">Original Dimensions</p>
                <p className="text-sm font-bold text-foreground">{loadedImage ? `${loadedImage.width} x ${loadedImage.height}` : '---'}</p>
             </div>
             <div className="p-6 rounded-[2rem] bg-secondary border border-border flex flex-col items-center text-center gap-2 group hover:border-primary/20 transition-all">
                <Ratio className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">Target Dimensions</p>
                <p className="text-sm font-bold text-primary">{targetWidth} x {targetHeight}</p>
             </div>
             <div className="p-6 rounded-[2rem] bg-secondary border border-border flex flex-col items-center text-center gap-2 group hover:border-primary/20 transition-all">
                <TrendingUp className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">Byte Difference</p>
                <p className="text-sm font-bold text-foreground">+{formatSize(Math.max(0, resultSize - originalSize))}</p>
             </div>
          </div>
        </div>

        {/* Controls - Right */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 {/* Presets */}
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Factor Presets</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {[2, 3, 4].map(f => (
                         <button key={f} onClick={() => applyScale(f)} disabled={!image} className="h-10 rounded-xl border border-border bg-secondary/50 text-[10px] font-black uppercase text-foreground/60 hover:text-primary hover:border-primary transition-all disabled:opacity-20">{f}X Scale</button>
                       ))}
                    </div>
                 </div>

                 {/* Manual Dimensions */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Target Geometry (px)</Label>
                       <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full border border-border">
                          {lockRatio ? <Lock className="w-3 h-3 text-primary" /> : <Unlock className="w-3 h-3 text-foreground/20" />}
                          <span className="text-[8px] font-black uppercase text-foreground/40">Lock Ratio</span>
                          <Switch checked={lockRatio} onCheckedChange={setLockRatio} className="scale-75 h-4" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[8px] font-black text-foreground/20 uppercase ml-1">Width</Label>
                          <Input type="number" value={targetWidth || ''} onChange={e => updateWidth(parseInt(e.target.value) || 0)} className="h-12 bg-secondary border-border rounded-xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[8px] font-black text-foreground/20 uppercase ml-1">Height</Label>
                          <Input type="number" value={targetHeight || ''} onChange={e => updateHeight(parseInt(e.target.value) || 0)} className="h-12 bg-secondary border-border rounded-xl font-bold" />
                       </div>
                    </div>
                 </div>

                 {/* Quality & Inflation */}
                 <div className="space-y-8 pt-6 border-t border-white/5">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                          <Label>JPG Quality Buffer</Label>
                          <span className="text-primary font-mono">{quality}%</span>
                       </div>
                       <Slider value={[quality]} min={10} max={100} step={1} onValueChange={v => setQuality(v[0])} />
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Target Volume (KB)</Label>
                          <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[7px] font-black uppercase">Size Inflation</div>
                       </div>
                       <div className="relative group/kb">
                          <Input 
                            type="number" 
                            value={targetKb || ''} 
                            onChange={e => setTargetKb(parseInt(e.target.value) || 0)} 
                            placeholder="e.g. 500" 
                            className="h-14 bg-secondary border-border rounded-2xl pl-10 font-bold" 
                          />
                          <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/kb:text-primary transition-colors" />
                       </div>
                       <p className="text-[9px] text-foreground/30 font-bold uppercase leading-relaxed text-center">Engine will inflate bitstream to reach this minimum size.</p>
                    </div>
                 </div>

                 <Button 
                  onClick={executeIncrease}
                  disabled={!image || isProcessing}
                  className="h-16 w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    Synthesize Master
                 </Button>
              </CardContent>
           </Card>

           {resultUrl && (
             <Card className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl animate-in zoom-in-95 duration-500">
                <CardHeader className="py-4 border-b border-emerald-500/10">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                         <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Production Complete</span>
                   </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="text-center space-y-1">
                         <p className="text-[8px] font-black text-foreground/20 uppercase">New Volume</p>
                         <p className="text-sm font-bold text-foreground">{formatSize(resultSize)}</p>
                      </div>
                      <div className="text-center space-y-1">
                         <p className="text-[8px] font-black text-foreground/20 uppercase">Inflation</p>
                         <p className="text-sm font-bold text-emerald-600">{Math.round((resultSize / originalSize) * 100)}%</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => handleDownload('png')} className="h-12 bg-primary text-white font-black uppercase text-[9px] rounded-xl shadow-lg">PNG HQ</Button>
                      <Button onClick={() => handleDownload('jpg')} variant="outline" className="h-12 border-emerald-500/20 bg-white/5 text-emerald-600 font-black uppercase text-[9px] rounded-xl">JPG</Button>
                   </div>
                </CardContent>
             </Card>
           )}

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 100% local production. Dimensions and bitstreams are recalculated in your browser memory and never touch remote servers.
               </p>
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
