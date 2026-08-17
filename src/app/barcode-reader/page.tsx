"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Scan, 
  Upload, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Camera,
  Globe,
  Loader2,
  FileImage,
  RefreshCcw,
  Search,
  Maximize2,
  Zap,
  ArrowRight,
  ShieldCheck,
  History,
  ExternalLink,
  Smartphone,
  X,
  AlertCircle,
  FileText,
  Barcode,
  Database,
  Share2,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { GetHelp } from '@/components/qr-canvas/get-help';

const SCANNER_CONTAINER_ID = "barcode-scanner-viewfinder";
const HISTORY_KEY = "mykit_barcode_history_v1";

interface ScanResult {
  id: string;
  text: string;
  format: string;
  timestamp: number;
}

export default function BarcodeReaderPage() {
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save History
  const addToHistory = (item: ScanResult) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.text !== item.text);
      const next = [item, ...filtered].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History Purged" });
  };

  // Device Discovery
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        const formatted = devices.map((d, i) => ({
          id: d.id,
          label: d.label || `Camera Port ${i + 1}`
        }));
        setCameras(formatted);
        // Prioritize rear camera
        const back = formatted.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
        setSelectedCameraId(back ? back.id : formatted[0].id);
      }
    }).catch(() => {
      setError("Hardware handshake failed. Camera access required.");
    });
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    if (!selectedCameraId) return;
    
    setIsInitializing(true);
    setError(null);
    setResult(null);
    await stopScanner();

    try {
      const scanner = new Html5Qrcode(SCANNER_CONTAINER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        selectedCameraId,
        {
          fps: 20,
          qrbox: (w, h) => {
            const min = Math.min(w, h);
            return { width: min * 0.8, height: min * 0.5 }; // Horizontal box for barcodes
          },
          aspectRatio: 1.0
        },
        (text, decodedResult) => {
          const newResult: ScanResult = {
            id: Math.random().toString(36).substr(2, 9),
            text,
            format: decodedResult.result.format?.formatName || "Unknown",
            timestamp: Date.now()
          };
          setResult(newResult);
          addToHistory(newResult);
          stopScanner();
          toast({ title: "Matrix Decoded" });
        },
        () => {} // Silent failures
      );
      setIsScanning(true);
    } catch (err) {
      setError("Failed to initialize optical stream.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setError(null);
    setResult(null);
    await stopScanner();

    // Small delay for UI update
    await new Promise(r => setTimeout(r, 300));

    const tempId = "barcode-file-scan-temp";
    let tempDiv = document.getElementById(tempId);
    if (!tempDiv) {
      tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
    }

    try {
      const fileScanner = new Html5Qrcode(tempId);
      const text = await fileScanner.scanFile(file, true);
      
      const newResult: ScanResult = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        format: "Identified Matrix",
        timestamp: Date.now()
      };
      setResult(newResult);
      addToHistory(newResult);
      toast({ title: "Asset Scanned" });
    } catch (err) {
      setError("Could not identify barcode in image. Ensure high contrast.");
    } finally {
      setIsProcessingFile(false);
      if (e.target) e.target.value = '';
    }
  };

  const isUrl = (t: string) => {
    try { new URL(t); return true; } catch (e) {
      return t.startsWith('http') || t.includes('.com/') || t.includes('.org/');
    }
  };

  const handleCopy = (t: string) => {
    navigator.clipboard.writeText(t);
    setIsCopied(true);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!result) return;
    const content = `[BARCODE RESULT]\nContent: ${result.text}\nFormat: ${result.format}\nTimestamp: ${new Date(result.timestamp).toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcode_result_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Scan className="w-3.5 h-3.5" /> Hardware Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              Barcode <span className="text-primary italic">& QR Reader</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional optical matrix decoding. Scan industrial barcodes, UPC codes, and QR patterns locally using hardware-native WASM logic.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="barcode-reader" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* Viewfinder Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[600px] bg-black">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5" /> Optical Stream
                </CardTitle>
                {isScanning && (
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase animate-pulse">
                     Analysis Active
                  </div>
                )}
             </CardHeader>
             
             <CardContent className="flex-1 flex flex-col items-center justify-center p-0 relative overflow-hidden">
                <div id={SCANNER_CONTAINER_ID} className="w-full h-full object-cover"></div>
                
                {/* Viewfinder Overlay Guides */}
                {!result && !isInitializing && !isProcessingFile && isScanning && (
                   <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 p-10">
                      <div className="w-full max-w-sm aspect-[2/1] border-2 border-primary/20 rounded-2xl relative">
                         <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                         <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                         <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                         <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      </div>
                   </div>
                )}

                {!isScanning && !result && !isInitializing && !isProcessingFile && (
                   <div className="flex flex-col items-center gap-6 text-center px-10">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10">
                         <Barcode className="w-10 h-10" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Initialize Hardware Protocol</p>
                      <Button onClick={startScanner} className="h-14 px-10 bg-primary text-white font-black rounded-2xl text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20">
                         Start Camera
                      </Button>
                   </div>
                )}

                {(isInitializing || isProcessingFile) && (
                   <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center gap-6">
                      <div className="relative">
                         <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest">
                         {isProcessingFile ? 'Reconstructing Matrix...' : 'Negotiating Hardware...'}
                      </p>
                   </div>
                )}

                {error && !isScanning && (
                   <div className="flex flex-col items-center gap-6 text-center px-10 animate-in shake duration-500">
                      <AlertCircle className="w-12 h-12 text-destructive animate-bounce" />
                      <p className="text-xs font-bold text-destructive uppercase tracking-tighter max-w-xs">{error}</p>
                      <Button variant="outline" onClick={handleReset} className="h-12 px-6 rounded-xl border-white/10 bg-secondary text-[10px] font-black uppercase tracking-widest">
                         Try Again
                      </Button>
                   </div>
                )}

                {result && (
                  <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-center p-8 sm:p-12 animate-in fade-in zoom-in duration-500">
                     <div className="w-full max-w-2xl space-y-10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Matrix Identification</p>
                              <h3 className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{result.format}</h3>
                           </div>
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                              <CheckCircle2 className="w-6 h-6" />
                           </div>
                        </div>

                        <div className="p-8 bg-secondary/50 rounded-[2.5rem] border border-border shadow-inner max-h-[250px] overflow-auto custom-scrollbar">
                           <p className="text-xl sm:text-2xl font-mono font-bold text-foreground break-all leading-relaxed">{result.text}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                           {isUrl(result.text) && (
                             <Button onClick={handleOpenLink} className="h-16 flex-1 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                                <ExternalLink className="w-4 h-4 mr-2" /> Launch Protocol
                             </Button>
                           )}
                           <Button 
                            onClick={() => handleCopy(result.text)}
                            variant="outline"
                            className={cn(
                              "h-16 flex-1 rounded-2xl border-white/10 bg-white/5 text-foreground font-black text-xs uppercase tracking-widest transition-all",
                              !isUrl(result.text) && "flex-[2]"
                            )}
                           >
                             {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                             Copy Data
                           </Button>
                           <Button variant="outline" onClick={handleReset} className="h-16 w-16 rounded-2xl border-white/10 bg-white/5 flex items-center justify-center text-foreground/40 hover:text-primary">
                              <RefreshCcw className="w-5 h-5" />
                           </Button>
                        </div>
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Controls & History - Right */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Input Configuration
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Port (Camera)</Label>
                    <Select value={selectedCameraId} onValueChange={setSelectedCameraId} disabled={isScanning || isInitializing}>
                       <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                          <SelectValue placeholder="Identify Hardware" />
                       </SelectTrigger>
                       <SelectContent className="glass-card">
                          {cameras.map(c => (
                            <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase">{c.label}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => !isScanning ? startScanner() : stopScanner()}
                      className={cn(
                        "h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg",
                        isScanning ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary text-white"
                      )}
                    >
                       {isScanning ? <X className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                       {isScanning ? 'Kill Feed' : 'Launch Feed'}
                    </Button>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="h-14 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground font-black text-[10px] uppercase tracking-widest"
                    >
                       <ImageIcon className="w-4 h-4 mr-2 text-primary" /> Asset Upload
                    </Button>
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                 </div>
              </CardContent>
           </Card>

           {/* Results History Matrix */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden flex flex-col min-h-[300px]">
              <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Scan Log Matrix</CardTitle>
                 </div>
                 {history.length > 0 && (
                   <button onClick={clearHistory} className="text-[9px] font-black text-foreground/20 hover:text-destructive uppercase transition-colors">Purge Log</button>
                 )}
              </CardHeader>
              <CardContent className="p-0 overflow-hidden flex-1">
                 <div className="divide-y divide-border max-h-[400px] overflow-auto custom-scrollbar no-scrollbar scroll-smooth">
                    {history.length === 0 ? (
                      <div className="py-20 text-center opacity-10 space-y-4">
                         <Database className="w-10 h-10 mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No local log entries</p>
                      </div>
                    ) : (
                      <div className="flex flex-col lg:block overflow-x-auto no-scrollbar">
                        <div className="flex flex-row lg:flex-col lg:divide-y lg:divide-border min-w-max lg:min-w-0">
                          {history.map((h) => (
                            <div key={h.id} className="w-[280px] lg:w-full p-6 hover:bg-secondary/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group">
                               <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded leading-none shrink-0">{h.format.split('_').pop()}</span>
                                     <p className="text-[11px] font-bold text-foreground truncate">{h.text}</p>
                                  </div>
                                  <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{new Date(h.timestamp).toLocaleTimeString()}</p>
                               </div>
                               <div className="flex gap-2 shrink-0">
                                  <button onClick={() => handleCopy(h.text)} className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/20 hover:text-primary transition-all shadow-sm">
                                     <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  {isUrl(h.text) && (
                                    <button onClick={() => window.open(h.text, '_blank')} className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/20 hover:text-primary transition-all shadow-sm">
                                       <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Isolation</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All matrix decoding occurs 100% locally in browser memory. Hardware identifiers and visual buffers are never transmitted, ensuring absolute data privacy.
                  </p>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTIONS */}
      {result && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/80 backdrop-blur-3xl border-t border-white/10 z-[100] lg:hidden flex gap-3 animate-in slide-in-from-bottom-full duration-500">
          <Button onClick={() => handleCopy(result.text)} className="flex-1 h-14 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-2xl">
             <Copy className="w-4 h-4" /> {isCopied ? 'Identity Copied' : 'Copy Result'}
          </Button>
          <Button variant="outline" onClick={downloadTxt} className="h-14 px-6 bg-secondary border-white/10 text-white/40 font-black rounded-2xl text-[9px] uppercase">
             .TXT
          </Button>
        </div>
      )}

      <style jsx global>{`
        #barcode-scanner-viewfinder video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 2rem;
        }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
