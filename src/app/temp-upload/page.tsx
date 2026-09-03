'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Cloud, 
  Upload, 
  Settings, 
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
  Settings2,
  Layers,
  ChevronRight,
  Maximize,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// --- Global Utilities ---

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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

  // Initial Check for Reminders
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      const now = new Date();
      const dueReminders = historyData.filter(item => 
        item.reminderDate && isBefore(new Date(item.reminderDate), now)
      );
      
      if (dueReminders.length > 0) {
        toast({
          title: "Studio Reminder Active",
          description: `You have ${dueReminders.length} asset(s) with active reminders.`,
        });
      }
    }
  }, [historyData, toast]);

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
    setLastUploadUrl(null);

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
            setDoc(docRef, payload).catch(async (e) => {
               errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'create', requestResourceData: payload }));
            });
          }

          toast({ title: "Uplink Success", description: "Matrix synchronized with storage node." });
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
    deleteDoc(doc(db, 'temp_upload_history', id)).catch(() => {});
    setItemToDelete(null);
    toast({ title: "Registry Purged" });
  };

  const clearAllHistory = async () => {
    if (!db || !user || history.length === 0) return;
    const batch = writeBatch(db);
    history.forEach(item => {
      batch.delete(doc(db, 'temp_upload_history', item.id));
    });
    
    try {
      await batch.commit();
      setShowClearAllConfirm(false);
      toast({ title: "Archive Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" });
    }
  };

  const updateReminder = (id: string, date: string, note?: string) => {
    if (!db) return;
    updateDoc(doc(db, 'temp_upload_history', id), { reminderDate: date, reminderNote: note }).then(() => {
      toast({ title: "Reminder Synced" });
    });
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
      toast({ title: "Download Started" });
    } catch (e) {
      window.open(url, '_blank');
      toast({ title: "External Link", description: "Node restricted direct fetch. Link opened in new tab." });
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
      if (isBefore(reminder, now)) return <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] uppercase font-black px-2 py-0.5">REMINDER DUE</Badge>;
    }
    return null;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-emerald-500" />;
    if (type.startsWith('video/')) return <FileVideo className="w-4 h-4 text-rose-500" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4 text-blue-500" />;
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="w-4 h-4 text-amber-500" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    return <FileIcon className="w-4 h-4 text-foreground/40" />;
  };

  const toggleSecret = (fieldKey: string) => {
    setShowSecrets(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const toggleConfig = () => {
    const next = !isConfigOpen;
    setIsConfigOpen(next);
    if (next) {
      setTimeout(() => {
        configCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const currentProviderConfig = useMemo(() => 
    PROVIDERS.find(p => p.id === activeProvider), 
  [activeProvider]);

  const isCurrentConnected = connectedIds.has(activeProvider);

  if (authLoading) return null;

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-7xl">
        {/* HERO SECTION */}
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

        {!user ? (
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
                 <Link href="/login?redirect=/temp-upload">Initialize Session</Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                 <Link href="/">Explore Suite</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start animate-in fade-in duration-1000">
            
            {/* LEFT: Calibration & Intake */}
            <div className="lg:col-span-5 space-y-12">
              
              <div className="space-y-8">
                 <div className="space-y-2 px-1">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Calibration</Label>
                    <h3 className="text-xl font-headline font-black text-foreground uppercase tracking-tight">Select Storage Protocol</h3>
                    <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-widest">Connect to your private storage node.</p>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <Select value={activeProvider} onValueChange={(v: ProviderId) => { setActiveProvider(v); setIsConfigOpen(false); }}>
                        <SelectTrigger className="h-14 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest focus:ring-primary/40">
                          <SelectValue placeholder="Choose Provider" />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {PROVIDERS.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase tracking-widest">
                              <div className="flex items-center gap-3">
                                  {p.label}
                                  {connectedIds.has(p.id) && <CheckCircle2 className="w-3" />}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={toggleConfig}
                      className={cn(
                        "h-14 px-6 rounded-2xl border-white/10 text-[9px] font-black uppercase tracking-widest transition-all w-full sm:w-auto",
                        isConfigOpen ? "bg-primary text-white border-primary" : "bg-secondary"
                      )}
                    >
                      {isConfigOpen ? <ChevronUp className="w-4 h-4 mr-2" /> : <Settings2 className="w-4 h-4 mr-2" />}
                      {isConfigOpen ? 'Close Matrix' : 'Configure Node'}
                    </Button>
                 </div>

                 {/* Collapsible Config Card */}
                 {isConfigOpen && currentProviderConfig && (
                   <div ref={configCardRef} className="animate-in slide-in-from-top-4 duration-500">
                      <Card className="glass-card border-primary/20 bg-primary/[0.03] shadow-2xl overflow-hidden">
                         <CardHeader className="py-6 px-8 border-b border-primary/10 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                  <Settings className="w-5 h-5" />
                               </div>
                               <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{currentProviderConfig.label} Matrix</span>
                            </div>
                            <Badge variant="outline" className={cn(
                              "text-[8px] font-black uppercase px-3 py-1 rounded-full",
                              isCurrentConnected ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/5"
                            )}>
                               {isCurrentConnected ? 'ACTIVE' : 'STANDBY'}
                            </Badge>
                         </CardHeader>
                         <CardContent className="p-8 space-y-8">
                            <div className="grid gap-6">
                               {currentProviderConfig.fields.map(f => (
                                 <div key={f.key} className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">{f.label}</Label>
                                    <div className="relative">
                                       <Input 
                                         type={f.isSecret && !showSecrets[f.key] ? 'password' : 'text'}
                                         value={configs[activeProvider]?.[f.key] || ''}
                                         onChange={e => setConfigs({ ...configs, [activeProvider]: { ...(configs[activeProvider] || {}), [f.key]: e.target.value } })}
                                         placeholder={f.placeholder}
                                         className="h-12 bg-black/40 border-border rounded-xl text-xs font-bold px-5"
                                       />
                                       {f.isSecret && (
                                          <button 
                                            onClick={() => toggleSecret(f.key)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                                          >
                                             {showSecrets[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                          </button>
                                       )}
                                    </div>
                                 </div>
                               ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                               <Button onClick={saveConfig} className="flex-1 h-14 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30">
                                  <Zap className="w-4 h-4 mr-2" /> Initialize Handshake
                               </Button>
                               {isCurrentConnected && (
                                 <Button variant="outline" onClick={() => setShowDisconnectConfirm(true)} className="h-14 w-14 rounded-2xl border-destructive/20 bg-destructive/5 text-destructive hover:bg-red-500 hover:text-white transition-all">
                                    <Unplug className="w-5 h-5" />
                                 </Button>
                               )}
                            </div>
                         </CardContent>
                      </Card>
                   </div>
                 )}
              </div>

              <Card className={cn(
                 "glass-card border-border shadow-2xl transition-all duration-700 overflow-hidden bg-[#060608]",
                 !isCurrentConnected && "opacity-20 pointer-events-none grayscale blur-[1px]"
              )}>
                 <CardHeader className="py-6 border-b border-white/5 bg-secondary/30">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 text-foreground">
                       <FileUp className="w-5 h-5 text-primary" /> Transmission Intake
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-10 space-y-10">
                    <div 
                     onClick={() => !isProcessing && fileInputRef.current?.click()}
                     onDragOver={e => e.preventDefault()}
                     onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) setFile(f); }}
                     className={cn(
                       "relative h-56 rounded-[3rem] border-2 border-dashed border-white/5 hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-black/40 cursor-pointer group/upload",
                       file && "border-solid border-primary/20 bg-primary/[0.02]"
                     )}
                    >
                       {file ? (
                         <div className="text-center p-8 space-y-4 animate-in zoom-in">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
                               {getFileIcon(file.type)}
                            </div>
                            <div className="space-y-1 min-w-0">
                               <p className="text-sm font-bold text-white truncate max-w-[280px] uppercase tracking-tight">{file.name}</p>
                               <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{formatSize(file.size)} Payload</p>
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
                             <span className="animate-pulse">Synthesizing Link...</span>
                             <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-1" />
                       </div>
                     )}
                     <Button 
                       onClick={executeUpload} 
                       disabled={isProcessing || !file || !isCurrentConnected}
                       className="w-full h-20 bg-primary text-white font-black text-lg uppercase tracking-[0.3em] rounded-[2.5rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                     >
                       {isProcessing ? <Loader2 className="w-8 h-8 animate-spin mr-3" /> : <Upload className="w-8 h-8 mr-4" />}
                       Upload
                     </Button>
                     {(file || lastUploadUrl) && (
                       <button onClick={() => { setFile(null); setLastUploadUrl(null); setUploadProgress(0); }} className="w-full text-[10px] font-black uppercase text-foreground/20 hover:text-primary transition-all tracking-widest">Clear Buffer</button>
                     )}
                   </div>

                   {lastUploadUrl && (
                      <div className="p-8 rounded-[3rem] bg-emerald-500/10 border border-emerald-500/20 space-y-6 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                         <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                               <Globe className="w-5 h-5 text-emerald-500" />
                               <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Public URL Node</span>
                          </div>
                          <button onClick={() => setLastUploadUrl(null)} className="text-emerald-500/40 hover:text-emerald-500"><X className="w-5 h-5" /></button>
                       </div>
                       <div className="p-5 bg-black/60 rounded-2xl border border-emerald-500/20 font-mono text-xs font-bold text-foreground/60 break-all shadow-inner relative z-10">
                          {lastUploadUrl}
                       </div>
                       <div className="grid grid-cols-2 gap-4 relative z-10">
                         <Button onClick={() => { navigator.clipboard.writeText(lastUploadUrl || ''); toast({ title: "Isolated" }); }} className="h-14 bg-emerald-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl">
                            <Copy className="w-4 h-4 mr-2" /> Copy Link
                         </Button>
                         <Button asChild variant="outline" className="h-14 border-emerald-500/30 text-emerald-500 font-black uppercase text-[10px] bg-white/5">
                            <a href={lastUploadUrl} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4 mr-2" /> Save</a>
                         </Button>
                      </div>
                   </div>
                 )}
              </CardContent>
            </Card>

            <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All binary synthesis and node communication occur strictly via secure server actions.
                  </p>
                </div>
             </div>
            </div>

            {/* RIGHT: Registry & History */}
            <main className="lg:col-span-7 xl:col-span-8 space-y-12">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 px-2">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-inner border border-border">
                        <History className="w-8 h-8" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-3xl font-headline font-black uppercase text-foreground/60 tracking-tighter leading-none">Archive Registry</h3>
                      <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Personal Node History</p>
                   </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                   <div className="relative group/search">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                      <Input 
                        placeholder="Filter archives..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="h-12 pl-12 w-full sm:w-80 bg-secondary/50 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      />
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                        <SelectTrigger className="h-12 w-36 bg-secondary/50 border-white/5 text-[9px] font-black uppercase tracking-widest rounded-2xl">
                           <Filter className="w-3.5 h-3.5 mr-2 text-primary/40" />
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                           <SelectItem value="all" className="text-[10px] font-black uppercase">All Status</SelectItem>
                           <SelectItem value="active" className="text-[10px] font-black uppercase">Active</SelectItem>
                           <SelectItem value="expiring" className="text-[10px] font-black uppercase">Expiring</SelectItem>
                           <SelectItem value="expired" className="text-[10px] font-black uppercase">Expired</SelectItem>
                           <SelectItem value="reminder" className="text-[10px] font-black uppercase">Reminder</SelectItem>
                        </SelectContent>
                     </Select>
                     
                     {history.length > 0 && (
                        <button onClick={() => setShowClearAllConfirm(true)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all border border-red-500/10 shadow-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                     )}
                   </div>
                </div>
             </div>

             <div className="space-y-3 min-h-[600px]">
                {historyLoading ? (
                   <div className="grid grid-cols-1 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                         <Card key={i} className="glass-card p-6 border-border">
                            <div className="flex gap-6">
                               <Skeleton className="w-12 h-12 rounded-xl" />
                               <div className="flex-1 space-y-3">
                                  <Skeleton className="h-4 w-1/2" />
                                  <Skeleton className="h-3 w-1/4" />
                               </div>
                            </div>
                         </Card>
                      ))}
                   </div>
                ) : history.length === 0 ? (
                   <div className="p-32 text-center flex flex-col items-center gap-10 opacity-10 grayscale border-2 border-dashed border-white/5 rounded-[4rem]">
                      <Activity className="w-16 h-16 text-primary" />
                      <div className="space-y-2">
                         <p className="text-2xl font-headline font-black uppercase tracking-[0.4em]">Zero Matrix Entries</p>
                      </div>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                     {history.map(item => (
                       <Card key={item.id} className={cn("glass-card border-border hover:border-primary/20 transition-all group overflow-hidden bg-black/20")}>
                          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                             <div className="flex items-center gap-5 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary/40 shrink-0 shadow-inner group-hover:text-primary transition-colors">
                                   {getFileIcon(item.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                   <div className="flex flex-wrap items-center gap-3">
                                      <h4 className="text-xs font-bold text-foreground break-words uppercase tracking-tight leading-tight">{item.name}</h4>
                                      {getAlertBadge(item)}
                                   </div>
                                   <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                      <div className="flex items-center gap-1 text-[8px] font-black text-foreground/20 uppercase tracking-widest">
                                         <Clock className="w-2.5 h-2.5" />
                                         {format(item.timestamp, 'MMM d, HH:mm')}
                                      </div>
                                      <span className="text-white/5">•</span>
                                      <div className="flex items-center gap-1 text-[8px] font-bold text-primary/60 uppercase tracking-widest">
                                         <Globe className="w-2.5 h-2.5" />
                                         {item.provider}
                                      </div>
                                      <span className="text-white/5">•</span>
                                      <div className="flex items-center gap-1.5 text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                                         <Layers className="w-3 h-3" />
                                         {formatSize(item.size)}
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button onClick={() => { navigator.clipboard.writeText(item.url); toast({ title: "Isolated" }); }} className="p-2 rounded-lg bg-background border border-border text-foreground/20 hover:text-primary transition-all shadow-sm" title="Copy Link"><Copy className="w-3.5 h-3.5" /></button>
                                <button onClick={() => window.open(item.url, '_blank')} className="p-2 rounded-lg bg-background border border-border text-foreground/20 hover:text-primary transition-all shadow-sm" title="Open Link"><ExternalLink className="w-3.5 h-3.5" /></button>
                                <Button onClick={() => handleDownloadFile(item.url, item.name)} variant="outline" className="h-9 px-3 rounded-lg border-border bg-background text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                                   <Download className="w-3.5 h-3.5 mr-1.5" /> Save
                                </Button>
                                <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-2 text-foreground/10 hover:text-primary transition-all">
                                   {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setItemToDelete(item.id)} className="p-2 text-foreground/10 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>

                          {expandedId === item.id && (
                             <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 space-y-8 shadow-inner relative overflow-hidden">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                      <div className="space-y-3">
                                         <div className="flex items-center gap-2 text-primary/60">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Temporal Expiry</span>
                                         </div>
                                         <Input 
                                            type="datetime-local"
                                            value={item.expiryDate ? format(new Date(item.expiryDate), "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={e => {
                                               updateDoc(doc(db!, 'temp_upload_history', item.id), { expiryDate: e.target.value });
                                               toast({ title: "Expiry Updated" });
                                            }}
                                            className="h-11 bg-secondary/30 border-white/10 rounded-xl text-[11px] font-bold uppercase"
                                         />
                                      </div>
                                      <div className="space-y-3">
                                         <div className="flex items-center gap-2 text-primary/60">
                                            <Bell className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Alert Reminder</span>
                                         </div>
                                         <Input 
                                            type="datetime-local"
                                            value={item.reminderDate ? format(new Date(item.reminderDate), "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={e => updateReminder(item.id, e.target.value, item.reminderNote)}
                                            className="h-11 bg-secondary/30 border-white/10 rounded-xl text-[11px] font-bold uppercase"
                                         />
                                      </div>
                                   </div>
                                   
                                   <div className="space-y-3 relative z-10">
                                      <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Contextual Reminder Note</Label>
                                      <Input 
                                         placeholder="e.g. For client production review session..."
                                         value={item.reminderNote || ''}
                                         onChange={e => updateDoc(doc(db!, 'temp_upload_history', item.id), { reminderNote: e.target.value })}
                                         className="h-11 bg-secondary/20 border-white/10 rounded-xl text-[11px] italic"
                                      />
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
      )}

      {/* --- CONFIRMATION OVERLAYS --- */}

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
              Are you sure you want to disconnect your private storage node?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={disconnectProvider}
              className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] tracking-widest shadow-xl shadow-destructive/20"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <Trash2 className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">
               Delete Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => itemToDelete && deleteRecord(itemToDelete)}
              className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl shadow-destructive/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All History Confirmation */}
      <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">
               Clear Archive
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
              Are you sure you want to clear all history? This will definitively purge your entire registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearAllHistory}
              className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl shadow-destructive/20"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
