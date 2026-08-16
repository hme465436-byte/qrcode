"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  Scan, 
  Camera, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  ImageIcon,
  Info,
  Share2,
  ExternalLink,
  X,
  Zap,
  ZapOff,
  Pause,
  Play,
  Settings2,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.AZTEC,
];

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const { toast } = useToast();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = "qr-reader-container-v3";

  const isUrl = (text: string | null) => {
    if (!text) return false;
    try {
      new URL(text);
      return true;
    } catch (_) {
      return text.startsWith('http://') || text.startsWith('https://');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        // Suppress hardware release warnings
      } finally {
        html5QrCodeRef.current = null;
      }
    }
    const container = document.getElementById(scannerContainerId);
    if (container) container.innerHTML = "";
    setIsTorchOn(false);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isOpen && cameras.length === 0) {
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length > 0) {
          const formattedCameras = devices.map((d, i) => ({ 
            id: d.id || `camera-fallback-${i}`, 
            label: d.label || `Linguistic Port ${i + 1}` 
          }));
          setCameras(formattedCameras);
          const backCamera = formattedCameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
          setSelectedCameraId(backCamera ? backCamera.id : formattedCameras[0].id);
        } else {
          setError("No hardware cameras identified.");
        }
      }).catch(() => {
        setError("Camera permissions required for live scanning.");
      });
    }
  }, [isOpen, cameras.length]);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      if (!isOpen || !selectedCameraId || scanResult || error || isProcessingFile || !isMounted) return;
      
      setIsInitializing(true);
      await stopScanner();
      
      try {
        const scanner = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false,
        });
        html5QrCodeRef.current = scanner;

        const isSynthetic = selectedCameraId.startsWith('camera-fallback-');
        const startTarget = isSynthetic ? { facingMode: "environment" } : selectedCameraId;

        await scanner.start(
          startTarget,
          {
            fps: 25, 
            qrbox: (viewWidth, viewHeight) => {
              const minDim = Math.min(viewWidth, viewHeight);
              return { width: minDim * 0.8, height: minDim * 0.8 };
            },
            aspectRatio: 1.777778 // 16:9 Wide Aspect
          },
          (decodedText) => {
            if (isMounted) {
              setScanResult(decodedText);
              stopScanner();
            }
          },
          () => {} 
        );
        
        if (isMounted) setIsInitializing(false);
      } catch (err) {
        if (isMounted) {
          setError("Hardware busy or initialization failure.");
          setIsInitializing(false);
        }
      }
    };

    if (isOpen && !scanResult && !error && !isProcessingFile) {
      startScanner();
    }

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen, selectedCameraId, scanResult, error, isProcessingFile]);

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !html5QrCodeRef.current.isScanning) return;
    try {
      const newState = !isTorchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: newState } as any]
      });
      setIsTorchOn(newState);
    } catch (e) {
      toast({ variant: "destructive", title: "Hardware Restricted", description: "Torch protocol not supported by this device." });
    }
  };

  const togglePause = () => {
    if (!html5QrCodeRef.current) return;
    if (isPaused) {
      html5QrCodeRef.current.resume();
      setIsPaused(false);
    } else {
      html5QrCodeRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setError(null);
    setScanResult(null);

    await stopScanner();
    await new Promise(r => setTimeout(r, 400)); 

    const tempId = "qr-file-scan-temp-v3";
    let tempDiv = document.getElementById(tempId);
    if (!tempDiv) {
      tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);
    }

    try {
      const fileScanner = new Html5Qrcode(tempId, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false
      });
      
      const decodedText = await fileScanner.scanFile(file, true);
      
      if (decodedText) {
        setScanResult(decodedText);
        toast({ title: "Analysis Success", description: "QR matrix identified and decoded." });
      }
      
      fileScanner.clear();
    } catch (err: any) {
      setError("Matrix detection failed. Ensure the QR has high contrast.");
    } finally {
      setIsProcessingFile(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Content saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (scanResult && isUrl(scanResult)) {
      window.open(scanResult.startsWith('http') ? scanResult : `https://${scanResult}`, '_blank');
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setError(null);
    setIsProcessingFile(false);
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
    handleReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="glass-card max-w-5xl border-white/20 p-0 overflow-hidden outline-none text-foreground flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-foreground font-headline flex items-center gap-3 text-2xl uppercase tracking-tighter">
              <Scan className="w-6 h-6 text-primary icon-3d" />
              Live Studio Scanner
            </DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Technical Matrix Analyzer v3.0</DialogDescription>
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-background/50 border border-white/10 flex items-center justify-center text-foreground/50 hover:text-foreground transition-all">
            <X className="w-5 h-5 icon-3d" />
          </button>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!scanResult ? (
            <div className="flex flex-col lg:grid lg:grid-cols-12 h-full">
              {/* Controls Column */}
              <div className="lg:col-span-5 p-8 space-y-8 bg-secondary/10 border-r border-white/5 order-2 lg:order-1">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Hardware Source</Label>
                      <Select value={selectedCameraId} onValueChange={setSelectedCameraId} disabled={isInitializing || isProcessingFile}>
                        <SelectTrigger className="bg-background border-white/10 text-foreground h-14 rounded-2xl text-[11px] uppercase font-black tracking-widest px-5 shadow-inner">
                          <Camera className="w-4 h-4 mr-3 text-primary icon-3d" />
                          <SelectValue placeholder="Identify Camera" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          {cameras.length > 0 ? cameras.map(cam => (
                            <SelectItem key={cam.id} value={cam.id} className="text-[11px] uppercase font-black">{cam.label}</SelectItem>
                          )) : (
                            <SelectItem value="none" disabled>No Cameras Detected</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isInitializing || isProcessingFile}
                        className="h-14 border-white/10 bg-background/50 text-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-secondary gap-3"
                      >
                        {isProcessingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-primary icon-3d" />}
                        Import File
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      
                      <Button 
                        variant="outline"
                        onClick={toggleTorch}
                        disabled={isInitializing || isProcessingFile || !html5QrCodeRef.current?.isScanning}
                        className={cn(
                          "h-14 border-white/10 text-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all gap-3",
                          isTorchOn ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-background/50"
                        )}
                      >
                        {isTorchOn ? <Zap className="w-4 h-4 icon-3d" /> : <ZapOff className="w-4 h-4 text-primary/40 icon-3d" />}
                        {isTorchOn ? 'Torch On' : 'Torch Off'}
                      </Button>
                   </div>

                   <Button 
                      variant="outline"
                      onClick={togglePause}
                      disabled={isInitializing || isProcessingFile || !html5QrCodeRef.current?.isScanning}
                      className={cn(
                        "w-full h-14 border-white/10 bg-background/50 text-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all gap-3",
                        isPaused && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}
                    >
                      {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 text-primary icon-3d" />}
                      {isPaused ? 'Resume Optical Stream' : 'Pause Analysis'}
                   </Button>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                   <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/10">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">
                        <span className="text-primary font-black uppercase tracking-wider block mb-1">Matrix Protocol 3.0</span>
                        Widescreen scanning allows for high-precision capture of artistic QR codes and logo-integrated patterns without data loss.
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-foreground/20">
                         <ShieldCheck className="w-3.5 h-3.5" /> Secure WASM Decoding
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-foreground/20">
                         <Smartphone className="w-3.5 h-3.5" /> Responsive Focus Logic
                      </div>
                   </div>
                </div>
              </div>

              {/* Viewfinder Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 bg-[#060608] flex items-center justify-center order-1 lg:order-2">
                <div className="w-full relative aspect-video sm:aspect-[4/3] lg:aspect-video rounded-[2.5rem] overflow-hidden border-2 border-primary/20 bg-black/40 shadow-2xl group ring-1 ring-white/5">
                  <div id={scannerContainerId} className="w-full h-full object-cover"></div>
                  
                  {!isInitializing && !error && !isProcessingFile && !isPaused && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                      <div className="w-full h-full max-w-[80%] max-h-[80%] border-2 border-primary/10 rounded-[3rem] relative">
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-[2.5rem]" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-[2.5rem]" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-[2.5rem]" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-[2.5rem]" />
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-primary shadow-[0_0_20px_rgba(37,99,235,0.8)] scanner-line" />
                      </div>
                    </div>
                  )}

                  {isPaused && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
                       <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/30">
                          <Pause className="w-8 h-8" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Analysis Paused</p>
                    </div>
                  )}

                  {(isInitializing || isProcessingFile) && (
                    <div className="absolute inset-0 bg-[#060608]/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-20">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <Scan className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse icon-3d" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary text-center px-12 leading-relaxed">
                        {isProcessingFile ? "Reconstructing Matrix..." : "Negotiating Hardware Link..."}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="absolute inset-0 bg-[#060608]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 p-12 text-center z-30">
                      <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                      <p className="text-sm font-bold text-foreground/80 leading-relaxed uppercase tracking-tighter">{error}</p>
                      <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Button variant="outline" onClick={handleReset} className="h-14 border-white/10 bg-secondary/50 text-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl">
                          <RefreshCcw className="w-4 h-4 mr-3 icon-3d" /> Restart Scanner
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-12 w-full space-y-10 animate-in fade-in zoom-in duration-700 bg-secondary/10">
              <div className="p-10 rounded-[3.5rem] bg-primary/5 border border-primary/20 space-y-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Decoded Matrix Result</p>
                    <p className="text-[9px] font-bold text-foreground/30 uppercase">Hardware verified payload</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center border border-white/20 shadow-2xl shadow-primary/40 icon-container-3d">
                    <CheckCircle2 className="w-8 h-8 icon-3d" />
                  </div>
                </div>

                <div className="p-10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 max-h-[250px] overflow-auto custom-scrollbar relative z-10 shadow-inner">
                  <p className="text-xl font-mono text-foreground break-all leading-relaxed tracking-tight">{scanResult}</p>
                </div>

                <div className="flex flex-col gap-4 pt-4 relative z-10">
                  {isUrl(scanResult) && (
                    <Button 
                      onClick={handleOpenLink}
                      className="w-full h-20 bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group/btn"
                    >
                      <ExternalLink className="w-6 h-6 mr-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform icon-3d" />
                      Initialize Link Protocol
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleCopy}
                      className={cn(
                        "h-16 bg-white/5 border border-white/10 hover:bg-white/10 text-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl",
                        !isUrl(scanResult) && "col-span-2"
                      )}
                    >
                      {isCopied ? <CheckCircle2 className="w-5 h-5 mr-3 text-primary icon-3d" /> : <Copy className="w-5 h-5 mr-3 text-primary icon-3d" />}
                      {isCopied ? 'Matrix Copied' : 'Copy Output'}
                    </Button>
                    {isUrl(scanResult) && (
                      <Button 
                        onClick={() => {
                          if (navigator.share) navigator.share({ title: 'MY KIT Result', text: scanResult, url: scanResult });
                          else handleCopy();
                        }}
                        className="h-16 bg-white/5 border border-white/10 hover:bg-white/10 text-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl"
                      >
                        <Share2 className="w-5 h-5 mr-3 text-primary icon-3d" />
                        Broadcast
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                    <Button variant="outline" onClick={handleReset} className="h-14 border-white/10 hover:bg-secondary rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/40 transition-all">
                      <RefreshCcw className="w-4 h-4 mr-3 icon-3d" />
                      Scan New Matrix
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="h-14 border-white/10 hover:bg-secondary rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/40 transition-all">
                      <ArrowLeft className="w-4 h-4 mr-3 icon-3d" />
                      Exit Studio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <style jsx global>{`
        .scanner-line {
          animation: scan 2.5s ease-in-out infinite;
        }
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .blue-glow {
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.8), 0 0 30px rgba(37, 99, 235, 0.4);
        }
      `}</style>
    </Dialog>
  );
}