"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileText,
  Settings2,
  Layers,
  X,
  Plus,
  Zap,
  Activity,
  Maximize2,
  Search,
  Monitor,
  LayoutGrid,
  Square,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PDFDocument, degrees } from 'pdf-lib';

// Load PDF.js worker from CDN with correct .mjs extension for v4.x
import * as pdfjsLib from 'pdfjs-dist';
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PageData {
  index: number;
  rotation: number; // Current relative rotation (0, 90, 180, 270)
  originalRotation: number; // Stored in the PDF
  thumbnail: string;
}

export default function PdfRotatorPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast({ variant: "destructive", title: "Invalid Protocol", description: "Only PDF documents are supported for rotation." });
      return;
    }

    setIsRendering(true);
    setProgress(0);
    setPages([]);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const loadedPages: PageData[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 }); // Low res for thumbs
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        loadedPages.push({
          index: i,
          rotation: 0,
          originalRotation: page.rotate,
          thumbnail: canvas.toDataURL()
        });
        
        setProgress(Math.round((i / numPages) * 100));
      }

      setPages(loadedPages);
      setFile(selectedFile);
      toast({ title: "Matrix Decoded", description: `${numPages} pages identified for production.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Load Error", description: "Failed to decode PDF matrix." });
    } finally {
      setIsRendering(false);
      setProgress(0);
    }
  };

  const rotatePage = (index: number, direction: 'cw' | 'ccw') => {
    setPages(prev => prev.map(p => {
      if (p.index === index) {
        const change = direction === 'cw' ? 90 : -90;
        let next = (p.rotation + change) % 360;
        if (next < 0) next += 360;
        return { ...p, rotation: next };
      }
      return p;
    }));
  };

  const rotateAll = (direction: 'cw' | 'ccw') => {
    setPages(prev => prev.map(p => {
      const change = direction === 'cw' ? 90 : -90;
      let next = (p.rotation + change) % 360;
      if (next < 0) next += 360;
      return { ...p, rotation: next };
    }));
    toast({ title: "Global Sync", description: `All pages rotated 90° ${direction === 'cw' ? 'clockwise' : 'counter-clockwise'}.` });
  };

  const resetAll = () => {
    setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
    toast({ title: "Studio Reset", description: "All manual rotations cleared." });
  };

  const saveFixedPdf = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      pages.forEach((p, i) => {
        if (p.rotation !== 0) {
          const page = pdfPages[i];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + p.rotation));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fixed_${file.name}`;
      link.click();
      
      toast({ title: "Production Complete", description: "Fixed PDF master exported." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Synthesis Failed", description: "Internal error during re-matricing." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Project Purged", description: "Workspace cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <RotateCw className="w-3.5 h-3.5" /> Geometry Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight">
                PDF <span className="text-primary italic">Page Rotator</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Clinical orientation management for PDF documents. Correct upside-down or sideways pages with pixel-perfect precision and absolute data privacy.
              </p>
           </div>
           {file && (
             <div className="flex gap-3">
                <Button variant="outline" onClick={handleClear} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button onClick={saveFixedPdf} disabled={isProcessing} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30">
                   {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                   Export Fixed PDF
                </Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              {!file ? (
                <div 
                  onClick={() => !isRendering && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all cursor-pointer overflow-hidden group/upload",
                    isRendering && "cursor-not-allowed opacity-80"
                  )}
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary transition-all mb-4 shadow-xl">
                    {isRendering ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                  </div>
                  <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest group-hover/upload:text-primary transition-colors">Import PDF Document</p>
                  <input type="file" ref={fileInputRef} accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="space-y-6 animate-in zoom-in duration-500">
                  <div className="p-6 rounded-3xl bg-secondary border border-border space-y-4">
                     <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Global Correction</Label>
                     <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => rotateAll('ccw')} className="h-12 bg-background border-border text-[9px] font-black uppercase tracking-widest rounded-xl hover:text-primary transition-all">
                           <RotateCcw className="w-3.5 h-3.5 mr-2" /> All Left 90°
                        </Button>
                        <Button variant="outline" onClick={() => rotateAll('cw')} className="h-12 bg-background border-border text-[9px] font-black uppercase tracking-widest rounded-xl hover:text-primary transition-all">
                           <RotateCw className="w-3.5 h-3.5 mr-2" /> All Right 90°
                        </Button>
                     </div>
                     <Button variant="ghost" onClick={resetAll} className="w-full text-[9px] font-black uppercase tracking-widest text-foreground/30 hover:text-destructive transition-colors">
                        Revert All Changes
                     </Button>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                    <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">WASM Sandbox</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        Orientation logic is executed locally. Re-matricing happens entirely within your browser session for 100% data security.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group hover:border-primary/20 transition-all">
                <Maximize2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Fidelity</p>
                  <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">Original document resolution and layer stack are preserved without compression artifacts.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group hover:border-primary/20 transition-all">
                <Layers className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Clinical Preview</p>
                  <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">Thumbnail rendering supports high-DPI scaling for accurate visual verification.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" /> Page Matrix
              </CardTitle>
              {file && (
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                   {pages.length} Pages Identified
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-6 sm:p-10 bg-[#060608]">
               {!file && !isRendering ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6 py-32">
                    <Monitor className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                 </div>
               ) : isRendering ? (
                 <div className="h-full flex flex-col items-center justify-center py-32 space-y-8">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 w-full max-w-xs">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                          <span>Rendering Matrix Thumbs...</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-1.5" />
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[800px] overflow-auto pr-2 custom-scrollbar p-1">
                    {pages.map((p) => (
                      <div key={p.index} className="flex flex-col gap-4 animate-in zoom-in duration-300">
                         <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 group/page">
                            <div className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-500 ease-in-out" style={{ transform: `rotate(${p.rotation}deg)` }}>
                               <img src={p.thumbnail} alt={`Page ${p.index}`} className="w-full h-full object-contain" />
                            </div>
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white text-[8px] font-black uppercase z-20">P.{p.index}</div>
                            {p.rotation !== 0 && (
                               <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg z-20">
                                  <Check className="w-3 h-3" />
                               </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/page:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm z-30">
                               <button onClick={() => rotatePage(p.index, 'ccw')} className="w-10 h-10 rounded-full bg-white/20 border border-white/40 text-white flex items-center justify-center hover:bg-primary transition-all">
                                  <RotateCcw className="w-4 h-4" />
                               </button>
                               <button onClick={() => rotatePage(p.index, 'cw')} className="w-10 h-10 rounded-full bg-white/20 border border-white/40 text-white flex items-center justify-center hover:bg-primary transition-all">
                                  <RotateCw className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Rotation</span>
                            <span className={cn("text-[9px] font-mono font-bold", p.rotation !== 0 ? "text-primary" : "text-foreground/20")}>{p.rotation}°</span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
