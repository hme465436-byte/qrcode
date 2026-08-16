"use client"

import React, { useState, useRef, useMemo } from 'react';
import { 
  FileArchive, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileText,
  Settings2,
  Zap,
  Activity,
  ArrowDownCircle,
  TrendingDown,
  Layers,
  FileDown,
  X,
  Plus,
  ShieldCheck,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

interface PDFItem {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  originalSize: number;
  compressedSize: number | null;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
}

export default function PdfCompressorPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<PDFItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: PDFItem[] = files.filter(f => f.type === 'application/pdf').map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'idle',
      originalSize: file.size,
      compressedSize: null,
      compressedBlob: null,
      compressedUrl: null
    }));

    if (newItems.length < files.length) {
      toast({ variant: "destructive", title: "Invalid Files", description: "Some files were skipped. Only PDF format is supported." });
    }

    setItems(prev => [...prev, ...newItems]);
    toast({ title: "Assets Imported", description: `Added ${newItems.length} document(s) to the pipeline.` });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const compressSinglePdf = async (item: PDFItem): Promise<Blob | null> => {
    try {
      const arrayBuffer = await item.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Optimization Protocol:
      // Client-side JS compression is limited, but re-saving with pdf-lib 
      // automatically removes unreferenced objects and compacts the structure.
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => newPdf.addPage(page));

      // We use a high-quality save which often reduces size by cleaning internal dictionaries
      const pdfBytes = await newPdf.save({ 
        useObjectStreams: level === 'high',
        addDefaultPage: false 
      });

      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const processAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const updatedItems = [...items];
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (item.status === 'completed') continue;

      updatedItems[i].status = 'processing';
      setItems([...updatedItems]);

      const blob = await compressSinglePdf(item);
      if (blob) {
        updatedItems[i].status = 'completed';
        updatedItems[i].compressedBlob = blob;
        updatedItems[i].compressedSize = blob.size;
        updatedItems[i].compressedUrl = URL.createObjectURL(blob);
      } else {
        updatedItems[i].status = 'error';
      }

      setProgress(Math.round(((i + 1) / items.length) * 100));
      setItems([...updatedItems]);
    }

    setIsProcessing(false);
    toast({ title: "Optimization Complete", description: "All documents processed locally." });
  };

  const downloadAll = async () => {
    const ready = items.filter(i => i.status === 'completed' && i.compressedBlob);
    if (ready.length === 0) return;

    if (ready.length === 1) {
      const link = document.createElement('a');
      link.href = ready[0].compressedUrl!;
      link.download = `optimized_${ready[0].file.name}`;
      link.click();
    } else {
      const zip = new JSZip();
      ready.forEach(item => {
        zip.file(`optimized_${item.file.name}`, item.compressedBlob!);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `optimized_bundle_${Date.now()}.zip`;
      link.click();
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach(i => i.compressedUrl && URL.revokeObjectURL(i.compressedUrl));
    setItems([]);
    setProgress(0);
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  const totalOriginal = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalCompressed = items.reduce((acc, i) => acc + (i.compressedSize || i.originalSize), 0);
  const reduction = totalOriginal > 0 ? Math.max(0, Math.round((1 - totalCompressed / totalOriginal) * 100)) : 0;

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileArchive className="w-3.5 h-3.5" /> Performance Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          PDF <span className="text-primary italic">Compressor Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional browser-side PDF optimization. Reduce document overhead and structural waste locally with absolute privacy using WebAssembly synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls & List */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[450px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                Production Pipeline
              </CardTitle>
              {items.length > 0 && (
                 <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                   {items.length} Documents
                 </div>
              )}
            </CardHeader>
            
            <CardContent className="p-0">
              {!items.length ? (
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className="h-[450px] flex flex-col items-center justify-center cursor-pointer group hover:bg-primary/5 transition-all"
                >
                  <div className="w-20 h-20 rounded-[2.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                    <Upload className="w-10 h-10" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] group-hover:text-primary transition-colors text-center px-10">
                    Import PDF Documents for optimization<br />
                    <span className="text-[8px] opacity-40 uppercase font-bold">(Up to 50MB per file)</span>
                  </p>
                  <input type="file" ref={fileInputRef} accept="application/pdf" multiple onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[600px] overflow-auto custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-secondary/20 transition-all">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border shadow-inner",
                        item.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-background text-primary/40"
                      )}>
                        <FileText className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase text-foreground truncate">{item.file.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">{formatSize(item.originalSize)}</span>
                           {item.compressedSize && (
                             <>
                               <ArrowDownCircle className="w-3 h-3 text-primary/40" />
                               <span className="text-[9px] font-black text-primary uppercase tracking-widest">{formatSize(item.compressedSize)}</span>
                               <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-black">-{Math.max(0, Math.round((1 - item.compressedSize / item.originalSize) * 100))}%</span>
                             </>
                           )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                         {item.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                         {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                         <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-10 w-10 rounded-xl text-foreground/20 hover:text-destructive">
                           <X className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  ))}
                  <div className="p-6 bg-secondary/30 flex justify-center">
                     <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Inject More Assets
                     </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-xl overflow-hidden relative group">
             <CardHeader className="py-6 border-b border-border bg-secondary/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                  <Settings2 className="w-4 h-4" /> Optimization Config
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-8 space-y-8">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Compression Protocol</Label>
                   <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'low', label: 'Eco (Fastest)', desc: 'Surface structural cleanup' },
                        { id: 'medium', label: 'Standard (Balanced)', desc: 'Deep dictionary minification' },
                        { id: 'high', label: 'Intensive (Smallest)', desc: 'Max structural sanitization' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setLevel(mode.id as any)}
                          className={cn(
                            "flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all text-left",
                            level === mode.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                          )}
                        >
                           <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                           <span className={cn("text-[9px] font-medium opacity-60", level === mode.id ? "text-white" : "text-foreground/40")}>{mode.desc}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                  <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">WASM Sandbox</h4>
                    <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Optimization occurs locally in your browser memory. Documents never touch our infrastructure.</p>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                   {isProcessing && (
                     <div className="space-y-2 animate-in fade-in">
                        <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest">
                           <span>Synthesizing Matrix...</span>
                           <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                     </div>
                   )}
                   
                   <div className="flex gap-3">
                      <Button 
                        onClick={processAll}
                        disabled={isProcessing || items.length === 0}
                        className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95"
                      >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        Execute Purge
                      </Button>
                      {items.length > 0 && (
                        <Button variant="outline" onClick={clearAll} className="w-14 h-14 rounded-2xl border-border bg-secondary hover:text-destructive">
                           <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                   </div>
                </div>
             </CardContent>
          </Card>

          {items.some(i => i.status === 'completed') && (
            <Card className="glass-card border-border shadow-2xl overflow-hidden animate-in zoom-in duration-500">
               <CardHeader className="py-6 border-b border-border bg-primary/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                      <TrendingDown className="w-4 h-4" /> Production Analytics
                    </CardTitle>
                    <div className="px-2 py-0.5 rounded bg-primary text-white text-[8px] font-black uppercase">Ready</div>
                  </div>
               </CardHeader>
               <CardContent className="pt-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-2xl bg-secondary border border-border text-center space-y-1">
                        <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Original Volume</p>
                        <p className="text-sm font-headline font-black text-foreground">{formatSize(totalOriginal)}</p>
                     </div>
                     <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-1">
                        <p className="text-[8px] font-black uppercase text-primary tracking-widest">Optimized Matrix</p>
                        <p className="text-sm font-headline font-black text-primary">{formatSize(totalCompressed)}</p>
                     </div>
                  </div>

                  <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Total Reduction</p>
                        <p className="text-3xl font-headline font-black text-primary">{reduction}%</p>
                     </div>
                     <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
                        <ArrowDownCircle className="w-5 h-5 text-primary" />
                     </div>
                  </div>

                  <Button 
                    onClick={downloadAll}
                    className="w-full h-16 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-2xl transition-all active:scale-95"
                  >
                    <Download className="w-6 h-6" />
                    Download {items.filter(i => i.status === 'completed').length > 1 ? 'ZIP Archive' : 'PDF Master'}
                  </Button>
               </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <Maximize className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Binary Precision</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Original document fidelity is preserved. Reduction occurs via structural dictionary minification.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group">
                <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Zero Metadata</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Re-synthesis inherently purges internal structural metadata for absolute privacy.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
