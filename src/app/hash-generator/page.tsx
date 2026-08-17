"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Fingerprint, 
  Hash, 
  Upload, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap,
  Activity,
  FileDigit,
  Maximize2,
  Settings2,
  RefreshCcw,
  Shield,
  Search,
  Lock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Local MD5 Implementation ---
const md5 = (string: string) => {
  function k(n: number) { return Math.sin(n) * Math.pow(2, 32); }
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const x = [], s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const t = [];
  for (let i = 0; i < 64; i++) t[i] = k(i + 1) | 0;
  const g = (n: number) => ((n << 0) >>> 0).toString(16).padStart(8, '0');
  
  // Simplified implementation for browser-side hashing
  const utf8 = unescape(encodeURIComponent(string));
  const l = utf8.length;
  const words: number[] = [];
  for (let i = 0; i < l; i++) words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((i % 4) * 8);
  words[l >> 2] |= 0x80 << ((l % 4) * 8);
  words[(((l + 8) >> 6) << 4) + 14] = l * 8;

  const rotate = (n: number, s: number) => (n << s) | (n >>> (32 - s));

  for (let j = 0; j < words.length; j += 16) {
    let aa = a, bb = b, cc = c, dd = d;
    for (let i = 0; i < 64; i++) {
      let f, g_idx;
      if (i < 16) { f = (b & c) | (~b & d); g_idx = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g_idx = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g_idx = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g_idx = (7 * i) % 16; }
      const temp = d;
      d = c; c = b;
      b = (b + rotate(a + f + t[i] + (words[j + g_idx] || 0), s[i])) | 0;
      a = temp;
    }
    a = (a + aa) | 0; b = (b + bb) | 0; c = (c + cc) | 0; d = (d + dd) | 0;
  }
  
  const swap = (n: number) => {
    let res = "";
    for (let i = 0; i < 4; i++) res += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    return res;
  };
  return swap(a) + swap(b) + swap(c) + swap(d);
};

// --- Page Component ---
export default function HashGeneratorPage() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [isUppercase, setIsUppercase] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAlgos, setSelectedAlgos] = useState<Set<string>>(new Set(['md5', 'sha-256']));
  const [outputs, setOutput] = useState<Record<string, string>>({});

  const algos = [
    { id: 'md5', label: 'MD5', bits: 128 },
    { id: 'sha-1', label: 'SHA-1', bits: 160 },
    { id: 'sha-256', label: 'SHA-256', bits: 256 },
    { id: 'sha-384', label: 'SHA-384', bits: 384 },
    { id: 'sha-512', label: 'SHA-512', bits: 512 },
  ];

  const bufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const generateHashes = useCallback(async (data: string | ArrayBuffer) => {
    const results: Record<string, string> = {};
    const encoder = new TextEncoder();
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;

    for (const algo of selectedAlgos) {
      if (algo === 'md5') {
        results[algo] = typeof data === 'string' ? md5(data) : 'N/A (Text Only)';
      } else {
        try {
          const hashBuffer = await crypto.subtle.digest(algo.toUpperCase(), dataBuffer);
          results[algo] = bufferToHex(hashBuffer);
        } catch (e) {
          results[algo] = 'Algorithm Error';
        }
      }
    }
    setOutput(results);
  }, [selectedAlgos]);

  useEffect(() => {
    if (!inputText) {
      setOutput({});
      return;
    }
    generateHashes(inputText);
  }, [inputText, generateHashes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        await generateHashes(buffer);
        setIsProcessing(false);
        toast({ title: "File Hashed", description: `Binary matrix "${file.name}" analyzed.` });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const toggleAlgo = (id: string) => {
    const next = new Set(selectedAlgos);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAlgos(next);
  };

  const handleCopy = (text: string, label: string) => {
    const out = isUppercase ? text.toUpperCase() : text.toLowerCase();
    navigator.clipboard.writeText(out);
    toast({ title: "Hash Copied", description: `${label} saved to clipboard.` });
  };

  const handleCopyAll = () => {
    const all = Object.entries(outputs)
      .map(([id, val]) => `${id.toUpperCase()}: ${isUppercase ? val.toUpperCase() : val.toLowerCase()}`)
      .join('\n');
    navigator.clipboard.writeText(all);
    toast({ title: "All Hashes Copied", description: "Full matrix saved to clipboard." });
  };

  const handleClear = () => {
    setInputText('');
    setOutput({});
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Security Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                Hash <span className="text-primary italic">Generator</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade cryptographic hashing. Synthesize digital fingerprints for text strings or local files using standard MD5 and SHA protocols with 100% browser-side privacy.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Fingerprint className="w-6 h-6" />
                </div>
                Inbound Payload
              </CardTitle>
              <div className="flex items-center gap-3">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => document.getElementById('file-hash-input')?.click()}
                   className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-foreground/40 hover:text-primary text-[9px] font-black uppercase tracking-widest"
                 >
                   <Upload className="w-3.5 h-3.5 mr-2" /> Hash File
                 </Button>
                 <input id="file-hash-input" type="file" onChange={handleFileUpload} className="hidden" />
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Linguistic String</Label>
                <Textarea 
                  placeholder="Paste text matrix for real-time hashing..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[160px] bg-secondary border-border text-lg rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80 custom-scrollbar font-mono"
                />
              </div>

              <div className="space-y-6 pt-4 border-t border-border">
                 <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Algorithm Matrix</Label>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {algos.map((algo) => (
                      <div key={algo.id} className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer group",
                        selectedAlgos.has(algo.id) ? "bg-primary/10 border-primary/40" : "bg-background border-border hover:border-primary/20"
                      )} onClick={() => toggleAlgo(algo.id)}>
                        <Checkbox 
                          checked={selectedAlgos.has(algo.id)} 
                          onCheckedChange={() => toggleAlgo(algo.id)}
                          className="mb-3 border-primary/20"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{algo.label}</span>
                        <span className="text-[8px] font-bold text-foreground/20 mt-1">{algo.bits} BIT</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                 <div className="flex items-center gap-4 px-6 h-14 rounded-2xl bg-secondary/50 border border-border">
                    <span className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">Uppercase Output</span>
                    <Switch checked={isUppercase} onCheckedChange={setIsUppercase} />
                 </div>
                 <Button 
                   variant="outline" 
                   onClick={handleClear}
                   className="h-14 flex-1 rounded-2xl border-white/5 bg-white/5 text-foreground/40 hover:text-destructive text-[10px] font-black uppercase tracking-widest"
                 >
                   <Trash2 className="w-4 h-4 mr-2" /> Reset Workspace
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware-Native Security</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                All hashing logic is executed 100% in local memory using the Web Crypto API and optimized local buffers. Your data never touches a server, ensuring absolute cryptographic privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 fill-primary/20" /> Fingerprint Result
              </CardTitle>
              {Object.keys(outputs).length > 0 && (
                <button onClick={handleCopyAll} className="text-[9px] font-black uppercase text-primary hover:underline underline-offset-4 transition-all">Copy All</button>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-6 bg-black/10">
                  {Object.keys(outputs).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-32">
                       <Activity className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                    </div>
                  ) : (
                    algos.filter(a => selectedAlgos.has(a.id)).map((algo) => (
                      <div key={algo.id} className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black uppercase text-primary tracking-widest">{algo.label} Matrix</span>
                            <button onClick={() => handleCopy(outputs[algo.id], algo.label)} className="text-foreground/20 hover:text-primary transition-colors">
                               <Copy className="w-3.5 h-3.5" />
                            </button>
                         </div>
                         <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-border shadow-inner group/hash">
                            <p className="text-[11px] font-mono font-bold text-foreground break-all leading-relaxed select-all">
                               {isUppercase ? outputs[algo.id].toUpperCase() : outputs[algo.id].toLowerCase()}
                            </p>
                         </div>
                      </div>
                    ))
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-6">
                       <Loader2 className="w-10 h-10 text-primary animate-spin" />
                       <p className="text-[10px] font-black uppercase text-primary tracking-widest">Hashing Bitstream...</p>
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Collision Check Ready</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Verified hashes for large file integrity checks and secure data verification.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Structured Knowledge Section */}
      <section className="mt-20 py-16 border-t border-border">
         <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
               <h2 className="text-3xl font-headline font-black uppercase tracking-tight">How to use the <span className="text-primary italic">Hash Generator</span></h2>
               <p className="text-foreground/40 font-medium">Professional steps for cryptographic production.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="flex gap-6">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">1</div>
                     <div className="space-y-2">
                        <h4 className="font-bold uppercase text-sm">Input Selection</h4>
                        <p className="text-sm text-foreground/50 leading-relaxed">Type or paste your text matrix into the source field, or upload a binary file from your local disk.</p>
                     </div>
                  </div>
                  <div className="flex gap-6">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">2</div>
                     <div className="space-y-2">
                        <h4 className="font-bold uppercase text-sm">Algorithm Protocol</h4>
                        <p className="text-sm text-foreground/50 leading-relaxed">Select one or more hashing algorithms. SHA-256 is recommended for modern security standards.</p>
                     </div>
                  </div>
                  <div className="flex gap-6">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">3</div>
                     <div className="space-y-2">
                        <h4 className="font-bold uppercase text-sm">Output Mapping</h4>
                        <p className="text-sm text-foreground/50 leading-relaxed">The generator synthesizes fingerprints instantly. Copy specific hashes or export the entire result matrix.</p>
                     </div>
                  </div>
               </div>
               
               <Card className="glass-card p-8 border-primary/10 bg-primary/5 rounded-[3rem]">
                  <div className="flex items-center gap-4 mb-6">
                     <Info className="w-5 h-5 text-primary" />
                     <h4 className="text-sm font-black uppercase tracking-widest text-primary">Pro Tips</h4>
                  </div>
                  <ul className="space-y-4">
                     <li className="flex items-start gap-3 text-sm text-foreground/60 leading-relaxed italic">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                        "Use SHA-512 for the highest level of collision resistance in sensitive technical projects."
                     </li>
                     <li className="flex items-start gap-3 text-sm text-foreground/60 leading-relaxed italic">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                        "MD5 is fast but considered cryptographically broken for security; use it primarily for file integrity checks."
                     </li>
                  </ul>
               </Card>
            </div>
         </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
