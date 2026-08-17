"use client"

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Terminal, 
  Copy, 
  Trash2, 
  Zap, 
  Info,
  CheckCircle2,
  AlertCircle,
  Activity,
  Maximize2,
  Settings2,
  Target,
  ListTree,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function RegexTesterPage() {
  const { toast } = useToast();
  const [pattern, setPattern] = useState('[a-zA-Z0-9]+');
  const [testText, setTestText] = useState('Example text 123 to test your regex matrix.');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [isCopied, setIsCopied] = useState(false);

  const flagString = useMemo(() => {
    let str = '';
    if (flags.g) str += 'g';
    if (flags.i) str += 'i';
    if (flags.m) str += 'm';
    return str;
  }, [flags]);

  const results = useMemo(() => {
    if (!pattern.trim()) return { matches: [], error: null };
    try {
      const regex = new RegExp(pattern, flagString);
      const matches = Array.from(testText.matchAll(regex));
      return { 
        matches: matches.map(m => m[0]), 
        error: null 
      };
    } catch (err: any) {
      return { matches: [], error: err.message };
    }
  }, [pattern, testText, flagString]);

  const handleCopy = () => {
    if (pattern) {
      navigator.clipboard.writeText(pattern);
      setIsCopied(true);
      toast({ title: "Pattern Copied", description: "Regex string saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Search className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Regex <span className="text-primary italic">Tester Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional regular expression evaluator. Test patterns against linguistic payloads with real-time match identification and flag control protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Editor Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                Pattern Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">RegExp Pattern</Label>
                  <div className="relative group/pattern">
                    <Input 
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="[a-z]+"
                      className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-bold px-6 focus:ring-primary/40"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40 uppercase font-mono">/{flagString}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Flags Protocol</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'g', label: 'Global', desc: 'Scan entire payload' },
                      { id: 'i', label: 'Insensitive', desc: 'Ignore case type' },
                      { id: 'm', label: 'Multiline', desc: 'Process anchors' },
                    ].map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border group/flag hover:border-primary/20 transition-all">
                        <Checkbox 
                          id={f.id} 
                          checked={flags[f.id as keyof typeof flags]} 
                          onCheckedChange={(val) => setFlags(prev => ({ ...prev, [f.id]: !!val }))} 
                        />
                        <div className="space-y-0.5">
                          <Label htmlFor={f.id} className="text-[10px] font-black uppercase tracking-widest text-foreground/60 cursor-pointer">{f.label}</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Test Payload</Label>
                <Textarea 
                  placeholder="Paste text here to evaluate..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="min-h-[250px] bg-secondary border-border text-sm rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80 custom-scrollbar"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleCopy}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy Pattern
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-12 h-12 rounded-xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {results.error && (
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-4 animate-in shake duration-500">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-destructive uppercase tracking-widest leading-relaxed">{results.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Match Analytics Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                  <Target className="w-4 h-4" /> Match Matrix
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">{results.matches.length} Hits</div>
              </div>
            </CardHeader>
            <CardContent className="pt-10 flex-1 flex flex-col">
              <div className="flex-1 space-y-6">
                <div className="p-6 rounded-[2rem] bg-secondary/30 border border-border min-h-[200px] max-h-[400px] overflow-auto custom-scrollbar">
                  <div className="space-y-3">
                    {results.matches.length > 0 ? results.matches.map((m, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-xl bg-white dark:bg-black/20 border border-border group/hit">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary shrink-0 border border-primary/20">{i+1}</span>
                        <p className="text-xs font-mono font-bold text-foreground break-all">{m}</p>
                      </div>
                    )) : (
                      <div className="py-20 text-center opacity-10 space-y-4">
                        <Activity className="w-12 h-12 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Matches Identified</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-secondary border border-border space-y-4">
                   <div className="flex items-center gap-3 text-primary">
                      <Zap className="w-4 h-4" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">WASM Evaluator Active</h4>
                   </div>
                   <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                     Evaluation performed locally via browser-native RegExp matrix. Zero data latency or transmission protocols active.
                   </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                  <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Flag Hierarchy</p>
                    <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">Using {flagString.toUpperCase() || 'STANDARD'} protocol for current evaluation cycle.</p>
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
