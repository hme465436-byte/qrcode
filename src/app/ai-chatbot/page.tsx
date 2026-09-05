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
  X,
  Edit3,
  Menu,
  Pin,
  PinOff,
  Search,
  FileDown,
  Code2,
  BookOpen,
  ImageIcon,
  Settings2,
  Globe,
  KeyRound,
  Unplug,
  Database,
  ArrowRight,
  RefreshCcw,
  Square,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { collection, query, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { ChatMessage, ChatConfig, CustomApiConfig } from './actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Types & Constants ---
interface Session {
  id: string;
  title: string;
  lastUpdated: number;
  messages: ChatMessage[];
  isPinned?: boolean;
  persona?: PersonaId;
}

type PersonaId = 'helper' | 'coder' | 'writer' | 'teacher' | 'short';

interface Persona {
  id: PersonaId;
  label: string;
  icon: any;
  prompt: string;
}

const PERSONAS: Persona[] = [
  { id: 'helper', label: 'Detailed Helper', icon: Bot, prompt: 'You are a highly capable and professional AI assistant. Provide clear, accurate, and detailed answers. Stay on topic, be thorough, and maintain a helpful, encouraging tone.' },
  { id: 'coder', label: 'Code Architect', icon: Code2, prompt: 'You are an expert senior software engineer and architect. Provide clean, secure, and production-ready code. Always include brief technical explanations.' },
  { id: 'writer', label: 'Creative Writer', icon: Edit3, prompt: 'You are a professional creative writer and linguistic editor. Focus on engaging language, impeccable clarity, and sophisticated narrative flow.' },
  { id: 'teacher', label: 'Master Educator', icon: BookOpen, prompt: 'You are a knowledgeable and patient educator. Break down complex concepts into simple, understandable steps.' },
  { id: 'short', label: 'Quick Signal', icon: Zap, prompt: 'You are a highly efficient and concise assistant. Provide the shortest possible accurate answers. Zero fluff, maximum precision.' },
];

const LOCAL_SESSIONS_KEY = 'mykit_ai_sessions_v6';
const CUSTOM_API_KEY = 'mykit_ai_custom_api_v1';
const INITIAL_CONFIG: ChatConfig = {
  node: 'auto',
  temperature: 0.7,
  systemPrompt: PERSONAS[0].prompt,
  maxTokens: 2048
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  
  // Config State
  const [config, setConfig] = useState<ChatConfig>(INITIAL_CONFIG);
  const [customApi, setCustomApi] = useState<CustomApiConfig>({
    providerName: '',
    apiUrl: '',
    apiKey: '',
    modelName: '',
    customHeader: ''
  });
  const [isCustomConnected, setIsCustomConnected] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaId>('helper');

  // UI Meta
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- 1. Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_SESSIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0 && !activeSessionId) setActiveSessionId(parsed[0].id);
      } catch (e) {}
    }

    const savedApi = localStorage.getItem(CUSTOM_API_KEY);
    if (savedApi) {
      try {
        const parsed = JSON.parse(savedApi);
        setCustomApi(parsed);
        setIsCustomConnected(true);
      } catch (e) {}
    }
  }, []);

  // --- 2. Typing Sync Protocol ---
  useEffect(() => {
    if (isFocused && window.innerWidth < 1024) {
      document.body.classList.add('is-typing');
    } else {
      document.body.classList.remove('is-typing');
    }
    return () => document.body.classList.remove('is-typing');
  }, [isFocused]);

  // --- 3. Cloud Sync ---
  const cloudSessionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'ai_history', user.uid, 'sessions'),
      orderBy('lastUpdated', 'desc')
    );
  }, [db, user]);

  const { data: cloudSessions } = useCollection<Session>(cloudSessionsQuery);

  useEffect(() => {
    if (cloudSessions && cloudSessions.length > 0) {
      setSessions(prev => {
        const localMap = new Map(prev.map(s => [s.id, s]));
        cloudSessions.forEach(cs => {
          const local = localMap.get(cs.id);
          if (!local || cs.lastUpdated > local.lastUpdated) {
            localMap.set(cs.id, cs);
          }
        });
        return Array.from(localMap.values()).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.lastUpdated - a.lastUpdated;
        });
      });
    }
  }, [cloudSessions]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || null, 
  [sessions, activeSessionId]);

  useEffect(() => {
    if (activeSession?.persona) {
      setActivePersona(activeSession.persona);
      const persona = PERSONAS.find(p => p.id === activeSession.persona);
      if (persona) setConfig(prev => ({ ...prev, systemPrompt: persona.prompt }));
    }
  }, [activeSessionId]);

  // --- 4. Scroll Restoration Matrix ---
  useEffect(() => {
    if (isProcessing && scrollRef.current) {
      const timeout = setTimeout(() => {
        scrollRef.current?.scrollBy({
          top: 150,
          behavior: 'smooth'
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isProcessing]);

  useEffect(() => {
    if (activeSessionId && scrollRef.current) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'instant'
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeSessionId]);

  // --- 5. Actions ---

  const createNewSession = (initialPrompt?: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newSession: Session = {
      id: newId,
      title: initialPrompt ? initialPrompt.substring(0, 30) : 'New Discussion',
      lastUpdated: Date.now(),
      messages: [],
      persona: activePersona
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setIsSidebarOpen(false); 
    return newId;
  };

  const saveToCloud = (sessionId: string, session: Session) => {
    if (!db || !user) return;
    const docRef = doc(db, 'ai_history', user.uid, 'sessions', sessionId);
    
    setDoc(docRef, {
      ...session,
      uid: user.uid,
      lastUpdated: Date.now()
    }, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: session,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      toast({ title: "Signal Interrupted", description: "Linguistic synthesis halted." });
    }
  };

  const handleSend = async (e?: React.FormEvent, retryText?: string, isRegenerate = false) => {
    e?.preventDefault();
    const textToProcess = retryText || input.trim();
    if (!textToProcess || isProcessing) return;

    let targetId = activeSessionId;
    if (!targetId || (activeSession && activeSession.messages.length === 0 && !retryText)) {
      if (!targetId) targetId = createNewSession(textToProcess);
      else targetId = activeSessionId;
    }

    let updatedMessages: ChatMessage[];
    
    if (isRegenerate) {
      updatedMessages = activeSession?.messages || [];
    } else {
      const userMsg: ChatMessage = { role: 'user', content: textToProcess };
      const sessionToUpdate = sessions.find(s => s.id === targetId);
      updatedMessages = [...(sessionToUpdate?.messages || []), userMsg];
      
      setSessions(prev => prev.map(s => s.id === targetId ? {
        ...s,
        messages: updatedMessages,
        lastUpdated: Date.now(),
        title: s.title === 'New Discussion' ? textToProcess.substring(0, 30) : s.title
      } : s));
    }

    setInput('');
    setIsProcessing(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/ai-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ 
          messages: updatedMessages, 
          config: {
            ...config,
            customApi: config.node === 'custom' ? customApi : undefined
          } 
        })
      });

      const result = await response.json();

      if (response.ok && result.success && result.text) {
        const aiMsg: ChatMessage = { role: 'assistant', content: result.text };
        setSessions(prev => prev.map(s => {
          if (s.id === targetId) {
            const next = { ...s, messages: [...s.messages, aiMsg], lastUpdated: Date.now() };
            saveToCloud(s.id, next);
            return next;
          }
          return s;
        }));
      } else {
        toast({ 
          variant: "destructive", 
          title: "Protocol Failure", 
          description: result.message || "Uplink restricted by server node." 
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      toast({ 
        variant: "destructive", 
        title: "Network Error", 
        description: "Failed to establish binary link with server." 
      });
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    if (!activeSession || isProcessing) return;

    let lastUserIdx = -1;
    for (let i = activeSession.messages.length - 1; i >= 0; i--) {
      if (activeSession.messages[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }

    if (lastUserIdx === -1) return;

    const userContent = activeSession.messages[lastUserIdx].content;
    const truncatedMessages = activeSession.messages.slice(0, lastUserIdx + 1);

    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s,
      messages: truncatedMessages,
      lastUpdated: Date.now()
    } : s));

    await handleSend(undefined, userContent, true);
  };

  const deleteSession = async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const next = sessions.find(s => s.id !== id);
      setActiveSessionId(next?.id || null);
    }
    
    if (db && user) {
      const docRef = doc(db, 'ai_history', user.uid, 'sessions', id);
      deleteDoc(docRef).catch(() => {});
    }
    setSessionToDelete(null);
    setIsSidebarOpen(false); 
    toast({ title: "Session Purged" });
  };

  const togglePin = (id: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const next = { ...s, isPinned: !s.isPinned };
        saveToCloud(id, next);
        return next;
      }
      return s;
    }));
  };

  const renameSession = (id: string) => {
    if (!renameValue.trim()) { setIsRenaming(null); return; }
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: renameValue.trim(), lastUpdated: Date.now() } : s));
    const session = sessions.find(s => s.id === id);
    if (session) saveToCloud(id, { ...session, title: renameValue.trim() });
    setIsRenaming(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Content Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Chatbot Response',
          text: text,
        });
      } catch (err) {
        handleCopy(text, 'share-fail');
      }
    } else {
      handleCopy(text, 'share-manual');
    }
  };

  const downloadHistory = () => {
    if (!activeSession) return;
    const content = activeSession.messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${activeSession.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConnectCustom = () => {
    if (!customApi.apiKey) {
      toast({ variant: "destructive", title: "Key Required", description: "Personal API key is required to initialize node." });
      return;
    }
    localStorage.setItem(CUSTOM_API_KEY, JSON.stringify(customApi));
    setIsCustomConnected(true);
    setConfig(prev => ({ ...prev, node: 'custom' }));
    toast({ title: "Node Integrated", description: "Personal node calibrated and active." });
  };

  const handleDisconnectCustom = () => {
    localStorage.removeItem(CUSTOM_API_KEY);
    setCustomApi({ providerName: '', apiUrl: '', apiKey: '', modelName: '', customHeader: '' });
    setIsCustomConnected(false);
    setConfig(prev => ({ ...prev, node: 'auto' }));
    toast({ title: "Node Decoupled" });
  };

  const filteredSidebarSessions = useMemo(() => {
    return sessions.filter(s => s.title.toLowerCase().includes(sidebarSearch.toLowerCase()));
  }, [sessions, sidebarSearch]);

  const renderContent = (content: string, role: string) => {
    if (role !== 'assistant') {
      return <p className="text-sm sm:text-[15px] font-medium leading-relaxed whitespace-pre-wrap break-words">{content}</p>;
    }
    try {
      const html = DOMPurify.sanitize(marked.parse(content) as string);
      return <div className="text-sm sm:text-[15px] font-medium leading-relaxed markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (e) {
      return <p className="text-sm sm:text-[15px] font-medium leading-relaxed whitespace-pre-wrap break-words">{content}</p>;
    }
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#060608] selection:bg-primary/20 relative">
      
      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "absolute inset-y-0 left-0 flex flex-col bg-[#0a0a0c] border-r border-white/5 transition-all duration-500 z-50 overflow-hidden shadow-2xl",
        isSidebarOpen ? "translate-x-0 w-80" : "-translate-x-full w-80"
      )}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20">
           <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-primary/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Threads</span>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={() => createNewSession()} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-foreground/20 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="p-4 border-b border-white/5 bg-black/10">
           <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
              <Input 
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
                placeholder="Search history..."
                className="h-10 pl-9 bg-background/50 border-white/5 rounded-xl text-[9px] font-black uppercase"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
           {filteredSidebarSessions.length === 0 ? (
             <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
                <MessageSquare className="w-10 h-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Sessions Found</p>
             </div>
           ) : (
             filteredSidebarSessions.map(s => (
               <div key={s.id} className="group relative">
                  {isRenaming === s.id ? (
                    <div className="flex items-center gap-2 p-2">
                       <Input 
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => renameSession(s.id)}
                        onKeyDown={e => e.key === 'Enter' && renameSession(s.id)}
                        className="h-10 bg-background border-primary/40 text-[11px] uppercase font-bold"
                       />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveSessionId(s.id); setIsSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all border border-transparent",
                        activeSessionId === s.id ? "bg-primary/10 border-primary/20 text-primary shadow-inner" : "text-foreground/40 hover:bg-white/5"
                      )}
                    >
                       <div className="relative">
                          <MessageSquare className="w-4 h-4 shrink-0 opacity-40" />
                          {s.isPinned && <Pin className="absolute -top-1 -right-1 w-2 h-2 text-primary fill-current" />}
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold truncate uppercase tracking-tight">{s.title}</p>
                          <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mt-0.5">{new Date(s.lastUpdated).toLocaleDateString()}</p>
                       </div>
                    </button>
                  )}
                  
                  {isRenaming !== s.id && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-secondary/80 backdrop-blur-md p-1 rounded-lg">
                       <button onClick={() => togglePin(s.id)} className={cn("p-1.5 transition-all", s.isPinned ? "text-primary" : "text-foreground/20 hover:text-primary")}>
                          {s.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                       </button>
                       <button onClick={() => { setIsRenaming(s.id); setRenameValue(s.title); }} className="p-1.5 text-foreground/20 hover:text-primary"><Edit3 className="w-3.5 h-3.5" /></button>
                       <button onClick={() => setSessionToDelete(s.id)} className="p-1.5 text-foreground/20 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
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
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black px-2">v7.3 PRO</Badge>
           </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
         {/* Top Monitor Bar */}
         <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-30">
            <div className="flex items-center gap-6">
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={cn("p-2 rounded-xl transition-all", isSidebarOpen ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-primary")}>
                  <Menu className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/60 truncate max-w-[200px]">{activeSession?.title || 'Studio Monitor'}</h2>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex bg-white/5 rounded-2xl p-1 border border-white/5">
                  {PERSONAS.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setActivePersona(p.id);
                        setConfig(prev => ({ ...prev, systemPrompt: p.prompt }));
                        if (activeSessionId) setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, persona: p.id } : s));
                      }}
                      className={cn(
                        "p-2.5 rounded-xl transition-all",
                        activePersona === p.id ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"
                      )}
                      title={p.label}
                    >
                       <p.icon className="w-4 h-4" />
                    </button>
                  ))}
               </div>

               <button onClick={() => setIsConfigOpen(!isConfigOpen)} className={cn("p-2.5 rounded-xl transition-all", isConfigOpen ? "text-primary bg-primary/10" : "text-white/20 hover:text-white")}>
                  <Settings2 className="w-5 h-5" />
               </button>
            </div>
         </header>

         {/* Message Viewport */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-12 bg-black/20" ref={scrollRef}>
            {!activeSession?.messages.length ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-10 grayscale">
                 <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary animate-pulse" />
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-xl font-headline font-black uppercase tracking-[0.4em]">Awaiting Signal</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Identify your request to initialize</p>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full pb-20">
                 {activeSession.messages.map((msg, i) => {
                   const isLastAssistant = msg.role === 'assistant' && i === activeSession.messages.length - 1;
                   return (
                   <div 
                    key={i} 
                    className={cn(
                     "flex gap-4 group/msg animate-in slide-in-from-bottom-3 duration-500",
                     msg.role === 'assistant' ? "mr-auto" : "ml-auto flex-row-reverse"
                   )}>
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg border transition-all duration-500",
                        msg.role === 'assistant' ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-foreground/40"
                      )}>
                         {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className={cn("space-y-2 min-w-0 flex-1 max-w-[88%]", msg.role === 'user' ? "text-right" : "text-left")}>
                         <div className={cn(
                           "px-4 py-3 rounded-[1.25rem] shadow-xl relative group/card transition-all",
                           msg.role === 'assistant' ? "bg-white/[0.03] border border-white/5 rounded-tl-none" : "bg-primary text-white rounded-tr-none shadow-primary/15"
                         )}>
                            {renderContent(msg.content, msg.role)}
                            <div className={cn(
                               "absolute flex gap-1 opacity-0 group-hover/card:opacity-100 transition-all",
                               msg.role === 'assistant' ? "right-3 bottom-2" : "left-3 bottom-2"
                            )}>
                               <button onClick={() => handleCopy(msg.content, `msg-${i}`)} className="p-1.5 rounded-lg bg-black/60 text-white/40 hover:text-white shadow-xl">
                                  {isCopied === `msg-${i}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                               </button>
                            </div>
                         </div>

                         {/* Action Row Under Bubble */}
                         <div className={cn("flex items-center gap-3 px-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                            {msg.role === 'assistant' ? (
                               <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleCopy(msg.content, `ai-copy-${i}`)} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                                     {isCopied === `ai-copy-${i}` ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                                     {isCopied === `ai-copy-${i}` ? 'Copied' : 'Copy'}
                                  </button>
                                  <button onClick={() => handleShare(msg.content)} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                                     <Share2 className="w-2.5 h-2.5" /> Share
                                  </button>
                                  {isLastAssistant && !isProcessing && (
                                     <button onClick={handleRegenerate} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                                        <RefreshCcw className="w-2.5 h-2.5" /> Regenerate
                                     </button>
                                  )}
                               </div>
                            ) : (
                               <span className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">You</span>
                            )}
                            {msg.role === 'user' && i === activeSession.messages.length - 1 && (
                               <button onClick={() => { setInput(msg.content); handleSend(undefined, msg.content); }} className="text-[8px] font-black uppercase text-primary/40 hover:text-primary transition-all">Retry Signal</button>
                            )}
                         </div>
                      </div>
                   </div>
                 )})}
                 {isProcessing && (
                    <div className="flex gap-4 mr-auto animate-in fade-in duration-500">
                       <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Loader2 className="w-4 h-4 animate-spin" />
                       </div>
                       <div className="bg-white/5 p-4 rounded-[1.25rem] rounded-tl-none border border-white/5 flex gap-1.5 items-center shadow-xl">
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
           <Card className="absolute top-4 right-6 w-80 glass-card border-primary/20 bg-[#0d0d0f]/95 shadow-3xl z-50 animate-in zoom-in-95 duration-300 flex flex-col max-h-[calc(100%-32px)]">
              <CardHeader className="py-4 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Synthesis Engine</span>
                 </div>
                 <button onClick={() => setIsConfigOpen(false)} className="text-white/20 hover:text-white"><X className="w-4 h-4" /></button>
              </CardHeader>
              <CardContent className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-foreground/40">Node Access</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {(['auto', 'groq', 'openrouter', 'custom'] as const).map(n => (
                          <button
                            key={n}
                            onClick={() => setConfig({...config, node: n})}
                            className={cn(
                              "h-10 rounded-xl border text-[8px] font-black uppercase transition-all",
                              config.node === n ? "bg-primary text-white border-primary" : "bg-secondary/50 border-white/5 text-white/40 hover:text-white"
                            )}
                          >
                             {n === 'openrouter' ? 'OR' : n}
                          </button>
                       ))}
                    </div>
                 </div>

                 {config.node === 'custom' && (
                    <div className="space-y-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 animate-in slide-in-from-top-2">
                       <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Custom API</Label>
                          {isCustomConnected ? (
                             <Badge className="bg-emerald-500/10 text-emerald-500 text-[7px] border-emerald-500/20">LINKED</Badge>
                          ) : (
                             <Badge className="bg-white/5 text-white/40 text-[7px]">STANDBY</Badge>
                          )}
                       </div>
                       <div className="space-y-3">
                          <div className="space-y-1.5">
                             <Label className="text-[8px] font-black uppercase text-foreground/20">Provider Name</Label>
                             <Input 
                               value={customApi.providerName} 
                               onChange={e => setCustomApi({...customApi, providerName: e.target.value})} 
                               placeholder="e.g. My Llama Node" 
                               className="h-8 bg-black/40 border-white/5 text-[9px] font-bold"
                             />
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[8px] font-black uppercase text-foreground/20">API Key</Label>
                             <div className="relative">
                                <KeyRound className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/10" />
                                <Input 
                                  type="password"
                                  value={customApi.apiKey} 
                                  onChange={e => setCustomApi({...customApi, apiKey: e.target.value})} 
                                  placeholder="sk-..." 
                                  className="h-8 pl-7 bg-black/40 border-white/5 text-[9px] font-mono"
                                />
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[8px] font-black uppercase text-foreground/20">Endpoint URL (Optional)</Label>
                             <div className="relative">
                                <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/10" />
                                <Input 
                                  value={customApi.apiUrl} 
                                  onChange={e => setCustomApi({...customApi, apiUrl: e.target.value})} 
                                  placeholder="Auto-detected from key" 
                                  className="h-8 pl-7 bg-black/40 border-white/5 text-[9px] font-mono"
                                />
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[8px] font-black uppercase text-foreground/20">Model ID (Optional)</Label>
                             <Input 
                               value={customApi.modelName} 
                               onChange={e => setCustomApi({...customApi, modelName: e.target.value})} 
                               placeholder="Auto-detected from key" 
                               className="h-8 bg-black/40 border-white/5 text-[9px] font-bold"
                             />
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                             <Button onClick={handleConnectCustom} className="h-9 flex-1 bg-primary text-white text-[8px] font-black uppercase rounded-lg">Connect</Button>
                             {isCustomConnected && (
                                <Button variant="outline" onClick={handleDisconnectCustom} className="h-9 w-9 p-0 border-red-500/20 text-red-500 hover:bg-red-500/10"><Unplug className="w-4 h-4" /></Button>
                             )}
                          </div>
                       </div>
                    </div>
                 )}

                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-foreground/40">Model Identity</Label>
                    <Select value={config.model} onValueChange={v => setConfig({...config, model: v})}>
                       <SelectTrigger className="h-10 bg-secondary/50 border-border text-[9px] font-bold">
                          <SelectValue placeholder="Select Model" />
                       </SelectTrigger>
                       <SelectContent className="glass-card">
                          <SelectItem value="llama-3.1-8b-instant" className="text-[9px] uppercase font-bold">Llama 3.1 (Instant)</SelectItem>
                          <SelectItem value="llama-3.3-70b-versatile" className="text-[9px] uppercase font-bold">Llama 3.3 (High Perf)</SelectItem>
                          <SelectItem value="gemma2-9b-it" className="text-[9px] uppercase font-bold">Gemma 2 (Fast)</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                       <Label>Temperature (Creativity)</Label>
                       <span className="text-primary font-mono">{config.temperature}</span>
                    </div>
                    <Slider value={[config.temperature! * 100]} min={0} max={100} step={1} onValueChange={v => setConfig({...config, temperature: v[0]/100})} />
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-foreground/40">System Matrix</Label>
                    <Textarea 
                      value={config.systemPrompt} 
                      onChange={e => setConfig({...config, systemPrompt: e.target.value})} 
                      placeholder="Define the AI persona..."
                      className="h-24 bg-black/40 border-border text-[10px] leading-relaxed resize-none p-4"
                    />
                 </div>

                 <div className="pt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={downloadHistory} disabled={!activeSession?.messages.length} className="h-9 text-[8px] font-black uppercase rounded-xl border-white/5 bg-white/5">
                       <FileDown className="w-3.5 h-3.5 mr-1.5" /> Export .TXT
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(activeSession?.messages.map(m => m.content).join('\n') || '', 'all')} disabled={!activeSession?.messages.length} className="h-9 text-[8px] font-black uppercase rounded-xl border-white/5 bg-white/5">
                       <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy All
                    </Button>
                 </div>

                 <button onClick={() => { setConfig(INITIAL_CONFIG); setActivePersona('helper'); }} className="w-full h-8 text-[8px] font-black uppercase text-foreground/20 hover:text-primary transition-colors border-t border-white/5 pt-2">Restore Factory Defaults</button>
              </CardContent>
           </Card>
         )}

         {/* Input Matrix */}
         <div className="p-4 sm:p-5 border-t border-white/5 bg-[#0a0a0c] shrink-0">
            <div className="max-w-4xl mx-auto w-full relative group/input">
               {/* Quick Templates */}
               <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1 px-1">
                  {[
                    { label: 'Explain', text: 'Explain this concept simply: ' },
                    { label: 'Fix Code', text: 'Fix this code and explain why: ' },
                    { label: 'Rewrite', text: 'Rewrite this professionally: ' },
                    { label: 'Translate', text: 'Translate this to Urdu: ' }
                  ].map(t => (
                    <button 
                      key={t.label}
                      onClick={() => setInput(t.text)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[8px] font-black uppercase text-white/30 hover:text-primary hover:border-primary/20 transition-all whitespace-nowrap"
                    >
                       {t.label}
                    </button>
                  ))}
               </div>

               <form onSubmit={handleSend} className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-20 pointer-events-none group-focus-within/input:opacity-100 transition-opacity">
                     <ImageIcon className="w-4 h-4 text-foreground/40" />
                  </div>
                  <Textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        // Enter = New Line
                      } else if (e.key === 'Enter' && e.shiftKey) {
                        // Shift+Enter = Send
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter to send)"
                    className="min-h-[44px] max-h-40 w-full pl-12 pr-14 bg-white/[0.02] border-white/10 rounded-2xl text-sm font-medium py-2.5 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-inner custom-scrollbar"
                  />
                  <div className="absolute right-1.5 bottom-1.5">
                     {isProcessing ? (
                        <Button 
                          type="button"
                          onClick={handleStop}
                          className="h-8 w-8 rounded-xl bg-destructive text-white shadow-xl shadow-destructive/30 active:scale-95 transition-all p-0"
                        >
                           <Square className="w-3.5 h-3.5 fill-current" />
                        </Button>
                     ) : (
                        <Button 
                          type="submit" 
                          disabled={!input.trim()}
                          className="h-8 w-8 rounded-xl bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all group/btn p-0"
                        >
                           <Send className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Button>
                     )}
                  </div>
               </form>
               
               <div className="mt-3 flex items-center justify-between px-4">
                  <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.4em] text-foreground/20">
                     <span className="flex items-center gap-1.5"><Globe className="w-2.5 h-2.5" /> Node: {config.node === 'custom' ? (customApi.providerName || 'CUSTOM') : config.node?.toUpperCase()}</span>
                     <span>•</span>
                     <span>Memory: {activeSession?.messages.length || 0} Blocks</span>
                  </div>
                  {isProcessing && <span className="text-[8px] font-bold text-primary animate-pulse uppercase tracking-widest">Processing...</span>}
               </div>
            </div>
         </div>
      </main>

      {/* MODALS */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <AlertCircle className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Delete Thread</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
               This will definitively purge the linguistic registry for this specific discussion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={() => sessionToDelete && deleteSession(sessionToDelete)} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl">Purge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .markdown-content h1 { @apply text-lg font-bold mb-2 text-foreground; }
        .markdown-content h2 { @apply text-base font-bold mb-2 text-foreground; }
        .markdown-content h3 { @apply text-sm font-bold mb-1 text-foreground; }
        .markdown-content p { @apply mb-3 last:mb-0; }
        .markdown-content ul, .markdown-content ol { @apply mb-3 pl-4 list-outside; }
        .markdown-content ul { @apply list-disc; }
        .markdown-content ol { @apply list-decimal; }
        .markdown-content li { @apply mb-1; }
        .markdown-content code { @apply bg-black/40 px-1.5 py-0.5 rounded text-primary font-mono text-[13px] border border-white/5; }
        .markdown-content pre { @apply bg-black/60 p-4 rounded-xl mb-3 overflow-x-auto border border-white/5; }
        .markdown-content pre code { @apply bg-transparent p-0 border-none; }
        .markdown-content blockquote { @apply border-l-2 border-primary/40 pl-4 italic text-foreground/60 mb-3; }
        .markdown-content a { @apply text-primary hover:underline; }
      `}</style>
    </div>
  );
}
