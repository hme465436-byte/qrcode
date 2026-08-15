"use client"

import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Copy, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Image as ImageIcon,
  Languages,
  AlertCircle,
  Zap,
  Maximize,
  SlidersHorizontal,
  Eraser,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Tesseract from 'tesseract.js';

export default function OCRPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('eng');
  const [isCopied, setIsCopied] = useState(false);
  
  // Preprocessing Settings
  const [contrast, setContrast] = useState(1.2);
  const [upscale, setUpscale] = useState(2);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Asset Detected", description: "Standard limit for OCR is 15MB for browser stability." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult('');
        toast({ title: "Asset Imported", description: "Ready for optical preprocessing." });
      };
      reader.readAsDataURL(file);
    }
  };

  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);

        // Calculate upscaled dimensions
        canvas.width = img.width * upscale;
        canvas.height = img.height * upscale;

        // Apply filters: Grayscale + Contrast
        ctx.filter = `grayscale(1) contrast(${contrast})`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageSrc;
    });
  };

  const extractText = async () => {
    if (!image) {
      toast({ variant: "destructive", title: "Missing Payload", description: "Please import a visual asset first." });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setStatus('Preparing Matrix...');

    try {
      // Step 1: Preprocess the image for better OCR
      const processedImage = await preprocessImage(image);
      
      setStatus('Initializing Linguistic Engine...');

      const { data: { text } } = await Tesseract.recognize(
        processedImage,
        language,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              const p = Math.round(m.progress * 100);
              setProgress(p);
              setStatus(`Decoding Matrix... ${p}%`);
            } else {
              const readableStatus = m.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              setStatus(readableStatus);
            }
          },
        }
      );

      const trimmedText = text.trim();
      setResult(trimmedText);
      
      if (!trimmedText) {
        toast({ 
          variant: "destructive", 
          title: "Low Confidence", 
          description: "No legible text matrix identified. Adjust contrast or upscale settings." 
        });
      } else {
        toast({ title: "Extraction Complete", description: "Optical character identification successful." });
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      toast({ 
        variant: "destructive", 
        title: "Optical Analysis Failed", 
        description: "An unexpected error occurred in the linguistic engine." 
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatus('');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Extracted protocol saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared and memory purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileText className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Extract Text <span className="text-primary italic">(OCR)</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional-grade Optical Character Recognition. Convert images, documents, and captures into editable text instantly using a hardware-accelerated linguistic engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                Optical Input
              </CardTitle>
              {image && (
                 <button onClick={handleClear} className="text-[10px] font-black uppercase text-foreground/30 hover:text-destructive transition-all">Clear</button>
              )}
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* Image Upload Area */}
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-72 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    image && "border-solid border-primary/20",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {image ? (
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                      <img 
                        src={image} 
                        alt="Source" 
                        className="max-h-full w-auto object-contain rounded-xl shadow-xl transition-all group-hover/upload:opacity-40" 
                        style={{ filter: `grayscale(1) contrast(${contrast})` }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-all flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                         <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                           <Search className="w-6 h-6" />
                         </div>
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">Change Source Image</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-12 leading-relaxed">
                        Drop high-res document or click to browse<br />
                        <span className="text-[8px] opacity-60">(JPG, PNG, WebP up to 15MB)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {/* Preprocessing Controls */}
              {image && (
                <div className="p-8 rounded-[2rem] bg-secondary border border-border space-y-8 animate-in zoom-in duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Preprocessing Matrix</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        <Label>Contrast Boost</Label>
                        <span className="text-primary font-mono">{contrast.toFixed(1)}x</span>
                      </div>
                      <Slider value={[contrast]} min={1} max={3} step={0.1} onValueChange={(v) => setContrast(v[0])} />
                      <p className="text-[8px] text-foreground/20 font-bold uppercase">Improves character definition</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        <Label>Upscale Density</Label>
                        <span className="text-primary font-mono">{upscale}x</span>
                      </div>
                      <Slider value={[upscale]} min={1} max={4} step={1} onValueChange={(v) => setUpscale(v[0])} />
                      <p className="text-[8px] text-foreground/20 font-bold uppercase">Better for small text bodies</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                    <Languages className="w-3.5 h-3.5" /> Linguistic Profile
                  </Label>
                  <Select value={language} onValueChange={setLanguage} disabled={isProcessing}>
                    <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-foreground font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="eng" className="text-xs font-bold uppercase">English (Standard)</SelectItem>
                      <SelectItem value="urd" className="text-xs font-bold uppercase">Urdu (Nastaliq)</SelectItem>
                      <SelectItem value="eng+urd" className="text-xs font-bold uppercase">Bilingual (EN + UR)</SelectItem>
                      <SelectItem value="fra" className="text-xs font-bold uppercase">French</SelectItem>
                      <SelectItem value="deu" className="text-xs font-bold uppercase">German</SelectItem>
                      <SelectItem value="spa" className="text-xs font-bold uppercase">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button 
                    onClick={extractText}
                    disabled={isProcessing || !image}
                    className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    Extract Matrix
                  </Button>
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                    <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {status}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group-hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Linguistic Intelligence</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine works best on clear, high-contrast printed documents. Hand-drawn text identification is currently in beta with limited accuracy protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Decoded Content
                </CardTitle>
                {result && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-mono text-primary font-black uppercase tracking-widest shadow-sm">
                    {result.length.toLocaleString()} Chars
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output">
                <Textarea 
                  readOnly
                  value={result}
                  placeholder="Decoded text will appear here..."
                  className="w-full min-h-[480px] bg-white dark:bg-black/20 border-border text-foreground font-body rounded-[2.5rem] p-10 text-lg leading-relaxed resize-none shadow-inner custom-scrollbar transition-all overflow-auto"
                />
                {!result && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <FileText className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleCopy}
                  disabled={!result || isProcessing}
                  className={cn(
                    "flex-1 h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                    result ? "text-primary border-primary/20" : "opacity-50"
                  )}
                >
                  {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                  {isCopied ? 'Matrix Copied' : 'Copy Text'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([result], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'ocr-decoded-matrix.txt';
                    a.click();
                  }}
                  disabled={!result || isProcessing}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-primary transition-all active:scale-95"
                  title="Export .txt"
                >
                  <FileText className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                 <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      All optical analysis and linguistic decoding occur entirely within your browser sandbox. No data is transmitted to our servers.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
