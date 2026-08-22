"use client"

import React, { useState, useEffect, useCallback } from 'react';
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
  Check
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DOMPurify from 'dompurify';
import { fetchFromProvider } from './actions';

// --- Configuration Matrix ---
const PROVIDERS = [
  { id: '1secmail', label: '1secmail (Global)', icon: Globe },
  { id: 'mailtm', label: 'Mail.tm (High Fidelity)', icon: ShieldCheck },
  { id: 'guerrilla', label: 'Guerrilla Mail (Classic)', icon: Activity },
];

const REFRESH_RATE = 10; 

interface MailMessage {
  id: string | number;
  from: string;
  subject: string;
  date: string;
}

interface FullMessage {
  from: string;
  subject: string;
  date: string;
  htmlBody: string;
  body: string;
}

export default function TempMailPage() {
  const { toast } = useToast();
  
  // Provider State
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [sessionData, setSessionData] = useState<any>(null); 
  
  // Identity State
  const [email, setEmail] = useState<string | null>(null);
  
  // Data State
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<FullMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-refresh State
  const [countdown, setCountdown] = useState(REFRESH_RATE);

  // --- 1. Generation Protocol ---
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
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Inbox Polling Matrix ---
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

  // Decoupled interval logic to prevent "Cannot update a component while rendering" errors
  useEffect(() => {
    if (!email) return;

    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) {
      fetchMessages(true);
      setCountdown(REFRESH_RATE);
    }
  }, [countdown, fetchMessages]);

  useEffect(() => {
    generateMail();
  }, []);

  const handleProviderChange = (newVal: string) => {
    setProvider(newVal);
    generateMail(newVal);
  };

  // --- 3. Message Decoding ---
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
        setSelectedMsg(res.message);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Decode Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setIsCopied(true);
      toast({ title: "Identity Isolated" });
      setTimeout(() => setIsCopied(false), 2000);
    }
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
        {/* Left Column: Identity & Node Status */}
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
                                     {React.createElement(p.icon, { className: "w-3 h-3" })} {p.label}
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
                       <Button onClick={handleCopy} disabled={!email} className="h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                          {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
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
                       <p className="text-[9px] font-bold text-destructive uppercase">{error}</p>
                    </div>
                 )}

                 <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Privacy Secure</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">All messages are volatile and definitively purged once the identity node is rotated or the browser session terminates.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Inbox Registry */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Inbox className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Registry</CardTitle>
                 </div>
                 {messages.length > 0 && (
                   <Badge className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">{messages.length} Signals Identified</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-6 grayscale">
                         <Inbox className="w-24 h-24 text-primary" />
                         <div className="text-center space-y-2">
                            <p className="text-sm font-black uppercase tracking-[0.4em]">Signal Buffer Empty</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest">Awaiting inbound linguistic data...</p>
                         </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                         {messages.map((msg) => (
                           <div 
                            key={msg.id} 
                            onClick={() => readMessage(msg.id)}
                            className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden"
                           >
                              <div className="flex items-center gap-6 min-w-0">
                                 <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/30 group-hover:text-primary transition-all shadow-inner shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0 space-y-1">
                                    <p className="text-[8px] font-black text-primary uppercase tracking-widest">Source Node: {msg.from.split('<')[0]}</p>
                                    <h4 className="text-sm font-bold text-foreground truncate uppercase pr-10">{msg.subject || "(No Subject Identifier)"}</h4>
                                    <div className="flex items-center gap-3">
                                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter truncate">{msg.from}</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-3 shrink-0">
                                 <span className="text-[8px] font-black text-foreground/10 uppercase tracking-widest">{msg.date}</span>
                                 <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>

                 {isRefreshing && (
                   <div className="p-4 bg-primary/5 border-t border-primary/10 flex items-center justify-center gap-3 animate-pulse shrink-0">
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                      <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Synchronizing Registry...</span>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>

      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="glass-card max-w-4xl border-white/20 p-0 overflow-hidden outline-none flex flex-col max-h-[85vh]">
          {selectedMsg && (
            <>
               <div className="p-8 border-b border-white/5 bg-secondary/30 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="space-y-4 min-w-0">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Signal Identity Isolated</p>
                           <h2 className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight truncate max-w-xl">
                              {selectedMsg.subject || "(NO SUBJECT)" }
                           </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                           <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-foreground/40 uppercase">
                              <User className="w-3 h-3" /> {selectedMsg.from}
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-foreground/40 uppercase">
                              <Calendar className="w-3 h-3" /> {selectedMsg.date}
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-2 shrink-0">
                        <Button onClick={() => handleCopy()} variant="outline" className="h-10 px-4 rounded-xl border-white/10 bg-white/5 text-white text-[9px] font-black uppercase">
                           <Copy className="w-3.5 h-3.5 mr-2" /> Copy Raw
                        </Button>
                        <Button onClick={() => setSelectedMsg(null)} variant="ghost" className="h-10 w-10 rounded-xl text-foreground/20 hover:text-white">
                           <X className="w-5 h-5" />
                        </Button>
                     </div>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 bg-white">
                  <div className="max-w-none">
                    {selectedMsg.htmlBody ? (
                      <div 
                        className="text-foreground/80 leading-relaxed text-base"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMsg.htmlBody) }}
                      />
                    ) : (
                      <pre className="text-slate-700 font-mono text-sm whitespace-pre-wrap leading-relaxed p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                        {selectedMsg.body}
                      </pre>
                    )}
                  </div>
               </div>

               <div className="p-6 bg-secondary/30 border-t border-white/5 flex items-center justify-between shrink-0">
                  <span className="text-[8px] font-black uppercase text-foreground/10 tracking-[0.4em]">Hardware-Native Matrix Decoder Active</span>
                  <Badge variant="outline" className="text-[7px] font-black uppercase border-emerald-500/20 text-emerald-500 px-3">
                    <Check className="w-3 h-3 mr-1" /> Protocol: Clean
                  </Badge>
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
