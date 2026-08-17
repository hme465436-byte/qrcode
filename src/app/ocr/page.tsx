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
  const [contrast, setContrast] = useState(1.2);
  const [upscale, setUpscale] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result as string); setResult(''); };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const { data: { text } } = await Tesseract.recognize(image, language, {
        logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); }
      });
      setResult(text.trim());
      toast({ title: "Complete" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => { setImage(null); setResult(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileText className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Extract Text <span className="text-primary italic">(OCR)</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional Optical Character Recognition.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Compact Preview */}
        <div className="w-full lg:col-span-7 order-1 max-md:h-[28vh] max-md:min-h-0 max-md:max-h-[180px] animate-in fade-in duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col h-full">
            <CardHeader className="py-4 border-b border-border bg-secondary/30 hidden md:flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Source
              </CardTitle>
              {image && <button onClick={handleClear} className="text-[10px] font-black uppercase text-foreground/30">Clear</button>}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-2 sm:p-12 bg-[#060608] relative overflow-hidden">
              <div className="relative h-full aspect-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-checkered">
                {image ? (
                  <img src={image} alt="Source" className="h-full w-auto object-contain mx-auto" />
                ) : (
                  <div className="h-full aspect-square flex items-center justify-center opacity-10"><Search className="w-10 h-10" /></div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Controls */}
        <div className="w-full lg:col-span-5 order-2 max-md:max-h-[55vh] max-md:overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden">
            <CardHeader className="py-6 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Zap className="w-5 h-5 text-primary" /> Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-4">
                <div onClick={() => !isProcessing && fileInputRef.current?.click()} className="relative h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 cursor-pointer overflow-hidden transition-all">
                  <span className="text-[9px] font-black uppercase text-foreground/30">{image ? 'Swap' : 'Import Image'}</span>
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {image && (
                <div className="space-y-4">
                  <Select value={language} onValueChange={setLanguage} disabled={isProcessing}>
                    <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="eng">English</SelectItem>
                      <SelectItem value="fra">French</SelectItem>
                      <SelectItem value="deu">German</SelectItem>
                      <SelectItem value="spa">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={extractText} disabled={isProcessing || !image} className="h-14 w-full bg-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
                  {isProcessing ? `Decoding ${progress}%` : 'Download'}
                </Button>
                {result && (
                   <Textarea readOnly value={result} className="min-h-[150px] bg-secondary/50 text-xs font-mono p-4" />
                )}
                {result && <Button onClick={handleCopy} variant="outline" className="h-10 text-[9px] font-black uppercase">{isCopied ? 'Copied' : 'Copy Text'}</Button>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
