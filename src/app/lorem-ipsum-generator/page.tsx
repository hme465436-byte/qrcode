"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Type, 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  Info,
  CheckCircle2,
  RefreshCcw,
  AlignLeft,
  List,
  WholeWord,
  Zap,
  Activity,
  Maximize2,
  FileText,
  Settings2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 
  'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 
  'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 
  'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

type GenerationType = 'paragraphs' | 'sentences' | 'words' | 'list';

export default function LoremIpsumGeneratorPage() {
  const { toast } = useToast();
  
  // Generation State
  const [type, setType] = useState<GenerationType>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const generateWords = (num: number) => {
    return Array.from({ length: num }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ');
  };

  const generateSentence = () => {
    const len = Math.floor(Math.random() * 10) + 5;
    const sentence = generateWords(len);
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = () => {
    const len = Math.floor(Math.random() * 4) + 3;
    return Array.from({ length: len }, generateSentence).join(' ');
  };

  const synthesizeText = useCallback(() => {
    let result = '';
    
    if (type === 'paragraphs') {
      result = Array.from({ length: count }, generateParagraph).join('\n\n');
    } else if (type === 'sentences') {
      result = Array.from({ length: count }, generateSentence).join(' ');
    } else if (type === 'words') {
      result = generateWords(count);
    } else if (type === 'list') {
      result = Array.from({ length: count }, () => `• ${generateSentence()}`).join('\n');
    }

    if (startWithLorem) {
      const standardStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
      if (type === 'words' && count > 5) {
        result = "lorem ipsum dolor sit amet " + result.split(' ').slice(5).join(' ');
      } else if (type === 'paragraphs' || type === 'sentences') {
        result = standardStart + result;
      }
    }

    setOutput(result);
  }, [type, count, startWithLorem]);

  // Initial Load
  useEffect(() => {
    synthesizeText();
  }, [synthesizeText]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Matrix Copied", description: "Placeholder text saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorem_ipsum_export_${Date.now()}.txt`;
    a.click();
    toast({ title: "Export Complete" });
  };

  const handleClear = () => {
    setOutput('');
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <AlignLeft className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                Lorem Ipsum <span className="text-primary italic">Generator Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade placeholder text synthesis. Generate high-quality paragraphs, sentences, and lists for design prototypes with absolute hardware-native privacy.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Type Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic Structure</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'paragraphs', label: 'Paragraphs', icon: AlignLeft },
                    { id: 'sentences', label: 'Sentences', icon: Type },
                    { id: 'words', label: 'Words', icon: WholeWord },
                    { id: 'list', label: 'Bulleted List', icon: List },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id as GenerationType)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border transition-all",
                        type === t.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                      )}
                    >
                      <t.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Slider */}
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  <Label>Volume Intensity</Label>
                  <span className="text-primary font-mono text-lg">{count}</span>
                </div>
                <Slider value={[count]} min={1} max={50} step={1} onValueChange={(v) => setCount(v[0])} />
              </div>

              {/* Protocol Toggles */}
              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Generation Protocol</Label>
                <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                   <div className="space-y-1">
                      <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Standard Ignition</p>
                      <p className="text-[9px] text-foreground/30 font-medium uppercase">Start with "Lorem Ipsum..."</p>
                   </div>
                   <Switch checked={startWithLorem} onCheckedChange={setStartWithLorem} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  onClick={synthesizeText}
                  className="h-16 flex-[2] bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <RefreshCcw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-700" />
                  Synthesize Text
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="h-16 flex-1 rounded-2xl border-border bg-secondary hover:text-destructive text-[10px] font-black uppercase tracking-widest"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Studio Tip</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine uses high-frequency word mapping from original Latin text. For peak UI realism, use the **Paragraphs** mode at **3-5 units**.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Active Matrix Output</CardTitle>
              </div>
              
              {output && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all">
                      {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                      Copy Master
                   </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-10 bg-black/10">
                  {!output ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-40">
                       <Maximize2 className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Linguistic Protocol</p>
                    </div>
                  ) : (
                    <div className="text-foreground/80 font-body text-lg leading-loose whitespace-pre-wrap select-all selection:bg-primary/20">
                       {output}
                    </div>
                  )}
               </div>

               {/* Stats Footer */}
               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Button 
                       onClick={handleDownload}
                       disabled={!output}
                       className="h-14 bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95"
                     >
                       <Download className="w-4 h-4 mr-3" /> Export Summary (.TXT)
                     </Button>
                     <div className="p-4 rounded-2xl bg-secondary border border-border flex items-center justify-between px-6">
                        <div className="space-y-0.5">
                           <p className="text-[8px] font-black uppercase text-foreground/30">Linguistic Volume</p>
                           <p className="text-xs font-mono font-bold text-primary uppercase">{output.split(/\s+/).filter(w => w.length > 0).length} Words</p>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-primary/20" />
                     </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Instant Synthesis</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Hardware-native linguistic generation for zero-latency design workflows.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Zero Tracking</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">All production occurs in volatile memory. No text data is logged or transmitted.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
