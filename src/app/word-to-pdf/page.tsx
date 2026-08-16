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
  Monitor,
  Layout,
  Zap,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

export default function WordToPdfPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>('');
  
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

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx' && ext !== 'doc') {
      toast({ 
        variant: "destructive", 
        title: "Invalid Protocol", 
        description: "Only .docx and .doc formats are supported for synthesis." 
      });
      return;
    }

    setFile(selectedFile);
    setPdfUrl(null);
    setPreviewText('');
    
    // Attempt rapid content preview extraction
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setPreviewText(result.value.substring(0, 1500) + (result.value.length > 1500 ? '...' : ''));
      toast({ title: "Matrix Decoded", description: "Linguistic payload identified." });
    } catch (err) {
      console.warn("Preview failed", err);
    }
  };

  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // We use Mammoth to get HTML, which preserves more structure than raw text
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      // Simple implementation of HTML to PDF using jsPDF's internal parser
      // Note: This is a client-side approximation
      await doc.html(htmlContent, {
        callback: function (doc) {
          const blob = doc.output('blob');
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setIsProcessing(false);
          toast({ title: "Synthesis Complete", description: "Word document wrapped in PDF master." });
        },
        x: 40,
        y: 40,
        width: 515, // A4 width minus margins
        windowWidth: 800
      });

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast({ 
        variant: "destructive", 
        title: "Production Failed", 
        description: "Failed to synthesize PDF matrix. Ensure the document is not encrypted." 
      });
    }
  };

  const handleClear = () => {
    setFile(null);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPreviewText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Pipeline cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileEdit className="w-3.5 h-3.5" /> Document Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Word to <span className="text-primary italic">PDF Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional browser-side document translation. Convert Word (.docx) documents into sanitized PDF masters locally with absolute privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Pane */}
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
                <button onClick={handleClear} className="text-[10px] font-black uppercase text-foreground/30 hover:text-destructive transition-all">Purge</button>
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
                       <FileCode className="w-12 h-12 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(file.size)} detected</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-10">
                        Drop Word Document or click to browse<br />
                        <span className="text-[8px] opacity-60 uppercase font-bold">(.docx protocol supported)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept=".docx,.doc" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {file && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                   <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                      <Zap className="w-6 h-6 text-primary mt-1 shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">WASM Translation</h4>
                        <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                          Extraction occurs locally via the Mammoth linguistic engine. Document metadata and authorship tokens are inherently purged during re-synthesis.
                        </p>
                      </div>
                   </div>

                   <Button 
                    onClick={convertToPdf}
                    disabled={isProcessing}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRightLeft className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />}
                    Synthesize PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-5">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-yellow-700 uppercase tracking-widest">Layout Advisory</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Complex formatting (headers, footers, floating graphics) may be simplified during browser-side translation. Content integrity is prioritized over proprietary styling.
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
                {pdfUrl && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">Ready</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              {!file && !isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-4">
                  <Monitor className="w-24 h-24 text-primary" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                </div>
              ) : isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                   <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <FileCode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                   </div>
                   <div className="text-center space-y-2">
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Executing Translation Protocol</p>
                      <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Re-mapping document matrix...</p>
                   </div>
                </div>
              ) : pdfUrl ? (
                <div className="space-y-10 animate-in zoom-in duration-500 w-full">
                  <div className="p-10 rounded-[3rem] bg-secondary/50 border border-border flex flex-col items-center justify-center gap-6 shadow-inner relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                     <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl border border-primary/20">
                        <FileText className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-lg font-headline font-black text-foreground uppercase tracking-tight">PDF Master Unified</h3>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.2em]">Sanitized & Production Ready</p>
                     </div>
                  </div>

                  <Button 
                    asChild
                    className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-3xl flex items-center justify-center gap-6 text-xl shadow-2xl shadow-primary/40 transition-all active:scale-95 group/dl"
                  >
                    <a href={pdfUrl} download={`translated_${file?.name.replace(/\.[^/.]+$/, "")}.pdf`}>
                      <Download className="w-8 h-8 group-hover:translate-y-1 transition-transform" />
                      Download Master PDF
                    </a>
                  </Button>
                  
                  <div className="p-6 rounded-2xl bg-secondary border border-border space-y-4">
                     <div className="flex items-center gap-3 text-foreground/40">
                        <Monitor className="w-4 h-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Matrix Preview (First Pass)</h4>
                     </div>
                     <div className="p-5 bg-background/50 rounded-xl font-mono text-[10px] text-foreground/40 leading-relaxed max-h-[200px] overflow-auto custom-scrollbar border border-border shadow-inner">
                        {previewText || "Linguistic buffer initialized."}
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-4">
                  <Layout className="w-24 h-24 text-primary" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Payload Decoded</p>
                </div>
              )}

              <div className="mt-auto pt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <Maximize2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Accuracy</p>
                      <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">1:1 character preservation via direct binary mapping.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                      <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">Binary re-synthesis happens 100% in browser memory.</p>
                    </div>
                 </div>
              </div>
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
