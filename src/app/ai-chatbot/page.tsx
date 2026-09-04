"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  User, 
  Bot, 
  Plus, 
  History,
  Activity,
  Zap,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  X,
  RefreshCcw,
  Sparkles,
  ArrowRight,
  Shield,
  Smartphone,
  Lock,
  ChevronRight,
  Check,
  Trash,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, setDoc, deleteDoc, serverTimestamp, writeBatch, orderBy, getDocs } from 'firebase/firestore';
import { chatWithAI, ChatMessage } from './actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { GetHelp } from '@/components/qr-canvas/get-help';

const LOCAL_STORAGE_KEY = 'mykit_ai_chat_local_v1';

export default function AIChatbotPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  // State Matrix
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Firestore Sync Matrix ---
  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'ai_history', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [db, user]);

  const { data: cloudMessages, loading: cloudLoading } = useCollection<any>(historyQuery);

  // Initialization: Hydrate from LocalStorage or Cloud
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) try { setMessages(JSON.parse(saved)); } catch(e) {}
    } else if (cloudMessages) {
      const mapped = cloudMessages.map(m => ({
        role: m.senderId === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));
      setMessages(mapped);
    }
  }, [user, cloudMessages]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  const saveToFirestore = (role: string, text: string) => {
    if (!db || !user) return;
    const docRef = doc(collection(db, 'ai_history', user.uid, 'messages'));
    const payload = {
      senderId: role === 'assistant' ? 'ai' : user.uid,
      text,
      timestamp: serverTimestamp(),
      status: 'sent'
    };
    setDoc(docRef, payload).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: payload,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    const newMsg: ChatMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, newMsg];
    
    setMessages(updatedMessages);
    if (!user) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMessages));
    saveToFirestore('user', userText);
    
    setInput('');
    setIsProcessing(true);

    // Capture the response
    const response = await chatWithAI(updatedMessages.slice(-10)); // Context window limit

    if (response.success && response.text) {
      const aiMsg: ChatMessage = { role: 'assistant', content: response.text };
      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      setActiveNode(response.node || 'Cloud');
      if (!user) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalMessages));
      saveToFirestore('assistant', response.text);
    } else {
      toast({ 
        variant: "destructive", 
        title: "Node Error", 
        description: response.message || "Failed to negotiate with AI registry." 
      });
    }
    setIsProcessing(false);
  };

  const clearChat = async () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (db && user) {
      const batch = writeBatch(db);
      // Note: Full collection delete requires querying first
      const snap = await getDocs(collection(db, 'ai_history', user.uid, 'messages'));
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    toast({ title: "Session Purged" });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Isolated Signal", description: "Content saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-8 animate-reveal shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MessageSquare className="w-3.5 h-3.5" /> Intelligence Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                AI <span className="text-primary italic">Chatbot Pro</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Professional linguistic synthesis. Chat with advanced Llama-based nodes powered by Groq and OpenRouter with 1:1 hardware isolation.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="ai-chatbot" />
              <Button variant="outline" size="sm" onClick={clearChat} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> New Session
              </Button>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 overflow-hidden">
        {/* Chat Mainframe */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
           <Card className="glass-card border-border shadow-2xl flex-1 flex flex-col overflow-hidden bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardHeader className="py-4 px-6 border-b border-white/5 bg-secondary/30 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Bot className="w-4 h-4" />
                    </div>
                    <div>
                       <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Signal Active</CardTitle>
                       <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">
                          {activeNode ? `Node: ${activeNode}` : 'Linguistic Handshake Pending'}
                       </p>
                    </div>
                 </div>
                 {user && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[7px] font-black uppercase tracking-widest px-3">
                       Cloud Sync Active
                    </Badge>
                 )}
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8 bg-[#060608]/30" ref={scrollRef}>
                 {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 gap-8 grayscale py-20">
                       <div className="relative">
                          <div className="w-32 h-32 rounded-full border-4 border-primary/20" />
                          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary animate-pulse" />
                       </div>
                       <div className="text-center space-y-2">
                          <p className="text-xl font-headline font-black uppercase tracking-[0.4em]">Awaiting Identity Pulse</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest">Protocol V7.2 Active</p>
                       </div>
                    </div>
                 ) : (
                    <div className="flex flex-col gap-8 pb-10">
                       {messages.map((msg, i) => (
                         <div key={i} className={cn(
                           "flex gap-5 max-w-[90%] animate-in slide-in-from-bottom-4 duration-500",
                           msg.role === 'assistant' ? "mr-auto" : "ml-auto flex-row-reverse"
                         )}>
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border transition-all duration-500",
                              msg.role === 'assistant' ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-foreground/40"
                            )}>
                               {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div className="space-y-3">
                               <div className={cn(
                                 "p-6 rounded-[2.5rem] shadow-xl relative group/msg",
                                 msg.role === 'assistant' ? "bg-secondary/40 border border-white/5 rounded-tl-none" : "bg-primary text-white rounded-tr-none shadow-primary/10"
                               )}>
                                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap selection:bg-white/20">
                                     {msg.content}
                                  </p>
                                  {msg.role === 'assistant' && (
                                     <button 
                                      onClick={() => handleCopy(msg.content, `msg-${i}`)}
                                      className="absolute -right-12 top-0 p-2 opacity-0 group-hover/msg:opacity-100 transition-all text-foreground/20 hover:text-primary"
                                     >
                                        {isCopied === `msg-${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                     </button>
                                  )}
                               </div>
                               <p className={cn("text-[8px] font-black uppercase tracking-widest text-foreground/10 px-2", msg.role === 'assistant' ? 'text-left' : 'text-right')}>
                                  {msg.role === 'assistant' ? 'Assistant Node' : 'User Node'}
                               </p>
                            </div>
                         </div>
                       ))}
                       {isProcessing && (
                         <div className="flex gap-5 mr-auto animate-in fade-in duration-500">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                               <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                            <div className="bg-secondary/20 p-5 rounded-[2.5rem] rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0s]" />
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                            </div>
                         </div>
                       )}
                    </div>
                 )}
              </CardContent>

              {/* Input Area */}
              <div className="p-6 border-t border-white/5 bg-[#0a0a0c] shrink-0">
                 <form onSubmit={handleSend} className="relative group/form">
                    <Input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Enter cryptographic prompt..."
                      className="h-16 pr-24 bg-black/40 border-white/5 rounded-2xl text-sm font-medium focus:ring-primary/40 focus:border-primary/40 transition-all shadow-inner"
                      disabled={isProcessing}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                       <Button 
                        type="submit" 
                        disabled={!input.trim() || isProcessing}
                        className="h-12 w-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 active:scale-95 transition-all group/btn"
                       >
                          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />}
                       </Button>
                    </div>
                 </form>
                 <div className="mt-4 flex items-center justify-between px-2">
                    <p className="text-[8px] font-black uppercase text-foreground/20 tracking-[0.4em]">100% Client-Side Encryption Protocol</p>
                    {isProcessing && <span className="text-[8px] font-bold text-primary animate-pulse uppercase tracking-widest">Processing bitstream...</span>}
                 </div>
              </div>
           </Card>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-white/5 bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4 text-foreground">
                    <Zap className="w-5 h-5 text-primary" /> Studio Telemetry
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2rem] bg-secondary border border-border text-center space-y-1 group hover:border-primary/20 transition-all">
                       <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Signals</span>
                       <p className="text-2xl font-headline font-black text-foreground">{messages.length}</p>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 text-center space-y-1 group hover:border-primary/40 transition-all">
                       <span className="text-[8px] font-black text-primary uppercase tracking-widest">Latency</span>
                       <p className="text-2xl font-headline font-black text-primary">Local</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-secondary/50 border border-border group">
                       <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0 transition-transform group-hover:scale-110" />
                       <div className="space-y-1">
                          <h4 className="text-[11px] font-black uppercase text-foreground">Privacy Sandbox</h4>
                          <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                             All synthesis occurs via secure server-side tunnels. Your hardware identifiers are never shared with AI nodes.
                          </p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-secondary/50 border border-border group">
                       <Globe className="w-6 h-6 text-primary mt-1 shrink-0 transition-transform group-hover:scale-110" />
                       <div className="space-y-1">
                          <h4 className="text-[11px] font-black uppercase text-foreground">Llama 3.3 Node</h4>
                          <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                             Utilizing the primary Groq registry for high-frequency linguistic discovery.
                          </p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl relative overflow-hidden">
              <CardHeader className="py-6 border-b border-white/5 bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4 text-foreground">
                    <History className="w-5 h-5 text-primary" /> Session Guide
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">1</div>
                       <p className="text-[10px] font-bold text-foreground/60 uppercase">Enter your linguistic payload.</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">2</div>
                       <p className="text-[10px] font-bold text-foreground/60 uppercase">AI executes a multi-node search.</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">3</div>
                       <p className="text-[10px] font-bold text-foreground/60 uppercase">Isolate the result matrix.</p>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/5">
                    {!user ? (
                       <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-[9px] text-foreground/40 font-bold uppercase leading-tight">
                             Login required for permanent cloud history sync. Current session is local only.
                          </p>
                       </div>
                    ) : (
                       <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[9px] font-black uppercase text-emerald-600">History Sync Verified</span>
                       </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </aside>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
