
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
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  File as FileIcon,
  Filter,
  Clock,
  RotateCcw,
  Check
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import * as actions from './actions';
import { differenceInDays, format, isBefore, isAfter, addDays } from 'date-fns';
import { GetHelp } from '@/components/qr-canvas/get-help';

type ProviderId = 'r2' | 'imgbb' | 'gofile' | 'pixeldrain' | 'custom';

interface ProviderConfig {
  id: ProviderId;
  label: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}

const PROVIDERS: ProviderConfig[] = [
  { id: 'imgbb', label: 'ImgBB', fields: [
    { key: 'apiKey', label: 'API Key', placeholder: 'Enter ImgBB API Key' },
  ]},
  { id: 'gofile', label: 'GoFile', fields: [
    { key: 'token', label: 'API Token (Optional)', placeholder: 'Enter Account Token' },
  ]},
  { id: 'pixeldrain', label: 'Pixeldrain', fields: [
    { key: 'apiKey', label: 'API Key', placeholder: 'Enter API Key' },
  ]},
  { id: 'r2', label: 'Cloudflare R2', fields: [
    { key: 'accountId', label: 'Account ID', placeholder: 'Enter Account ID' },
    { key: 'accessKey', label: 'Access Key', placeholder: 'Enter Access Key' },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'Enter Secret Key', type: 'password' },
    { key: 'bucket', label: 'Bucket Name', placeholder: 'e.g. static-assets' },
    { key: 'publicUrl', label: 'Public URL / Endpoint', placeholder: 'https://pub-xxx.r2.dev' },
  ]},
  { id: 'custom', label: 'Custom API', fields: [
    { key: 'url', label: 'API URL', placeholder: 'https://api.site.com/upload' },
    { key: 'apiKey', label: 'API Key / Token', placeholder: 'Enter Token' },
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
  
  // Storage State
  const [activeProvider, setActiveProvider] = useState<ProviderId>('imgbb');
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  
  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUploadUrl, setLastUploadUrl] = useState<string | null>(null);

  // History & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'temp_upload_history'), where('uid', '==', user.uid));
  }, [db, user]);

  const { data: historyData, loading: historyLoading } = useCollection<UploadRecord>(historyQuery);

  // --- Filtering Matrix ---
  const history = useMemo(() => {
    const list = historyData || [];
    const now = new Date();

    return list
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
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

  // --- Alerts Engine ---
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
          duration: 6000
        });
      }
    }
  }, [historyData, toast]);

  // --- Persistence & Handshake ---
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
  };

  const disconnectProvider = (id: string) => {
    const nextConnected = new Set(connectedIds);
    nextConnected.delete(id);
    setConnectedIds(nextConnected);
    localStorage.setItem('mykit_temp_upload_connected', JSON.stringify(Array.from(nextConnected)));
    toast({ title: "Node Decoupled" });
  };

  // --- Upload Engine ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    toast({ title: "Registry Purged" });
  };

  const updateReminder = (id: string, date: string, note?: string) => {
    if (!db) return;
    updateDoc(doc(db, 'temp_upload_history', id), { reminderDate: date, reminderNote: note }).then(() => {
      toast({ title: "Reminder Synced" });
    });
  };

  const getAlertBadge = (item: UploadRecord) => {
    const now = new Date();
    if (item.expiryDate) {
      const expiry = new Date(item.expiryDate);
      if (isBefore(expiry, now)) return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[7px] uppercase font-black">EXPIRED</Badge>;
      if (differenceInDays(expiry, now) <= 3) return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[7px] uppercase font-black">EXPIRING SOON</Badge>;
    }
    if (item.reminderDate) {
      const reminder = new Date(item.reminderDate);
      if (isBefore(reminder, now)) return <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] uppercase font-black">REMINDER DUE</Badge>;
    }
    return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[7px] uppercase font-black">ACTIVE</Badge>;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5 text-emerald-500" />;
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5 text-rose-500" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5 text-blue-500" />;
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="w-5 h-5 text-amber-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <FileIcon className="w-5 h-5 text-foreground/40" />;
  };

  const handleDownload = async (url: string, name: string) => {
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-24 max-w-7xl">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT: Provider & Upload */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Server className="w-5 h-5 text-primary" /> Node Calibration
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Select Storage Protocol</Label>
                    <Select value={activeProvider} onValueChange={(v: ProviderId) => setActiveProvider(v)}>
                      <SelectTrigger className="h-14 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-inner">
                        <SelectValue placeholder="Choose Provider" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {PROVIDERS.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">
                             <div className="flex items-center gap-2">
                                {p.label}
                                {connectedIds.has(p.id) && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                             </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{PROVIDERS.find(p => p.id === activeProvider)?.label} Config</h3>
                       {connectedIds.has(activeProvider) && (
                         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" /> Connected
                         </div>
                       )}
                    </div>
                    
                    <div className="grid gap-5">
                       {PROVIDERS.find(p => p.id === activeProvider)?.fields.map(f => (
                         <div key={f.key} className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-foreground/30 ml-1">{f.label}</Label>
                            <Input 
                              type={f.type || 'text'}
                              value={configs[activeProvider]?.[f.key] || ''}
                              onChange={e => setConfigs({ ...configs, [activeProvider]: { ...(configs[activeProvider] || {}), [f.key]: e.target.value } })}
                              placeholder={f.placeholder}
                              className="h-11 bg-secondary/50 border-border text-xs font-bold"
                            />
                         </div>
                       ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                       <Button onClick={saveConfig} className="flex-1 h-14 bg-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-primary/30">
                          <Zap className="w-4 h-4 mr-2" /> Connect Node
                       </Button>
                       {connectedIds.has(activeProvider) && (
                         <Button variant="outline" onClick={() => disconnectProvider(activeProvider)} className="h-14 w-14 rounded-2xl border-border bg-secondary hover:text-destructive">
                            <Unplug className="w-5 h-5" />
                         </Button>
                       )}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className={cn(
             "glass-card border-border shadow-2xl transition-all duration-700 overflow-hidden",
             !connectedIds.has(activeProvider) && "opacity-30 pointer-events-none grayscale"
           )}>
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <FileUp className="w-5 h-5 text-primary" /> Transmission Intake
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) setFile(f); }}
                  className={cn(
                    "relative h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 cursor-pointer group/upload transition-all",
                    file && "border-solid border-primary/20 bg-background/50"
                  )}
                 >
                    {file ? (
                      <div className="text-center p-6 space-y-2">
                         <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
                            {getFileIcon(file.type)}
                         </div>
                         <p className="text-xs font-bold text-foreground truncate max-w-[240px] uppercase">{file.name}</p>
                         <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{formatSize(file.size)} detected</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                         <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary transition-all mx-auto shadow-xl">
                            <Upload className="w-8 h-8" />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover/upload:text-primary transition-colors">Select Payload</span>
                            <p className="text-[8px] text-foreground/20 font-bold uppercase tracking-widest leading-relaxed">ALL FORMATS (Max 100MB)</p>
                         </div>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                 </div>

                 <div className="space-y-6">
                  {isProcessing && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                          <span className="animate-pulse flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing Link...</span>
                          <span>{uploadProgress}%</span>
                       </div>
                       <Progress value={uploadProgress} className="h-1.5" />
                    </div>
                  )}
                  <Button 
                    onClick={executeUpload} 
                    disabled={isProcessing || !file || !connectedIds.has(activeProvider)}
                    className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Upload className="w-5 h-5 mr-3" />}
                    Upload
                  </Button>
                  {(file || lastUploadUrl) && (
                    <button onClick={handleClearWorkspace} className="w-full text-[9px] font-black uppercase text-foreground/20 hover:text-primary transition-all">Clear Workspace</button>
                  )}
                </div>

                {lastUploadUrl && (
                   <div className="p-8 rounded-[3rem] bg-emerald-500/10 border border-emerald-500/20 space-y-6 animate-in zoom-in-95 duration-500 shadow-2xl">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Public Signal Active</span>
                         </div>
                         <button onClick={() => setLastUploadUrl(null)} className="text-emerald-500/40 hover:text-emerald-500"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="p-4 bg-black/40 rounded-xl border border-emerald-500/10 font-mono text-[10px] text-foreground/60 break-all shadow-inner">
                         {lastUploadUrl}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => { navigator.clipboard.writeText(lastUploadUrl || ''); toast({ title: "Signal Isolated" }); }} className="h-12 bg-emerald-500 text-white font-black uppercase text-[10px] rounded-xl shadow-lg">
                           <Copy className="w-4 h-4 mr-2" /> Copy Link
                        </Button>
                        <Button asChild variant="outline" className="h-12 border-emerald-500/20 text-emerald-500 font-black uppercase text-[10px]">
                           <a href={lastUploadUrl} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4 mr-2" /> Download</a>
                        </Button>
                      </div>
                   </div>
                )}
              </CardContent>
           </Card>
        </div>

        {/* RIGHT: History & Registry */}
        <main className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-inner border border-border">
                    <History className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-headline font-black uppercase text-foreground/60 tracking-tight leading-none">Identity Archive</h3>
                    <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest mt-1">Registry of public file nodes</p>
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 <div className="relative group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                    <Input 
                      placeholder="Filter registry..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="h-10 pl-9 w-40 sm:w-64 bg-secondary/50 border-white/5 rounded-xl text-[9px] font-black uppercase"
                    />
                 </div>
                 <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="h-10 w-32 bg-secondary/50 border-white/5 text-[8px] font-black uppercase rounded-xl">
                       <Filter className="w-3 h-3 mr-2 text-primary/40" />
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                       <SelectItem value="all" className="text-[9px] font-black uppercase">All Status</SelectItem>
                       <SelectItem value="active" className="text-[9px] font-black uppercase">Active</SelectItem>
                       <SelectItem value="expiring" className="text-[9px] font-black uppercase">Expiring</SelectItem>
                       <SelectItem value="expired" className="text-[9px] font-black uppercase">Expired</SelectItem>
                       <SelectItem value="reminder" className="text-[9px] font-black uppercase">Reminder</SelectItem>
                    </SelectContent>
                 </Select>
                 {history.length > 0 && (
                    <button onClick={clearAllHistory} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all border border-red-500/10"><Trash2 className="w-4 h-4" /></button>
                 )}
              </div>
           </div>

           <div className="space-y-4 min-h-[600px]">
              {historyLoading ? (
                 <div className="grid grid-cols-1 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                       <Card key={i} className="glass-card p-6 border-border">
                          <div className="flex gap-6">
                             <Skeleton className="w-14 h-14 rounded-2xl" />
                             <div className="flex-1 space-y-3">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-3 w-1/3" />
                             </div>
                          </div>
                       </Card>
                    ))}
                 </div>
              ) : history.length === 0 ? (
                 <div className="p-32 text-center flex flex-col items-center gap-8 opacity-10 grayscale border-2 border-dashed border-white/5 rounded-[4rem]">
                    <Activity className="w-12 h-12 text-primary" />
                    <p className="text-xl font-headline font-black uppercase tracking-[0.4em]">Zero Matrix Entries</p>
                    {!user && <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Login to save history permanently</p>}
                 </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                   {history.map(item => (
                     <Card key={item.id} className="glass-card border-border hover:border-primary/20 transition-all group overflow-hidden">
                        <div className="p-5 sm:p-6 flex items-center justify-between gap-8">
                           <div className="flex items-center gap-6 min-w-0">
                              <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/40 shrink-0 shadow-inner group-hover:text-primary transition-colors">
                                 {getFileIcon(item.type)}
                              </div>
                              <div className="min-w-0">
                                 <div className="flex items-center gap-3">
                                    <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{item.customName || item.name}</h4>
                                    {getAlertBadge(item)}
                                 </div>
                                 <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{format(item.timestamp, 'MMM d, HH:mm')}</p>
                                    <span className="text-white/5">•</span>
                                    <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">{item.provider}</p>
                                    <span className="text-white/5">•</span>
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{formatSize(item.size)}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => { navigator.clipboard.writeText(item.url); toast({ title: "Link Copied" }); }} className="p-2.5 rounded-xl bg-background border border-border text-foreground/20 hover:text-primary transition-all shadow-sm"><Copy className="w-4 h-4" /></button>
                              <Button onClick={() => handleDownload(item.url, item.name)} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border bg-background text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                 <Download className="w-3.5 h-3.5 mr-2" /> Download
                              </Button>
                              <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-2 text-foreground/10 hover:text-primary transition-all">
                                 {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button onClick={() => deleteRecord(item.id)} className="p-2 text-foreground/10 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>

                        {expandedId === item.id && (
                           <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                              <div className="p-8 rounded-[3rem] bg-black/40 border border-white/5 space-y-8 shadow-inner">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3 text-primary/60">
                                          <Calendar className="w-4 h-4" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">Temporal Bounds (Expiry)</span>
                                       </div>
                                       <Input 
                                          type="datetime-local"
                                          value={item.expiryDate ? format(new Date(item.expiryDate), "yyyy-MM-dd'T'HH:mm") : ''}
                                          onChange={e => {
                                             updateDoc(doc(db!, 'temp_upload_history', item.id), { expiryDate: e.target.value });
                                             toast({ title: "Expiry Updated" });
                                          }}
                                          className="h-12 bg-secondary/30 border-white/5 text-[11px] font-bold uppercase"
                                       />
                                    </div>
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3 text-primary/60">
                                          <Bell className="w-4 h-4" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">Protocol Alert (Reminder)</span>
                                       </div>
                                       <Input 
                                          type="datetime-local"
                                          value={item.reminderDate ? format(new Date(item.reminderDate), "yyyy-MM-dd'T'HH:mm") : ''}
                                          onChange={e => updateReminder(item.id, e.target.value, item.reminderNote)}
                                          className="h-12 bg-secondary/30 border-white/5 text-[11px] font-bold uppercase"
                                       />
                                    </div>
                                 </div>
                                 
                                 <div className="space-y-3">
                                    <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-widest ml-1">Linguistic Reminder Note</Label>
                                    <Input 
                                       placeholder="e.g. Identity expires after client demo..."
                                       value={item.reminderNote || ''}
                                       onChange={e => updateDoc(doc(db!, 'temp_upload_history', item.id), { reminderNote: e.target.value })}
                                       className="h-12 bg-secondary/20 border-white/5 text-xs italic font-medium"
                                    />
                                 </div>
                                 <div className="pt-4 flex justify-end gap-3">
                                    <Button asChild variant="outline" className="h-10 px-6 border-white/10 bg-white/5 text-[9px] font-black uppercase">
                                       <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-2" /> Open Node</a>
                                    </Button>
                                    <Button onClick={() => handleCopy(item.url, 'direct')} className="h-10 px-6 bg-primary text-white text-[9px] font-black uppercase">Copy URL</Button>
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
