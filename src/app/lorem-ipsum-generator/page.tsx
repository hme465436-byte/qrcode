"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AlignLeft, 
  Copy, 
  Trash2, 
  RefreshCcw, 
  Download, 
  Info,
  CheckCircle2,
  Settings2,
  Zap,
  Activity,
  Maximize2,
  FileText,
  Type,
  List,
  Braces,
  User,
  Mail,
  WholeWord,
  Code2,
  FileCode,
  ShieldCheck,
  WrapText,
  Scaling,
  Globe,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Linguistic Constants ---
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 
  'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 
  'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 
  'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

const FIRST_NAMES = ['Aria', 'Caleb', 'Elena', 'Dante', 'Isla', 'Julian', 'Kai', 'Lila', 'Milo', 'Nora', 'Orion', 'Sloane', 'Zane', 'Yara', 'Silas', 'Ivy'];
const LAST_NAMES = ['Vance', 'Sterling', ' Thorne', 'Blackwood', 'Frost', 'Mercer', 'Vale', 'Sinclair', 'Hayes', 'Lennox', 'Quinn', 'Brooks'];
const DOMAINS = ['studio.ai', 'digital.io', 'brand.co', 'identity.net', 'tech.org', 'matrix.dev'];
const JOB_TITLES = ['Lead Architect', 'Product Visionary', 'Interface Designer', 'Fullstack Engineer', 'Brand Strategist', 'Growth Director'];

type GenerationMode = 'paragraphs' | 'sentences' | 'words' | 'list' | 'html';
type DataMode = 'names' | 'emails' | 'titles';

export default function LoremIpsumGeneratorPage() {
  const { toast } = useToast();
  
  // Studio State
  const [activeTab, setActiveTab] = useState('standard');
  const [mode, setMode] = useState<GenerationMode>('paragraphs');
  const [dataMode, setDataMode] = useState<DataMode>('names');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [useHardWrap, setUseHardWrap] = useState(false);
  const [wrapLength, setWrapLength] = useState(60);
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // --- Generation Engines ---
  const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateWords = (num: number) => {
    return Array.from({ length: num }, () => getRandom(LOREM_WORDS)).join(' ');
  };

  const generateSentence = () => {
    const len = Math.floor(Math.random() * 8) + 6;
    const sentence = generateWords(len);
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = () => {
    const len = Math.floor(Math.random() * 3) + 4;
    return Array.from({ length: len }, generateSentence).join(' ');
  };

  const applyHardWrap = (text: string, length: number) => {
    const words = text.split(' ');
    let currentLine = '';
    let result = '';
    
    words.forEach(word => {
      if ((currentLine + word).length > length) {
        result += currentLine.trim() + '\n';
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    return result + currentLine.trim();
  };

  const synthesize = useCallback(() => {
    let result = '';

    if (activeTab === 'standard') {
      if (mode === 'paragraphs') {
        result = Array.from({ length: count }, generateParagraph).join('\n\n');
      } else if (mode === 'sentences') {
        result = Array.from({ length: count }, generateSentence).join(' ');
      } else if (mode === 'words') {
        result = generateWords(count);
      } else if (mode === 'list') {
        result = Array.from({ length: count }, () => `• ${generateSentence()}`).join('\n');
      } else if (mode === 'html') {
        result = Array.from({ length: count }, () => `<p>${generateParagraph()}</p>`).join('\n');
      }

      if (startWithLorem && mode !== 'html' && mode !== 'list') {
        const standardStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
        if (!result.toLowerCase().startsWith('lorem')) {
          result = standardStart + result;
        }
      }
    } else {
      // Dummy Data Matrix
      const dataResults = [];
      for (let i = 0; i < count; i++) {
        if (dataMode === 'names') {
          dataResults.push(`${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`);
        } else if (dataMode === 'emails') {
          const first = getRandom(FIRST_NAMES).toLowerCase();
          const last = getRandom(LAST_NAMES).toLowerCase().trim();
          dataResults.push(`${first}.${last}@${getRandom(DOMAINS)}`);
        } else if (dataMode === 'titles') {
          dataResults.push(getRandom(JOB_TITLES));
        }
      }
      result = dataResults.join('\n');
    }

    if (useHardWrap && (mode === 'paragraphs' || mode === 'sentences' || mode === 'words')) {
      result = applyHardWrap(result, wrapLength);
    }

    setOutput(result);
  }, [activeTab, mode, dataMode, count, startWithLorem, useHardWrap, wrapLength]);

  // Live generation trigger
  useEffect(() => {
    synthesize();
  }, [synthesize]);

  // Analytics Matrix
  const stats = useMemo(() => {
    const trimmed = output.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0).length : 0;
    const chars = output.length;
    return { words, chars };
  }, [output]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Matrix Copied", description: "Linguistic payload saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = (ext: 'txt' | 'html') => {
    if (!output) return;
    const blob = new Blob([output], { type: ext === 'html' ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mykit_lorem_export.${ext}`;
    a.click();
    toast({ title: "Master Exported" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <AlignLeft className="w-3.5 h-3.5" /> Linguistic Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Lorem Ipsum <span className="text-primary">Generator Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional-grade placeholder text synthesis. Generate high-quality paragraphs, markup tags, and dummy identity data with absolute hardware-native privacy.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0 pb-2">
           <GetHelp toolId="lorem-ipsum-generator" />
           <Button variant="outline" onClick={synthesize} className="h-11 px-6 rounded-xl border-border bg-secondary/50 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all shadow-lg">
              <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 bg-background/50 border border-white/5 p-1 rounded-2xl h-12">
                   <TabsTrigger value="standard" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Standard Matrix</TabsTrigger>
                   <TabsTrigger value="dummy" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Identity Matrix</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="standard" className="space-y-10 m-0">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic Mode</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'paragraphs', label: 'Paragraph', icon: AlignLeft },
                          { id: 'sentences', label: 'Sentence', icon: Type },
                          { id: 'words', label: 'Words', icon: WholeWord },
                          { id: 'list', label: 'List', icon: List },
                          { id: 'html', label: 'HTML', icon: Code2 },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setMode(t.id as GenerationMode)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all",
                              mode === t.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                            )}
                          >
                            <t.icon className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">{t.label}</span>
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase text-foreground/60 leading-none">Standard Start</p>
                          <p className="text-[7px] font-bold text-foreground/20 uppercase">Lorem ipsum...</p>
                        </div>
                        <Switch checked={startWithLorem} onCheckedChange={setStartWithLorem} className="scale-75" />
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase text-foreground/60 leading-none">Hard Wrap</p>
                          <p className="text-[7px] font-bold text-foreground/20 uppercase">Force Newlines</p>
                        </div>
                        <Switch checked={useHardWrap} onCheckedChange={setUseHardWrap} className="scale-75" />
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="dummy" className="space-y-10 m-0">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Identity Protocol</Label>
                      <div className="grid grid-cols-3 gap-3">
                         {[
                           { id: 'names', label: 'Full Names', icon: User },
                           { id: 'emails', label: 'Email Alias', icon: Mail },
                           { id: 'titles', label: 'Pro Titles', icon: Zap },
                         ].map((t) => (
                           <button
                            key={t.id}
                            onClick={() => setDataMode(t.id as DataMode)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border transition-all",
                              dataMode === t.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                            )}
                           >
                              <t.icon className="w-5 h-5" />
                              <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                           </button>
                         ))}
                      </div>
                   </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  <Label>Production Volume</Label>
                  <span className="text-primary font-mono text-lg">{count}</span>
                </div>
                <Slider value={[count]} min={1} max={100} step={1} onValueChange={(v) => setCount(v[0])} />
              </div>

              {useHardWrap && (
                 <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      <Label className="flex items-center gap-2"><WrapText className="w-3 h-3" /> Wrap Width</Label>
                      <span className="text-primary font-mono text-lg">{wrapLength}</span>
                    </div>
                    <Slider value={[wrapLength]} min={20} max={120} step={1} onValueChange={(v) => setWrapLength(v[0])} />
                 </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button 
                  onClick={handleCopy}
                  disabled={!output}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  Copy Master
                </Button>
                <div className="flex flex-col gap-2 flex-1">
                   <Button 
                    variant="outline"
                    onClick={() => handleDownload('txt')}
                    className="h-8 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all"
                   >
                     .TXT
                   </Button>
                   <Button 
                    variant="outline"
                    onClick={() => handleDownload('html')}
                    className="h-8 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all"
                   >
                     .HTML
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Intelligence</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine uses high-frequency syllable mapping for peak linguistic realism. For markup prototypes, use **HTML mode** to automatically wrap blocks in validated paragraph containers.
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
              <div className="px-3 py-1.5 rounded-lg bg-background border border-border text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-3">
                  <span>Words: {stats.words.toLocaleString()}</span>
                  <span className="opacity-20 text-foreground">|</span>
                  <span>Chars: {stats.chars.toLocaleString()}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-10 bg-black/10">
                  {!output ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-40">
                       <Maximize2 className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Linguistic Protocol</p>
                    </div>
                  ) : (
                    <div className="text-foreground/80 font-mono text-base leading-relaxed whitespace-pre-wrap select-all selection:bg-primary/20">
                       {output}
                    </div>
                  )}
               </div>

               {/* Stats Footer */}
               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Instant Synthesis</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Hardware-native linguistic generation for zero-latency design workflows.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
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
