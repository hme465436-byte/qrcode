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
  Wifi,
  Lock,
  Unlock,
  Eye,
  EyeOff,
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
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  
  const { toast } = useToast();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = "qr-reader-container-v3";

  // WiFi Parsing Logic
  const wifiData = React.useMemo(() => {
    if (!scanResult || !scanResult.startsWith('WIFI:')) return null;
    const wifi: any = { ssid: '', password: '', type: 'None' };
    const content = scanResult.substring(5);
    const parts = content.split(/(?<!\\);/);
    parts.forEach(part => {
      if (!part.trim()) return;
      const [key, ...valParts] = part.split(':');
      const val = valParts.join(':').replace(/\\;/g, ';').replace(/\\:/g, ':');
      if (key === 'S') wifi.ssid = val;
      if (key === 'P') wifi.password = val;
      if (key === 'T') wifi.type = val || 'None';
    });
    return wifi;
  }, [scanResult]);

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
            label: d.label || `Camera ${i + 1}` 
          }));
          setCameras(formattedCameras);
          const backCamera = formattedCameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
          setSelectedCameraId(backCamera ? backCamera.id : formattedCameras[0].id);
        } else {
          setError("No cameras found.");
        }
      }).catch(() => {
        setError("Camera permission required.");
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
            aspectRatio: 1.777778
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
          setError("Hardware error. Refresh the page.");
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
      toast({ variant: "destructive", title: "Not Supported", description: "This device doesn't support torch control." });
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
        toast({ title: "Found content" });
      }
      
      fileScanner.clear();
    } catch (err: any) {
      setError("No QR code found in this image.");
    } finally {
      setIsProcessingFile(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleCopy = (text: string, label: string = 'Content') => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
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
    setShowWifiPassword(false);
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
    handleReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="glass-card max-w-4xl border-white/20 p-0 overflow-hidden outline-none text-foreground flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-foreground font-headline flex items-center gap-3 text-2xl uppercase tracking-tighter">
              <Scan className="w-6 h-6 text-primary icon-3d" />
              QR Scanner
            </DialogTitle>
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-background/50 border border-white/10 flex items-center justify-center text-foreground/50 hover:text-foreground transition-all">
            <X className="w-5 h-5 icon-3d" />
          </button>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!scanResult ? (
            <div className="flex flex-col lg:grid lg:grid-cols-12 h-full">
              {/* Controls Column */}
              <div className="lg:col-span-5 p-6 space-y-6 bg-secondary/10 border-r border-white/5 order-2 lg:order-1">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Select Camera</Label>
                      <Select value={selectedCameraId} onValueChange={setSelectedCameraId} disabled={isInitializing || isProcessingFile}>
                        <SelectTrigger className="bg-background border-white/10 text-foreground h-12 rounded-xl text-[10px] uppercase font-black px-4">
                          <Camera className="w-4 h-4 mr-2 text-primary" />
                          <SelectValue placeholder="Identify Camera" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          {cameras.length > 0 ? cameras.map(cam => (
                            <SelectItem key={cam.id} value={cam.id} className="text-[10px] uppercase font-black">{cam.label}</SelectItem>
                          )) : (
                            <SelectItem value="none" disabled>No Camera</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isInitializing || isProcessingFile}
                        className="h-12 border-white/10 bg-background/50 text-[10px] font-black uppercase rounded-xl hover:bg-secondary"
                      >
                        {isProcessingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 mr-2" />}
                        Open Image
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      
                      <Button 
                        variant="outline"
                        onClick={toggleTorch}
                        disabled={isInitializing || isProcessingFile || !html5QrCodeRef.current?.isScanning}
                        className={cn(
                          "h-12 border-white/10 text-[10px] font-black uppercase rounded-xl transition-all",
                          isTorchOn ? "bg-primary text-white border-primary" : "bg-background/50"
                        )}
                      >
                        {isTorchOn ? <Zap className="w-3.5 h-3.5 mr-2" /> : <ZapOff className="w-3.5 h-3.5 mr-2" />}
                        {isTorchOn ? 'Lights Off' : 'Lights On'}
                      </Button>
                   </div>

                   <Button 
                      variant="outline"
                      onClick={togglePause}
                      disabled={isInitializing || isProcessingFile || !html5QrCodeRef.current?.isScanning}
                      className={cn(
                        "w-full h-12 border-white/10 bg-background/50 text-[10px] font-black uppercase rounded-xl",
                        isPaused && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 mr-2 fill-current" /> : <Pause className="w-3.5 h-3.5 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                   </Button>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                   <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">
                        Processing is private and stays in your browser.
                      </p>
                   </div>
                </div>
              </div>

              {/* Viewfinder Column */}
              <div className="lg:col-span-7 p-4 sm:p-8 bg-[#060608] flex items-center justify-center order-1 lg:order-2">
                <div className="w-full relative aspect-video rounded-3xl overflow-hidden border-2 border-primary/20 bg-black/40 shadow-2xl">
                  <div id={scannerContainerId} className="w-full h-full object-cover"></div>
                  
                  {!isInitializing && !error && !isProcessingFile && !isPaused && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                      <div className="w-full h-full max-w-[80%] max-h-[80%] border-2 border-primary/10 rounded-2xl relative">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl" />
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(37,99,235,1)] scanner-line" />
                      </div>
                    </div>
                  )}

                  {isPaused && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-2">
                       <Pause className="w-8 h-8 text-amber-500" />
                       <p className="text-[9px] font-black uppercase text-amber-500">Paused</p>
                    </div>
                  )}

                  {(isInitializing || isProcessingFile) && (
                    <div className="absolute inset-0 bg-[#060608]/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4 z-20">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-[10px] font-black uppercase text-primary">Preparing...</p>
                    </div>
                  )}

                  {error && (
                    <div className="absolute inset-0 bg-[#060608]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-4 p-8 text-center z-30">
                      <AlertCircle className="w-12 h-12 text-destructive animate-bounce" />
                      <p className="text-xs font-bold text-foreground/80 uppercase">{error}</p>
                      <Button variant="outline" onClick={handleReset} className="h-10 bg-secondary/50 text-[9px] font-black uppercase rounded-lg">
                        Restart
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-10 w-full space-y-8 bg-secondary/5">
              <div className="p-6 sm:p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Result</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Structured WiFi Results */}
                {wifiData ? (
                  <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-bottom-2">
                     {[
                       { label: 'Network Name', val: wifiData.ssid, icon: Globe },
                       { label: 'Password', val: wifiData.password, icon: Lock, isSecret: true },
                       { label: 'Security', val: wifiData.type, icon: ShieldCheck }
                     ].map((item) => (
                       <div key={item.label} className="p-4 bg-white/40 dark:bg-black/40 rounded-2xl border border-white/20 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 overflow-hidden">
                             <item.icon className="w-4 h-4 text-primary shrink-0" />
                             <div className="overflow-hidden">
                                <p className="text-[8px] font-black uppercase text-foreground/40">{item.label}</p>
                                <p className={cn(
                                  "text-sm font-mono font-bold text-foreground truncate",
                                  item.isSecret && !showWifiPassword && "blur-sm select-none"
                                )}>
                                  {item.val || '[None]'}
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {item.isSecret && (
                               <button onClick={() => setShowWifiPassword(!showWifiPassword)} className="p-2 text-foreground/20 hover:text-primary">
                                  {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                               </button>
                             )}
                             <button 
                              onClick={() => handleCopy(item.val, item.label)} 
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                isCopied === item.label ? "text-green-500 bg-green-500/10" : "text-foreground/20 hover:text-primary"
                              )}
                             >
                                {isCopied === item.label ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white/40 dark:bg-black/40 rounded-[2rem] border border-white/20 max-h-[250px] overflow-auto custom-scrollbar shadow-inner">
                    <p className="text-base sm:text-lg font-mono text-foreground break-all leading-relaxed">{scanResult}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  {isUrl(scanResult) && (
                    <Button 
                      onClick={handleOpenLink}
                      className="w-full h-14 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {wifiData ? 'Join WiFi' : 'Open Link'}
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => handleCopy(scanResult)}
                      className="h-12 bg-white/5 border border-white/10 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      {isCopied === 'Content' ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </Button>
                    <Button 
                      onClick={() => {
                        if (navigator.share) navigator.share({ title: 'MY KIT Scan', text: scanResult || '' });
                        else handleCopy(scanResult || '');
                      }}
                      className="h-12 bg-white/5 border border-white/10 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
                    <Button variant="outline" onClick={handleReset} className="h-12 border-white/10 hover:bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/40">
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Scan again
                    </Button>
                    <Button variant="outline" onClick={handleClose} className="h-12 border-white/10 hover:bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/40">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Close
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
      `}</style>
    </Dialog>
  );
}
