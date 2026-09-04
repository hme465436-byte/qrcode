"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Settings2, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Languages, 
  History, 
  Clock, 
  Download, 
  SlidersHorizontal,
  ChevronRight,
  User,
  Music,
  Maximize2,
  Globe,
  Smartphone,
  Save,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

export default function TextToSpeechPage() {
  const { toast } = useToast();
  
  // Audio State
  const [text, setText] = useState('Hello. Welcome to the professional Text to Speech Studio. Enter your payload here to initialize synthesis.');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  
  // Status State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // --- Synthesis Initialization ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Auto-select priority voice
      if (availableVoices.length > 0 && !selectedVoiceName) {
        const preferred = availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || availableVoices[0];
        setSelectedVoiceName(preferred.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Load Archive
    const saved = localStorage.getItem('mykit_tts_archive_v1');
    if (saved) try { setHistory(JSON.parse(saved)); } catch(e) {}

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoiceName]);

  const speak = () => {
    if (!text.trim() || !isSupported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voice = voices.find(v => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      
      // Save to history on successful completion
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        text: text.trim().substring(0, 500),
        timestamp: Date.now()
      };
      setHistory(prev => {
        const filtered = prev.filter(h => h.text !== newItem.text);
        const next = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem('mykit_tts_archive_v1', JSON.stringify(next));
        return next;
      });
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      toast({ variant: "destructive", title: "Synthesis Error", description: "Hardware stream interrupted." });
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({ title: "Payload Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setText('');
    handleStop();
    toast({ title: "Studio Reset" });
  };

  const currentVoice = useMemo(() => 
    voices.find(v => v.name === selectedVoiceName), 
  [voices, selectedVoiceName]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Volume2 className="w-3.5 h-3.5" /> Acoustic Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            Text to <span className="text-primary italic">Speech Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional linguistic synthesis engine. Convert textual matrices into natural-sounding audio streams locally in your browser with absolute zero-storage privacy.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="text-to-speech" />
        </div>
      </div>

      {!isSupported ? (
        <Card className="glass-card border-destructive/20 bg-destructive/5 p-12 text-center flex flex-col items-center gap-6 rounded-[3rem]">
           <AlertCircle className="w-16 h-16 text-destructive animate-pulse" />
           <div className="space-y-2">
              <h3 className="text-xl font-headline font-black text-foreground uppercase">Hardware Protocol Error</h3>
              <p className="text-sm text-foreground/40 font-bold uppercase max-w-sm">The SpeechSynthesis matrix is not identified in this hardware context. Use Chrome or Edge for 1:1 fidelity.</p>
           </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Input & Controls */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
             <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                         <Type className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Linguistic Input</CardTitle>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-foreground/20 font-bold uppercase">{text.length} Chars</span>
                      <button onClick={handleClear} className="p-2 text-foreground/10 hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                   </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                   <Textarea 
                    value={text}
                    onChange={e => setText(e.target.value.substring(0, 5000))}
                    placeholder="Enter textual payload..."
                    className="min-h-[300px] bg-secondary/30 border-border rounded-[2rem] p-8 text-lg font-medium leading-relaxed resize-none focus:ring-primary/20"
                   />
                   
                   <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
                      <Button 
                        onClick={isSpeaking ? handleStop : speak}
                        className={cn(
                          "h-16 flex-1 w-full sm:w-auto font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all active:scale-95",
                          isSpeaking ? "bg-destructive text-white shadow-destructive/20" : "bg-primary text-white shadow-primary/30"
                        )}
                      >
                         {isSpeaking ? <Square className="w-6 h-6 mr-3 fill-current" /> : <Play className="w-6 h-6 mr-3 fill-current" />}
                         {isSpeaking ? 'Stop Synthesis' : 'Execute Speak'}
                      </Button>
                      
                      {isSpeaking && (
                        <Button 
                          onClick={handlePause} 
                          variant="outline" 
                          className="h-16 w-full sm:w-auto px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] rounded-2xl"
                        >
                           {isPaused ? <Play className="w-5 h-5 mr-3" /> : <Pause className="w-5 h-5 mr-3" />}
                           {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                      )}

                      {!isSpeaking && text && (
                        <Button onClick={handleCopy} variant="outline" className="h-16 px-8 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[9px] rounded-2xl">
                           {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />} Copy
                        </Button>
                      )}
                   </div>
                </CardContent>
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                   <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                     <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                       All synthesis occurs 100% locally. Textual identifiers are processed in volatile memory and never touch remote servers.
                     </p>
                   </div>
                </div>
                <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                   <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Hardware Native</h4>
                     <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                       Utilizing the SpeechSynthesisUtterance matrix for 1:1 hardware synchronization across all OS-level voices.
                     </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Sidebar - Controls & History */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
             <Card className="glass-card border-border shadow-xl">
                <CardHeader className="py-6 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                      <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-10">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Vocal Identity (Voice)</Label>
                      <Select value={selectedVoiceName} onValueChange={setSelectedVoiceName} disabled={isSpeaking}>
                         <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                            <SelectValue placeholder="Select Hardware Node" />
                         </SelectTrigger>
                         <SelectContent className="glass-card max-h-[300px]">
                            {voices.map(v => (
                              <SelectItem key={v.name} value={v.name} className="text-[10px] font-black uppercase">
                                 {v.name} ({v.lang})
                              </SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                      {currentVoice && (
                         <div className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                            <Globe className="w-3 h-3 text-primary/40" />
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">{currentVoice.lang} Protocol Detected</span>
                         </div>
                      )}
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                            <Label className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Rate Velocity</Label>
                            <span className="text-primary font-mono">{rate}x</span>
                         </div>
                         <Slider value={[rate * 100]} min={50} max={200} step={1} onValueChange={v => setRate(v[0] / 100)} />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                            <Label className="flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Pitch Matrix</Label>
                            <span className="text-primary font-mono">{pitch}</span>
                         </div>
                         <Slider value={[pitch * 100]} min={50} max={200} step={1} onValueChange={v => setPitch(v[0] / 100)} />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                            <Label className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /> Gain Volume</Label>
                            <span className="text-primary font-mono">{Math.round(volume * 100)}%</span>
                         </div>
                         <Slider value={[volume * 100]} min={0} max={100} step={1} onValueChange={v => setVolume(v[0] / 100)} />
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* History Registry */}
             <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
                <CardHeader className="py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0 px-6">
                   <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-primary" />
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground">Archive Registry</CardTitle>
                   </div>
                   {history.length > 0 && (
                      <button onClick={() => { setHistory([]); localStorage.removeItem('mykit_tts_archive_v1'); }} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge</button>
                   )}
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                   {history.length === 0 ? (
                      <div className="py-20 text-center opacity-10 space-y-2">
                         <FileText className="w-10 h-10 mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix History</p>
                      </div>
                   ) : (
                      <div className="divide-y divide-white/5">
                         {history.map(item => (
                           <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setText(item.text)}>
                              <div className="min-w-0 flex-1">
                                 <p className="text-sm font-medium text-foreground/60 truncate uppercase italic">"{item.text}"</p>
                                 <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
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
      )}

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
