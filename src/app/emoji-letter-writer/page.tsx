"use client"

import React, { useState, useMemo } from 'react';
import { 
  Smile, 
  Type, 
  Copy, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Maximize,
  Settings2,
  WholeWord,
  Grid3X3,
  AlignLeft,
  ArrowDownCircle,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// 5x5 Matrix Map for A-Z and 0-9
const CHAR_MAP: Record<string, number[][]> = {
  'A': [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'B': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0]],
  'C': [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
  'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'E': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
  'F': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'G': [[0,1,1,1,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[0,1,1,1,1]],
  'H': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'I': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  'J': [[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'K': [[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
  'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'P': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,0],[0,1,1,0,1]],
  'R': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,0,1]],
  'S': [[0,1,1,1,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'V': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
  'Y': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z': [[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  '0': [[0,1,1,1,0],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[0,1,1,1,0]],
  '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,1,1,0],[0,1,0,0,0],[1,1,1,1,1]],
  '3': [[1,1,1,1,1],[0,0,0,1,0],[0,1,1,1,0],[0,0,0,1,0],[1,1,1,1,1]],
  '4': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1]],
  '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,1]],
  '6': [[0,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
  '8': [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  '9': [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
};

export default function EmojiLetterWriterPage() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [emojis, setEmojis] = useState('💝');
  const [gap, setGap] = useState(1);
  const [density, setDensity] = useState(1); // 1 = Normal, 2 = Compact
  const [isCopied, setIsCopied] = useState(false);

  // Core Generation Logic
  const output = useMemo(() => {
    if (!text.trim()) return '';

    const emojiArray = Array.from(emojis).filter(e => e.trim().length > 0);
    if (emojiArray.length === 0) return '';

    const lines = text.toUpperCase().split('\n');
    let finalResult = '';
    let emojiCounter = 0;

    lines.forEach((line, lineIdx) => {
      // Each letter is 5 rows high
      for (let row = 0; line && row < 5; row++) {
        let rowStr = '';
        for (let col = 0; col < line.length; col++) {
          const char = line[col];
          const pattern = CHAR_MAP[char] || CHAR_MAP[' '];
          
          for (let pCol = 0; pCol < 5; pCol++) {
            if (pattern[row][pCol] === 1) {
              rowStr += emojiArray[emojiCounter % emojiArray.length];
              emojiCounter++;
            } else {
              rowStr += density === 2 ? '　' : '⬜'; // Full-width space or block for better alignment
            }
          }
          // Gap between letters
          rowStr += ' '.repeat(gap);
        }
        finalResult += rowStr + '\n';
      }
      finalResult += '\n'; // Extra line between user lines
    });

    return finalResult;
  }, [text, emojis, gap, density]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Matrix Copied", description: "Emoji art saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setText('');
    setEmojis('💝');
    toast({ title: "Studio Reset", description: "Memory cleared." });
  };

  const insertSample = () => {
    setText('HAPPY BIRTHDAY');
    setEmojis('🎂🎈🎁');
    toast({ title: "Sample Production", description: "Celebration protocol injected." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Smile className="w-3.5 h-3.5" /> Creative Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Emoji <span className="text-primary italic">Letter Writer</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Transform your messages into massive emoji-constructed block art. Cycle multiple symbols and adjust matrix density for high-impact social sharing.
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
                  <WholeWord className="w-6 h-6" />
                </div>
                Configuration Studio
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              {/* Text Input */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic Payload</Label>
                <Input 
                  placeholder="Enter text (A-Z, 0-9)..."
                  value={text}
                  onChange={(e) => setText(e.target.value.substring(0, 50))}
                  className="h-14 bg-secondary border-border rounded-2xl text-foreground font-headline font-bold text-lg"
                />
                <div className="flex justify-between items-center px-1">
                   <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed flex items-center gap-2">
                    <Info className="w-3 h-3" /> Supports alphanumeric characters only.
                  </p>
                  <span className="text-[9px] font-mono text-primary/60">{text.length}/50</span>
                </div>
              </div>

              {/* Emoji Input */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Artistic Symbols (1-3 Emojis)</Label>
                <div className="relative group/emojis">
                  <Input 
                    placeholder="Paste emojis e.g. 💝 🔥 ✨"
                    value={emojis}
                    onChange={(e) => setEmojis(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-center text-xl tracking-[0.5em]"
                  />
                  <Smile className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/10 group-focus-within/emojis:text-primary transition-colors" />
                </div>
                <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest text-center">
                  Symbols will cycle automatically within the letter matrix.
                </p>
              </div>

              {/* Advanced Matrix Settings */}
              <div className="space-y-10 pt-4 border-t border-border">
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <Label className="flex items-center gap-2"><Grid3X3 className="w-3 h-3" /> Letter Gap</Label>
                    <span className="text-primary font-mono">{gap} Units</span>
                  </div>
                  <Slider value={[gap]} min={0} max={5} step={1} onValueChange={(v) => setGap(v[0])} />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Matrix Density Mode</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDensity(1)}
                      className={cn(
                        "h-12 rounded-xl border flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                        density === 1 ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40 hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" /> Standard
                    </button>
                    <button
                      onClick={() => setDensity(2)}
                      className={cn(
                        "h-12 rounded-xl border flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                        density === 2 ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40 hover:text-foreground"
                      )}
                    >
                      <Maximize className="w-4 h-4" /> Compact
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  onClick={insertSample}
                  variant="outline"
                  className="w-full h-14 bg-secondary border-border text-primary font-black uppercase tracking-widest text-[10px] hover:bg-secondary/80 rounded-2xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Inject Sample Production
                </Button>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handleCopy}
                    disabled={!output}
                    className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                  >
                    {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                    Copy Matrix
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                  >
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group-hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Advisory</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our studio utilizes a 5x5 hardware-inspired font matrix. For best results on mobile apps, use the "Compact" density to prevent line wrapping.
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
                  <AlignLeft className="w-3.5 h-3.5" /> Studio Master Output
                </CardTitle>
                {output && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                    {output.split('\n').length} Blocks Rendered
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              <div className="flex-1 relative group/output rounded-[2rem] bg-white dark:bg-black/20 border border-border overflow-hidden">
                <textarea 
                  readOnly
                  value={output}
                  placeholder="Your emoji matrix will appear here..."
                  className="w-full h-full p-10 font-mono text-xs leading-[1.1] resize-none focus:outline-none bg-transparent text-foreground custom-scrollbar"
                />
                {!output && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Smile className="w-24 h-24 text-primary mb-6" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Linguistic Input</p>
                  </div>
                )}
              </div>

              {output && (
                <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                         <ArrowDownCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Copy Standard</p>
                            <p className="text-[10px] text-foreground/40 font-medium">Matrix is formatted as standard UTF-8 emojis for universal compatibility.</p>
                         </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                         <Maximize className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Visual Scale</p>
                            <p className="text-[10px] text-foreground/40 font-medium">Large-scale block characters ideal for headers and banners.</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
