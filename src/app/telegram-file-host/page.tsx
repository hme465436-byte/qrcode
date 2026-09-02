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
  Clock,
  KeyRound,
  Shield,
  Unplug,
  AlertTriangle,
  RefreshCcw
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { uploadToTelegram, uploadToCatbox, uploadToImgBB, getDownloadProtocol, testConnection } from './actions';
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

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

interface FileLinkMatrix {
  fileId?: string;
  directUrl?: string;
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
  provider: string;
  data: FileLinkMatrix;
}

type FilterType = 'all' | 'image' | 'audio' | 'video' | 'pdf' | 'zip';

export default function FILEHOSTPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  
  // Intake State
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('Standby');
  const [result, setResult] = useState<FileLinkMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Node State
  const [showCustomNode, setShowCustomNode] = useState(false);
  const [customToken, setCustomToken] = useState('');
  const [customChatId, setCustomChatId] = useState('');
  const [isTestingNode, setIsTestingNode] = useState(false);
  const [activeNode, setActiveNode] = useState<{ token: string, chatId: string, name: string, username?: string } | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

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

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`mykit_host_history_v2_${user.uid}`);
      if (saved) {
        try { setHistory(JSON.parse(saved)); } catch (e) {}
      }
      const savedNode = localStorage.getItem(`mykit_custom_node_${user.uid}`);
      if (savedNode) {
        try { setActiveNode(JSON.parse(savedNode)); } catch (e) {}
      }
    }
  }, [user]);

  const saveHistoryToDisk = (next: HistoryItem[]) => {
    if (!user) return;
    setHistory(next);
    localStorage.setItem(`mykit_host_history_v2_${user.uid}`, JSON.stringify(next));
  };

  const processedHistory = useMemo(() => {
    return history
      .filter(item => {
        const matchesSearch = (item.customName || item.name).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || item.data.mime.toLowerCase().includes(filterType);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return b.timestamp - a.timestamp;
      });
  }, [history, searchQuery, filterType]);

  const storageStats = useMemo(() => ({
    count: history.length,
    size: history.reduce((acc, curr) => acc + curr.data.size, 0)
  }), [history]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Max limit is 100MB for Catbox fallback." });
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
    setUploadProgress(10);
    setError(null);
    setResult(null);
    setStatusLabel('Connecting Telegram Node...');

    const formData = new FormData();
    formData.append('document', file);

    try {
      // 1. Try Primary Node: Telegram
      let response = await uploadToTelegram(formData, activeNode?.token, activeNode?.chatId);

      // 2. Failover logic if Telegram restricted
      if (!response.success) {
        console.warn("Telegram Node restricted:", response.message);
        setStatusLabel('Failing over to Catbox node...');
        setUploadProgress(40);
        
        // Try Node 2: Catbox (Anonymous support up to 200MB)
        response = await uploadToCatbox(formData);
        
        // 3. Optional Node 3: ImgBB (Visuals only)
        if (!response.success && file.type.startsWith('image/')) {
          setStatusLabel('Attempting ImgBB fallback...');
          setUploadProgress(70);
          response = await uploadToImgBB(formData);
        }
      }

      if (response.success && response.data) {
        setUploadProgress(100);
        setResult(response.data as FileLinkMatrix);
        
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          timestamp: Date.now(),
          provider: response.provider || 'Cloud',
          data: response.data as FileLinkMatrix
        };
        
        saveHistoryToDisk([newItem, ...history].slice(0, 50));
        
        if (newItem.data.directUrl) {
          setGeneratedUrls(prev => ({ ...prev, [newItem.id]: newItem.data.directUrl! }));
        }

        toast({ title: "Uplink Success", description: `Uploaded via ${response.provider}.` });
        setFile(null); 
      } else {
        throw new Error(response.message || "All production nodes are restricted.");
      }
    } catch (err: any) {
      setError(err.message || "Protocol Failure.");
      toast({ variant: "destructive", title: "Handshake Failed" });
    } finally {
      setIsProcessing(false);
      setStatusLabel('Standby');
    }
  };

  const handleGenerateLink = async (item: HistoryItem) => {
    if (item.data.directUrl) {
      setGeneratedUrls(prev => ({ ...prev, [item.id]: item.data.directUrl! }));
      return;
    }

    setGeneratingIds(prev => new Set(prev).add(item.id));
    try {
      const response = await getDownloadProtocol(item.data.fileId!, activeNode?.token);
      if (response.success && response.url) {
        const fullUrl = window.location.origin + response.url;
        setGeneratedUrls(prev => ({ ...prev, [item.id]: fullUrl }));
      } else {
        throw new Error("Protocol failure.");
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Uplink Failed" });
    } finally {
      setGeneratingIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    }
  };

  const handleTestAndConnect = async () => {
    if (!customToken.trim() || !customChatId.trim()) return;
    setIsTestingNode(true);
    try {
      const res = await testConnection(customToken.trim(), customChatId.trim());
      if (res.success) {
        const node = { token: customToken.trim(), chatId: customChatId.trim(), name: res.botName || 'Custom Node', username: res.username };
        setActiveNode(node);
        localStorage.setItem(`mykit_custom_node_${user?.uid}`, JSON.stringify(node));
        setShowCustomNode(false);
        toast({ title: "Node Active" });
      } else {
        toast({ variant: "destructive", title: "Handshake Failed", description: res.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Error" });
    } finally {
      setIsTestingNode(false);
    }
  };

  const disconnectNode = () => {
    setActiveNode(null);
    localStorage.removeItem(`mykit_custom_node_${user?.uid}`);
    toast({ title: "Default Protocol Restored" });
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Cloud className="w-3.5 h-3.5" /> High-Uptime Cloud Node
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
            FILE <span className="text-primary italic">HOST PRO</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="file-host" />
           <Button 
            onClick={() => setShowCustomNode(true)}
            variant="outline" 
            size="sm" 
            className={cn(
              "h-10 px-6 rounded-xl border-white/10 text-[9px] font-black uppercase tracking-widest transition-all shadow-lg",
              activeNode ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-secondary"
            )}
           >
              {activeNode ? <ShieldCheck className="w-3.5 h-3.5 mr-2" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
              {activeNode ? (activeNode.username ? `@${activeNode.username.toUpperCase()}` : 'HOST ACTIVE') : 'HOST'}
           </Button>
        </div>
      </div>

      {!user && !authLoading ? (
        <Card className="glass-card border-border shadow-2xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[2.5rem]">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
             <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Authentication Required</h2>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-in fade-in duration-1000">
          
          <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
            {showCustomNode && (
               <Card className="glass-card border-primary/40 bg-primary/[0.03] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                  <CardHeader className="py-6 border-b border-primary/10 flex flex-row items-center justify-between">
                     <div className="flex items-center gap-3">
                        <KeyRound className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Private Bot Protocol</span>
                     </div>
                     <button onClick={() => setShowCustomNode(false)} className="text-primary/40 hover:text-primary"><X className="w-4 h-4" /></button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Bot Token</Label>
                           <Input 
                            value={customToken}
                            onChange={e => setCustomToken(e.target.value)}
                            type="password"
                            placeholder="7123456789:AA..."
                            className="h-11 bg-background border-border text-xs font-mono"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Channel/Chat ID</Label>
                           <Input 
                            value={customChatId}
                            onChange={e => setCustomChatId(e.target.value)}
                            placeholder="-100..."
                            className="h-11 bg-background border-border text-xs font-mono"
                           />
                        </div>
                     </div>
                     <div className="flex flex-col gap-3">
                        <Button onClick={handleTestAndConnect} disabled={isTestingNode || !customToken || !customChatId} className="h-12 w-full bg-primary text-white font-black uppercase text-[10px] rounded-xl shadow-lg">
                           {isTestingNode ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />} Validate & Connect
                        </Button>
                        {activeNode && (
                          <Button variant="outline" onClick={() => setShowDisconnectConfirm(true)} className="h-10 text-[9px] font-black uppercase border-destructive/20 text-destructive bg-destructive/5">
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
                          <span className="animate-pulse">{statusLabel}</span>
                          <span>{uploadProgress}%</span>
                       </div>
                       <Progress value={uploadProgress} className="h-1" />
                    </div>
                  )}
                  <Button 
                    onClick={executeUpload} 
                    disabled={isProcessing || !file}
                    className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Execute Transmission
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Safe Failover Protocol</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        Our studio uses a redundant multi-node stack. If Telegram is restricted, we automatically synchronize with the Catbox and ImgBB global registries.
                      </p>
                    </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
             {/* Archives Section */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/60 tracking-tight">Identity Archive</h3>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="px-4 py-2 rounded-2xl bg-secondary/50 border border-border text-center min-w-[100px]">
                         <p className="text-[10px] font-black text-foreground/40 uppercase leading-none">{storageStats.count} Units</p>
                      </div>
                      {history.length > 0 && (
                        <button onClick={() => saveHistoryToDisk([])} className="text-[9px] font-black uppercase text-foreground/20 hover:text-red-500 transition-colors">Purge Registry</button>
                      )}
                   </div>
                </div>

                {history.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-6 opacity-10 grayscale border-2 border-dashed border-white/5 rounded-[3rem]">
                     <Activity className="w-12 h-12 text-primary" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting Discovery Signal</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {processedHistory.map((item) => (
                       <Card key={item.id} className={cn(
                         "glass-card border-border shadow-xl overflow-hidden group/row transition-all duration-300",
                         item.isFavorite && "border-primary/20"
                       )}>
                          <div 
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                          >
                             <div className="flex items-center gap-5 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group/thumb">
                                   {getFileIcon(item.data.mime)}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">
                                      {item.customName || item.name}
                                   </p>
                                   <div className="flex items-center gap-3 mt-1">
                                      <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                      <div className="w-1 h-1 rounded-full bg-primary/20" />
                                      <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{formatSize(item.data.size)} • {item.provider}</p>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }} className={cn("p-2 rounded-lg transition-all", item.isFavorite ? "text-primary bg-primary/10" : "text-foreground/10 hover:text-primary")}>
                                   <Star className={cn("w-4 h-4", item.isFavorite && "fill-current")} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); startRename(item); }} className="p-2 text-foreground/10 hover:text-primary transition-all">
                                   <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); saveHistoryToDisk(history.filter(h => h.id !== item.id)); }} className="p-2 text-foreground/10 hover:text-red-500 transition-all">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                                <div className={cn("w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 transition-all", expandedId === item.id && "bg-primary text-white")}>
                                   {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                             </div>
                          </div>

                          {expandedId === item.id && (
                            <div className="px-5 pb-8 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-500">
                               <div className="space-y-8 pt-6">
                                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white/5 p-5 rounded-3xl border border-white/5">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                           <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                           <p className="text-[10px] font-black uppercase text-foreground">{item.provider} Node Link</p>
                                           <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{formatSize(item.data.size)}</p>
                                        </div>
                                     </div>
                                     <div className="flex gap-2">
                                        {!generatedUrls[item.id] ? (
                                           <Button onClick={() => handleGenerateLink(item)} disabled={generatingIds.has(item.id)} className="h-10 px-6 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg">
                                              {generatingIds.has(item.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Isolate Matrix Link'}
                                           </Button>
                                        ) : (
                                           <div className="flex gap-2">
                                              <Button onClick={() => handleCopyText(generatedUrls[item.id], `url-${item.id}`)} variant="outline" className="h-10 px-4 bg-background border-border text-primary text-[8px] font-black uppercase">
                                                 {isCopied === `url-${item.id}` ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />} Copy
                                              </Button>
                                              <Button asChild className="h-10 px-4 bg-white text-black text-[8px] font-black uppercase rounded-xl shadow-xl">
                                                 <a href={generatedUrls[item.id]} target="_blank"><Download className="w-3.5 h-3.5 mr-1.5" /> Download</a>
                                              </Button>
                                           </div>
                                        )}
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
              Are you sure you want to disconnect your private host node?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={() => { disconnectNode(); setShowDisconnectConfirm(false); }} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl shadow-destructive/20">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
