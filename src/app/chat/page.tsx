
"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Settings, 
  Send, 
  ImageIcon, 
  MoreVertical, 
  ArrowLeft, 
  UserPlus, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Smartphone,
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
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
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
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// --- Types ---
interface ChatUser {
  uid: string;
  username: string;
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
  peer?: ChatUser; // Joined locally
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
  
  // App State
  const [profile, setProfile] = useState<ChatUser | null>(null);
  const [setupUsername, setSetupUsername] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- 1. Identity Handshake ---
  useEffect(() => {
    if (!db || !user) return;
    const userRef = doc(db, 'chat_users', user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as ChatUser);
        // Set online status
        updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() });
      }
    });
    return () => {
      if (user) updateDoc(doc(db, 'chat_users', user.uid), { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {});
      unsub();
    };
  }, [db, user]);

  const handleSetupProfile = async () => {
    if (!db || !user || !setupUsername.trim()) return;
    setIsSettingUp(true);
    const cleanUsername = setupUsername.trim().toLowerCase();

    try {
      // Uniqueness check
      const q = query(collection(db, 'chat_users'), where('username_lowercase', '==', cleanUsername));
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast({ variant: "destructive", title: "Username Taken", description: "Please choose a different identifier." });
        setIsSettingUp(false);
        return;
      }

      const payload = {
        uid: user.uid,
        username: setupUsername.trim(),
        username_lowercase: cleanUsername,
        displayName: user.displayName || setupUsername.trim(),
        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        about: "Using My Kit Tool Chat.",
        isOnline: true,
        lastSeen: serverTimestamp()
      };

      await setDoc(doc(db, 'chat_users', user.uid), payload);
      toast({ title: "Identity Forged", description: "Your chat profile is now active." });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Failed" });
    } finally {
      setIsSettingUp(false);
    }
  };

  // --- 2. Data Matrix ---
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
    })).sort((a, b) => (b.lastMessage?.timestamp?.toMillis?.() || 0) - (a.lastMessage?.timestamp?.toMillis?.() || 0));
  }, [rawChats, chatPeers, user]);

  // Requests
  const requestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'friend_requests'), where('to', '==', user.uid), where('status', '==', 'pending'));
  }, [db, user]);
  const { data: requests } = useCollection<FriendRequest>(requestsQuery);

  // --- 3. Chat Logic ---
  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  const messagesQuery = useMemo(() => {
    if (!db || !activeChatId) return null;
    return query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'), limit(50));
  }, [db, activeChatId]);
  
  const { data: messages } = useCollection<Message>(messagesQuery);

  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text?: string, imageUrl?: string) => {
    if (!db || !user || !activeChatId || (!text?.trim() && !imageUrl)) return;
    
    const msg = text?.trim();
    const chatRef = doc(db, 'chats', activeChatId);
    const msgsRef = collection(chatRef, 'messages');

    const payload = {
      senderId: user.uid,
      text: msg || null,
      imageUrl: imageUrl || null,
      timestamp: serverTimestamp(),
      status: 'sent'
    };

    try {
      await addDoc(msgsRef, payload);
      await updateDoc(chatRef, {
        lastMessage: {
          text: msg || 'Image',
          senderId: user.uid,
          timestamp: serverTimestamp()
        }
      });
      setMessageInput('');
    } catch (e) {
      toast({ variant: "destructive", title: "Transmission Failed" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    toast({ title: "Processing Image..." });
    try {
      const sRef = ref(storage, `chat-images/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      await sendMessage(undefined, url);
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed" });
    }
  };

  // --- 4. Search & Friends ---
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
      const res = snap.docs
        .map(d => d.data() as ChatUser)
        .filter(u => u.uid !== user?.uid);
      setUserSearchResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (target: ChatUser) => {
    if (!db || !user || !profile) return;
    
    try {
      const q = query(collection(db, 'friend_requests'), where('from', '==', user.uid), where('to', '==', target.uid));
      const existing = await getDocs(q);
      if (!existing.empty) {
        toast({ title: "Already Sent", description: "Request is pending verification." });
        return;
      }

      await addDoc(collection(db, 'friend_requests'), {
        from: user.uid,
        fromName: profile.username,
        to: target.uid,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      toast({ title: "Request Transmitted", description: `Signal sent to ${target.username}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Blocked" });
    }
  };

  const acceptRequest = async (req: FriendRequest) => {
    if (!db || !user) return;
    try {
      const chatId = user.uid < req.from ? `${user.uid}_${req.from}` : `${req.from}_${user.uid}`;
      
      // Create Chat Matrix
      await setDoc(doc(db, 'chats', chatId), {
        id: chatId,
        participants: [user.uid, req.from],
        timestamp: serverTimestamp()
      });

      // Update Request
      await updateDoc(doc(db, 'friend_requests', req.id), { status: 'accepted' });
      toast({ title: "Connection established" });
    } catch (e) {
      toast({ variant: "destructive", title: "Authorization Failed" });
    }
  };

  const clearChat = async () => {
    if (!db || !activeChatId) return;
    const q = await getDocs(collection(db, 'chats', activeChatId, 'messages'));
    const batch = writeBatch(db);
    q.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    toast({ title: "Matrix Cleared" });
  };

  // --- RENDERING ---

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Card className="glass-card border-border shadow-2xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden bg-black/10 rounded-[3rem]">
          <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl relative z-10">
             <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-4 relative z-10">
             <h2 className="text-3xl sm:text-5xl font-headline font-black text-foreground uppercase tracking-tight">Access Restricted</h2>
             <p className="text-[10px] sm:text-xs text-foreground/30 font-black uppercase tracking-[0.4em] leading-relaxed max-w-md mx-auto">
                Authentication required to join the real-time identity matrix.
             </p>
          </div>
          <Button asChild className="h-16 w-full max-w-md bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all z-10">
             <Link href="/login?redirect=/chat">Initialize Session</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg">
        <Card className="glass-card border-border shadow-2xl p-10 space-y-10 rounded-[2.5rem]">
           <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                 <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Identity Setup</h2>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">Initialize your chat handle</p>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Unique Username</Label>
                 <Input 
                   value={setupUsername}
                   onChange={e => setSetupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                   placeholder="e.g. matrix_node"
                   className="h-14 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-center text-lg focus:ring-primary/20"
                 />
              </div>
              <Button onClick={handleSetupProfile} disabled={isSettingUp || !setupUsername.trim()} className="w-full h-16 bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30">
                 {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-3" />}
                 Establish Identity
              </Button>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-[#0a0a0c] flex overflow-hidden z-[60]">
      
      {/* SIDEBAR: CHAT LIST */}
      <aside className={cn(
        "w-full lg:w-[400px] border-r border-white/5 flex flex-col bg-[#0d0d0f] transition-all duration-500 z-30",
        !isSidebarOpen && "max-lg:-translate-x-full absolute inset-y-0",
        activeChatId && "max-lg:hidden"
      )}>
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40">
           <div className="flex items-center gap-4">
              <div className="relative">
                 <img src={profile.photoURL} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                 <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0d0d0f]" />
              </div>
              <div className="min-w-0">
                 <h2 className="text-xs font-black text-white uppercase tracking-widest truncate">{profile.username}</h2>
                 <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Identity Hub</p>
              </div>
           </div>
           <div className="flex gap-2">
              <Button onClick={() => setShowAddFriend(true)} variant="ghost" size="icon" className="text-white/40 hover:text-primary"><Plus className="w-5 h-5" /></Button>
           </div>
        </header>

        <div className="p-4 border-b border-white/5">
           <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within/search:text-primary transition-colors" />
              <input 
                placeholder="Search Identity..."
                className="w-full h-10 bg-white/5 border border-white/5 rounded-xl pl-10 text-[10px] font-black uppercase text-white outline-none focus:border-primary/20"
              />
           </div>
        </div>

        {/* Requests Banner */}
        {requests && requests.length > 0 && (
           <div className="bg-primary/5 border-b border-primary/10 p-4 space-y-3">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-3 h-3" /> {requests.length} Inbound Requests
              </p>
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                   <span className="text-[10px] font-bold text-white uppercase truncate">{req.fromName}</span>
                   <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req)} className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center"><Check className="w-4 h-4" /></button>
                      <button onClick={() => deleteDoc(doc(db!, 'friend_requests', req.id))} className="w-8 h-8 rounded-lg bg-white/5 text-white/40 flex items-center justify-center"><X className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
           </div>
        )}

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 p-2 space-y-1">
           {chatsLoading ? (
             <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20 mx-auto" /></div>
           ) : chats.length === 0 ? (
             <div className="py-24 text-center opacity-10 space-y-4 grayscale">
                <MessageSquare className="w-16 h-16 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Active Matrix</p>
             </div>
           ) : chats.map(chat => (
             <button 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all group",
                  activeChatId === chat.id ? "bg-primary/10 border border-primary/20 shadow-inner" : "hover:bg-white/5 border border-transparent"
                )}
             >
                <div className="relative shrink-0">
                   <img src={chat.peer?.photoURL || `https://picsum.photos/seed/${chat.id}/100/100`} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" />
                   {chat.peer?.isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0d0d0f]" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                   <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest truncate">{chat.peer?.username || 'Syncing...'}</h4>
                      <span className="text-[8px] font-bold text-foreground/20 uppercase">{chat.lastMessage ? new Date(chat.lastMessage.timestamp?.toMillis?.()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                   </div>
                   <p className="text-[10px] font-medium text-foreground/40 truncate uppercase tracking-tighter">
                      {chat.lastMessage?.text || 'No signals yet'}
                   </p>
                </div>
             </button>
           ))}
        </div>
      </aside>

      {/* MAIN WINDOW: CHAT STREAM */}
      <main className="flex-1 flex flex-col relative bg-[#060608]">
         {activeChat ? (
           <>
             {/* Chat Header */}
             <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                   <button onClick={() => setActiveChatId(null)} className="lg:hidden p-2 text-white/40 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                   <div className="relative shrink-0">
                      <img src={activeChat.peer?.photoURL} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" />
                      {activeChat.peer?.isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0d0d0f]" />}
                   </div>
                   <div className="min-w-0">
                      <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none truncate">{activeChat.peer?.username}</h2>
                      <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em] mt-1">
                        {activeChat.peer?.isOnline ? 'Active Pulse' : activeChat.peer?.lastSeen ? `Last Signal: ${new Date(activeChat.peer.lastSeen.toMillis()).toLocaleTimeString()}` : 'Offline'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={clearChat} className="p-2 text-white/20 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                   <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <ShieldCheck className="w-3 h-3 text-primary" />
                      <span className="text-[7px] font-black text-primary uppercase">E2EE Stream</span>
                   </div>
                </div>
             </header>

             {/* Message Stream */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {messages?.map((msg) => {
                  const isMe = msg.senderId === user.uid;
                  return (
                    <div key={msg.id} className={cn("flex flex-col gap-1.5", isMe ? "items-end" : "items-start animate-in slide-in-from-left-2")}>
                       <div className={cn(
                         "max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl shadow-xl transition-all break-words overflow-wrap-anywhere relative group/msg",
                         isMe ? "bg-primary text-white rounded-tr-none shadow-primary/10" : "bg-secondary text-foreground rounded-tl-none border border-white/5"
                       )}>
                          {msg.imageUrl ? (
                             <img src={msg.imageUrl} className="max-h-[300px] w-auto rounded-xl shadow-lg border border-white/10" alt="" />
                          ) : (
                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          )}
                          <div className={cn("text-[8px] font-bold uppercase mt-2 flex items-center gap-2", isMe ? "text-white/40" : "text-foreground/20")}>
                             {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...'}
                             {isMe && <Check className="w-3 h-3" />}
                          </div>
                          {isMe && (
                             <button onClick={() => deleteDoc(doc(db!, 'chats', activeChatId, 'messages', msg.id))} className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-white/0 group-hover/msg:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                          )}
                       </div>
                    </div>
                  );
                })}
             </div>

             {/* Composer */}
             <footer className="p-4 sm:p-8 bg-[#0a0a0c] border-t border-white/5 shrink-0">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                   <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-primary transition-all border border-border group">
                      <ImageIcon className="w-5 h-5 group-hover:scale-110" />
                   </button>
                   <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                   
                   <form onSubmit={(e) => { e.preventDefault(); sendMessage(messageInput); }} className="flex-1 flex items-center gap-3">
                      <Input 
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value.substring(0, 500))}
                        placeholder="Draft secure signal..."
                        className="h-14 bg-secondary/60 border-border rounded-2xl text-sm font-medium px-6 focus:ring-primary/20"
                      />
                      <Button type="submit" disabled={!messageInput.trim()} size="icon" className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all shrink-0">
                        <Send className="w-5 h-5 icon-3d" />
                      </Button>
                   </form>
                </div>
             </footer>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center gap-10 opacity-10 grayscale">
              <div className="w-32 h-32 rounded-[3.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                 <MessageSquare className="w-16 h-16" />
              </div>
              <div className="text-center space-y-2">
                 <h3 className="text-2xl font-headline font-black uppercase tracking-[0.5em]">Identity Sync Standby</h3>
                 <p className="text-xs font-bold uppercase tracking-widest">Select a channel to initialize decryption</p>
              </div>
           </div>
         )}
      </main>

      {/* --- MODALS --- */}

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
         <DialogContent className="glass-card border-white/20 p-0 overflow-hidden max-w-lg rounded-[2.5rem]">
            <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30">
               <DialogTitle className="text-xl font-headline font-black uppercase tracking-tight">Expand Matrix</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Search global registry handles</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-6">
               <div className="flex gap-2">
                  <Input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter username..."
                    className="h-14 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-center"
                  />
                  <Button onClick={searchUsers} disabled={isSearching} className="h-14 w-14 rounded-2xl bg-primary text-white shrink-0">
                     {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </Button>
               </div>

               <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar">
                  {userSearchResults.map(u => (
                    <div key={u.uid} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <img src={u.photoURL} className="w-10 h-10 rounded-xl object-cover" alt="" />
                          <div>
                             <p className="text-[11px] font-black text-white uppercase truncate">{u.username}</p>
                             <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-tighter">{u.about}</p>
                          </div>
                       </div>
                       <Button onClick={() => sendFriendRequest(u)} size="sm" variant="ghost" className="h-10 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest">
                          <UserPlus className="w-3.5 h-3.5 mr-2" /> Request
                       </Button>
                    </div>
                  ))}
               </div>
            </div>
         </DialogContent>
      </Dialog>

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

