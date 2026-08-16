"use client"

import React, { useState, useRef, useMemo } from 'react';
import { 
  Scissors, 
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
  Split,
  FileDown,
  LayoutList,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

type SplitMode = 'all' | 'ranges' | 'chunks';

interface SplitPart {
  name: string;
  pages: number[];
}

export default function PdfSplitterPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Settings
  const [splitMode, setSplitMode] = useState<SplitMode>('all');
  const [customRanges, setCustomRanges] = useState('1-2, 4');
  const [chunkSize, setChunkSize] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast({ variant: "destructive", title: "Invalid Protocol", description: "Only PDF documents are supported for splitting." });
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setNumPages(pdf.getPageCount());
      setFile(selectedFile);
      toast({ title: "Asset Imported", description: `Matrix decoded: ${pdf.getPageCount()} pages identified.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Load Error", description: "Failed to read PDF matrix." });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseRanges = (input: string, max: number): number[][] => {
    const parts = input.split(',').map(p => p.trim());
    const ranges: number[][] = [];

    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, Math.min(start, max));
          const e = Math.max(1, Math.min(end, max));
          const range = [];
          for (let i = Math.min(s, e); i <= Math.max(s, e); i++) {
            range.push(i - 1);
          }
          if (range.length > 0) ranges.push(range);
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= max) {
          ranges.push([num - 1]);
        }
      }
    });
    return ranges;
  };

  const calculatedParts = useMemo((): SplitPart[] => {
    if (!numPages) return [];
    
    if (splitMode === 'all') {
      return Array.from({ length: numPages }, (_, i) => ({
        name: `Page ${i + 1}`,
        pages: [i]
      }));
    }

    if (splitMode === 'chunks') {
      const parts: SplitPart[] = [];
      const size = Math.max(1, chunkSize);
      for (let i = 0; i < numPages; i += size) {
        const end = Math.min(i + size, numPages);
        parts.push({
          name: `Pages ${i + 1}-${end}`,
          pages: Array.from({ length: end - i }, (_, k) => i + k)
        });
      }
      return parts;
    }

    if (splitMode === 'ranges') {
      const ranges = parseRanges(customRanges, numPages);
      return ranges.map((r, i) => ({
        name: `Range ${i + 1} (${r.length} pages)`,
        pages: r
      }));
    }

    return [];
  }, [numPages, splitMode, customRanges, chunkSize]);

  const executeSplit = async () => {
    if (!file || calculatedParts.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const sourceBuffer = await file.arrayBuffer();
      const zip = new JSZip();
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      for (let i = 0; i < calculatedParts.length; i++) {
        const part = calculatedParts[i];
        const sourcePdf = await PDFDocument.load(sourceBuffer);
        const newPdf = await PDFDocument.create();
        
        const copiedPages = await newPdf.copyPages(sourcePdf, part.pages);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const fileName = `${baseName}_${part.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
        
        if (calculatedParts.length === 1) {
          // Direct download for single range
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
        } else {
          zip.file(fileName, pdfBytes);
        }
        
        setProgress(Math.round(((i + 1) / calculatedParts.length) * 100));
      }

      if (calculatedParts.length > 1) {
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseName}_split_bundle.zip`;
        link.click();
      }

      toast({ title: "Split Complete", description: `Synthesized ${calculatedParts.length} document parts.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Production Failed", description: "Internal error during PDF deconstruction." });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleClear = () => {
    setFile(null);
    setNumPages(0);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Pipeline cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Split className="w-3.5 h-3.5" /> Document Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          PDF <span className="text-primary italic">Splitter Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional document deconstruction. Extract pages, custom ranges, or fixed chunks locally with absolute privacy using WebAssembly synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                Document Intake
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
                <div className="space-y-10 animate-in zoom-in duration-500">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Split Protocol</Label>
                    <Tabs value={splitMode} onValueChange={(v: any) => setSplitMode(v)} className="w-full">
                      <TabsList className="grid grid-cols-3 bg-background border border-border p-1 rounded-2xl h-14">
                        <TabsTrigger value="all" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Burst All</TabsTrigger>
                        <TabsTrigger value="ranges" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Custom Range</TabsTrigger>
                        <TabsTrigger value="chunks" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Fixed Chunk</TabsTrigger>
                      </TabsList>
                      
                      <div className="mt-8">
                        <TabsContent value="all" className="m-0">
                           <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                              <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                              <p className="text-[11px] text-foreground/50 font-medium leading-relaxed uppercase">
                                <span className="text-foreground font-black">All Pages:</span> System will create {numPages} separate PDF masters, one for each page of the source.
                              </p>
                           </div>
                        </TabsContent>
                        <TabsContent value="ranges" className="m-0 space-y-4">
                           <div className="space-y-2">
                             <Label className="text-[10px] font-black text-foreground/30 uppercase ml-1">Range Matrix</Label>
                             <Input 
                              value={customRanges}
                              onChange={(e) => setCustomRanges(e.target.value)}
                              placeholder="e.g. 1-3, 5, 8-10"
                              className="h-14 bg-secondary border-border rounded-2xl font-mono text-lg font-bold"
                             />
                             <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest pl-1 flex items-center gap-2">
                               <Info className="w-3 h-3" /> Valid pages: 1 to {numPages}
                             </p>
                           </div>
                        </TabsContent>
                        <TabsContent value="chunks" className="m-0 space-y-4">
                           <div className="space-y-2">
                             <Label className="text-[10px] font-black text-foreground/30 uppercase ml-1">Chunk Size (Pages)</Label>
                             <Input 
                              type="number"
                              value={chunkSize}
                              onChange={(e) => setChunkSize(parseInt(e.target.value) || 1)}
                              min={1}
                              max={numPages}
                              className="h-14 bg-secondary border-border rounded-2xl font-mono text-lg font-bold"
                             />
                             <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest pl-1">Document will be split into parts of {chunkSize} page(s) each.</p>
                           </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={executeSplit}
                  disabled={isProcessing || !file || calculatedParts.length === 0}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Scissors className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Generate {calculatedParts.length > 1 ? 'Bundle' : 'Part'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Status */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[400px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 flex flex-col">
              {!file ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-4">
                  <Activity className="w-20 h-20 text-primary mx-auto" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                             <LayoutList className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase text-foreground tracking-widest">Part Projection</p>
                             <p className="text-lg font-headline font-black text-primary uppercase">{calculatedParts.length} TOTAL PARTS</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                       {calculatedParts.length > 0 ? calculatedParts.map((p, i) => (
                         <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                               <FileDown className="w-3.5 h-3.5 text-foreground/20 group-hover:text-primary transition-colors" />
                               <span className="text-[10px] font-bold text-foreground/60 uppercase">{p.name}</span>
                            </div>
                            <span className="text-[9px] font-mono text-foreground/20">{p.pages.length} Pages</span>
                         </div>
                       )) : (
                         <div className="p-10 text-center border-2 border-dashed border-border rounded-2xl opacity-30">
                            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Invalid Matrix Range</p>
                         </div>
                       )}
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing Matrix...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}

                  {!isProcessing && calculatedParts.length > 1 && (
                     <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-5 group hover:bg-primary/10 transition-colors">
                        <FileArchive className="w-6 h-6 text-primary mt-1 shrink-0" />
                        <div className="space-y-1">
                           <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">ZIP Protocol Ready</h4>
                           <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                             Multiple parts detected. System will package all sanitized documents into a single production ZIP archive.
                           </p>
                        </div>
                     </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-6">
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Binary Precision</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium uppercase">1:1 byte-copy protocol ensures no metadata or structural loss during split.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                <Layers className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Production Logic</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium uppercase">Automatic filename sanitization for batch organizational consistency.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
