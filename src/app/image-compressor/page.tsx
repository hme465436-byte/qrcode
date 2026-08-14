"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileImage, 
  Settings2, 
  Download, 
  Trash2, 
  Upload, 
  CheckCircle2,
  Info,
  Loader2,
  Maximize,
  Save,
  Zap,
  ArrowDownCircle,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ImageCompressorPage() {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [compressedSize, setCompressedCompressedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [format, setOutputFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');

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
      if (file.size > 20 * 1024 * 1024) {
        toast({ variant: "destructive", title: "High Volume Asset", description: "Files over 20MB may impact browser stability." });
      }
      setFileInfo({ name: file.name, size: file.size, type: file.type });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setCompressedImage(null);
        setCompressedCompressedSize(null);
        toast({ title: "Asset Imported", description: "Ready for studio optimization." });
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = img.width;
      let height = img.height;

      // Handle resizing if maxWidth is set
      if (maxWidth && width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL(format, quality / 100);
      setCompressedImage(compressedDataUrl);

      // Estimate compressed size from data URL
      const stringLength = compressedDataUrl.split(',')[1].length;
      const sizeInBytes = Math.floor(stringLength * (3 / 4));
      setCompressedCompressedSize(sizeInBytes);

      setIsProcessing(false);
      toast({ title: "Optimization Complete", description: "Image compressed locally in your browser." });
    };
  }, [originalImage, quality, maxWidth, format, toast]);

  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement('a');
    const ext = format.split('/')[1];
    link.download = `optimized-${fileInfo?.name.split('.')[0] || 'studio-asset'}.${ext}`;
    link.href = compressedImage;
    link.click();
    toast({ title: "Export Success", description: "Optimized asset saved to your device." });
  };

  const handleClear = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setFileInfo(null);
    setCompressedCompressedSize(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "All fields cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Maximize className="w-3.5 h-3.5" /> Performance Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image <span className="text-primary italic">Compressor</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional browser-side image optimization. Reduce file size for web performance while maintaining high visual fidelity. 100% private.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Input & Controls */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <FileImage className="w-6 h-6" />
                </div>
                Source Imagery
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
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(fileInfo?.size || 0)} detected</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-6">
                        Drop High-Res Asset or click to browse
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    <Label className="flex items-center gap-2">Compression Quality</Label>
                    <span className="text-primary font-mono">{quality}%</span>
                  </div>
                  <Slider value={[quality]} min={10} max={100} step={1} onValueChange={(v) => setQuality(v[0])} />
                  <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
                    Note: PNG output ignores quality settings (lossless by design).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Max Width (px)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 1920" 
                      value={maxWidth} 
                      onChange={(e) => setMaxWidth(e.target.value === "" ? "" : parseInt(e.target.value))}
                      className="h-12 bg-secondary border-border rounded-xl text-foreground font-bold"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Output Format</Label>
                    <Select value={format} onValueChange={(val: any) => setOutputFormat(val)}>
                      <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="image/jpeg" className="text-xs font-bold uppercase">JPG (Efficient)</SelectItem>
                        <SelectItem value="image/webp" className="text-xs font-bold uppercase">WebP (Next-Gen)</SelectItem>
                        <SelectItem value="image/png" className="text-xs font-bold uppercase">PNG (HQ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={compressImage}
                  disabled={!originalImage || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Optimize Asset
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

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group-hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Guarantee</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Compression occurs entirely on your device using your browser's rendering engine. Your visuals never leave your machine, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Output & Preview */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Studio Preview
                </CardTitle>
                {compressedSize && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                    -{Math.max(0, Math.round((1 - (compressedSize / (fileInfo?.size || 1))) * 100))}% Reduced
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10 space-y-10">
              <div className="flex-1 relative group/preview min-h-[300px] flex items-center justify-center rounded-[2rem] bg-secondary/30 border border-border p-6 overflow-hidden">
                {compressedImage ? (
                  <div className="w-full h-full flex flex-col gap-6">
                    <img src={compressedImage} alt="Compressed" className="max-h-[350px] w-auto mx-auto rounded-lg shadow-xl object-contain" />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-background border border-border text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Original Size</p>
                          <p className="text-xs font-bold text-foreground">{formatSize(fileInfo?.size || 0)}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-1">
                          <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Optimized Size</p>
                          <p className="text-xs font-bold text-primary">{formatSize(compressedSize || 0)}</p>
                       </div>
                    </div>
                  </div>
                ) : originalImage ? (
                   <div className="text-center space-y-6">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <FileImage className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Pending Optimization</p>
                   </div>
                ) : (
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity text-center">
                    <Settings2 className="w-20 h-20 text-primary mb-4 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No Target Detected</p>
                  </div>
                )}
              </div>

              {compressedImage && (
                <div className="space-y-6">
                   <Button 
                    onClick={handleDownload}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95"
                  >
                    <Download className="w-6 h-6" />
                    Download Optimized Image
                  </Button>

                  <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4 group">
                     <ArrowDownCircle className="w-5 h-5 text-primary mt-0.5 shrink-0 transition-transform group-hover:translate-y-1" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Ready for Production</p>
                        <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                          Your optimized asset is encoded as {format.split('/')[1].toUpperCase()} at {quality}% quality setting.
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
