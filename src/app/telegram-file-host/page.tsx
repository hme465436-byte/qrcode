"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  Info, 
  AlertCircle,
  Zap,
  Activity,
  ImageIcon,
  RefreshCcw,
  RotateCcw,
  Lock,
  User,
  AlertTriangle,
  History,
  X,
  ChevronDown,
  ChevronUp,
  FileUp,
  Eye,
  Settings2,
  ArrowRight,
  KeyRound,
  Unplug,
  ShieldCheck,
  FileCode,
  Code2,
  MessageSquare,
  ExternalLink,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  File as FileIcon,
  Star,
  Edit3,
  Check,
  Cloud,
  Trash2,
  Link as LinkIcon,
  Download,
  Globe,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Link from 'next/link';
import { uploadToTelegram, getDownloadProtocol, testConnection } from './actions';
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
import { collection, query, where, orderBy, doc, setDoc, deleteDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  uid: string;
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
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  // Intake State
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // UI Meta
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Firestore Sync Matrix ---
  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'file_host_history'),
      where('uid', '==', user.uid)
    );
  }, [db, user]);

  const { data: historyData, loading: historyLoading } = useCollection<HistoryItem>(historyQuery);

  const history = useMemo(() => historyData || [], [historyData]);

  // --- Persistence Matrix (Custom Nodes) ---
  useEffect(() => {
    if (user) {
      const savedNode = localStorage.getItem(`mykit_custom_node_${user.uid}`);
      if (savedNode) {
        try { setActiveNode(JSON.parse(savedNode)); } catch (e) {}
      }
    }
  }, [user]);

  const saveToHistoryFirestore = (itemData: any) => {
    if (!db || !user) return;
    
    const docRef = doc(collection(db, 'file_host_history'));
    const payload = {
      ...itemData,
      id: docRef.id,
      uid: user.uid
    };

    setDoc(docRef, payload)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const removeFromHistory = (id: string) => {
    if (!db || !user) return;
    const docRef = doc(db, 'file_host_history', id);
    deleteDoc(docRef)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    toast({ title: "Identity Purged" });
  };

  const clearAllHistory = async () => {
    if (!db || !user || history.length === 0) return;
    const batch = writeBatch(db);
    history.forEach(item => {
      batch.delete(doc(db, 'file_host_history', item.id));
    });
    
    try {
      await batch.commit();
      toast({ title: "Archive Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" });
    }
  };

  const getFileIcon = (mime: string) => {
    if (!mime) return <FileIcon className="w-5 h-5 text-primary/40" />;
    const low = mime.toLowerCase();
    if (low.startsWith('image/')) return <FileImage className="w-5 h-5 text-emerald-500" />;
    if (low.startsWith('video/')) return <FileVideo className="w-5 h-5 text-rose-500" />;
    if (low.startsWith('audio/')) return <FileAudio className="w-5 h-5 text-amber-500" />;
    if (low.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (low.includes('zip') || low.includes('archive') || low.includes('compressed')) return <FileArchive className="w-5 h-5 text-blue-500" />;
    return <FileIcon className="w-5 h-5 text-primary/40" />;
  };

  const processedHistory = useMemo(() => {
    return history
      .filter(item => {
        const nameToSearch = (item.customName || item.name).toLowerCase();
        const matchesSearch = nameToSearch.includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || item.data.mime.toLowerCase().includes(filterType);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return b.timestamp - a.timestamp;
      });
  }, [history, searchQuery, filterType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Max limit is 100MB for stability." });
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
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
    if (!file || !user) return;
    
    setIsProcessing(true);
    setUploadProgress(20);
    setError(null);
    setResult(null);
    setStatusLabel('Connecting to Telegram node...');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await uploadToTelegram(formData, activeNode?.token, activeNode?.chatId);

      if (response.success && response.data) {
        setUploadProgress(100);
        const data = response.data as FileLinkMatrix;
        setResult(data);
        
        saveToHistoryFirestore({
          name: file.name,
          timestamp: Date.now(),
          provider: 'Telegram',
          data: data,
          isFavorite: false
        });
        
        toast({ title: "Uplink Success", description: "File successfully hosted on Telegram." });
        setFile(null); 
        setImage(null);
      } else {
        throw new Error(response.message || "Telegram node restricted or rejected payload.");
      }
    } catch (err: any) {
      setError(err.message || "Handshake failed.");
      toast({ variant: "destructive", title: "Protocol Failure", description: err.message });
    } finally {
      setIsProcessing(false);
      setStatusLabel('Standby');
    }
  };

  const toggleFavorite = (id: string) => {
    if (!db) return;
    const item = history.find(h => h.id === id);
    if (!item) return;
    
    const docRef = doc(db, 'file_host_history', id);
    updateDoc(docRef, { isFavorite: !item.isFavorite })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { isFavorite: !item.isFavorite },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const startRename = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditValue(item.customName || item.name);
  };

  const saveRename = () => {
    if (!editingId || !db) return;
    const docRef = doc(db, 'file_host_history', editingId);
    updateDoc(docRef, { customName: editValue })
      .then(() => {
        setEditingId(null);
        setEditValue('');
        toast({ title: "Identity Updated" });
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { customName: editValue },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
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

  const handleTestAndConnectNode = async () => {
    if (!customToken || !customChatId) return;
    setIsTestingNode(true);
    try {
      const res = await testConnection(customToken, customChatId);
      if (res.success) {
        const node = { 
          token: customToken, 
          chatId: customChatId, 
          name: res.botName || 'Custom Bot',
          username: res.username
        };
        setActiveNode(node);
        localStorage.setItem(`mykit_custom_node_${user?.uid}`, JSON.stringify(node));
        setShowCustomNode(false);
        toast({ title: "Node Integrated", description: "Hardware handshake successful." });
      } else {
        throw new Error(res.error || "Uplink refused.");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Handshake Failed", description: err.message });
    } finally {
      setIsTestingNode(false);
    }
  };

  const disconnectNode = () => {
    setActiveNode(null);
    localStorage.removeItem(`mykit_custom_node_${user?.uid}`);
    toast({ title: "Node Decoupled" });
    setShowDisconnectConfirm(false);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClearWorkspace = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Cloud className="w-3.5 h-3.5" /> Telegram Cloud Storage
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
            FILE <span className="text-primary italic">HOST PRO</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="file-host" />
           <Button 
            onClick={() => { setError(null); setCustomToken(''); setCustomChatId(''); setShowCustomNode(true); }}
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
        <Card className="glass-card border-border shadow-2xl p-12 sm:p-24 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl ring-1 ring-primary/10 relative z-10">
             <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-4 relative z-10">
             <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Authentication Required</h2>
             <p className="text-[10px] sm:text-xs text-foreground/30 font-black uppercase tracking-[0.4em] leading-relaxed max-w-md mx-auto">
                To maintain protocol integrity and ensure high-bandwidth uplinks, you must be logged into the professional studio.
             </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
            <Button asChild className="h-16 flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
               <Link href="/login?redirect=/telegram-file-host">Initialize Session</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
               <Link href="/">Explore Suite</Link>
            </Button>
          </div>
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Private Node Access</span>
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
                           <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Channel ID</Label>
                           <Input 
                            value={customChatId}
                            onChange={e => setCustomChatId(e.target.value)}
                            placeholder="-100..."
                            className="h-11 bg-background border-border text-xs font-mono"
                           />
                        </div>
                     </div>
                     <div className="flex flex-col gap-3">
                        <Button onClick={handleTestAndConnectNode} disabled={isTestingNode || !customToken || !customChatId} className="h-12 w-full bg-primary text-white font-black uppercase text-[10px] rounded-xl shadow-lg">
                           {isTestingNode ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />} Validate & Connect
                        </Button>
                        {activeNode && (
                          <Button variant="outline" onClick={() => setShowDisconnectConfirm(true)} className="h-10 text-[9px] font-black uppercase border-destructive/20 text-destructive bg-destructive/5">
                             <Unplug className="w-3.5 h-3.5 mr-2" /> Disconnect Node
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
                          {getFileIcon(file.type)}
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase">{formatSize(file.size)}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6 p-8">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all mx-auto shadow-xl">
                        <FileUp className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                         <span className="text-xs font-black uppercase text-foreground/40 tracking-[0.2em] group-hover/upload:text-primary transition-colors">Select Payload</span>
                         <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest leading-relaxed">ALL FORMATS (Max 100MB)</p>
                      </div>
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
                    Upload
                  </Button>
                  {(file || result) && (
                    <button onClick={handleClearWorkspace} className="w-full text-[9px] font-black uppercase text-foreground/20 hover:text-primary transition-all">Clear Workspace</button>
                  )}
                </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
                <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Identity Sync Active</h4>
                      <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                        History is synchronized across all your devices via Firestore. Your hosted metadata is always accessible through your profile.
                      </p>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Output & Archive */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
             {result && (
               <Card className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <CardHeader className="py-6 border-b border-emerald-500/10 bg-emerald-500/5 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-inner">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em]">Active Master Result</CardTitle>
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Uplink Verified</Badge>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-12">
                    <div className="space-y-6">
                      {[
                        { label: 'Proxy Protocol Link', val: `https://mykittool.app/api/telegram-proxy?fileId=${result.fileId}`, icon: LinkIcon },
                        { label: 'File Identity', val: result.name, icon: FileCode },
                        { label: 'Payload Volume', val: formatSize(result.size), icon: Maximize2 },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2 group/row">
                           <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                 <item.icon className="w-3 h-3 text-emerald-600/40" />
                                 <span className="text-[9px] font-black uppercase text-foreground/50 tracking-widest">{item.label}</span>
                              </div>
                              <button onClick={() => handleCopyText(item.val, item.label)} className={cn("text-[8px] font-black uppercase transition-all", isCopied === item.label ? "text-emerald-500" : "text-primary/60 hover:text-primary")}>
                                 {isCopied === item.label ? 'Identity Isolated' : 'Copy Snippet'}
                              </button>
                           </div>
                           <div className="h-11 bg-white/40 dark:bg-black/40 border border-emerald-500/5 rounded-xl flex items-center px-4 font-mono text-[10px] font-bold text-foreground/80 overflow-hidden shadow-inner group-hover/row:border-emerald-500/20 transition-colors">
                              <span className="truncate">{item.val}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
               </Card>
             )}

             {/* Archives Section */}
             <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-primary" />
                      <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/60 tracking-tight">Identity Archive</h3>
                   </div>
                   {history.length > 0 && (
                      <button 
                        onClick={clearAllHistory} 
                        className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors"
                      >
                        Purge Registry
                      </button>
                   )}
                </div>

                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                     <Loader2 className="w-8 h-8 text-primary animate-spin" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Registry...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-6 opacity-10 grayscale border-2 border-dashed border-white/5 rounded-[3rem]">
                     <Activity className="w-12 h-12 text-primary" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting Discovery Signal</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {processedHistory.map((item) => (
                       <Card key={item.id} className={cn("glass-card border-border shadow-xl overflow-hidden group/row transition-all duration-300", item.isFavorite && "border-primary/10")}>
                          <div 
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} 
                            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                          >
                             <div className="flex items-center gap-5 min-w-0">
                                <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group/thumb">
                                   <div className="w-full h-full flex items-center justify-center">
                                      {getFileIcon(item.data.mime)}
                                   </div>
                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                                      <Eye className="w-4 h-4 text-white/60" />
                                   </div>
                                </div>
                                <div className="min-w-0">
                                   {editingId === item.id ? (
                                      <div className="flex items-center gap-2">
                                         <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-8 w-48 bg-background border-primary/40 text-[10px] uppercase font-bold" autoFocus onKeyDown={e => e.key === 'Enter' && saveRename()} />
                                         <button onClick={saveRename} className="text-primary hover:scale-110 transition-transform"><Check className="w-4 h-4" /></button>
                                      </div>
                                   ) : (
                                      <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{item.customName || item.name}</p>
                                   )}
                                   <div className="flex items-center gap-3 mt-1">
                                      <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                      <div className="w-1 h-1 rounded-full bg-primary/20" />
                                      <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{formatSize(item.data.size)} • Telegram</p>
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
                                <button onClick={(e) => { e.stopPropagation(); startRename(item); }} className="p-2 text-foreground/10 hover:text-primary transition-all"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); removeFromHistory(item.id); }} className="p-2 text-foreground/10 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                <div className={cn("w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 transition-all", expandedId === item.id && "bg-primary text-white")}>
                                   {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                             </div>
                          </div>

                          {expandedId === item.id && (
                            <div className="px-5 pb-8 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-500">
                               <div className="space-y-6 pt-6">
                                  {[
                                    { label: 'Proxy Link', val: generatedUrls[item.id] || `https://mykittool.app/api/telegram-proxy?fileId=${item.data.fileId}`, icon: LinkIcon },
                                    { label: 'Native File Name', val: item.name, icon: FileCode },
                                  ].map((sub) => (
                                    <div key={sub.label} className="space-y-2 group/sub">
                                       <div className="flex items-center justify-between px-1">
                                          <div className="flex items-center gap-2">
                                             <sub.icon className="w-3 h-3 text-primary/30" />
                                             <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">{sub.label} Protocol</span>
                                          </div>
                                          <button onClick={() => handleCopyText(sub.val, `hist-${item.id}-${sub.label}`)} className={cn("text-[8px] font-black uppercase transition-all", isCopied === `hist-${item.id}-${sub.label}` ? "text-emerald-500" : "text-primary/60 hover:text-primary")}>
                                             {isCopied === `hist-${item.id}-${sub.label}` ? 'Isolated' : 'Copy'}
                                          </button>
                                       </div>
                                       <div className="h-10 bg-black/40 border border-white/5 rounded-xl flex items-center px-4 font-mono text-[9px] font-bold text-foreground/40 overflow-hidden shadow-inner group-hover/sub:border-primary/20 transition-all">
                                          <span className="truncate">{sub.val}</span>
                                       </div>
                                    </div>
                                  ))}
                                  <div className="flex gap-2 justify-center">
                                     {!generatedUrls[item.id] && item.data.fileId && (
                                        <Button onClick={() => handleGenerateLink(item)} disabled={generatingIds.has(item.id)} className="h-10 px-6 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg">
                                           {generatingIds.has(item.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Request Direct Protocol'}
                                        </Button>
                                     )}
                                     {(generatedUrls[item.id] || item.data.directUrl) && (
                                        <Button asChild className="h-10 px-8 bg-white text-black text-[9px] font-black uppercase rounded-xl shadow-xl">
                                           <a href={generatedUrls[item.id] || item.data.directUrl} target="_blank" rel="noopener noreferrer"><Download className="w-3.5 h-3.5 mr-2" /> Download Master</a>
                                        </Button>
                                     )}
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

      {/* Disconnect Alert */}
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
              Are you sure you want to disconnect your private host node? This action is specific to your current identity session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={disconnectNode}
              className="h-12 flex-1 rounded-xl bg-destructive text-destructive-foreground font-black uppercase text-[9px] tracking-widest shadow-xl shadow-destructive/20"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
