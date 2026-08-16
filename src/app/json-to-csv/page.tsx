"use client"

import React, { useState, useMemo, useRef } from 'react';
import { 
  FileJson, 
  Table, 
  Upload, 
  Download, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Info,
  Settings2,
  FileCode,
  Braces,
  Zap,
  Activity,
  Maximize2,
  ArrowRightLeft,
  AlertCircle,
  Code2,
  ListTree,
  FileSearch,
  Loader2,
  Rows,
  Columns
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Delimiter = ',' | ';' | '\t';

export default function JsonToCsvPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options
  const [hasHeaders, setHasHeaders] = useState(true);
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [flattenObjects, setFlattenObjects] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep Flattening Logic
  const flatten = (obj: any, prefix = '', res: any = {}) => {
    for (const key in obj) {
      const propName = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flatten(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
    return res;
  };

  const csvOutput = useMemo(() => {
    if (!input.trim()) {
      setError(null);
      return '';
    }

    try {
      let parsed = JSON.parse(input);
      
      // Normalize to array
      if (!Array.from(parsed).length && typeof parsed === 'object') {
        parsed = [parsed];
      }
      
      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON object or array of objects.");
      }

      const flatData = flattenObjects ? parsed.map(item => flatten(item)) : parsed;
      
      // Extract unique headers across all objects
      const headerSet = new Set<string>();
      flatData.forEach((item: any) => {
        Object.keys(item).forEach(key => headerSet.add(key));
      });
      const headers = Array.from(headerSet);

      if (headers.length === 0) return '';

      const rows = flatData.map((item: any) => {
        return headers.map(header => {
          let val = item[header];
          if (val === undefined || val === null) return '';
          
          // Escape quotes and wrap in quotes if contains delimiter
          const strVal = String(val);
          if (strVal.includes(delimiter) || strVal.includes('"') || strVal.includes('\n')) {
            return `"${strVal.replace(/"/g, '""')}"`;
          }
          return strVal;
        }).join(delimiter);
      });

      const finalCsv = hasHeaders 
        ? [headers.join(delimiter), ...rows].join('\n')
        : rows.join('\n');

      setError(null);
      return finalCsv;
    } catch (err: any) {
      setError(`Matrix Parse Failure: ${err.message || "Invalid JSON structure"}`);
      return '';
    }
  }, [input, hasHeaders, delimiter, flattenObjects]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
        setIsProcessing(false);
        toast({ title: "JSON Matrix Injected", description: "Source data successfully loaded." });
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    if (csvOutput) {
      navigator.clipboard.writeText(csvOutput);
      setIsCopied(true);
      toast({ title: "CSV Copied", description: "Matrix saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_matrix_${Date.now()}.csv`;
    link.click();
    toast({ title: "Export Success", description: "CSV master saved to device." });
  };

  const handleClear = () => {
    setInput('');
    setError(null);
    toast({ title: "Studio Reset", description: "Buffers purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileJson className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          JSON to <span className="text-primary italic">CSV Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          High-performance data deconstruction. Convert complex JSON objects into flat CSV matrices with automated object flattening and clinical header mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Braces className="w-6 h-6" />
                </div>
                JSON Source Payload
              </CardTitle>
              <div className="flex items-center gap-3">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => fileInputRef.current?.click()}
                   className="h-9 px-4 rounded-xl border-border bg-background hover:bg-secondary text-[9px] font-black uppercase tracking-widest"
                 >
                   <Upload className="w-3.5 h-3.5 mr-2" /> Upload .json
                 </Button>
                 <input type="file" ref={fileInputRef} accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
              </div>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Input Matrix (Array preferred)</Label>
                  <span className="text-[10px] font-mono text-primary/60">{input.length.toLocaleString()} Chars</span>
                </div>
                <Textarea 
                  placeholder='[{"id": 1, "name": "Studio"}, {"id": 2, "name": "Production"}]'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[400px] bg-secondary border-border text-sm font-mono rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80 custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Delimiter</Label>
                   <Select value={delimiter} onValueChange={(v: any) => setDelimiter(v)}>
                      <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-[10px] font-black uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                         <SelectItem value="," className="text-[10px] font-black uppercase">Comma ( , )</SelectItem>
                         <SelectItem value=";" className="text-[10px] font-black uppercase">Semicolon ( ; )</SelectItem>
                         <SelectItem value="\t" className="text-[10px] font-black uppercase">Tab Space</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between group transition-all hover:border-primary/20">
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase text-foreground/40">Flatten</p>
                         <p className="text-[7px] text-foreground/20 font-bold uppercase tracking-tighter">Deep Objects</p>
                      </div>
                      <Switch checked={flattenObjects} onCheckedChange={setFlattenObjects} className="scale-75" />
                   </div>
                   <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between group transition-all hover:border-primary/20">
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase text-foreground/40">Headers</p>
                         <p className="text-[7px] text-foreground/20 font-bold uppercase tracking-tighter">Include Keys</p>
                      </div>
                      <Switch checked={hasHeaders} onCheckedChange={setHasHeaders} className="scale-75" />
                   </div>
                </div>
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

        {/* Output Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CSV Matrix Result
                </CardTitle>
                {csvOutput && (
                   <div className="px-3 py-1 rounded-lg bg-primary text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Ready for Production</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              <div className="flex-1 relative group/output rounded-[2rem] bg-white dark:bg-black/20 border border-border overflow-hidden shadow-inner">
                <Textarea 
                  readOnly
                  value={csvOutput}
                  placeholder="CSV output will appear here..."
                  className="w-full h-full min-h-[480px] p-8 font-mono text-[11px] leading-relaxed focus:outline-none bg-transparent text-foreground custom-scrollbar overflow-auto whitespace-pre border-none ring-0 focus-visible:ring-0"
                />
                {!csvOutput && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Table className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting JSON Payload</p>
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={handleCopy}
                  disabled={!csvOutput}
                  className="h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                  {isCopied ? 'Matrix Copied' : 'Copy CSV'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!csvOutput}
                  className="h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 mr-3 text-primary" />
                  Save .csv
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4">
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <Maximize2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Recursive Flattening</p>
                       <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">Deeply nested objects are translated to dot-separated header strings for clinical data mapping.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                    <Activity className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                       <p className="text-[10px] text-foreground/60 leading-relaxed font-medium uppercase">All data translation occurs 100% locally. Hardware-native memory isolation ensures zero leakage.</p>
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
