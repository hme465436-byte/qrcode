
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
  AlertTriangle,
  ArrowLeftRight,
  ImageIcon,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ImageConverterPage() {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg'>('image/jpeg');
  const [quality, setQuality] = useState(90);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({ variant: "destructive", title: "High Volume Asset", description: "Files over 15MB may impact browser performance." });
      }
      setFileInfo({ name: file.name, size: file.size, type: file.type });
      
      // Auto-set output format to the opposite of input
      if (file.type === 'image/png') {
        setOutputFormat('image/jpeg');
      } else {
        setOutputFormat('image/png');
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setConvertedImage(null);
        toast({ title: "Asset Imported", description: `Detected ${file.type.split('/')[1].toUpperCase()} format.` });
      };
      reader.readAsDataURL(file);
    }
  };

  const processConversion = useCallback(() => {
    if (!originalImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // For JPG conversion, we need a solid background because JPG doesn't support transparency
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const result = canvas.toDataURL(outputFormat, outputFormat === 'image/jpeg' ? quality / 100 : undefined);
      setConvertedImage(result);
      setIsProcessing(false);
      toast({ 
        title: "Conversion Complete", 
        description: `Matrix translated to ${outputFormat.split('/')[1].toUpperCase()}.` 
      });
    };
  }, [originalImage, outputFormat, quality, toast]);

  const handleDownload = () => {
    if (!convertedImage) return;
    const link = document.createElement('a');
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : 'png';
    link.download = `converted-${fileInfo?.name.split('.')[0] || 'studio-asset'}.${ext}`;
    link.href = convertedImage;
    link.click();
  };

  const handleClear = () => {
    setOriginalImage(null);
    setConvertedImage(null);
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory purged and fields cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <RefreshCcw className="w-3.5 h-3.5" /> Translation Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          PNG ↔ JPG <span className="text-primary italic">Converter</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional format translation with transparency management. Seamlessly convert between high-fidelity PNG and optimized JPG architectures locally.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Controls Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <FileImage className="w-6 h-6" />
                </div>
                Format Configuration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* Upload Zone */}
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    originalImage && "border-solid border-primary/40",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {originalImage ? (
                    <div className="text-center p-6 space-y-2">
                       <ImageIcon className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{fileInfo?.name}</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{fileInfo?.type.split('/')[1].toUpperCase()} | {formatSize(fileInfo?.size || 0)}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6">
                        Drop PNG or JPG or click to browse
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {/* Conversion Logic */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Target Format</Label>
                  <div className="grid grid-cols-2 gap-4">
                     <button
                        onClick={() => setOutputFormat('image/png')}
                        className={cn(
                          "h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                          outputFormat === 'image/png' ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                        )}
                     >
                       PNG (Lossless)
                     </button>
                     <button
                        onClick={() => setOutputFormat('image/jpeg')}
                        className={cn(
                          "h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                          outputFormat === 'image/jpeg' ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                        )}
                     >
                       JPG (Standard)
                     </button>
                  </div>
                </div>

                {outputFormat === 'image/jpeg' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      <Label>JPG Quality Buffer</Label>
                      <span className="text-primary font-mono">{quality}%</span>
                    </div>
                    <Slider value={[quality]} min={10} max={100} step={1} onValueChange={(v) => setQuality(v[0])} />
                  </div>
                )}

                {fileInfo?.type === 'image/png' && outputFormat === 'image/jpeg' && (
                  <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-3 animate-in zoom-in duration-500">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-yellow-600/70 uppercase tracking-widest">Transparency Warning</p>
                      <p className="text-[9px] text-foreground/40 leading-relaxed font-medium">
                        JPG does not support alpha channels. Transparent areas will be rendered as solid white in the final matrix.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={processConversion}
                  disabled={!originalImage || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />}
                  Generate Conversion
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

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Conversions occur entirely on your device via the Canvas rendering engine. Your imagery never leaves your browser session, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Studio Output
                </CardTitle>
                {convertedImage && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                    {outputFormat.split('/')[1].toUpperCase()} Master Ready
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10 space-y-10">
              <div className="flex-1 relative group/preview min-h-[300px] flex items-center justify-center rounded-[2rem] bg-secondary/30 border border-border p-6 overflow-hidden">
                {convertedImage ? (
                  <div className="w-full h-full flex flex-col gap-6">
                    <div className={cn(
                      "flex-1 flex items-center justify-center rounded-xl overflow-hidden shadow-inner ring-1 ring-border",
                      outputFormat === 'image/png' ? "bg-checkered" : "bg-white"
                    )}>
                      <img src={convertedImage} alt="Converted" className="max-h-[300px] w-auto object-contain drop-shadow-2xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-background border border-border text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Original Type</p>
                          <p className="text-xs font-bold text-foreground">{fileInfo?.type.split('/')[1].toUpperCase()}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Converted Type</p>
                          <p className="text-xs font-bold text-primary">{outputFormat.split('/')[1].toUpperCase()}</p>
                       </div>
                    </div>
                  </div>
                ) : originalImage ? (
                   <div className="text-center space-y-6">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <ArrowLeftRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Pending Transformation</p>
                   </div>
                ) : (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity text-center">
                    <Settings2 className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No target detected</p>
                  </div>
                )}
              </div>

              {convertedImage && (
                <div className="space-y-6">
                   <Button 
                    onClick={handleDownload}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95"
                  >
                    <Download className="w-6 h-6" />
                    Download {outputFormat.split('/')[1].toUpperCase()}
                  </Button>

                  <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                     <Save className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Protocol</p>
                        <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                          Your visual is processed as a {outputFormat.split('/')[1].toUpperCase()} master. {outputFormat === 'image/jpeg' ? `Quality set to ${quality}%.` : 'Lossless compression applied.'}
                        </p>
                     </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}
