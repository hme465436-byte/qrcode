
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  FileCode,
  Upload,
  ArrowRightLeft,
  Search,
  ListTree,
  Type,
  SortAsc,
  Quote,
  ChevronRight,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Recursive Tree Component ---
const JsonTreeNode = ({ data, label, depth = 0, initialExpanded = true, searchQuery = '' }: { 
  data: any, 
  label?: string, 
  depth?: number, 
  initialExpanded?: boolean,
  searchQuery?: string 
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded || depth < 2);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);
  const type = isArray ? 'array' : typeof data;

  const renderValue = (val: any) => {
    if (val === null) return <span className="text-red-400 font-bold">null</span>;
    if (typeof val === 'boolean') return <span className="text-orange-400 font-bold">{val.toString()}</span>;
    if (typeof val === 'number') return <span className="text-blue-400 font-mono">{val}</span>;
    
    const str = String(val);
    const shouldHighlight = searchQuery && str.toLowerCase().includes(searchQuery.toLowerCase());
    
    return (
      <span className={cn(
        "text-emerald-400 break-all",
        shouldHighlight && "bg-primary/30 text-white px-0.5 rounded"
      )}>
        "{str}"
      </span>
    );
  };

  const keys = isObject ? Object.keys(data) : [];
  const isEmpty = isObject && keys.length === 0;

  return (
    <div className={cn("pl-4 border-l border-white/5", depth === 0 && "pl-0 border-none")}>
      <div className="flex items-start gap-2 py-0.5 group">
        {isObject && !isEmpty && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-white/20 hover:text-primary transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        )}
        
        <div className="flex flex-wrap gap-1.5 text-xs font-mono">
          {label && (
            <span className="text-white/40 font-bold">
              {label}: 
            </span>
          )}
          
          {!isObject ? (
            renderValue(data)
          ) : (
            <span className="text-white/20">
              {isArray ? `Array[${data.length}]` : `Object{${keys.length}}`}
              {!isExpanded && <span className="ml-2 text-[9px] bg-white/5 px-1.5 py-0.5 rounded italic">...</span>}
            </span>
          )}
        </div>
      </div>

      {isObject && isExpanded && (
        <div className="space-y-0.5">
          {isArray ? (
            data.map((item, i) => (
              <JsonTreeNode key={i} data={item} label={i.toString()} depth={depth + 1} searchQuery={searchQuery} />
            ))
          ) : (
            keys.map((key) => (
              <JsonTreeNode key={key} data={data[key]} label={key} depth={depth + 1} searchQuery={searchQuery} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- Page Logic ---
export default function JsonFormatterPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text');
  const [indent, setIndent] = useState<2 | 4>(2);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<{ message: string, line?: number, col?: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidation = (val: string) => {
    if (!val.trim()) {
      setError(null);
      setParsedData(null);
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(val);
      setParsedData(parsed);
      setError(null);
      return parsed;
    } catch (err: any) {
      const message = err.message;
      let line, col;
      // Extract position if available from V8 error message
      const posMatch = message.match(/at position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const linesBefore = val.substring(0, pos).split('\n');
        line = linesBefore.length;
        col = linesBefore[linesBefore.length - 1].length + 1;
      }
      setError({ message, line, col });
      setParsedData(null);
      return null;
    }
  };

  const formatJson = (mode: 'pretty' | 'minify' | 'sort') => {
    const data = handleValidation(input);
    if (!data) return;

    let result = data;
    if (mode === 'sort') {
      const sortObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(sortObject);
        return Object.keys(obj).sort().reduce((acc: any, key) => {
          acc[key] = sortObject(obj[key]);
          return acc;
        }, {});
      };
      result = sortObject(data);
    }

    const outputStr = JSON.stringify(result, null, mode === 'minify' ? 0 : indent);
    setOutput(outputStr);
    if (mode !== 'sort') {
      toast({ title: mode === 'minify' ? "Matrix Minified" : "Matrix Formatted" });
    }
  };

  const handleEscape = (mode: 'escape' | 'unescape') => {
    if (!input.trim()) return;
    try {
      if (mode === 'escape') {
        setOutput(JSON.stringify(input));
      } else {
        // Try to unescape by parsing it as a JSON string
        // Note: input might need to be wrapped in quotes if it isn't a valid JSON string
        let toParse = input.trim();
        if (!toParse.startsWith('"')) toParse = `"${toParse}"`;
        setOutput(JSON.parse(toParse));
      }
      toast({ title: "String Protocol Executed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Escape Error", description: "Malformed string literal." });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content);
        handleValidation(content);
        toast({ title: "JSON Injected" });
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    const sample = {
      id: "studio-001",
      status: "active",
      config: {
        theme: "obsidian",
        version: 7.2,
        features: ["wasm", "local-storage", "aes-256"]
      },
      metrics: [12.5, 44.2, 98.1],
      meta: null,
      internal: true
    };
    const str = JSON.stringify(sample, null, 2);
    setInput(str);
    handleValidation(str);
    setOutput(str);
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Copied", description: "JSON payload saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mykit_formatted_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      {/* SEO & Header */}
      <head>
        <title>Advanced JSON Formatter | Free Online | My Kit Tool</title>
        <meta name="description" content="Professional JSON formatter, validator, and minifier. Interactive tree view, key sorting, and string escaping. 100% private, local browser processing." />
      </head>

      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Braces className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                JSON <span className="text-primary italic">Formatter PRO</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade structuralization engine. Validate, beautify, and minify complex data structures locally with interactive tree visualization and clinical error reporting.
              </p>
           </div>
           <div className="flex flex-wrap gap-3 shrink-0">
              <Button variant="outline" onClick={loadSample} className="h-11 px-6 rounded-xl border-border bg-secondary/50 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all">
                 <Zap className="w-4 h-4 mr-2" /> Load Sample
              </Button>
              <Button variant="outline" onClick={() => { setInput(''); setOutput(''); setError(null); setParsedData(null); }} className="h-11 px-6 rounded-xl border-border bg-secondary/50 text-[9px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                 <Trash2 className="w-4 h-4 mr-2" /> Clear Studio
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Input Panel */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[650px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                Inbound Payload
              </CardTitle>
              <div className="flex items-center gap-3">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => fileInputRef.current?.click()}
                   className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-foreground/40 hover:text-primary text-[9px] font-black uppercase tracking-widest"
                 >
                   <Upload className="w-3.5 h-3.5 mr-2" /> Upload .json
                 </Button>
                 <input type="file" ref={fileInputRef} accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <div className="relative flex-1 flex overflow-hidden">
                {/* Line Numbers Simulation */}
                <div className="w-12 bg-black/20 border-r border-white/5 pt-8 flex flex-col items-center text-[10px] font-mono text-white/10 select-none no-scrollbar overflow-hidden">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} className="h-6 leading-6">{i + 1}</div>
                  ))}
                </div>
                <textarea 
                  placeholder='Paste raw JSON matrix here...'
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    handleValidation(e.target.value);
                  }}
                  spellCheck={false}
                  className="flex-1 p-8 bg-transparent text-sm font-mono text-foreground leading-6 resize-none focus:outline-none custom-scrollbar"
                />
              </div>

              {/* Input Toolbox */}
              <div className="p-6 border-t border-border bg-secondary/20 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={() => formatJson('pretty')} 
                  disabled={!input.trim()}
                  className="h-11 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-2" /> Beautify
                </Button>
                <Button 
                  onClick={() => formatJson('minify')} 
                  disabled={!input.trim()}
                  variant="outline"
                  className="h-11 border-white/10 bg-background text-[9px] font-black uppercase tracking-widest rounded-xl"
                >
                  <Minimize2 className="w-3.5 h-3.5 mr-2" /> Minify
                </Button>
                <Button 
                  onClick={() => formatJson('sort')} 
                  disabled={!input.trim()}
                  variant="outline"
                  className="h-11 border-white/10 bg-background text-[9px] font-black uppercase tracking-widest rounded-xl"
                >
                  <SortAsc className="w-3.5 h-3.5 mr-2" /> Sort Keys
                </Button>
                <Select value={indent.toString()} onValueChange={(v) => setIndent(parseInt(v) as any)}>
                  <SelectTrigger className="h-11 bg-background border-white/10 text-[9px] font-black uppercase rounded-xl">
                    <SelectValue placeholder="Indent" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="2" className="text-[9px] font-black uppercase">2 Spaces</SelectItem>
                    <SelectItem value="4" className="text-[9px] font-black uppercase">4 Spaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Validation Alert */}
          {error ? (
            <div className="p-6 rounded-[2.5rem] bg-destructive/10 border border-destructive/20 flex items-start gap-5 animate-in shake duration-500 shadow-xl shadow-destructive/5">
              <AlertCircle className="w-8 h-8 text-destructive shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-destructive uppercase tracking-widest">Matrix Alignment Error</h4>
                <p className="text-[11px] text-foreground/50 leading-relaxed font-bold uppercase">{error.message}</p>
                {error.line && (
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] bg-destructive/20 px-2 py-0.5 rounded text-destructive font-mono">Line: {error.line}</span>
                    <span className="text-[10px] bg-destructive/20 px-2 py-0.5 rounded text-destructive font-mono">Col: {error.col}</span>
                  </div>
                )}
              </div>
            </div>
          ) : input.trim() && (
            <div className="p-6 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-5 shadow-xl shadow-emerald-500/5 animate-in zoom-in duration-300">
               <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Protocol Verified</h4>
                  <p className="text-[10px] text-foreground/40 font-medium uppercase">Input matrix is syntactically valid JSON.</p>
               </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[650px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
                  <TabsList className="bg-background border border-white/5 p-1 rounded-2xl h-11">
                    <TabsTrigger value="text" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Text View</TabsTrigger>
                    <TabsTrigger value="tree" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Tree Map</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-4">
                 <div className="relative group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                    <Input 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-9 bg-background/50 border-white/10 rounded-xl text-[10px] font-bold w-[120px] focus:w-[180px] transition-all"
                    />
                 </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="flex-1 relative overflow-hidden flex flex-col">
                {!output && !parsedData ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-10 py-32 space-y-4">
                    <Activity className="w-20 h-20 text-primary mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                  </div>
                ) : viewMode === 'text' ? (
                  <div className="flex-1 overflow-hidden flex">
                    <div className="w-12 bg-black/20 border-r border-white/5 pt-8 flex flex-col items-center text-[10px] font-mono text-white/5 select-none no-scrollbar overflow-hidden">
                      {output.split('\n').map((_, i) => (
                        <div key={i} className="h-6 leading-6">{i + 1}</div>
                      ))}
                    </div>
                    <textarea 
                      readOnly
                      value={output}
                      className="flex-1 p-8 bg-transparent text-sm font-mono text-foreground leading-6 resize-none focus:outline-none custom-scrollbar overflow-auto whitespace-pre"
                    />
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-black/10">
                    {parsedData ? (
                      <JsonTreeNode data={parsedData} searchQuery={searchQuery} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] font-black uppercase text-foreground/20 italic">Invalid Matrix for Mapping</div>
                    )}
                  </div>
                )}
              </div>

              {/* Output Actions */}
              <div className="p-6 border-t border-border bg-[#0a0a0c] flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                   <Button 
                    onClick={handleCopy}
                    disabled={!output}
                    className="h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
                  >
                    {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Master
                  </Button>
                  <Button 
                    onClick={handleDownload}
                    disabled={!output}
                    variant="outline"
                    className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] active:scale-95"
                  >
                    <Download className="w-4 h-4 mr-3 text-primary" />
                    Download .json
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-4">
                      <Label className="text-[8px] font-black text-foreground/30 uppercase tracking-widest block">String Transforms</Label>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handleEscape('escape')} size="sm" className="flex-1 text-[9px] font-black uppercase bg-background border border-white/5">Escape</Button>
                        <Button variant="ghost" onClick={() => handleEscape('unescape')} size="sm" className="flex-1 text-[9px] font-black uppercase bg-background border border-white/5">Unescape</Button>
                      </div>
                   </div>
                   <div className="p-5 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Guaranteed</p>
                        <p className="text-[9px] text-foreground/40 font-medium leading-relaxed">Processing occurs 100% in local memory.</p>
                      </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEO Content Footer */}
      <section className="mt-20 max-w-4xl mx-auto space-y-12 pb-20">
         <div className="space-y-6">
            <h2 className="text-3xl font-headline font-black uppercase tracking-tight text-foreground">Advanced JSON Production</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-foreground/60 leading-relaxed font-medium">
               <div className="space-y-4">
                  <p>Our JSON Formatter Studio provides a clinical environment for developers and data engineers to sanitize, validate, and visualize structured linguistic payloads.</p>
                  <p>Unlike standard formatters, we utilize hardware-native JSON protocols to perform key sorting and string escaping without any data latency or transmission to remote servers.</p>
               </div>
               <div className="space-y-4">
                  <p>Use the interactive Tree View to traverse complex hierarchical objects, or leverage the Minifier to strip whitespace and optimize your payloads for production API integration.</p>
                  <p>Everything works locally within your browser's WASM sandbox, ensuring your sensitive configuration and data remain strictly private and permanent.</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { q: "Is this JSON formatter secure?", a: "Absolutely. We do not store or transmit any input data. All structural re-mapping and formatting occur 100% locally in your browser memory." },
             { q: "Can I handle large JSON files?", a: "Yes. Our studio is optimized for high-volume data streams. For extremely large matrices, we recommend using the Text View to minimize UI rendering overhead." },
             { q: "What does 'Key Sorting' do?", a: "It alphabetically reorders object keys at all levels. This is essential for diffing JSON files or creating canonical data representations." }
           ].map((faq, i) => (
             <div key={i} className="p-8 rounded-[2.5rem] bg-secondary/50 border border-border space-y-4 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <Info className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight text-foreground">{faq.q}</h4>
                <p className="text-xs text-foreground/40 leading-relaxed font-medium">{faq.a}</p>
             </div>
           ))}
         </div>
      </section>

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "JSON Formatter PRO",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": ["JSON Formatting", "Syntax Validation", "Tree View Visualization", "Minification", "Key Sorting"],
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mykittool.app" },
            { "@type": "ListItem", "position": 2, "name": "JSON Formatter", "item": "https://mykittool.app/json-formatter" }
          ]
        }
      })}} />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
