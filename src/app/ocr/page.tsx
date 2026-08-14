
"use client"

import React, { useState, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Standard limit for OCR is 10MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult('');
        toast({ title: "Image Loaded", description: "Ready for text extraction." });
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStatus('Initializing Engine...');

    try {
      const { data: { text } } = await Tesseract.recognize(
        image,
        language,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatus(`Extracting Matrix... ${Math.round(m.progress * 100)}%`);
            } else {
              setStatus(m.status.charAt(0).toUpperCase() + m.status.slice(1));
            }
          }
        }
      );

      setResult(text.trim());
      if (!text.trim()) {
        toast({ variant: "destructive", title: "No Text Found", description: "The matrix yielded no identifiable characters." });
      } else {
        toast({ title: "Extraction Complete", description: "Text matrix decoded successfully." });
      }
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "OCR Failed", description: "An error occurred during optical analysis." });
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
      toast({ title: "Copied!", description: "Extracted text saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult('');
    toast({ title: "Studio Reset", description: "All fields cleared." });
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
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional-grade Optical Character Recognition. Convert images, documents, and screen captures into editable text instantly using client-side intelligence.
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
                  <ImageIcon className="w-6 h-6" />
                </div>
                Optical Input
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              {/* Image Upload Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source Imagery</Label>
                  {image && (
                     <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                       Ready to Process
                     </div>
                  )}
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    image && "border-solid"
                  )}
                >
                  {image ? (
                    <>
                      <img src={image} alt="Source" className="absolute inset-0 w-full h-full object-contain p-6 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                         <Button variant="secondary" className="rounded-2xl font-black uppercase text-[10px] tracking-widest">Change Image</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-8 leading-relaxed">
                        Drop high-res image or click to browse<br />
                        <span className="text-[8px] opacity-60">(JPG, PNG, WebP up to 10MB)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5" /> Linguistic Profile
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-foreground font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="eng" className="text-xs font-bold uppercase">English (Latin)</SelectItem>
                    <SelectItem value="urd" className="text-xs font-bold uppercase">Urdu (Nastaliq)</SelectItem>
                    <SelectItem value="eng+urd" className="text-xs font-bold uppercase">English + Urdu (Bilingual)</SelectItem>
                    <SelectItem value="fra" className="text-xs font-bold uppercase">French</SelectItem>
                    <SelectItem value="deu" className="text-xs font-bold uppercase">German</SelectItem>
                    <SelectItem value="spa" className="text-xs font-bold uppercase">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Progress and Actions */}
              <div className="space-y-6 pt-4">
                {isProcessing && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                      <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> {status}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    onClick={extractText}
                    disabled={isProcessing || !image}
                    className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                    Extract Text
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
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group-hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                OCR processing occurs entirely on your device using WebAssembly. Your imagery never leaves your browser, ensuring maximum security for sensitive documents.
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
                  Decoded Content
                </CardTitle>
                {result && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    {result.length.toLocaleString()} Characters
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output">
                <Textarea 
                  readOnly
                  value={result}
                  placeholder="Extracted text will appear here..."
                  className="w-full min-h-[440px] bg-white dark:bg-black/20 border-border text-foreground font-body rounded-[2.5rem] p-8 text-lg leading-relaxed resize-none shadow-inner custom-scrollbar transition-all overflow-auto"
                />
                {!result && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <FileText className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
                {isProcessing && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-[2.5rem] z-10">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Analyzing Matrix...</p>
                   </div>
                )}
              </div>

              <Button 
                onClick={handleCopy}
                disabled={!result || isProcessing}
                className={cn(
                  "w-full h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                  result ? "text-primary border-primary/20" : "opacity-50"
                )}
              >
                {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                {isCopied ? 'Text Copied' : 'Copy Extracted Text'}
              </Button>

              <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                 <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Quality Assurance</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      For best results, use sharp, well-lit images. Low contrast or blurry text may result in matrix identification errors.
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
