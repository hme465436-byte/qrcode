"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  Upload, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Camera,
  Loader2,
  Maximize2,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  Search,
  Scan,
  RefreshCcw,
  Smartphone,
  X,
  AlertCircle,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Html5Qrcode } from 'html5-qrcode';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface WifiInfo {
  ssid: string;
  password?: string;
  type: string;
  hidden: boolean;
}

export default function WifiQrDecoderPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [wifiData, setWifiData] = useState<WifiInfo | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseWifiString = (data: string): WifiInfo | null => {
    if (!data.startsWith('WIFI:')) return null;
    
    const wifi: WifiInfo = { ssid: '', type: 'None', hidden: false };
    const content = data.substring(5);
    
    // Split by semicolon, but handle escaped semicolons
    const parts = content.split(/(?<!\\);/);
    
    parts.forEach(part => {
      if (!part.trim()) return;
      const [key, ...valParts] = part.split(':');
      const val = valParts.join(':').replace(/\\;/g, ';').replace(/\\:/g, ':');
      
      switch (key) {
        case 'S': wifi.ssid = val; break;
        case 'P': wifi.password = val; break;
        case 'T': wifi.type = val || 'None'; break;
        case 'H': wifi.hidden = val.toLowerCase() === 'true'; break;
      }
    });
    
    return wifi;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setWifiData(null);
    setRawText(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const src = event.target?.result as string;
      setImage(src);

      // Create a temporary hidden div for the scanner
      const tempId = "wifi-qr-temp-scanner";
      let tempDiv = document.getElementById(tempId);
      if (!tempDiv) {
        tempDiv = document.createElement('div');
        tempId && (tempDiv.id = tempId);
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
      }

      try {
        const scanner = new Html5Qrcode(tempId);
        const decodedText = await scanner.scanFile(file, true);
        
        setRawText(decodedText);
        const parsed = parseWifiString(decodedText);
        setWifiData(parsed);
        
        if (parsed) {
          toast({ title: "Network Decoded", description: "WiFi credentials isolated." });
        } else {
          toast({ title: "Matrix Decoded", description: "Non-WiFi QR identified." });
        }
        
        scanner.clear();
      } catch (err) {
        setError("Could not identify QR matrix. Ensure high contrast and clear focus.");
        toast({ variant: "destructive", title: "Decoding Error" });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Protocol Copied", description: `${label} saved to clipboard.` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setImage(null);
    setWifiData(null);
    setRawText(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Wifi className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                WiFi QR <span className="text-primary italic">Password Finder</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Professional network credential extraction. Recover SSID, passwords, and security protocols from WiFi QR codes locally and securely.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="wifi-qr-decoder" />
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
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[350px] max-h-[45vh] lg:max-h-none lg:min-h-[600px] bg-black/60">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                   <Scan className="w-3.5 h-3.5" /> Visual Analysis
                </CardTitle>
                {image && (
                   <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase animate-pulse">
                      Matrix Identified
                   </div>
                )}
             </CardHeader>
             <CardContent className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {!image ? (
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer group w-full text-center border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-primary/40 transition-all">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-8 h-8" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Import WiFi QR Image</span>
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
                    {isProcessing && (
                       <div className="absolute inset-0 flex items-center justify-center z-20">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                       </div>
                    )}
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
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All decoding logic is hardware-native. Network names and security keys are processed strictly in your browser session.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Instant Matrix</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing the high-performance ZXing protocol for rapid and accurate credential extraction from any WiFi QR.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl flex flex-col min-h-[500px]">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Database className="w-5 h-5 text-primary" /> Decoded Data
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 flex-1 flex flex-col justify-center">
                 {!wifiData && !rawText && !error && (
                   <div className="py-20 text-center space-y-6 opacity-30">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-secondary border border-border mx-auto flex items-center justify-center">
                         <Search className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest px-12">
                         Upload a WiFi QR code to initialize the decoding protocol.
                      </p>
                   </div>
                 )}

                 {error && (
                   <div className="p-8 text-center space-y-6 animate-in shake duration-500">
                      <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                      <p className="text-xs font-bold text-destructive uppercase tracking-tighter leading-relaxed">{error}</p>
                      <Button variant="outline" onClick={handleClear} className="h-11 px-6 rounded-xl border-white/10 bg-secondary text-[9px] font-black uppercase tracking-widest">
                         Try New Asset
                      </Button>
                   </div>
                 )}

                 {wifiData ? (
                   <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                      <div className="space-y-6">
                         <div className="space-y-2 group/field">
                            <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Network SSID (Name)</Label>
                            <div className="flex gap-2">
                               <div className="flex-1 h-14 bg-secondary border border-border rounded-2xl flex items-center px-6 font-bold text-foreground overflow-hidden truncate shadow-inner">
                                  {wifiData.ssid}
                               </div>
                               <Button 
                                onClick={() => handleCopy(wifiData.ssid, 'SSID')}
                                variant="outline"
                                className={cn(
                                  "h-14 w-14 rounded-2xl bg-secondary border-border transition-all",
                                  isCopied === 'SSID' && "bg-primary text-white border-primary"
                                )}
                               >
                                  {isCopied === 'SSID' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                               </Button>
                            </div>
                         </div>

                         <div className="space-y-2 group/field">
                            <div className="flex items-center justify-between px-1">
                               <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Access Password</Label>
                               <button onClick={() => setShowPassword(!showPassword)} className="text-[9px] font-black text-primary/60 uppercase hover:text-primary transition-colors">
                                  {showPassword ? 'Hide Key' : 'Reveal Key'}
                               </button>
                            </div>
                            <div className="flex gap-2">
                               <div className="flex-1 h-14 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono font-bold text-foreground overflow-hidden shadow-inner relative">
                                  <span className={cn(showPassword ? "" : "blur-md select-none")}>
                                     {wifiData.password || '[NO PASSWORD]'}
                                  </span>
                               </div>
                               <Button 
                                onClick={() => handleCopy(wifiData.password || '', 'Password')}
                                variant="outline"
                                className={cn(
                                  "h-14 w-14 rounded-2xl bg-secondary border-border transition-all",
                                  isCopied === 'Password' && "bg-primary text-white border-primary"
                                )}
                               >
                                  {isCopied === 'Password' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                               </Button>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col justify-center gap-1">
                               <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Protocol</span>
                               <span className="text-[10px] font-black text-primary uppercase">{wifiData.type}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col justify-center gap-1">
                               <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Visibility</span>
                               <span className="text-[10px] font-black text-foreground uppercase">{wifiData.hidden ? 'HIDDEN' : 'BROADCAST'}</span>
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                         <Button onClick={() => handleCopy(`Network: ${wifiData.ssid}\nPassword: ${wifiData.password}\nSecurity: ${wifiData.type}`, 'Full Config')} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
                            <Copy className="w-5 h-5" /> Copy Full Config
                         </Button>
                      </div>
                   </div>
                 ) : rawText ? (
                   <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                      <div className="p-6 rounded-[2rem] bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-4">
                         <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 shrink-0" />
                         <p className="text-[10px] text-yellow-600/70 font-black uppercase leading-relaxed">
                            QR isolated, but no standard WiFi protocol detected. Raw matrix content displayed below.
                         </p>
                      </div>
                      <div className="p-8 bg-secondary rounded-[2rem] border border-border shadow-inner max-h-[200px] overflow-auto custom-scrollbar">
                         <p className="text-xs font-mono font-bold text-foreground/60 break-all leading-relaxed">{rawText}</p>
                      </div>
                      <Button onClick={() => handleCopy(rawText, 'Raw Data')} variant="outline" className="w-full h-14 rounded-2xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest">
                         <Copy className="w-4 h-4 mr-2" /> Copy Raw Content
                      </Button>
                   </div>
                 ) : null}
              </CardContent>
           </Card>
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
