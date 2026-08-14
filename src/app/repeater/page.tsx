"use client"

import React, { useState } from 'react';
import { 
  Type, 
  Repeat, 
  Copy, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Split,
  CornerDownLeft,
  Space
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TextRepeaterPage() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [separator, setSeparator] = useState('');
  const [times, setTimes] = useState(5);
  const [outputText, setOutputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const wordCount = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
  const charCount = inputText.length;

  const handleRepeat = () => {
    if (!inputText) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please enter some text or an emoji to repeat." });
      return;
    }

    const count = Math.max(1, times);
    
    try {
      const repeated = new Array(count).fill(inputText).join(separator);
      setOutputText(repeated);
    } catch (e) {
      toast({ 
        variant: "destructive", 
        title: "Repetition Error", 
        description: "The requested volume exceeds browser memory limits. Please try a smaller number." 
      });
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Repeated content saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSeparator('');
    setTimes(5);
    setOutputText('');
    toast({ title: "Cleared", description: "All fields have been reset." });
  };

  const volumePresets = [5, 10, 50, 100, 500, 1000];

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Repeat className="w-3.5 h-3.5" /> Efficiency Tool
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Text & <span className="text-primary italic">Emoji Repeater</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Instantly multiply text or emojis for social media, testing, or creative design. Professional formatting with custom separators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Input Controls */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden">
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner">
                  <Type className="w-6 h-6" />
                </div>
                Configure Input
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source Content</Label>
                  <div className="flex items-center gap-3 px-3 py-1 rounded-lg bg-secondary border border-border text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    <span>Words: {wordCount}</span>
                    <span className="opacity-20">|</span>
                    <span>Characters: {charCount}</span>
                  </div>
                </div>
                <Textarea 
                  placeholder="Enter text or paste emojis here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[140px] bg-secondary border-border text-lg rounded-3xl focus:ring-primary/40 p-6 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Separator Settings</Label>
                  <Input 
                    placeholder="Enter custom separator..."
                    value={separator === '\n' ? '↵ [New Line]' : separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-foreground"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSeparator(' ')}
                      className={cn(
                        "h-9 flex-1 text-[9px] font-black uppercase tracking-widest rounded-xl border-border",
                        separator === ' ' ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground/40 hover:text-primary"
                      )}
                    >
                      <Space className="w-3.5 h-3.5 mr-1.5" /> Space
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSeparator('\n')}
                      className={cn(
                        "h-9 flex-1 text-[9px] font-black uppercase tracking-widest rounded-xl border-border",
                        separator === '\n' ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground/40 hover:text-primary"
                      )}
                    >
                      <CornerDownLeft className="w-3.5 h-3.5 mr-1.5" /> New Line
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Repeat Count</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={times}
                    onChange={(e) => setTimes(parseInt(e.target.value) || 0)}
                    className="h-14 bg-secondary border-border rounded-2xl text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Volume Presets</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {volumePresets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setTimes(p)}
                      className={cn(
                        "h-10 rounded-xl border flex items-center justify-center text-[10px] font-black tracking-widest transition-all",
                        times === p ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40 hover:text-primary"
                      )}
                    >
                      {p}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleRepeat}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Repeat Text
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Generated Output
                </CardTitle>
                {outputText && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-mono text-primary font-black uppercase tracking-widest shadow-sm">
                    {outputText.length.toLocaleString()} Chars
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output">
                <Textarea 
                  readOnly
                  value={outputText}
                  placeholder="Result will appear here..."
                  className="min-h-[300px] bg-white dark:bg-black/20 border-border text-foreground rounded-[2.5rem] p-8 text-lg leading-relaxed resize-none shadow-inner custom-scrollbar transition-all"
                />
                {!outputText && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Repeat className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleCopy}
                disabled={!outputText}
                className={cn(
                  "w-full h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                  outputText ? "text-primary border-primary/20" : "opacity-50"
                )}
              >
                {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                {isCopied ? 'Copied to Clipboard' : 'Copy All Text'}
              </Button>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4 group-hover:bg-primary/10 transition-colors">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Unlimited Production</p>
                  <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                    Optimized for Emojis, Cyrillic, Asian scripts, and professional formatting symbols. No artificial volume caps applied.
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
