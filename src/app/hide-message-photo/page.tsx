
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
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// MAGIC STRING to identify My Kit Tool steganography packages
const MAGIC = "MYKIT_STEG_V1";

export default function HideMessagePhotoPage() {
  const { toast } = useToast();
  const [activeMode, setActiveTab] = useState('hide');
  const [image, setImage] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [revealedMessage, setRevealedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Capacity Logic ---
  const capacity = useMemo(() => {
    if (!loadedImage) return 0;
    // Total bits = Width * Height * 3 (R, G, B channels)
    // We use 1 bit per channel (LSB)
    const totalBits = loadedImage.width * loadedImage.height * 3;
    const headerBits = (MAGIC.length + 10) * 8; // Magic string + separators
    const availBits = totalBits - headerBits;
    return Math.floor(availBits / 8);
  }, [loadedImage]);

  // --- Cryptography Protocol ---
  const getPasswordKey = async (pwd: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
  };

  const xorBits = (bits: number[], key: Uint8Array) => {
    if (key.length === 0) return bits;
    return bits.map((bit, i) => {
      const keyByte = key[Math.floor(i / 8) % key.length];
      const keyBit = (keyByte >> (i % 8)) & 1;
      return bit ^ keyBit;
    });
  };

  // --- Steganography Protocol ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImage(img);
          setImage(event.target?.result as string);
          setRevealedMessage(null);
          setIsProcessing(false);
          toast({ title: "Photo Imported" });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const textToBits = (text: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const bits: number[] = [];
    bytes.forEach(byte => {
      for (let i = 7; i >= 0; i--) {
        bits.push((byte >> i) & 1);
      }
    });
    return bits;
  };

  const bitsToText = (bits: number[]) => {
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = (byte << 1) | bits[i * 8 + j];
      }
      bytes[i] = byte;
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  };

  const executeHide = async () => {
    if (!loadedImage || !canvasRef.current || !message.trim()) return;
    
    if (message.length > capacity) {
      toast({ variant: "destructive", title: "Capacity Overflow", description: "Message is too long for this photo." });
      return;
    }

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;
    ctx.drawImage(loadedImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Build Payload: [MAGIC][Length (4 bytes)][Message]
    const fullPayload = MAGIC + "|" + message;
    let bits = textToBits(fullPayload);

    // Apply Encryption if password exists
    if (password) {
      const key = await getPasswordKey(password);
      bits = xorBits(bits, key);
    }

    // Write bits to LSB
    let bitIdx = 0;
    for (let i = 0; i < data.length && bitIdx < bits.length; i++) {
      if ((i + 1) % 4 === 0) continue; // Skip alpha channel
      
      // Zero out last bit and set to payload bit
      data[i] = (data[i] & 0xFE) | bits[bitIdx];
      bitIdx++;
    }

    ctx.putImageData(imageData, 0, 0);

    const link = document.createElement('a');
    link.download = `secret_photo_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    setIsProcessing(false);
    toast({ title: "Master Exported", description: "Secret message embedded in PNG." });
  };

  const executeReveal = async () => {
    if (!loadedImage || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);
    setRevealedMessage(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;
    ctx.drawImage(loadedImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Extract all bits
    const bits: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if ((i + 1) % 4 === 0) continue;
      bits.push(data[i] & 1);
    }

    // XOR if password provided
    let processedBits = bits;
    if (password) {
      const key = await getPasswordKey(password);
      processedBits = xorBits(bits, key);
    }

    try {
      const fullText = bitsToText(processedBits);
      if (fullText.includes(MAGIC)) {
        const parts = fullText.split('|');
        const msg = parts.slice(1).join('|');
        // Clean trailing null chars or garbage (limit to logical length)
        const cleanMsg = msg.replace(/\0+$/, '').split('\0')[0];
        setRevealedMessage(cleanMsg);
        toast({ title: "Message Decoded" });
      } else {
        setError(password ? "Incorrect password or no message found." : "No message found in this photo.");
      }
    } catch (e) {
      setError("Data corruption detected or no message exists.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (revealedMessage) {
      navigator.clipboard.writeText(revealedMessage);
      setIsCopied(true);
      toast({ title: "Copied" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setImage(null);
    setLoadedImage(null);
    setMessage('');
    setRevealedMessage(null);
    setPassword('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Lock className="w-3.5 h-3.5" /> Privacy Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Hide Message <span className="text-primary italic">in Photo</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Professional steganography studio. Embed secret text inside your photos using LSB bit-shifting. 100% private and invisible to the naked eye.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="hide-message-photo" />
             {image && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                 <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Workspace - Preview */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[700px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Eye className="w-3.5 h-3.5" /> Visual Buffer
                </CardTitle>
                {image && (
                   <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase">
                      PNG Protocol Active
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-primary/40 transition-all">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-8 h-8" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Inject Photo Matrix</span>
                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={image} 
                      alt="Preview" 
                      className={cn(
                        "max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10 transition-all duration-500",
                        isProcessing && "opacity-50 blur-sm"
                      )} 
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
             </CardContent>
          </Card>

          <div className="hidden lg:grid grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Pixel Isolation</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All bit-shifting occurs locally in browser memory. Your secrets never leave your device.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">LSB Protocol</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing the Least Significant Bit of the RGB channels for invisible, high-capacity data embedding.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Tabs value={activeMode} onValueChange={(v) => { setActiveTab(v); setRevealedMessage(null); setError(null); }} className="w-full">
              <TabsList className="grid grid-cols-2 bg-secondary p-1.5 rounded-2xl h-14 mb-8 border border-white/5 shadow-2xl">
                 <TabsTrigger value="hide" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Hide Message</TabsTrigger>
                 <TabsTrigger value="reveal" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Reveal Message</TabsTrigger>
              </TabsList>

              <div className="min-h-[500px]">
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
                               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Secret Text</Label>
                               <span className={cn("text-[9px] font-black uppercase", message.length > capacity ? "text-red-500" : "text-primary/60")}>
                                  {message.length} / {capacity.toLocaleString()} Chars
                               </span>
                            </div>
                            <Textarea 
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              placeholder="Enter the message you wish to hide..."
                              className="h-40 bg-secondary/50 border-border rounded-2xl text-sm font-medium resize-none focus:ring-primary/40 p-6"
                            />
                         </div>

                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Password (Optional)</Label>
                            <div className="relative group/pass">
                               <Input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Scramble bitstream..."
                                className="h-14 bg-secondary/50 border-border rounded-2xl text-xs font-bold pl-10" 
                               />
                               <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/pass:text-primary transition-colors" />
                            </div>
                         </div>

                         <div className="pt-4 flex flex-col gap-3">
                            <Button 
                              onClick={executeHide}
                              disabled={!image || !message.trim() || isProcessing || message.length > capacity}
                              className="h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all"
                            >
                               {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                               Download PNG
                            </Button>
                         </div>
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
                               <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/pass:text-primary transition-colors" />
                            </div>
                         </div>

                         <div className="pt-4 flex flex-col gap-3">
                            <Button 
                              onClick={executeReveal}
                              disabled={!image || isProcessing}
                              className="h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all"
                            >
                               {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Eye className="w-6 h-6" />}
                               Reveal Secret
                            </Button>
                         </div>

                         {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                               <AlertCircle className="w-4 h-4 text-destructive" />
                               <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                            </div>
                         )}

                         {revealedMessage !== null && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-500">
                               <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Decoded Payload</Label>
                               <div className="p-6 bg-secondary/50 rounded-2xl border border-border shadow-inner max-h-[200px] overflow-auto custom-scrollbar">
                                  <p className="text-sm font-medium text-foreground leading-relaxed break-all">
                                     {revealedMessage || <span className="italic opacity-30">No message found.</span>}
                                  </p>
                               </div>
                               {revealedMessage && (
                                 <Button onClick={handleCopy} variant="outline" className="w-full h-12 rounded-xl border-border bg-white/5 text-[9px] font-black uppercase tracking-widest">
                                    {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    Copy Message
                                 </Button>
                               )}
                            </div>
                         )}
                      </CardContent>
                   </Card>
                </TabsContent>
              </div>
           </Tabs>
        </div>
      </div>
      
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
      `}</style>
    </div>
  );
}
