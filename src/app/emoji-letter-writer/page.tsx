"use client"

import React, { useState, useMemo } from 'react';
import { 
  Smile, 
  Copy, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Settings2,
  WholeWord,
  LayoutGrid,
  AlignLeft,
  ChevronRight,
  Maximize2,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Refined 5x5 Matrix Map for high-legibility block art
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
  'J': [[0,0,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
  'K': [[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
  'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'P': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
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
  '3': [[1,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  '4': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1]],
  '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  '6': [[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
  '8': [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  '9': [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
};

export default function EmojiLetterWriterPage() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [emojis, setEmojis] = useState('💝');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isCopied, setIsCopied] = useState(false);

  // Correctly split emojis handling surrogate pairs (e.g. multi-color/gender emojis)
  const emojiList = useMemo(() => {
    return Array.from(emojis).filter(e => e.trim().length > 0 && e !== ' ');
  }, [emojis]);

  // Synthesis Logic
  const output = useMemo(() => {
    if (!text.trim() || emojiList.length === 0) return '';

    const lines = text.toUpperCase().split('\n');
    let finalResult = '';
    let emojiCounter = 0;

    // Spacer characters
    const offChar = '　'; // Ideographic Space for perfect mobile grid alignment
    const gapWidth = size === 'sm' ? 1 : size === 'md' ? 2 : 3;

    lines.forEach((line) => {
      // Each block character is 5 rows high
      for (let row = 0; row < 5; row++) {
        let rowStr = '';
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const pattern = CHAR_MAP[char] || CHAR_MAP[' '];
          
          for (let pCol = 0; pCol < 5; pCol++) {
            if (pattern[row][pCol] === 1) {
              rowStr += emojiList[emojiCounter % emojiList.length];
              emojiCounter++;
            } else {
              rowStr += offChar;
            }
          }
          // Horizontal gap between characters
          rowStr += ' '.repeat(gapWidth);
        }
        finalResult += rowStr + '\n';
      }
      finalResult += '\n'; // Double spacing between word lines
    });

    return finalResult;
  }, [text, emojiList, size]);

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
    toast({ title: "Studio Reset", description: "Memory buffer cleared." });
  };

  const setSample = (val: string, emo: string) => {
    setText(val);
    setEmojis(emo);
    toast({ title: "Sample Production", description: "Template injected into matrix." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Smile className="w-3.5 h-3.5" /> Creative Studio
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Emoji <span className="text-primary italic">Letter Writer</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional block-art synthesis. Transform linguistic strings into massive emoji matrices optimized for mobile sharing and social impact.
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
                Matrix Protocol
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic Payload</Label>
                <Input 
                  placeholder="Enter A-Z or 0-9..."
                  value={text}
                  onChange={(e) => setText(e.target.value.substring(0, 30))}
                  className="h-14 bg-secondary border-border rounded-2xl text-foreground font-headline font-bold text-lg focus:ring-primary/40"
                />
                <div className="flex justify-between items-center px-1">
                   <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Type className="w-3 h-3" /> Alphanumeric Only
                  </p>
                  <span className="text-[9px] font-mono text-primary/60">{text.length}/30</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Symbol Matrix (1-3 Emojis)</Label>
                <div className="relative group/emojis">
                  <Input 
                    placeholder="Paste emojis e.g. 🔥 ✨"
                    value={emojis}
                    onChange={(e) => setEmojis(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-center text-xl tracking-[0.5em] focus:ring-primary/40"
                  />
                  <Smile className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/10 group-focus-within/emojis:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Size Matrix</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'sm', label: 'Compact' },
                    { id: 'md', label: 'Standard' },
                    { id: 'lg', label: 'Spaced' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSize(s.id as any)}
                      className={cn(
                        "h-12 rounded-xl border flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all",
                        size === s.id ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Studio Templates</Label>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setSample('HAPPY', '🎂🎉')} className="h-10 rounded-xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-secondary transition-all">Happy Birthday</button>
                   <button onClick={() => setSample('LOVE', '❤️✨')} className="h-10 rounded-xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-secondary transition-all">Love You</button>
                   <button onClick={() => setSample('HELLO', '👋🌈')} className="h-10 rounded-xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-secondary transition-all">Hello Matrix</button>
                   <button onClick={() => setSample('MY KIT', '🛠️💎')} className="h-10 rounded-xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-secondary transition-all">Studio Signature</button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleCopy}
                  disabled={!output}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
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
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Alignment Intel</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our studio utilizes the Ideographic Space protocol (U+3000) for "off" pixels. This ensures the grid remains 1:1 on iOS and Android devices where standard spaces often collapse.
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
                    {output.split('\n').filter(l => l.trim()).length} Rows Rendered
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              <div className="flex-1 relative group/output rounded-[2rem] bg-white dark:bg-black/20 border border-border overflow-hidden shadow-inner">
                <textarea 
                  readOnly
                  value={output}
                  placeholder="Artistic matrix will appear here..."
                  className="w-full h-full p-10 font-mono text-xs leading-[1.0] resize-none focus:outline-none bg-transparent text-foreground custom-scrollbar overflow-auto whitespace-pre"
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
                         <LayoutGrid className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Grid Stability</p>
                            <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Fitted with full-width character buffers for cross-platform visual consistency.</p>
                         </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                         <Maximize2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">High Impact</p>
                            <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Optimized for headers, banners, and personalized message art.</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <Settings2 className="w-4 h-4 text-primary" />
                      <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Production Mode: {emojiList.length > 1 ? 'Cyclical' : 'Uniform'} Synthesis Active</p>
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
