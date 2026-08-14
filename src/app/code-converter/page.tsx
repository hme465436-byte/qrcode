
"use client"

import React, { useState, useEffect } from 'react';
import { 
  Binary, 
  Terminal, 
  Copy, 
  Trash2, 
  Sparkles, 
  Info,
  CheckCircle2,
  Code2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CodeConverterPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [byteCount, setByteCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Parse input into an array of clean hex values or '??'
  const parseInput = (str: string) => {
    // Remove 0x, \x, commas, and handle common wildcards
    const cleaned = str
      .replace(/0x/g, ' ')
      .replace(/\\x/g, ' ')
      .replace(/,/g, ' ')
      .replace(/\?/g, '??')
      .replace(/\*/g, '??');
    
    return cleaned.split(/\s+/).filter(part => part.length > 0).map(part => {
      if (part.includes('??') || part === '?') return '??';
      // Keep only hex chars
      const hex = part.replace(/[^0-9A-Fa-f]/g, '');
      return hex.padStart(2, '0').toUpperCase().substring(0, 2);
    }).filter(part => part.length > 0);
  };

  useEffect(() => {
    const parts = parseInput(input);
    setByteCount(parts.length);
  }, [input]);

  const convertTo = (format: 'csharp' | 'cpp' | 'python' | 'byte') => {
    const parts = parseInput(input);
    if (parts.length === 0) {
      toast({ variant: "destructive", title: "Empty Input", description: "Please paste an AOB pattern to convert." });
      return;
    }

    let result = '';
    switch (format) {
      case 'csharp':
        result = parts.join(' ');
        break;
      case 'byte':
        result = parts.map(p => p === '??' ? "'?'" : `0x${p}`).join(', ');
        break;
      case 'python':
        result = `b'${parts.map(p => p === '??' ? '\\xff' : `\\x${p}`).join('')}'`;
        break;
      case 'cpp':
        result = `{ ${parts.map(p => p === '??' ? '0x00' : `0x${p}`).join(', ')} }`;
        break;
    }
    setOutput(result);
    
    toast({
      title: "Conversion Complete",
      description: `Pattern translated to ${format.toUpperCase()} protocol.`,
    });
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Converted code saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    toast({ title: "Cleared", description: "Studio fields reset." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Binary className="w-3.5 h-3.5" /> Technical Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Code <span className="text-primary italic">Converter</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional AOB (Array of Bytes) utility for pattern conversion. Translate between C#, C++, Python, and Trainer-style hex formats instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Input Controls */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                    <Terminal className="w-6 h-6" />
                  </div>
                  Source Pattern
                </CardTitle>
                <div className="px-3 py-1 rounded-lg bg-secondary border border-border text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                  {byteCount} Bytes Detected
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Textarea 
                  placeholder="Paste AOB pattern... e.g. 00 A5 43 ?? 0xAA"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[160px] bg-secondary border-border text-lg rounded-3xl focus:ring-primary/40 p-6 text-foreground font-mono leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'C# AOB', id: 'csharp' },
                  { label: 'BYTE AOB', id: 'byte' },
                  { label: 'PYTHON', id: 'python' },
                  { label: 'C++ ARRAY', id: 'cpp' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => convertTo(btn.id as any)}
                    className={cn(
                      "h-12 rounded-xl border border-border bg-background text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                      "hover:text-primary hover:border-primary/40 hover:bg-primary/5 hover:shadow-md text-foreground/50"
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => convertTo('csharp')}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Process AOB
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Protocols Card */}
          <Card className="glass-card border-border shadow-xl overflow-hidden group">
            <CardHeader className="py-6 border-b border-border bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <Info className="w-4 h-4" /> Converter Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-medium text-foreground/50 uppercase tracking-wider leading-relaxed">
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">C# Format</span>
                  Space-separated hex + ?? wildcards.
                </div>
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">Byte Format</span>
                  0x00, 0x??, '?' (trainer style)
                </div>
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">Python</span>
                  b'\x00\x??' wildcards as \xff
                </div>
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">Wildcards</span>
                  ??, ?, * are all supported.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conversion Result
                </CardTitle>
                {output && (
                   <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase">Ready</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output">
                <Textarea 
                  readOnly
                  value={output}
                  placeholder="Output will appear here..."
                  className={cn(
                    "min-h-[300px] bg-white dark:bg-black/20 border-border text-foreground font-mono rounded-[2.5rem] p-8 text-lg leading-relaxed resize-none shadow-inner custom-scrollbar transition-all",
                    output ? "ring-1 ring-primary/20" : ""
                  )}
                />
                {!output && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Code2 className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleCopy}
                disabled={!output}
                className={cn(
                  "w-full h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                  output ? "text-primary border-primary/20" : "opacity-50"
                )}
              >
                {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                {isCopied ? 'Copied to Clipboard' : 'Copy Output Code'}
              </Button>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4 group-hover:bg-primary/10 transition-colors">
                 <Cpu className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Sanitized Conversion</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      Our engine automatically pads hex values to 2 digits and sanitizes formatting for compiler-ready production.
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
