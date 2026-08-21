"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  AlertCircle,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCcw,
  History,
  FileUp,
  X,
  ChevronDown,
  ChevronUp,
  Database,
  MessageCircle,
  Paperclip,
  Lock,
  ArrowLeft,
  Cloud
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
import { uploadToTelegram } from './actions';

interface TelegramLinkMatrix {
  fileId: string;
  messageId: number;
  name: string;
  size: number;
  mime: string;
}

interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  data: TelegramLinkMatrix;
}

export default function TelegramFileHostPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TelegramLinkMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`mykit_tg_history_v1_${user.uid}`);
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
      const next = [item, ...prev.filter(h => h.data.fileId !== item.data.fileId)].slice(0, 10);
      localStorage.setItem(`mykit_tg_history_v1_${user.uid}`, JSON.stringify(next));
      return next;
    });
  };

  const removeFromHistory = (id: string) => {
    if (!user) return;
    setHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      localStorage.setItem(`mykit_tg_history_v1_${user.uid}`, JSON.stringify(next));
      return next;
    });
    toast({ title: "Record Purged" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for Telegram Bot API is 20MB." });
        return;
      }
      setFile(selectedFile);
      setResult(null);
      setError(null);
      toast({ title: "Asset Buffered", description: "Binary matrix ready for transmission." });
    }
  };

  const executeUpload = async () => {
    if (!file || !user) return;
    
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await uploadToTelegram(formData);

      if (response.success && response.data) {
        setResult(response.data);
        
        saveToHistory({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          timestamp: Date.now(),
          data: response.data
        });

        toast({ title: "Uplink Success", description: "Asset archived in Telegram matrix." });
      } else {
        throw new Error(response.error || "Uplink restricted.");
      }
    } catch (err: any) {
      setError(err.message || "Uplink failure.");
      toast({ variant: "destructive", title: "Protocol Failure" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MessageCircle className="w-3.5 h-3.5" /> Telegram Protocol
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
                Telegram <span className="text-primary italic">File Host</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Securely archive any file type via the Telegram Bot API. Transform binaries into permanent identifiers stored within the global Telegram distributed network.
              </p>
           </div>
           <div className="flex items-center gap-3 shrink-0">
              <GetHelp toolId="telegram-file-host" />
              {(file || result) && user && (
                <Button variant="outline" size="sm" onClick={() => { setFile(null); setResult(null); setError(null); }} className="h-10 px-4 rounded-xl border-white/10 bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      {!user && !authLoading ? (
        <Card className="glass-card border-border shadow-2xl p-12 sm:p-24 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl ring-1 ring-primary/10 relative z-10">
             <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-4 relative z-10">
             <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Identity Required</h2>
             <p className="text-[10px] sm:text-xs text-foreground/30 font-black uppercase tracking-[0.4em] leading-relaxed max-w-md mx-auto">
                Secure file hosting requires a professional session to manage and protect your archival registry.
             </p>
          </div>
          <Button asChild className="h-16 w-full max-w-md bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all relative z-10">
             <Link href="/login?redirect=/telegram-file-host">Initialize Session</Link>
          </Button>
        </Card>
      ) : authLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Syncing Registry Node...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
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
                    "relative h-56 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer group/upload",
                    file && "border-solid border-primary/20 bg-background/50",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {file ? (
                    <div className="text-center p-8 space-y-4">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner transition-transform group-hover/upload:scale-110">
                          <Paperclip className="w-8 h-8" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(file.size)}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary transition-all mx-auto shadow-xl">
                        <FileUp className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] group-hover/upload:text-primary transition-colors">Select Any Binary Asset</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>

                <Button 
                  onClick={executeUpload} 
                  disabled={isProcessing || !file}
                  className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                  Archive to Telegram
                </Button>

                {error && (
                  <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-3 animate-in shake">
                    <div className="flex items-center gap-3 text-destructive">
                       <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Handshake Failed</h4>
                    </div>
                    <p className="text-[10px] font-bold text-destructive/80 leading-relaxed uppercase tracking-tighter">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Archival Fidelity</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                    1:1 binary preservation ensures your assets remain identical to the source. No compression or metadata stripping is applied during the archival cycle.
                  </p>
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000">
             {result && (
                <Card className="glass-card border-primary/20 bg-primary/[0.02] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
                   <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                   <CardHeader className="py-6 border-b border-primary/10 bg-primary/5 px-6 sm:px-10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-inner">
                               <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Archival Result</CardTitle>
                         </div>
                         <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">Verified Upload</Badge>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8 sm:p-12 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border space-y-4">
                            <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Metadata Profile</Label>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span className="text-[9px] font-black text-foreground/40 uppercase">Filename</span>
                                  <span className="text-[11px] font-bold text-foreground truncate max-w-[150px] uppercase">{result.name}</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span className="text-[9px] font-black text-foreground/40 uppercase">Binary Volume</span>
                                  <span className="text-[11px] font-mono font-bold text-primary">{formatSize(result.size)}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-black text-foreground/40 uppercase">MIME Standard</span>
                                  <span className="text-[11px] font-bold text-foreground uppercase">{result.mime.split('/')[1] || 'Binary'}</span>
                               </div>
                            </div>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border space-y-4">
                            <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Linguistic Protocol (File ID)</Label>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                               <p className="text-[10px] font-mono font-bold text-primary break-all leading-relaxed">{result.fileId}</p>
                            </div>
                            <Button onClick={() => handleCopy(result.fileId, 'fileId')} variant="outline" className="w-full h-11 border-primary/20 bg-primary/5 text-primary font-black uppercase text-[9px] tracking-widest">
                               {isCopied === 'fileId' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                               Copy Protocol ID
                            </Button>
                         </div>
                      </div>

                      <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group/share">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover/share:opacity-100 transition-opacity" />
                         <div className="flex items-center gap-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                               <MessageCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Access Signal</h4>
                               <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Message ID: #{result.messageId} Registered</p>
                            </div>
                         </div>
                         <div className="flex gap-3 relative z-10 w-full sm:w-auto">
                            <Button onClick={() => handleCopy(`File: ${result.name}\nID: ${result.fileId}`, 'full')} className="h-14 px-8 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90">
                               {isCopied === 'full' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                               Share Info
                            </Button>
                         </div>
                      </div>
                   </CardContent>
                </Card>
             )}

             {/* History Registry */}
             <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-primary" />
                      <h3 className="text-xl font-headline font-black uppercase text-foreground/60 tracking-tight">Archival Registry</h3>
                   </div>
                   {history.length > 0 && (
                      <button onClick={() => { setHistory([]); localStorage.removeItem(`mykit_tg_history_v1_${user?.uid}`); }} className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors">Purge Registry</button>
                   )}
                </div>

                {history.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-6 opacity-10 grayscale border-2 border-dashed border-white/5 rounded-[3rem]">
                     <Activity className="w-12 h-12 text-primary" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4em]">Zero Discovery Signals</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {history.map((item) => (
                       <Card key={item.id} className="glass-card border-border shadow-xl overflow-hidden group/row transition-all duration-300">
                          <div 
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                          >
                             <div className="flex items-center gap-5 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 shadow-inner group-hover/row:border-primary/40 transition-colors">
                                   <Database className="w-6 h-6 text-primary/40 group-hover/row:text-primary transition-colors" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{item.name}</p>
                                   <div className="flex items-center gap-3 mt-1">
                                      <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                      <div className="w-1 h-1 rounded-full bg-primary/20" />
                                      <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{formatSize(item.data.size)}</p>
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
                                  "w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 group-hover/row:text-primary transition-all",
                                  expandedId === item.id && "bg-primary text-primary-foreground"
                                )}>
                                   {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                             </div>
                          </div>

                          {expandedId === item.id && (
                            <div className="px-5 pb-8 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-500">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                                  <div className="space-y-2">
                                     <div className="flex items-center justify-between px-1">
                                        <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Protocol ID</span>
                                        <button onClick={() => handleCopy(item.data.fileId, `hist-${item.id}`)} className="text-[8px] font-black uppercase text-primary/60 hover:text-primary transition-all">
                                           {isCopied === `hist-${item.id}` ? 'Isolated' : 'Copy'}
                                        </button>
                                     </div>
                                     <div className="h-10 bg-black/40 border border-white/5 rounded-xl flex items-center px-4 font-mono text-[9px] font-bold text-foreground/40 overflow-hidden shadow-inner">
                                        <span className="truncate">{item.data.fileId}</span>
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <div className="flex items-center justify-between px-1">
                                        <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Message ID</span>
                                     </div>
                                     <div className="h-10 bg-black/40 border border-white/5 rounded-xl flex items-center px-4 font-mono text-[10px] font-bold text-primary overflow-hidden shadow-inner">
                                        #{item.data.messageId}
                                     </div>
                                  </div>
                               </div>
                            </div>
                          )}
                       </Card>
                     ))}
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-4 group">
                   <Activity className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Signal Trace</h4>
                      <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">Utilizing secure server-side uplinks to bypass standard browser-CORS restrictions on API handshakes.</p>
                   </div>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-4 group">
                   <Cloud className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Distributed Hosting</h4>
                      <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">Files are stored across Telegram's global data matrix, ensuring high availability and permanent archival.</p>
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
      `}</style>
    </div>
  );
}
