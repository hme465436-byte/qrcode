"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ImageIcon, 
  Sparkles, 
  Download, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  Loader2, 
  Maximize2, 
  Settings2, 
  Zap, 
  History,
  Maximize,
  Smartphone,
  Monitor,
  Share2,
  AlertCircle,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

type AspectRatio = '1:1' | '16:9' | '9:16';

interface RecentPrompt {
  id: string;
  text: string;
  timestamp: number;
}

export default function AiImageGeneratorPage() {
  const { toast } = useToast();
  
  // State Matrix
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState<AspectRatio>('1:1');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Initialization
  useEffect(() => {
    const saved = localStorage.getItem('mykit_ai_prompts_v1');
    if (saved) try { setRecentPrompts(JSON.parse(saved)); } catch (e) {}
  }, []);

  const savePrompt = (text: string) => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), text, timestamp: Date.now() };
    const next = [newItem, ...recentPrompts.filter(p => p.text !== text)].slice(0, 10);
    setRecentPrompts(next);
    localStorage.setItem('mykit_ai_prompts_v1', JSON.stringify(next));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setResultUrl(null);

    const dims = {
      '1:1': { w: 1024, h: 1024 },
      '16:9': { w: 1280, h: 720 },
      '9:16': { w: 720, h: 1280 }
    }[aspect];

    const seed = Math.floor(Math.random() * 1000000);
    // Pollinations.ai Protocol: prompt/width/height/seed/nologo
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=${dims.w}&height=${dims.h}&seed=${seed}&nologo=true`;

    try {
      // We fetch to "warm" the cache and ensure it's ready before showing
      const response = await fetch(url);
      if (!response.ok) throw new Error("Node restricted");
      
      setResultUrl(url);
      savePrompt(prompt.trim());
      toast({ title: "Synthesis Complete", description: "Visual identity isolated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Failure", description: "Try again. The node is busy." });
      setIsProcessing(false);
    } finally {
      // isProcessing is set to false in the img onLoad event
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-master-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Master Exported" });
    } catch (e) {
      window.open(resultUrl, '_blank');
    }
  };

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      toast({ title: "Prompt Isolated" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResultUrl(null);
    setIsProcessing(false);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                AI Image <span className="text-primary italic">Generator</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Create images from text for free. Professional hardware-accelerated synthesis using the open Pollinations matrix. No API keys or accounts required.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="ai-image" />
              {(resultUrl || prompt) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Linguistic Prompt</Label>
                       <span className="text-[8px] font-black text-primary uppercase">Free Node Active</span>
                    </div>
                    <Textarea 
                      placeholder="Cyberpunk city with neon lights, 8k, detailed architecture..."
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      className="h-32 bg-secondary/50 border-border rounded-2xl text-sm font-medium p-6 resize-none focus:ring-primary/40"
                    />
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Aspect Ratio</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {[
                         { id: '1:1', icon: Maximize, label: 'Square' },
                         { id: '16:9', icon: Monitor, label: 'Cinema' },
                         { id: '9:16', icon: Smartphone, label: 'Mobile' },
                       ].map(m => (
                         <button
                           key={m.id}
                           onClick={() => setAspect(m.id as AspectRatio)}
                           className={cn(
                             "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all h-20",
                             aspect === m.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/30 border-border text-foreground/40 hover:text-primary"
                           )}
                         >
                            <m.icon className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{m.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <Button 
                    onClick={handleGenerate} 
                    disabled={isProcessing || !prompt.trim()}
                    className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Synthesize Image
                 </Button>

                 {recentPrompts.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/5">
                       <Label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Recent Archives</Label>
                       <div className="flex flex-col gap-2">
                          {recentPrompts.map(p => (
                            <button 
                              key={p.id} 
                              onClick={() => setPrompt(p.text)}
                              className="text-left px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] text-foreground/40 truncate hover:text-primary hover:border-primary/20 transition-all uppercase font-bold"
                            >
                               {p.text}
                            </button>
                          ))}
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Image generation is anonymous. Prompts are volatile and held strictly in local memory. The studio does not log your creative history.
               </p>
             </div>
          </div>
        </div>

        {/* Workspace - Right */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Output</CardTitle>
                 </div>
                 {resultUrl && !isProcessing && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">MASTER SYNTHESIZED</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden bg-checkered">
                 {!resultUrl && !isProcessing ? (
                   <div className="flex flex-col items-center justify-center opacity-10 gap-6 py-20">
                      <ImageIcon className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                   </div>
                 ) : (
                   <div className="relative w-full h-full flex flex-col items-center justify-center gap-8">
                      {isProcessing && (
                        <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-6 rounded-[2.5rem]">
                           <div className="relative">
                              <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                           </div>
                           <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Visual Matrix...</p>
                        </div>
                      )}
                      
                      {resultUrl && (
                        <div className="relative group/master max-w-full">
                           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20" />
                           <img 
                            src={resultUrl} 
                            alt="Generated AI Master" 
                            className={cn(
                              "max-w-full max-h-[60vh] object-contain rounded-[2rem] shadow-2xl ring-1 ring-white/10 transition-all duration-700",
                              isProcessing ? "opacity-0" : "opacity-100"
                            )}
                            onLoad={() => setIsProcessing(false)}
                           />
                           
                           {!isProcessing && (
                              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 animate-in slide-in-from-bottom-4">
                                 <Button 
                                  onClick={handleDownload} 
                                  className="h-16 px-12 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-2xl active:scale-95 transition-all"
                                 >
                                    <Download className="w-6 h-6" /> Save Master PNG
                                 </Button>
                                 <div className="flex gap-2">
                                    <Button onClick={handleCopy} variant="outline" className="h-16 px-6 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] rounded-2xl">
                                       {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />} Copy Prompt
                                    </Button>
                                    <Button onClick={() => window.open(resultUrl, '_blank')} variant="outline" className="h-16 w-16 border-white/10 bg-white/5 text-white font-black rounded-2xl">
                                       <Maximize2 className="w-5 h-5" />
                                    </Button>
                                 </div>
                              </div>
                           )}
                        </div>
                      )}
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-4">
                 <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                 <p className="text-[10px] text-foreground/40 font-bold leading-relaxed uppercase">
                    Synthesis is performed via the open Pollinations node. High-volume requests may take 5-10 seconds for full buffer synchronization.
                 </p>
              </div>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
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
