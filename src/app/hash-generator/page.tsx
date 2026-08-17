"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Loader2,
  FileText,
  Type,
  KeyRound,
  Download,
  AlertCircle,
  FileCheck,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Local MD5 Implementation (Sanitized) ---
const md5 = (string: string) => {
  function k(n: number) { return Math.sin(n) * Math.pow(2, 32); }
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const x = [], s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const t = [];
  for (let i = 0; i < 64; i++) t[i] = k(i + 1) | 0;
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
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [hmacKey, setHmacKey] = useState('');
  const [compareHash, setCompareHash] = useState('');
  const [isUppercase, setIsUppercase] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAlgos, setSelectedAlgos] = useState<Set<string>>(new Set(['md5', 'sha-256']));
  const [outputs, setOutputs] = useState<Record<string, { hex: string, b64: string }>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const algos = [
    { id: 'md5', label: 'MD5', bits: 128, type: 'hash' },
    { id: 'sha-1', label: 'SHA-1', bits: 160, type: 'hash' },
    { id: 'sha-256', label: 'SHA-256', bits: 256, type: 'hash' },
    { id: 'sha-384', label: 'SHA-384', bits: 384, type: 'hash' },
    { id: 'sha-512', label: 'SHA-512', bits: 512, type: 'hash' },
    { id: 'hmac-sha-256', label: 'HMAC-SHA256', bits: 256, type: 'hmac' },
    { id: 'hmac-sha-512', label: 'HMAC-SHA512', bits: 512, type: 'hmac' },
  ];

  const bufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const bufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const generateHashes = useCallback(async (data: string | ArrayBuffer) => {
    const results: Record<string, { hex: string, b64: string }> = {};
    const encoder = new TextEncoder();
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;

    for (const algo of selectedAlgos) {
      if (algo === 'md5') {
        if (typeof data === 'string') {
          const h = md5(data);
          // Convert hex string back to bytes for b64
          const bytes = new Uint8Array(h.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
          results[algo] = { hex: h, b64: bufferToBase64(bytes.buffer) };
        } else {
          results[algo] = { hex: 'N/A (Text Only)', b64: 'N/A' };
        }
      } else if (algo.startsWith('hmac')) {
        if (!hmacKey.trim()) {
          results[algo] = { hex: 'Key Required', b64: 'Key Required' };
          continue;
        }
        try {
          const cryptoAlgo = algo.replace('hmac-', '').toUpperCase();
          const keyBuffer = encoder.encode(hmacKey);
          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'HMAC', hash: { name: cryptoAlgo } },
            false,
            ['sign']
          );
          const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
          results[algo] = { hex: bufferToHex(signature), b64: bufferToBase64(signature) };
        } catch (e) {
          results[algo] = { hex: 'HMAC Error', b64: 'Error' };
        }
      } else {
        try {
          const hashBuffer = await crypto.subtle.digest(algo.toUpperCase(), dataBuffer);
          results[algo] = { hex: bufferToHex(hashBuffer), b64: bufferToBase64(hashBuffer) };
        } catch (e) {
          results[algo] = { hex: 'Algorithm Error', b64: 'Error' };
        }
      }
    }
    setOutputs(results);
  }, [selectedAlgos, hmacKey]);

  useEffect(() => {
    if (activeTab === 'text') {
      if (!inputText) { setOutputs({}); return; }
      generateHashes(inputText);
    } else if (file) {
      // Re-trigger if algos/keys change while file is loaded
      const runFileHash = async () => {
        setIsProcessing(true);
        const buffer = await file.arrayBuffer();
        await generateHashes(buffer);
        setIsProcessing(false);
      };
      runFileHash();
    }
  }, [inputText, file, activeTab, hmacKey, generateHashes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({ title: "Asset Injected", description: `"${selectedFile.name}" ready for hashing.` });
    }
  };

  const toggleAlgo = (id: string) => {
    const next = new Set(selectedAlgos);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAlgos(next);
  };

  const selectAllAlgos = (all: boolean) => {
    if (all) setSelectedAlgos(new Set(algos.map(a => a.id)));
    else setSelectedAlgos(new Set());
  };

  const handleCopy = (text: string, label: string) => {
    const out = isUppercase ? text.toUpperCase() : text.toLowerCase();
    navigator.clipboard.writeText(out);
    toast({ title: "Copied", description: `${label} saved to clipboard.` });
  };

  const handleDownload = () => {
    if (Object.keys(outputs).length === 0) return;
    const content = Object.entries(outputs).map(([id, val]) => {
      const h = isUppercase ? val.hex.toUpperCase() : val.hex.toLowerCase();
      return `[${id.toUpperCase()}]\nHex: ${h}\nBase64: ${val.b64}\n`;
    }).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mykit_hashes_${Date.now()}.txt`;
    a.click();
    toast({ title: "Master Exported" });
  };

  const handleClear = () => {
    setInputText('');
    setFile(null);
    setHmacKey('');
    setCompareHash('');
    setOutputs({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  const isMatch = useMemo(() => {
    if (!compareHash.trim() || Object.keys(outputs).length === 0) return null;
    const cleanCompare = compareHash.trim().toLowerCase();
    return Object.values(outputs).some(o => 
      o.hex.toLowerCase() === cleanCompare || o.b64 === compareHash.trim()
    );
  }, [compareHash, outputs]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Security Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="min-w-0">
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
                Hash <span className="text-primary">Generator Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Advanced cryptographic production. Generate high-fidelity fingerprints and HMAC signatures for text or local binaries with 100% hardware-native privacy.
              </p>
           </div>
           <div className="shrink-0 pb-2">
              <GetHelp toolId="hash-generator" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[500px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <TabsList className="bg-background/50 border border-white/5 p-1 rounded-2xl h-12">
                      <TabsTrigger value="text" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Text Matrix</TabsTrigger>
                      <TabsTrigger value="file" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Binary Asset</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-3">
                       <Button variant="outline" size="sm" onClick={handleClear} className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-foreground/40 hover:text-destructive text-[9px] font-black uppercase tracking-widest">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                       </Button>
                    </div>
                  </div>
               </Tabs>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <Tabs value={activeTab} className="w-full">
                 <TabsContent value="text" className="space-y-4 m-0">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source String</Label>
                      <span className="text-[9px] font-mono text-primary/60">{inputText.length.toLocaleString()} Chars</span>
                    </div>
                    <Textarea 
                      placeholder="Paste text for real-time hashing..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[160px] bg-secondary border-border text-lg rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all font-mono"
                    />
                 </TabsContent>
                 <TabsContent value="file" className="space-y-4 m-0">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Binary Target</Label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
                      onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); }}
                      onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); const f = e.dataTransfer.files[0]; if (f) { setFile(f); toast({ title: "File Dropped" }); } }}
                      className={cn(
                        "h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer group",
                        file && "border-solid border-primary/20 bg-primary/5"
                      )}
                    >
                       {file ? (
                         <div className="text-center p-6 space-y-2 animate-in zoom-in">
                            <FileDigit className="w-10 h-10 text-primary mx-auto mb-2" />
                            <p className="text-xs font-black uppercase text-foreground truncate max-w-[300px]">{file.name}</p>
                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB Identified</p>
                         </div>
                       ) : (
                         <>
                            <Upload className="w-10 h-10 text-foreground/10 group-hover:text-primary transition-all mb-4" />
                            <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Drop or Select local file</p>
                         </>
                       )}
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                 </TabsContent>
              </Tabs>

              <div className="space-y-6 pt-4 border-t border-border">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">HMAC Key (Optional)</Label>
                       <div className="relative group/key">
                          <Input 
                            value={hmacKey}
                            onChange={(e) => setHmacKey(e.target.value)}
                            placeholder="Secret authentication key..."
                            className="h-12 bg-secondary border-border rounded-xl text-xs font-mono pr-10 focus:ring-primary/40"
                          />
                          <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within/key:text-primary transition-colors" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Result Comparison</Label>
                       <div className={cn(
                         "relative group/compare flex items-center h-12 rounded-xl border transition-all",
                         isMatch === true ? "bg-green-500/10 border-green-500/40" : isMatch === false ? "bg-red-500/10 border-red-500/40" : "bg-secondary border-border"
                       )}>
                          <Input 
                            value={compareHash}
                            onChange={(e) => setCompareHash(e.target.value)}
                            placeholder="Paste hash to verify match..."
                            className="h-full bg-transparent border-none text-xs font-mono pr-10 focus-visible:ring-0"
                          />
                          {isMatch === true && <Check className="absolute right-3 w-4 h-4 text-green-500" />}
                          {isMatch === false && <X className="absolute right-3 w-4 h-4 text-red-500" />}
                          {!isMatch && <Search className="absolute right-3 w-4 h-4 text-foreground/10" />}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-border">
                 <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Algorithm Matrix</Label>
                    <div className="flex gap-4">
                       <button onClick={() => selectAllAlgos(true)} className="text-[8px] font-black uppercase text-primary/60 hover:text-primary transition-all">Select All</button>
                       <button onClick={() => selectAllAlgos(false)} className="text-[8px] font-black uppercase text-foreground/20 hover:text-primary transition-all">Clear Selection</button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                   onClick={handleDownload}
                   disabled={Object.keys(outputs).length === 0}
                   className="h-14 flex-1 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95"
                 >
                   <Download className="w-4 h-4 mr-3" /> Export Summary (.TXT)
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Zero-Persistence Sandbox</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                All hashing logic is executed 100% in local memory using the Web Crypto API. Payloads and HMAC keys never leave your browser, ensuring absolute cryptographic privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[650px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 fill-primary/20" /> Fingerprint Result
              </CardTitle>
              {Object.keys(outputs).length > 0 && (
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">Calculated</div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-10 bg-black/10">
                  {Object.keys(outputs).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-32">
                       <Activity className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Signal Detection</p>
                    </div>
                  ) : (
                    algos.filter(a => selectedAlgos.has(a.id)).map((algo) => (
                      <div key={algo.id} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                         <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                            <div className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[8px] font-black uppercase">{algo.label.split('-')[0]}</div>
                               <span className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">{algo.label} Matrix</span>
                            </div>
                            <span className="text-[8px] font-bold text-foreground/20 uppercase">{algo.bits} BIT ENTROPY</span>
                         </div>
                         
                         {/* HEX Row */}
                         <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                               <p className="text-[8px] font-black uppercase text-primary/60 tracking-tighter">HEX Protocol</p>
                               <button onClick={() => handleCopy(outputs[algo.id].hex, `${algo.label} HEX`)} className="text-foreground/10 hover:text-primary transition-colors">
                                  <Copy className="w-3.5 h-3.5" />
                               </button>
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-border shadow-inner group/hash">
                               <p className={cn(
                                 "text-[10px] font-mono font-bold break-all leading-relaxed select-all transition-colors",
                                 (compareHash && outputs[algo.id].hex.toLowerCase() === compareHash.trim().toLowerCase()) ? "text-green-500" : "text-foreground"
                               )}>
                                  {isUppercase ? outputs[algo.id].hex.toUpperCase() : outputs[algo.id].hex.toLowerCase()}
                               </p>
                            </div>
                         </div>

                         {/* B64 Row */}
                         <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                               <p className="text-[8px] font-black uppercase text-primary/60 tracking-tighter">BASE64 Protocol</p>
                               <button onClick={() => handleCopy(outputs[algo.id].b64, `${algo.label} B64`)} className="text-foreground/10 hover:text-primary transition-colors">
                                  <Copy className="w-3.5 h-3.5" />
                               </button>
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-border shadow-inner group/hash">
                               <p className={cn(
                                 "text-[10px] font-mono font-bold break-all leading-relaxed select-all transition-colors",
                                 (compareHash && outputs[algo.id].b64 === compareHash.trim()) ? "text-green-500" : "text-foreground"
                               )}>
                                  {outputs[algo.id].b64}
                               </p>
                            </div>
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
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Collision Detection</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Integrated hash-verification matrix ensures bit-level data synchronization.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
