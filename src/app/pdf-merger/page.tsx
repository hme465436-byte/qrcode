
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileStack, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileText,
  ArrowUp,
  ArrowDown,
  Settings2,
  Layers,
  X,
  Plus,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PDFDocument } from 'pdf-lib';

interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

export default function PdfMergerPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<PDFFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    };
  }, [mergedUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newItems: PDFFileItem[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size
    }));

    setFiles(prev => [...prev, ...newItems]);
    setMergedUrl(null);
    toast({ title: "Assets Imported", description: `Added ${selectedFiles.length} PDF(s) to the pipeline.` });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      toast({ variant: "destructive", title: "Payload Incomplete", description: "At least 2 PDF documents are required for merging." });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setMergedUrl(url);
      toast({ title: "Production Complete", description: "Documents successfully unified." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Merge Failed", description: "Failed to process PDF matrix. Ensure files are valid." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setMergedUrl(null);
    setProgress(0);
    toast({ title: "Studio Reset", description: "Pipeline cleared." });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileStack className="w-3.5 h-3.5" /> Document Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          PDF <span className="text-primary italic">Merger Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional-grade document unification. Combine multiple PDF documents into a single master file locally in your browser with precision reordering.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sequence Manager */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  Sequence Manager
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-secondary border border-border">
                  <span className="text-[10px] font-mono text-primary font-black uppercase">{files.length} Docs</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative group/upload h-40 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">Import PDF Documents</p>
                <p className="text-[8px] text-foreground/20 uppercase font-bold mt-2">Add multiple files at once</p>
                <input type="file" ref={fileInputRef} accept="application/pdf" multiple onChange={handleFileUpload} className="hidden" />
              </div>

              {files.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Production Pipeline</Label>
                    <button onClick={handleClear} className="text-[10px] font-black uppercase text-destructive hover:opacity-70 transition-all">Purge All</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((f, index) => (
                      <div key={f.id} className="group/item flex items-center gap-4 p-5 rounded-3xl bg-secondary border border-border hover:border-primary/20 transition-all relative overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-red-500/40 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate uppercase pr-20">{f.name}</p>
                          <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest mt-1">{formatSize(f.size)} Payload</p>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-secondary/80 backdrop-blur-md pl-4 py-2 rounded-xl">
                          <Button variant="ghost" size="icon" onClick={() => moveFile(index, 'up')} disabled={index === 0} className="h-8 w-8 rounded-lg">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="h-8 w-8 rounded-lg">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Master Payload</p>
                        <p className="text-lg font-headline font-black text-foreground uppercase">{formatSize(files.reduce((acc, f) => acc + f.size, 0))} TOTAL</p>
                     </div>
                     <Button 
                      onClick={mergePdfs}
                      disabled={isProcessing || files.length < 2}
                      className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center gap-3 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                      Merge Documents
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output min-h-[260px] flex flex-col items-center justify-center rounded-[2.5rem] bg-secondary/30 border border-border p-10 text-center">
                {!mergedUrl && !isProcessing && (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                )}

                {mergedUrl && (
                  <div className="space-y-8 w-full animate-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">PDF Master Unified</h3>
                      <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Document stack processed</p>
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                    >
                      <a href={mergedUrl} download={`master-bundle-${Date.now()}.pdf`}>
                        <Download className="w-6 h-6" />
                        Download Master PDF
                      </a>
                    </Button>
                    <button onClick={handleClear} className="text-[9px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-all">Start New Project</button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                    Synthesis occurs entirely on your device using WebAssembly. Your documents never leave your browser, ensuring 100% data security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Master Protocol</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">1:1 binary page copying maintains original resolution and metadata.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
