
"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Type,
  ArrowRight,
  Hash,
  WholeWord,
  Scissors,
  CheckSquare,
  FileCode,
  Sparkles,
  RefreshCcw,
  Replace
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Flags = {
  g: boolean;
  i: boolean;
  m: boolean;
  s: boolean;
  u: boolean;
  y: boolean;
};

const SAMPLE_PATTERNS = [
  { label: 'Email', p: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { label: 'URL', p: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
  { label: 'Phone', p: '(\\+?\\d{1,3}[- ]?)?\\d{10}' },
  { label: 'Numbers', p: '\\d+' },
];

export default function RegexTesterPage() {
  const { toast } = useToast();
  const [pattern, setPattern] = useState('(?<word>\\b\\w+)\\b');
  const [testText, setTestText] = useState('The quick brown fox jumps over the lazy dog.');
  const [replaceText, setReplaceText] = useState('');
  const [flags, setFlags] = useState<Flags>({ g: true, i: true, m: false, s: false, u: false, y: false });
  const [isCopied, setIsCopied] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([f]) => f)
      .join('');
  }, [flags]);

  const results = useMemo(() => {
    if (!pattern.trim()) return { matches: [], error: null, replaced: '' };
    try {
      const regex = new RegExp(pattern, flagString);
      const matches = flags.g ? Array.from(testText.matchAll(regex)) : (() => {
        const m = testText.match(regex);
        return m ? [m] : [];
      })();

      const replaced = testText.replace(regex, replaceText);

      return { 
        matches, 
        error: null,
        replaced
      };
    } catch (err: any) {
      return { matches: [], error: err.message, replaced: '' };
    }
  }, [pattern, testText, flagString, replaceText, flags.g]);

  // Sync scroll between textarea and highlights
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(pattern);
    setIsCopied(true);
    toast({ title: "Pattern Copied", description: "Regex string saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
    setReplaceText('');
    toast({ title: "Studio Reset", description: "All buffers cleared." });
  };

  // Generate highlighted text
  const highlightedJSX = useMemo(() => {
    if (results.error || !pattern || results.matches.length === 0) return testText;

    let lastIndex = 0;
    const segments = [];

    // Sort matches by index to prevent overlaps
    const sortedMatches = [...results.matches].sort((a, b) => (a.index || 0) - (b.index || 0));

    sortedMatches.forEach((match, i) => {
      const start = match.index || 0;
      const end = start + match[0].length;

      if (start > lastIndex) {
        segments.push(testText.substring(lastIndex, start));
      }

      segments.push(
        <mark key={i} className="bg-primary/30 text-transparent border-b-2 border-primary rounded-sm">
          {testText.substring(start, end)}
        </mark>
      );

      lastIndex = end;
    });

    if (lastIndex < testText.length) {
      segments.push(testText.substring(lastIndex));
    }

    return segments;
  }, [testText, results.matches, results.error, pattern]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Search className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
              Regex <span className="text-primary italic">Tester PRO</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Professional regular expression evaluator. Test patterns against linguistic payloads with real-time match identification, capture group analysis, and local-only production.
            </p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={handleClear} className="h-11 px-6 rounded-xl border-border bg-secondary/50 text-[9px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <Trash2 className="w-4 h-4 mr-2" /> Reset
             </Button>
          </div>
        </div>
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
              {/* Pattern Input */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">RegExp Pattern</Label>
                    <div className="flex items-center gap-2">
                       {SAMPLE_PATTERNS.map((s) => (
                         <button 
                           key={s.label} 
                           onClick={() => { setPattern(s.p); toast({ title: "Sample Injected" }); }}
                           className="text-[8px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                         >
                           {s.label}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="relative group/pattern">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 font-mono text-xl pointer-events-none">/</div>
                    <Input 
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="[a-z]+"
                      className="h-16 bg-secondary border-border rounded-2xl text-lg font-mono font-bold pl-10 pr-14 focus:ring-primary/40"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 font-mono text-xl pointer-events-none">/{flagString}</div>
                  </div>
                  {results.error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{results.error}</p>
                    </div>
                  )}
                </div>

                {/* Flags Grid */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Flag Protocol Matrix</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'g', label: 'Global', desc: 'Find all matches in payload' },
                      { id: 'i', label: 'Insensitive', desc: 'Ignore char case casing' },
                      { id: 'm', label: 'Multiline', desc: 'Allow anchors to match lines' },
                      { id: 's', label: 'DotAll', desc: 'Allow . to match newlines' },
                      { id: 'u', label: 'Unicode', desc: 'Support unicode sequences' },
                      { id: 'y', label: 'Sticky', desc: 'Match only from last index' },
                    ].map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary border border-border group/flag hover:border-primary/20 transition-all">
                        <Checkbox 
                          id={f.id} 
                          checked={flags[f.id as keyof Flags]} 
                          onCheckedChange={(val) => setFlags(prev => ({ ...prev, [f.id]: !!val }))} 
                        />
                        <div className="space-y-0.5">
                          <Label htmlFor={f.id} className="text-[10px] font-black uppercase tracking-widest text-foreground/60 cursor-pointer">{f.label}</Label>
                          <p className="text-[8px] text-foreground/20 font-bold uppercase truncate">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Text Area */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Test Payload</Label>
                  <span className="text-[9px] font-mono text-primary/60">{testText.length.toLocaleString()} Chars</span>
                </div>
                
                <div className="relative group/textarea min-h-[300px]">
                  {/* Highlighting Overlay */}
                  <div 
                    ref={highlightRef}
                    className="absolute inset-0 p-8 text-lg leading-relaxed font-mono whitespace-pre-wrap break-all pointer-events-none select-none text-transparent overflow-hidden"
                    aria-hidden="true"
                  >
                    {highlightedJSX}
                  </div>
                  
                  <Textarea 
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    onScroll={handleScroll}
                    spellCheck={false}
                    className="absolute inset-0 h-full bg-secondary/50 border-border text-lg rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80 custom-scrollbar font-mono overflow-auto"
                  />
                </div>
              </div>

              {/* Replace Tool */}
              <div className="space-y-6 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <Replace className="w-4 h-4 text-primary" />
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Replacement Strategy</Label>
                </div>
                <div className="space-y-4">
                  <Input 
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Enter replacement string... ($1, $2 for groups)"
                    className="h-14 bg-secondary border-border rounded-2xl text-sm font-mono px-6 focus:ring-primary/40"
                  />
                  
                  {replaceText && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[9px] font-black text-primary uppercase tracking-widest">Replaced Output Matrix</Label>
                        <button onClick={() => { navigator.clipboard.writeText(results.replaced); toast({ title: "Result Copied" }); }} className="text-[9px] font-black uppercase text-foreground/40 hover:text-primary transition-colors">Copy Result</button>
                      </div>
                      <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl font-mono text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-all min-h-[100px] max-h-[300px] overflow-auto custom-scrollbar">
                        {results.replaced}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleCopyPattern}
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                  {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  Copy Pattern Master
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                  <Target className="w-4 h-4" /> Match Analytics
                </CardTitle>
                <div className={cn(
                  "px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest shadow-sm transition-all",
                  results.matches.length > 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-foreground/20"
                )}>
                  {results.matches.length} Identifiers Identified
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-10 flex-1 flex flex-col p-0">
              <div className="flex-1 overflow-auto custom-scrollbar max-h-[800px]">
                {results.matches.length > 0 ? (
                  <div className="divide-y divide-border">
                    {results.matches.map((m, i) => (
                      <div key={i} className="p-6 space-y-4 hover:bg-secondary/20 transition-all group/match">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shadow-inner">
                                {i + 1}
                              </span>
                              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Match Matrix</p>
                           </div>
                           <span className="text-[9px] font-mono font-bold text-primary/40 uppercase">Index: {m.index}</span>
                        </div>
                        
                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl border border-border group-hover/match:border-primary/20 transition-all">
                           <p className="text-sm font-mono font-bold text-foreground break-all">{m[0]}</p>
                        </div>

                        {/* Capture Groups Analysis */}
                        {m.length > 1 && (
                          <div className="space-y-2 pt-2">
                             <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 ml-1">Capture Groups</p>
                             <div className="space-y-1.5">
                                {m.slice(1).map((group, gIdx) => {
                                  // Determine if this is a named group
                                  const namedGroup = m.groups ? Object.entries(m.groups).find(([_, val]) => val === group) : null;
                                  return (
                                    <div key={gIdx} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 border border-border">
                                       <span className="text-[8px] font-black text-primary/60 uppercase min-w-[30px]">
                                         {namedGroup ? `"${namedGroup[0]}"` : `#${gIdx + 1}`}
                                       </span>
                                       <p className="text-[10px] font-mono text-foreground/60 truncate">{group || <span className="italic opacity-30">null</span>}</p>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center opacity-10 space-y-4 px-12">
                    <Activity className="w-20 h-20 mx-auto text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] leading-relaxed">
                      Awaiting Signal Detection<br/>
                      <span className="text-[9px]">Check pattern syntax and payload integrity</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-border bg-[#0a0a0c]">
                 <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                       <Zap className="w-4 h-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Hardware Intelligence</h4>
                    </div>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                      The studio utilizes browser-native RegExp evaluation for zero-latency detection. All linguistic deconstruction occurs 100% in local volatile memory.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        mark {
          color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

