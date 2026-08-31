"use client"

import React, { useState, useRef, useCallback } from 'react';
import { 
  Grid3X3, 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  Info,
  CheckCircle2,
  Maximize,
  Settings2,
  Image as ImageIconLucide,
  Loader2,
  MessageSquare,
  ShieldCheck,
  FileImage,
  Share2,
  Zap,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const DEFAULT_CHARS = '@%#*+=-:. ';

export default function DotArtPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Settings
  const [mode, setMode] = useState<'standard' | 'edges'>('standard');
  const [detail, setDetail] = useState(60); // Width in characters
  const [darkness, setDarkness] = useState(128); // Threshold
  const [sensitivity, setSensitivity] = useState(50); // Edge sensitivity
  const [thickness, setThickness] = useState(1); // Line thickness simulation

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Standard limit is 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        toast({ title: "Image Imported", description: "Ready for dot art generation." });
      };
      reader.readAsDataURL(file);
    }
  };

  const processBraille = (img: HTMLImageElement, targetWidthChars: number) => {
    const charWidth = 2;
    const charHeight = 4;
    const outputWidth = targetWidthChars * charWidth;
    const outputHeight = Math.round((img.height / img.width) * outputWidth);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

    const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
    const data = imageData.data;
    
    const pixels = new Uint8ClampedArray(outputWidth * outputHeight);
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      pixels[i / 4] = avg;
    }

    let processedPixels = pixels;

    if (mode === 'edges') {
      const edgePixels = new Uint8ClampedArray(outputWidth * outputHeight);
      const sensValue = (100 - sensitivity) * 2;
      for (let y = 1; y < outputHeight - 1; y++) {
        for (let x = 1; x < outputWidth - 1; x++) {
          const idx = y * outputWidth + x;
          const gx = -1 * pixels[idx - outputWidth - 1] + 1 * pixels[idx - outputWidth + 1] + -2 * pixels[idx - 1] + 2 * pixels[idx + 1] + -1 * pixels[idx + outputWidth - 1] + 1 * pixels[idx + outputWidth + 1];
          const gy = -1 * pixels[idx - outputWidth - 1] - 2 * pixels[idx - outputWidth] - 1 * (pixels[idx - outputWidth + 1] || 0) + 1 * (pixels[idx + outputWidth - 1] || 0) + 2 * (pixels[idx + outputWidth] || 0) + 1 * (pixels[idx + outputWidth + 1] || 0);
          const mag = Math.sqrt(gx * gx + gy * gy);
          edgePixels[idx] = mag > sensValue ? 0 : 255;
        }
      }
      if (thickness > 1) {
        const thickPixels = new Uint8ClampedArray(edgePixels);
        for (let y = 1; y < outputHeight - 1; y++) {
          for (let x = 1; x < outputWidth - 1; x++) {
            if (edgePixels[y * outputWidth + x] === 0) {
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const targetY = y + dy;
                  const targetX = x + dx;
                  if (targetY >= 0 && targetY < outputHeight && targetX >= 0 && targetX < outputWidth) {
                    thickPixels[targetY * outputWidth + targetX] = 0;
                  }
                }
              }
            }
          }
        }
        processedPixels = thickPixels;
      } else {
        processedPixels = edgePixels;
      }
    }

    let result = '';
    for (let y = 0; y < outputHeight; y += charHeight) {
      for (let x = 0; x < outputWidth; x += charWidth) {
        let byte = 0;
        const checkPixel = (dx: number, dy: number) => {
          const px = x + dx;
          const py = y + dy;
          if (px >= outputWidth || py >= outputHeight) return false;
          const val = processedPixels[py * outputWidth + px];
          return mode === 'edges' ? val === 0 : val < darkness;
        };
        if (checkPixel(0, 0)) byte += 1;
        if (checkPixel(0, 1)) byte += 2;
        if (checkPixel(0, 2)) byte += 4;
        if (checkPixel(1, 0)) byte += 8;
        if (checkPixel(1, 1)) byte += 16;
        if (checkPixel(1, 2)) byte += 32;
        if (checkPixel(0, 3)) byte += 64;
        if (checkPixel(1, 3)) byte += 128;
        result += String.fromCharCode(0x2800 + byte);
      }
      result += '\n';
    }
    return result;
  };

  const generateDotArt = () => {
    if (!image) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      const result = processBraille(img, detail);
      setOutput(result);
      setIsProcessing(false);
      toast({ title: "Art Generated", description: "Image converted to Braille dots." });
    };
  };

  const handleCopyChatSafe = () => {
    if (!image) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      const chatWidth = 30; 
      const result = processBraille(img, chatWidth);
      // Replace regular spaces with non-breaking spaces for better stability in some chat apps
      const cleanResult = result.replace(/ /g, '\u00A0');
      const finalPayload = "```\n" + cleanResult.trim() + "\n```";
      
      navigator.clipboard.writeText(finalPayload);
      setIsCopied(true);
      toast({ title: "Chat Safe Art Copied", description: "Formatted for mobile chat." });
      setTimeout(() => setIsCopied(false), 2000);
    };
  };

  const handleExportAsImage = () => {
    if (!output) return;
    const lines = output.split('\n');
    const fontSize = 24; 
    const lineHeight = 26;
    const padding = 60;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `${fontSize}px "Courier New", monospace`;
    const textWidth = ctx.measureText(lines[0] || '').width;
    
    canvas.width = textWidth + (padding * 2);
    canvas.height = (lines.length * lineHeight) + (padding * 2);

    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#3b82f6';
    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
      ctx.fillText(line, padding, padding + (i * lineHeight));
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `mykit-dot-art-master-${Date.now()}.png`;
    link.click();
    
    toast({ title: "Image Master Exported", description: "100% visual fidelity PNG saved." });
  };

  const handleClear = () => {
    setImage(null);
    setOutput('');
    toast({ title: "Cleared", description: "Studio reset." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Grid3X3 className="w-3.5 h-3.5" /> Creative Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Image to <span className="text-primary italic">Dot Art</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Convert photographs into artistic Braille Unicode text art. Optimized for profile READMEs, social media, and mobile messaging.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="dot-art" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <ImageIconLucide className="w-6 h-6" />
                </div>
                Image & Configuration
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source Imagery</Label>
                </div>
                <div className="relative group/upload h-48 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden">
                  {image ? (
                    <>
                      <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4 opacity-50 group-hover:opacity-80 transition-opacity" />
                      <div className="relative z-10 flex flex-col items-center">
                         <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 shadow-lg backdrop-blur-md">
                           <CheckCircle2 className="w-5 h-5" />
                         </div>
                         <p className="text-[10px] font-black uppercase text-primary tracking-widest">Image Loaded</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4 shadow-xl">
                        <Download className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center">Drop or Click to Upload</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Mode</Label>
                    <Select value={mode} onValueChange={(val: any) => setMode(val)}>
                      <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="standard" className="text-xs font-bold uppercase">Standard</SelectItem>
                        <SelectItem value="edges" className="text-xs font-bold uppercase">Edge Trace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Preview Detail</Label>
                    <div className="flex items-center gap-4">
                      <Slider value={[detail]} min={20} max={120} step={1} onValueChange={(v) => setDetail(v[0])} className="flex-1" />
                      <span className="text-[10px] font-mono font-black text-primary w-8">{detail}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Threshold</Label>
                    <Slider value={[darkness]} min={0} max={255} step={1} onValueChange={(v) => setDarkness(v[0])} />
                  </div>
                  {mode === 'edges' && (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Edge Sensitivity</Label>
                      <Slider value={[sensitivity]} min={1} max={100} step={1} onValueChange={(v) => setSensitivity(v[0])} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={generateDotArt}
                  disabled={isProcessing || !image}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Generate
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
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Master Protocol</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine utilizes a 2x4 dot matrix mapping. For 100% visual fidelity in mobile apps like WhatsApp, we recommend using **Export**.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Studio Output
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8 flex-1 flex flex-col">
              <div className="flex-1 relative group/output min-h-[350px]">
                <textarea 
                  readOnly
                  value={output}
                  placeholder="Output will appear here..."
                  className="w-full h-full min-h-[350px] bg-white dark:bg-black/20 border-border text-foreground font-mono rounded-[2.5rem] p-8 text-[8px] leading-[1.1] resize-none shadow-inner custom-scrollbar transition-all overflow-auto whitespace-pre"
                />
                {!output && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Grid3X3 className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleCopyChatSafe}
                    disabled={!output}
                    className="h-16 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                    Copy
                  </Button>
                  <Button 
                    onClick={handleExportAsImage}
                    disabled={!output}
                    variant="outline"
                    className="h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                  >
                    <FileImage className="w-5 h-5 mr-3 text-primary" />
                    Export
                  </Button>
                </div>
                
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 text-center animate-in slide-in-from-bottom-2">
                  <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider flex items-center justify-center gap-3">
                    <Zap className="w-4 h-4 text-primary animate-pulse" />
                    Best quality: Export
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <Maximize2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">High Fidelity</p>
                       <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">
                         Native PNG export renders at 2x scale for sharp dot definitions on high-DPI smartphone displays.
                       </p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                       <p className="text-[9px] text-foreground/40 font-medium leading-relaxed uppercase">
                         All synthesis occurs locally. Your visual matrices are never transmitted or stored on any remote node.
                       </p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
