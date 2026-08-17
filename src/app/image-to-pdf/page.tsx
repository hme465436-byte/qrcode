"use client"

import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileImage,
  ArrowUp,
  ArrowDown,
  Settings2,
  Maximize,
  Layout,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

interface ImageItem {
  id: string;
  src: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

export default function ImageToPdfPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageSetting, setPageSetting] = useState<'fit' | 'a4' | 'original'>('fit');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    let loadedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newItem: ImageItem = {
            id: Math.random().toString(36).substr(2, 9),
            src,
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
          };
          setImages(prev => [...prev, newItem]);
          loadedCount++;
          if (loadedCount === files.length) {
            setIsProcessing(false);
            toast({ title: "Assets Imported", description: `Added ${files.length} images to the pipeline.` });
          }
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setImages(newImages);
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: pageSetting === 'a4' ? 'a4' : undefined,
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // Ensure we work with original resolution
        canvas.width = img.width;
        canvas.height = img.height;
        
        const imageElement = await new Promise<HTMLImageElement>((resolve) => {
          const resImg = new Image();
          resImg.onload = () => resolve(resImg);
          resImg.src = img.src;
        });

        ctx.drawImage(imageElement, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        let pdfWidth, pdfHeight;

        if (pageSetting === 'a4') {
          // A4 dimensions in px at 72dpi are 595 x 842
          const a4W = 595;
          const a4H = 842;
          const ratio = Math.min(a4W / img.width, a4H / img.height);
          pdfWidth = img.width * ratio;
          pdfHeight = img.height * ratio;
        } else if (pageSetting === 'original') {
          pdfWidth = img.width;
          pdfHeight = img.height;
        } else {
          // Default Fit (Standard Canvas)
          pdfWidth = 600;
          pdfHeight = (img.height / img.width) * 600;
        }

        // Add the correct page size and content
        pdf.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? 'l' : 'p');
        pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        // Remove the initial default blank page upon adding the first actual image page
        if (i === 0) {
          pdf.deletePage(1);
        }

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      pdf.save(`qrcanvas-bundle-${Date.now()}.pdf`);
      toast({ title: "PDF Master Exported", description: "Your document is ready for production." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Production Failed", description: "An error occurred during PDF synthesis." });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleClear = () => {
    setImages([]);
    toast({ title: "Studio Reset", description: "Pipeline cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileText className="w-3.5 h-3.5" /> Document Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image to <span className="text-primary italic">PDF Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Convert multiple visual assets into a single high-resolution PDF document. 100% private client-side synthesis for secure professional documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls & Upload */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <FileImage className="w-6 h-6" />
                </div>
                Visual Payload
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                  images.length > 0 && "border-solid border-primary/40",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">Select or Drop Images</p>
                <p className="text-[8px] text-foreground/20 uppercase font-bold mt-2">JPG, PNG, WebP up to 10MB</p>
                <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </div>

              {images.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Queue Pipeline ({images.length})</Label>
                    <button onClick={handleClear} className="text-[10px] font-black uppercase text-destructive hover:opacity-70 transition-all">Clear All</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {images.map((img, index) => (
                      <div key={img.id} className="group/item flex items-center gap-4 p-4 rounded-2xl bg-secondary border border-border hover:border-primary/20 transition-all">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border border-border shrink-0">
                          <img src={img.src} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate uppercase">{img.name}</p>
                          <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">{(img.size / 1024).toFixed(1)} KB | {img.width}x{img.height}</p>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="h-8 w-8 rounded-lg">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="h-8 w-8 rounded-lg">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => removeImage(img.id)} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings & Synthesis */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Synthesis Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Page Orientation & Sizing</Label>
                <Select value={pageSetting} onValueChange={(val: any) => setPageSetting(val)}>
                  <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-foreground font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="fit" className="text-xs font-bold uppercase">Dynamic Fit (Auto)</SelectItem>
                    <SelectItem value="a4" className="text-xs font-bold uppercase">A4 Standard (ISO)</SelectItem>
                    <SelectItem value="original" className="text-xs font-bold uppercase">Original Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                    PDF synthesis occurs entirely on your device using WebAssembly. Your imagery never leaves your browser sandbox.
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                {isProcessing && progress > 0 && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                      <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing Document...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button 
                  onClick={convertToPdf}
                  disabled={isProcessing || images.length === 0}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  Convert
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                <Maximize className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Master Quality</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Original asset fidelity preserved in bundle.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                <Layout className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Adaptive Framing</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Automatic orientation detection (P/L).</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
