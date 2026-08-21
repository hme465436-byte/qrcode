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
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { uploadToImgBB } from './actions';
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
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for anonymous uploads is 10MB." });
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
      const result = await uploadToImgBB(image);
      
      if (result.success && result.data) {
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
      } else {
        throw new Error(result.error);
      }
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
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Web Suite Pro
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Image to <span className="text-primary italic">Link Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade visual hosting. Upload imagery to the global ImgBB node and synthesize a complete multi-format shareable link matrix instantly.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="image-to-link" />
              {(image || links) && user && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      {!user && !authLoading ? (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in zoom-in duration-500">
           <Card className="glass-card border-border shadow-2xl p-12 sm:p-20 text-center flex flex-col items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl ring-1 ring-primary/20 relative z-10">
                 <Lock className="w-10 h-10" />
              </div>
              <div className="space-y-3 relative z-10">
                 <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Login Required</h2>
                 <p className="text-[10px] sm:text-xs text-foreground/40 font-black uppercase tracking-[0.4em] leading-relaxed">
                    You must be logged in to use the high-fidelity upload matrix.
                 </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
                <Button asChild className="h-16 flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                   <Link href="/login?redirect=/image-to-link">Sign In to Studio</Link>
                </Button>
                <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                   <Link href="/">Back to Tools</Link>
                </Button>
              </div>
           </Card>
        </div>
      ) : authLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Authenticating Protocol...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in duration-700">
          {/* Left Column: Intake */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                   <Upload className="w-5 h-5 text-primary" /> Inbound Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if(e.dataTransfer.files[0]) handleFileUpload({ target: { files: e.dataTransfer.files } } as any); }}
                  className={cn(
                    "relative h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer group/upload",
                    image && "border-solid border-primary/20",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {image ? (
                    <div className="w-full h-full p-4 flex items-center justify-center relative">
                      <img src={image} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl group-hover/upload:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
                         <RefreshCcw className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all mx-auto shadow-xl">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover/upload:text-primary transition-colors">Select Visual Payload</span>
                         <p className="text-[8px] text-foreground/20 font-bold uppercase">JPG, PNG, GIF, WebP (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>

                <Button 
                  onClick={executeUpload} 
                  disabled={isProcessing || !image}
                  className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Zap className="w-6 h-6 mr-3" />}
                  Execute Uplink
                </Button>

                {error && (
                  <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-3 animate-in shake duration-500">
                    <div className="flex items-center gap-3 text-destructive">
                       <AlertTriangle className="w-4 h-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Handshake Failed</h4>
                    </div>
                    <p className="text-[10px] font-bold text-destructive/80 leading-relaxed uppercase tracking-tighter">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All visual data is transmitted via secure server-side tunnels. We do not store or log your imagery on studio infrastructure.
                  </p>
                </div>
             </div>
          </div>

          {/* Right Column: Output & History */}
          <div className="lg:col-span-7 space-y-8 stagger-2">
             {/* Immediate Results Card */}
             {links && (
               <Card className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <CardHeader className="py-6 border-b border-emerald-500/10 bg-emerald-500/5 flex flex-row items-center justify-between shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-inner">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em]">Active Result Matrix</CardTitle>
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Uplink Verified
                     </Badge>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-12 space-y-8">
                      <div className="space-y-6">
                        {[
                          { label: 'Direct Link', val: links.direct, icon: LinkIcon },
                          { label: 'View Page', val: links.view, icon: ExternalLink },
                          { label: 'Markdown Code', val: links.markdown, icon: FileCode },
                          { label: 'HTML Snippet', val: links.html, icon: Code2 },
                          { label: 'BBCode Format', val: links.bbcode, icon: MessageSquare }
                        ].map((item) => (
                          <div key={item.label} className="space-y-2 group/row">
                             <div className="flex items-center justify-between px-1">
                                <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">{item.label}</Label>
                                {item.label === 'Direct Link' && (
                                  <button onClick={() => window.open(item.val, '_blank')} className="text-[8px] font-black text-primary uppercase hover:underline">Verify Signal</button>
                                )}
                             </div>
                             <div className="flex gap-2">
                                <div className="flex-1 h-14 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-[11px] font-bold text-foreground overflow-hidden shadow-inner group-hover/row:border-primary/20 transition-colors">
                                   <span className="truncate">{item.val}</span>
                                </div>
                                <Button 
                                  onClick={() => handleCopy(item.val, item.label)}
                                  variant="outline"
                                  className={cn(
                                    "h-14 w-14 rounded-2xl bg-secondary border-border shrink-0 transition-all",
                                    isCopied === item.label && "bg-primary text-white border-primary shadow-lg"
                                  )}
                                >
                                   {isCopied === item.label ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </Button>
                             </div>
                          </div>
                        ))}
                      </div>
                  </CardContent>
               </Card>
             )}

             {/* Archives Header */}
             <div className="flex items-center justify-between px-2 pt-4">
                <div className="flex items-center gap-3">
                   <History className="w-4 h-4 text-primary" />
                   <h3 className="text-xl font-headline font-black text-foreground/60 uppercase tracking-tight">Identity Archive</h3>
                </div>
                {history.length > 0 && (
                   <button 
                    onClick={() => { setHistory([]); localStorage.removeItem(`mykit_img_history_v3_${user?.uid}`); }} 
                    className="text-[9px] font-black text-foreground/20 hover:text-destructive uppercase transition-colors"
                  >
                    Purge All
                  </button>
                )}
             </div>

             {/* History Registry */}
             <div className="space-y-4">
                {history.length === 0 ? (
                  <Card className="glass-card border-border shadow-inner p-20 text-center flex flex-col items-center gap-4 opacity-10">
                     <Activity className="w-12 h-12 text-primary" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Signal Detection</p>
                  </Card>
                ) : (
                  history.map((item) => (
                    <Card key={item.id} className="glass-card border-border shadow-xl overflow-hidden group/row animate-in slide-in-from-bottom-2">
                       <div 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                       >
                          <div className="flex items-center gap-6 min-w-0">
                             <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                                <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                                   <Maximize2 className="w-4 h-4 text-white/60" />
                                </div>
                             </div>
                             <div className="min-w-0">
                                <p className="text-xs font-black text-foreground truncate uppercase">{item.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                   <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                   <span className="text-white/5 text-[8px]">•</span>
                                   <p className="text-[9px] font-bold text-primary uppercase">Matrix ID: {item.id}</p>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <button onClick={(e) => { e.stopPropagation(); removeFromHistory(item.id); }} className="p-2 text-foreground/10 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                             </button>
                             <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground/20 group-hover/row:text-primary transition-all">
                                {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                             </div>
                          </div>
                       </div>

                       {expandedId === item.id && (
                         <div className="p-6 pt-0 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 gap-6 pt-6">
                               {[
                                 { label: 'Direct', val: item.links.direct, icon: LinkIcon },
                                 { label: 'View', val: item.links.view, icon: ExternalLink },
                                 { label: 'Markdown', val: item.links.markdown, icon: FileCode },
                                 { label: 'HTML', val: item.links.html, icon: Code2 },
                                 { label: 'BBCode', val: item.links.bbcode, icon: MessageSquare }
                               ].map((sub) => (
                                 <div key={sub.label} className="space-y-2 group/sub">
                                    <div className="flex items-center justify-between px-1">
                                       <div className="flex items-center gap-2">
                                          <sub.icon className="w-3 h-3 text-primary/40" />
                                          <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">{sub.label} Protocol</span>
                                       </div>
                                       <button 
                                        onClick={() => handleCopy(sub.val, `hist-${item.id}-${sub.label}`)}
                                        className={cn(
                                          "text-[8px] font-black uppercase transition-all",
                                          isCopied === `hist-${item.id}-${sub.label}` ? "text-emerald-500" : "text-primary/60 hover:text-primary"
                                        )}
                                       >
                                          {isCopied === `hist-${item.id}-${sub.label}` ? 'Identity Copied' : 'Copy Snippet'}
                                       </button>
                                    </div>
                                    <div className="h-10 bg-black/40 border border-white/5 rounded-xl flex items-center px-4 font-mono text-[9px] font-bold text-foreground/60 overflow-hidden shadow-inner group-hover/sub:border-primary/20 transition-all">
                                       <span className="truncate">{sub.val}</span>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </Card>
                  ))
                )}
             </div>

             <div className="grid grid-cols-1 gap-6 pt-8">
                <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                   <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Maximize2 className="w-7 h-7" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">High Fidelity Integration</h4>
                     <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                       1:1 binary preservation ensures your visual assets retain original resolution and metadata during the cloud sync.
                     </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
