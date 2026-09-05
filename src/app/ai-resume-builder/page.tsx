"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  Languages,
  BookOpen,
  Code2,
  Target,
  ArrowRight,
  History,
  FileDown,
  X,
  Plus,
  Check,
  Smartphone,
  Layout,
  Star,
  ChevronRight,
  Save,
  PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const PERSIST_HISTORY_KEY = 'mykit_ai_resume_history_v2';

interface ResumeArchive {
  id: string;
  name: string;
  date: number;
  content: string;
  formData: any;
}

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
    projects: '',
    languages: '',
    target: ''
  });

  // Options State
  const [tone, setTone] = useState<'Professional' | 'Simple' | 'Strong'>('Professional');
  const [length, setLength] = useState<'One-page' | 'Detailed'>('Detailed');

  // Results & History State
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState<ResumeArchive[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    const saved = localStorage.getItem(PERSIST_HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          if (parsed.length > 0) {
            setResult(parsed[0].content);
            setFormData(parsed[0].formData);
          }
        }
      } catch (e) {}
    }
  }, []);

  const saveToArchive = (content: string) => {
    const newEntry: ResumeArchive = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || 'Untitled',
      date: Date.now(),
      content,
      formData: { ...formData }
    };
    const nextHistory = [newEntry, ...history.filter(h => h.name !== newEntry.name || h.content !== content)].slice(0, 10);
    setHistory(nextHistory);
    localStorage.setItem(PERSIST_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const handleRestore = (item: ResumeArchive) => {
    setResult(item.content);
    setFormData(item.formData);
    toast({ title: "Draft Restored", description: "Identity sync complete." });
  };

  const handleDelete = (id: string) => {
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    localStorage.setItem(PERSIST_HISTORY_KEY, JSON.stringify(next));
    setItemToDelete(null);
    toast({ title: "Entry Removed" });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const executeSynthesis = async () => {
    if (!formData.name || !formData.email || !formData.experience) {
      toast({ variant: "destructive", title: "Missing Details", description: "Name, Email, and Experience are required." });
      return;
    }

    setIsProcessing(true);
    setResult('');

    try {
      const response = await fetch('/api/ai-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: formData,
          options: { tone, length }
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.text);
        saveToArchive(data.text);
        toast({ title: "Complete", description: "Resume created successfully." });
      } else {
        throw new Error(data.message || "Service unavailable. Try again later.");
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: err.message || "Service unavailable." 
      });
    } finally {
      setIsProcessing(false);
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
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                body { font-family: 'Inter', sans-serif; line-height: 1.5; padding: 50px; color: #1a1a1a; max-width: 800px; margin: 0 auto; white-space: pre-wrap; font-size: 11pt; }
                h1, h2, h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; text-transform: uppercase; letter-spacing: 1px; }
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
    toast({ title: "Saved" });
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', title: '', skills: '', experience: '', education: '', projects: '', languages: '', target: '' });
    setResult('');
    toast({ title: "Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <FileText className="w-3.5 h-3.5" /> Career Studio Pro
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black text-foreground uppercase tracking-tight leading-none overflow-wrap-anywhere">
            AI Resume <span className="text-primary italic">Builder</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="ai-resume" />
           <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Form & History */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Resume Details
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Full Name</Label>
                          <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="e.g. John Doe" className="h-11 bg-secondary/50 border-border rounded-xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Job Title</Label>
                          <Input value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="e.g. Senior Architect" className="h-11 bg-secondary/50 border-border rounded-xl font-bold" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Email</Label>
                          <Input value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="user@identity.io" className="h-11 bg-secondary/50 border-border rounded-xl text-xs" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Phone</Label>
                          <Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="+1 234..." className="h-11 bg-secondary/50 border-border rounded-xl text-xs" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Experience</Label>
                       <Textarea value={formData.experience} onChange={e => handleInputChange('experience', e.target.value)} placeholder="Detailed work history, achievements, and impact..." className="h-32 bg-secondary/30 border-border rounded-2xl text-xs resize-none p-4" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Skills</Label>
                          <Textarea value={formData.skills} onChange={e => handleInputChange('skills', e.target.value)} placeholder="React, Python..." className="h-24 bg-secondary/30 border-border rounded-2xl text-[10px] resize-none p-4" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Education</Label>
                          <Textarea value={formData.education} onChange={e => handleInputChange('education', e.target.value)} placeholder="Degree, Uni..." className="h-24 bg-secondary/30 border-border rounded-2xl text-[10px] resize-none p-4" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Projects</Label>
                          <Textarea value={formData.projects} onChange={e => handleInputChange('projects', e.target.value)} placeholder="Key accomplishments..." className="h-20 bg-secondary/30 border-border rounded-2xl text-[10px] resize-none p-4" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Languages</Label>
                          <Textarea value={formData.languages} onChange={e => handleInputChange('languages', e.target.value)} placeholder="English, Urdu..." className="h-20 bg-secondary/30 border-border rounded-2xl text-[10px] resize-none p-4" />
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Options</Label>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[8px] font-bold text-foreground/20 uppercase">Tone</Label>
                             <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                                <SelectTrigger className="h-10 bg-secondary/50 border-border text-[9px] font-black uppercase">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                   <SelectItem value="Professional" className="text-[9px] uppercase">Professional</SelectItem>
                                   <SelectItem value="Simple" className="text-[9px] uppercase">Simple</SelectItem>
                                   <SelectItem value="Strong" className="text-[9px] uppercase">Strong</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[8px] font-bold text-foreground/20 uppercase">Length</Label>
                             <Select value={length} onValueChange={(v: any) => setLength(v)}>
                                <SelectTrigger className="h-10 bg-secondary/50 border-border text-[9px] font-black uppercase">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                   <SelectItem value="One-page" className="text-[9px] uppercase">One Page</SelectItem>
                                   <SelectItem value="Detailed" className="text-[9px] uppercase">Detailed</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                       </div>
                    </div>
                 </div>

                 <Button 
                   onClick={executeSynthesis} 
                   disabled={isProcessing}
                   className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Create Resume
                 </Button>
              </CardContent>
           </Card>

           {/* History Module */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px] overflow-hidden">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground">Saved Resumes</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black/10">
                 {history.length === 0 ? (
                    <div className="py-20 text-center opacity-10 space-y-2">
                       <Activity className="w-10 h-10 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No history</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map(item => (
                         <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => handleRestore(item)}>
                            <div className="min-w-0 flex-1">
                               <p className="text-sm font-bold text-foreground truncate uppercase">{item.name}</p>
                               <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                               <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }} className="p-2 text-foreground/10 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                               <ChevronRight className="w-4 h-4 text-foreground/10" />
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Preview & Editor */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[800px] bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Resume Preview</CardTitle>
                 </div>
                 {result && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">READY</Badge>
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
                         <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Creating resume...</p>
                      </div>
                    ) : result ? (
                      <div className="h-full flex flex-col animate-in fade-in duration-500">
                         <div className="p-4 bg-secondary/20 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4 px-2">
                               <PenTool className="w-3.5 h-3.5 text-primary/40" />
                               <span className="text-[9px] font-black uppercase text-foreground/40">Edit Resume</span>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => handleDownload('print')} className="h-8 px-4 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Print</button>
                            </div>
                         </div>
                         <textarea 
                          value={result}
                          onChange={e => setResult(e.target.value)}
                          spellCheck={false}
                          className="flex-1 p-8 sm:p-16 bg-white dark:bg-black/20 text-foreground font-mono text-sm leading-relaxed resize-none focus:ring-0 border-none custom-scrollbar"
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
                          <Button onClick={() => { navigator.clipboard.writeText(result); toast({ title: "Copied" }); }} className="h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                             <Copy className="w-5 h-5 mr-1" /> Copy text
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
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Executive Format</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Our synthesis logic follows 2024 hiring standards, prioritizing achievement-based metrics and high-entropy professional descriptors.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <Trash2 className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Delete Draft</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
               This will definitively purge this identity record from your local archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl">Purge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
