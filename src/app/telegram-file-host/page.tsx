"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  AlertCircle,
  Zap,
  Activity,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  History,
  FileUp,
  X,
  ChevronDown,
  ChevronUp,
  Database,
  MessageCircle,
  Paperclip,
  Lock,
  Cloud,
  Trash2,
  FileImage,
  FileAudio,
  FileVideo,
  FileArchive,
  FileText,
  ExternalLink,
  Settings2,
  Check,
  Download,
  Link as LinkIcon,
  Search,
  Star,
  Edit3,
  Share2,
  BarChart3,
  CheckSquare,
  Square,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { uploadToTelegram, getDownloadProtocol } from './actions';
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
  customName?: string;
  isFavorite?: boolean;
  timestamp: number;
  data: TelegramLinkMatrix;
}

type FilterType = 'all' | 'image' | 'audio' | 'video' | 'pdf' | 'zip';

/**
 * Global utility for bitstream volume formatting.
 */
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function FILEHOSTPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  
  // Intake State
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<TelegramLinkMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Registry Management State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // UI Meta
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`mykit_tg_history_v2_${user.uid}`);
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Archive sync error.");
        }
      }
    }
  }, [user]);

  const saveHistoryToDisk = (next: HistoryItem[]) => {
    if (!user) return;
    setHistory(next);
    localStorage.setItem(`mykit_tg_history_v2_${user.uid}`, JSON.stringify(next));
  };

  // --- Filtered & Sorted Logic ---
  const processedHistory = useMemo(() => {
    return history
      .filter(item => {
        const matchesSearch = (item.customName || item.name).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || item.data.mime.includes(filterType);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return b.timestamp - a.timestamp;
      });
  }, [history, searchQuery, filterType]);

  const storageStats = useMemo(() => {
    const totalSize = history.reduce((acc, curr) => acc + curr.data.size, 0);
    return {
      count: history.length,
      size: totalSize
    };
  }, [history]);

  // --- Handlers ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for cloud node is 20MB." });
        return;
      }
      setFile(selectedFile);
      setResult(null);
      setError(null);
      toast({ title: "Asset Buffered" });
    }
  };

  const executeUpload = async () => {
    if (!file || !user) return;
    
    setIsProcessing(true);
    setUploadProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 150);

    try {
      const formData = new FormData();
      formData.append('document', file);
      const response = await uploadToTelegram(formData);

      clearInterval(interval);
      setUploadProgress(100);

      if (response.success && response.data) {
        setResult(response.data);
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          timestamp: Date.now(),
          data: response.data
        };
        saveHistoryToDisk([newItem, ...history].slice(0, 50));
        toast({ title: "Uplink Success" });
      } else {
        throw new Error(response.error || "Uplink restricted.");
      }
    } catch (err: any) {
      setError(err.message || "Uplink failure.");
      toast({ variant: "destructive", title: "Protocol Failure" });
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  const handleGenerateLink = async (fileId: string, historyId: string) => {
    setGeneratingIds(prev => new Set(prev).add(historyId));
    try {
      const response = await getDownloadProtocol(fileId);
      if (response.success && response.url) {
        const fullUrl = window.location.origin + response.url;
        setGeneratedUrls(prev => ({ ...prev, [historyId]: fullUrl }));
      } else {
        throw new Error(response.error || "Uplink Failed");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Link Generation Failed" });
    } finally {
      setGeneratingIds(prev => { const n = new Set(prev); n.delete(historyId); return n; });
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedIds.size === 0) return;
    toast({ title: "Batch Processing" });
    for (const id of Array.from(selectedIds)) {
      const item = history.find(h => h.id === id);
      if (item && !generatedUrls[id]) {
        await handleGenerateLink(item.data.fileId, id);
      }
    }
  };

  const toggleFavorite = (id: string) => {
    saveHistoryToDisk(history.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h));
    toast({ title: "Registry Updated" });
  };

  const startRename = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditValue(item.customName || item.name);
  };

  const saveRename = () => {
    if (!editingId) return;
    saveHistoryToDisk(history.map(h => h.id === editingId ? { ...h, customName: editValue } : h));
    setEditingId(null);
    toast({ title: "Identity Renamed" });
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleShare = (url: string, platform: 'wa' | 'tg') => {
    const text = `I sent you some files: ${url}`;
    const encoded = encodeURIComponent(text);
    if (platform === 'wa') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    } else {
      window.open(`https://t.me/share/url?url=${url}&text=${encoded}`, '_blank');
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return <FileImage className="w-5 h-5 text-emerald-500" />;
    if (mime.includes('audio')) return <FileAudio className="w-5 h-5 text-amber-500" />;
    if (mime.includes('video')) return <FileVideo className="w-5 h-5 text-rose-500" />;
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mime.includes('zip') || mime.includes('archive')) return <FileArchive className="w-5 h-5 text-indigo-500" />;
    return <FileText className="w-5 h-5 text-primary/40" />;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <MessageCircle className="w-3.5 h-3.5" /> Cloud Protocol Pro
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
            FILE <span className="text-primary italic">HOST</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="file-host" />
           {(file || result) && user && (
                <Button variant="outline" size="sm" onClick={() => { setFile(null); setResult(null); setError(null); }} className="h-10 px-4 rounded-xl border-white/10 bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
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
             <Link href="/login?redirect=/telegram-file-host">Initialize Session</Link>
          </Button>
        </Card>
      ) : authLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Synchronizing Identity Node...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Intake Section */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
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
                  className={cn(
                    "relative h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer group/upload",
                    file && "border-solid border-primary/20 bg-background/50",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {file ? (
                    <div className="text-center p-8 space-y-4">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
                          <Paperclip className="w-8 h-8" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase">{formatSize(file.size)}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary transition-all mx-auto shadow-xl">
                        <FileUp className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Select Binary Asset</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>

                <div className="space-y-6">
                  {isProcessing && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                          <span>Transmitting...</span>
                          <span>{uploadProgress}%</span>
                       </div>
                       <Progress value={uploadProgress} className="h-1" />
                    </div>
                  )}
                  <Button 
                    onClick={executeUpload} 
                    disabled={isProcessing || !file}
                    className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Execute Uplink
                  </Button>
                </div>

                {error && (
                  <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-3 animate-in shake duration-500">
                    <div className="flex items-center gap-3 text-destructive">
                       <AlertTriangle className="w-4 h-4" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Handshake Failed</h4>
                    </div>
                    <p className="text-[10px] font-bold text-destructive/80 leading-relaxed uppercase tracking-tighter">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-border shadow-xl">
               <CardHeader className="py-4 border-b border-white/5 bg-secondary/30">
                  <CardTitle className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] flex items-center gap-3">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" /> Matrix Analytics
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Total Assets</p>
                     <p className="text-xl font-headline font-bold text-foreground">{storageStats.count}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Volume Sum</p>
                     <p className="text-xl font-headline font-bold text-primary">{formatSize(storageStats.size)}</p>
                  </div>
               </CardContent>
            </Card>

            <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:bg-secondary/80 transition-all">
                <Cloud className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                   <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Distributed Hosting</h4>
                   <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Files are stored across a global data matrix, ensuring high availability and permanent archival.</p>
                </div>
            </div>
          </div>

          {/* RIGHT: Registry Section */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-1">
             
             {/* Registry Controls */}
             <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                   <History className="w-5 h-5 text-primary" />
                   <h3 className="text-xl font-headline font-black uppercase text-foreground/60 tracking-tight">Archival Registry</h3>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20" />
                      <Input 
                        placeholder="Search matrix..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="h-10 pl-9 bg-secondary/50 border-border rounded-xl text-[10px] font-bold uppercase"
                      />
                   </div>
                   <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                      <SelectTrigger className="h-10 w-32 bg-secondary/50 border-border rounded-xl text-[9px] font-black uppercase">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                         <SelectItem value="all" className="text-[9px] font-black uppercase">All Types</SelectItem>
                         <SelectItem value="image" className="text-[9px] font-black uppercase">Images</SelectItem>
                         <SelectItem value="audio" className="text-[9px] font-black uppercase">Audio</SelectItem>
                         <SelectItem value="video" className="text-[9px] font-black uppercase">Video</SelectItem>
                         <SelectItem value="pdf" className="text-[9px] font-black uppercase">PDF Docs</SelectItem>
                         <SelectItem value="zip" className="text-[9px] font-black uppercase">ZIP Files</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>

             {/* Bulk Actions Bar */}
             {selectedIds.size > 0 && (
               <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black uppercase text-primary tracking-widest">{selectedIds.size} Selected</span>
                     <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-[9px] font-black uppercase text-foreground/40 h-8">Clear</Button>
                  </div>
                  <div className="flex gap-2">
                     <Button onClick={handleBulkGenerate} className="h-9 px-4 bg-primary text-white text-[9px] font-black uppercase rounded-lg shadow-lg">
                        Generate Links
                     </Button>
                     <Button onClick={() => setDeleteTarget('batch')} variant="outline" className="h-9 w-9 bg-white/5 border-white/10 text-red-500 rounded-lg p-0">
                        <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
             )}

             {processedHistory.length === 0 ? (
               <div className="p-24 text-center flex flex-col items-center gap-6 opacity-10 border-2 border-dashed border-white/5 rounded-[3rem]">
                  <Activity className="w-16 h-16 text-primary" />
                  <p className="text-[13px] font-black uppercase tracking-[0.4em]">Zero Discovery Signals</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                  {processedHistory.map((item) => (
                    <Card key={item.id} className={cn(
                      "glass-card border-border shadow-xl overflow-hidden group/row transition-all duration-300",
                      selectedIds.has(item.id) ? "border-primary/40 bg-primary/[0.02]" : "",
                      item.isFavorite && "border-primary/10"
                    )}>
                       <div 
                         onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                         className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                       >
                          <div className="flex items-center gap-5 min-w-0">
                             <div 
                               onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                               className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 text-foreground/10 hover:text-primary transition-all"
                             >
                                {selectedIds.has(item.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                             </div>
                             <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 shadow-inner group-hover/row:border-primary/40 transition-colors">
                                {getFileIcon(item.data.mime)}
                             </div>
                             <div className="min-w-0">
                                {editingId === item.id ? (
                                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                     <Input 
                                      value={editValue} 
                                      onChange={e => setEditValue(e.target.value)} 
                                      className="h-8 w-48 text-[11px] font-bold bg-background border-primary/40"
                                      autoFocus
                                      onKeyDown={e => e.key === 'Enter' && saveRename()}
                                     />
                                     <button onClick={saveRename} className="p-1.5 text-primary bg-primary/10 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                     <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">
                                        {item.customName || item.name}
                                     </p>
                                     {item.isFavorite && <Star className="w-3 h-3 text-primary fill-current" />}
                                  </div>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                   <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                   <div className="w-1 h-1 rounded-full bg-primary/20" />
                                   <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{formatSize(item.data.size)}</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                             <button 
                               onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                               className={cn("p-2 rounded-lg transition-all", item.isFavorite ? "text-primary bg-primary/10" : "text-foreground/10 hover:text-primary")}
                             >
                                <Star className={cn("w-4 h-4", item.isFavorite && "fill-current")} />
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); startRename(item); }} className="p-2 text-foreground/10 hover:text-primary transition-all">
                                <Edit3 className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id); }} 
                               className="p-2 text-foreground/10 hover:text-red-500 transition-all"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                             <div className={cn(
                               "w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 group-hover/row:text-primary transition-all",
                               expandedId === item.id && "bg-primary text-primary-foreground shadow-lg"
                             )}>
                                {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                             </div>
                          </div>
                       </div>

                       {expandedId === item.id && (
                         <div className="px-5 pb-8 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                               <div className="space-y-6">
                                  <div className="space-y-2">
                                     <div className="flex items-center justify-between px-1">
                                        <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Protocol Identifier</span>
                                        <button onClick={() => handleCopy(item.data.fileId, `id-${item.id}`)} className="text-[8px] font-black uppercase text-primary/60 hover:text-primary">
                                           {isCopied === `id-${item.id}` ? 'Isolated' : 'Copy'}
                                        </button>
                                     </div>
                                     <div className="h-10 bg-black/40 border border-white/5 rounded-xl flex items-center px-4 font-mono text-[9px] font-bold text-foreground/40 overflow-hidden shadow-inner">
                                        <span className="truncate">{item.data.fileId}</span>
                                     </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/5">
                                     <div className="space-y-0.5">
                                        <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Archive Trace</p>
                                        <p className="text-[10px] font-bold text-white uppercase">Message ID: #{item.data.messageId}</p>
                                     </div>
                                     <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black uppercase tracking-widest">Active Signal</Badge>
                                  </div>
                               </div>

                               <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col justify-center gap-5 relative overflow-hidden">
                                  <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                                     <Download className="w-24 h-24" />
                                  </div>
                                  
                                  {!generatedUrls[item.id] ? (
                                    <Button 
                                      onClick={() => handleGenerateLink(item.data.fileId, item.id)}
                                      disabled={generatingIds.has(item.id)}
                                      className="w-full h-14 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95"
                                    >
                                      {generatingIds.has(item.id) ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Zap className="w-4 h-4 mr-3" />}
                                      Synthesize Download Link
                                    </Button>
                                  ) : (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                       <div className="p-3 bg-black/40 rounded-xl border border-primary/20 shadow-inner flex items-center justify-between gap-4">
                                          <p className="text-[10px] font-mono text-primary truncate flex-1">{generatedUrls[item.id]}</p>
                                          <button onClick={() => handleCopy(generatedUrls[item.id], `url-${item.id}`)} className="text-primary hover:text-white transition-colors">
                                             {isCopied === `url-${item.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                          </button>
                                       </div>
                                       <div className="flex gap-2">
                                          <Button asChild className="h-11 flex-1 bg-white text-black text-[9px] font-black uppercase rounded-xl">
                                             <a href={generatedUrls[item.id]} target="_blank">Download Master <ExternalLink className="w-3 h-3 ml-2" /></a>
                                          </Button>
                                          <div className="flex gap-1.5">
                                             <button onClick={() => handleShare(generatedUrls[item.id], 'wa')} className="h-11 w-11 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><Share2 className="w-4 h-4" /></button>
                                             <button onClick={() => handleShare(generatedUrls[item.id], 'tg')} className="h-11 w-11 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><MessageCircle className="w-4 h-4" /></button>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-2 text-yellow-500/60 justify-center">
                                          <Clock className="w-3 h-3" />
                                          <span className="text-[8px] font-black uppercase tracking-widest">Temporary Access Portal (Approx 1 Hour)</span>
                                       </div>
                                    </div>
                                  )}
                               </div>
                            </div>
                         </div>
                       )}
                    </Card>
                  ))}
               </div>
             )}

             {/* Registry Footer */}
             {history.length > 0 && (
               <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-30">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/60">Historical Registry Stack v2.0</span>
                  <button onClick={() => setDeleteTarget('all')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors">
                     <Trash2 className="w-3.5 h-3.5" /> Purge Full Archival Memory
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">
               {deleteTarget === 'all' || deleteTarget === 'batch' ? 'Bulk Purge Protocol' : 'Identity Removal'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
              {deleteTarget === 'all' 
                ? "This will definitively purge your entire archival registry. This action is terminal and cannot be reversed." 
                : deleteTarget === 'batch'
                ? `You are about to remove ${selectedIds.size} identified assets from the registry.`
                : "Are you sure you want to remove this specific file from history?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteTarget === 'all') {
                  saveHistoryToDisk([]);
                } else if (deleteTarget === 'batch') {
                  saveHistoryToDisk(history.filter(h => !selectedIds.has(h.id)));
                  setSelectedIds(new Set());
                } else {
                  saveHistoryToDisk(history.filter(h => h.id !== deleteTarget));
                }
                setDeleteTarget(null);
                toast({ title: "Registry Sanitized" });
              }}
              className="h-12 flex-1 rounded-xl bg-destructive text-destructive-foreground font-black uppercase text-[9px] tracking-widest shadow-xl shadow-destructive/20"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
