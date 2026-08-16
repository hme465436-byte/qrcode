"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  X
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
  
  const { toast } = useToast();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = "qr-reader-container-v2";

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
  };

  useEffect(() => {
    if (isOpen && cameras.length === 0) {
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length > 0) {
          const formattedCameras = devices.map((d, i) => ({ 
            id: d.id || `camera-fallback-${i}`, 
            label: d.label || `Camera Matrix ${i + 1}` 
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
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        });
        html5QrCodeRef.current = scanner;

        // Relaxed constraints for synthetic IDs
        const isSynthetic = selectedCameraId.startsWith('camera-fallback-');
        const startTarget = isSynthetic ? { facingMode: "environment" } : selectedCameraId;

        await scanner.start(
          startTarget,
          {
            fps: 20, 
            qrbox: (viewWidth, viewHeight) => {
              const minDim = Math.min(viewWidth, viewHeight);
              return { width: minDim * 0.75, height: minDim * 0.75 };
            },
            aspectRatio: 1.0
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
          setError("Camera busy or unavailable.");
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setError(null);
    setScanResult(null);

    await stopScanner();
    await new Promise(r => setTimeout(r, 400)); 

    const tempId = "qr-file-scan-temp-v2";
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
        toast({ title: "Import Successful", description: "QR matrix identified and decoded." });
      }
      
      fileScanner.clear();
    } catch (err: any) {
      setError("Matrix detection failed. High-resolution images with clear contrast recommended.");
    } finally {
      setIsProcessingFile(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Content copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!scanResult) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR CANVAS Result',
          text: scanResult,
          url: isUrl(scanResult) ? scanResult : undefined,
        });
      } else {
        handleCopy();
        toast({ title: "Sharing restricted", description: "Copied to clipboard instead." });
      }
    } catch (error) {
      handleCopy();
      toast({ title: "Sharing failed", description: "Content copied to clipboard instead." });
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
      <DialogContent className="glass-card max-w-lg border-white/20 p-0 overflow-hidden outline-none text-foreground">
        <DialogHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between bg-white/5">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-foreground font-headline flex items-center gap-3 text-2xl uppercase tracking-tighter">
              <Scan className="w-6 h-6 text-primary" />
              Live Studio Scanner
            </DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Technical Matrix Analyzer</DialogDescription>
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/50 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-8 p-8">
          {!scanResult ? (
            <div className="w-full space-y-8">
              <div className="flex items-center gap-4">
                {cameras.length > 1 && (
                  <div className="flex-1">
                    <Select value={selectedCameraId} onValueChange={setSelectedCameraId}>
                      <SelectTrigger className="bg-secondary/50 border-white/10 text-foreground h-14 rounded-2xl text-[11px] uppercase font-black tracking-widest px-5">
                        <Camera className="w-4 h-4 mr-3 text-primary" />
                        <SelectValue placeholder="Camera" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        {cameras.map(cam => (
                          <SelectItem key={cam.id} value={cam.id} className="text-[11px] uppercase font-black">{cam.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isInitializing || isProcessingFile}
                  className="flex-1 h-14 border-white/10 bg-secondary/50 text-foreground text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-secondary gap-3"
                >
                  {isProcessingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-primary" />}
                  Import Image
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="w-full relative aspect-square rounded-[3rem] overflow-hidden border-2 border-primary/20 bg-black/5 dark:bg-white/5 group shadow-2xl">
                <div id={scannerContainerId} className="w-full h-full"></div>
                
                {!isInitializing && !error && !isProcessingFile && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-72 h-72 border-2 border-primary/30 rounded-[3rem] relative">
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-[2rem]" />
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-[2rem]" />
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-[2rem]" />
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-[2rem]" />
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-primary blue-glow scanner-line" />
                    </div>
                  </div>
                )}

                {(isInitializing || isProcessingFile) && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-20">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Scan className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary text-center px-8">
                      {isProcessingFile ? "Analyzing Artistic Matrix..." : "Syncing Optical Hardware..."}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 p-12 text-center z-30">
                    <AlertCircle className="w-16 h-16 text-destructive animate-bounce" />
                    <p className="text-sm font-bold text-foreground leading-relaxed">{error}</p>
                    <div className="flex flex-col gap-4 w-full">
                      <Button variant="outline" onClick={handleReset} className="h-12 border-white/10 text-foreground text-[11px] font-black uppercase tracking-widest rounded-2xl">
                        <RefreshCcw className="w-4 h-4 mr-3" /> Restart Engine
                      </Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-12 bg-primary/10 border-primary/30 text-primary text-[11px] font-black uppercase tracking-widest rounded-2xl">
                        <ImageIcon className="w-4 h-4 mr-3" /> Select New File
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                 <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <p className="text-[10px] text-foreground/50 leading-relaxed font-medium">
                   PRO TIP: Artistic QR codes with integrated logos or AI backgrounds require sharp focus. Ensure the QR occupies most of the viewfinder for rapid matrix identification.
                 </p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Decoded Matrix Payload</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center border border-white/20 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-8 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 max-h-[220px] overflow-auto custom-scrollbar relative z-10 shadow-inner">
                  <p className="text-lg font-mono text-foreground break-all leading-relaxed">{scanResult}</p>
                </div>

                <div className="flex flex-col gap-4 pt-4 relative z-10">
                  {isUrl(scanResult) && (
                    <Button 
                      onClick={handleOpenLink}
                      className="w-full h-16 bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.15em] rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-transform"
                    >
                      <ExternalLink className="w-5 h-5 mr-3" />
                      Open Link
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleShare}
                      className={cn(
                        "h-14 bg-white/50 dark:bg-black/50 border border-white/20 hover:bg-white dark:hover:bg-black text-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                        !isUrl(scanResult) && "col-span-2 h-16"
                      )}
                    >
                      <Share2 className="w-4 h-4 mr-3 text-primary" />
                      Share
                    </Button>
                    <Button 
                    onClick={handleCopy}
                    className={cn(
                      "h-14 bg-white/50 dark:bg-black/50 border border-white/20 hover:bg-white dark:hover:bg-black text-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                      !isUrl(scanResult) && "col-span-2 h-16"
                    )}
                    >
                      {isCopied ? <CheckCircle2 className="w-4 h-4 mr-3 text-primary" /> : <Copy className="w-4 h-4 mr-3 text-primary" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <Button variant="outline" onClick={handleReset} className="h-14 border-white/10 hover:bg-secondary rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/60 transition-all">
                      <RefreshCcw className="w-4 h-4 mr-3" />
                      Scan New
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="h-14 border-white/10 hover:bg-secondary rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/60 transition-all">
                      <ArrowLeft className="w-4 h-4 mr-3" />
                      Studio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
