"use client"

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  FileImage, 
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
  FileArchive,
  FileDown,
  LayoutList,
  AlertCircle,
  ImageIcon,
  Maximize,
  Search,
  Maximize2,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

// Load PDF.js worker from CDN with correct .mjs extension for v4.x
import * as pdfjsLib from 'pdfjs-dist';
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PageResult {
  index: number;
  dataUrl: string;
  blob: Blob;
}

export default function PdfToImagePage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<PageResult[]>([]);
  
  // Settings
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [dpi, setDpi] = useState('150');
  const [rangeMode, setRangeMode] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState('1');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast({ variant: "destructive", title: "Invalid Protocol", description: "Only PDF documents are supported for conversion." });
      return;
    }

    setIsProcessing(true);
    setResults([]);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setFile(selectedFile);
      toast({ title: "Asset Imported", description: `${pdf.numPages} pages identified. Ready for rendering.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Load Error", description: "Failed to decode PDF matrix." });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseRanges = (input: string, max: number): number[] => {
    const parts = input.split(',').map(p => p.trim());
    const pages = new Set<number>();

    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, Math.min(start, max));
          const e = Math.max(1, Math.min(end, max));
          for (let i = Math.min(s, e); i <= Math.max(s, e); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= max) {
          pages.add(num);
        }
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const targetPages = useMemo(() => {
    if (!numPages) return [];
    if (rangeMode === 'all') return Array.from({ length: numPages }, (_, i) => i + 1);
    return parseRanges(customRange, numPages);
  }, [numPages, rangeMode, customRange]);

  const convertPdf = async () => {
    if (!pdfDoc || targetPages.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const scale = parseInt(dpi) / 72; // Standard PDF DPI is 72
    const currentResults: PageResult[] = [];

    try {
      for (let i = 0; i < targetPages.length; i++) {
        const pageNum = targetPages[i];
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const dataUrl = canvas.toDataURL(format, 0.95);
        
        // Convert to Blob for ZIP
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), format, 0.95);
        });

        currentResults.push({
          index: pageNum,
          dataUrl,
          blob: blob as Blob
        });

        setProgress(Math.round(((i + 1) / targetPages.length) * 100));
        setResults([...currentResults]);
      }

      toast({ title: "Synthesis Complete", description: `Converted ${currentResults.length} pages to imagery.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Production Failed", description: "Internal error during rendering cycle." });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      const link = document.createElement('a');
      link.href = results[0].dataUrl;
      link.download = `page_${results[0].index}.${format === 'image/png' ? 'png' : 'jpg'}`;
      link.click();
    } else {
      const zip = new JSZip();
      results.forEach((res) => {
        zip.file(`page_${res.index}.${format === 'image/png' ? 'png' : 'jpg'}`, res.blob);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `pdf_images_bundle_${Date.now()}.zip`;
      link.click();
    }
  };

  const handleClear = () => {
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setResults([]);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory buffer purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ImageIcon className="w-3.5 h-3.5" /> Translation Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          PDF to <span className="text-primary italic">Image Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          High-fidelity document rendering. Convert PDF pages into professional-grade PNG or JPG assets locally in your browser with absolute privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                Asset Intake
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                  file && "border-solid border-primary/40",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                {file ? (
                  <div className="text-center p-6 space-y-2">
                     <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
                     <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                     <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{numPages} Pages Detected</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center">Import PDF Document</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              </div>

              {file && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Range Matrix</Label>
                    <Tabs value={rangeMode} onValueChange={(v: any) => setRangeMode(v)} className="w-full">
                       <TabsList className="grid grid-cols-2 bg-background border border-border p-1 rounded-2xl h-12">
                          <TabsTrigger value="all" className="rounded-xl text-[9px] font-black uppercase">All Pages</TabsTrigger>
                          <TabsTrigger value="custom" className="rounded-xl text-[9px] font-black uppercase">Custom Range</TabsTrigger>
                       </TabsList>
                       {rangeMode === 'custom' && (
                         <div className="mt-4 animate-in slide-in-from-top-2">
                           <Input 
                            value={customRange}
                            onChange={(e) => setCustomRange(e.target.value)}
                            placeholder="e.g. 1, 3-5"
                            className="h-12 bg-secondary border-border rounded-xl font-mono text-sm"
                           />
                         </div>
                       )}
                    </Tabs>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Format</Label>
                      <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="image/png" className="text-[10px] font-black uppercase">PNG (Lossless)</SelectItem>
                          <SelectItem value="image/jpeg" className="text-[10px] font-black uppercase">JPG (Efficient)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Resolution (DPI)</Label>
                      <Select value={dpi} onValueChange={setDpi}>
                        <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          <SelectItem value="72" className="text-[10px] font-black uppercase">72 DPI (Standard)</SelectItem>
                          <SelectItem value="150" className="text-[10px] font-black uppercase">150 DPI (High-Res)</SelectItem>
                          <SelectItem value="300" className="text-[10px] font-black uppercase">300 DPI (Master)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={convertPdf}
                      disabled={isProcessing || !file || targetPages.length === 0}
                      className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />}
                      Start Conversion
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleClear}
                      className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Conversion occurs entirely on your device via the Canvas rendering engine. Your documents never leave your browser sandbox, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Render Pipeline
              </CardTitle>
              {results.length > 0 && (
                <Button 
                  onClick={downloadAll}
                  className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg"
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Save {results.length > 1 ? 'Bundle ZIP' : 'Image'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-8">
              {!file && !isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 space-y-6 py-20">
                  <Monitor className="w-24 h-24 text-primary" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                </div>
              ) : isProcessing && results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-4 w-full max-w-xs">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                       <span>Negotiating Matrix...</span>
                       <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar p-1">
                   {results.map((res) => (
                     <div key={res.index} className="group relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-xl ring-1 ring-border animate-in zoom-in duration-300">
                        <img src={res.dataUrl} alt={`Page ${res.index}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                           <p className="text-[10px] font-black text-white uppercase tracking-widest">Page {res.index}</p>
                           <Button asChild size="sm" variant="outline" className="h-8 bg-white/20 border-white/40 text-white hover:bg-primary hover:border-primary text-[9px] font-black uppercase">
                             <a href={res.dataUrl} download={`page_${res.index}.${format.split('/')[1]}`}>
                               <Download className="w-3 h-3 mr-1.5" /> Download
                             </a>
                           </Button>
                        </div>
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/40 text-white text-[8px] font-black uppercase tracking-widest">P.{res.index}</div>
                     </div>
                   ))}
                   {isProcessing && (
                     <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 bg-primary/5 animate-pulse">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest">Rendering Next...</p>
                     </div>
                   )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <Maximize2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Density</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">300 DPI support ensures peak fidelity for document archiving and large-format print.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <FileArchive className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Bundle Protocol</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Automatic ZIP packaging for high-volume conversion cycles ensures efficient local storage.</p>
                </div>
             </div>
          </div>
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
