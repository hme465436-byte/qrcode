"use client"

import React, { useState, useMemo, useRef } from 'react';
import { 
  AlignLeft, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle2, 
  Info,
  Settings2,
  FileText,
  Type,
  ListTree,
  ArrowDownCircle,
  Zap,
  CheckSquare,
  WholeWord,
  Loader2,
  ListFilter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DuplicateLineRemoverPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Options
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimSpaces, setTrimSpaces] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logic Matrix
  const { output, stats } = useMemo(() => {
    if (!input) {
      return { output: '', stats: { original: 0, removed: 0, final: 0 } };
    }

    const lines = input.split(/\r?\n/);
    const seen = new Set<string>();
    const result: string[] = [];
    let removedCount = 0;

    lines.forEach((line) => {
      let compareLine = line;
      
      if (trimSpaces) compareLine = compareLine.trim();
      if (ignoreCase) compareLine = compareLine.toLowerCase();

      // Empty line check
      if (removeEmpty && !compareLine.trim()) {
        removedCount++;
        return;
      }

      if (!seen.has(compareLine)) {
        seen.add(compareLine);
        result.push(line);
      } else {
        removedCount++;
      }
    });

    const finalOutput = result.join('\n');

    return {
      output: finalOutput,
      stats: {
        original: lines.length,
        removed: removedCount,
        final: result.length
      }
    };
  }, [input, ignoreCase, trimSpaces, removeEmpty]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
        toast({ title: "Matrix Imported", description: "Text file loaded into studio." });
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Cleaned Matrix Copied", description: "Result saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sanitized-lines-${Date.now()}.txt`;
    link.click();
    toast({ title: "Export Success", description: "Linguistic master saved as .txt" });
  };

  const handleClear = () => {
    setInput('');
    toast({ title: "Studio Reset", description: "Input and output buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ListFilter className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Duplicate <span className="text-primary italic">Line Remover</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional redundancy sanitization. Identify and purge duplicate entries from logs, lists, and data blocks with precision comparison protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input & Controls */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <AlignLeft className="w-6 h-6" />
                </div>
                Source Payload
              </CardTitle>
              <div className="flex items-center gap-3">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => fileInputRef.current?.click()}
                   className="h-9 px-4 rounded-xl border-border bg-background hover:bg-secondary text-[9px] font-black uppercase tracking-widest"
                 >
                   <Upload className="w-3.5 h-3.5 mr-2" /> Upload .txt
                 </Button>
                 <input type="file" ref={fileInputRef} accept=".txt" onChange={handleFileUpload} className="hidden" />
              </div>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Linguistic Data Matrix</Label>
                  <span className="text-[10px] font-mono text-primary/60">{input.length.toLocaleString()} Chars</span>
                </div>
                <Textarea 
                  placeholder="Paste entries here... (e.g. log lists, email rosters, data points)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[350px] bg-secondary border-border text-lg rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80 custom-scrollbar"
                />
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Sanitization Protocols</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group/toggle hover:border-primary/20 transition-all">
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase text-foreground/40">Ignore Case</p>
                         <p className="text-[8px] text-foreground/20 font-bold uppercase tracking-tighter">Case-Insensitive</p>
                      </div>
                      <Switch checked={ignoreCase} onCheckedChange={setIgnoreCase} className="scale-75" />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group/toggle hover:border-primary/20 transition-all">
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase text-foreground/40">Trim Spaces</p>
                         <p className="text-[8px] text-foreground/20 font-bold uppercase tracking-tighter">Purge Padding</p>
                      </div>
                      <Switch checked={trimSpaces} onCheckedChange={setTrimSpaces} className="scale-75" />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border group/toggle hover:border-primary/20 transition-all">
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase text-foreground/40">Empty Lines</p>
                         <p className="text-[8px] text-foreground/20 font-bold uppercase tracking-tighter">Remove Blank</p>
                      </div>
                      <Switch checked={removeEmpty} onCheckedChange={setRemoveEmpty} className="scale-75" />
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  onClick={handleClear}
                  disabled={!input}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Clear Studio
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Occurrence Logic</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                The engine utilizes a "Keep First" protocol. The initial encounter of a unique character string is preserved in its original formatting, while all subsequent matching matrices are definitively purged.
              </p>
            </div>
          </div>
        </div>

        {/* Analytics & Results */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 fill-primary/20" /> Matrix Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl bg-secondary border border-border text-center space-y-1">
                    <p className="text-2xl font-headline font-black text-foreground">{stats.original.toLocaleString()}</p>
                    <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Original Lines</p>
                 </div>
                 <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-1">
                    <p className="text-2xl font-headline font-black text-primary">-{stats.removed.toLocaleString()}</p>
                    <p className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Duplicates Purged</p>
                 </div>
              </div>

              <div className="relative group/output rounded-[2rem] bg-white dark:bg-black/20 border border-border overflow-hidden shadow-inner">
                <div className="p-3 bg-secondary/50 border-b border-border flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                     <CheckSquare className="w-3 h-3" /> Sanitized Output
                   </div>
                   <span className="text-[9px] font-mono text-primary font-bold">{stats.final.toLocaleString()} Lines Remaining</span>
                </div>
                <pre 
                  className="w-full min-h-[300px] max-h-[500px] p-8 font-mono text-[11px] leading-relaxed focus:outline-none bg-transparent text-foreground custom-scrollbar overflow-auto whitespace-pre"
                >
                  {output || (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <ListTree className="w-20 h-20 text-primary mb-4" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] font-sans">Awaiting Payload</p>
                    </div>
                  )}
                </pre>
              </div>

              <div className="flex flex-col gap-4">
                 <Button 
                  onClick={handleCopy}
                  disabled={!output}
                  className={cn(
                    "w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn",
                    !output && "opacity-50"
                  )}
                >
                  {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  {isCopied ? 'Matrix Copied' : 'Copy Clean Matrix'}
                </Button>
                
                <Button 
                  onClick={handleDownload}
                  disabled={!output}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 mr-3 text-primary" />
                  Save as .txt Master
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                    <WholeWord className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Matrix Identity</p>
                       <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Unique character strings are indexed via a high-performance hash map for instant identification.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                    <ArrowDownCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Memory Efficiency</p>
                       <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Linear split-join protocols allow for high-volume text processing with minimal hardware latency.</p>
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
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
