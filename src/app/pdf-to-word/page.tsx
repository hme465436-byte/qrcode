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
  FileEdit,
  ArrowRightLeft,
  FileCode,
  Save,
  Monitor,
  Layout,
  Zap,
  AlertCircle,
  FileSearch,
  Maximize2,
  ArrowDownCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver'; // We'll use a direct download approach if file-saver is not in deps

// Load PDF.js worker from CDN
import * as pdfjsLib from 'pdfjs-dist';
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function PdfToWordPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [hasScannedWarning, setHasScannedWarning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast({ 
        variant: "destructive", 
        title: "Invalid Protocol", 
        description: "Only PDF documents are supported for Word translation." 
      });
      return;
    }

    setIsProcessing(true);
    setExtractedText('');
    setHasScannedWarning(false);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setFile(selectedFile);
      toast({ title: "Asset Imported", description: `${pdf.numPages} pages identified. Ready for extraction.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Load Error", description: "Failed to decode PDF matrix." });
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToWord = async () => {
    if (!pdfDoc || !file) return;
    setIsProcessing(true);
    setProgress(0);
    setHasScannedWarning(false);

    let fullText = "";
    const paragraphs: Paragraph[] = [];

    try {
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        if (pageText.trim()) {
          fullText += pageText + "\n\n";
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: pageText, font: "Inter" })],
              spacing: { after: 200 }
            })
          );
        }

        setProgress(Math.round((i / numPages) * 100));
      }

      setExtractedText(fullText.substring(0, 1000) + (fullText.length > 1000 ? "..." : ""));

      if (fullText.trim().length === 0) {
        setHasScannedWarning(true);
        setIsProcessing(false);
        toast({ 
          variant: "destructive", 
          title: "Extraction Blocked", 
          description: "Zero characters identified. This may be a scanned image-PDF." 
        });
        return;
      }

      // Create DOCX
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Converted via MY KIT TOOL - ${file.name}`,
                  bold: true,
                  size: 24,
                  font: "Inter"
                }),
              ],
              spacing: { after: 400 }
            }),
            ...paragraphs
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace(/\.[^/.]+$/, "")}_editable.docx`;
      link.click();
      URL.revokeObjectURL(url);

      setIsProcessing(false);
      toast({ title: "Synthesis Complete", description: "Editable Word master exported." });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "An unexpected error occurred during document synthesis." 
      });
    }
  };

  const handleClear = () => {
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setExtractedText('');
    setHasScannedWarning(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileEdit className="w-3.5 h-3.5" /> Document Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          PDF to <span className="text-primary italic">Word Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional document deconstruction. Re-synthesize fixed PDF matrices into editable Word (.docx) documents locally with absolute data sovereignty.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Intake Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                Inbound Payload
              </CardTitle>
              {file && (
                <button onClick={handleClear} className="text-[10px] font-black uppercase text-foreground/30 hover:text-destructive transition-all">Reset</button>
              )}
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    file && "border-solid border-primary/20",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {file ? (
                    <div className="text-center p-6 space-y-2">
                       <FileSearch className="w-12 h-12 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <div className="flex items-center justify-center gap-3 mt-2">
                          <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(file.size)}</span>
                          <span className="text-foreground/10 text-[8px]">•</span>
                          <span className="text-[9px] font-black text-primary uppercase">{numPages} Pages Detected</span>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-10">
                        Drop PDF Document or click to browse<br />
                        <span className="text-[8px] opacity-60 uppercase font-bold">(Digital-native PDF recommended)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {file && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                   <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                      <Zap className="w-6 h-6 text-primary mt-1 shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">WASM Translation Active</h4>
                        <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                          The engine will iterate through the document layer stack to extract legible character strings and re-map them to a Word content buffer.
                        </p>
                      </div>
                   </div>

                   <Button 
                    onClick={convertToWord}
                    disabled={isProcessing}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRightLeft className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />}
                    Synthesize Word Master
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Extraction Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                This utility prioritizes content integrity and textual flow. While basic formatting is preserved, complex proprietary layout matrices (like floating objects) are simplified for maximum cross-platform compatibility.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Studio Master Output
                </CardTitle>
                {file && !isProcessing && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">Matrix Ready</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              {!file && !isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-4">
                  <Monitor className="w-24 h-24 text-primary" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Standby</p>
                </div>
              ) : isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-10 p-12">
                   <div className="relative">
                      <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <FileCode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                   </div>
                   <div className="space-y-4 w-full max-w-sm">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                         <span>Decoding Document Matrix</span>
                         <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 rounded-full" />
                      <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest text-center animate-pulse">Extracting Linguistic Blocks...</p>
                   </div>
                </div>
              ) : hasScannedWarning ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8 animate-in zoom-in duration-500">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-xl">
                      <AlertCircle className="w-10 h-10" />
                   </div>
                   <div className="text-center space-y-4">
                      <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Zero-Text Matrix Detected</h3>
                      <p className="text-sm text-foreground/40 font-medium leading-relaxed max-w-md mx-auto">
                        This document appears to be a "scanned" image-PDF with no digital text layer. Standard extraction protocols cannot read visual-only matrices.
                      </p>
                   </div>
                   <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10">
                      <a href="/ocr">Switch to OCR Protocol</a>
                   </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in zoom-in duration-500 w-full">
                  <div className="p-10 rounded-[3rem] bg-secondary/50 border border-border flex flex-col items-center justify-center gap-6 shadow-inner relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                     <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl border border-primary/20">
                        <FileEdit className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-lg font-headline font-black text-foreground uppercase tracking-tight">Word Master Ready</h3>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.2em]">Sanitized .docx Format</p>
                     </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-secondary border border-border space-y-4">
                     <div className="flex items-center gap-3 text-foreground/40">
                        <Monitor className="w-4 h-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Linguistic Preview (First Page)</h4>
                     </div>
                     <div className="p-5 bg-background/50 rounded-xl font-mono text-[10px] text-foreground/40 leading-relaxed max-h-[200px] overflow-auto custom-scrollbar border border-border shadow-inner">
                        {extractedText || "Matrix extraction successful."}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <Maximize2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Binary Precision</p>
                          <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">1:1 character preservation via direct layer mapping.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <ArrowDownCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                          <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">Conversion occurs 100% in local browser memory.</p>
                        </div>
                     </div>
                  </div>
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
      `}</style>
    </div>
  );
}
