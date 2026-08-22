"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  Inbox, 
  ArrowRight, 
  Loader2, 
  Clock, 
  User, 
  Eye, 
  X, 
  Zap, 
  ShieldCheck, 
  Activity,
  MessageSquare,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import DOMPurify from 'dompurify';

// --- Types & Constants ---
interface MailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
}

interface FullMessage extends MailMessage {
  body: string;
  textBody: string;
  htmlBody: string;
}

const API_BASE = "https://www.1secmail.com/api/v1/";
const REFRESH_RATE = 10; // seconds

export default function TempMailPage() {
  const { toast } = useToast();
  
  // Session State
  const [email, setEmail] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);
  const [domain, setDomain] = useState<string | null>(null);
  
  // Data State
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<FullMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-refresh State
  const [countdown, setCountdown] = useState(REFRESH_RATE);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. Generation Protocol ---
  const generateMail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?action=genRandomMailbox&count=1`);
      const data = await res.json();
      if (data && data[0]) {
        const fullEmail = data[0];
        const [l, d] = fullEmail.split('@');
        setEmail(fullEmail);
        setLogin(l);
        setDomain(d);
        setMessages([]);
        setCountdown(REFRESH_RATE);
        toast({ title: "Identity Synthesized", description: "Temporary mailbox active." });
      } else {
        throw new Error("Registry node restricted.");
      }
    } catch (err) {
      setError("Uplink failure. Discovery node unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Inbox Polling Matrix ---
  const fetchMessages = useCallback(async (silent = false) => {
    if (!login || !domain) return;
    if (!silent) setIsRefreshing(true);
    
    try {
      const res = await fetch(`${API_BASE}?action=getMessages&login=${login}&domain=${domain}`);
      const data = await res.json();
      setMessages(data || []);
      if (!silent) toast({ title: "Inbox Synced" });
    } catch (err) {
      console.warn("Polling interrupted.");
    } finally {
      setIsRefreshing(false);
      setCountdown(REFRESH_RATE);
    }
  }, [login, domain, toast]);

  // Handle auto-refresh cycle
  useEffect(() => {
    if (email) {
      pollingRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchMessages(true);
            return REFRESH_RATE;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [email, fetchMessages]);

  useEffect(() => {
    generateMail();
  }, []);

  // --- 3. Message Decoding ---
  const readMessage = async (id: number) => {
    if (!login || !domain) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
      const data = await res.json();
      setSelectedMsg(data);
    } catch (err) {
      toast({ variant: "destructive", title: "Decode Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setIsCopied(true);
      toast({ title: "Identity Isolated" });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleNewMail = () => {
    generateMail();
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> High-Fidelity Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Temp <span className="text-primary italic">Mail Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional temporary email synthesis. Isolate anonymous digital identities with real-time private inboxes and sanitized visual masters.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="temp-mail" />
              <Button variant="outline" size="sm" onClick={() => fetchMessages()} disabled={isRefreshing || !email} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary transition-all">
                <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isRefreshing && "animate-spin")} /> Refresh ({countdown}s)
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Identity & Status */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Identity Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <div className="space-y-6">
                    <div className="p-8 rounded-[3rem] bg-secondary/50 border-2 border-primary/20 shadow-inner flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group/mail">
                       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/mail:opacity-100 transition-opacity" />
                       <p className="text-[9px] font-black uppercase text-primary/40 tracking-[0.6em] relative z-10">Active Mailbox Identity</p>
                       {isLoading ? (
                         <div className="h-12 flex items-center justify-center">
                           <Loader2 className="w-8 h-8 text-primary animate-spin" />
                         </div>
                       ) : (
                         <h2 className="text-xl sm:text-2xl font-headline font-black text-foreground break-all select-all relative z-10">{email || "Initializing..."}</h2>
                       )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Button onClick={handleCopy} disabled={!email} className="h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                          {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                          Copy Address
                       </Button>
                       <Button variant="outline" onClick={handleNewMail} className="h-14 border-border bg-secondary text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-primary">
                          <Plus className="w-4 h-4 mr-2" /> New Identity
                       </Button>
                    </div>
                 </div>

                 <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Privacy Secure</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">All messages are volatile and definitively purged once the session identity is rotated or the browser is refreshed.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Activity className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Live Feed Protocol</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    The studio implements a high-frequency polling matrix. New signals are identified and synchronized with the inbox every 10 seconds.
                  </p>
                </div>
             </div>
           </div>
        </div>

        {/* Right Column: Inbox */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Inbox className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Digital Inbox Matrix</CardTitle>
                 </div>
                 {messages.length > 0 && (
                   <Badge className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">{messages.length} Active Signals</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-6 grayscale">
                         <Inbox className="w-24 h-24 text-primary" />
                         <div className="text-center space-y-2">
                            <p className="text-sm font-black uppercase tracking-[0.4em]">Empty Protocol Buffer</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest">Waiting for inbound signals...</p>
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
                                    <p className="text-[8px] font-black text-primary uppercase tracking-widest">Sender ID: {msg.from.split('<')[0]}</p>
                                    <h4 className="text-sm font-bold text-foreground truncate uppercase pr-10">{msg.subject || "(No Subject)"}</h4>
                                    <div className="flex items-center gap-3">
                                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter">{msg.from}</p>
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
               <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="space-y-4 min-w-0">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Inbound Signal Isolated</p>
                           <DialogTitle className="text-2xl sm:text-3xl font-headline font-black text-foreground uppercase tracking-tight truncate max-w-xl">
                              {selectedMsg.subject || "(NO SUBJECT)" }
                           </DialogTitle>
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
                        <Button onClick={() => handleCopy(selectedMsg.body, 'Content')} variant="outline" className="h-10 px-4 rounded-xl border-white/10 bg-white/5 text-white text-[9px] font-black uppercase">
                           <Copy className="w-3.5 h-3.5 mr-2" /> Copy Raw
                        </Button>
                        <Button onClick={() => setSelectedMsg(null)} variant="ghost" className="h-10 w-10 rounded-xl text-foreground/20 hover:text-white">
                           <X className="w-5 h-5" />
                        </Button>
                     </div>
                  </div>
               </DialogHeader>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 bg-transparent">
                  <div className="max-w-none prose prose-invert">
                    {selectedMsg.htmlBody ? (
                      <div 
                        className="text-foreground/80 leading-relaxed text-base"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMsg.htmlBody) }}
                      />
                    ) : (
                      <pre className="text-foreground/80 font-mono text-sm whitespace-pre-wrap leading-relaxed p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner">
                        {selectedMsg.body}
                      </pre>
                    )}
                  </div>
               </div>

               <div className="p-6 bg-secondary/30 border-t border-white/5 flex items-center justify-between shrink-0">
                  <span className="text-[8px] font-black uppercase text-foreground/10 tracking-[0.4em]">Hardware-Native Matrix Decoder Active</span>
                  <Badge variant="outline" className="text-[7px] font-black uppercase border-emerald-500/20 text-emerald-500 px-3">Protocol: Sanitized</Badge>
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
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
