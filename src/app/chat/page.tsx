"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  PinOff,
  Circle,
  Edit3,
  Phone,
  Video,
  Info,
  Mic,
  Reply,
  VolumeX,
  Volume2,
  Ban,
  UserMinus,
  Bell,
  BellOff,
  UserCheck,
  History,
  CornerDownLeft,
  ChevronLeft,
  Copy,
  Maximize2,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser, useFirestore, useCollection, useStorage, useAuth } from '@/firebase';
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
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
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
  blockedUsers?: string[];
  archivedChats?: string[];
}

interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  voiceUrl?: string;
  timestamp: any;
  status: 'sent' | 'seen';
  replyTo?: { id: string, text: string, sender: string };
  deletedFor?: string[];
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
  pinnedBy?: string[];
  mutedBy?: string[];
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

const COMMON_EMOJIS = ['❤️', '😂', '🔥', '👍', '😊', '🙌', '✨', '🚀', '✅', '🙏', '💯', '🤔', '👀', '🎉', '💡', '📍'];

export default function ChatAppPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const storage = useStorage();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  
  // App Identity State
  const [profile, setProfile] = useState<ChatUser | null>(null);
  const [setupUsername, setSetupUsername] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  
  // Navigation State
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'friends' | 'requests'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // Interaction State
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchInChat, setSearchInChat] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  
  // Modals
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- 1. Identity & Presence Logic ---
  useEffect(() => {
    if (!db || !user) return;
    const userRef = doc(db, 'chat_users', user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as ChatUser);
        updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() }).catch(() => {});
      }
    });

    const handleVisibility = () => {
      if (!user || !db) return;
      const isOnline = document.visibilityState === 'visible';
      updateDoc(doc(db, 'chat_users', user.uid), { isOnline, lastSeen: serverTimestamp() }).catch(() => {});
    };

    window.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      if (user && db) updateDoc(doc(db, 'chat_users', user.uid), { isOnline: false, lastSeen: serverTimestamp() }).catch(() => {});
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
        toast({ variant: "destructive", title: "Identity Conflict", description: "Username is already occupied in the matrix." });
        setIsSettingUp(false);
        return;
      }

      const payload: ChatUser = {
        uid: user.uid,
        username: setupUsername.trim(),
        username_lowercase: cleanUsername,
        displayName: user.displayName || setupUsername.trim(),
        photoURL: `https://picsum.photos/seed/${user.uid}/300/300`,
        about: "Identity active in My Kit Tool.",
        isOnline: true,
        lastSeen: serverTimestamp(),
        blockedUsers: [],
        archivedChats: []
      };

      await setDoc(doc(db, 'chat_users', user.uid), payload);
      toast({ title: "Signal Established", description: "Your chat identity is now live." });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Error" });
    } finally {
      setIsSettingUp(false);
    }
  };

  // --- 2. Data Stream Matrix ---
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
          if (snap.exists()) setChatPeers(prev => ({ ...prev, [peerId]: snap.data() as ChatUser }));
        });
      }
    });
  }, [db, rawChats, user, chatPeers]);

  const chats = useMemo(() => {
    if (!rawChats || !user) return [];
    return rawChats
      .filter(c => !profile?.archivedChats?.includes(c.id))
      .map(c => ({
        ...c,
        peer: chatPeers[c.participants.find(id => id !== user.uid) || '']
      }))
      .sort((a, b) => {
        const aPinned = a.pinnedBy?.includes(user.uid);
        const bPinned = b.pinnedBy?.includes(user.uid);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return (b.lastMessage?.timestamp?.toMillis?.() || 0) - (a.lastMessage?.timestamp?.toMillis?.() || 0);
      });
  }, [rawChats, chatPeers, user, profile?.archivedChats]);

  const unreadCount = useMemo(() => {
    if (!chats || !user) return 0;
    return chats.reduce((acc, chat) => acc + (chat.unreadCount?.[user.uid] || 0), 0);
  }, [chats, user]);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  const messagesQuery = useMemo(() => {
    if (!db || !activeChatId) return null;
    return query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'), limit(200));
  }, [db, activeChatId]);
  
  const { data: rawMessages } = useCollection<Message>(messagesQuery);
  const messages = useMemo(() => {
    if (!rawMessages || !user) return [];
    return rawMessages.filter(m => !m.deletedFor?.includes(user.uid));
  }, [rawMessages, user]);

  const requestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'friend_requests'), where('to', '==', user.uid), where('status', '==', 'pending'));
  }, [db, user]);
  const { data: incomingRequests } = useCollection<FriendRequest>(requestsQuery);

  // --- 3. Communication Protocols ---
  const handleSendMessage = async (payload: { text?: string, imageUrl?: string, voiceUrl?: string }) => {
    if (!db || !user || !activeChatId) return;
    
    const chatRef = doc(db, 'chats', activeChatId);
    const msgPayload = {
      senderId: user.uid,
      timestamp: serverTimestamp(),
      status: 'sent',
      deletedFor: [],
      ...payload,
      ...(replyingTo && { replyTo: { id: replyingTo.id, text: replyingTo.text || 'Image', sender: replyingTo.senderId === user.uid ? 'You' : (activeChat?.peer?.username || 'Peer') } })
    };

    try {
      await addDoc(collection(chatRef, 'messages'), msgPayload);
      const peerId = activeChat?.participants.find(p => p !== user.uid);
      await updateDoc(chatRef, {
        lastMessage: {
          text: payload.text || (payload.imageUrl ? 'Image' : 'Voice Message'),
          senderId: user.uid,
          timestamp: serverTimestamp()
        },
        ...(peerId && { [`unreadCount.${peerId}`]: increment(1) })
      });
      setMessageInput('');
      setReplyingTo(null);
      setIsEmojiOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Signal Lost", description: "Message could not be transmitted." });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !activeChatId) return;
    setIsUploading(true);
    toast({ title: "Transmitting Visual..." });
    try {
      const sRef = ref(storage, `chat-media/${activeChatId}/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      await handleSendMessage({ imageUrl: url });
    } catch (err) {
      toast({ variant: "destructive", title: "Identity Sync Failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return; 
        
        setIsUploading(true);
        const sRef = ref(storage!, `chat-media/${activeChatId}/${Date.now()}_voice.webm`);
        await uploadBytes(sRef, audioBlob);
        const url = await getDownloadURL(sRef);
        await handleSendMessage({ voiceUrl: url });
        setIsUploading(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      toast({ variant: "destructive", title: "Acoustic Block", description: "Check hardware mic permissions." });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: `${label} Copied` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  // --- 4. Matrix Management ---
  const handlePinChat = (id: string, isPinned: boolean) => {
    if (!db || !user) return;
    updateDoc(doc(db, 'chats', id), {
      pinnedBy: isPinned ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const handleArchiveChat = (id: string) => {
    if (!db || !user) return;
    updateDoc(doc(db, 'chat_users', user.uid), {
      archivedChats: arrayUnion(id)
    });
    setActiveChatId(null);
    toast({ title: "Matrix Archived" });
  };

  const handleDeleteMessageForMe = (msgId: string) => {
    if (!db || !user || !activeChatId) return;
    updateDoc(doc(db, 'chats', activeChatId, 'messages', msgId), {
      deletedFor: arrayUnion(user.uid)
    });
  };

  const handleBlockUser = (peerId: string) => {
    if (!db || !user) return;
    updateDoc(doc(db, 'chat_users', user.uid), {
      blockedUsers: arrayUnion(peerId)
    });
    toast({ title: "Node Restricted", description: "Identity blocked from transmission." });
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
      toast({ title: "Handshake Initiated", description: `Request sent to ${target.username}.` });
      setShowAddFriend(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Uplink Blocked" });
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
        lastMessage: { text: "Encryption active. Node linked.", senderId: 'system', timestamp: serverTimestamp() },
        unreadCount: { [user.uid]: 0, [req.from]: 0 },
        pinnedBy: [],
        mutedBy: []
      });
      await deleteDoc(doc(db, 'friend_requests', req.id));
      toast({ title: "Matrix Synced" });
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Mismatch" });
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
      toast({ title: "Logged Out" });
    }
  };

  // --- 5. Render Pipeline ---
  if (authLoading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0c]"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0c] p-6">
        <Card className="glass-card border-white/5 shadow-2xl p-12 text-center flex flex-col items-center gap-10 rounded-[3rem] max-w-lg w-full">
           <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
              <Lock className="w-8 h-8 icon-3d" />
           </div>
           <div className="space-y-3">
              <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">Identity Required</h2>
              <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em] leading-relaxed">Sign in to initialize secure communications.</p>
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
              <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Identity Forge</h2>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">Establish your studio identifier</p>
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Username Identifier</Label>
                 <Input 
                   value={setupUsername}
                   onChange={e => setSetupUsername(e.target.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                   placeholder="e.g. matrix_node_1"
                   className="h-14 bg-secondary/50 border-border rounded-2xl font-bold uppercase text-center text-lg focus:ring-primary/20"
                 />
              </div>
              <Button onClick={handleSetupProfile} disabled={isSettingUp || !setupUsername.trim()} className="w-full h-16 bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30">
                 {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 mr-3" />}
                 Activate Node
              </Button>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-[#060608] flex overflow-hidden z-50">
      
      {/* SIDEBAR: NAVIGATION & CHAT REGISTRY */}
      <aside className={cn(
        "w-full lg:w-[440px] border-r border-white/5 flex flex-col bg-[#0d0d0f] transition-all duration-500 z-30",
        activeChatId && "max-lg:hidden"
      )}>
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40">
           <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowSettings(true)}>
              <div className="relative">
                 <img src={profile.photoURL} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg group-hover:border-primary/40 transition-all" alt="" />
                 <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-[#0d0d0f]" />
              </div>
              <div className="min-w-0">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest truncate">{profile.username}</h2>
                 <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Protocol Active</p>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <Button onClick={() => setShowAddFriend(true)} variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-primary hover:bg-primary/10 rounded-xl"><UserPlus className="w-5 h-5" /></Button>
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl"><MoreVertical className="w-5 h-5" /></Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="glass-card border-white/10 w-52">
                    <DropdownMenuItem onClick={() => setShowSettings(true)} className="text-[9px] font-black uppercase cursor-pointer"><Settings2 className="w-3.5 h-3.5 mr-2" /> Identity Config</DropdownMenuItem>
                    <DropdownMenuItem className="text-[9px] font-black uppercase cursor-pointer"><Archive className="w-3.5 h-3.5 mr-2" /> Archival Matrix</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => setShowLeaveConfirm(true)} className="text-[9px] font-black uppercase cursor-pointer text-red-500"><LogOut className="w-3.5 h-3.5 mr-2" /> De-activate Node</DropdownMenuItem>
                 </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </header>

        {/* Dynamic Navigation Tabs */}
        <div className="grid grid-cols-3 h-12 border-b border-white/5 bg-black/40 shrink-0">
           {[
             { id: 'chats', label: 'CHATS', icon: MessageSquare, badge: unreadCount },
             { id: 'friends', label: 'PEERS', icon: User, badge: 0 },
             { id: 'requests', label: 'UPLINKS', icon: Zap, badge: incomingRequests?.length || 0 }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setSidebarTab(tab.id as any)}
               className={cn(
                 "flex flex-col items-center justify-center gap-1 transition-all relative",
                 sidebarTab === tab.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-foreground/20 hover:text-foreground/40"
               )}
             >
                <tab.icon className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                {tab.badge > 0 && (
                   <div className="absolute top-1.5 right-4 w-4 h-4 rounded-full bg-primary text-white text-[7px] font-black flex items-center justify-center animate-in zoom-in">{tab.badge}</div>
                )}
             </button>
           ))}
        </div>

        {/* Global Search Bar */}
        <div className="p-4 bg-black/20 shrink-0">
           <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/search:text-primary transition-colors" />
              <input 
                placeholder={`Search ${sidebarTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-white/5 border border-white/5 rounded-2xl pl-12 text-[10px] font-bold uppercase text-white outline-none focus:border-primary/40 transition-all shadow-inner"
              />
           </div>
        </div>

        {/* Sidebar Content Matrix */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
           {sidebarTab === 'chats' && (
             <>
               {chatsLoading ? (
                 <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20 mx-auto" /></div>
               ) : chats.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 grayscale">
                    <MessageSquare className="w-16 h-16" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Active Streams</p>
                 </div>
               ) : chats.map(chat => (
                 <button 
                    key={chat.id}
                    onClick={() => { setActiveChatId(chat.id); if (chat.unreadCount?.[user.uid]) updateDoc(doc(db!, 'chats', chat.id), { [`unreadCount.${user.uid}`]: 0 }); }}
                    className={cn(
                      "w-full p-4 rounded-[2rem] flex items-center gap-4 transition-all group relative",
                      activeChatId === chat.id ? "bg-primary/10 border border-primary/20 shadow-inner" : "hover:bg-white/5 border border-transparent"
                    )}
                 >
                    <div className="relative shrink-0">
                       <img src={chat.peer?.photoURL} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-md transition-transform group-hover:scale-105" alt="" />
                       {chat.peer?.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-[#0d0d0f] shadow-lg" />}
                       {chat.pinnedBy?.includes(user.uid) && <div className="absolute -top-1 -left-1 w-5 h-5 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg"><Pin className="w-3 h-3 fill-current" /></div>}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                       <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[13px] font-black text-white uppercase tracking-tight truncate">{chat.peer?.username || 'Node_Syncing...'}</h4>
                          <span className="text-[8px] font-bold text-foreground/20 uppercase whitespace-nowrap">{chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}</span>
                       </div>
                       <div className="flex items-center justify-between gap-4">
                          <p className="text-[11px] font-medium text-foreground/40 truncate uppercase tracking-tighter flex-1">
                            {chat.lastMessage?.senderId === user.uid && <Check className="w-3 h-3 inline mr-1 text-primary" />}
                            {chat.lastMessage?.text || 'Identity Link Active'}
                          </p>
                          {chat.unreadCount?.[user.uid] ? (
                            <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-in zoom-in">{chat.unreadCount[user.uid]}</div>
                          ) : null}
                       </div>
                    </div>
                 </button>
               ))}
             </>
           )}

           {sidebarTab === 'friends' && (
             <div className="space-y-4 p-4">
                <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest px-2">Verified Peer Network</p>
                <div className="grid grid-cols-1 gap-2">
                   {chats.map(chat => (
                     <div key={chat.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4 min-w-0">
                           <img src={chat.peer?.photoURL} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                           <div className="min-w-0">
                              <p className="text-[11px] font-bold text-white truncate uppercase">{chat.peer?.username}</p>
                              <p className="text-[9px] text-foreground/30 truncate uppercase">{chat.peer?.about}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setActiveChatId(chat.id)} className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><MessageSquare className="w-4 h-4" /></button>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <button className="w-9 h-9 rounded-xl bg-white/5 text-white/20 flex items-center justify-center hover:bg-white/10 transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="glass-card">
                                 <DropdownMenuItem onClick={() => handleBlockUser(chat.peer!.uid)} className="text-[9px] font-black uppercase text-red-500 cursor-pointer"><Ban className="w-3.5 h-3.5 mr-2" /> Block Peer</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {sidebarTab === 'requests' && (
              <div className="p-4 space-y-6">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 px-2">
                       <Zap className="w-3.5 h-3.5" /> Inbound Uplinks ({incomingRequests?.length || 0})
                    </p>
                    {incomingRequests && incomingRequests.length > 0 ? incomingRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-4 rounded-3xl bg-black/40 border border-white/5 shadow-inner animate-in slide-in-from-top-2">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary/40"><User className="w-5 h-5" /></div>
                            <span className="text-[11px] font-bold text-white uppercase truncate">{req.fromName}</span>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => acceptRequest(req)} className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"><Check className="w-5 h-5" /></button>
                            <button onClick={() => deleteDoc(doc(db!, 'friend_requests', req.id))} className="w-10 h-10 rounded-xl bg-white/5 text-white/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                         </div>
                      </div>
                    )) : (
                       <div className="py-20 text-center opacity-10">
                          <Activity className="w-10 h-10 mx-auto" />
                          <p className="text-[9px] font-black uppercase tracking-widest mt-2">Zero Inbound Signals</p>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      </aside>

      {/* MAIN CONVERSATION: CHAT VIEWPORT */}
      <main className="flex-1 flex flex-col relative bg-[#060608] overflow-hidden">
         {activeChat ? (
           <>
             {/* Dynamic Stream Header */}
             <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-6 shrink-0 relative z-10">
                <div className="flex items-center gap-4 min-w-0">
                   <button onClick={() => setActiveChatId(null)} className="lg:hidden p-2 text-white/40 hover:text-white transition-all"><ChevronLeft className="w-6 h-6" /></button>
                   <div className="relative shrink-0">
                      <img src={activeChat.peer?.photoURL} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-xl" alt="" />
                      {activeChat.peer?.isOnline && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#060608] shadow-lg" />}
                   </div>
                   <div className="min-w-0">
                      <h2 className="text-base font-black text-white uppercase tracking-tight leading-none truncate">{activeChat.peer?.username}</h2>
                      <div className="flex items-center gap-2 mt-1.5">
                         <div className={cn("w-1.5 h-1.5 rounded-full", activeChat.peer?.isOnline ? "bg-green-500 animate-pulse" : "bg-white/10")} />
                         <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest truncate">
                           {activeChat.peer?.isOnline ? 'Network Linked' : activeChat.peer?.lastSeen ? `Last Signal: ${formatTime(activeChat.peer.lastSeen)}` : 'Node Offline'}
                         </p>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="hidden sm:flex items-center gap-2 mr-2">
                      <div className="relative group/search">
                         <input 
                          placeholder="Search in chat..."
                          value={searchInChat}
                          onChange={e => setSearchInChat(e.target.value)}
                          className="w-48 h-10 bg-white/5 border border-white/5 rounded-xl px-4 text-[9px] font-black uppercase text-white outline-none focus:border-primary/40 transition-all"
                         />
                         <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/10" />
                      </div>
                   </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl"><MoreHorizontal className="w-5 h-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10 w-52">
                         <DropdownMenuItem onClick={() => handlePinChat(activeChat.id, activeChat.pinnedBy?.includes(user.uid) || false)} className="text-[9px] font-black uppercase cursor-pointer">
                            <Pin className="w-3.5 h-3.5 mr-2" /> {activeChat.pinnedBy?.includes(user.uid) ? 'Unpin Matrix' : 'Pin to Top'}
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleArchiveChat(activeChat.id)} className="text-[9px] font-black uppercase cursor-pointer">
                            <Archive className="w-3.5 h-3.5 mr-2" /> Archive Node
                         </DropdownMenuItem>
                         <DropdownMenuSeparator className="bg-white/5" />
                         <DropdownMenuItem onClick={async () => {
                           const q = await getDocs(collection(db!, 'chats', activeChatId, 'messages'));
                           const batch = writeBatch(db!);
                           q.docs.forEach(d => batch.delete(d.ref));
                           await batch.commit();
                           toast({ title: "Stream Purged" });
                         }} className="text-[9px] font-black uppercase text-red-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear All Signals
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
             </header>

             {/* Linguistic Stream Window */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-checkered bg-fixed dark:bg-black/40">
                {messages?.filter(m => !searchInChat || m.text?.toLowerCase().includes(searchInChat.toLowerCase())).map((msg) => {
                  const isMe = msg.senderId === user.uid;
                  return (
                    <div key={msg.id} className={cn("flex flex-col gap-1.5 max-w-[85%] sm:max-w-[70%] animate-in slide-in-from-bottom-2", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <div className={cn(
                               "p-4 rounded-3xl shadow-xl relative group/msg transition-all border cursor-pointer select-none",
                               isMe ? "bg-primary text-white rounded-tr-none border-primary/20" : "bg-secondary text-foreground rounded-tl-none border border-white/5"
                             )}>
                                {msg.replyTo && (
                                  <div className="mb-2 p-2 rounded-xl bg-black/20 border-l-4 border-white/40 text-[10px] opacity-70">
                                     <p className="font-black uppercase text-[8px] mb-1">{msg.replyTo.sender}</p>
                                     <p className="truncate line-clamp-1">{msg.replyTo.text}</p>
                                  </div>
                                )}
                                {msg.imageUrl && (
                                   <div className="relative group/image">
                                      <img src={msg.imageUrl} className="max-h-[350px] w-auto rounded-2xl shadow-lg border border-white/10" alt="" />
                                      <button onClick={() => window.open(msg.imageUrl, '_blank')} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity rounded-2xl"><Maximize2 className="w-8 h-8 text-white" /></button>
                                   </div>
                                )}
                                {msg.voiceUrl && (
                                   <div className="flex items-center gap-3 p-2 bg-black/10 rounded-2xl min-w-[220px]">
                                      <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"><Play className="w-4 h-4 fill-current" /></button>
                                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="w-[40%] h-full bg-white/40" /></div>
                                      <span className="text-[8px] font-bold text-white/40 uppercase">Voice</span>
                                   </div>
                                )}
                                {msg.text && <p className="text-[14px] sm:text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                                <div className={cn("flex items-center gap-2 mt-2", isMe ? "justify-end text-white/40" : "justify-start text-foreground/20")}>
                                   <span className="text-[8px] font-black uppercase tracking-widest">{formatTime(msg.timestamp)}</span>
                                   {isMe && (msg.status === 'seen' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Check className="w-3 h-3" />)}
                                </div>
                             </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isMe ? "end" : "start"} className="glass-card">
                             <DropdownMenuItem onClick={() => setReplyingTo(msg)} className="text-[9px] font-black uppercase"><Reply className="w-3 h-3 mr-2" /> Reply</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleCopyText(msg.text || '', 'message')} className="text-[9px] font-black uppercase"><Copy className="w-3 h-3 mr-2" /> Copy Text</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDeleteMessageForMe(msg.id)} className="text-[9px] font-black uppercase text-red-500"><Trash2 className="w-3 h-3 mr-2" /> Delete for Me</DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  );
                })}
             </div>

             {/* Composer Hub */}
             <footer className="p-4 sm:p-6 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 shrink-0 z-20">
                <div className="max-w-4xl mx-auto space-y-4">
                   {replyingTo && (
                     <div className="bg-primary/5 border border-primary/20 p-3 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 min-w-0">
                           <Reply className="w-4 h-4 text-primary" />
                           <div className="min-w-0">
                              <p className="text-[8px] font-black text-primary uppercase">Replying to {replyingTo.senderId === user.uid ? 'Self' : 'Peer'}</p>
                              <p className="text-[11px] font-medium text-foreground/60 truncate">{replyingTo.text || 'Visual Asset'}</p>
                           </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-1.5 text-foreground/20 hover:text-primary"><X className="w-4 h-4" /></button>
                     </div>
                   )}

                   {isEmojiOpen && (
                     <div className="p-4 bg-secondary/50 border border-white/5 rounded-[2rem] flex flex-wrap gap-2 animate-in zoom-in duration-300">
                        {COMMON_EMOJIS.map(e => (
                          <button key={e} onClick={() => { setMessageInput(prev => prev + e); setIsEmojiOpen(false); }} className="text-xl p-2 hover:bg-white/10 rounded-xl transition-all">{e}</button>
                        ))}
                     </div>
                   )}

                   <div className="flex items-end gap-3 relative">
                      <div className="flex gap-1.5 mb-1.5">
                         <button onClick={() => setIsEmojiOpen(!isEmojiOpen)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-primary transition-all"><Smile className="w-5 h-5" /></button>
                         <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-primary transition-all border border-white/5"><ImageIcon className="w-5 h-5" /></button>
                         <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </div>

                      <div className="flex-1 relative">
                         <Textarea 
                           value={messageInput}
                           onChange={e => setMessageInput(e.target.value)}
                           onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage({ text: messageInput }); } }}
                           placeholder="Draft encrypted signal..."
                           className="min-h-[50px] max-h-[120px] bg-secondary/60 border-white/10 rounded-[1.5rem] text-[15px] font-medium px-6 py-3.5 focus:ring-primary/40 text-white custom-scrollbar resize-none"
                         />
                      </div>

                      {messageInput.trim() || isUploading ? (
                         <Button 
                          onClick={() => handleSendMessage({ text: messageInput })}
                          disabled={!messageInput.trim() || isUploading} 
                          className="h-12 w-12 rounded-full bg-primary text-white shadow-xl shadow-primary/30 active:scale-90 transition-all shrink-0 mb-1"
                         >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                         </Button>
                      ) : (
                         <button 
                          onMouseDown={startVoiceRecording} 
                          onMouseUp={stopVoiceRecording}
                          onTouchStart={startVoiceRecording}
                          onTouchEnd={stopVoiceRecording}
                          className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center transition-all mb-1 shrink-0 shadow-lg",
                            isRecording ? "bg-red-500 text-white scale-125 animate-pulse" : "bg-secondary text-primary/40 hover:text-primary"
                          )}
                         >
                            <Mic className="w-5 h-5" />
                         </button>
                      )}
                   </div>
                </div>
             </footer>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center gap-12 opacity-10 grayscale p-10 text-center">
              <div className="w-40 h-40 rounded-[4rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                 <MessageSquare className="w-20 h-20" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-3xl font-headline font-black uppercase tracking-[0.6em]">Matrix Standby</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">Identity established. Select a verified node to initialize real-time synchronization.</p>
              </div>
           </div>
         )}
      </main>

      {/* --- STUDIO OVERLAYS --- */}

      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
         <DialogContent className="glass-card border-white/20 p-0 overflow-hidden max-w-lg rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30">
               <DialogTitle className="text-2xl font-headline font-black uppercase tracking-tight text-white">Linguistic Discovery</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-2">Search global handle registry</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-8">
               <div className="flex gap-2">
                  <Input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ENTER HANDLE..."
                    className="h-14 bg-secondary/50 border-border rounded-2xl font-black uppercase text-center text-primary tracking-widest focus:ring-primary/40"
                  />
                  <Button onClick={searchUsers} disabled={isSearching} className="h-14 w-14 rounded-2xl bg-primary text-white shrink-0 shadow-lg">
                     {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </Button>
               </div>
               <div className="space-y-2 max-h-[350px] overflow-auto custom-scrollbar pr-2">
                  {userSearchResults.map(u => (
                    <div key={u.uid} className="p-4 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-4 min-w-0">
                          <img src={u.photoURL} className="w-11 h-11 rounded-xl object-cover" alt="" />
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

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
         <DialogContent className="glass-card border-white/20 p-0 overflow-hidden max-w-lg rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-8 border-b border-white/5 bg-secondary/30">
               <DialogTitle className="text-2xl font-headline font-black uppercase tracking-tight text-white">Identity Editor</DialogTitle>
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
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase text-foreground/40 ml-1">About Protocol</Label>
                     <Input 
                      value={profile.about} 
                      onChange={e => updateDoc(doc(db!, 'chat_users', user.uid), { about: e.target.value.substring(0, 100) })} 
                      className="h-12 bg-secondary/50 border-border rounded-xl text-xs font-medium"
                     />
                  </div>
               </div>
               <div className="pt-6 border-t border-white/5">
                  <Button asChild variant="outline" className="w-full h-12 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary">
                     <Link href="/account"><Edit3 className="w-4 h-4 mr-2" /> Full Account Matrix</Link>
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={handleLogout} className="h-12 flex-1 rounded-xl bg-destructive text-white font-black uppercase text-[9px] shadow-xl">Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .bg-checkered {
          background-image: radial-gradient(circle at center, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
}
