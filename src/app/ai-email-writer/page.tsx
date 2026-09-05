
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
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
  User,
  ShieldCheck,
  Edit3,
  ChevronRight,
  Sparkles,
  AlignLeft,
  ArrowRight,
  Check
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

const HISTORY_KEY = 'mykit_email_writer_history_v1';

interface EmailHistory {
  id: string;
  subject: string;
  body: string;
  timestamp: number;
  purpose: string;
}

export default function AiEmailWriterPage() {
  const { toast } = useToast();
  
  // Input State
  const [purpose, setPurpose] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Professional');
  const [extra, setExtra] = useState('');
  
  // Results State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveToHistory = (s: string, b: string, p: string) => {
    const next = [{
      id: Math.random().toString(36).substr(2, 9),
      subject: s,
      body: b,
      purpose: p,
      timestamp: Date.now()
    }, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const handleGenerate = async () => {
    if (!purpose.trim() || !recipient.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Purpose and Recipient are required." });
      return;
    }

    setIsProcessing(true);
    setSubject('');
    setBody('');

    try {
      const response = await fetch('/api/ai-email-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, recipient, tone, extra })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubject(data.subject);
        setBody(data.body);
        saveToHistory(data.subject, data.body, purpose);
        toast({ title: "Synthesis Complete", description: "Email draft is ready." });
      } else {
        throw new Error(data.message || "Service unavailable. Try again.");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
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

  const handleRestore = (item: EmailHistory) => {
    setSubject(item.subject);
    setBody(item.body);
    setPurpose(item.purpose);
    toast({ title: "Draft Restored" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Mail className="w-3.5 h-3.5" /> Linguistic Suite Pro
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            AI Email <span className="text-primary italic">Writer</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Write clean, professional emails in seconds. High-fidelity linguistic synthesis with custom tone protocols and hardware-native privacy.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="ai-email" />
           <Button variant="outline" size="sm" onClick={() => { setPurpose(''); setRecipient(''); setExtra(''); setSubject(''); setBody(''); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Settings Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Email Details
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Purpose of writing</Label>
                       <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Resignation, Meeting Request, Follow up" className="h-12 bg-secondary/50 border-border rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Recipient</Label>
                       <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="e.g. Hiring Manager, Client, Team" className="h-12 bg-secondary/50 border-border rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Tone Profile</Label>
                       <Select value={tone} onValueChange={setTone}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {['Professional', 'Friendly', 'Simple', 'Short'].map(t => (
                               <SelectItem key={t} value={t} className="text-[10px] font-black uppercase">{t}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase ml-1">Extra Points (Optional)</Label>
                       <Textarea value={extra} onChange={e => setExtra(e.target.value)} placeholder="Specific details or names to include..." className="h-24 bg-secondary/30 border-border rounded-2xl text-xs resize-none p-4" />
                    </div>
                 </div>

                 <Button 
                   onClick={handleGenerate} 
                   disabled={isProcessing}
                   className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Create Email
                 </Button>
              </CardContent>
           </Card>

           {/* History Module */}
           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[300px]">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground">Saved Emails</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black/10">
                 {history.length === 0 ? (
                    <div className="py-12 text-center opacity-10 space-y-2">
                       <Activity className="w-8 h-8 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No history</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map(item => (
                         <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => handleRestore(item)}>
                            <div className="min-w-0 flex-1">
                               <p className="text-xs font-bold text-foreground truncate uppercase">{item.purpose}</p>
                               <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
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
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Email Preview</CardTitle>
                 </div>
                 {subject && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">READY</Badge>}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                 <div className="flex-1 relative group/output flex flex-col min-h-[400px]">
                    {isProcessing ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-40 gap-8">
                         <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <Mail className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                          </div>
                         <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Synthesizing draft...</p>
                      </div>
                    ) : subject ? (
                      <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                         {/* Subject Section */}
                         <div className="p-6 bg-secondary/20 border-b border-white/5 flex items-center gap-4 shrink-0">
                            <Label className="text-[9px] font-black text-primary uppercase tracking-widest w-16">Subject:</Label>
                            <Input 
                              value={subject} 
                              onChange={e => setSubject(e.target.value)}
                              className="bg-transparent border-none p-0 h-auto font-bold text-sm focus-visible:ring-0"
                            />
                            <button onClick={() => handleCopy(subject, 'sub')} className="text-foreground/10 hover:text-primary transition-all">
                               {isCopied === 'sub' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                         </div>
                         {/* Body Section */}
                         <textarea 
                          value={body}
                          onChange={e => setBody(e.target.value)}
                          className="flex-1 p-10 bg-transparent text-foreground font-medium text-base leading-relaxed resize-none focus:outline-none custom-scrollbar whitespace-pre-wrap"
                         />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-6 py-40 grayscale pointer-events-none">
                         <Mail className="w-24 h-24 text-primary" />
                         <p className="text-sm font-black uppercase tracking-[0.3em]">Your email will show here</p>
                      </div>
                    )}
                 </div>

                 {subject && (
                    <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                       <Button onClick={() => handleCopy(`${subject}\n\n${body}`, 'all')} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                          {isCopied === 'all' ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />} Copy full email
                       </Button>
                       <Button variant="outline" onClick={handleGenerate} className="h-16 px-8 border-white/10 bg-white/5 text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10">
                          <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
                       </Button>
                    </div>
                 )}
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
