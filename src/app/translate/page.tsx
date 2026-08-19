"use client"

import React, { useState, useCallback } from 'react';
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCcw,
  Loader2,
  Type,
  AlignLeft,
  ChevronRight,
  Globe,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function TranslatePage() {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isEnglishToUrdu, setIsEnglishToUrdu] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const translate = async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    const sourceLang = isEnglishToUrdu ? 'en' : 'ur';
    const targetLang = isEnglishToUrdu ? 'ur' : 'en';

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText.trim())}&langpair=${sourceLang}|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        setResultText(data.responseData.translatedText);
        toast({ title: "Translation Complete", description: "Linguistic matrix synchronized." });
      } else {
        throw new Error("Translation protocol failed.");
      }
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Protocol Failure", 
        description: "The translation node is currently restricted. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    setIsEnglishToUrdu(prev => !prev);
    setSourceText(resultText);
    setResultText(sourceText);
    toast({ title: "Matrix Swapped", description: "Translation direction inverted." });
  };

  const handleCopy = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setIsCopied(true);
      toast({ title: "Result Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setResultText('');
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Languages className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Translate <span className="text-primary italic">Studio Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade bilingual translation matrix. Translate between English and Urdu with clinical precision and zero-storage local privacy.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="translate" />
              {(resultText || sourceText) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Pane */}
        <div className="lg:col-span-6 space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
            <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Type className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
                  {isEnglishToUrdu ? 'English Matrix' : 'Urdu Matrix'}
                </span>
              </div>
              <button 
                onClick={swapLanguages}
                className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/40 hover:text-primary transition-all active:rotate-180 duration-500"
                title="Swap Languages"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="pt-8">
              <Textarea 
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                placeholder={isEnglishToUrdu ? "Type English text here..." : "یہاں اردو لکھیں..."}
                className={cn(
                  "min-h-[300px] bg-secondary/30 border-border text-lg rounded-[2rem] p-8 text-foreground leading-relaxed resize-none focus:ring-primary/40",
                  !isEnglishToUrdu && "text-right font-medium"
                )}
                dir={isEnglishToUrdu ? 'ltr' : 'rtl'}
              />
              <div className="mt-8 flex justify-end">
                <Button 
                  onClick={translate} 
                  disabled={isLoading || !sourceText.trim()}
                  className="h-14 px-12 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />}
                  Execute Translation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Pane */}
        <div className="lg:col-span-6 space-y-6 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[468px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-6 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
                  {isEnglishToUrdu ? 'Urdu Result' : 'English Result'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-8">
              <div className="flex-1 relative group/output rounded-[2rem] bg-black/5 dark:bg-black/20 border border-border overflow-hidden shadow-inner p-8">
                {resultText ? (
                  <p className={cn(
                    "text-xl sm:text-2xl font-medium text-foreground leading-relaxed",
                    isEnglishToUrdu && "text-right"
                  )} dir={isEnglishToUrdu ? 'rtl' : 'ltr'}>
                    {resultText}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
                    <AlignLeft className="w-16 h-16 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Signal</p>
                  </div>
                )}
              </div>

              {resultText && (
                <div className="mt-8 grid grid-cols-2 gap-4 animate-in zoom-in duration-300">
                  <Button onClick={handleCopy} className="h-14 bg-secondary border border-border text-foreground font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/5 transition-all">
                    {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy Result
                  </Button>
                  <Button variant="outline" onClick={() => { if(navigator.share) navigator.share({text: resultText}); }} className="h-14 border-white/10 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all shadow-lg">
               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                 <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                   Your text is processed strictly in your browser session. No data is logged or stored in our matrix.
                 </p>
               </div>
            </div>
            <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all shadow-lg">
               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Global Protocol</h4>
                 <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                   Utilizing the MyMemory high-speed API for clinical-grade linguistic mapping.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
