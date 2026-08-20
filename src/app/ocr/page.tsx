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
  Search,
  Cloud,
  Cpu,
  RefreshCcw,
  Check,
  Settings2,
  ShieldCheck
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
import { GetHelp } from '@/components/qr-canvas/get-help';
import { recognizeTextOcrSpace } from './actions';

type EngineMode = 'idle' | 'cloud' | 'local';

export default function OCRPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('eng');
  const [isCopied, setIsCopied] = useState(false);
  const [activeEngine, setActiveEngine] = useState<EngineMode>('idle');
  const [fallbackActive, setFallbackActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Image capped at 10MB for protocol stability." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { 
        setImage(reader.result as string); 
        setResult(''); 
        setActiveEngine('idle');
        setFallbackActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractTextLocal = async (img: string) => {
    setActiveEngine('local');
    setFallbackActive(true);
    try {
      const { data: { text } } = await Tesseract.recognize(img, language, {
        logger: m => { 
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      return text.trim();
    } catch (err) {
      throw new Error("Local hardware extraction failed.");
    }
  };

  const extractText = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResult('');
    setFallbackActive(false);

    try {
      // 1. Attempt Primary Node: OCR.space
      setActiveEngine('cloud');
      const cloudResult = await recognizeTextOcrSpace(image, language);
      
      if (cloudResult.success && cloudResult.text) {
        setResult(cloudResult.text);
        toast({ title: "Signal Isolated", description: "Text extracted via Cloud Node." });
      } else {
        // 2. Automated Fallback: Tesseract.js
        console.warn("Cloud node failed or returned empty. Initializing local fallback...");
        const localText = await extractTextLocal(image);
        setResult(localText);
        toast({ title: "Fallback Sync", description: "Cloud node restricted. Switched to Local Hardware." });
      }
    } catch (err: any) {
      // 3. Last Resort: Local Tesseract if not already tried
      if (activeEngine !== 'local') {
        try {
          const localText = await extractTextLocal(image);
          setResult(localText);
          toast({ title: "Local Sync", description: "Hardware-native extraction complete." });
        } catch (localErr) {
          toast({ variant: "destructive", title: "Protocol Failure", description: "All extraction nodes are restricted." });
        }
      } else {
        toast({ variant: "destructive", title: "Protocol Failure", description: "All extraction nodes are restricted." });
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      toast({ title: "Matrix Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => { 
    setImage(null); 
    setResult(''); 
    setActiveEngine('idle');
    setFallbackActive(false);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <FileText className="w-3.5 h-3.5" /> Intelligence Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Extract Text <span className="text-primary italic">(OCR PRO)</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional Multi-Engine Optical Character Recognition. Prioritizing high-fidelity cloud neural networks with hardware-native Tesseract fallback.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="ocr" />
           {image && (
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Input & Preview */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                   <ImageIcon className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Visual Matrix Source</CardTitle>
              </div>
              {activeEngine !== 'idle' && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all",
                  activeEngine === 'cloud' ? "bg-primary/10 text-primary border-primary/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                   {activeEngine === 'cloud' ? <Cloud className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                   {activeEngine === 'cloud' ? 'Cloud Engine' : 'Hardware Local'}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[#060608]">
               {!image ? (
                  <div 
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                    className="flex-1 w-full border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-8 cursor-pointer group hover:border-primary/40 transition-all"
                  >
                     <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all shadow-xl">
                        <Upload className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <span className="text-sm font-headline font-black uppercase text-white/20 group-hover:text-white transition-colors">Import Document Visual</span>
                        <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">JPG, PNG, WebP • Max 10MB</p>
                     </div>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
               ) : (
                 <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={image} 
                      alt="Source" 
                      className={cn(
                        "max-w-full max-h-[600px] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10 transition-all duration-500",
                        isProcessing && "opacity-50 blur-sm"
                      )} 
                    />
                    
                    {isProcessing && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20">
                          <div className="relative">
                             <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                             <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                          </div>
                          <div className="text-center space-y-3">
                             <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Linguistic Signal...</p>
                             {fallbackActive && (
                               <div className="space-y-4 w-full max-w-[200px] mx-auto">
                                  <Progress value={progress} className="h-1" />
                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Local WASM Pass: {progress}%</span>
                               </div>
                             )}
                          </div>
                       </div>
                    )}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results & Controls */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Protocol</Label>
                    <Select value={language} onValueChange={setLanguage} disabled={isProcessing}>
                       <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-sm font-bold uppercase px-6">
                          <Languages className="w-4 h-4 mr-2 text-primary" />
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="glass-card max-h-[300px]">
                          <SelectItem value="eng" className="text-[10px] font-black uppercase">English Matrix</SelectItem>
                          <SelectItem value="fra" className="text-[10px] font-black uppercase">French Matrix</SelectItem>
                          <SelectItem value="deu" className="text-[10px] font-black uppercase">German Matrix</SelectItem>
                          <SelectItem value="spa" className="text-[10px] font-black uppercase">Spanish Matrix</SelectItem>
                          <SelectItem value="ita" className="text-[10px] font-black uppercase">Italian Matrix</SelectItem>
                          <SelectItem value="jpn" className="text-[10px] font-black uppercase">Japanese Matrix</SelectItem>
                          <SelectItem value="chi_sim" className="text-[10px] font-black uppercase">Chinese Matrix</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="pt-2">
                    <Button 
                      onClick={extractText} 
                      disabled={isProcessing || !image}
                      className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                    >
                       {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Sparkles className="w-6 h-6 mr-3" />}
                       {fallbackActive ? 'Executing Local Fix' : 'Execute Extraction'}
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[400px]">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Isolated Content</CardTitle>
                 </div>
                 {result && (
                   <div className="flex items-center gap-2 text-[8px] font-black text-green-500 uppercase tracking-widest">
                      <Check className="w-3 h-3" /> Matrix Decoded
                   </div>
                 )}
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                 <div className="flex-1 relative group/output">
                    <Textarea 
                      readOnly
                      value={result}
                      placeholder="Decoded text will appear here..."
                      className="w-full h-full min-h-[300px] p-8 font-mono text-sm leading-relaxed focus:outline-none bg-transparent text-foreground custom-scrollbar overflow-auto whitespace-pre border-none shadow-inner"
                    />
                    {!result && !isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 space-y-4 pointer-events-none">
                         <Search className="w-16 h-16 text-primary" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Analysis</p>
                      </div>
                    )}
                 </div>
                 
                 {result && (
                    <div className="p-6 bg-black/20 border-t border-white/5 animate-in slide-in-from-bottom-4">
                       <Button onClick={handleCopy} className="w-full h-14 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all">
                          {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                          Copy Text matrix
                       </Button>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Fallback decoding occurs 100% locally in browser memory. Documents are never transmitted to our servers.
                  </p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <RefreshCcw className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Multi-Node Fallback</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    The studio uses a dual-engine protocol to ensure the highest extraction accuracy across all browser hardware.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
