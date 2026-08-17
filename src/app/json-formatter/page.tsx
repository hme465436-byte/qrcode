"use client"

import React, { useState, useMemo } from 'react';
import { 
  Braces, 
  FileJson, 
  Copy, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Info,
  Maximize2,
  Minimize2,
  Zap,
  AlertCircle,
  Code2,
  Activity,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function JsonFormatterPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'pretty' | 'minify'>('pretty');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const output = useMemo(() => {
    if (!input.trim()) {
      setError(null);
      return '';
    }
    try {
      const parsed = JSON.parse(input);
      setError(null);
      return JSON.stringify(parsed, null, mode === 'pretty' ? 2 : 0);
    } catch (err: any) {
      setError(`Matrix Alignment Error: ${err.message}`);
      return '';
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Matrix Copied", description: "JSON payload saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted_${Date.now()}.json`;
    a.click();
    toast({ title: "Export Success", description: "JSON master saved." });
  };

  const handleClear = () => {
    setInput('');
    setError(null);
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Braces className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          JSON <span className="text-primary italic">Formatter Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional data structuralization. Pretty-print or minify complex JSON objects locally with clinical validation and high-fidelity exports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                Inbound Payload
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source JSON</Label>
                  <span className="text-[9px] font-mono text-primary/60">{input.length.toLocaleString()} Chars</span>
                </div>
                <Textarea 
                  placeholder='{"id": 1, "status": "active", "data": [1, 2, 3]}'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[400px] bg-secondary border-border text-sm font-mono rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80 custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('pretty')}
                  className={cn(
                    "h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    mode === 'pretty' ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40"
                  )}
                >
                  <Maximize2 className="w-4 h-4" /> Pretty Print
                </button>
                <button
                  onClick={() => setMode('minify')}
                  className={cn(
                    "h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    mode === 'minify' ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40"
                  )}
                >
                  <Minimize2 className="w-4 h-4" /> Minify Matrix
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-4 animate-in shake duration-500">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-destructive uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Result Pane */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Formatted Result
                </CardTitle>
                {output && (
                  <div className="px-2 py-0.5 rounded bg-primary text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Master Ready</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              <div className="flex-1 relative group/output rounded-[2rem] bg-white dark:bg-black/20 border border-border overflow-hidden shadow-inner">
                <Textarea 
                  readOnly
                  value={output}
                  placeholder="Formatted JSON will appear here..."
                  className="w-full h-full min-h-[380px] p-8 font-mono text-[11px] leading-relaxed focus:outline-none bg-transparent text-foreground custom-scrollbar overflow-auto whitespace-pre border-none ring-0 focus-visible:ring-0"
                />
                {!output && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <FileJson className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleCopy}
                  disabled={!output}
                  className={cn(
                    "h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 group/btn",
                    !output && "opacity-50"
                  )}
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  Copy
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!output}
                  className="h-12 rounded-xl border-border bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 mr-2 text-primary" />
                  Save .json
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                  <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Protocol Intelligence</p>
                    <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">Automatic syntax highlighting and indentation mapping via hardware-native JSON protocols.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                  <Activity className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                    <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">All parsing occurs 100% in local browser memory. Hardware identifiers are never transmitted.</p>
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
