
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code2, 
  Send, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  RotateCcw,
  Loader2, 
  Settings2, 
  Zap, 
  History,
  Activity,
  FileCode,
  ArrowRight,
  Terminal,
  Database,
  ChevronRight,
  Braces,
  ShieldCheck,
  FileDown,
  Check,
  Wand2,
  FileEdit,
  Info,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { Badge } from '@/components/ui/badge';

const HISTORY_KEY = 'mykit_code_generator_history_v3';

interface CodeHistory {
  id: string;
  name: string;
  code: string;
  explanation: string;
  timestamp: number;
  language: string;
  mode: string;
}

const LANGUAGES = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'TypeScript'
];

const MODES = [
  { id: 'new', label: 'New Code', icon: Sparkles },
  { id: 'fix', label: 'Fix Code', icon: FileEdit },
  { id: 'explain', label: 'Explain', icon: Info },
];

export default function AiCodeGeneratorPage() {
  const { toast } = useToast();
  
  // Input State
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('React');
  const [mode, setMode] = useState('new');
  const [extra, setExtra] = useState('');
  const [improveInput, setImproveInput] = useState('');
  
  // Results State
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<CodeHistory[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveToHistory = (c: string, exp: string, m: string = mode) => {
    const next = [{
      id: Math.random().toString(36).substr(2, 9),
      name: prompt.substring(0, 40) || 'New Snippet',
      code: c,
      explanation: exp,
      language,
      mode: m,
      timestamp: Date.now()
    }, ...history.filter(h => h.code !== c)].slice(0, 20);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const handleGenerate = async (isImprove = false) => {
    const task = isImprove ? improveInput : prompt;
    if (!task.trim() && !isImprove) {
      toast({ variant: "destructive", title: "Missing Input", description: "Describe your requirement to begin." });
      return;
    }

    setIsProcessing(true);
    // If not improving, clear current output for clean UI
    if (!isImprove) {
      setCode('');
      setExplanation('');
    }

    try {
      const payload = isImprove ? {
        mode: 'improve',
        language,
        currentCode: code,
        instruction: improveInput
      } : {
        prompt,
        language,
        mode,
        extra
      };

      const response = await fetch('/api/ai-code-generator', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCode(data.code);
        setExplanation(data.explanation);
        saveToHistory(data.code, data.explanation, isImprove ? 'improve' : mode);
        if (isImprove) {
          setImproveInput('');
          toast({ title: "Improvement Synthesized" });
        } else {
          toast({ title: "Synthesis Complete", description: "Code matrix established." });
        }
      } else {
        throw new Error(data.message || "Service unavailable. Try again.");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Service unavailable. Try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleRestore = (item: CodeHistory) => {
    setCode(item.code);
    setExplanation(item.explanation);
    setPrompt(item.name);
    setLanguage(item.language);
    setMode(item.mode === 'improve' ? 'new' : item.mode);
    toast({ title: "Snippet Restored" });
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    toast({ title: "Identity Purged" });
  };

  const handleReset = () => {
    setPrompt('');
    setExtra('');
    setImproveInput('');
    setCode('');
    setExplanation('');
    toast({ title: "Studio Reset" });
  };

  const handleDownloadCode = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const extMap: any = { 'React': 'tsx', 'JavaScript': 'js', 'Python': 'py', 'HTML': 'html', 'CSS': 'css', 'TypeScript': 'ts' };
    const ext = extMap[language] || 'txt';
    a.download = `studio_export_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "File Saved" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full bg-[#0a0a0c] min-h-screen">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Code2 className="w-3.5 h-3.5" /> Intelligence Suite Pro
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-white uppercase tracking-tight leading-none">
            AI Code <span className="text-primary italic">Generator</span>
          </h1>
          <p className="text-white/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional high-fidelity code synthesis. Generate, fix, and explain logic across multiple languages using secure multi-node processing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="ai-code" />
           <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Settings Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-white">
                    <Settings2 className="w-5 h-5 text-primary" /> Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Studio Mode</Label>
                       <div className="grid grid-cols-3 gap-2">
                          {MODES.map(m => (
                            <button
                              key={m.id}
                              onClick={() => setMode(m.id)}
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all h-20",
                                mode === m.id ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                              )}
                            >
                               <m.icon className="w-4 h-4" />
                               <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-white/40 uppercase ml-1">
                          {mode === 'fix' ? 'Code to Fix' : mode === 'explain' ? 'Concept to Explain' : 'Linguistic Request'}
                       </Label>
                       <Textarea 
                        value={prompt} 
                        onChange={e => setPrompt(e.target.value)} 
                        placeholder={mode === 'fix' ? "Paste the code containing the error..." : "e.g. Build a secure password hash utility in Node.js..."} 
                        className="h-32 bg-secondary/50 border-border rounded-2xl text-xs font-bold p-6 resize-none focus:ring-primary/40" 
                       />
                    </div>
                    
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-white/40 uppercase ml-1">Target Language</Label>
                       <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px] tracking-widest">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {LANGUAGES.map(l => (
                               <SelectItem key={l} value={l} className="text-[10px] font-black uppercase">{l}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-white/40 uppercase ml-1">Extra Details (Optional)</Label>
                       <Textarea value={extra} onChange={e => setExtra(e.target.value)} placeholder="Specific frameworks, comments, error handling..." className="h-24 bg-secondary/30 border-border rounded-2xl text-[10px] resize-none p-4" />
                    </div>
                 </div>

                 <Button 
                   onClick={() => handleGenerate()} 
                   disabled={isProcessing || !prompt.trim()}
                   className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing && !code ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Synthesize Logic
                 </Button>
              </CardContent>
           </Card>

           {/* History Module */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white">Identity Registry</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={() => setHistory([])} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Clear All</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black/10">
                 {history.length === 0 ? (
                    <div className="py-20 text-center opacity-10 space-y-4">
                       <Activity className="w-10 h-10 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix history</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map(item => (
                         <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => handleRestore(item)}>
                            <div className="min-w-0 flex-1">
                               <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{item.name}</p>
                               <div className="flex items-center gap-3 mt-1">
                                  <Badge variant="outline" className="text-[6px] py-0 px-2 border-primary/20 text-primary uppercase">{item.language}</Badge>
                                  <Badge variant="outline" className="text-[6px] py-0 px-2 border-white/10 text-white/30 uppercase">{item.mode}</Badge>
                                  <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={(e) => { e.stopPropagation(); handleDeleteHistory(e, item.id); }} className="p-2 text-foreground/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash2 className="w-3.5 h-3.5" />
                               </button>
                               <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Workspace Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Visualizer</CardTitle>
                 </div>
                 {code && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">MASTER READY</Badge>}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                 <div className="flex-1 relative group/output flex flex-col min-h-[400px]">
                    {isProcessing && !code ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-40 gap-8">
                         <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <Terminal className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                          </div>
                         <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Synthesizing Code Matrix...</p>
                      </div>
                    ) : code ? (
                      <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                         {/* Header Info */}
                         <div className="p-6 bg-secondary/20 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-6">
                               <Label className="text-[9px] font-black text-primary uppercase tracking-widest">{language} Logic</Label>
                               <span className="text-[8px] font-mono text-white/20 uppercase">{code.length} bytes isolated</span>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => handleCopy(code, 'code')} className="p-2 rounded-lg bg-background border border-border text-foreground/20 hover:text-primary transition-all">
                                  {isCopied === 'code' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                               </button>
                            </div>
                         </div>
                         
                         {/* Code Area */}
                         <div className="flex-1 p-0 bg-[#060608] relative overflow-hidden flex flex-col min-h-[300px]">
                            <pre className="flex-1 p-8 sm:p-12 font-mono text-xs sm:text-sm leading-relaxed overflow-auto custom-scrollbar text-emerald-500/90 whitespace-pre selection:bg-primary/20">
                               <code>{code}</code>
                            </pre>
                            
                            {explanation && (
                              <div className="p-8 border-t border-white/5 bg-secondary/30 relative overflow-hidden group/exp">
                                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/exp:opacity-10 transition-opacity">
                                    <Braces className="w-12 h-12 text-primary" />
                                 </div>
                                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Protocol Explanation</p>
                                 <p className="text-[13px] text-white/60 leading-relaxed font-medium relative z-10">{explanation}</p>
                              </div>
                            )}
                         </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-8 py-40 grayscale pointer-events-none">
                         <Terminal className="w-24 h-24 text-primary" />
                         <p className="text-xl font-headline font-black uppercase tracking-[0.4em]">Your code will show here</p>
                      </div>
                    )}
                 </div>

                 {code && (
                    <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col gap-8 shrink-0">
                       {/* Improve Feature Section */}
                       <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                          <Label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Improve Protocol</Label>
                          <div className="flex gap-3">
                             <Input 
                               value={improveInput}
                               onChange={e => setImproveInput(e.target.value)}
                               placeholder="e.g. make it shorter, add comments, fix errors..."
                               className="h-14 bg-secondary/50 border-border rounded-2xl text-xs font-bold px-6 focus:ring-primary/40"
                               onKeyDown={e => e.key === 'Enter' && handleGenerate(true)}
                             />
                             <Button 
                              onClick={() => handleGenerate(true)} 
                              disabled={isProcessing || !improveInput.trim()}
                              className="h-14 px-8 bg-primary text-white font-black text-[10px] uppercase rounded-2xl shadow-xl shadow-primary/30"
                             >
                               {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                               Improve
                             </Button>
                          </div>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                             {['shorter', 'add comments', 'handle errors', 'make responsive'].map(s => (
                               <button 
                                key={s} 
                                onClick={() => setImproveInput(s)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black uppercase text-white/30 hover:text-primary transition-all whitespace-nowrap"
                               >
                                 {s}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
                          <Button onClick={() => handleCopy(code, 'all')} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                             {isCopied === 'all' ? <CheckCircle2 className="w-6 h-6 mr-1" /> : <Copy className="w-6 h-6 mr-1" />} Copy Full Logic
                          </Button>
                          <div className="flex gap-3">
                             <Button variant="outline" onClick={handleDownloadCode} className="h-16 px-8 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                                <FileDown className="w-5 h-5" />
                             </Button>
                             <Button variant="outline" onClick={() => handleGenerate()} className="h-16 px-10 border-white/10 bg-white/5 text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary/10 transition-all">
                                <RefreshCcw className="w-5 h-5 mr-2" /> Re-Forge
                             </Button>
                          </div>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest leading-none">Privacy Safe</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed font-medium uppercase">
                    All code requests are processed locally in your browser memory via secure server nodes. Hardware identifiers are never logged.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest leading-none">Hybrid Intelligence</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed font-medium uppercase">
                    Utilizing high-performance Gemini and Llama 3 models for architectural precision and clinical data translation.
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
