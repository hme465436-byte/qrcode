"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  X, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Trash2, 
  ArrowLeft, 
  User, 
  ShieldAlert, 
  Activity, 
  ShieldCheck, 
  Clock, 
  ImagePlus, 
  Menu 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db, storage } from '@/firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  deleteDoc, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Message {
  id: string;
  username: string;
  text?: string;
  imageUrl?: string;
  createdAt: any;
}

interface Member {
  id: string;
  username: string;
  lastSeen: any;
  isTyping?: boolean;
}

export default function ShadowChatRoom() {
  const { code } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  
  // Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isRoomActive, setIsRoomActive] = useState(true);
  const [creator, setCreator] = useState<string | null>(null);

  // Interaction State
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Initialization & Presence ---
  useEffect(() => {
    const stored = localStorage.getItem('shadow_chat_user');
    if (!stored) {
      router.replace('/shadow-chat');
      return;
    }
    setUsername(stored);

    const roomRef = doc(db!, 'rooms', code as string);
    const unsubRoom = onSnapshot(roomRef, (snap) => {
      if (!snap.exists() || !snap.data()?.active) {
        setIsRoomActive(false);
        toast({ variant: "destructive", title: "Room Dissolved", description: "This ephemeral node has been purged." });
        setTimeout(() => router.push('/shadow-chat'), 3000);
      } else {
        setCreator(snap.data()?.createdBy);
      }
    });

    const memberRef = doc(collection(roomRef, 'members'), stored);
    setDoc(memberRef, {
      username: stored,
      lastSeen: serverTimestamp(),
      isTyping: false
    }, { merge: true });

    const unsubMembers = onSnapshot(collection(roomRef, 'members'), (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Member)));
    });

    const msgsQuery = query(collection(roomRef, 'messages'), orderBy('createdAt', 'asc'), limit(100));
    const unsubMsgs = onSnapshot(msgsQuery, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });

    return () => {
      unsubRoom();
      unsubMembers();
      unsubMsgs();
      if (isRoomActive) deleteDoc(memberRef).catch(() => {});
    };
  }, [code, router, toast]);

  // --- 2. Message Logic ---
  const handleChatInputChange = (val: string) => {
    setInputText(val);
    const roomRef = doc(db!, 'rooms', code as string);
    const memberRef = doc(collection(roomRef, 'members'), username);
    updateDoc(memberRef, { isTyping: val.length > 0 });
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !isRoomActive) return;

    const msg = inputText.trim();
    setInputText('');
    handleChatInputChange('');

    try {
      await addDoc(collection(db!, 'rooms', code as string, 'messages'), {
        username,
        text: msg,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Transmission Failed" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isRoomActive) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage!, `shadow_chat/${code}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db!, 'rooms', code as string, 'messages'), {
        username,
        imageUrl: url,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const purgeRoom = async () => {
    if (creator !== username) return;
    setIsRoomActive(false);
    try {
      const roomRef = doc(db!, 'rooms', code as string);
      await updateDoc(roomRef, { active: false });
      
      const msgs = await getDocs(collection(roomRef, 'messages'));
      const mems = await getDocs(collection(roomRef, 'members'));
      
      await Promise.all([
        ...msgs.docs.map(d => deleteDoc(d.ref)),
        ...mems.docs.map(d => deleteDoc(d.ref)),
        deleteDoc(roomRef)
      ]);
      
      router.push('/shadow-chat');
    } catch (e) {}
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const typingUsers = useMemo(() => members.filter(m => m.isTyping && m.username !== username), [members, username]);

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 bg-[#0a0a0c] z-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      {/* 1. HEADER PROTOCOL */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 relative z-10">
         <div className="flex items-center gap-4">
            <Sheet>
               <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/40 hover:text-primary"><Menu className="w-5 h-5" /></Button>
               </SheetTrigger>
               <SheetContent side="left" className="glass-card border-white/10 bg-card/90 w-[280px] p-0 flex flex-col">
                  <SheetHeader className="p-6 border-b border-white/5 bg-secondary/20">
                     <SheetTitle className="text-xs font-black uppercase tracking-[0.4em] text-primary">Identity Pool</SheetTitle>
                     <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">{members.length} Nodes Online</p>
                  </SheetHeader>
                  <div className="flex-1 overflow-auto custom-scrollbar p-3 space-y-1">
                     {members.map(m => (
                       <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group/mem transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                             <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary/40 group-hover/mem:text-primary transition-colors shrink-0">
                                <User className="w-4 h-4" />
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-foreground truncate uppercase">{m.username}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                   <span className="text-[7px] font-black text-foreground/20 uppercase">Linked</span>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="p-6 border-t border-white/5 bg-black/40">
                     <Button variant="outline" onClick={() => router.push('/shadow-chat')} className="w-full h-11 text-[9px] font-black uppercase tracking-widest border-white/10 text-foreground/40 hover:text-destructive">
                        Leave Matrix
                     </Button>
                  </div>
               </SheetContent>
            </Sheet>
            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col">
               <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">{code}</h2>
               <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest mt-1">{members.length} Participants</p>
            </div>
         </div>

         <div className="flex items-center gap-3">
            {creator === username && (
              <Button variant="ghost" onClick={purgeRoom} className="h-10 px-4 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest transition-all">
                 <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge Room
              </Button>
            )}
            <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-primary" />
               <span className="text-[7px] font-black text-primary uppercase">Secure Tunnel</span>
            </div>
         </div>
      </header>

      {/* 2. MESSAGE MATRIX */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-[#060608]">
         <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {messages.length === 0 && !isProcessing && (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 grayscale">
                 <MessageSquare className="w-20 h-20 text-primary" />
                 <p className="text-[11px] font-black uppercase tracking-[0.5em]">Awaiting Linguistic Signal</p>
              </div>
            )}
            
            {messages.map((msg) => {
              const isMe = msg.username === username;
              return (
                <div key={msg.id} className={cn("flex flex-col gap-1.5", isMe ? "items-end" : "items-start animate-in slide-in-from-left-2")}>
                   <div className="flex items-center gap-3 px-1">
                      <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{msg.username}</span>
                   </div>
                   <div className={cn(
                     "max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl shadow-xl transition-all break-words overflow-wrap-anywhere",
                     isMe ? "bg-primary text-white rounded-tr-none shadow-primary/10" : "bg-secondary text-foreground rounded-tl-none border border-white/5"
                   )}>
                      {msg.imageUrl ? (
                        <div className="space-y-3">
                           <img src={msg.imageUrl} alt="Asset" className="max-h-[300px] w-auto rounded-2xl shadow-lg border border-white/10" />
                        </div>
                      ) : (
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      )}
                      <div className={cn("text-[8px] font-bold uppercase mt-2", isMe ? "text-white/40" : "text-foreground/20")}>
                         {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...'}
                      </div>
                   </div>
                </div>
              );
            })}
         </div>

         {/* Typing Matrix */}
         {typingUsers.length > 0 && (
            <div className="px-6 py-2 bg-black/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
               </div>
               <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest">
                  {typingUsers[0].username} {typingUsers.length > 1 ? `& ${typingUsers.length - 1} others` : ''} is typing...
               </span>
            </div>
         )}
      </main>

      {/* 3. COMPOSER HUB */}
      <footer className="p-4 sm:p-6 bg-[#0a0a0c] border-t border-white/5 shrink-0">
         <div className="max-w-4xl mx-auto flex items-center gap-3 relative">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !isRoomActive}
              className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-primary transition-all border border-border group"
            >
               {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5 group-hover:scale-110" />}
            </button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

            <form onSubmit={sendMessage} className="flex-1 flex items-center gap-3">
               <div className="flex-1 relative">
                 <Input 
                  value={inputText}
                  onChange={e => handleChatInputChange(e.target.value.substring(0, 500))}
                  placeholder="Draft encrypted signal..."
                  className="h-14 bg-secondary/60 border-border rounded-2xl text-sm font-medium px-6 pr-14 focus:ring-primary/20 relative z-10"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 z-0">
                    <Zap className="w-6 h-6" />
                 </div>
               </div>
               <Button type="submit" disabled={!inputText.trim() || !isRoomActive} size="icon" className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all">
                  <Send className="w-5 h-5" />
               </Button>
            </form>
         </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .overflow-wrap-anywhere { overflow-wrap: anywhere !important; word-break: break-word !important; }
      `}</style>
    </div>
  );
}
