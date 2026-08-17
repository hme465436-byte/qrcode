"use client"

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  Zap, 
  Settings2, 
  Download, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  Info,
  Loader2,
  Maximize2,
  TrendingDown,
  FileImage,
  Sparkles,
  Layers,
  ShieldCheck,
  X,
  Plus,
  MonitorPlay,
  FileArchive,
  ArrowRight,
  Image as ImageIcon,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface ImageAsset {
  id: string;
  file: File;
  originalUrl: string;
  convertedUrl: string | null;
  convertedBlob: Blob | null;
  status: 'idle' | 'processing' | 'completed' | 'error';
  originalSize: number;
  newSize: number | null;
}

export default function ImageToWebPPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setProgress] = useState(0);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAssets: ImageAsset[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      originalUrl: URL.createObjectURL(file),
      convertedUrl: null,
      convertedBlob: null,
      status: 'idle',
      originalSize: file.size,
      newSize: null
    }));

    setAssets(prev => [...prev, ...newAssets]);
    if (!activePreviewId && newAssets.length > 0) setActivePreviewId(newAssets[0].id);
    toast({ title: "Photo Added", description: `Added ${newAssets.length} items to your list.` });
    if (e.target) e.target.value = '';
  };

  const convertSingle = async (asset: ImageAsset): Promise<ImageAsset> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = asset.originalUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...asset, status: 'error' });
          return;
        }

        let w = img.width;
        let h = img.height;
        if (maxWidth && w > maxWidth) {
          const ratio = maxWidth / w;
          w = maxWidth;
          h = h * ratio;
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({
              ...asset,
              status: 'completed',
              convertedUrl: url,
              convertedBlob: blob,
              newSize: blob.size
            });
          } else {
            resolve({ ...asset, status: 'error' });
          }
        }, 'image/webp', quality / 100);
      };
      img.onerror = () => resolve({ ...asset, status: 'error' });
    });
  };

  const processBatch = async () => {
    if (assets.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const updatedAssets = [...assets];
    for (let i = 0; i < updatedAssets.length; i++) {
      if (updatedAssets[i].status === 'completed') continue;
      
      updatedAssets[i].status = 'processing';
      setAssets([...updatedAssets]);

      const result = await convertSingle(updatedAssets[i]);
      updatedAssets[i] = result;
      
      setProgress(Math.round(((i + 1) / updatedAssets.length) * 100));
      setAssets([...updatedAssets]);
    }

    setIsProcessing(false);
    toast({ title: "Complete", description: "Photos converted to the new format." });
  };

  const downloadAll = async () => {
    const ready = assets.filter(a => a.convertedBlob);
    if (ready.length === 0) return;

    if (ready.length === 1) {
      const link = document.createElement('a');
      link.href = ready[0].convertedUrl!;
      link.download = ready[0].file.name.replace(/\.[^/.]+$/, "") + ".webp";
      link.click();
    } else {
      const zip = new JSZip();
      ready.forEach(asset => {
        zip.file(asset.file.name.replace(/\.[^/.]+$/, "") + ".webp", asset.convertedBlob!);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `photos_bundle_${Date.now()}.zip`;
      link.click();
    }
  };

  const removeAsset = (id: string) => {
    setAssets(prev => {
      const item = prev.find(a => a.id === id);
      if (item) {
        URL.revokeObjectURL(item.originalUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      }
      const next = prev.filter(a => a.id !== id);
      if (activePreviewId === id) setActivePreviewId(next[0]?.id || null);
      return next;
    });
  };

  const activeAsset = useMemo(() => assets.find(a => a.id === activePreviewId), [assets, activePreviewId]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <TrendingDown className="w-3.5 h-3.5" /> Size Reduction
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Image to <span className="text-primary italic">WebP</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Save space by converting your photos to a more efficient format. Everything happens on your device with complete privacy.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="image-to-webp" />
              {assets.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => { assets.forEach(a => { URL.revokeObjectURL(a.originalUrl); if(a.convertedUrl) URL.revokeObjectURL(a.convertedUrl); }); setAssets([]); setActivePreviewId(null); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace - Preview */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[650px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <MonitorPlay className="w-3.5 h-3.5" /> Preview
                </CardTitle>
                {activeAsset && (
                   <div className="flex gap-2">
                      <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase">
                        {activeAsset.status === 'completed' ? 'New Photo' : 'Original'}
                      </div>
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!activeAsset ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-primary/40 transition-all">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all shadow-xl">
                        <Upload className="w-8 h-8" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Select Photo</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={activeAsset.convertedUrl || activeAsset.originalUrl} 
                      alt="Preview" 
                      className={cn(
                        "max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10 transition-all duration-500",
                        activeAsset.status === 'processing' && "opacity-50 blur-sm"
                      )} 
                    />
                    {activeAsset.status === 'processing' && (
                       <div className="absolute inset-0 flex items-center justify-center z-20">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                       </div>
                    )}
                  </div>
                )}
             </CardContent>
          </Card>

          {/* Photo List */}
          {assets.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
               <div className="flex items-center justify-between px-2">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Selected Photos</Label>
                  <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{assets.length} Photos</span>
               </div>
               <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                  {assets.map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setActivePreviewId(a.id)}
                      className={cn(
                      "min-w-[160px] p-4 bg-secondary/50 rounded-[2rem] border overflow-hidden relative group/item snap-start shrink-0 transition-all cursor-pointer",
                      activePreviewId === a.id ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border hover:border-primary/40"
                    )}>
                       <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-black/20">
                          <img src={a.originalUrl} alt="Thumb" className="w-full h-full object-cover" />
                       </div>
                       <div className="space-y-1 min-w-0">
                          <p className="text-[9px] font-black text-foreground uppercase truncate pr-4">{a.file.name}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-bold text-foreground/30 uppercase">{formatSize(a.originalSize)}</span>
                             {a.newSize && (
                               <>
                                 <ArrowRight className="w-2.5 h-2.5 text-primary/40" />
                                 <span className="text-[8px] font-black text-primary uppercase">{formatSize(a.newSize)}</span>
                               </>
                             )}
                          </div>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); removeAsset(a.id); }} className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-500"><X className="w-3 h-3" /></button>
                       {a.status === 'completed' && <div className="absolute bottom-4 right-4 text-primary"><CheckCircle2 className="w-4 h-4" /></div>}
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="min-w-[160px] aspect-video sm:aspect-auto rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-secondary/20 hover:border-primary/40 transition-all group/add"
                  >
                     <Plus className="w-5 h-5 text-foreground/10 group-hover/add:text-primary transition-all" />
                     <span className="text-[8px] font-black uppercase text-foreground/30">Add Photo</span>
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
                    <Settings2 className="w-5 h-5 text-primary" /> Settings
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 <div className="space-y-4">
                    <div 
                      onClick={() => !isProcessing && fileInputRef.current?.click()}
                      className={cn(
                        "relative h-16 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 flex items-center justify-center bg-white/2 transition-all cursor-pointer overflow-hidden group/upload",
                        assets.length > 0 && "border-solid border-primary/20"
                      )}
                    >
                      <ImageIcon className="w-4 h-4 text-white/10 mr-3" />
                      <span className="text-[9px] font-black uppercase text-white/30">{assets.length > 0 ? 'Add More' : 'Select Photos'}</span>
                      <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/gif,image/bmp" multiple onChange={handleFileUpload} className="hidden" />
                    </div>
                 </div>

                 {assets.length > 0 && (
                   <div className="space-y-10 animate-in zoom-in duration-500">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                           <Label className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-primary" /> Quality</Label>
                           <span className="text-primary font-mono text-lg">{quality}%</span>
                        </div>
                        <Slider value={[quality]} min={10} max={100} step={1} onValueChange={v => setQuality(v[0])} />
                      </div>

                      <div className="space-y-4">
                         <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Maximum Width (px)</Label>
                         <div className="relative group/scale">
                            <Input 
                              type="number" 
                              placeholder="Original Size" 
                              value={maxWidth} 
                              onChange={e => setMaxWidth(e.target.value === '' ? '' : parseInt(e.target.value))}
                              className="h-12 bg-secondary border-border rounded-xl text-xs font-bold pl-10" 
                            />
                            <Maximize className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/scale:text-primary transition-colors" />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                         <div className="flex items-center justify-between p-6 rounded-[2.5rem] bg-secondary/50 border border-border group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary">
                                  <TrendingDown className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase text-foreground/60">Auto Optimize</p>
                                   <p className="text-[8px] font-bold text-foreground/20 uppercase">Save Space</p>
                                </div>
                            </div>
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                         </div>
                      </div>

                      <div className="pt-4 flex flex-col gap-3">
                         <Button 
                          onClick={processBatch} 
                          disabled={isProcessing} 
                          className="h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all group/btn"
                         >
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                            Convert
                         </Button>
                         {assets.some(a => a.status === 'completed') && (
                           <Button 
                            onClick={downloadAll}
                            variant="outline"
                            className="h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg"
                           >
                             <Download className="w-4 h-4 mr-2" /> 
                             Download {assets.filter(a => a.status === 'completed').length > 1 ? 'Bundle' : 'Photo'}
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
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Processing happens on your device. Your photos and data are never sent to any server.
                  </p>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* MOBILE STICKY ACTIONS */}
      {assets.some(a => a.status === 'completed') && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/80 backdrop-blur-3xl border-t border-white/10 z-[100] lg:hidden flex gap-3 animate-in slide-in-from-bottom-full duration-500">
          <Button onClick={downloadAll} className="flex-1 h-14 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-2xl">
             <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}

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
