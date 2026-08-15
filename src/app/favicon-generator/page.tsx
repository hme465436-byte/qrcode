"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Upload, 
  CheckCircle2,
  Info,
  Loader2,
  Maximize,
  FileArchive,
  LayoutGrid,
  Monitor,
  Smartphone,
  MousePointer2,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface FaviconSize {
  size: number;
  label: string;
  desc: string;
  icon: any;
  dataUrl: string | null;
}

const TARGET_SIZES = [
  { size: 16, label: '16x16', desc: 'Browser Tab', icon: MousePointer2 },
  { size: 32, label: '32x32', desc: 'Desktop Shortcut', icon: Monitor },
  { size: 48, label: '48x48', desc: 'Taskbar Icon', icon: Box },
  { size: 180, label: '180x180', desc: 'Apple Touch', icon: Smartphone },
];

export default function FaviconGeneratorPage() {
  const { toast } = useToast();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [favicons, setFavicons] = useState<FaviconSize[]>(
    TARGET_SIZES.map(s => ({ ...s, dataUrl: null }))
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for icons is 10MB." });
        return;
      }
      setFileInfo({ name: file.name, size: file.size });
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        toast({ title: "Asset Imported", description: "Ready for favicon synthesis." });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFavicons = useCallback(() => {
    if (!sourceImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceImage;
    img.onload = () => {
      const updatedFavicons = [...favicons];
      
      // Determine square crop bounds
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      updatedFavicons.forEach((favicon, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = favicon.size;
        canvas.height = favicon.size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, favicon.size, favicon.size);
        updatedFavicons[index].dataUrl = canvas.toDataURL('image/png');
      });

      setFavicons(updatedFavicons);
      setIsProcessing(false);
      toast({ title: "Synthesis Complete", description: "All sizes generated with auto-square cropping." });
    };
  }, [sourceImage, favicons, toast]);

  // Auto-generate on upload
  useEffect(() => {
    if (sourceImage) {
      generateFavicons();
    }
  }, [sourceImage]);

  const downloadZip = async () => {
    const hasIcons = favicons.some(f => f.dataUrl);
    if (!hasIcons) return;

    setIsProcessing(true);
    const zip = new JSZip();
    
    favicons.forEach(f => {
      if (f.dataUrl) {
        const base64Data = f.dataUrl.split(',')[1];
        zip.file(`favicon-${f.size}x${f.size}.png`, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `favicon-bundle-${Date.now()}.zip`;
    link.click();
    
    setIsProcessing(false);
    toast({ title: "Bundle Exported", description: "All icon sizes saved to ZIP." });
  };

  const handleClear = () => {
    setSourceImage(null);
    setFileInfo(null);
    setFavicons(TARGET_SIZES.map(s => ({ ...s, dataUrl: null })));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <LayoutGrid className="w-3.5 h-3.5" /> Web Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Favicon <span className="text-primary italic">Generator</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional browser-side icon synthesis. Transform any image into a standard favicon bundle with automated square cropping and multi-size scaling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input & Controls */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                Source Imagery
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative group/upload h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                  sourceImage && "border-solid border-primary/40",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                {sourceImage ? (
                  <div className="w-full h-full p-8 flex flex-col items-center justify-center gap-4">
                     <img src={sourceImage} alt="Source" className="max-h-32 w-auto rounded-xl shadow-2xl object-contain ring-1 ring-white/20" />
                     <div className="text-center">
                        <p className="text-xs font-black uppercase text-foreground truncate max-w-[200px]">{fileInfo?.name}</p>
                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{(fileInfo?.size || 0) > 0 ? (fileInfo!.size / 1024).toFixed(1) : 0} KB detected</p>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-10 leading-relaxed">
                      Drop imagery for icon synthesis<br />
                      <span className="text-[8px] opacity-60">(JPG, PNG, WebP)</span>
                    </p>
                  </>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {sourceImage && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Square Crop Active</p>
                      <p className="text-[10px] text-foreground/50 leading-relaxed font-medium">
                        Our engine automatically identifies the center matrix to ensure a perfect 1:1 aspect ratio for all sizes.
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={downloadZip}
                    disabled={isProcessing}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileArchive className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                    Download ZIP Bundle
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={handleClear}
                    disabled={isProcessing}
                    className="w-full h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Reset Studio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Guarantee</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Synthesis occurs entirely on your device via the Canvas rendering engine. Your imagery never leaves your browser session, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Output Previews */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {favicons.map((favicon) => (
              <Card key={favicon.label} className="glass-card border-border shadow-xl overflow-hidden group">
                <CardHeader className="py-5 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                      <favicon.icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{favicon.label}</p>
                      <p className="text-[8px] font-bold uppercase text-foreground/30">{favicon.desc}</p>
                    </div>
                  </div>
                  {favicon.dataUrl && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                </CardHeader>
                <CardContent className="p-10 flex items-center justify-center min-h-[160px] bg-white/20 dark:bg-black/20">
                  {favicon.dataUrl ? (
                    <div className="relative group/icon">
                       <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                       <img 
                        src={favicon.dataUrl} 
                        alt={favicon.label} 
                        style={{ width: favicon.size > 64 ? favicon.size : favicon.size * 2, height: favicon.size > 64 ? favicon.size : favicon.size * 2 }}
                        className="relative z-10 shadow-lg bg-white ring-1 ring-border"
                       />
                       {favicon.size <= 32 && (
                         <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-foreground/20 uppercase tracking-widest whitespace-nowrap">2x Preview Scale</p>
                       )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-10">
                      <Maximize className="w-10 h-10" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">Awaiting</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-6 bg-secondary/30 border-b border-border">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                 <Monitor className="w-4 h-4" /> Implementation Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] font-medium text-foreground/50 leading-relaxed">
                  <div className="space-y-3">
                     <p className="text-foreground font-black uppercase tracking-widest border-b border-primary/20 pb-2">HTML Setup</p>
                     <code className="block bg-secondary p-4 rounded-xl text-[9px] font-mono text-primary/80 overflow-x-auto whitespace-pre">
{`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`}
                     </code>
                  </div>
                  <div className="space-y-4 pt-1">
                     <p className="text-foreground font-black uppercase tracking-widest border-b border-primary/20 pb-2">Synthesis Protocol</p>
                     <p>Our generator utilizes hardware-accelerated bi-linear downsampling. This ensures that even high-resolution branding assets translate clearly to standard 16px and 32px tab grids.</p>
                     <div className="flex items-center gap-3 text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-black uppercase tracking-widest text-[9px]">Production-Ready Assets</span>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
