'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Cloud, 
  Upload, 
  Settings2, 
  History, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Loader2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileUp, 
  ImageIcon, 
  Calendar, 
  Bell, 
  Unplug, 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Server,
  Globe,
  Download,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  File as FileIcon,
  Filter,
  Clock,
  RotateCcw,
  Check,
  TrendingDown,
  Maximize2,
  Lock,
  Eye,
  EyeOff,
  Layers,
  ChevronRight,
  Maximize,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import * as actions from './actions';
import { differenceInDays, format, isBefore, isAfter } from 'date-fns';
import { GetHelp } from '@/components/qr-canvas/get-help';
import Link from 'next/link';
import JSZip from 'jszip';

// --- Top-Level Utilities ---

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

type ProviderId = 'r2' | 'imgbb' | 'gofile' | 'pixeldrain' | 'custom';

interface ProviderConfig {
  id: ProviderId;
  label: string;
  fields: { key: string; label: string; placeholder: string; type?: string; isSecret?: boolean }[];
}

const PROVIDERS: ProviderConfig[] = [
  { id: 'imgbb', label: 'ImgBB', fields: [
    { key: 'apiKey', label: 'API Key', placeholder: 'Enter ImgBB API Key', isSecret: true },
  ]},
  { id: 'gofile', label: 'GoFile', fields: [
    { key: 'token', label: 'API Token (Optional)', placeholder: 'Enter Account Token', isSecret: true },
  ]},
  { id: 'pixeldrain', label: 'Pixeldrain', fields: [
    { key: 'apiKey', label: 'API Key', placeholder: 'Enter API Key', isSecret: true },
  ]},
  { id: 'r2', label: 'Cloudflare R2', fields: [
    { key: 'accountId', label: 'Account ID', placeholder: 'Enter Account ID' },
    { key: 'accessKey', label: 'Access Key', placeholder: 'Enter Access Key', isSecret: true },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'Enter Secret Key', type: 'password', isSecret: true },
    { key: 'bucket', label: 'Bucket Name', placeholder: 'e.g. static-assets' },
    { key: 'publicUrl', label: 'Public URL / Endpoint', placeholder: 'https://pub-xxx.r2.dev' },
  ]},
  { id: 'custom', label: 'Custom API', fields: [
    { key: 'url', label: 'API URL', placeholder: 'https://api.site.com/upload' },
    { key: 'apiKey', label: 'API Key / Token', placeholder: 'Enter Token', isSecret: true },
    { key: 'headerKey', label: 'Header Key', placeholder: 'Authorization' },
    { key: 'responsePath', label: 'Response Link Path', placeholder: 'data.url' },
  ]},
];

interface UploadRecord {
  id: string;
  uid: string;
  name: string;
  type: string;
  size: number;
  provider: string;
  url: string;
  timestamp: number;
  expiryDate?: string;
  reminderDate?: string;
  reminderNote?: string;
}

type StatusFilter = 'all' | 'active' | 'expiring' | 'expired' | 'reminder';

export default function TempUploadPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  
  // Settings & Status
  const [activeProvider, setActiveProvider] = useState<ProviderId>('imgbb');
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUploadUrl, setLastUploadUrl] = useState<string | null>(null);

  // Registry State
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Modals
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const configCardRef = useRef<HTMLDivElement>(null);

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'temp_upload_history'), where('uid', '==', user.uid));
  }, [db, user]);

  const { data: historyData, loading: historyLoading } = useCollection<UploadRecord>(historyQuery);

  const history = useMemo(() => {
    const list = historyData || [];
    const now = new Date();

    return list
      .filter(item => {
        const nameToSearch = item.name.toLowerCase();
        const matchesSearch = nameToSearch.includes(searchQuery.toLowerCase());
        const matchesProvider = providerFilter === 'all' || item.provider === providerFilter;
        
        let matchesStatus = true;
        if (statusFilter === 'active') {
          matchesStatus = !item.expiryDate || isAfter(new Date(item.expiryDate), now);
        } else if (statusFilter === 'expiring') {
          matchesStatus = !!item.expiryDate && 
                          isAfter(new Date(item.expiryDate), now) && 
                          differenceInDays(new Date(item.expiryDate), now) <= 3;
        } else if (statusFilter === 'expired') {
          matchesStatus = !!item.expiryDate && isBefore(new Date(item.expiryDate), now);
        } else if (statusFilter === 'reminder') {
          matchesStatus = !!item.reminderDate && isBefore(new Date(item.reminderDate), now);
        }

        return matchesSearch && matchesProvider && matchesStatus;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [historyData, searchQuery, providerFilter, statusFilter]);

  useEffect(() => {
    const savedConfigs = localStorage.getItem('mykit_temp_upload_configs');
    const savedConnected = localStorage.getItem('mykit_temp_upload_connected');
    if (savedConfigs) setConfigs(JSON.parse(savedConfigs));
    if (savedConnected) setConnectedIds(new Set(JSON.parse(savedConnected)));
  }, []);

  const saveConfig = () => {
    const nextConnected = new Set(connectedIds);
    nextConnected.add(activeProvider);
    setConnectedIds(nextConnected);
    localStorage.setItem('mykit_temp_upload_configs', JSON.stringify(configs));
    localStorage.setItem('mykit_temp_upload_connected', JSON.stringify(Array.from(nextConnected)));
    toast({ title: "Node Connected", description: `${activeProvider.toUpperCase()} protocol active.` });
    setIsConfigOpen(false);
  };

  const disconnectProvider = () => {
    const nextConnected = new Set(connectedIds);
    nextConnected.delete(activeProvider);
    setConnectedIds(nextConnected);
    localStorage.setItem('mykit_temp_upload_connected', JSON.stringify(Array.from(nextConnected)));
    setShowDisconnectConfirm(false);
    setIsConfigOpen(false);
    toast({ title: "Node Decoupled" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const executeUpload = async () => {
    if (!file || !connectedIds.has(activeProvider)) return;
    setIsProcessing(true);
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const config = configs[activeProvider] || {};
      let result: any;
      try {
        setUploadProgress(40);
        switch (activeProvider) {
          case 'r2': result = await actions.uploadToR2(base64, file.name, file.type, config); break;
          case 'imgbb': result = await actions.uploadToImgBB(base64, config.apiKey); break;
          case 'gofile': result = await actions.uploadToGoFile(base64, file.name, config.token); break;
          case 'pixeldrain': result = await actions.uploadToPixeldrain(base64, file.name, config.apiKey); break;
          case 'custom': result = await actions.uploadToCustom(base64, file.name, config); break;
        }

        if (result.success) {
          setUploadProgress(100);
          setLastUploadUrl(result.url);
          if (user && db) {
            const docRef = doc(collection(db, 'temp_upload_history'));
            const payload: UploadRecord = {
              id: docRef.id,
              uid: user.uid,
              name: file.name,
              type: file.type,
              size: file.size,
              provider: activeProvider,
              url: result.url,
              timestamp: Date.now()
            };
            setDoc(docRef, payload).catch(async (serverError) => {
              const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: payload,
              });
              errorEmitter.emit('permission-error', permissionError);
            });
          }
          toast({ title: "Uplink Success" });
          setFile(null);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: "Protocol Failure", description: err.message });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteRecord = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'temp_upload_history', id);
    deleteDoc(docRef).then(() => {
      setItemToDelete(null);
      toast({ title: "Registry Purged" });
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const clearAllHistory = async () => {
    if (!db || !user || history.length === 0) return;
    const batch = writeBatch(db);
    history.forEach(item => batch.delete(doc(db, 'temp_upload_history', item.id)));
    try {
      await batch.commit();
      setShowClearAllConfirm(false);
      toast({ title: "Archive Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" });
    }
  };

  const handleDownloadFile = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = name;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
      toast({ title: "External Link", description: "Node restricted direct fetch." });
    }
  };

  const getAlertBadge = (item: UploadRecord) => {
    const now = new Date();
    if (item.expiryDate) {
      const expiry = new Date(item.expiryDate);
      if (isBefore(expiry, now)) return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[7px] uppercase font-black px-2 py-0.5">EXPIRED</Badge>;
      if (differenceInDays(expiry, now) <= 3) return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[7px] uppercase font-black px-2 py-0.5">EXPIRING</Badge>;
    }
    if (item.reminderDate) {
      const reminder = new Date(item.reminderDate);
      if (isBefore(reminder, now)) return <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] uppercase font-black px-2 py-0.5">DUE</Badge>;
    }
    return null;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-emerald-500" />;
    if (type.startsWith('video/')) return <FileVideo className="w-4 h-4 text-rose-500" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    return <FileIcon className="w-4 h-4 text-foreground/40" />;
  };

  const currentProviderConfig = useMemo(() => PROVIDERS.find(p => p.id === activeProvider), [activeProvider]);
  const isCurrentConnected = connectedIds.has(activeProvider);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-4xl">
        <div className="mb-20 animate-reveal text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-6">
            <Cloud className="w-3.5 h-3.5" /> High-Entropy Storage Matrix
          </div>
          <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-none mb-4">
            Temp <span className="text-primary italic">Upload Studio</span>
          </h1>
        </div>
        <Card className="glass-card border-border shadow-2xl p-12 sm:p-24 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl ring-1 ring-primary/10 relative z-10">
             <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-4 relative z-10">
             <h2 className="text-2xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight">Authentication Required</h2>
             <p className="text-[10px] sm:text-xs text-foreground/30 font-black uppercase tracking-[0.4em] leading-relaxed max-w-md mx-auto">
                Login to save history permanently across all devices.
             </p>
          </div>
          <Button asChild className="h-16 w-full max-w-md bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl relative z-10">
             <Link href="/login?redirect=/temp-upload">Initialize Session</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-7xl animate-in fade-in duration-1000">
      <div className="mb-20 animate-reveal text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-6">
          <Cloud className="w-3.5 h-3.5" /> High-Entropy Storage Matrix
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-none mb-4">
          Temp <span className="text-primary italic">Upload Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
          Connect storage, upload files, and keep history with expiry reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-8">
             <div className="space-y-2 px-1">
                <Label className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Calibration</Label>
                <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Storage Protocol</h3>
             </div>
             <div className="flex flex-col sm:flex-row items-center gap-3">
                <Select value={activeProvider} onValueChange={(v: ProviderId) => { setActiveProvider(v); setIsConfigOpen(false); }}>
                  <SelectTrigger className="h-14 flex-1 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="Choose Provider" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-3">
                            {p.label}
                            {connectedIds.has(p.id) && <CheckCircle2 className="w-3 text-emerald-500" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  const newState = !isConfigOpen;
                  setIsConfigOpen(newState);
                  if (newState) {
                    setTimeout(() => configCardRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }} className={cn("h-14 px-6 rounded-2xl border-white/10 text-[9px] font-black uppercase tracking-widest", isConfigOpen ? "bg-primary text-white border-primary" : "bg-secondary")}>
                  {isConfigOpen ? <ChevronUp className="w-4 h-4 mr-2" /> : <Settings2 className="w-4 h-4 mr-2" />}
                  {isConfigOpen ? 'Close' : 'Config'}
                </Button>
             </div>

             {isConfigOpen && currentProviderConfig && (
               <div ref={configCardRef} className="animate-in slide-in-from-top-4 duration-500">
                  <Card className="glass-card border-primary/20 bg-primary/[0.03] shadow-2xl overflow-hidden">
                     <CardHeader className="py-6 px-8 border-b border-primary/10 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                           <KeyRound className="w-4 h-4 text-primary" />
                           <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{currentProviderConfig.label} Matrix</span>
                        </div>
                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase", isCurrentConnected ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/5")}>
                           {isCurrentConnected ? 'CONNECTED' : 'STANDBY'}
                        </Badge>
                     </CardHeader>
                     <CardContent className="p-8 space-y-6">
                        {currentProviderConfig.fields.map(f => (
                          <div key={f.key} className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">{f.label}</Label>
                             <div className="relative">
                                <Input 
                                  type={f.isSecret && !showSecrets[f.key] ? 'password' : 'text'}
                                  value={configs[activeProvider]?.[f.key] || ''}
                                  onChange={e => setConfigs({ ...configs, [activeProvider]: { ...(configs[activeProvider] || {}), [f.key]: e.target.value } })}
                                  className="h-12 bg-black/40 border-border rounded-xl text-xs font-bold"
                                />
                                {f.isSecret && (
                                   <button onClick={() => setShowSecrets(prev => ({ ...prev, [f.key]: !prev[f.key] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors">
                                      {showSecrets[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                   </button>
                                 )}
                             </div>
                          </div>
                        ))}
                        <div className="flex gap-3 pt-2">
                           <Button onClick={saveConfig} className="flex-1 h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest">Connect</Button>
                           {isCurrentConnected && <Button variant="outline" onClick={() => setShowDisconnectConfirm(true)} className="h-12 w-12 border-red-500/20 text-red-500"><Unplug className="w-5 h-5" /></Button>}
                        </div>
                     </CardContent>
                  </Card>
               </div>
             )}
          </div>

          <Card className={cn("glass-card border-border shadow-2xl transition-all duration-700 overflow-hidden bg-[#060608]", !isCurrentConnected && "opacity-20 pointer-events-none grayscale")}>
             <CardHeader className="py-6 border-b border-white/5 bg-secondary/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 text-foreground">
                   <FileUp className="w-5 h-5 text-primary" /> Transmission Intake
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-10 space-y-10">
                <div onClick={() => !isProcessing && fileInputRef.current?.click()} className={cn("relative h-48 rounded-[2.5rem] border-2 border-dashed border-white/5 hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-black/40 cursor-pointer group/upload", file && "border-solid border-primary/20")}>
                   {file ? (
                     <div className="text-center p-8 space-y-3">
                        <FileIcon className="w-10 h-10 text-primary mx-auto" />
                        <p className="text-xs font-bold text-white truncate max-w-[240px] uppercase">{file.name}</p>
                        <p className="text-[9px] font-black text-foreground/20 uppercase">{formatSize(file.size)}</p>
                     </div>
                   ) : (
                     <div className="text-center space-y-4">
                       <div className="w-12 h-12 rounded-[1rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary transition-all mx-auto shadow-xl">
                         <FileUp className="w-6 h-6" />
                       </div>
                       <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest group-hover/upload:text-primary transition-colors">Select Payload (Max 100MB)</span>
                     </div>
                   )}
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
                <div className="space-y-6">
                  {isProcessing && (
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary"><span>Uplink...</span><span>{uploadProgress}%</span></div>
                       <Progress value={uploadProgress} className="h-1" />
                    </div>
                  )}
                  <Button onClick={executeUpload} disabled={isProcessing || !file || !isCurrentConnected} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30">
                     Upload
                  </Button>
                </div>
             </CardContent>
          </Card>
        </div>

        <main className="lg:col-span-7 xl:col-span-8 space-y-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border shadow-inner"><History className="w-6 h-6" /></div>
                 <div className="space-y-0.5">
                    <h3 className="text-2xl font-headline font-black uppercase text-foreground/60 tracking-tight">Archive Registry</h3>
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em]">Personal Node History</p>
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 <Input placeholder="Search archives..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-10 w-full sm:w-64 bg-secondary/50 border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest" />
                 <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="h-10 w-32 bg-secondary/50 border-white/5 text-[8px] font-black uppercase tracking-widest rounded-xl">
                      <Filter className="w-3 h-3 mr-2" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                       <SelectItem value="all" className="text-[10px] uppercase">All Status</SelectItem>
                       <SelectItem value="active" className="text-[10px] uppercase">Active</SelectItem>
                       <SelectItem value="expiring" className="text-[10px] uppercase">Expiring</SelectItem>
                       <SelectItem value="expired" className="text-[10px] uppercase">Expired</SelectItem>
                       <SelectItem value="reminder" className="text-[10px] uppercase">Due</SelectItem>
                    </SelectContent>
                 </Select>
                 {history.length > 0 && <button onClick={() => setShowClearAllConfirm(true)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all border border-red-500/10"><Trash2 className="w-4 h-4" /></button>}
              </div>
           </div>

           <div className="space-y-3">
              {historyLoading ? (
                 <div className="grid grid-cols-1 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                 </div>
              ) : history.length === 0 ? (
                 <div className="p-32 text-center opacity-10 flex flex-col items-center gap-6 border-2 border-dashed border-white/5 rounded-[4rem]">
                    <Activity className="w-12 h-12 text-primary" />
                    <p className="text-xl font-headline font-black uppercase tracking-[0.4em]">Zero Matrix Entries</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                   {history.map(item => (
                     <Card key={item.id} className="glass-card border-border hover:border-primary/20 transition-all group overflow-hidden bg-black/20">
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                           <div className="flex items-center gap-5 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 shadow-inner group-hover:text-primary transition-colors">
                                 {getFileIcon(item.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                 <div className="flex flex-wrap items-center gap-3">
                                    <h4 className="text-xs font-bold text-foreground break-words uppercase tracking-tight leading-tight">{item.name}</h4>
                                    {getAlertBadge(item)}
                                 </div>
                                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                    <div className="flex items-center gap-1 text-[8px] font-black text-foreground/20 uppercase tracking-widest"><Clock className="w-2.5 h-2.5" />{format(item.timestamp, 'MMM d, HH:mm')}</div>
                                    <div className="flex items-center gap-1 text-[8px] font-bold text-primary/60 uppercase tracking-widest"><Globe className="w-2.5 h-2.5" />{item.provider}</div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-foreground/20 uppercase tracking-widest"><Layers className="w-3 h-3" />{formatSize(item.size)}</div>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button onClick={() => { navigator.clipboard.writeText(item.url); toast({ title: "Copied" }); }} className="p-2 rounded-lg bg-background border border-border text-foreground/20 hover:text-primary transition-all"><Copy className="w-3.5 h-3.5" /></button>
                              <button onClick={() => window.open(item.url, '_blank')} className="p-2 rounded-lg bg-background border border-border text-foreground/20 hover:text-primary transition-all"><ExternalLink className="w-3.5 h-3.5" /></button>
                              <Button onClick={() => handleDownloadFile(item.url, item.name)} variant="outline" className="h-9 px-3 rounded-lg border-border bg-background text-[8px] font-black uppercase hover:bg-primary hover:text-white transition-all"><Download className="w-3.5 h-3.5 mr-1.5" /> Save</Button>
                              <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-2 text-foreground/10 hover:text-primary transition-all">{expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                              <button onClick={() => setItemToDelete(item.id)} className="p-2 text-foreground/10 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                        {expandedId === item.id && (
                           <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                              <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 space-y-6 shadow-inner relative overflow-hidden">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <div className="space-y-2">
                                       <Label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Temporal Expiry</Label>
                                       <Input type="datetime-local" value={item.expiryDate ? format(new Date(item.expiryDate), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => { updateDoc(doc(db!, 'temp_upload_history', item.id), { expiryDate: e.target.value }); toast({ title: "Expiry Updated" }); }} className="h-10 bg-secondary/30 border-white/5 rounded-xl text-[10px] font-bold uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                       <Label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Alert Reminder</Label>
                                       <Input type="datetime-local" value={item.reminderDate ? format(new Date(item.reminderDate), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => { updateDoc(doc(db!, 'temp_upload_history', item.id), { reminderDate: e.target.value }); toast({ title: "Reminder Set" }); }} className="h-10 bg-secondary/30 border-white/5 rounded-xl text-[10px] font-bold uppercase" />
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
        </main>
      </div>

      <AlertDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto"><Unplug className="w-8 h-8" /></div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Disconnect Host</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">Are you sure you want to decouple this node?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={disconnectProvider} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl shadow-destructive/20">Disconnect</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto"><Trash2 className="w-8 h-8" /></div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Delete Record</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">This action definitively purges the registry entry.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && deleteRecord(itemToDelete)} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto"><ShieldAlert className="w-8 h-8" /></div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Purge Archive</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">Are you sure you want to clear all history?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllHistory} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl">Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
