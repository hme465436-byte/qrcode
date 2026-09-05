"use client"

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Send, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Printer, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Settings2,
  Info,
  Undo2,
  List,
  Type,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const PERSIST_KEY = 'mykit_ai_resume_last';

export default function AIResumeBuilderPage() {
  const { toast } = useToast();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    skills: '',
    experience: '',
    education: '',
    target: ''
  });

  // Results State
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(PERSIST_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'string') setResult(parsed);
        else if (parsed.formData) {
          setFormData(parsed.formData);
          if (parsed.result) setResult(parsed.result);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (result || formData.name) {
      localStorage.setItem(PERSIST_KEY, JSON.stringify({ result, formData }));
    }
  }, [result, formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const executeSynthesis = async () => {
    if (!formData.name || !formData.email || !formData.experience) {
      toast({ variant: "destructive", title: "Incomplete Matrix", description: "Name, Email, and Experience are mandatory for synthesis." });
      return;
    }

    setIsProcessing(true);
    setResult('');

    try {
      const response = await fetch('/api/ai-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.text);
        toast({ title: "Synthesis Complete", description: "Professional resume isolated." });
      } else {
        throw new Error(data.message || "Node handshake failed.");
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Protocol Failure", 
        description: err.message || "Service unavailable. Try again later." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      toast({ title: "Identity Isolated", description: "Resume copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = (format: 'txt' | 'print') => {
    if (!result) return;
    
    if (format === 'print') {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Resume - ${formData.name}</title>
              <style>
                body { font-family: sans-serif; line-height: 1.6; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; white-space: pre-wrap; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>${result}</body>
          </html>
        `);
        win.document.close();
        win.print();
      }
      return;
    }

    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${formData.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Master Exported" });
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', title: '', skills: '', experience: '', education: '', target: '' });
    setResult('');
    localStorage.removeItem(PERSIST_KEY);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <FileText className="w-3.5 h-3.5" /> Identity Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            AI Resume <span className="text-primary italic">Builder</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional high-fidelity career synthesis. Generate clean, achievement-oriented resumes locally using advanced linguistic nodes.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="ai-resume" />
           {(result || formData.name) && (
             <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Career Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Full Name</Label>
                          <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="e.g. John Doe" className="h-12 bg-secondary/50 border-border rounded-xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Job Title</Label>
                          <Input value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="e.g. Senior Developer" className="h-12 bg-secondary/50 border-border rounded-xl font-bold" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Email Address</Label>
                          <Input value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="user@example.com" className="h-12 bg-secondary/50 border-border rounded-xl font-medium" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Phone Node</Label>
                          <Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="+1 234..." className="h-12 bg-secondary/50 border-border rounded-xl font-medium" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Professional Experience</Label>
                       <Textarea 
                        value={formData.experience} 
                        onChange={e => handleInputChange('experience', e.target.value)} 
                        placeholder="Detail your roles, achievements, and impact..." 
                        className="h-32 bg-secondary/30 border-border rounded-2xl text-xs font-medium resize-none p-4"
                       />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Skills Matrix</Label>
                          <Textarea value={formData.skills} onChange={e => handleInputChange('skills', e.target.value)} placeholder="React, Node, Project Lead..." className="h-24 bg-secondary/30 border-border rounded-2xl text-xs resize-none p-4" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Education Registry</Label>
                          <Textarea value={formData.education} onChange={e => handleInputChange('education', e.target.value)} placeholder="Degree, Institution, Year..." className="h-24 bg-secondary/30 border-border rounded-2xl text-xs resize-none p-4" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Target Goal (Optional)</Label>
                       <Input value={formData.target} onChange={e => handleInputChange('target', e.target.value)} placeholder="Specific job or industry target..." className="h-12 bg-secondary/50 border-border rounded-xl text-xs font-medium" />
                    </div>
                 </div>

                 <Button 
                   onClick={executeSynthesis} 
                   disabled={isProcessing}
                   className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Synthesize Identity
                 </Button>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Identity synthesis is executed via secure server action. Your personal data is processed in-flight and held strictly in local browser memory.
               </p>
             </div>
          </div>
        </div>

        {/* Right: Preview & Editor */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[700px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Output</CardTitle>
                 </div>
                 {result && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 animate-pulse">MASTER READY</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 relative group/output">
                    {isProcessing ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 gap-8">
                         <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                         </div>
                         <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Synthesizing Professional Matrix...</p>
                      </div>
                    ) : result ? (
                      <div className="h-full flex flex-col animate-in fade-in duration-500">
                         <Textarea 
                          value={result}
                          onChange={e => setResult(e.target.value)}
                          className="flex-1 p-8 sm:p-12 bg-white dark:bg-black/20 text-foreground font-mono text-xs sm:text-sm leading-relaxed resize-none focus:ring-0 border-none scrollbar-hide"
                         />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6 py-40 grayscale pointer-events-none">
                         <FileText className="w-24 h-24 text-primary" />
                         <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Identity Signal</p>
                      </div>
                    )}
                 </div>

                 {result && !isProcessing && (
                    <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                       <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button onClick={handleCopy} className="h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl active:scale-95">
                             {isCopied ? <CheckCircle2 className="w-5 h-5 mr-1" /> : <Copy className="w-5 h-5 mr-1" />} 
                             Copy text
                          </Button>
                          <Button onClick={() => handleDownload('print')} className="h-14 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl">
                             <Printer className="w-5 h-5 mr-1" /> Print / PDF
                          </Button>
                       </div>
                       <Button variant="outline" onClick={() => handleDownload('txt')} className="h-14 px-8 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] rounded-2xl">
                          .TXT
                       </Button>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <Type className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Integrity</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Using high-fidelity executive standard formatting for peak employer response.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">WASM Editor</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Edit results instantly in-studio before final production commitment.</p>
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
