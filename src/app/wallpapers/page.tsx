"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Monitor, 
  Smartphone, 
  RefreshCcw, 
  Download, 
  Maximize2, 
  Zap, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Loader2, 
  ImageIcon, 
  Search, 
  X,
  Sparkles,
  Layers,
  Palette,
  LayoutGrid,
  Sun,
  Moon,
  Wind,
  Trash2,
  AlertCircle,
  Eye,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface WallpaperAsset {
  id: string;
  url: string;
  previewUrl: string;
  title: string;
  author: string;
  source: 'Picsum' | 'NASA' | 'Studio';
  width: number;
  height: number;
}

const CATEGORIES = [
  { id: 'random', label: 'Random', icon: Zap },
  { id: 'nature', label: 'Nature', icon: Wind },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'space', label: 'Space', icon: Globe },
  { id: 'minimal', label: 'Minimal', icon: Layers },
];

export default function WallpapersPage() {
  const { toast } = useToast();
  
  // Settings State
  const [deviceMode, setDeviceMode] = useState<'pc' | 'mobile'>('pc');
  const [activeCategory, setActiveCategory] = useState('random');
  
  // Data State
  const [wallpapers, setWallpapers] = useState<WallpaperAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<WallpaperAsset | null>(null);

  // --- 1. Synthesis Logic ---
  const fetchWallpapers = useCallback(async () => {
    setIsLoading(true);
    const count = 12;
    const w = deviceMode === 'pc' ? 1920 : 1080;
    const h = deviceMode === 'pc' ? 1080 : 1920;
    const thumbW = Math.round(w / 4);
    const thumbH = Math.round(h / 4);

    let results: WallpaperAsset[] = [];

    try {
      // Node A: NASA APOD (Special for Space Category)
      if (activeCategory === 'space') {
        try {
          const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=${count}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            results = data.filter(item => item.media_type === 'image').map(item => ({
              id: `nasa-${item.date}`,
              url: item.hdurl || item.url,
              previewUrl: item.url,
              title: item.title,
              author: item.copyright || 'NASA',
              source: 'NASA',
              width: w,
              height: h
            }));
          }
        } catch (e) {
          console.warn("NASA Node restricted. Falling back to Picsum.");
        }
      }

      // Node B: Picsum Master (Primary/Fallback)
      if (results.length === 0) {
        // Generating deterministic random set via random seeds
        results = Array.from({ length: count }).map((_, i) => {
          const seed = Math.floor(Math.random() * 10000);
          return {
            id: `ps-${seed}-${i}`,
            url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
            previewUrl: `https://picsum.photos/seed/${seed}/${thumbW}/${thumbH}`,
            title: `${activeCategory.toUpperCase()} COMPOSITION #${seed}`,
            author: 'Linguistic AI',
            source: 'Picsum',
            width: w,
            height: h
          };
        });
      }

      setWallpapers(results);
      toast({ title: "Matrix Synchronized", description: `Isolated ${results.length} visual identifiers.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Discovery Failure" });
    } finally {
      setIsLoading(false);
    }
  }, [deviceMode, activeCategory, toast]);

  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  // --- 2. Action Protocols ---
  const handleDownload = async (asset: WallpaperAsset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mykit-wallpaper-${asset.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Master Exported" });
    } catch (e) {
      window.open(asset.url, '_blank');
      toast({ title: "CORS Redirect", description: "Direct download blocked. Use 'Save As' in the new tab." });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      {/* Header Matrix */}
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Monitor className="w-3.5 h-3.5" /> Media Suite Pro
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
                Wallpapers <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade visual discovery. Isolate high-fidelity wallpapers for Desktop and Mobile hardware locally with zero-loss master exports.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="wallpapers" />
              <Button variant="outline" onClick={() => fetchWallpapers()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> New Batch
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                 {/* Device Selection */}
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Target Hardware</Label>
                    <div className="grid grid-cols-2 bg-background/50 p-1.5 rounded-2xl border border-border h-16">
                       <button
                         onClick={() => setDeviceMode('pc')}
                         className={cn(
                           "flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                           deviceMode === 'pc' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-white"
                         )}
                       >
                          <Monitor className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase">Desktop</span>
                       </button>
                       <button
                         onClick={() => setDeviceMode('mobile')}
                         className={cn(
                           "flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                           deviceMode === 'mobile' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-white"
                         )}
                       >
                          <Smartphone className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase">Mobile</span>
                       </button>
                    </div>
                 </div>

                 {/* Thematic Mapping */}
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Thematic Matrix</Label>
                    <div className="grid grid-cols-1 gap-2">
                       {CATEGORIES.map(cat => (
                         <button
                           key={cat.id}
                           onClick={() => setActiveCategory(cat.id)}
                           className={cn(
                             "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group/item",
                             activeCategory === cat.id ? "bg-primary/10 border-primary text-primary" : "bg-secondary/30 border-border text-foreground/40 hover:border-primary/20"
                           )}
                         >
                            <div className="flex items-center gap-3">
                               <cat.icon className="w-4 h-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-20 group-hover/item:translate-x-1 transition-all" />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-start gap-4">
                       <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                          <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">Discovery signals are processed locally. Your visual history is never transmitted or stored.</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </aside>

        {/* Results Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           {isLoading && wallpapers.length === 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                   <Card key={i} className="glass-card border-border overflow-hidden h-[350px]">
                      <Skeleton className="w-full h-full" />
                   </Card>
                ))}
             </div>
           ) : (
             <div className="space-y-12">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <LayoutGrid className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Production Feed</span>
                   </div>
                   <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                      {deviceMode === 'pc' ? '1920x1080' : '1080x1920'} Matrix
                   </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                   {wallpapers.map((asset) => (
                     <div 
                      key={asset.id} 
                      onClick={() => setSelectedImage(asset)}
                      className="group/card relative aspect-[3/2] sm:aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/5 bg-secondary/30 cursor-pointer shadow-2xl hover:border-primary/40 transition-all duration-500"
                     >
                        <img 
                          src={asset.previewUrl} 
                          alt={asset.title} 
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-1000" 
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                           <div className="space-y-1 mb-4">
                              <p className="text-[11px] font-bold text-white uppercase truncate">{asset.title}</p>
                              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{asset.source} Node</p>
                           </div>
                           <div className="flex gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDownload(asset); }} 
                                className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                              >
                                 <Download className="w-4 h-4" />
                              </button>
                              <button className="h-10 px-4 rounded-xl bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase flex-1 border border-white/10">View Master</button>
                           </div>
                        </div>
                        
                        <div className="absolute top-4 left-4">
                           <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[7px] font-black uppercase tracking-widest text-white/40">
                              {asset.source}
                           </Badge>
                        </div>
                     </div>
                   ))}
                </div>

                {wallpapers.length === 0 && !isLoading && (
                   <div className="h-[400px] flex flex-col items-center justify-center opacity-10 space-y-6">
                      <ImageIcon className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Zero Matrix Matches</p>
                   </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* Detail Viewport Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="glass-card max-w-6xl w-[calc(100%-32px)] border-white/10 p-0 overflow-hidden outline-none flex flex-col max-h-[90vh]">
          {selectedImage && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedImage.title}</DialogTitle>
                <DialogDescription>High-fidelity master preview.</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-hidden relative bg-[#060608] flex items-center justify-center p-4 sm:p-12">
                 <img src={selectedImage.url} alt="" className="max-w-full max-h-full object-contain shadow-2xl" />
                 <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary transition-all border border-white/10 z-50">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-8 bg-secondary/30 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8 shrink-0">
                 <div className="space-y-2 min-w-0">
                    <DialogTitle className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight truncate max-w-lg">{selectedImage.title}</DialogTitle>
                    <div className="flex flex-wrap items-center gap-4">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{selectedImage.source} Node Active</p>
                       <span className="text-white/10">•</span>
                       <p className="text-[10px] font-bold text-foreground/40 uppercase truncate">Resolution: {selectedImage.width}x{selectedImage.height} PX</p>
                    </div>
                 </div>
                 <div className="flex gap-4 w-full sm:w-auto">
                    <Button onClick={() => handleDownload(selectedImage)} className="h-16 px-10 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex-1">
                       <Download className="w-5 h-5 mr-3" /> Save Master
                    </Button>
                 </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
