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
  FileText,
  Type,
  ListFilter,
  Star,
  FileDown,
  Quote,
  Timer,
  AlertCircle,
  BookOpen,
  VolumeX,
  FastForward,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

const PRESETS = {
  normal: { rate: 1, pitch: 1, label: 'Normal' },
  fast: { rate: 1.5, pitch: 1, label: 'Rapid' },
  slow: { rate: 0.8, pitch: 0.9, label: 'Steady' },
  story: { rate: 0.9, pitch: 0.8, label: 'Narrative' },
  news: { rate: 1.1, pitch: 1.1, label: 'News' },
};

export default function TextToSpeechPage() {
  const { toast } = useToast();
  
  // Audio State
  const [text, setText] = useState('Hello. Welcome to the professional Text to Speech Studio. Enter your payload here to initialize synthesis.');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  
  // Highlighting & Progress
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);
  const [totalLength, setTotalLength] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter & Meta State
  const [langFilter, setLangFilter] = useState('all');
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
      
      // Persistence: Try to restore last used voice
      const savedVoice = localStorage.getItem('mykit_tts_last_voice');
      if (savedVoice && availableVoices.some(v => v.name === savedVoice)) {
        setSelectedVoiceName(savedVoice);
      } else if (availableVoices.length > 0 && !selectedVoiceName) {
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

  const currentVoice = useMemo(() => 
    voices.find(v => v.name === selectedVoiceName) || null, 
  [voices, selectedVoiceName]);

  const speak = () => {
    if (!text.trim() || !isSupported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (currentVoice) {
      utterance.voice = currentVoice;
      localStorage.setItem('mykit_tts_last_voice', currentVoice.name);
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    setTotalLength(text.length);
    setCurrentIndex(0);

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const start = event.charIndex;
        const length = event.charLength || text.slice(start).search(/\s/) || (text.length - start);
        setHighlightRange({ start, end: start + length });
        setCurrentIndex(start);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setHighlightRange(null);
      setCurrentIndex(totalLength);
      
      // Save to history on successful completion
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        text: text.trim().substring(0, 500),
        timestamp: Date.now()
      };
      setHistory(prev => {
        const filtered = prev.filter(h => h.text !== newItem.text);
        const next = [newItem, ...filtered].slice(0, 15);
        localStorage.setItem('mykit_tts_archive_v1', JSON.stringify(next));
        return next;
      });
    };

    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setIsSpeaking(false);
      setIsPaused(false);
      setHighlightRange(null);
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
    setHighlightRange(null);
  };

  const applyPreset = (p: keyof typeof PRESETS) => {
    const val = PRESETS[p];
    setRate(val.rate);
    setPitch(val.pitch);
    toast({ title: "Preset Applied", description: `${val.label} profile active.` });
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

  const handleDownloadTxt = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech_script_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Script Exported" });
  };

  const filteredVoices = useMemo(() => {
    if (langFilter === 'all') return voices;
    return voices.filter(v => v.lang.startsWith(langFilter));
  }, [voices, langFilter]);

  const availableLangs = useMemo(() => {
    const langs = new Set(voices.map(v => v.lang.split('-')[0]));
    return Array.from(langs).sort();
  }, [voices]);

  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);

  const renderHighlightedText = () => {
    if (!highlightRange || !text) return text;
    const { start, end } = highlightRange;
    return (
      <>
        {text.slice(0, start)}
        <mark className="bg-primary text-primary-foreground px-0.5 rounded shadow-lg transition-all duration-75">{text.slice(start, end)}</mark>
        {text.slice(end)}
      </>
    );
  };

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
            Professional linguistic synthesis engine. Convert textual matrices into natural-sounding audio streams locally with 1:1 textual fidelity and real-time word tracking.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="text-to-speech" />
           {text && (
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset Matrix
             </Button>
           )}
        </div>
      </div>

      {!isSupported ? (
        <Card className="glass-card border-destructive/20 bg-destructive/5 p-12 text-center flex flex-col items-center gap-6 rounded-[3rem]">
           <AlertCircle className="w-16 h-16 text-destructive animate-pulse" />
           <div className="space-y-2">
              <h3 className="text-xl font-headline font-black text-foreground uppercase">Hardware Protocol Error</h3>
              <p className="text-sm text-foreground/40 font-bold uppercase max-sm">The SpeechSynthesis matrix is not identified in this hardware context. Use Chrome or Edge for 1:1 fidelity.</p>
           </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Editor & Preview */}
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
             <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 px-6 sm:px-10 gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                         <Type className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Linguistic Input</CardTitle>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex bg-background/50 p-1 rounded-xl border border-white/5">
                        {Object.keys(PRESETS).map((p) => (
                          <button
                            key={p}
                            onClick={() => applyPreset(p as any)}
                            className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="h-6 w-[1px] bg-white/5" />
                      <span className="text-[9px] font-mono font-bold text-foreground/20 uppercase tracking-widest">{wordCount} Words</span>
                   </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                   <div className="flex-1 relative group/output">
                      <div className="absolute inset-0 p-8 sm:p-12 text-xl sm:text-2xl font-medium text-foreground/80 leading-relaxed pointer-events-none z-0 overflow-hidden whitespace-pre-wrap">
                        {isSpeaking ? renderHighlightedText() : ''}
                      </div>
                      <Textarea 
                        value={text}
                        onChange={e => { setText(e.target.value.substring(0, 5000)); setHighlightRange(null); }}
                        placeholder="Enter textual payload for synthesis..."
                        className={cn(
                          "w-full h-full min-h-[450px] p-8 sm:p-12 bg-transparent text-xl sm:text-2xl font-medium leading-relaxed resize-none focus:ring-0 border-none transition-all",
                          isSpeaking ? "opacity-0" : "opacity-100"
                        )}
                      />
                      {!text && !isSpeaking && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 space-y-4 pointer-events-none">
                           <BookOpen className="w-16 h-16 text-primary" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Signal</p>
                        </div>
                      )}
                   </div>

                   {isSpeaking && (
                     <div className="px-10 py-4 bg-primary/[0.03] border-t border-white/5 animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.4em] text-primary mb-2">
                           <span className="flex items-center gap-2"><Activity className="w-3 h-3 animate-pulse" /> Signal Active</span>
                           <span>{Math.round((currentIndex / totalLength) * 100)}%</span>
                        </div>
                        <Progress value={(currentIndex / totalLength) * 100} className="h-1 rounded-full" />
                     </div>
                   )}

                   <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                      <div className="flex-1 w-full flex gap-3">
                         <Button 
                           onClick={isSpeaking ? (isPaused ? handlePause : handlePause) : speak}
                           className={cn(
                             "h-16 flex-1 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95",
                             isSpeaking ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" : "bg-primary text-white shadow-primary/30"
                           )}
                         >
                            {isSpeaking ? (isPaused ? <Play className="w-5 h-5 mr-3 fill-current" /> : <Pause className="w-5 h-5 mr-3 fill-current" />) : <PlayCircle className="w-6 h-6 mr-3" />}
                            {isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Execute Speak'}
                         </Button>
                         {isSpeaking && (
                           <Button onClick={handleStop} variant="outline" className="h-16 w-16 rounded-2xl border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white">
                              <Square className="w-5 h-5 fill-current" />
                           </Button>
                         )}
                      </div>
                      <div className="flex gap-2">
                         <Button onClick={handleCopy} variant="outline" className="h-12 px-6 rounded-xl border-white/5 bg-white/5 text-white/40 font-black uppercase text-[9px]">
                            {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />} Copy
                         </Button>
                         <Button variant="outline" onClick={handleDownloadTxt} className="h-12 px-6 rounded-xl border-white/5 bg-white/5 text-white/40 font-black uppercase text-[9px]">
                            <FileDown className="w-4 h-4 mr-2" /> TXT
                         </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Sidebar - Controls & History */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
             <Card className="glass-card border-border shadow-xl overflow-visible">
                <CardHeader className="py-6 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                      <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-10">
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Linguistic Node (Voice)</Label>
                            <Select value={langFilter} onValueChange={setLangFilter}>
                               <SelectTrigger className="h-8 w-24 bg-background border-border text-[8px] font-black uppercase rounded-lg">
                                  <ListFilter className="w-3 h-3 mr-1.5" /> <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="glass-card">
                                  <SelectItem value="all" className="text-[9px] uppercase">All Langs</SelectItem>
                                  {availableLangs.map(l => <SelectItem key={l} value={l} className="text-[9px] uppercase">{l.toUpperCase()}</SelectItem>)}
                               </SelectContent>
                            </Select>
                         </div>
                         <Select value={selectedVoiceName} onValueChange={setSelectedVoiceName} disabled={isSpeaking}>
                            <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                               <SelectValue placeholder="Select Hardware Node" />
                            </SelectTrigger>
                            <SelectContent className="glass-card max-h-[400px] w-[280px]">
                               {filteredVoices.map(v => (
                                 <SelectItem key={v.name} value={v.name} className="text-[10px] font-black uppercase py-3 border-b border-white/5 last:border-0">
                                    <div className="flex flex-col gap-0.5">
                                       <span>{v.name}</span>
                                       <span className="text-[8px] opacity-40">{v.lang} {v.default ? '• System Default' : ''}</span>
                                    </div>
                                 </SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                         {currentVoice && (
                            <div className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 animate-in zoom-in">
                               <Globe className="w-3.5 h-3.5 text-primary/40" />
                               <span className="text-[8px] font-black text-primary uppercase tracking-widest">{currentVoice.lang} Protocol Verified</span>
                            </div>
                         )}
                      </div>

                      <div className="space-y-10 pt-4 border-t border-white/5">
                         {[
                           { label: 'Rate Velocity', key: 'rate', icon: Activity, val: rate, min: 0.5, max: 2, step: 0.1 },
                           { label: 'Pitch Matrix', key: 'pitch', icon: RotateCcw, val: pitch, min: 0.5, max: 2, step: 0.1 },
                           { label: 'Gain Volume', key: 'volume', icon: volume > 0 ? Volume2 : VolumeX, val: Math.round(volume * 100), min: 0, max: 100, step: 1, suffix: '%' }
                         ].map((s) => (
                           <div key={s.key} className="space-y-4">
                              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                                 <Label className="flex items-center gap-2"><s.icon className="w-3.5 h-3.5" /> {s.label}</Label>
                                 <span className="text-primary font-mono">{s.val}{s.suffix}</span>
                              </div>
                              <Slider 
                                value={[s.key === 'volume' ? volume * 100 : (s.val as number) * 100]} 
                                min={s.min * 100} 
                                max={s.max * 100} 
                                step={s.step * 100} 
                                onValueChange={v => {
                                  const newVal = v[0] / 100;
                                  if (s.key === 'rate') setRate(newVal);
                                  if (s.key === 'pitch') setPitch(newVal);
                                  if (s.key === 'volume') setVolume(newVal);
                                }} 
                              />
                           </div>
                         ))}
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* History Registry */}
             <Card className="glass-card border-border shadow-xl flex flex-col max-h-[400px]">
                <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex items-center justify-between shrink-0 px-6">
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
        mark { color: white !important; }
      `}</style>
    </div>
  );
}
