"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  Copy, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Languages,
  AlertCircle,
  Globe,
  ShieldCheck,
  Zap,
  Volume2,
  Activity,
  History,
  ChevronRight,
  RotateCcw,
  Settings2,
  Type,
  Pause,
  Play,
  Square,
  Undo2,
  Download,
  FileText,
  Save,
  Clock,
  User,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  lang: string;
}

const LANGUAGES = [
  { id: 'en-US', label: 'English (United States)' },
  { id: 'en-GB', label: 'English (United Kingdom)' },
  { id: 'ur-PK', label: 'Urdu (Pakistan)' },
  { id: 'hi-IN', label: 'Hindi (India)' },
  { id: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
];

export default function SpeechToTextPage() {
  const { toast } = useToast();
  
  // Status Matrix
  const [status, setStatus] = useState<'idle' | 'listening' | 'paused' | 'stopped'>('idle');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  
  // Data Matrix
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // UI State
  const [isCopied, setIsCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Protocol
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
          // Capture confidence of the final piece
          setConfidence(Math.round(event.results[i][0].confidence * 100));
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      if (finalStr) {
        setTranscript(prev => prev + (prev ? ' ' : '') + finalStr);
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return; // Ignore silent pauses
      
      if (event.error === 'not-allowed') {
        setError("Linguistic Access Denied: Enable microphone permissions.");
        setStatus('idle');
      } else {
        setError(`Node Error: ${event.error.toUpperCase()}`);
        setStatus('idle');
      }
    };

    recognition.onend = () => {
      // Auto-restart protocol if we're supposed to be listening
      if (status === 'listening') {
        try {
          recognitionRef.current?.start();
        } catch (e) {
          setStatus('stopped');
        }
      }
    };

    // Load Archive
    const saved = localStorage.getItem('mykit_speech_archive_pro');
    if (saved) try { setHistory(JSON.parse(saved)); } catch(e) {}

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [status]);

  const startStudio = () => {
    if (!recognitionRef.current) return;
    setError(null);
    setConfidence(null);
    recognitionRef.current.lang = language;
    try {
      recognitionRef.current.start();
      setStatus('listening');
      toast({ title: "Studio Active", description: "Linguistic stream initialized." });
    } catch (e) {
      setError("Engine Busy: Protocol already active.");
    }
  };

  const pauseStudio = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus('paused');
      setInterimTranscript('');
      toast({ title: "Session Paused" });
    }
  };

  const resumeStudio = () => {
    startStudio();
  };

  const stopStudio = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus('stopped');
      setInterimTranscript('');
      
      if (transcript.trim()) {
        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          text: transcript.trim(),
          timestamp: Date.now(),
          lang: language
        };
        const next = [newItem, ...history].slice(0, 15);
        setHistory(next);
        localStorage.setItem('mykit_speech_archive_pro', JSON.stringify(next));
        toast({ title: "Matrix Archived", description: "Transcription saved to registry." });
      }
    }
  };

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setIsCopied(true);
      toast({ title: "Identity Isolated", description: "Content saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Master Exported" });
  };

  const purgeLastLine = () => {
    const lines = transcript.split('. ');
    if (lines.length > 1) {
      setTranscript(lines.slice(0, -1).join('. ') + '.');
    } else {
      setTranscript('');
    }
    toast({ title: "Buffer Reverted" });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mykit_speech_archive_pro');
    toast({ title: "Registry Purged" });
  };

  if (!isSupported) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <Card className="glass-card border-border shadow-2xl p-12 flex flex-col items-center gap-8 bg-black/10 rounded-[3rem]">
           <AlertCircle className="w-16 h-16 text-destructive animate-pulse" />
           <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Unsupported Matrix</h2>
              <p className="text-foreground/40 font-medium leading-relaxed max-w-md mx-auto uppercase tracking-tighter">
                 The Web Speech protocol is not identified in this hardware context. Use <span className="text-primary font-bold">Chrome</span> or <span className="text-primary font-bold">Edge</span> for high-fidelity extraction.
              </p>
           </div>
           <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5">
              <Link href="/">Back to Studio</Link>
           </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Languages className="w-3.5 h-3.5" /> Intelligence Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Speech to <span className="text-primary italic">Text Studio Pro</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced real-time voice transcription. Convert multi-node audio streams into professional text matrices with session history and local privacy logic.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="speech-to-text" />
           {(transcript || error) && (
             <Button variant="outline" size="sm" onClick={() => { setTranscript(''); setInterimTranscript(''); setConfidence(null); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Profile (Language)</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={status === 'listening'}>
                    <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                       {LANGUAGES.map(l => (
                         <SelectItem key={l.id} value={l.id} className="text-[10px] font-black uppercase">{l.label}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative group/signal">
                  <div className={cn(
                    "h-64 rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center gap-8 transition-all duration-700 relative overflow-hidden",
                    status === 'listening' ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" : "border-dashed border-border bg-secondary/30",
                    status === 'paused' && "border-amber-500/40 bg-amber-500/5",
                    error && "border-destructive bg-destructive/5"
                  )}>
                    {status === 'listening' ? (
                       <>
                          <div className="relative">
                             <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                             <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-xl relative z-10">
                                <Mic className="w-10 h-10" />
                             </div>
                          </div>
                          <div className="space-y-1 z-10">
                             <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Streaming Active</h4>
                             <p className="text-[9px] text-foreground/30 font-medium uppercase">Decoding linguistic signals...</p>
                          </div>
                          {/* Intensity Wave Decoration */}
                          <div className="absolute bottom-0 inset-x-0 h-12 flex items-end justify-center gap-1 opacity-20">
                             {Array.from({ length: 12 }).map((_, i) => (
                               <div key={i} className="w-1 bg-primary rounded-t-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                             ))}
                          </div>
                       </>
                    ) : status === 'paused' ? (
                        <>
                          <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl">
                             <Pause className="w-8 h-8 fill-current" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-[11px] font-black uppercase text-amber-600 tracking-widest">Protocol Paused</h4>
                             <p className="text-[9px] text-foreground/30 font-medium uppercase">Buffer held in memory</p>
                          </div>
                        </>
                    ) : error ? (
                       <>
                          <AlertCircle className="w-12 h-12 text-destructive animate-bounce" />
                          <div className="space-y-2 px-8">
                             <h4 className="text-[11px] font-black uppercase text-destructive">Hardware Block</h4>
                             <p className="text-[9px] text-foreground/40 font-bold uppercase leading-relaxed">{error}</p>
                          </div>
                       </>
                    ) : (
                       <>
                          <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/signal:text-primary group-hover/signal:scale-110 transition-all shadow-xl">
                             <MicOff className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-[11px] font-black uppercase text-foreground/40">Ready to listen</h4>
                             <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-tighter">Initialize handshake to start</p>
                          </div>
                       </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                   <div className="flex gap-3">
                      {status === 'listening' ? (
                        <Button 
                          onClick={pauseStudio} 
                          className="h-16 flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                        >
                          <Pause className="w-5 h-5 mr-3 fill-current" /> Pause
                        </Button>
                      ) : status === 'paused' ? (
                        <Button 
                          onClick={resumeStudio} 
                          className="h-16 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <Play className="w-5 h-5 mr-3 fill-current" /> Resume
                        </Button>
                      ) : (
                        <Button 
                          onClick={startStudio} 
                          className="h-16 flex-1 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                        >
                          <Mic className="w-5 h-5 mr-3" /> Initialize Studio
                        </Button>
                      )}
                      
                      {(status === 'listening' || status === 'paused') && (
                        <Button 
                          onClick={stopStudio} 
                          variant="outline"
                          className="h-16 w-16 rounded-2xl border-border bg-background text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Square className="w-5 h-5 fill-current" />
                        </Button>
                      )}
                   </div>
                </div>
              </div>

              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Linguistic deconstruction occurs 100% in local volatile memory. No audio waveforms or text strings are ever stored on remote studio servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Column - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Type className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Output</CardTitle>
                 </div>
                 {transcript && (
                    <div className="flex gap-2">
                       {confidence && (
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-3 py-1">
                            Accuracy: {confidence}%
                         </Badge>
                       )}
                       <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-3 py-1">SIGNAL ACTIVE</Badge>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col relative overflow-hidden">
                 <div className="flex-1 relative group/output">
                    <div className="w-full h-full min-h-[450px] p-0 custom-scrollbar overflow-y-auto">
                       {transcript ? (
                         <div className="text-xl sm:text-2xl font-medium text-foreground leading-relaxed">
                            <span className="select-text">{transcript}</span>
                            {interimTranscript && (
                              <span className="text-primary/40 italic ml-2 select-none">{interimTranscript}</span>
                            )}
                         </div>
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6 py-20 pointer-events-none">
                            <Activity className="w-24 h-24 text-primary" />
                            <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {transcript && (
                   <div className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-bottom-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         <Button onClick={handleCopy} className="h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-3 text-xs shadow-2xl active:scale-95 transition-all col-span-2">
                            {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            Copy Master
                         </Button>
                         <Button variant="outline" onClick={handleDownload} className="h-14 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[9px] rounded-2xl">
                            <FileText className="w-4 h-4 mr-2" /> TXT
                         </Button>
                         <Button variant="outline" onClick={purgeLastLine} className="h-14 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[9px] rounded-2xl hover:text-primary">
                            <Undo2 className="w-4 h-4 mr-2" /> Undo
                         </Button>
                      </div>
                      
                      <div className="flex items-center justify-between px-2">
                         <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.4em]">Hardware-Native Matrix Synthesis</p>
                         <div className="flex items-center gap-3 text-primary/40">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{transcript.split(' ').length} Words Isolated</span>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* History Module */}
           <Card className="glass-card border-border shadow-xl flex flex-col min-h-[350px]">
              <CardHeader className="py-6 border-b border-white/5 bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive Registry</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={clearHistory} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Clear All</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-20 text-center opacity-10 space-y-4">
                       <Activity className="w-10 h-10 mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix History</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map(item => (
                         <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setTranscript(item.text)}>
                            <div className="flex items-center gap-4 overflow-hidden">
                               <div className="w-10 h-10 rounded-xl bg-secondary border border-white/5 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors shrink-0 shadow-inner font-mono text-[9px] font-bold">
                                  {item.lang.split('-')[0].toUpperCase()}
                               </div>
                               <div className="min-w-0">
                                  <p className="text-sm font-bold text-foreground truncate uppercase">{item.text}</p>
                                  <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString()}</p>
                               </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
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
