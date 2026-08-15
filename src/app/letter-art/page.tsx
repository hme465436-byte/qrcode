"use client"

import React, { useState, useRef, useCallback } from 'react';
import { 
  Type, 
  ImageIcon, 
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
  CaseSensitive,
  ArrowDownCircle,
  WholeWord
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DEFAULT_CHARS = '@%#*+=-:. ';

export default function LetterArtPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Settings
  const [customChars, setCustomChars] = useState('');
  const [width, setWidth] = useState(80);
  const [invert, setInvert] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "High Volume Asset", description: "Standard limit is 10MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        toast({ title: "Asset Imported", description: "Ready for letter-art synthesis." });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateLetterArt = useCallback(() => {
    if (!image) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // ASCII art usually looks better with a 0.5 aspect ratio for characters (since they are taller than wide)
      const aspect = img.height / img.width;
      const h = Math.floor(width * aspect * 0.5);
      
      canvas.width = width;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, width, h);

      const imageData = ctx.getImageData(0, 0, width, h);
      const pixels = imageData.data;
      
      const chars = customChars.trim() || DEFAULT_CHARS;
      const charArray = chars.split('');
      let result = '';

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          // Grayscale luminosity formula
          const r = pixels[i];
          const g = pixels[i+1];
          const b = pixels[i+2];
          const avg = (0.299 * r + 0.587 * g + 0.114 * b);
          
          let charIndex = Math.floor((avg / 255) * (charArray.length - 1));
          if (invert) {
            charIndex = charArray.length - 1 - charIndex;
          }
          
          result += charArray[charIndex];
        }
        result += '\n';
      }

      setOutput(result);
      setIsProcessing(false);
      toast({ title: "Art Synthesis Complete", description: "Image converted to custom character matrix." });
    };
  }, [image, width, customChars, invert, toast]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Matrix Copied", description: "Content saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setImage(null);
    setOutput('');
    setCustomChars('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "All fields cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <CaseSensitive className="w-3.5 h-3.5" /> Creative Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Image to <span className="text-primary italic">Letter Art</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Convert photographs into artistic character matrices using custom letter sets. Perfect for brand-specific ASCII art and unique textual visuals.
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
                  <ImageIconLucide className="w-6 h-6" />
                </div>
                Configuration Studio
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* Image Upload */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source Visual</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    image && "border-solid border-primary/40"
                  )}
                >
                  {image ? (
                    <>
                      <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4 opacity-50" />
                      <div className="relative z-10 flex flex-col items-center">
                         <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 shadow-lg backdrop-blur-md">
                           <CheckCircle2 className="w-5 h-5" />
                         </div>
                         <p className="text-[10px] font-black uppercase text-primary tracking-widest">Image Loaded</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Download className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">Select Source Image</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {/* Character Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Custom Character Set</Label>
                  <span className="text-[8px] font-black text-primary/60 uppercase">Density Priority</span>
                </div>
                <Input 
                  placeholder="e.g. UMAR, BRAND, 01, or custom symbols..."
                  value={customChars}
                  onChange={(e) => setCustomChars(e.target.value)}
                  className="h-14 bg-secondary border-border rounded-2xl text-foreground font-mono font-bold"
                />
                <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
                  Tip: Characters at the start will be used for brighter pixels. Leave empty for default ramp.
                </p>
              </div>

              {/* Detail Slider */}
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  <Label>Matrix Width (Columns)</Label>
                  <span className="text-primary font-mono">{width} Chars</span>
                </div>
                <Slider value={[width]} min={20} max={200} step={1} onValueChange={(v) => setWidth(v[0])} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setInvert(!invert)}
                  className={cn(
                    "h-12 rounded-xl border flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                    invert ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40 hover:text-foreground"
                  )}
                >
                  <Settings2 className="w-4 h-4" />
                  {invert ? 'Dark Mode On' : 'Invert Values'}
                </button>
                <Button 
                  onClick={generateLetterArt}
                  disabled={isProcessing || !image}
                  className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Art
                </Button>
              </div>

              <Button 
                variant="outline"
                onClick={handleClear}
                className="w-full h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
              >
                <Trash2 className="w-5 h-5 mr-3" />
                Clear Studio
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Character Mapping Intelligence</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine divides the 0-255 grayscale spectrum by the number of characters in your set, ensuring a balanced distribution of visual weight.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Letter Matrix Output
                </CardTitle>
                {output && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    {output.length.toLocaleString()} Cells
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output">
                <textarea 
                  readOnly
                  value={output}
                  placeholder="Artistic matrix will appear here..."
                  className="w-full min-h-[500px] bg-white dark:bg-black/20 border-border text-foreground font-mono rounded-[2.5rem] p-8 text-[8px] leading-[1.0] resize-none shadow-inner custom-scrollbar transition-all overflow-auto whitespace-pre"
                />
                {!output && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <WholeWord className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleCopy}
                  disabled={!output}
                  className={cn(
                    "h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                    output ? "text-primary border-primary/20" : "opacity-50"
                  )}
                >
                  {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                  {isCopied ? 'Matrix Copied' : 'Copy Art'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([output], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `letter-art-${Date.now()}.txt`;
                    a.click();
                  }}
                  disabled={!output}
                  className="h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/50 font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Save .txt
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4 group">
                 <ArrowDownCircle className="w-5 h-5 text-primary shrink-0 mt-0.5 transition-transform group-hover:translate-y-1" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Layout Advisory</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      For accurate visual representation, view output in a fixed-width font (e.g. Courier, Consolas) with "Line Wrapping" disabled.
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
