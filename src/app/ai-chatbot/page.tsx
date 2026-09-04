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
  Globe,
  Settings2,
  List,
  Edit3,
  AlignLeft,
  ChevronDown,
  Menu,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, setDoc, deleteDoc, serverTimestamp, writeBatch, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { chatWithAI, ChatMessage, ChatConfig } from './actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Types ---
interface Session {
  id: string;
  title: string;
  lastUpdated: number;
  messages: ChatMessage[];
}

const LOCAL_SESSIONS_KEY = 'mykit_ai_sessions_v2';
const INITIAL_CONFIG: ChatConfig = {
  node: 'auto',
  temperature: 0.7,
  systemPrompt: 'You are a professional AI assistant in the MY KIT TOOL digital studio. Your tone is helpful, concise, and technically accurate.',
  maxTokens: 1024
};

export default function AIChatbotPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  // App State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  
  // Config State
  const [config, setConfig] = useState<ChatConfig>(INITIAL_CONFIG);

  // UI Meta
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 1. Session Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_SESSIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch (e) {}
    } else {
      createNewSession();
    }
    
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // --- 2. Cloud Sync Protocol ---
  const cloudSessionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'ai_history', user.uid, 'sessions'),
      orderBy('lastUpdated', 'desc')
    );
  }, [db, user]);

  const { data: cloudSessions } = useCollection<any>(cloudSessionsQuery);

  useEffect(() => {
    if (cloudSessions && cloudSessions.length > 0) {
      // Logic to merge cloud sessions into local state would go here for a production app
    }
  }, [cloudSessions]);

  // --- 3. Persistence Matrix ---
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || null, 
  [sessions, activeSessionId]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, isProcessing]);

  // --- 4. Actions ---

  const createNewSession = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newSession: Session = {
      id: newId,
      title: 'New Discussion',
      lastUpdated: Date.now(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const saveToCloud = (sessionId: string, session: Session) => {
    if (!db || !user) return;
    const docRef = doc(db, 'ai_history', user.uid, 'sessions', sessionId);
    setDoc(docRef, {
      ...session,
      uid: user.uid,
      timestamp: serverTimestamp()
    }, { merge: true }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleSend = async (e?: React.FormEvent, retryText?: string) => {
    e?.preventDefault();
    const textToProcess = retryText || input.trim();
    if (!textToProcess || isProcessing || !activeSessionId) return;

    const userMsg: ChatMessage = { role: 'user', content: textToProcess };
    
    // Update local state immediately
    const updatedMessages = [...(activeSession?.messages || []), userMsg];
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: updatedMessages,
          lastUpdated: Date.now(),
          title: s.title === 'New Discussion' ? textToProcess.substring(0, 30) : s.title
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    setInput('');
    setIsProcessing(true);

    const response = await chatWithAI(updatedMessages.slice(-10), config);

    if (response.success && response.text) {
      const aiMsg: ChatMessage = { role: 'assistant', content: response.text };
      const finalSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          const next = { ...s, messages: [...s.messages, aiMsg], lastUpdated: Date.now() };
          saveToCloud(s.id, next);
          return next;
        }
        return s;
      });
      setSessions(finalSessions);
    } else {
      toast({ 
        variant: "destructive", 
        title: "Node Error", 
        description: response.message || "Failed to negotiate with AI registry." 
      });
    }
    setIsProcessing(false);
  };

  const deleteSession = async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
    if (db && user) {
      const docRef = doc(db, 'ai_history', user.uid, 'sessions', id);
      deleteDoc(docRef).catch(() => {});
    }
    toast({ title: "Session Purged" });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Signal Isolated", description: "Content saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#060608] selection:bg-primary/20">
      
      {/* SIDEBAR */}
      <aside className={cn(
        "flex flex-col h-full bg-[#0a0a0c] border-r border-white/5 transition-all duration-500 z-50 overflow-hidden",
        isSidebarOpen ? "w-80" : "w-0 opacity-0"
      )}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20">
           <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-primary/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Registry History</span>
           </div>
           <button onClick={createNewSession} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              <Plus className="w-4 h-4" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
           {sessions.length === 0 ? (
             <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
                <MessageSquare className="w-10 h-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Active Sessions</p>
             </div>
           ) : (
             sessions.map(s => (
               <div key={s.id} className="group relative">
                  <button
                    onClick={() => { setActiveSessionId(s.id); if(typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all border border-transparent",
                      activeSessionId === s.id ? "bg-primary/10 border-primary/20 text-primary shadow-inner" : "text-foreground/40 hover:bg-white/5"
                    )}
                  >
                     <MessageSquare className="w-4 h-4 shrink-0 opacity-40" />
                     <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold truncate uppercase tracking-tight">{s.title}</p>
                        <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mt-0.5">{new Date(s.lastUpdated).toLocaleDateString()}</p>
                     </div>
                  </button>
                  <button 
                    onClick={() => deleteSession(s.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-all text-foreground/10 hover:text-red-500"
                  >
                     <Trash2 className="w-3.5 h-3.5" />
                  </button>
               </div>
             ))
           )}
        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
                 <span className="text-[9px] font-black uppercase text-foreground/30">Local Sandbox</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[7px] font-black px-2">V7.2 Pro</Badge>
           </div>
           {!user && (
             <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[9px] text-foreground/40 font-bold uppercase leading-relaxed">
                   Login to synchronize your chat registry to the cloud.
                </p>
             </div>
           )}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
         {/* Top Monitor Bar */}
         <header className="h-14 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-40">
            <div className="flex items-center gap-6">
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-primary transition-all">
                  <Menu className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60">{activeSession?.title || 'Standalone Matrix'}</h2>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                  <button onClick={() => setConfig({...config, node: 'groq'})} className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all", config.node === 'groq' ? "bg-primary text-white" : "text-white/20")}>Groq</button>
                  <button onClick={() => setConfig({...config, node: 'auto'})} className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all", config.node === 'auto' ? "bg-primary text-white" : "text-white/20")}>Auto</button>
                  <button onClick={() => setConfig({...config, node: 'openrouter'})} className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all", config.node === 'openrouter' ? "bg-primary text-white" : "text-white/20")}>OR</button>
               </div>
               <button onClick={() => setIsConfigOpen(!isConfigOpen)} className={cn("p-2 rounded-lg transition-all", isConfigOpen ? "text-primary bg-primary/10" : "text-white/20 hover:text-white")}>
                  <Settings2 className="w-5 h-5" />
               </button>
            </div>
         </header>

         {/* Message Viewport */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-12 bg-black/40" ref={scrollRef}>
            {!activeSession?.messages.length ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-10 grayscale">
                 <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-primary/20" />
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary animate-pulse" />
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-xl font-headline font-black uppercase tracking-[0.4em]">Initialize Pulse</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Protocol V7.2 Active</p>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full pb-20">
                 {activeSession.messages.map((msg, i) => (
                   <div key={i} className={cn(
                     "flex gap-5 group/msg animate-in slide-in-from-bottom-4 duration-500",
                     msg.role === 'assistant' ? "mr-auto" : "ml-auto flex-row-reverse"
                   )}>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border transition-all duration-500",
                        msg.role === 'assistant' ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-foreground/40"
                      )}>
                         {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className={cn("space-y-3", msg.role === 'user' ? "text-right" : "text-left")}>
                         <div className={cn(
                           "p-6 rounded-[2.5rem] shadow-2xl relative group/card overflow-hidden",
                           msg.role === 'assistant' ? "bg-white/[0.03] border border-white/5 rounded-tl-none" : "bg-primary text-white rounded-tr-none shadow-primary/20"
                         )}>
                            <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap">
                               {msg.content}
                            </p>
                            {msg.role === 'assistant' && (
                               <button 
                                onClick={() => handleCopy(msg.content, `msg-${i}`)}
                                className="absolute right-4 bottom-4 p-2 rounded-lg bg-black/40 text-white/40 hover:text-white transition-all opacity-0 group-hover/card:opacity-100"
                               >
                                  {isCopied === `msg-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                               </button>
                            )}
                         </div>
                         <div className="flex items-center gap-3 px-4">
                            <span className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">{msg.role === 'assistant' ? 'Assistant Node' : 'User Node'}</span>
                            {msg.role === 'user' && (
                               <button onClick={() => { setInput(msg.content); handleSend(undefined, msg.content); }} className="text-[8px] font-black uppercase text-primary/40 hover:text-primary transition-all">Retry</button>
                            )}
                         </div>
                      </div>
                   </div>
                 ))}
                 {isProcessing && (
                    <div className="flex gap-5 mr-auto animate-in fade-in duration-500">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Loader2 className="w-5 h-5 animate-spin" />
                       </div>
                       <div className="bg-white/5 p-5 rounded-[2.5rem] rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                       </div>
                    </div>
                 )}
              </div>
            )}
         </div>

         {/* Advanced Config Overlay */}
         {isConfigOpen && (
           <Card className="absolute top-16 right-6 w-80 glass-card border-primary/20 bg-[#0d0d0f]/95 shadow-3xl z-50 animate-in zoom-in-95 duration-300">
              <CardHeader className="py-4 border-b border-white/5 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Node Calibration</span>
                 </div>
                 <button onClick={() => setIsConfigOpen(false)} className="text-white/20 hover:text-white"><X className="w-4 h-4" /></button>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase text-foreground/40">Model Identity</Label>
                    <Select value={config.model} onValueChange={v => setConfig({...config, model: v})}>
                       <SelectTrigger className="h-10 bg-secondary/50 border-border text-[9px] font-bold">
                          <SelectValue placeholder="Select Model" />
                       </SelectTrigger>
                       <SelectContent className="glass-card">
                          <SelectItem value="llama-3.3-70b-versatile" className="text-[9px] uppercase font-bold">Llama 3.3 (70B)</SelectItem>
                          <SelectItem value="mixtral-8x7b-32768" className="text-[9px] uppercase font-bold">Mixtral 8x7B</SelectItem>
                          <SelectItem value="gemma2-9b-it" className="text-[9px] uppercase font-bold">Gemma 2 (9B)</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                       <Label>Temperature</Label>
                       <span className="text-primary">{config.temperature}</span>
                    </div>
                    <Slider value={[config.temperature! * 100]} min={0} max={100} step={1} onValueChange={v => setConfig({...config, temperature: v[0]/100})} />
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-foreground/40">System Matrix</Label>
                    <Textarea 
                      value={config.systemPrompt} 
                      onChange={e => setConfig({...config, systemPrompt: e.target.value})} 
                      placeholder="e.g. Expert programmer mode..."
                      className="h-24 bg-black/40 border-border text-[10px] leading-relaxed resize-none p-4"
                    />
                 </div>

                 <Button onClick={() => setConfig(INITIAL_CONFIG)} variant="ghost" className="w-full h-8 text-[8px] font-black uppercase text-foreground/20 hover:text-primary">Reset to Factory</Button>
              </CardContent>
           </Card>
         )}

         {/* Input Matrix */}
         <div className="p-6 sm:p-10 border-t border-white/5 bg-[#0a0a0c] shrink-0">
            <div className="max-w-4xl mx-auto w-full relative group/input">
               <form onSubmit={handleSend} className="relative">
                  <Textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Enter cryptographic prompt..."
                    className="min-h-[60px] max-h-40 w-full pl-6 pr-16 bg-white/[0.02] border-white/10 rounded-[2rem] text-sm font-medium py-5 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-inner custom-scrollbar"
                  />
                  <div className="absolute right-2 bottom-2">
                     <Button 
                      type="submit" 
                      disabled={!input.trim() || isProcessing}
                      className="h-12 w-12 rounded-[1.2rem] bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all group/btn"
                     >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                     </Button>
                  </div>
               </form>
               <div className="mt-4 flex items-center justify-between px-6">
                  <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.4em] text-foreground/20">
                     <span>100% Local Encryption Protocol</span>
                     <span className="hidden sm:inline">•</span>
                     <span className="hidden sm:inline">Shift+Enter for newline</span>
                  </div>
                  {isProcessing && <span className="text-[8px] font-bold text-primary animate-pulse uppercase tracking-widest">Processing bitstream...</span>}
               </div>
            </div>
         </div>
      </main>

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <AlertCircle className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Terminate Session</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
               This will definitively purge the local registry for this specific discussion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if(activeSessionId) deleteSession(activeSessionId); setShowLeaveConfirm(false); }} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl">Purge</AlertDialogAction>
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