
"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Scaling, 
  Settings2, 
  Download, 
  Trash2, 
  Upload, 
  CheckCircle2,
  Info,
  Loader2,
  Maximize2,
  Lock,
  Unlock,
  Save,
  ImageIcon,
  ArrowRightLeft,
  Ratio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ImageResizerPage() {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [originalMeta, setOriginalMeta] = useState<{ width: number; height: number; name: string; size: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({ variant: "destructive", title: "High Volume Asset", description: "Files over 15MB may impact browser performance." });
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setOriginalImage(result);
          setOriginalMeta({
            width: img.width,
            height: img.height,
            name: file.name,
            size: file.size
          });
          setTargetWidth(img.width);
          setTargetHeight(img.height);
          setAspectRatio(img.width / img.height);
          setResizedImage(null);
          toast({ title: "Asset Imported", description: "Dimensions extracted for studio production." });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateWidth = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && w > 0) {
      setTargetHeight(Math.round(w / aspectRatio));
    }
  };

  const updateHeight = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && h > 0) {
      setTargetWidth(Math.round(h * aspectRatio));
    }
  };

  const applyPreset = (dim: number) => {
    if (!originalMeta) return;
    if (originalMeta.width >= originalMeta.height) {
      updateWidth(dim);
    } else {
      updateHeight(dim);
    }
    toast({ title: "Preset Applied", description: `Dimensions scaled to ${dim}px constraint.` });
  };

  const resizeImage = useCallback(async () => {
    if (!originalImage || !originalMeta) return;
    setIsProcessing(true);

    // Short delay to ensure UI updates
    setTimeout(() => {
      const img = new Image();
      img.src = originalImage;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Use high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL('image/png'); // Default to PNG for quality, user can choose in compressor
        setResizedImage(dataUrl);
        setIsProcessing(false);
        toast({ title: "Scale Complete", description: "Asset transformed to target dimensions." });
      };
    }, 100);
  }, [originalImage, originalMeta, targetWidth, targetHeight, toast]);

  const handleDownload = () => {
    if (!resizedImage) return;
    const link = document.createElement('a');
    const ext = originalMeta?.name.split('.').pop() || 'png';
    link.download = `resized-${originalMeta?.name.split('.')[0] || 'studio-asset'}.${ext}`;
    link.href = resizedImage;
    link.click();
  };

  const handleClear = () => {
    setOriginalImage(null);
    setResizedImage(null);
    setOriginalMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "All parameters cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Scaling className="w-3.5 h-3.5" /> Geometry Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image <span className="text-primary italic">Resizer</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional browser-side scaling engine. Modify pixel dimensions with precision aspect ratio control for high-fidelity production.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Controls Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                Asset Configuration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* Upload Zone */}
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    originalImage && "border-solid border-primary/40",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {originalImage ? (
                    <div className="text-center p-6 space-y-2">
                       <Scaling className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{originalMeta?.name}</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{originalMeta?.width}x{originalMeta?.height} detected</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6">
                        Drop high-res image or click to browse
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {/* Dimensions Input */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Target Geometry (px)</Label>
                   <div className="flex items-center gap-3 bg-secondary px-3 py-1.5 rounded-xl border border-border">
                      {lockAspectRatio ? <Lock className="w-3 h-3 text-primary" /> : <Unlock className="w-3 h-3 text-foreground/30" />}
                      <span className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">Lock Aspect Ratio</span>
                      <Switch checked={lockAspectRatio} onCheckedChange={setLockAspectRatio} className="scale-75" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 relative">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest ml-1">Width</Label>
                    <Input 
                      type="number" 
                      value={targetWidth || ''} 
                      onChange={(e) => updateWidth(parseInt(e.target.value) || 0)}
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-mono font-bold"
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-2">
                     <ArrowRightLeft className="w-4 h-4 text-foreground/10" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest ml-1">Height</Label>
                    <Input 
                      type="number" 
                      value={targetHeight || ''} 
                      onChange={(e) => updateHeight(parseInt(e.target.value) || 0)}
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Dimension Presets</Label>
                   <div className="grid grid-cols-5 gap-2">
                      {[100, 256, 512, 1024, 1920].map(dim => (
                        <button
                          key={dim}
                          onClick={() => applyPreset(dim)}
                          className="h-10 rounded-xl bg-background border border-border text-[9px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-all active:scale-95"
                        >
                          {dim}px
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={resizeImage}
                  disabled={!originalImage || isProcessing || targetWidth <= 0 || targetHeight <= 0}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Maximize2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Generate Scale
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
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">High-Fidelity Interpolation</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine utilizes bi-linear smoothing algorithms via the Canvas API to ensure pixel integrity is preserved during up-scaling or down-scaling.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Studio Output
                </CardTitle>
                {resizedImage && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                    {targetWidth} x {targetHeight}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10 space-y-10">
              <div className="flex-1 relative group/preview min-h-[300px] flex items-center justify-center rounded-[2rem] bg-secondary/30 border border-border p-6 overflow-hidden">
                {resizedImage ? (
                  <div className="w-full h-full flex flex-col gap-6">
                    <div className="flex-1 flex items-center justify-center bg-checkered rounded-xl overflow-hidden shadow-inner ring-1 ring-border">
                      <img src={resizedImage} alt="Resized" className="max-h-[300px] w-auto object-contain drop-shadow-2xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-background border border-border text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Original Density</p>
                          <p className="text-xs font-bold text-foreground">{originalMeta?.width}x{originalMeta?.height}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Scaled Density</p>
                          <p className="text-xs font-bold text-primary">{targetWidth}x{targetHeight}</p>
                       </div>
                    </div>
                  </div>
                ) : originalImage ? (
                   <div className="text-center space-y-6">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <Scaling className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Pending Transformation</p>
                   </div>
                ) : (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity text-center">
                    <Settings2 className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No target detected</p>
                  </div>
                )}
              </div>

              {resizedImage && (
                <div className="space-y-6">
                   <Button 
                    onClick={handleDownload}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95"
                  >
                    <Download className="w-6 h-6" />
                    Download Scaled Asset
                  </Button>

                  <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                     <Ratio className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Production Logic</p>
                        <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                          Your visual is processed as a lossless PNG master at {targetWidth}x{targetHeight} resolution. Original aspect ratio was {aspectRatio.toFixed(2)}:1.
                        </p>
                     </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
