"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  FileImage, 
  Settings2, 
  Download, 
  Trash2, 
  Upload, 
  CheckCircle2,
  Info,
  Loader2,
  RefreshCcw,
  FileText,
  ImageIcon,
  Save,
  Maximize2,
  Zap,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

type TargetFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';

export default function ImageToFilePage() {
  const { toast } = useToast();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [format, setFormat] = useState<TargetFormat>('image/png');
  const [quality, setQuality] = useState(90);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({ variant: "destructive", title: "High Volume Asset", description: "Files over 20MB may impact browser performance." });
      }
      setFileInfo({ name: file.name, size: file.size, type: file.type });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setConvertedUrl(null);
        toast({ title: "Asset Imported", description: "Ready for studio translation." });
      };
      reader.readAsDataURL(file);
    }
  };

  const processConversion = useCallback(() => {
    if (!sourceImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = sourceImage;
    img.onload = () => {
      if (format === 'application/pdf') {
        try {
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'l' : 'p',
            unit: 'px',
            format: [img.width, img.height]
          });
          
          // PDF needs a clean canvas if we want to ensure zero metadata/transparency artifacts
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg', quality / 100);
            pdf.addImage(imgData, 'JPEG', 0, 0, img.width, img.height);
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setConvertedUrl(url);
          }
          setIsProcessing(false);
          toast({ title: "Document Synthesized", description: "Image wrapped in PDF master." });
        } catch (e) {
          setIsProcessing(false);
          toast({ variant: "destructive", title: "PDF Error", description: "Failed to generate document." });
        }
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(format, quality / 100);
        setConvertedUrl(dataUrl);
        setIsProcessing(false);
        toast({ title: "Matrix Translated", description: `Converted to ${format.split('/')[1].toUpperCase()}.` });
      }
    };
  }, [sourceImage, format, quality, toast]);

  const handleDownload = () => {
    if (!convertedUrl) return;
    const link = document.createElement('a');
    const ext = format === 'application/pdf' ? 'pdf' : format.split('/')[1].replace('jpeg', 'jpg');
    link.download = `translated-${fileInfo?.name.split('.')[0] || 'studio-asset'}.${ext}`;
    link.href = convertedUrl;
    link.click();
  };

  const handleClear = () => {
    setSourceImage(null);
    setConvertedUrl(null);
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <RefreshCcw className="w-3.5 h-3.5" /> Translation Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image to <span className="text-primary italic">File Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional multi-format translation engine. Convert visual assets between PNG, JPG, WebP, and PDF locally and securely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                Configuration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    sourceImage && "border-solid border-primary/40",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {sourceImage ? (
                    <div className="text-center p-6 space-y-2">
                       <ImageIcon className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{fileInfo?.name}</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{fileInfo?.type.split('/')[1].toUpperCase()}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-12 leading-relaxed">
                        Drop high-res imagery or click to browse<br />
                        <span className="text-[8px] opacity-60">(JPG, PNG, WEBP, GIF)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {sourceImage && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Target Format Protocol</Label>
                    <Select value={format} onValueChange={(val: any) => setFormat(val)}>
                      <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-foreground font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="image/png" className="text-xs font-bold uppercase">PNG (Lossless Master)</SelectItem>
                        <SelectItem value="image/jpeg" className="text-xs font-bold uppercase">JPG (Standard Profile)</SelectItem>
                        <SelectItem value="image/webp" className="text-xs font-bold uppercase">WebP (Next-Gen Optimized)</SelectItem>
                        <SelectItem value="application/pdf" className="text-xs font-bold uppercase">PDF (Document Wrap)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(format === 'image/jpeg' || format === 'image/webp' || format === 'application/pdf') && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        <Label>Encoding Quality Matrix</Label>
                        <span className="text-primary font-mono">{quality}%</span>
                      </div>
                      <Slider value={[quality]} min={10} max={100} step={1} onValueChange={(v) => setQuality(v[0])} />
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={processConversion}
                      disabled={isProcessing}
                      className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                      Start Conversion
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleClear}
                      disabled={isProcessing}
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
                Asset translation occurs entirely on your device via the Canvas rendering engine. Your imagery never leaves your browser session, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Studio Output
                </CardTitle>
                {convertedUrl && (
                   <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">Master Ready</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10 space-y-10">
              <div className="flex-1 relative group/preview min-h-[300px] flex items-center justify-center rounded-[2rem] bg-secondary/30 border border-border p-6 overflow-hidden">
                {convertedUrl ? (
                  <div className="w-full h-full flex flex-col gap-8">
                    {format === 'application/pdf' ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl border border-red-500/20">
                          <FileText className="w-12 h-12" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-black uppercase text-foreground">PDF Document Wrapper</p>
                          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Format: 1:1 Pixel Mapping</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden shadow-inner ring-1 ring-border">
                         <img src={convertedUrl} alt="Translated" className="max-h-[350px] w-auto object-contain drop-shadow-2xl" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="p-5 rounded-2xl bg-background border border-border flex items-center gap-4">
                          <ImageIcon className="w-5 h-5 text-foreground/20" />
                          <div>
                            <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Source Buffer</p>
                            <p className="text-xs font-bold text-foreground truncate uppercase">{fileInfo?.type.split('/')[1]}</p>
                          </div>
                       </div>
                       <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                          <Maximize2 className="w-5 h-5 text-primary/40" />
                          <div>
                            <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Translated Matrix</p>
                            <p className="text-xs font-bold text-primary uppercase">{format.split('/')[1] || 'pdf'}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : sourceImage ? (
                   <div className="text-center space-y-6">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <ArrowRightLeft className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Awaiting Synthesis</p>
                   </div>
                ) : (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity text-center">
                    <Settings2 className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                )}
              </div>

              {convertedUrl && (
                <div className="space-y-6">
                   <Button 
                    onClick={handleDownload}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95"
                  >
                    <Download className="w-6 h-6" />
                    Download Translated Master
                  </Button>

                  <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4 group">
                     <Save className="w-5 h-5 text-primary mt-0.5 shrink-0 transition-transform group-hover:translate-y-1" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Protocol</p>
                        <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                          Your asset was re-encoded using high-performance pixel interpolation. Metadata headers were purged for absolute privacy.
                        </p>
                     </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
