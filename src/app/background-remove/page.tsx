"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Eraser, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Loader2, 
  Zap, 
  Activity, 
  Settings2, 
  ShieldCheck, 
  KeyRound, 
  Unplug, 
  AlertTriangle, 
  RefreshCcw, 
  RotateCcw,
  Maximize2,
  ImageIcon,
  Save,
  ArrowRight,
  X,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useUser } from '@/firebase';
import { removeBackground, testRemoveBgKey } from './actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

export default function BackgroundRemovePage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  
  // Intake State
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  
  // Custom Node State
  const [showCustomNode, setShowCustomNode] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [isTestingNode, setIsTestingNode] = useState(false);
  const [activeNode, setActiveNode] = useState<{ key: string, label: string } | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // UI Meta
  const [showOriginal, setShowOriginal] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    if (user) {
      const savedNode = localStorage.getItem(`mykit_removebg_node_${user.uid}`);
      if (savedNode) {
        try {
          setActiveNode(JSON.parse(savedNode));
        } catch (e) {}
      }
    }
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit is 10MB." });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setLocalError(null);
        toast({ title: "Asset Buffered" });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const executeExtraction = async () => {
    if (!image) {
      toast({ variant: "destructive", title: "Protocol Failure", description: "Please select an image first." });
      return;
    }
    
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please sign in to process visuals." });
      return;
    }
    
    setIsProcessing(true);
    setLocalError(null);

    try {
      const response = await removeBackground(image, activeNode?.key);

      if (response.success && response.data) {
        setResult(response.data);
        toast({ title: "Extraction Success", description: "Background matrix neutralized." });
      } else {
        throw new Error(response.error || "Uplink restricted by remote node.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Protocol Failure.");
      toast({ variant: "destructive", title: "Handshake Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestAndConnect = async () => {
    if (!customKey.trim()) return;
    setIsTestingNode(true);
    setLocalError(null);

    try {
      const res = await testRemoveBgKey(customKey.trim());
      if (res.success) {
        const node = { 
          key: customKey.trim(), 
          label: 'Custom Node'
        };
        setActiveNode(node);
        localStorage.setItem(`mykit_removebg_node_${user?.uid}`, JSON.stringify(node));
        setShowCustomNode(false);
        setCustomKey('');
        toast({ title: "Host Node Active", description: `Credits remaining: ${res.credits}` });
      } else {
        setLocalError(res.error || "Handshake Failed");
        toast({ variant: "destructive", title: "Handshake Failed", description: res.error });
      }
    } catch (e) {
      setLocalError("Protocol Error: Discovery node unreachable.");
      toast({ variant: "destructive", title: "Protocol Error" });
    } finally {
      setIsTestingNode(false);
    }
  };

  const disconnectNode = () => {
    setActiveNode(null);
    localStorage.removeItem(`mykit_removebg_node_${user?.uid}`);
    setCustomKey('');
    toast({ title: "Default Node Restored" });
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.download = `sanitized_${Date.now()}.png`;
    link.href = result;
    link.click();
    toast({ title: "Master Exported" });
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Eraser className="w-3.5 h-3.5" /> Identity Protection Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
            Background <span className="text-primary italic">Remove</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional subject isolation. Neutralize backgrounds with 1:1 hardware fidelity using clinical neural extraction nodes.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="background-remove" />
           <Button 
            onClick={() => { setLocalError(null); setCustomKey(''); setShowCustomNode(true); }}
            variant="outline" 
            size="sm" 
            className={cn(
              "h-10 px-6 rounded-xl border-white/10 text-[9px] font-black uppercase tracking-widest transition-all shadow-lg",
              activeNode ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-secondary"
            )}
           >
              {activeNode ? <ShieldCheck className="w-3.5 h-3.5 mr-2" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
              {activeNode ? 'HOST ACTIVE' : 'HOST'}
           </Button>
           {(image || result) && (
              <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-white/10 bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
              </Button>
           )}
        </div>
      </div>

      {!user && !authLoading ? (
        <Card className="glass-card border-border shadow-2xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[2.5rem]">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
             <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight relative z-10">Authentication Required</h2>
          <Button asChild className="h-16 w-full max-w-md bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 relative z-10">
             <Link href="/login?redirect=/background-remove">Initialize Session</Link>
          </Button>
        </Card>
      ) : authLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Synchronizing Identity Node...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-in fade-in duration-1000">
          
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
            {showCustomNode && (
               <Card className="glass-card border-primary/40 bg-primary/[0.03] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                  <CardHeader className="py-6 border-b border-primary/10 flex flex-row items-center justify-between">
                     <div className="flex items-center gap-3">
                        <KeyRound className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Remove.bg Node Config</span>
                     </div>
                     <button onClick={() => setShowCustomNode(false)} className="text-primary/40 hover:text-primary"><X className="w-4 h-4" /></button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">API Key</Label>
                           <Input 
                            value={customKey}
                            onChange={e => setCustomKey(e.target.value)}
                            type="password"
                            placeholder="Enter your API key"
                            className="h-11 bg-background border-border text-xs font-mono"
                           />
                        </div>
                     </div>
                     <div className="flex flex-col gap-3">
                        <Button 
                          onClick={handleTestAndConnect}
                          disabled={isTestingNode || !customKey}
                          className="h-12 w-full bg-primary text-white font-black uppercase text-[10px] rounded-xl shadow-lg"
                        >
                           {isTestingNode ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                           Validate & Connect
                        </Button>
                        {activeNode && (
                          <Button 
                            variant="outline" 
                            onClick={() => setShowDisconnectConfirm(true)} 
                            className="h-10 text-[9px] font-black uppercase border-destructive/20 text-destructive bg-destructive/5"
                          >
                             <Unplug className="w-3.5 h-3.5 mr-2" /> Disconnect
                          </Button>
                        )}
                     </div>
                  </CardContent>
               </Card>
            )}

            <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                   <Upload className="w-5 h-5 text-primary" /> Visual Intake
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    image && "border-solid border-primary/20",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {image ? (
                    <div className="w-full h-full p-4 flex items-center justify-center relative">
                      <img src={image} alt="Preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-opacity" />
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary transition-all mx-auto shadow-xl">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Import Carrier Image</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/jpeg,image/png" onChange={handleFileUpload} className="hidden" />
                </div>

                <Button 
                  onClick={executeExtraction} 
                  disabled={isProcessing || !image}
                  className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                  Execute Extraction
                </Button>

                {error && (
                  <div className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/20 space-y-3 animate-in shake duration-500">
                    <div className="flex items-center gap-3 text-destructive">
                       <AlertTriangle className="w-4 h-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Failure</h4>
                    </div>
                    <p className="text-[10px] font-bold text-destructive/80 leading-relaxed uppercase">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Matrix</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        Subject isolation is performed via secure server-side tunnels. Your visual data is definitively purged after extraction.
                      </p>
                    </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
             <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/40">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                         <Eye className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Visualizer</CardTitle>
                   </div>
                   <div className="flex items-center gap-4">
                      {result && (
                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border">
                           <span className="text-[8px] font-black uppercase text-foreground/40">Compare A/B</span>
                           <Switch checked={showOriginal} onCheckedChange={setShowOriginal} className="scale-50 h-4 w-8" />
                        </div>
                      )}
                   </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-checkered">
                   {!image && !isProcessing ? (
                     <div className="flex flex-col items-center justify-center opacity-10 gap-6">
                        <ImageIcon className="w-20 h-20 text-primary" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Visual Input</p>
                     </div>
                   ) : isProcessing ? (
                     <div className="flex flex-col items-center gap-8 py-24">
                        <div className="relative">
                           <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                           <Eraser className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Executing Neural Extraction...</p>
                     </div>
                   ) : (
                     <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative max-w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                           {showOriginal ? (
                             <div className="relative group/compare w-full h-full">
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
                                <img src={result || image!} alt="Processed" className="max-h-[500px] w-auto object-contain" />
                                <input 
                                 type="range" 
                                 min="0" max="100" 
                                 value={compareSplit} 
                                 onChange={(e) => setCompareSplit(parseInt(e.target.value))}
                                 className="absolute bottom-0 left-0 w-full z-20 opacity-0 cursor-ew-resize h-full"
                                />
                             </div>
                           ) : (
                             <img src={result || image!} alt="Result" className="max-h-[500px] w-auto object-contain transition-all" />
                           )}
                        </div>
                     </div>
                   )}
                </CardContent>

                {result && (
                  <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[11px] font-black uppercase text-foreground leading-none">Extraction Complete</p>
                           <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Master PNG Ready</p>
                        </div>
                     </div>
                     <Button onClick={handleDownload} className="h-16 px-12 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-2xl active:scale-95 transition-all">
                        <Download className="w-6 h-6 mr-1" /> Save Transparent Master
                     </Button>
                  </div>
                )}
             </Card>
          </div>
        </div>
      )}

      <AlertDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <Unplug className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">
               Disconnect Host
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
              Are you sure you want to disconnect your private background removal node?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                disconnectNode();
                setShowDisconnectConfirm(false);
              }}
              className="h-12 flex-1 rounded-xl bg-destructive text-destructive-foreground font-black uppercase text-[9px] tracking-widest shadow-xl shadow-destructive/20"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
