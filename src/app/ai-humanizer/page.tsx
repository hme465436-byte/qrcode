"use client"

import React, { useState, useMemo } from 'react';
import { 
  Wand2, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Zap, 
  Activity,
  Loader2,
  AlertCircle,
  Type,
  AlignLeft,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Quote,
  LayoutGrid,
  Monitor,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { aiHumanizer } from '@/ai/flows/ai-humanizer-flow';

type Tone = 'simple' | 'professional' | 'casual';

export default function AiHumanizerPage() {
  const { toast } = useToast();
  
  // State Matrix
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tone, setTone] = useState<Tone>('simple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statsBefore = useMemo(() => ({
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    chars: input.length
  }), [input]);

  const statsAfter = useMemo(() => ({
    words: output.trim() ? output.trim().split(/\s+/).length : 0,
    chars: output.length
  }), [output]);

  const handleHumanize = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await aiHumanizer({ text: input, tone });
      setOutput(result);
      toast({ title: "Synthesis Complete", description: "Linguistic matrix successfully humanized." });
    } catch (err) {
      setError("Matrix Retrieval Failure: The AI node is currently restricted.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Content Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Linguistic AI Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                AI <span className="text-primary italic">Humanizer PRO</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic re-matricing. Transform AI-generated text into natural human flows to ensure high-fidelity communication and detection avoidance.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="ai-humanizer" />
              {(output || input) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Column */}
        <div className="lg:col-span-6 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <AlignLeft className="w-5 h-5 text-primary" /> Source Payload
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">AI-Generated Content</Label>
                   <span className="text-[10px] font-mono text-primary/60">{statsBefore.words} Words</span>
                </div>
                <Textarea 
                  placeholder="Paste AI content here..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px] bg-secondary border-border text-base rounded-[2rem] p-8 text-foreground leading-relaxed resize-none focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Atmospheric Tone</Label>
                   <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                      <SelectTrigger className="h-14 bg-secondary border-border rounded-xl font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                         <SelectItem value="simple" className="text-[10px] font-black uppercase">Simple (Clear)</SelectItem>
                         <SelectItem value="professional" className="text-[10px] font-black uppercase">Professional</SelectItem>
                         <SelectItem value="casual" className="text-[10px] font-black uppercase">Casual (Flow)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="flex flex-col justify-end">
                   <Button 
                    onClick={handleHumanize} 
                    disabled={isProcessing || !input.trim()}
                    className="h-14 w-full bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Humanize Matrix
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-6 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Result</CardTitle>
                 </div>
                 {output && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                       {statsAfter.words} Words Synthesized
                    </Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-[#060608]">
                 {!output && !isProcessing && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Quote className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isProcessing && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <RefreshCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Linguistic Buffer...</p>
                   </div>
                 )}

                 {output && !isProcessing && (
                   <div className="w-full h-full flex flex-col gap-8 animate-in zoom-in-95 duration-500">
                      <div className="p-10 rounded-[3rem] bg-secondary/30 border border-border space-y-4 shadow-inner relative flex-1">
                         <div className="absolute top-4 right-6 text-white/5 font-black text-[60px] pointer-events-none uppercase">PRO</div>
                         <p className="text-lg font-medium text-foreground/80 leading-relaxed selection:bg-primary/30">
                            {output}
                         </p>
                      </div>

                      <div className="flex gap-4">
                         <Button onClick={handleCopy} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            {isCopied ? <CheckCircle2 className="w-5 h-5 mr-1" /> : <Copy className="w-5 h-5 mr-1" />}
                            Copy Humanized Master
                         </Button>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Your linguistic matrices are processed strictly via secure server flows. No identifying data is logged or stored in our registry.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Natural Flow</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    The engine varys sentence length and word density to mimic human burstiness, ensuring 100% natural communication.
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
