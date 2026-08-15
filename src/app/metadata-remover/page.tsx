"use client"

import React, { useState, useRef, useCallback } from 'react';
import { 
  ShieldAlert, 
  EyeOff, 
  Trash2, 
  Upload, 
  Download, 
  CheckCircle2, 
  Info,
  Camera,
  Globe,
  Loader2,
  FileImage,
  RefreshCcw,
  Maximize,
  Lock,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MetadataRemoverPage() {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [cleanedImage, setCleanedImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCleaned, setIsCleaned] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        toast({ variant: "destructive", title: "High Volume Asset", description: "Files over 15MB may impact browser stability." });
      }
      setFileInfo({ name: file.name, size: file.size, type: file.type });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setCleanedImage(null);
        setIsCleaned(false);
        toast({ title: "Asset Loaded", description: "Ready for privacy sanitization." });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMetadata = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);

    // Re-encoding through canvas naturally strips all EXIF/GPS metadata 
    // as it only processes the raw pixel matrix.
    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas (strips metadata headers)
      ctx.drawImage(img, 0, 0);

      // Export as the original format or default to JPG
      const outputType = fileInfo?.type || 'image/jpeg';
      const cleanedDataUrl = canvas.toDataURL(outputType, 0.95);
      
      setCleanedImage(cleanedDataUrl);
      setIsCleaned(true);
      setIsProcessing(false);
      toast({ title: "Sanitization Complete", description: "All EXIF and GPS headers purged." });
    };
  }, [originalImage, fileInfo, toast]);

  const handleDownload = () => {
    if (!cleanedImage) return;
    const link = document.createElement('a');
    const ext = fileInfo?.name.split('.').pop() || 'jpg';
    link.download = `privacy-clean-${fileInfo?.name.split('.')[0] || 'studio-asset'}.${ext}`;
    link.href = cleanedImage;
    link.click();
    toast({ title: "Secure Export", description: "Cleaned asset saved to device." });
  };

  const handleClear = () => {
    setOriginalImage(null);
    setCleanedImage(null);
    setFileInfo(null);
    setIsCleaned(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory purged and buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <EyeOff className="w-3.5 h-3.5" /> Privacy Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Metadata <span className="text-primary italic">Remover</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional EXIF and GPS purging utility. Strip camera details, location coordinates, and timestamps from your imagery locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                Source Imagery
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative group/upload h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                  originalImage && "border-solid border-primary/40",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                {originalImage ? (
                  <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-4">
                     <img src={originalImage} alt="Original" className="max-h-40 w-auto rounded-lg shadow-xl opacity-80" />
                     <div className="text-center">
                        <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{fileInfo?.name}</p>
                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(fileInfo?.size || 0)} detected</p>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-10 leading-relaxed">
                      Drop imagery to purge metadata<br />
                      <span className="text-[8px] opacity-60">(JPG, PNG, WebP)</span>
                    </p>
                  </>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {originalImage && !isCleaned && (
                <div className="space-y-6 animate-in zoom-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-secondary border border-border flex items-center gap-4">
                        <Smartphone className="w-5 h-5 text-foreground/20" />
                        <div className="space-y-0.5">
                           <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Device Metadata</p>
                           <p className="text-[10px] font-bold text-foreground uppercase">Likely Present</p>
                        </div>
                     </div>
                     <div className="p-4 rounded-2xl bg-secondary border border-border flex items-center gap-4">
                        <Globe className="w-5 h-5 text-foreground/20" />
                        <div className="space-y-0.5">
                           <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">GPS Coordinates</p>
                           <p className="text-[10px] font-bold text-foreground uppercase">Likely Present</p>
                        </div>
                     </div>
                  </div>

                  <Button 
                    onClick={removeMetadata}
                    disabled={isProcessing}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                    Purge All Metadata
                  </Button>
                </div>
              )}

              {isCleaned && (
                <div className="p-6 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center gap-6 animate-in fade-in zoom-in duration-500">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Security Cleared</h4>
                    <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">
                      Pixel matrix re-encoded. All original EXIF, GPS, and manufacturer headers have been definitively removed.
                    </p>
                  </div>
                </div>
              )}

              <Button 
                variant="outline"
                onClick={handleClear}
                disabled={!originalImage || isProcessing}
                className="w-full h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
              >
                Reset Studio
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-xl overflow-hidden relative group">
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                 <Lock className="w-4 h-4" /> Privacy Intelligence
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
               <div className="space-y-6">
                  {[
                    { icon: Camera, title: "EXIF Headers", desc: "Purges camera model, lens settings, and technical timestamps." },
                    { icon: Globe, title: "GPS Matrix", desc: "Strips precise latitude and longitude coordinates." },
                    { icon: Smartphone, title: "App Signatures", desc: "Removes software and editing suite identifiers." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 group">
                       <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{item.title}</p>
                          <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-6 rounded-[2rem] bg-secondary border border-border">
                  <p className="text-[11px] text-foreground/50 leading-relaxed font-medium italic text-center">
                    "All visual sanitization is performed locally within your browser sandbox. Your photographs never leave your machine."
                  </p>
               </div>

               {cleanedImage && (
                 <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                    <Button 
                      onClick={handleDownload}
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <Download className="w-6 h-6" />
                      Download Clean Image
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-background border border-border text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Original</p>
                          <p className="text-[10px] font-bold text-foreground">With EXIF</p>
                       </div>
                       <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Sanitized</p>
                          <p className="text-[10px] font-bold text-primary">Metadata Purged</p>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Technical Protocol</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine utilizes bi-linear re-encoding via the Canvas API. By redrawing the pixel matrix onto a fresh canvas, all auxiliary binary headers (EXIF/JFIF/GPS) are definitively discarded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
