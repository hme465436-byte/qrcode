
"use client"

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Clock, 
  Mic, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Type,
  AlignLeft,
  Hash,
  MoveRight,
  Maximize,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function WordCounterPage() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Linguistic Matrix Calculations
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
    const lines = text ? text.split('\n').length : 0;

    // Reading & Speaking Estimates
    // Standard: Reading ~200 wpm, Speaking ~130 wpm
    const readTimeSec = Math.round((words / 200) * 60);
    const speakTimeSec = Math.round((words / 130) * 60);

    const formatTime = (totalSec: number) => {
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      if (min === 0 && sec === 0) return '0s';
      if (min === 0) return `${sec}s`;
      return `${min}m ${sec}s`;
    };

    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      lines,
      readingTime: formatTime(readTimeSec),
      speakingTime: formatTime(speakTimeSec)
    };
  }, [text]);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({ title: "Content Copied", description: "Text matrix saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setText('');
    toast({ title: "Studio Reset", description: "All linguistic data cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Type className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Word <span className="text-primary italic">Counter Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional linguistic analysis matrix. Calculate density, character volume, and precise reading/speaking time estimates entirely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Editor Pane */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <AlignLeft className="w-6 h-6" />
                </div>
                Source Content
              </CardTitle>
              <div className="flex items-center gap-2">
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClear}
                  className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                  title="Reset Workspace"
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-10">
              <div className="relative group/input">
                <Textarea 
                  placeholder="Paste or type your draft here for real-time analysis..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[500px] bg-secondary/30 border-border text-lg rounded-[2.5rem] focus:ring-primary/40 p-10 text-foreground leading-relaxed resize-none transition-all focus:bg-secondary/50"
                />
                {!text && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <FileText className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Input</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-8">
                <Button 
                  onClick={handleCopy}
                  disabled={!text}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  {isCopied ? 'Matrix Copied' : 'Copy Content'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  disabled={!text}
                  className="flex-1 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                  title="Clear Workspace"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group-hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our analysis engine operates entirely within your browser session. Your text data is never uploaded or transmitted to any server.
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                <Zap className="w-4 h-4 fill-primary/20" /> Analysis Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Primary Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Words', value: stats.words, icon: FileText },
                  { label: 'Chars', value: stats.chars, icon: Hash },
                  { label: 'Sentences', value: stats.sentences, icon: MoveRight },
                  { label: 'Paragraphs', value: stats.paragraphs, icon: Maximize },
                ].map((stat) => (
                  <div key={stat.label} className="p-6 rounded-[2rem] bg-secondary border border-border group/stat hover:border-primary/40 transition-all text-center space-y-2">
                    <stat.icon className="w-5 h-5 text-primary/30 group-hover/stat:text-primary mx-auto transition-colors" />
                    <p className="text-2xl font-headline font-black text-foreground">{stat.value.toLocaleString()}</p>
                    <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Extended Details */}
              <div className="space-y-4 pt-4 border-t border-border">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Characters (No Spaces)</span>
                    <span className="text-sm font-mono font-bold text-foreground">{stats.charsNoSpaces.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Total Lines</span>
                    <span className="text-sm font-mono font-bold text-foreground">{stats.lines.toLocaleString()}</span>
                 </div>
              </div>

              {/* Time Estimates */}
              <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-8 relative overflow-hidden group/time shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover/time:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                      <Clock className="w-6 h-6" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Estimated Read Time</h4>
                      <p className="text-2xl font-headline font-black text-primary">{stats.readingTime}</p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                      <Mic className="w-6 h-6" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Estimated Speaking</h4>
                      <p className="text-2xl font-headline font-black text-primary">{stats.speakingTime}</p>
                   </div>
                </div>

                <p className="text-[9px] text-foreground/40 text-center leading-relaxed font-medium pt-2 border-t border-primary/10">
                  Calculated using standard 200 WPM reading and 130 WPM speaking protocols.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                 <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Protocol</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      Linguistic matrix rounding applied to nearest integer for presentation consistency.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
