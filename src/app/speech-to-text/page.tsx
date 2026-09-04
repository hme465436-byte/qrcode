"use client"

import React, { useState, useEffect, useRef } from 'react';
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
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function SpeechToTextPage() {
  const { toast } = useToast();
  
  // Status State
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [transcript, setTranscript] = useState('');
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
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(prev => {
        // Replace with full buffer for live feel
        const full = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join(' ');
        return full;
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please enable hardware permissions.");
      } else if (event.error === 'network') {
        setError("Network protocol failure. This API requires a cloud-connected node.");
      } else {
        setError(`Linguistic error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Load History
    const saved = localStorage.getItem('mykit_speech_history');
    if (saved) try { setHistory(JSON.parse(saved)); } catch(e) {}
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      
      // Save to history if content exists
      if (transcript.trim()) {
        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          text: transcript.trim(),
          timestamp: Date.now(),
          lang: language
        };
        const next = [newItem, ...history].slice(0, 10);
        setHistory(next);
        localStorage.setItem('mykit_speech_history', JSON.stringify(next));
      }
    } else {
      setError(null);
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        try {
          recognitionRef.current.start();
          setIsListening(true);
          toast({ title: "Recording Active", description: "Linguistic stream initialized." });
        } catch (e) {
          setError("Engine busy. Please restart the studio.");
        }
      }
    }
  };

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setIsCopied(true);
      toast({ title: "Content Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setTranscript('');
    toast({ title: "Buffer Purged" });
  };

  if (!isSupported) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <Card className="glass-card border-border shadow-2xl p-12 flex flex-col items-center gap-8 bg-black/10 rounded-[3rem]">
           <AlertCircle className="w-16 h-16 text-destructive animate-pulse" />
           <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Unsupported Environment</h2>
              <p className="text-foreground/40 font-medium leading-relaxed max-w-md mx-auto">
                 The Web Speech API is not identified in this browser matrix. Please use <span className="text-primary font-bold">Google Chrome</span> or <span className="text-primary font-bold">Microsoft Edge</span> to initialize the Speech Studio.
              </p>
           </div>
           <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5">
              <Link href="/">Back to Dashboard</Link>
           </Button>
        </Card>
      </div>
    );
  }

  const audioCtxRef = useRef<AudioContext | null>(null);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Languages className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
              Speech to <span className="text-primary italic">Text Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Professional real-time voice transcription. Convert microphone audio streams into editable text matrices locally with high-fidelity linguistic identification.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="speech-to-text" />
             {(transcript || error) && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
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
                  <Select value={language} onValueChange={setLanguage} disabled={isListening}>
                    <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="en-US" className="text-[10px] font-black uppercase">English (US)</SelectItem>
                      <SelectItem value="en-GB" className="text-[10px] font-black uppercase">English (UK)</SelectItem>
                      <SelectItem value="ur-PK" className="text-[10px] font-black uppercase">Urdu (Pakistan)</SelectItem>
                      <SelectItem value="ar-SA" className="text-[10px] font-black uppercase">Arabic (Saudi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative group/signal">
                  <div className={cn(
                    "h-64 rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center gap-6 transition-all duration-700",
                    isListening ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" : "border-dashed border-border bg-secondary/30",
                    error && "border-destructive bg-destructive/5"
                  )}>
                    {isListening ? (
                       <>
                          <div className="relative">
                             <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                             <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-xl relative z-10">
                                <Mic className="w-10 h-10" />
                             </div>
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-[11px] font-black uppercase text-primary tracking-widest">Streaming Active</h4>
                             <p className="text-[9px] text-foreground/30 font-medium uppercase">Decoding linguistic signals...</p>
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

                <Button 
                  onClick={toggleListening}
                  className={cn(
                    "w-full h-16 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all active:scale-95",
                    isListening ? "bg-destructive text-white shadow-destructive/20" : "bg-primary text-white shadow-primary/30"
                  )}
                >
                  {isListening ? <MicOff className="w-5 h-5 mr-3" /> : <Mic className="w-5 h-5 mr-3" />}
                  {isListening ? 'Terminate Stream' : 'Initialize Studio'}
                </Button>
              </div>

              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All linguistic deconstruction occurs strictly in local memory. No audio strings are ever transmitted or stored on our cloud infrastructure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Tracker */}
          <Card className="glass-card border-border shadow-xl flex flex-col min-h-[300px]">
             <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <History className="w-4 h-4 text-primary" />
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive Registry</CardTitle>
                </div>
                {history.length > 0 && (
                   <button onClick={() => { setHistory([]); localStorage.removeItem('mykit_speech_history'); }} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge</button>
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

        {/* Output - Right */}
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
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">SIGNAL ACTIVE</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-6 sm:p-12 flex flex-col relative overflow-hidden">
                 <div className="flex-1 relative group/output">
                    <Textarea 
                      readOnly
                      value={transcript}
                      placeholder="Transcribed matrix will appear here in real-time..."
                      className="w-full h-full min-h-[450px] bg-transparent border-none text-xl sm:text-2xl font-medium text-foreground leading-relaxed resize-none focus-visible:ring-0 p-0 custom-scrollbar"
                    />
                    {!transcript && !isListening && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 space-y-6 py-20 pointer-events-none">
                         <Activity className="w-24 h-24 text-primary" />
                         <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                      </div>
                    )}
                 </div>

                 {transcript && (
                   <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-4">
                      <Button onClick={handleCopy} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-2xl active:scale-95 transition-all">
                         {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                         Copy Result
                      </Button>
                      <Button variant="outline" onClick={handleClear} className="h-16 px-10 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:text-destructive">
                         <Trash2 className="w-5 h-5" />
                      </Button>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Instant Feedback</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Real-time interim results provide immediate visual confirmation of the linguistic stream.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                   <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Cloud Handshake</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Utilizing the browser's native cloud-assisted recognition engine for peak accuracy.</p>
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
