"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Html5Qrcode } from 'html5-qrcode';
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
  ShieldCheck,
  Globe,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_FORMATS = [
  0, // QR_CODE
  1, // DATA_MATRIX
  2, // AZTEC
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
        console.warn("Scanner shutdown partial success", e);
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
          setError("No cameras identified in this hardware matrix.");
        }
      }).catch(() => {
        setError("Camera permission denied. Enable hardware access to scan.");
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
          verbose: false,
        });
        html5QrCodeRef.current = scanner;

        const isSynthetic = selectedCameraId.startsWith('camera-fallback-');
        const startTarget = isSynthetic ? { facingMode: "environment" } : selectedCameraId;

        await scanner.start(
          startTarget,
          {
            fps: 20, 
            qrbox: (viewWidth, viewHeight) => {
              const minDim = Math.min(viewWidth, viewHeight);
              return { width: minDim * 0.8, height: minDim * 0.8 };
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
          setError("Failed to initialize hardware stream. Retrying...");
          setIsInitializing(false);
        }
      }
    };

    if (isOpen && !scanResult && !error && !isProcessingFile) {
      const timer = setTimeout(startScanner, 300);
      return () => clearTimeout(timer);
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
      toast({ variant: "destructive", title: "Hardware Block", description: "This device does not support torch control." });
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
        verbose: false
      });
      
      const decodedText = await fileScanner.scanFile(file, true);
      
      if (decodedText) {
        setScanResult(decodedText);
        toast({ title: "Matrix Decoded" });
      }
      
      fileScanner.clear();
    } catch (err: any) {
      setError("No valid QR matrix found in this asset.");
    } finally {
      setIsProcessingFile(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleCopy = (text: string, label: string = 'Content') => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Identity Isolated" });
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
      <DialogContent className="glass-card max-w-4xl border-white/20 p-0 overflow-hidden outline-none text-foreground flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <DialogHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between bg-secondary/30 shrink-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-foreground font-headline flex items-center gap-3 text-2xl uppercase tracking-tighter">
              <Scan className="w-6 h-6 text-primary icon-3d" />
              Scanner Studio
            </DialogTitle>
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-background/50 border border-white/10 flex items-center justify-center text-foreground/50 hover:text-foreground transition-all">
            <X className="w-5 h-5 icon-3d" />
          </button>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!scanResult ? (
            <div className="flex flex-col lg:grid lg:grid-cols-12 h-full min-h-[500px]">
              {/* Controls Column */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-8 bg-secondary/10 border-r border-white/5 order-2 lg:order-1">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Port (Camera)</Label>
                      <Select value={selectedCameraId} onValueChange={setSelectedCameraId} disabled={isInitializing || isProcessingFile}>
                        <SelectTrigger className="bg-background border-white/10 text-foreground h-14 rounded-2xl text-[10px] uppercase font-black px-5 shadow-inner">
                          <Camera className="w-5 h-5 mr-3 text-primary/40" />
                          <SelectValue placeholder="Identify Hardware..." />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          {cameras.length > 0 ? cameras.map(cam => (
                            <SelectItem key={cam.id} value={cam.id} className="text-[10px] uppercase font-black">{cam.label}</SelectItem>
                          )) : (
                            <SelectItem value="none" disabled>No Hardware Found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isInitializing || isProcessingFile}
                        className="h-14 border-white/10 bg-background/50 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-secondary shadow-lg"
                      >
                        {isProcessingFile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2 text-primary" />}
                        Open Image
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      
                      <Button 
                        variant="outline"
                        onClick={toggleTorch}
                        disabled={isInitializing || isProcessingFile || !html5QrCodeRef.current?.isScanning}
                        className={cn(
                          "h-14 border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg",
                          isTorchOn ? "bg-primary text-white border-primary" : "bg-background/50"
                        )}
                      >
                        {isTorchOn ? <Zap className="w-4 h-4 mr-2" /> : <ZapOff className="w-4 h-4 mr-2" />}
                        Lights
                      </Button>
                   </div>

                   <Button 
                      variant="outline"
                      onClick={togglePause}
                      disabled={isInitializing || isProcessingFile || !html5QrCodeRef.current?.isScanning}
                      className={cn(
                        "w-full h-14 border-white/10 bg-background/50 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-md",
                        isPaused && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}
                    >
                      {isPaused ? <Play className="w-4 h-4 mr-2 fill-current" /> : <Pause className="w-4 h-4 mr-2" />}
                      {isPaused ? 'Resume Matrix' : 'Pause Protocol'}
                   </Button>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                   <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/10">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase text-foreground">WASM Sandbox</h4>
                        <p className="text-[10px] text-foreground/40 leading-relaxed font-medium">
                          Decoding occurs strictly in local memory. Visual identifiers never leave your browser.
                        </p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Viewfinder Column */}
              <div className="lg:col-span-7 p-6 sm:p-10 bg-[#060608] flex flex-col items-center justify-center order-1 lg:order-2">
                <div className="w-full max-w-sm mx-auto relative aspect-square rounded-[3rem] overflow-hidden border-2 border-primary/20 bg-black/40 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)]">
                  <div 
                    id={scannerContainerId} 
                    className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                  />
                  
                  {/* Viewfinder Overlay Guides */}
                  {!isInitializing && !error && !isProcessingFile && !isPaused && !scanResult && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                      <div className="w-[75%] h-[75%] border-2 border-primary/10 rounded-[2.5rem] relative">
                        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
                        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
                        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-3xl" />
                        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-primary shadow-[0_0_15px_rgba(59,130,246,1)] scanner-sweep-animation" />
                      </div>
                    </div>
                  )}

                  {isPaused && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-in fade-in">
                       <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Pause className="w-8 h-8 fill-current" />
                       </div>
                       <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.4em]">Protocol Paused</p>
                    </div>
                  )}

                  {(isInitializing || isProcessingFile) && (
                    <div className="absolute inset-0 bg-[#060608]/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-20">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Calibrating Matrix...</p>
                    </div>
                  )}

                  {error && (
                    <div className="absolute inset-0 bg-[#060608]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 p-10 text-center z-30">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold text-foreground/80 uppercase tracking-widest leading-relaxed">{error}</p>
                      <Button variant="outline" onClick={handleReset} className="h-12 px-8 bg-secondary/50 border-white/10 text-[9px] font-black uppercase rounded-xl tracking-widest">
                        Initialize Reset
                      </Button>
                    </div>
                  )}
                </div>
                
                {!error && !isInitializing && !isProcessingFile && (
                  <div className="mt-8 flex items-center gap-3 text-white/20 animate-in fade-in duration-1000">
                     <Activity className="w-4 h-4 animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-[0.4em]">Live Signal Monitoring Active</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-12 w-full flex flex-col items-center gap-10 bg-[#0a0a0c]">
              <div className="w-full max-w-2xl space-y-10 animate-in zoom-in-95 duration-500">
                
                <div className="p-10 rounded-[3.5rem] bg-primary/5 border border-primary/20 space-y-10 shadow-2xl relative overflow-hidden group/result">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] group-hover/result:bg-primary/10 transition-all duration-1000" />
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-8 relative z-10">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Identity Isolated</p>
                       <h3 className="text-lg font-bold text-foreground/40 uppercase tracking-widest">Binary Logic Matrix</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] ring-4 ring-primary/5">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Structured WiFi Visualization */}
                  {wifiData ? (
                    <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
                       {[
                         { label: 'Network SSID', val: wifiData.ssid, icon: Globe },
                         { label: 'Key Protocol', val: wifiData.password, icon: Lock, isSecret: true },
                         { label: 'Encryption', val: wifiData.type, icon: ShieldCheck }
                       ].map((item) => (
                         <div key={item.label} className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-between gap-6 hover:border-primary/20 transition-all group/item">
                            <div className="flex items-center gap-4 min-w-0">
                               <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary/40 group-hover/item:text-primary transition-colors shrink-0 shadow-inner">
                                  <item.icon className="w-6 h-6" />
                               </div>
                               <div className="min-w-0 overflow-hidden">
                                  <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">{item.label}</p>
                                  <p className={cn(
                                    "text-lg font-mono font-bold text-foreground truncate",
                                    item.isSecret && !showWifiPassword && "blur-md select-none opacity-50"
                                  )}>
                                    {item.val || '[NULL]'}
                                  </p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               {item.isSecret && (
                                 <button onClick={() => setShowWifiPassword(!showWifiPassword)} className="w-10 h-10 rounded-xl bg-background/50 border border-white/5 flex items-center justify-center text-foreground/20 hover:text-primary transition-all">
                                    {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                 </button>
                               )}
                               <button 
                                onClick={() => handleCopy(item.val, item.label)} 
                                className={cn(
                                  "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                                  isCopied === item.label ? "bg-green-500 border-green-500 text-white" : "bg-background/50 border-white/5 text-foreground/20 hover:text-primary"
                                )}
                               >
                                  {isCopied === item.label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="p-10 bg-black/40 rounded-[2.5rem] border border-white/5 max-h-[300px] overflow-auto custom-scrollbar shadow-inner relative z-10">
                      <p className="text-xl sm:text-2xl font-mono font-bold text-foreground/90 break-all leading-relaxed tracking-tight">{scanResult}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 relative z-10">
                    {isUrl(scanResult) && (
                      <Button 
                        onClick={handleOpenLink}
                        className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
                      >
                        <ExternalLink className="w-5 h-5 mr-3" />
                        {wifiData ? 'Launch Connection' : 'Launch Protocol'}
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => handleCopy(scanResult || '')}
                        variant="outline"
                        className="h-14 bg-white/5 border-white/10 text-white/60 hover:text-primary hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        {isCopied === 'Content' ? <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy Matrix
                      </Button>
                      <Button 
                        onClick={() => {
                          if (navigator.share) navigator.share({ title: 'MY KIT Identity', text: scanResult || '' });
                          else handleCopy(scanResult || '');
                        }}
                        variant="outline"
                        className="h-14 bg-white/5 border-white/10 text-white/60 hover:text-primary hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5 mt-4">
                      <Button variant="outline" onClick={handleReset} className="h-14 border-white/10 bg-secondary/50 hover:bg-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40 transition-all">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Re-Scan
                      </Button>
                      <Button variant="outline" onClick={handleClose} className="h-14 border-white/10 bg-secondary/50 hover:bg-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40 transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Exit Studio
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 opacity-20">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   <span className="text-[8px] font-black uppercase tracking-[0.6em]">Hardware End Point Protocol Active</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <style jsx global>{`
        .scanner-sweep-animation {
          animation: scan-sweep 2.5s ease-in-out infinite;
        }
        @keyframes scan-sweep {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </Dialog>
  );
}
