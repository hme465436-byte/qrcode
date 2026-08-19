"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dog, 
  Cat, 
  RefreshCcw, 
  Download, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Activity,
  Zap,
  Globe,
  ImageIcon,
  ShieldCheck,
  Footprints,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type PetType = 'dog' | 'cat';

export default function PetStudioPage() {
  const { toast } = useToast();
  const [petType, setPetType] = useState<PetType>('dog');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPet = useCallback(async (type: PetType = petType) => {
    setIsLoading(true);
    setError(null);
    try {
      if (type === 'dog') {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();
        if (data.status === 'success') {
          setImageUrl(data.message);
        } else {
          throw new Error("Canine registry node restricted.");
        }
      } else {
        const response = await fetch(`https://cataas.com/cat?json=true&t=${Date.now()}`);
        const data = await response.json();
        if (data.url) {
          setImageUrl(`https://cataas.com${data.url}`);
        } else {
          throw new Error("Feline registry node restricted.");
        }
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  }, [petType, toast]);

  useEffect(() => {
    fetchPet();
  }, []);

  const handleTypeChange = (type: PetType) => {
    setPetType(type);
    fetchPet(type);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mykit-pet-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Master Exported" });
    } catch (e) {
      window.open(imageUrl, '_blank');
      toast({ title: "CORS Redirect", description: "Direct download blocked. Use 'Save As' in the new tab." });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Footprints className="w-3.5 h-3.5" /> Media Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Pet <span className="text-primary italic">Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional random pet discovery. Isolate canine and feline visual identities locally via the DogCEO and CATAAS protocols.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="pets" />
              <Button variant="outline" size="sm" onClick={() => fetchPet()} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> New Signal
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Zap className="w-5 h-5 text-primary" /> Matrix Selector
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleTypeChange('dog')} 
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all h-32",
                    petType === 'dog' ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                  )}
                >
                  <Dog className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Dog Matrix</span>
                </button>
                <button 
                  onClick={() => handleTypeChange('cat')} 
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all h-32",
                    petType === 'cat' ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                  )}
                >
                  <Cat className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cat Matrix</span>
                </button>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-secondary/30 border border-border space-y-4">
                 <div className="flex items-center gap-3 text-primary/40">
                    <Info className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Extraction Protocol</h4>
                 </div>
                 <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                   Imagery is retrieved from high-entropy registries. Direct hardware re-synthesis is used for local preservation.
                 </p>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Discovery signals are volatile and held strictly in local memory. No search history or visual interest is logged.
               </p>
             </div>
          </div>
        </div>

        {/* Results - Right */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-6 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                 {isLoading ? (
                   <div className="flex flex-col items-center gap-8 py-24">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Visual Matrix...</p>
                   </div>
                 ) : error ? (
                   <div className="flex flex-col items-center gap-6 py-24 text-center">
                      <Trash2 className="w-16 h-16 text-destructive opacity-20" />
                      <p className="text-sm font-bold text-destructive uppercase tracking-widest">{error}</p>
                      <Button onClick={() => fetchPet()} variant="outline" className="h-11 px-8 rounded-xl border-border">Retry Protocol</Button>
                   </div>
                 ) : imageUrl ? (
                   <div className="w-full flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500">
                      <div className="relative group/view max-w-full rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/5 ring-1 ring-border bg-black/40">
                         <img 
                          src={imageUrl} 
                          alt="Pet Matrix" 
                          className="max-h-[500px] w-auto object-contain transition-transform duration-1000 group-hover/view:scale-105" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/view:opacity-100 transition-opacity" />
                         <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">
                            {petType} ID: {imageUrl.split('/').pop()?.split('.')[0] || 'Unknown'}
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                         <Button onClick={handleDownload} className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90 active:scale-95 transition-all">
                            <Download className="w-5 h-5 mr-3" /> Download Master
                         </Button>
                         <Button asChild variant="outline" className="h-16 flex-1 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                               <ExternalLink className="w-5 h-5 mr-3" /> Open Protocol
                            </a>
                         </Button>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-6 py-24 opacity-10">
                      <ImageIcon className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>

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
