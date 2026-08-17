
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Eye, 
  EyeOff, 
  Upload, 
  Download, 
  Trash2, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Copy, 
  Type, 
  ImageIcon, 
  Sparkles, 
  AlertCircle,
  FileImage,
  Loader2,
  RefreshCcw,
  Zap,
  MoreVertical,
  KeyRound,
  FileText,
  History,
  FileUp,
  Maximize2,
  AlertTriangle,
  Scissors,
  Check,
  ShieldAlert,
  Save,
  Eraser
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Protocol Constants ---
const MAGIC = "MK_ST_V2"; // Versioned Magic String
const HEADER_SIZE = 16;   // Fixed header size in bytes
const MAX_FILE_SIZE = 50 * 1024; // 50KB limit for embedded files

interface JobHistory {
  id: string;
  name: string;
  timestamp: number;
  type: 'hide' | 'reveal';
}

export default function HideMessagePhotoPage() {
  const { toast } = useToast();
  const [activeMode, setActiveTab] = useState('hide');
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Hide State
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [decoyCaption, setDecoyCaption] = useState('');
  const [embeddedFile, setEmbeddedFile] = useState<{ name: string, data: Uint8Array } | null>(null);
  const [strength, setStrength] = useState<'fast' | 'strong'>('fast');
  
  // Reveal State
  const [revealedData, setRevealedData] = useState<{ text?: string, file?: { name: string, blob: Blob } } | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<'ok' | 'damaged' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [showBefore, setShowBefore] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  const [history, setHistory] = useState<JobHistory[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const secretFileInputRef = useRef<HTMLInputElement>(null);

  // --- Capacity Logic ---
  const capacityMetrics = useMemo(() => {
    if (!loadedImage) return { total: 0, used: 0, percent: 0 };
    
    // 1 bit per RGB channel
    const totalBits = loadedImage.width * loadedImage.height * 3;
    const availableBytes = Math.floor(totalBits / 8) - HEADER_SIZE;
    
    // Strong mode uses 2x redundancy
    const finalCapacity = strength === 'strong' ? Math.floor(availableBytes / 2) : availableBytes;
    
    const usedBytes = embeddedFile ? embeddedFile.data.length : new TextEncoder().encode(message).length;
    const percent = Math.min(100, Math.round((usedBytes / finalCapacity) * 100));
    
    return { total: finalCapacity, used: usedBytes, percent };
  }, [loadedImage, message, embeddedFile, strength]);

  // --- History Logic ---
  useEffect(() => {
    const saved = localStorage.getItem('mykit_steg_history');
    if (saved) try { setHistory(JSON.parse(saved)); } catch(e) {}
  }, []);

  const addToHistory = (name: string, type: 'hide' | 'reveal') => {
    const entry: JobHistory = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.substring(0, 20),
      timestamp: Date.now(),
      type
    };
    const next = [entry, ...history].slice(0, 5);
    setHistory(next);
    localStorage.setItem('mykit_steg_history', JSON.stringify(next));
  };

  // --- Steganography Engine ---

  const getCryptoKey = async (pwd: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
  };

  const simpleChecksum = (data: Uint8Array): number => {
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum = (checksum + data[i]) % 0xFFFFFFFF;
    }
    return checksum;
  };

  const executeHide = async () => {
    if (!loadedImage || !canvasRef.current) return;
    if (!message.trim() && !embeddedFile) {
      toast({ variant: "destructive", title: "Empty Payload" });
      return;
    }

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Phase 1: Draw Base + Decoys
    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;
    ctx.drawImage(loadedImage, 0, 0);

    if (decoyCaption.trim() || passwordHint.trim()) {
      ctx.save();
      if (decoyCaption) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Inter';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
        ctx.fillText(decoyCaption.toUpperCase(), canvas.width / 2, 60);
      }
      if (passwordHint) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`HINT: ${passwordHint.toUpperCase()}`, canvas.width - 10, canvas.height - 10);
      }
      ctx.restore();
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Phase 2: Prepare Payload
    const encoder = new TextEncoder();
    const contentBytes = embeddedFile ? embeddedFile.data : encoder.encode(message);
    const filenameBytes = embeddedFile ? encoder.encode(embeddedFile.name) : new Uint8Array(0);
    const checksum = simpleChecksum(contentBytes);

    // Header: [MAGIC 8b][IS_FILE 1b][CHECKSUM 4b][NAME_LEN 1b][PAYLOAD_LEN 2b] = 17 bytes approx
    // Using simple buffer for 16-byte fixed header for robustness
    const header = new Uint8Array(HEADER_SIZE);
    for (let i = 0; i < MAGIC.length; i++) header[i] = MAGIC.charCodeAt(i);
    header[8] = embeddedFile ? 1 : 0;
    header[9] = strength === 'strong' ? 1 : 0;
    
    // Lengths (Big Endian)
    const view = new DataView(header.buffer);
    view.setUint32(10, contentBytes.length);
    view.setUint16(14, checksum % 0xFFFF);

    const fullBinary = new Uint8Array(header.length + filenameBytes.length + contentBytes.length);
    fullBinary.set(header);
    fullBinary.set(filenameBytes, header.length);
    fullBinary.set(contentBytes, header.length + filenameBytes.length);

    let bits: number[] = [];
    fullBinary.forEach(byte => {
      for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
    });

    // Apply Encryption
    if (password) {
      const key = await getCryptoKey(password);
      bits = bits.map((b, i) => b ^ ((key[Math.floor(i / 8) % key.length] >> (i % 8)) & 1));
    }

    // Apply Redundancy for Strong Mode
    if (strength === 'strong') {
      const redundantBits: number[] = [];
      bits.forEach(b => {
        redundantBits.push(b);
        redundantBits.push(b); // 2x repeat
      });
      bits = redundantBits;
    }

    // Phase 3: LSB Injection
    let bitIdx = 0;
    const stride = strength === 'strong' ? 3 : 1; // Scatter bits in strong mode
    for (let i = 0; i < data.length && bitIdx < bits.length; i += 4 * stride) {
      // Red channel
      data[i] = (data[i] & 0xFE) | bits[bitIdx++];
      if (bitIdx >= bits.length) break;
      // Green channel
      data[i + 1] = (data[i + 1] & 0xFE) | bits[bitIdx++];
      if (bitIdx >= bits.length) break;
      // Blue channel
      data[i + 2] = (data[i + 2] & 0xFE) | bits[bitIdx++];
      if (bitIdx >= bits.length) break;
    }

    ctx.putImageData(imageData, 0, 0);

    // Phase 4: Export
    const link = document.createElement('a');
    link.download = `secret_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    addToHistory(embeddedFile ? embeddedFile.name : 'Text Message', 'hide');
    setIsProcessing(false);
    toast({ title: "Master Exported", description: "PNG master generated locally." });
  };

  const executeReveal = async () => {
    if (!loadedImage || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);
    setRevealedData(null);
    setIntegrityStatus(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;
    ctx.drawImage(loadedImage, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Extract raw bits
    const rawBits: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if ((i + 1) % 4 === 0) continue;
      rawBits.push(data[i] & 1);
    }

    // Decrypt if password
    let bits = rawBits;
    if (password) {
      const key = await getCryptoKey(password);
      bits = bits.map((b, i) => b ^ ((key[Math.floor(i / 8) % key.length] >> (i % 8)) & 1));
    }

    // Recover from redundancy if strong (simple majority vote for 2x is just taking every 2nd or averaging)
    // For 2x we check if the flag in the header says it's strong.
    // We need to decode the header FIRST to know how to decode the rest.
    
    const decodeBits = (bitSource: number[], isStrong: boolean) => {
      const bytes = new Uint8Array(Math.floor(bitSource.length / (isStrong ? 16 : 8)));
      let bitPtr = 0;
      for (let i = 0; i < bytes.length; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
          let b = bitSource[bitPtr];
          if (isStrong) {
            // Take first of the pair (2x redundancy)
            b = bitSource[bitPtr];
            bitPtr += 2;
          } else {
            bitPtr += 1;
          }
          byte = (byte << 1) | b;
        }
        bytes[i] = byte;
      }
      return bytes;
    };

    try {
      // 1. Try Fast Mode Header
      let headerBytes = decodeBits(bits, false).slice(0, HEADER_SIZE);
      let isStrong = headerBytes[9] === 1;
      
      if (isStrong) {
        headerBytes = decodeBits(bits, true).slice(0, HEADER_SIZE);
      }

      const magicCheck = String.fromCharCode(...headerBytes.slice(0, MAGIC.length));
      
      if (magicCheck !== MAGIC) {
        throw new Error("Invalid matrix identification. Incorrect password or sanitized photo.");
      }

      const isFile = headerBytes[8] === 1;
      const view = new DataView(headerBytes.buffer);
      const payloadLen = view.getUint32(10);
      const expectedChecksum = view.getUint16(14);

      // 2. Decode Full Payload
      const fullBytes = decodeBits(bits, isStrong);
      const contentStart = HEADER_SIZE;
      const payload = fullBytes.slice(contentStart, contentStart + payloadLen);

      // 3. Verify
      const actualChecksum = simpleChecksum(payload) % 0xFFFF;
      setIntegrityStatus(actualChecksum === expectedChecksum ? 'ok' : 'damaged');

      if (isFile) {
        setRevealedData({ file: { name: 'extracted_file', blob: new Blob([payload]) } });
      } else {
        setRevealedData({ text: new TextDecoder().decode(payload) });
      }

      addToHistory(loadedImage.src.substring(0, 10), 'reveal');
      toast({ title: "Signal Isolated" });
    } catch (e: any) {
      setError(e.message || "Failed to identify hidden protocol.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSecretFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: "destructive", title: "File too large", description: "Embedded files are capped at 50KB." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setEmbeddedFile({ name: file.name, data: new Uint8Array(event.target?.result as ArrayBuffer) });
        setMessage('');
        toast({ title: "File Buffered" });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-x-hidden">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Lock className="w-3.5 h-3.5" /> Identity Protection Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Hide Message <span className="text-primary italic">in Photo Pro</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Clinical-grade steganography. Embed encrypted text or small files invisibly into pixel buffers with 1:1 hardware fidelity.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="hide-message-photo" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Viewport - Left */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] max-h-[50vh] lg:max-h-none lg:min-h-[700px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Eye className="w-3.5 h-3.5" /> Visual Analysis
                </CardTitle>
                <div className="flex items-center gap-3">
                   {image && (
                     <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                        <span className="text-[8px] font-black uppercase text-foreground/40">Compare Slider</span>
                        <Switch checked={showBefore} onCheckedChange={setShowBefore} className="scale-50 h-4 w-8" />
                     </div>
                   )}
                </div>
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-primary/40 transition-all">
                     <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Inject Carrier Photo</span>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative group/canvas max-w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-checkered">
                       {showBefore && (
                         <div className="absolute inset-0 z-10 pointer-events-none">
                            <div 
                              className="absolute inset-0 bg-no-repeat bg-contain bg-center opacity-100" 
                              style={{ 
                                backgroundImage: `url(${image})`, 
                                width: `${compareSplit}%`,
                                borderRight: '2px solid white'
                              }} 
                            />
                         </div>
                       )}
                       
                       <canvas 
                        ref={canvasRef} 
                        className={cn(
                          "max-w-full max-h-[600px] object-contain transition-all duration-500",
                          isProcessing && "opacity-50 blur-sm"
                        )}
                       />

                       {showBefore && (
                         <input 
                          type="range" 
                          min="0" max="100" 
                          value={compareSplit} 
                          onChange={(e) => setCompareSplit(parseInt(e.target.value))}
                          className="absolute bottom-0 left-0 w-full z-20 opacity-0 cursor-ew-resize h-full"
                         />
                       )}
                    </div>
                  </div>
                )}
             </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-5">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Compression Advisory</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                Sending encoded images via WhatsApp or Facebook will destroy the hidden bitstream due to lossy re-compression. Use direct file sharing or email to preserve integrity.
              </p>
            </div>
          </div>
        </div>

        {/* Controls - Right */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Tabs value={activeMode} onValueChange={(v) => { setActiveTab(v); setError(null); }} className="w-full">
              <TabsList className="grid grid-cols-2 bg-secondary p-1.5 rounded-2xl h-14 mb-8 border border-white/5 shadow-2xl">
                 <TabsTrigger value="hide" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Hide Data</TabsTrigger>
                 <TabsTrigger value="reveal" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Reveal Data</TabsTrigger>
              </TabsList>

              <div className="min-h-[600px]">
                <TabsContent value="hide" className="space-y-8 mt-0 animate-in fade-in duration-300">
                   <Card className="glass-card border-border shadow-2xl">
                      <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                         <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                            <Type className="w-5 h-5 text-primary" /> Linguistic Input
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-8">
                         <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Secret Payload</Label>
                               <span className={cn("text-[9px] font-black uppercase", capacityMetrics.percent > 90 ? "text-red-500" : "text-primary/60")}>
                                  Used {capacityMetrics.percent}% of {capacityMetrics.total.toLocaleString()}
                               </span>
                            </div>
                            
                            <Tabs defaultValue="text" className="w-full">
                               <TabsList className="grid grid-cols-2 h-10 bg-secondary rounded-xl mb-4">
                                  <TabsTrigger value="text" className="text-[8px] font-black uppercase">Text</TabsTrigger>
                                  <TabsTrigger value="file" className="text-[8px] font-black uppercase">Small File</TabsTrigger>
                               </TabsList>
                               <TabsContent value="text">
                                  <Textarea 
                                    value={message}
                                    onChange={e => { setMessage(e.target.value); setEmbeddedFile(null); }}
                                    placeholder="Enter secret text..."
                                    className="h-32 bg-secondary/50 border-border rounded-2xl text-sm font-medium resize-none focus:ring-primary/40 p-6"
                                  />
                               </TabsContent>
                               <TabsContent value="file">
                                  <div onClick={() => secretFileInputRef.current?.click()} className="h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-secondary/30 cursor-pointer group/file">
                                     {embeddedFile ? (
                                       <div className="text-center">
                                          <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-1" />
                                          <p className="text-[10px] font-black uppercase text-foreground">{embeddedFile.name}</p>
                                       </div>
                                     ) : (
                                       <div className="text-center">
                                          <FileUp className="w-6 h-6 text-foreground/10 group-hover/file:text-primary transition-colors mx-auto mb-2" />
                                          <span className="text-[8px] font-black uppercase text-foreground/30">Select TXT/JSON (Max 50KB)</span>
                                       </div>
                                     )}
                                     <input type="file" ref={secretFileInputRef} accept=".txt,.json,.xml,.csv" onChange={handleSecretFileUpload} className="hidden" />
                                  </div>
                               </TabsContent>
                            </Tabs>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Strength</Label>
                               <div className="grid grid-cols-2 bg-secondary p-1 rounded-xl border border-border h-11">
                                  <button onClick={() => setStrength('fast')} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", strength === 'fast' ? "bg-primary text-white" : "text-foreground/40")}>Fast</button>
                                  <button onClick={() => setStrength('strong')} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", strength === 'strong' ? "bg-primary text-white" : "text-foreground/40")}>Strong</button>
                               </div>
                            </div>
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Visible Decoy</Label>
                               <Input 
                                value={decoyCaption}
                                onChange={e => setDecoyCaption(e.target.value)}
                                placeholder="Public Label..."
                                className="h-11 bg-secondary/50 border-border rounded-xl text-[10px] font-bold"
                               />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Security Protocol</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <div className="relative group/pass">
                                  <Input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Encryption Key"
                                    className="h-12 bg-secondary/50 border-border rounded-xl text-xs font-bold pl-10" 
                                  />
                                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/pass:text-primary" />
                               </div>
                               <Input 
                                value={passwordHint}
                                onChange={e => setPasswordHint(e.target.value)}
                                placeholder="Visible Hint..."
                                className="h-12 bg-secondary/50 border-border rounded-xl text-[10px] font-medium"
                               />
                            </div>
                         </div>

                         <Button 
                          onClick={executeHide}
                          disabled={!image || (!message.trim() && !embeddedFile) || isProcessing || capacityMetrics.percent > 100}
                          className="h-16 w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                         >
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            Download PNG
                         </Button>
                      </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="reveal" className="space-y-8 mt-0 animate-in fade-in duration-300">
                   <Card className="glass-card border-border shadow-2xl">
                      <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                         <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                            <Unlock className="w-5 h-5 text-primary" /> Extraction Matrix
                         </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-8">
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Access Key</Label>
                            <div className="relative group/pass">
                               <Input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter encryption password..."
                                className="h-14 bg-secondary/50 border-border rounded-2xl text-xs font-bold pl-10" 
                               />
                               <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/pass:text-primary" />
                            </div>
                         </div>

                         <Button 
                          onClick={executeReveal}
                          disabled={!image || isProcessing}
                          className="h-16 w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl active:scale-95 transition-all"
                         >
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Eye className="w-6 h-6" />}
                            Reveal Secret
                         </Button>

                         {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                               <AlertCircle className="w-4 h-4 text-destructive" />
                               <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                            </div>
                         )}

                         {revealedData && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                               <div className={cn(
                                 "p-4 rounded-xl flex items-center justify-between",
                                 integrityStatus === 'ok' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                               )}>
                                  <div className="flex items-center gap-3">
                                     {integrityStatus === 'ok' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                     <span className="text-[10px] font-black uppercase tracking-widest">
                                        {integrityStatus === 'ok' ? 'Bitstream Integrity OK' : 'Data Matrix Corrupted'}
                                     </span>
                                  </div>
                               </div>

                               <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Decoded Payload</Label>
                               
                               {revealedData.text !== undefined && (
                                 <div className="p-6 bg-secondary/50 rounded-2xl border border-border shadow-inner max-h-[250px] overflow-auto custom-scrollbar">
                                    <p className="text-sm font-medium text-foreground leading-relaxed break-all">
                                       {revealedData.text || <span className="italic opacity-30">No textual data identified.</span>}
                                    </p>
                                 </div>
                               )}

                               {revealedData.file && (
                                 <div className="p-6 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <FileText className="w-6 h-6 text-primary" />
                                       <span className="text-[10px] font-black uppercase text-foreground">{revealedData.file.name}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => {
                                      const a = document.createElement('a');
                                      a.href = URL.createObjectURL(revealedData.file!.blob);
                                      a.download = revealedData.file!.name;
                                      a.click();
                                    }} className="text-primary hover:bg-primary/10">Download</Button>
                                 </div>
                               )}

                               <div className="grid grid-cols-2 gap-3">
                                  <Button onClick={handleCopy} variant="outline" className="h-12 rounded-xl border-border bg-white/5 text-[9px] font-black uppercase tracking-widest">
                                     {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                                     Copy Data
                                  </Button>
                                  <Button variant="outline" onClick={handleClear} className="h-12 rounded-xl border-border bg-secondary text-[9px] font-black uppercase tracking-widest hover:text-destructive">
                                     <Trash2 className="w-4 h-4 mr-2" /> Clear
                                  </Button>
                               </div>
                            </div>
                         )}
                      </CardContent>
                   </Card>
                </TabsContent>
              </div>
           </Tabs>

           {/* History Panel */}
           <Card className="glass-card border-border shadow-xl overflow-hidden">
              <CardHeader className="py-4 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between">
                 <CardTitle className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/40 flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Recent Sessions
                 </CardTitle>
                 <button onClick={() => { setHistory([]); localStorage.removeItem('mykit_steg_history'); }} className="text-[8px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors">Purge</button>
              </CardHeader>
              <CardContent className="p-0">
                 {history.length === 0 ? (
                   <div className="p-10 text-center opacity-10">
                      <Activity className="w-8 h-8 mx-auto" />
                      <p className="text-[9px] font-black uppercase tracking-widest mt-2">Zero Registry Hits</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-white/5">
                      {history.map(item => (
                        <div key={item.id} className="p-4 flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-2 h-2 rounded-full", item.type === 'hide' ? 'bg-primary' : 'bg-green-500')} />
                              <span className="text-[10px] font-bold text-foreground/60 group-hover:text-foreground truncate max-w-[120px]">{item.name}</span>
                           </div>
                           <span className="text-[8px] font-black text-foreground/20 uppercase">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
      
      {/* MOBILE STICKY ACTIONS */}
      {image && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/80 backdrop-blur-3xl border-t border-white/10 z-[100] lg:hidden flex gap-3 animate-in slide-in-from-bottom-full duration-500">
          <Button onClick={executeHide} disabled={isProcessing} className="flex-1 h-14 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-2xl">
             <Save className="w-4 h-4" /> Download PNG
          </Button>
          {revealedData && (
             <Button onClick={handleCopy} variant="outline" className="h-14 px-6 bg-secondary border-white/10 text-white/40 font-black rounded-2xl text-[9px] uppercase">
                COPY
             </Button>
          )}
        </div>
      )}

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
