"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  KeyRound
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

export default function TempMailPage() {
  const { toast } = useToast();
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [sessionData, setSessionData] = useState<any>(null); 
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<FullMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedIds, setPinnedIds] = useState<Set<string | number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_RATE);

  useEffect(() => {
    const savedPins = localStorage.getItem(PIN_STORAGE_KEY);
    if (savedPins) {
      try {
        setPinnedIds(new Set(JSON.parse(savedPins)));
      } catch (e) {}
    }
    setIsLoaded(true);
    generateMail();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(Array.from(pinnedIds)));
    }
  }, [pinnedIds, isLoaded]);

  const generateMail = async (targetProvider = provider) => {
    setIsLoading(true);
    setError(null);
    setEmail(null);
    setMessages([]);
    setSessionData(null);

    try {
      const res = await fetchFromProvider(targetProvider, { action: 'genRandomMailbox' });
      if (res.success && res.email) {
        setEmail(res.email);
        setSessionData(res); 
        setCountdown(REFRESH_RATE);
        toast({ title: "Identity Synthesized", description: `${targetProvider.toUpperCase()} mailbox active.` });
      } else {
        throw new Error(res.error || "Node restricted.");
      }
    } catch (err: any) {
      setError(`Node [${targetProvider.toUpperCase()}] restricted. Switch protocol.`);
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
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.warn("Polling interrupted.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [provider, email, sessionData]);

  useEffect(() => {
    if (!email) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchMessages(true);
          return REFRESH_RATE;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [email, fetchMessages]);

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
    const next = new Set(pinnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPinnedIds(next);
  };

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

  const handleDownload = (type: 'html' | 'eml') => {
    if (!selectedMsg) return;
    
    let content = '';
    let filename = `mail_${selectedMsg.id}`;
    let mime = 'text/plain';

    if (type === 'html') {
      content = selectedMsg.htmlBody || selectedMsg.body;
      filename += '.html';
      mime = 'text/html';
    } else {
      content = [
        `From: ${selectedMsg.from}`,
        `To: ${email}`,
        `Subject: ${selectedMsg.subject}`,
        `Date: ${selectedMsg.date}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        selectedMsg.htmlBody || selectedMsg.body
      ].join('\r\n');
      filename += '.eml';
      mime = 'message/rfc822';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Master Exported" });
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> High-Fidelity Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Temp <span className="text-primary italic">Mail Studio Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional multi-node disposable email studio. Isolate anonymous digital identities with real-time private inboxes and sanitized visual masters.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="temp-mail" />
              <Button variant="outline" size="sm" onClick={() => fetchMessages()} disabled={isRefreshing || !email} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isRefreshing && "animate-spin")} /> Sync ({countdown}s)
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Server className="w-5 h-5 text-primary" /> Multi-Node Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Active Server Node</Label>
                       <Select value={provider} onValueChange={handleProviderChange}>
                          <SelectTrigger className="h-14 bg-secondary border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {PROVIDERS.map(p => (
                               <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase tracking-widest">
                                  <div className="flex items-center gap-2">
                                     {React.createElement(p.icon, { className: "w-3.5 h-3.5" })} {p.label}
                                  </div>
                               </SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-secondary/50 border-2 border-primary/20 shadow-inner flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group/mail">
                       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/mail:opacity-100 transition-opacity" />
                       <p className="text-[9px] font-black uppercase text-primary/40 tracking-[0.6em] relative z-10">Active Mailbox Identity</p>
                       {isLoading ? (
                         <div className="h-12 flex items-center justify-center">
                           <Loader2 className="w-8 h-8 text-primary animate-spin" />
                         </div>
                       ) : (
                         <h2 className="text-xl sm:text-2xl font-headline font-black text-foreground break-all select-all relative z-10">{email || "Uplink Lost"}</h2>
                       )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Button onClick={() => handleCopyText(email || '', 'Identity')} disabled={!email} className="h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                          {isCopied === 'Identity' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                          Copy Identity
                       </Button>
                       <Button variant="outline" onClick={() => generateMail()} className="h-14 border-border bg-secondary text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-primary">
                          <Plus className="w-4 h-4 mr-2" /> New Identity
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
        </div>

        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
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
                    {messages.length > 0 && (
                      <Badge className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">{messages.length} Signals Identified</Badge>
                    )}
                 </div>

                 <div className="relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                    <Input 
                      placeholder="Search registry..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 bg-background/50 border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    />
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
                    {filteredMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-6 grayscale">
                         <Inbox className="w-24 h-24 text-primary" />
                         <div className="text-center space-y-2">
                            <p className="text-sm font-black uppercase tracking-[0.4em]">Signal Buffer Empty</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest">Awaiting inbound data...</p>
                         </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                         {filteredMessages.map((msg) => {
                           const isPinned = pinnedIds.has(msg.id);
                           return (
                            <div 
                              key={msg.id} 
                              className={cn(
                                "flex flex-col sm:flex-row items-center group hover:bg-primary/[0.03] transition-all cursor-pointer relative overflow-hidden",
                                isPinned && "bg-primary/[0.05]"
                              )}
                              onClick={() => readMessage(msg.id)}
                            >
                                <div className="flex-1 flex items-center gap-6 p-6 min-w-0">
                                  <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0",
                                    isPinned ? "bg-primary/20 text-primary" : "bg-secondary border border-border text-primary/30 group-hover:text-primary"
                                  )}>
                                      <MessageSquare className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">Source Node</p>
                                        {isPinned && <Pin className="w-3 h-3 text-primary fill-current" />}
                                      </div>
                                      <h4 className="text-sm font-bold text-foreground truncate uppercase pr-10">{msg.subject || "(No Subject)"}</h4>
                                      <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter truncate">{msg.from}</p>
                                  </div>
                                </div>
                                
                                <div className="p-6 flex sm:flex-col items-center gap-4 shrink-0 sm:border-l border-white/5">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); togglePin(msg.id); }}
                                      className={cn("p-2 rounded-xl transition-all", isPinned ? "text-primary bg-primary/10" : "text-white/10 hover:text-primary")}
                                   >
                                      {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                   </button>
                                   <div className="text-right flex flex-col items-end gap-1">
                                      <span className="text-[8px] font-black text-foreground/10 uppercase tracking-widest">{msg.date}</span>
                                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary transition-all">
                                          <ArrowRight className="w-4 h-4" />
                                      </div>
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

      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="glass-card max-w-6xl border-white/20 p-0 overflow-hidden outline-none flex flex-col max-h-[85vh]">
          {selectedMsg && (
            <>
               <DialogHeader className="px-6 py-4 border-b border-white/5 bg-secondary/30 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                     <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                           <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20">Protocol Verified</Badge>
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-headline font-black text-foreground uppercase tracking-tight line-clamp-2">
                           {selectedMsg.subject || "(NO SUBJECT)" }
                        </DialogTitle>
                        <DialogDescription className="sr-only">Detailed message content from {selectedMsg.from}</DialogDescription>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase">
                              <User className="w-3 h-3 text-primary/40" /> 
                              <span className="truncate">{selectedMsg.from}</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase">
                              <Calendar className="w-3 h-3 text-primary/40" /> {selectedMsg.date}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                        <Button onClick={() => handleCopyText(selectedMsg.body, 'Content')} variant="outline" size="sm" className="h-9 px-3 rounded-lg border-white/10 bg-white/5 text-white text-[8px] font-black uppercase tracking-widest hidden sm:flex">
                           {isCopied === 'Content' ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />} Copy Raw
                        </Button>
                        <Button onClick={() => setSelectedMsg(null)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-foreground/20 hover:text-white">
                           <X className="w-5 h-5" />
                        </Button>
                     </div>
                  </div>
               </DialogHeader>

               {detectedOtp && (
                 <div className="px-6 py-4 bg-primary/[0.03] border-b border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl ring-4 ring-primary/5">
                          <KeyRound className="w-5 h-5 animate-pulse" />
                       </div>
                       <div className="space-y-0.5">
                          <h4 className="text-[10px] font-black uppercase text-foreground tracking-widest">Verification Signal Detected</h4>
                          <p className="text-[8px] font-bold text-foreground/30 uppercase">Detected OTP Protocol</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="px-6 py-2.5 bg-background border-2 border-primary/20 rounded-2xl text-2xl font-mono font-black text-primary tracking-[0.3em] shadow-inner select-all">
                          {detectedOtp}
                       </div>
                       <Button 
                        onClick={() => handleCopyText(detectedOtp, 'OTP')}
                        className="h-12 px-6 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg"
                       >
                          {isCopied === 'OTP' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy Code
                       </Button>
                    </div>
                 </div>
               )}
               
               <div className="flex-1 overflow-auto custom-scrollbar p-6 sm:p-10 bg-white">
                  <div className="max-w-none overflow-x-auto min-w-full">
                    {selectedMsg.htmlBody ? (
                      <div 
                        className="text-foreground/80 leading-relaxed text-base whitespace-pre-wrap min-w-full"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMsg.htmlBody) }}
                      />
                    ) : (
                      <pre className="text-slate-700 font-mono text-sm whitespace-pre-wrap leading-relaxed p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner min-w-full">
                        {selectedMsg.body}
                      </pre>
                    )}
                  </div>
               </div>

               <div className="px-6 py-4 border-t border-white/5 bg-secondary/30 shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                     <ShieldCheck className="w-3.5 h-3.5" /> Clinical Integrity Guard
                  </div>
                  <div className="flex items-center gap-3">
                     <Button onClick={() => handleDownload('html')} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                        <FileCode className="w-3.5 h-3.5 mr-2" /> Download HTML
                     </Button>
                     <Button onClick={() => handleDownload('eml')} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                        <FileDown className="w-3.5 h-3.5 mr-2" /> Download EML
                     </Button>
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
