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
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SpeechToTextPage() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Web Speech API is not supported in this browser. Please use a modern browser like Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please enable permissions in your browser settings.");
      } else {
        setError(`System error: ${event.error}. Please check your hardware.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast({ title: "Recording Stopped", description: "Linguistic stream preserved." });
    } else {
      setError(null);
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        try {
          recognitionRef.current.start();
          setIsListening(true);
          toast({ title: "Recording Active", description: "Studio is listening for voice matrix." });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Transcript saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setTranscript('');
    toast({ title: "Studio Reset", description: "Transcript buffer cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Mic className="w-3.5 h-3.5" /> Media Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Speech to <span className="text-primary italic">Text Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional real-time voice transcription. Convert microphone audio streams into editable text matrices instantly with high-fidelity linguistic identification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Volume2 className="w-6 h-6" />
                </div>
                Signal Logic
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* Language Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic Pattern</Label>
                <Select value={language} onValueChange={setLanguage} disabled={isListening}>
                  <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl text-foreground font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="en-US" className="text-xs font-bold uppercase">English (United States)</SelectItem>
                    <SelectItem value="ur-PK" className="text-xs font-bold uppercase">Urdu (Pakistan)</SelectItem>
                    <SelectItem value="en-GB" className="text-xs font-bold uppercase">English (British)</SelectItem>
                    <SelectItem value="es-ES" className="text-xs font-bold uppercase">Spanish (Standard)</SelectItem>
                    <SelectItem value="fr-FR" className="text-xs font-bold uppercase">French (Standard)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed flex items-center gap-2">
                   <Globe className="w-3 h-3" /> Note: Supported languages depend on your browser engine.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="relative group/signal">
                <div className={cn(
                  "h-48 rounded-[2.5rem] border-2 flex flex-col items-center justify-center transition-all duration-700",
                  isListening ? "border-primary bg-primary/5 shadow-[0_0_50px_-12px_rgba(37,99,235,0.3)] animate-pulse" : "border-dashed border-border bg-secondary/30",
                  error && "border-destructive bg-destructive/5"
                )}>
                   {isListening ? (
                     <>
                        <div className="relative mb-6">
                           <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                           <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl relative z-10">
                              <Mic className="w-8 h-8" />
                           </div>
                        </div>
                        <p className="text-[11px] font-black uppercase text-primary tracking-[0.3em] animate-pulse">Matrix Decoding Active</p>
                     </>
                   ) : error ? (
                     <>
                        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center px-10">{error}</p>
                     </>
                   ) : (
                     <>
                        <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 mb-6 group-hover/signal:text-primary group-hover/signal:scale-110 transition-all shadow-xl">
                          <MicOff className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest group-hover/signal:text-primary transition-colors">Awaiting Voice Trigger</p>
                     </>
                   )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={toggleListening}
                  className={cn(
                    "flex-1 h-16 font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl transition-all active:scale-95 group/btn",
                    isListening ? "bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30"
                  )}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-6 h-6" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      Start Studio
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  disabled={isListening || !transcript}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Studio Advisory</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                This tool utilizes the Web Speech API protocol. For peak accuracy, ensure you are in a low-noise environment. Works best on Google Chrome and newer Chromium-based browsers.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Decoded Matrix
                </CardTitle>
                {transcript && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    {transcript.split(/\s+/).length} Words Identified
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              <div className="flex-1 relative group/output">
                <Textarea 
                  readOnly
                  value={transcript}
                  placeholder="Studio transcription will appear here in real-time..."
                  className="w-full h-full min-h-[450px] bg-white dark:bg-black/20 border-border text-foreground font-body rounded-[2.5rem] p-10 text-xl leading-relaxed resize-none shadow-inner custom-scrollbar transition-all overflow-auto"
                />
                {!transcript && !isListening && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Languages className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Linguistic Stream</p>
                  </div>
                )}
                {isListening && !transcript && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none animate-pulse">
                     <Loader2 className="w-16 h-16 text-primary mb-4 animate-spin" />
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Listening for data...</p>
                   </div>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <Button 
                  onClick={handleCopy}
                  disabled={!transcript}
                  className={cn(
                    "flex-1 h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                    transcript ? "text-primary border-primary/20" : "opacity-50"
                  )}
                >
                  {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                  {isCopied ? 'Matrix Copied' : 'Copy Transcript'}
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</p>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">Linguistic stream decoded locally. Your voice never leaves your session.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                    <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Instant Matrix</p>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">Hard-coded synchronization for zero-latency visual feedback.</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
