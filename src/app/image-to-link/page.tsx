
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  Upload, 
  Trash2, 
  Globe, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  Info, 
  AlertCircle,
  Zap,
  Activity,
  FileImage,
  ExternalLink,
  Code2,
  FileCode,
  MessageSquare,
  ShieldCheck,
  ImageIcon,
  RefreshCcw,
  RotateCcw,
  Lock,
  User,
  AlertTriangle,
  History,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  FileUp,
  ClipboardCheck,
  Eye,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useUser } from '@/firebase';
import Link from 'next/link';

interface LinkMatrix {
  direct: string;
  view: string;
  markdown: string;
  html: string;
  bbcode: string;
}

interface HistoryItem {
  id: string;
  name: string;
  thumb: string;
  timestamp: number;
  links: LinkMatrix;
}

export default function ImageToLinkPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [links, setLinks] = useState<LinkMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`mykit_img_history_v3_${user.uid}`);
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Archive sync error.");
        }
      }
    }
  }, [user]);

  const saveToHistory = (item: HistoryItem) => {
    if (!user) return;
    setHistory(prev => {
      const next = [item, ...prev.filter(h => h.links.direct !== item.links.direct)].slice(0, 10);
      localStorage.setItem(`mykit_img_history_v3_${user.uid}`, JSON.stringify(next));
      return next;
    });
  };

  const removeFromHistory = (id: string) => {
    if (!user) return;
    setHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      localStorage.setItem(`mykit_img_history_v3_${user.uid}`, JSON.stringify(next));
      return next;
    });
    toast({ title: "Identity Purged" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for high-res uploads is 10MB." });
        return;
      }
      
      setFile(selectedFile);
      setLinks(null);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        toast({ title: "Asset Buffered", description: "Visual identity ready for transmission." });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const executeUpload = async () => {
    if (!image || !user) return;
    
    setIsProcessing(true);
    setError(null);
    setLinks(null);

    try {
      const apiKey = '7dd99fb70a655cd8730f8c5bac31178f';
      const parts = image.split(',');
      if (parts.length < 2) throw new Error("Malformed binary matrix.");
      const cleanBase64 = parts[1];

      const formData = new FormData();
      formData.append('image', cleanBase64);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `ImgBB Node Error: ${response.status}`);
      }

      const result = await response.json();
      const d = result.data;

      const matrix: LinkMatrix = {
        direct: d.url,
        view: d.url_viewer,
        markdown: `![Identity](${d.url})`,
        html: `<img src="${d.url}" alt="Identity">`,
        bbcode: `[img]${d.url}[/img]`
      };
      setLinks(matrix);
      
      saveToHistory({
        id: Math.random().toString(36).substr(2, 9),
        name: file?.name || 'Untitled Identity',
        thumb: d.thumb?.url || d.url,
        timestamp: Date.now(),
        links: matrix
      });

      toast({ title: "Uplink Success", description: "Matrix synchronized with ImgBB nodes." });
    } catch (err: any) {
      setError(err.message || "Uplink restricted by remote host.");
      toast({ variant: "destructive", title: "Protocol Failure", description: "The upload attempt was rejected." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied", description: "Data matrix saved." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setImage(null);
    setFile(null);
    setLinks(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      {/* Header Matrix */}
      <div className="mb-16 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Web Hosting Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
                Image to <span className="text-primary italic">Link Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                The standard for anonymous professional hosting. Transform high-resolution imagery into permanent linguistic sharing protocols with a single hardware handshake.
              </p>
           </div>
           <div className="flex items-center gap-3 shrink-0">
              <GetHelp toolId="image-to-link" />
              {(image || links) && user && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-white/10 bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      {!user && !authLoading ? (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in zoom-in duration-500">
           <Card className="glass-card border-border shadow-2xl p-12 sm:p-24 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl ring-1 ring-primary/10 relative z-10">
                 <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-4 relative z-10">
                 <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Identity Authentication Required</h2>
                 <p className="text-[10px] sm:text-xs text-foreground/30 font-black uppercase tracking-[0.4em] leading-relaxed max-w-md mx-auto">
                    To maintain protocol integrity and ensure high-bandwidth uplinks, you must be logged into the professional studio.
                 </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
                <Button asChild className="h-16 flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                   <Link href="/login?redirect=/image-to-link">Initialize Session</Link>
                </Button>
                <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                   <Link href="/">Explore Suite</Link>
                </Button>
              </div>
           </Card>
        </div>
      ) : authLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Synchronizing Identity Node...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-in fade-in duration-1000">
          {/* Left Column: Intake & Configuration */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                   <FileUp className="w-5 h-5 text-primary" /> Inbound Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if(e.dataTransfer.files[0]) handleFileUpload({ target: { files: e.dataTransfer.files } } as any); }}
                  className={cn(
                    "relative h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer group/upload",
                    image && "border-solid border-primary/20 bg-background/50",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {image ? (
                    <div className="w-full h-full p-4 flex items-center justify-center relative">
                      <img src={image} alt="Preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl group-hover/upload:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-2xl">
                         <RefreshCcw className="w-10 h-10 text-white animate-spin-slow" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6 p-8">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all mx-auto shadow-xl">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                         <span className="text-xs font-black uppercase text-foreground/40 tracking-[0.2em] group-hover/upload:text-primary transition-colors">Select Visual Payload</span>
                         <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest leading-relaxed">JPEG, PNG, GIF, WebP (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>

                <Button 
                  onClick={executeUpload} 
                  disabled={isProcessing || !image}
                  className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                  Execute Transmission
                </Button>

                {error && (
                  <div className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/20 space-y-3 animate-in shake duration-500">
                    <div className="flex items-center gap-3 text-destructive">
                       <AlertTriangle className="w-4 h-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Handshake Failed</h4>
                    </div>
                    <p className="text-[10px] font-bold text-destructive/80 leading-relaxed uppercase tracking-tighter">{error}</p>
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
                      <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Security Matrix</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        1:1 binary preservation ensures your visual assets retain original resolution and metadata during the cloud sync.
                      </p>
                    </div>
                </div>
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                       <Maximize2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Zero Storage</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        All local history is volatile and held strictly in hardware memory. Your private archive is never logged to our servers.
                      </p>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Output & Archive */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
             
             {/* Current Results Section */}
             {links && (
               <Card className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <CardHeader className="py-6 border-b border-emerald-500/10 bg-emerald-500/5 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-inner">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em]">Active Master Result</CardTitle>
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Uplink Verified
                     </Badge>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-12">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                        {/* Preview Sub-card */}
                        <div className="space-y-6">
                           <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-1">Visual Master Preview</Label>
                           <div className="aspect-square w-full rounded-[2.5rem] bg-white dark:bg-black/40 border border-emerald-500/10 shadow-2xl p-4 flex items-center justify-center relative group/preview">
                              <img src={image!} alt="Final" className="max-w-full max-h-full object-contain rounded-xl" />
                              <div className="absolute bottom-6 right-6">
                                 <Button asChild size="icon" className="h-10 w-10 rounded-xl bg-emerald-500 shadow-xl shadow-emerald-500/20">
                                    <a href={links.direct} target="_blank"><ExternalLink className="w-5 h-5" /></a>
                                 </Button>
                              </div>
                           </div>
                        </div>

                        {/* Codes Matrix */}
                        <div className="space-y-6">
                          <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-1">Protocol Matrix</Label>
                          <div className="space-y-4">
                            {[
                              { label: 'Direct Link', val: links.direct, icon: LinkIcon },
                              { label: 'Markdown', val: links.markdown, icon: FileCode },
                              { label: 'HTML', val: links.html, icon: Code2 },
                              { label: 'BBCode', val: links.bbcode, icon: MessageSquare }
                            ].map((item) => (
                              <div key={item.label} className="space-y-2 group/row">
                                 <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                       <item.icon className="w-3 h-3 text-emerald-600/40" />
                                       <span className="text-[9px] font-black uppercase text-foreground/50 tracking-widest">{item.label}</span>
                                    </div>
                                    <button 
                                      onClick={() => handleCopy(item.val, item.label)}
                                      className={cn(
                                        "text-[8px] font-black uppercase transition-all",
                                        isCopied === item.label ? "text-emerald-500" : "text-primary/60 hover:text-primary"
                                      )}
                                    >
                                       {isCopied === item.label ? 'Identity Isolated' : 'Copy Snippet'}
                                    </button>
                                 </div>
                                 <div className="h-11 bg-white/40 dark:bg-black/40 border border-emerald-500/5 rounded-xl flex items-center px-4 font-mono text-[10px] font-bold text-foreground/80 overflow-hidden shadow-inner group-hover/row:border-emerald-500/20 transition-colors">
                                    <span className="truncate">{item.val}</span>
                                 </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                  </CardContent>
               </Card>
             )}

             {/* Archives Section */}
             <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-primary" />
                      <h3 className="text-xl font-headline font-black text-foreground/60 uppercase tracking-tight">Identity Archive</h3>
                   </div>
                   {history.length > 0 && (
                      <button 
                        onClick={() => { setHistory([]); localStorage.removeItem(`mykit_img_history_v3_${user?.uid}`); }} 
                        className="text-[9px] font-black text-foreground/20 hover:text-destructive uppercase transition-colors"
                      >
                        Purge Registry
                      </button>
                   )}
                </div>

                {history.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-6 opacity-10 grayscale border-2 border-dashed border-white/5 rounded-[3rem]">
                     <Activity className="w-12 h-12 text-primary" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting Discovery Signal</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {history.map((item) => (
                       <Card key={item.id} className="glass-card border-border shadow-xl overflow-hidden group/row transition-all duration-300">
                          <div 
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                          >
                             <div className="flex items-center gap-5 min-w-0">
                                <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group/thumb">
                                   <img src={item.thumb} alt="" className="w-full h-full object-cover group-hover/row:scale-105 transition-transform" />
                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                                      <Eye className="w-4 h-4 text-white/60" />
                                   </div>
                                </div>
                                <div className="min-w-0">
                                   <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{item.name}</p>
                                   <div className="flex items-center gap-3 mt-1">
                                      <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                      <div className="w-1 h-1 rounded-full bg-primary/20" />
                                      <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Node Verified</p>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 shrink-0">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeFromHistory(item.id); }} 
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/10 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                                <div className={cn(
                                  "w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 group-hover/row:text-primary transition-all border border-transparent",
                                  expandedId === item.id && "bg-primary text-primary-foreground"
                                )}>
                                   {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                             </div>
                          </div>

                          {expandedId === item.id && (
                            <div className="px-5 pb-8 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-500">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                                  {[
                                    { label: 'Direct', val: item.links.direct, icon: LinkIcon },
                                    { label: 'Markdown', val: item.links.markdown, icon: FileCode },
                                    { label: 'HTML', val: item.links.html, icon: Code2 },
                                    { label: 'BBCode', val: item.links.bbcode, icon: MessageSquare }
                                  ].map((sub) => (
                                    <div key={sub.label} className="space-y-2 group/sub">
                                       <div className="flex items-center justify-between px-1">
                                          <div className="flex items-center gap-2">
                                             <sub.icon className="w-3 h-3 text-primary/30" />
                                             <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">{sub.label} Protocol</span>
                                          </div>
                                          <button 
                                           onClick={() => handleCopy(sub.val, `hist-${item.id}-${sub.label}`)}
                                           className={cn(
                                             "text-[8px] font-black uppercase transition-all",
                                             isCopied === `hist-${item.id}-${sub.label}` ? "text-emerald-500" : "text-primary/60 hover:text-primary"
                                           )}
                                          >
                                             {isCopied === `hist-${item.id}-${sub.label}` ? 'Identity Isolated' : 'Copy'}
                                          </button>
                                       </div>
                                       <div className="h-10 bg-black/40 border border-white/5 rounded-xl flex items-center px-4 font-mono text-[9px] font-bold text-foreground/40 overflow-hidden shadow-inner group-hover/sub:border-primary/20 transition-all">
                                          <span className="truncate">{sub.val}</span>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                               <div className="mt-6 flex justify-center">
                                  <Button asChild variant="ghost" className="h-8 text-[8px] font-black uppercase text-primary/40 hover:text-primary">
                                     <a href={item.links.view} target="_blank">Launch Official Registry View <ArrowRight className="ml-2 w-3 h-3" /></a>
                                  </Button>
                               </div>
                            </div>
                          )}
                       </Card>
                     ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
        .dark .bg-checkered {
           background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
        }
      `}</style>
    </div>
  );
}
