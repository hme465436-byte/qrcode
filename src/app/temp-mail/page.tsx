"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Mail, 
  RefreshCcw, 
  Copy, 
  Trash2, 
  Inbox, 
  ArrowRight, 
  Loader2, 
  Clock, 
  User, 
  X, 
  Zap, 
  ShieldCheck, 
  Activity,
  MessageSquare,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  Plus,
  Server,
  ChevronRight,
  Globe,
  CheckCircle2,
  Check,
  Search,
  Pin,
  PinOff,
  Download,
  FileCode,
  FileDown,
  KeyRound,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  History,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import DOMPurify from 'dompurify';
import { fetchFromProvider } from './actions';

const PROVIDERS = [
  { id: '1secmail', label: '1secmail (Global)', icon: Globe },
  { id: 'mailtm', label: 'Mail.tm (High Fidelity)', icon: ShieldCheck },
  { id: 'guerrilla', label: 'Guerrilla Mail (Classic)', icon: Activity },
];

const REFRESH_RATE = 10; 
const PIN_STORAGE_KEY = 'mykit_tempmail_pinned_v1';
const HISTORY_STORAGE_KEY = 'mykit_tempmail_history_v1';

interface MailMessage {
  id: string | number;
  from: string;
  subject: string;
  date: string;
}

interface FullMessage {
  id: string | number;
  from: string;
  subject: string;
  date: string;
  htmlBody: string;
  body: string;
}

interface HistoryItem {
  email: string;
  provider: string;
  timestamp: number;
}

export default function TempMailPage() {
  const { toast } = useToast();
  
  // Settings & Status State
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [sessionData, setSessionData] = useState<any>(null); 
  const [email, setEmail] = useState<string | null>(null);
  const [customUsername, setCustomUsername] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Data State
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<FullMessage | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedIds, setPinnedIds] = useState<Set<string | number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_RATE);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- 1. Audio Notification Engine ---
  const playNotification = useCallback(() => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, [isMuted]);

  // --- 2. Handshake & Persistence ---
  useEffect(() => {
    const savedPins = localStorage.getItem(PIN_STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedPins) try { setPinnedIds(new Set(JSON.parse(savedPins))); } catch (e) {}
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    
    setIsLoaded(true);
    generateMail();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(Array.from(pinnedIds)));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }, [pinnedIds, history, isLoaded]);

  const addToHistory = (newEmail: string, prov: string) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.email !== newEmail);
      return [{ email: newEmail, provider: prov, timestamp: Date.now() }, ...filtered].slice(0, 20);
    });
  };

  const generateMail = async (targetProvider = provider, username?: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(null);
    setMessages([]);
    setSessionData(null);
    setUnreadCount(0);

    try {
      const action = username ? 'genCustomMailbox' : 'genRandomMailbox';
      const res = await fetchFromProvider(targetProvider, { action, username });
      
      if (res.success && res.email) {
        setEmail(res.email);
        setSessionData(res); 
        setCountdown(REFRESH_RATE);
        addToHistory(res.email, targetProvider);
        toast({ title: "Identity Active", description: `${res.email} ready.` });
      } else {
        throw new Error(res.error || "Username taken or node restricted.");
      }
    } catch (err: any) {
      setError(err.message || `Node [${targetProvider.toUpperCase()}] restricted.`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = useCallback(async (silent = false) => {
    if (!email) return;
    if (!silent) setIsRefreshing(true);
    
    try {
      const res = await fetchFromProvider(provider, { 
        action: 'getMessages', 
        email, 
        sid: sessionData?.sid, 
        token: sessionData?.token 
      });

      if (res.success && Array.isArray(res.messages)) {
        const incomingMsgs = res.messages;
        
        setMessages(prev => {
          if (incomingMsgs.length === 0 && prev.length > 0) return prev;

          const prevMap = new Map(prev.map(m => [m.id.toString(), m]));
          let newDetected = false;

          incomingMsgs.forEach(msg => {
            if (!prevMap.has(msg.id.toString())) {
              prevMap.set(msg.id.toString(), msg);
              newDetected = true;
            }
          });

          if (newDetected) {
            if (prev.length > 0) playNotification();
            const newCount = incomingMsgs.filter(m => !prev.some(p => p.id.toString() === m.id.toString())).length;
            setUnreadCount(u => u + newCount);
            
            return Array.from(prevMap.values()).sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }
          
          return prev;
        });
      }
    } catch (err) {
      console.warn("Polling interrupted.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [provider, email, sessionData, playNotification]);

  // --- 3. Polling Lifecycle ---
  useEffect(() => {
    if (!email) return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [email]);

  useEffect(() => {
    if (countdown === 0 && email) {
      fetchMessages(true);
      setCountdown(REFRESH_RATE);
    }
  }, [countdown, email, fetchMessages]);

  const handleProviderChange = (newVal: string) => {
    setProvider(newVal);
    generateMail(newVal);
  };

  const readMessage = async (id: string | number) => {
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetchFromProvider(provider, { 
        action: 'readMessage', 
        id, 
        email, 
        sid: sessionData?.sid, 
        token: sessionData?.token 
      });
      if (res.success) {
        setSelectedMsg({ ...res.message, id });
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Decode Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePin = (id: string | number) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- 4. Logic Matrix ---
  const detectedOtp = useMemo(() => {
    if (!selectedMsg) return null;
    const searchTarget = (selectedMsg.body + selectedMsg.htmlBody);
    const match = searchTarget.match(/\b\d{4,8}\b/);
    return match ? match[0] : null;
  }, [selectedMsg]);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = messages.filter(m => 
      m.from.toLowerCase().includes(q) || 
      m.subject.toLowerCase().includes(q)
    );

    return [...filtered].sort((a, b) => {
      const aPinned = pinnedIds.has(a.id);
      const bPinned = pinnedIds.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [messages, searchQuery, pinnedIds]);

  const handleDownload = (fmt: 'html' | 'eml') => {
    if (!selectedMsg) return;
    const content = fmt === 'html' ? selectedMsg.htmlBody : `From: ${selectedMsg.from}\nSubject: ${selectedMsg.subject}\nDate: ${selectedMsg.date}\n\n${selectedMsg.body}`;
    const blob = new Blob([content], { type: fmt === 'html' ? 'text/html' : 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_${selectedMsg.id}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
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
            <Zap className="w-3.5 h-3.5" /> Linguistic Suite Pro
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
            Temp <span className="text-primary italic">Mail Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <GetHelp toolId="temp-mail" />
           <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsMuted(!isMuted)} 
            className="h-10 w-10 rounded-xl border-border bg-secondary"
           >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
           </Button>
           <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchMessages()} 
            disabled={isRefreshing || !email} 
            className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary"
           >
             <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isRefreshing && "animate-spin")} /> {countdown}S
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Controls & History */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4 text-foreground">
                    <Server className="w-5 h-5 text-primary" /> Matrix Config
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Active Server Node</Label>
                       <Select value={provider} onValueChange={handleProviderChange}>
                          <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {PROVIDERS.map(p => (
                               <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">
                                  {p.label}
                               </SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Custom Identity (Prefix)</Label>
                       <div className="flex gap-2">
                          <Input 
                            value={customUsername} 
                            onChange={e => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                            placeholder="e.g. umar"
                            className="h-12 bg-secondary border-border rounded-xl font-bold"
                          />
                          <Button 
                            onClick={() => generateMail(provider, customUsername)}
                            disabled={!customUsername.trim() || isLoading}
                            className="h-12 px-4 bg-primary text-white font-black uppercase text-[9px] rounded-xl"
                          >
                            Set
                          </Button>
                       </div>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-secondary/50 border-2 border-primary/20 shadow-inner flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group/mail">
                       <p className="text-[9px] font-black uppercase text-primary/40 tracking-[0.6em] relative z-10">Active Mailbox</p>
                       {isLoading ? (
                         <Loader2 className="w-8 h-8 text-primary animate-spin" />
                       ) : (
                         <h2 className="text-xl font-headline font-black text-foreground break-all select-all relative z-10">
                            {email || "---"}
                         </h2>
                       )}
                       {unreadCount > 0 && <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center animate-bounce">{unreadCount}</div>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Button onClick={() => handleCopyText(email || '', 'identity')} disabled={!email} className="h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                          {isCopied === 'identity' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />} Copy Identity
                       </Button>
                       <Button variant="outline" onClick={() => generateMail()} className="h-14 border-border bg-secondary text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-primary">
                          <Plus className="w-4 h-4 mr-2" /> Random
                       </Button>
                    </div>
                 </div>

                 {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                       <AlertCircle className="w-4 h-4 text-destructive" />
                       <p className="text-[10px] font-bold text-destructive uppercase">{error}</p>
                    </div>
                 )}
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl flex flex-col max-h-[350px]">
              <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    <CardTitle className="text-[10px] font-black uppercase text-foreground">Identity History</CardTitle>
                 </div>
                 <button onClick={() => setHistory([])} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Clear</button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                 {history.length === 0 ? (
                    <div className="py-12 text-center opacity-10 space-y-2">
                       <History className="w-8 h-8 mx-auto" />
                       <p className="text-[9px] font-black uppercase tracking-widest">No History</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {history.map((h, i) => (
                         <div key={i} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all">
                            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setEmail(h.email); setProvider(h.provider); }}>
                               <p className="text-[11px] font-bold text-foreground truncate uppercase">{h.email}</p>
                               <p className="text-[8px] font-black text-foreground/20 uppercase">{h.provider}</p>
                            </div>
                            <button onClick={() => handleCopyText(h.email, `hist-${i}`)} className="p-2 text-foreground/10 hover:text-primary transition-colors">
                               <Copy className="w-3.5 h-3.5" />
                            </button>
                         </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Registry & Reader */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-col gap-6 shrink-0">
                 <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Inbox className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Registry</CardTitle>
                    </div>
                    {messages.length > 0 && <Badge className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full">{messages.length} Signals</Badge>}
                 </div>

                 <div className="relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                    <Input 
                      placeholder="Search signals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 bg-background/50 border-white/5 rounded-xl text-[10px] font-black uppercase"
                    />
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
                    {filteredMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-6 grayscale">
                         <Inbox className="w-24 h-24 text-primary" />
                         <p className="text-sm font-black uppercase tracking-[0.4em]">Signal Buffer Empty</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                         {filteredMessages.map((msg) => {
                           const isPinned = pinnedIds.has(msg.id);
                           return (
                            <div 
                              key={msg.id} 
                              className={cn("flex group hover:bg-primary/[0.03] transition-all cursor-pointer relative", isPinned && "bg-primary/[0.05]")}
                              onClick={() => readMessage(msg.id)}
                            >
                                <div className="flex-1 flex items-center gap-6 p-6 min-w-0">
                                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0", isPinned ? "bg-primary/20 text-primary" : "bg-secondary border border-border text-primary/30")}>
                                      <MessageSquare className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <h4 className="text-sm font-bold text-foreground truncate uppercase">{msg.subject || "(No Subject)"}</h4>
                                      <p className="text-[9px] font-bold text-foreground/20 uppercase truncate">{msg.from}</p>
                                  </div>
                                </div>
                                <div className="p-6 flex items-center gap-4 shrink-0 border-l border-white/5">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); togglePin(msg.id); }}
                                      className={cn("p-2 rounded-xl transition-all", isPinned ? "text-primary bg-primary/10" : "text-white/10 hover:text-primary")}
                                   >
                                      {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                   </button>
                                   <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary">
                                      <ArrowRight className="w-4 h-4" />
                                   </div>
                                </div>
                            </div>
                           );
                         })}
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Message Modal */}
      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="glass-card max-w-6xl border-white/20 p-0 overflow-hidden outline-none flex flex-col max-h-[85vh]">
          {selectedMsg && (
            <>
               <DialogHeader className="px-6 py-4 border-b border-white/5 bg-secondary/30 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                     <div className="min-w-0 flex-1">
                        <DialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight line-clamp-1">{selectedMsg.subject || "(NO SUBJECT)"}</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold text-foreground/40 uppercase truncate">From: {selectedMsg.from} • {selectedMsg.date}</DialogDescription>
                     </div>
                     <button onClick={() => setSelectedMsg(null)} className="p-2 rounded-lg text-foreground/20 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
               </DialogHeader>

               {detectedOtp && (
                 <div className="px-6 py-3 bg-primary/[0.05] border-b border-primary/20 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                       <KeyRound className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black uppercase text-primary tracking-widest">Verification Code:</span>
                       <span className="text-base font-mono font-black text-foreground tracking-widest select-all">{detectedOtp}</span>
                    </div>
                    <Button onClick={() => handleCopyText(detectedOtp, 'otp')} size="sm" className="h-9 px-4 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl">Copy Code</Button>
                 </div>
               )}
               
               <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-white">
                  <div className="max-w-none overflow-x-auto min-w-full">
                    {selectedMsg.htmlBody ? (
                      <div className="text-slate-900 leading-relaxed text-base whitespace-pre-wrap min-w-full p-6 sm:p-10" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMsg.htmlBody) }} />
                    ) : (
                      <pre className="text-slate-800 font-mono text-sm whitespace-pre-wrap p-6 sm:p-10 bg-slate-50 min-w-full">{selectedMsg.body}</pre>
                    )}
                  </div>
               </div>

               <div className="px-6 py-4 border-t border-white/5 bg-secondary/30 shrink-0 flex items-center justify-between">
                  <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Verified Local Protocol</span>
                  <div className="flex items-center gap-3">
                     <Button onClick={() => handleDownload('html')} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all"><FileCode className="w-3.5 h-3.5 mr-2" /> HTML</Button>
                     <Button onClick={() => handleDownload('eml')} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all"><FileDown className="w-3.5 h-3.5 mr-2" /> EML</Button>
                  </div>
               </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
