"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Settings2, 
  Send, 
  ImageIcon, 
  MoreVertical, 
  ArrowLeft, 
  UserPlus, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  User,
  X,
  Check,
  Zap,
  LogOut,
  Smile,
  Trash2,
  Lock,
  Eye,
  Camera,
  MoreHorizontal,
  ChevronRight,
  Archive,
  Star,
  Pin,
  Circle,
  Edit3,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useUser, useFirestore, useCollection, useStorage } from '@/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// --- Types ---
interface ChatUser {
  uid: string;
  username: string;
  username_lowercase: string;
  displayName: string;
  photoURL?: string;
  about?: string;
  isOnline: boolean;
  lastSeen: any;
}

interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: any;
  status: 'sent' | 'seen';
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
  };
  unreadCount?: Record<string, number>;
  peer?: ChatUser; 
}

interface FriendRequest {
  id: string;
  from: string;
  fromName: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: any;
}

export default function ChatAppPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const storage = useStorage();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  
  // App State
  const [profile, setProfile] = useState<ChatUser | null>(null);
  const [setupUsername, setSetupUsername] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // UI State
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Identity Matrix ---
  useEffect(() => {
    if (!db || !user) return;
    const userRef = doc(db, 'chat_users', user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as ChatUser);
        // Set online status immediately
        updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() }).catch(() => {});
      }
    });

    // Cleanup: Mark offline
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && user) {
        updateDoc(doc(db!, 'chat_users', user.uid), { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {});
      } else if (user) {
        updateDoc(doc(db!, 'chat_users', user.uid), { isOnline: true, lastSeen: serverTimestamp() }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (user) updateDoc(doc(db!, 'chat_users', user.uid), { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {});
      unsub();
    };
  }, [db, user]);

  const handleSetupProfile = async () => {
    if (!db || !user || !setupUsername.trim()) return;
    setIsSettingUp(true);
    const cleanUsername = setupUsername.trim().toLowerCase();

    try {
      const q = query(collection(db, 'chat_users'), where('username_lowercase', '==', cleanUsername));
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast({ variant: "destructive", title: "Username Taken", description: "Choose a different identifier." });
        setIsSettingUp(false);
        return;
      }

      const payload: ChatUser = {
        uid: user.uid,
        username: setupUsername.trim(),
        username_lowercase: cleanUsername,
        displayName: user.displayName || setupUsername.trim(),
        photoURL: `https://picsum.photos/seed/${user.uid}/200/200`,
        about: "Available",
        isOnline: true,
        lastSeen: serverTimestamp()
      };

      await setDoc(doc(db, 'chat_users', user.uid), payload);
      toast({ title: "Welcome to Chat Studio" });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed" });
    } finally {
      setIsSettingUp(false);
    }
  };

  // --- 2. Data Streams ---
  const chatsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
  }, [db, user]);

  const { data: rawChats, loading: chatsLoading } = useCollection<Chat>(chatsQuery);
  const [chatPeers, setChatPeers] = useState<Record<string, ChatUser>>({});

  useEffect(() => {
    if (!db || !rawChats || !user) return;
    rawChats.forEach(chat => {
      const peerId = chat.participants.find(id => id !== user.uid);
      if (peerId && !chatPeers[peerId]) {
        getDoc(doc(db, 'chat_users', peerId)).then(snap => {
          if (snap.exists()) {
            setChatPeers(prev => ({ ...prev, [peerId]: snap.data() as ChatUser }));
          }
        });
      }
    });
  }, [db, rawChats, user]);

  const chats = useMemo(() => {
    if (!rawChats) return [];
    return rawChats.map(c => ({
      ...c,
      peer: chatPeers[c.participants.find(id => id !== user?.uid) || '']
    })).sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.toMillis?.() || 0;
      const timeB = b.lastMessage?.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });
  }, [rawChats, chatPeers, user]);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  const messagesQuery = useMemo(() => {
    if (!db || !activeChatId) return null;
    return query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'), limit(100));
  }, [db, activeChatId]);
  
  const { data: messages } = useCollection<Message>(messagesQuery);

  const requestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'friend_requests'), where('to', '==', user.uid), where('status', '==', 'pending'));
  }, [db, user]);
  const { data: requests } = useCollection<FriendRequest>(requestsQuery);

  // --- 3. Interaction Protocols ---
  const sendMessage = async (text?: string, imageUrl?: string) => {
    if (!db || !user || !activeChatId || (!text?.trim() && !imageUrl)) return;
    
    const chatRef = doc(db, 'chats', activeChatId);
    const msgPayload = {
      senderId: user.uid,
      text: text?.trim() || null,
      imageUrl: imageUrl || null,
      timestamp: serverTimestamp(),
      status: 'sent'
    };

    try {
      await addDoc(collection(chatRef, 'messages'), msgPayload);
      await updateDoc(chatRef, {
        lastMessage: {
          text: text?.trim() || 'Image',
          senderId: user.uid,
          timestamp: serverTimestamp()
        }
      });
      setMessageInput('');
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      toast({ variant: "destructive", title: "Transmission Failed" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;
    toast({ title: "Uploading visual..." });
    try {
      const sRef = ref(storage, `chat-images/${activeChatId}/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      await sendMessage(undefined, url);
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed" });
    }
  };

  const searchUsers = async () => {
    if (!db || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'chat_users'), 
        where('username_lowercase', '>=', searchQuery.toLowerCase()), 
        where('username_lowercase', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(5)
      );
      const snap = await getDocs(q);
      setUserSearchResults(snap.docs.map(d => d.data() as ChatUser).filter(u => u.uid !== user?.uid));
    } catch (e) {
      toast({ variant: "destructive", title: "Search Error" });
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (target: ChatUser) => {
    if (!db || !user || !profile) return;
    try {
      await addDoc(collection(db, 'friend_requests'), {
        from: user.uid,
        fromName: profile.username,
        to: target.uid,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      toast({ title: "Request Sent", description: `Waiting for ${target.username} to accept.` });
      setShowAddFriend(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Blocked" });
    }
  };

  const acceptRequest = async (req: FriendRequest) => {
    if (!db || !user) return;
    try {
      const chatId = user.uid < req.from ? `${user.uid}_${req.from}` : `${req.from}_${user.uid}`;
      await setDoc(doc(db, 'chats', chatId), {
        id: chatId,
        participants: [user.uid, req.from],
        timestamp: serverTimestamp(),
        lastMessage: { text: "Connection established.", senderId: 'system', timestamp: serverTimestamp() }
      });
      await deleteDoc(doc(db, 'friend_requests', req.id));
      toast({ title: "Matrix Linked" });
    } catch (e) {
      toast({ variant: "destructive", title: "Handshake Failed" });
    }
  };

  const clearChat = async () => {
    if (!db || !activeChatId) return;
    const q = await getDocs(collection(db, 'chats', activeChatId, 'messages'));
    const batch = writeBatch(db);
    q.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    toast({ title: "Stream Purged" });
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- 4. Render Logic ---
  if (authLoading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0c]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0c] p-6">
        <Card className="glass-card border-white/5 shadow-2xl p-12 text-center flex flex-col items-center gap-10 rounded-[3rem] max-w-lg w-full">
           <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
              <Lock className="w-8 h-8" />
           </div>
           <div className="space-y-3">
              <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">Identity Required</h2>
              <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em] leading-relaxed">Login to initialize your chat matrix</p>
           </div>
           <Button asChild className="h-16 w-full bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
              <Link href="/login?redirect=/chat">Launch Identity Portal</Link>
           </Button>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0c] p-6">
        <Card className="glass-card border-white/5 shadow-2xl p-10 space-y-10 rounded-[2.5rem] max-w-md w-full">
           <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20 shadow-inner">
                 <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Profile Forge</h2>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">Establish your studio handle</p>
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Username Identifier</Label>
                 <Input 
                   value={setupUsername}
                   onChange={e => setSetupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                   placeholder="e.g. matrix_node"
                   className="h-14 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-center text-lg focus:ring-primary/20"
                 />
              </div>
              <Button onClick={handleSetupProfile} disabled={isSettingUp || !setupUsername.trim()} className="w-full h-16 bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30">
                 {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-3" />}
                 Activate Identity
              </Button>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-[#060608] flex overflow-hidden z-50">
      
      {/* SIDEBAR: NAVIGATION & CONTACTS */}
      <aside className={cn(
        "w-full lg:w-[420px] border-r border-white/5 flex flex-col bg-[#0d0d0f] transition-all duration-500 z-30",
        activeChatId && "max-lg:hidden"
      )}>
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40">
           <div className="flex items-center gap-4">
              <div className="relative group/avatar cursor-pointer" onClick={() => setShowSettings(true)}>
                 <img src={profile.photoURL} className="w-11 h-11 rounded-2xl object-cover border border-white/10 shadow-lg group-hover/avatar:border-primary/40 transition-all" alt="" />
                 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0d0d0f]" />
              </div>
              <div className="min-w-0">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest truncate">{profile.username}</h2>
                 <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Identity Matrix Active</p>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <Button onClick={() => setShowAddFriend(true)} variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-primary hover:bg-primary/10 rounded-xl"><UserPlus className="w-5 h-5" /></Button>
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl"><MoreVertical className="w-5 h-5" /></Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="glass-card border-white/10 w-48">
                    <DropdownMenuItem onClick={() => setShowSettings(true)} className="text-[9px] font-black uppercase cursor-pointer"><Settings2 className="w-3.5 h-3.5 mr-2" /> Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-[9px] font-black uppercase cursor-pointer"><Archive className="w-3.5 h-3.5 mr-2" /> Archived</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => router.push('/account')} className="text-[9px] font-black uppercase cursor-pointer text-red-500"><LogOut className="w-3.5 h-3.5 mr-2" /> Exit Studio</DropdownMenuItem>
                 </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </header>

        {/* Requests Scroll */}
        {requests && requests.length > 0 && (
          <div className="bg-primary/5 border-b border-primary/10 p-4 space-y-3 animate-in slide-in-from-top-2">
             <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 ml-1">
                <Activity className="w-3 h-3" /> {requests.length} INBOUND REQUESTS
             </p>
             <div className="flex flex-col gap-2">
                {requests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary/40"><User className="w-4 h-4" /></div>
                        <span className="text-[10px] font-bold text-white uppercase truncate max-w-[120px]">{req.fromName}</span>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => acceptRequest(req)} className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"><Check className="w-4 h-4" /></button>
                        <button onClick={() => deleteDoc(doc(db!, 'friend_requests', req.id))} className="w-8 h-8 rounded-lg bg-white/5 text-white/40 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Local Search */}
        <div className="p-4 border-b border-white/5 bg-black/20">
           <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/search:text-primary transition-colors" />
              <input 
                placeholder="Search Conversation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-white/5 border border-white/5 rounded-2xl pl-12 text-[11px] font-bold uppercase text-white outline-none focus:border-primary/40 transition-all shadow-inner"
              />
           </div>
        </div>

        {/* Chat List Matrix */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10 p-2 space-y-1">
           {chatsLoading ? (
             <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20 mx-auto" /></div>
           ) : chats.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 grayscale">
                <MessageSquare className="w-16 h-16" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Active Stream</p>
             </div>
           ) : chats.map(chat => (
             <button 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "w-full p-4 rounded-[2rem] flex items-center gap-4 transition-all group relative",
                  activeChatId === chat.id ? "bg-primary/10 border border-primary/20 shadow-inner" : "hover:bg-white/5 border border-transparent"
                )}
             >
                <div className="relative shrink-0">
                   <img src={chat.peer?.photoURL || `https://picsum.photos/seed/${chat.id}/100/100`} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-md transition-transform group-hover:scale-105" alt="" />
                   {chat.peer?.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-[#0d0d0f] shadow-lg" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                   <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[13px] font-black text-white uppercase tracking-tight truncate">{chat.peer?.username || 'Node_Syncing...'}</h4>
                      <span className="text-[8px] font-bold text-foreground/20 uppercase whitespace-nowrap">{chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}</span>
                   </div>
                   <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] font-medium text-foreground/40 truncate uppercase tracking-tighter flex-1">
                        {chat.lastMessage?.senderId === user.uid && <Check className="w-3 h-3 inline mr-1 text-primary" />}
                        {chat.lastMessage?.text || 'Identity Established'}
                      </p>
                      {chat.unreadCount?.[user.uid] ? (
                        <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-in zoom-in">{chat.unreadCount[user.uid]}</div>
                      ) : null}
                   </div>
                </div>
             </button>
           ))}
        </div>
      </aside>

      {/* MAIN CONVERSATION: CHAT WINDOW */}
      <main className="flex-1 flex flex-col relative bg-[#060608] overflow-hidden">
         {activeChat ? (
           <>
             {/* Dynamic Header */}
             <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-6 shrink-0 relative z-10">
                <div className="flex items-center gap-4 min-w-0">
                   <button onClick={() => setActiveChatId(null)} className="lg:hidden p-2 text-white/40 hover:text-white transition-all"><ArrowLeft className="w-5 h-5" /></button>
                   <div className="relative shrink-0">
                      <img src={activeChat.peer?.photoURL} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-xl" alt="" />
                      {activeChat.peer?.isOnline && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#060608] shadow-lg" />}
                   </div>
                   <div className="min-w-0">
                      <h2 className="text-base font-black text-white uppercase tracking-tight leading-none truncate">{activeChat.peer?.username}</h2>
                      <div className="flex items-center gap-2 mt-1.5">
                         <div className={cn("w-1.5 h-1.5 rounded-full", activeChat.peer?.isOnline ? "bg-green-500 animate-pulse" : "bg-white/10")} />
                         <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                           {activeChat.peer?.isOnline ? 'Online Now' : activeChat.peer?.lastSeen ? `Last Signal: ${formatTime(activeChat.peer.lastSeen)}` : 'Node Offline'}
                         </p>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-3">
                   <div className="hidden sm:flex items-center gap-4 mr-4">
                      <button className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:text-primary transition-all"><Phone className="w-4 h-4" /></button>
                      <button className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:text-primary transition-all"><Video className="w-4 h-4" /></button>
                   </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl"><MoreHorizontal className="w-5 h-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10">
                         <DropdownMenuItem onClick={clearChat} className="text-[9px] font-black uppercase text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5 mr-2" /> Clear Matrix</DropdownMenuItem>
                         <DropdownMenuItem className="text-[9px] font-black uppercase cursor-pointer"><Info className="w-3.5 h-3.5 mr-2" /> User Profile</DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
             </header>

             {/* Message Stream Matrix */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-checkered bg-fixed dark:bg-black/40">
                {messages?.map((msg, i) => {
                  const isMe = msg.senderId === user.uid;
                  const showUsername = i === 0 || messages[i-1].username !== msg.username;
                  
                  return (
                    <div key={msg.id} className={cn("flex flex-col gap-1 max-w-[85%] sm:max-w-[70%] animate-in slide-in-from-bottom-2", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                       <div className={cn(
                         "p-4 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] relative group/msg transition-all border",
                         isMe ? "bg-primary text-white rounded-tr-none border-primary/20" : "bg-secondary text-foreground rounded-tl-none border-white/5"
                       )}>
                          {msg.imageUrl ? (
                             <img src={msg.imageUrl} className="max-h-[350px] w-auto rounded-2xl shadow-2xl border border-white/10 mb-2" alt="" />
                          ) : (
                            <p className="text-[14px] sm:text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )}
                          <div className={cn("flex items-center gap-2 mt-2", isMe ? "justify-end text-white/40" : "justify-start text-foreground/20")}>
                             <span className="text-[8px] font-black uppercase tracking-widest">{formatTime(msg.timestamp)}</span>
                             {isMe && <Check className="w-3 h-3" />}
                          </div>
                          {isMe && (
                             <button onClick={() => deleteDoc(doc(db!, 'chats', activeChatId, 'messages', msg.id))} className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-white/0 group-hover/msg:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
                       </div>
                    </div>
                  );
                })}
             </div>

             {/* Production Composer */}
             <footer className="p-4 sm:p-8 bg-[#0a0a0c]/80 backdrop-blur-xl border-t border-white/5 shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-3 relative">
                   <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-primary transition-all border border-white/5 shadow-inner group shrink-0 mb-1"
                   >
                      <ImageIcon className="w-5 h-5 group-hover:scale-110" />
                   </button>
                   <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                   
                   <div className="flex-1 relative">
                      <Textarea 
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(messageInput); } }}
                        placeholder="Draft secure signal..."
                        className="min-h-[56px] max-h-[150px] bg-secondary/60 border-white/10 rounded-[1.5rem] text-[15px] font-medium px-6 py-4 focus:ring-primary/40 text-white custom-scrollbar resize-none"
                      />
                   </div>

                   <Button 
                    onClick={() => sendMessage(messageInput)}
                    disabled={!messageInput.trim()} 
                    className="h-14 w-14 rounded-full bg-primary text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-90 transition-all shrink-0 mb-1"
                   >
                      <Send className="w-6 h-6 icon-3d" />
                   </Button>
                </div>
             </footer>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center gap-12 opacity-10 grayscale">
              <div className="w-40 h-40 rounded-[4rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                 <MessageSquare className="w-20 h-20" />
              </div>
              <div className="text-center space-y-3">
                 <h3 className="text-3xl font-headline font-black uppercase tracking-[0.6em]">Node Standby</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">Secure communication matrix initialized. Select a linked identity to begin decryption.</p>
              </div>
           </div>
         )}
      </main>

      {/* --- MODALS --- */}

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
         <DialogContent className="glass-card border-white/20 p-0 overflow-hidden max-w-lg rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30">
               <DialogTitle className="text-2xl font-headline font-black uppercase tracking-tight text-white">Expand Registry</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-2">Search global identity handles</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-8">
               <div className="flex gap-2">
                  <Input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ENTER USERNAME..."
                    className="h-14 bg-secondary/50 border-border rounded-2xl font-black uppercase text-center text-primary tracking-widest focus:ring-primary/40"
                  />
                  <Button onClick={searchUsers} disabled={isSearching} className="h-14 w-14 rounded-2xl bg-primary text-white shrink-0 shadow-lg">
                     {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </Button>
               </div>

               <div className="space-y-2 max-h-[350px] overflow-auto custom-scrollbar pr-2">
                  {userSearchResults.length === 0 && !isSearching && searchQuery.length > 2 && (
                    <div className="py-20 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-widest">No matching identity discovered</p></div>
                  )}
                  {userSearchResults.map(u => (
                    <div key={u.uid} className="p-4 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-4 min-w-0">
                          <img src={u.photoURL} className="w-11 h-11 rounded-xl object-cover shadow-lg border border-white/10" alt="" />
                          <div className="min-w-0">
                             <p className="text-[11px] font-black text-white uppercase truncate">{u.username}</p>
                             <p className="text-[9px] font-medium text-foreground/30 truncate">{u.about}</p>
                          </div>
                       </div>
                       <Button onClick={() => sendFriendRequest(u)} size="sm" variant="ghost" className="h-10 px-5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                          <UserPlus className="w-3.5 h-3.5 mr-2" /> Link
                       </Button>
                    </div>
                  ))}
               </div>
            </div>
         </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
         <DialogContent className="glass-card border-white/20 p-0 overflow-hidden max-w-lg rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30">
               <DialogTitle className="text-2xl font-headline font-black uppercase tracking-tight text-white">Studio Settings</DialogTitle>
            </DialogHeader>
            <div className="p-8 space-y-10">
               <div className="flex flex-col items-center gap-6">
                  <div className="relative group/photo">
                     <img src={profile.photoURL} className="w-28 h-28 rounded-[2rem] object-cover border-4 border-white/10 shadow-2xl" alt="" />
                     <button className="absolute inset-0 bg-black/60 rounded-[2rem] opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white"><Camera className="w-6 h-6" /></button>
                  </div>
                  <div className="text-center space-y-1">
                     <h3 className="text-xl font-bold text-white uppercase">{profile.username}</h3>
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{user.email}</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">About Protocol</Label>
                     <Input 
                      value={profile.about} 
                      onChange={e => updateDoc(doc(db!, 'chat_users', user.uid), { about: e.target.value })} 
                      className="h-12 bg-secondary/50 border-border rounded-xl text-xs font-medium"
                     />
                  </div>
               </div>

               <div className="pt-6 border-t border-white/5 space-y-3">
                  <Button asChild variant="outline" className="w-full h-12 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all">
                     <Link href="/account"><Edit3 className="w-4 h-4 mr-2" /> Full Account Settings</Link>
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      {/* Leave Confirmation */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] p-8 max-w-sm">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
               <LogOut className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-headline font-black text-foreground uppercase tracking-tight text-center">Terminate Session</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-foreground/40 uppercase tracking-widest leading-relaxed text-center">
               Are you sure you want to decouple from the chat matrix? This will mark you as offline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase m-0">Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/')} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl">Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-checkered {
          background-image: radial-gradient(circle at center, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
}
